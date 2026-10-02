import { createServer } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { z } from 'zod';
import { Store } from './store.js';
import { Skills } from './skills.js';
import { Browser } from './browser.js';
import { Computer } from './computer.js';
import { runAgent } from './agent.js';
import { defaultTasks, csv } from './evaluate.js';
import { fixture } from './fixtures.js';
import { profileSchema, loadProfiles, providerKeyVariable, requiresKey, requireReady } from './profiles.js';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const caps = z.object({ browser: z.boolean(), computer: z.boolean(), memory: z.boolean(), skills: z.boolean() });
const check = z.object({ type: z.enum(['response_contains', 'tool_called', 'skill_loaded', 'memory_contains', 'memory_not_contains', 'fixture', 'browser_url_contains']), value: z.string().min(1).max(1000) });
const taskSchema = z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100), name: z.string().min(1).max(100), category: z.string().max(40).default('custom'), prompt: z.string().min(1).max(16000), capabilities: caps, checks: z.array(check).max(30), seedMemory: z.array(z.string().max(4000)).max(30).default([]) });

export async function createApp({ dataDir = resolve(process.env.DATA_DIR || join(ROOT, '.data')), port = Number(process.env.PORT || 4317), modelCall } = {}) {
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  const store = new Store(join(dataDir, 'relay.sqlite'));
  const skills = new Skills([join(ROOT, 'skills'), ...(process.env.SKILLS_DIR ? [resolve(process.env.SKILLS_DIR)] : [])]);
  await skills.refresh();
  const computer = new Computer(ROOT, join(dataDir, 'tmp'));
  const token = randomBytes(32).toString('hex');
  const secrets = new Map();
  const providerSecrets = new Map();
  let profiles = loadProfiles(store);
  let tasks = store.setting('tasks', defaultTasks);
  let active = null, queue = [], closing = false;
  const listeners = new Map(), fixtureStates = new Map();
  const keyFor = p => secrets.get(p.id) || process.env[`RELAY_KEY_${p.id.toUpperCase().replaceAll('-', '_')}`] || (providerKeyVariable(p) ? providerSecrets.get(new URL(p.baseUrl).origin) || process.env[providerKeyVariable(p)] : '') || '';
  const publish = (id, type, data) => {
    const event = store.event(id, type, data);
    for (const response of listeners.get(id) || []) response.write(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`);
  };
  function enqueue({ session, prompt, profile, capabilities, maxSteps = 20, task, batchId }) {
    const id = store.createRun(session);
    store.finish(id, 'queued');
    store.metadata(id, { profile, task, prompt, capabilities, batchId });
    queue.push({ id, session, prompt, profile: structuredClone(profile), apiKey: keyFor(profile), capabilities, maxSteps, task: task && structuredClone(task), batchId });
    return id;
  }
  async function pump() {
    if (active || closing || !queue.length) return;
    const item = queue.shift();
    const controller = new AbortController();
    active = { id: item.id, controller };
    const browser = new Browser({ headless: process.env.BROWSER_HEADLESS === 'true' });
    const memory = item.task ? new Store(':memory:') : store;
    const state = new Set();
    const fixtureId = randomUUID();
    fixtureStates.set(fixtureId, state);
    const prompt = item.prompt.replaceAll('{{fixture}}', `http://127.0.0.1:${server.address().port}/fixture/${fixtureId}`);
    try {
      for (const content of item.task?.seedMemory || []) memory.remember({ content, source: 'task seed' });
      await skills.refresh();
      // Freeze the skill catalog for this run, even if the UI reloads it mid-run.
      const runSkills = new Skills(skills.roots);
      runSkills.items = new Map(skills.items);
      const history = item.task ? [] : store.messages(item.session);
      store.message(item.session, 'user', prompt);
      store.finish(item.id, 'running');
      publish(item.id, 'start', { profile: item.profile.label, task: item.task?.name, prompt });
      const metadata = await runAgent({ runId: item.id, session: item.session, prompt, profile: item.profile, apiKey: item.apiKey,
        capabilities: item.capabilities, maxSteps: item.maxSteps, memory, store, skills: runSkills, browser, computer,
        dataDir, signal: controller.signal, emit: (type, data) => publish(item.id, type, data), task: item.task,
        fixtureState: state, modelCall, previousMessages: history });
      store.metadata(item.id, { ...metadata, batchId: item.batchId });
    } catch (error) {
      store.finish(item.id, 'failed');
      publish(item.id, 'error', { message: error.message });
      publish(item.id, 'done', { status: 'failed' });
    } finally {
      await browser.close().catch(() => {});
      if (item.task) memory.close();
      fixtureStates.delete(fixtureId);
      active = null;
      if (!closing) setImmediate(pump);
    }
  }
  const json = (res, value, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
  async function body(req) {
    let text = '';
    for await (const chunk of req) { text += chunk; if (text.length > 256000) throw Object.assign(new Error('Request too large'), { status: 413 }); }
    try { return JSON.parse(text || '{}'); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
  }
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'");
    const actualPort = server.address()?.port;
    const hosts = [`127.0.0.1:${actualPort}`, `localhost:${actualPort}`];
    if (!hosts.includes(req.headers.host)) return json(res, { error: 'Invalid Host' }, 403);
    if (req.headers.origin && !hosts.map(h => `http://${h}`).includes(req.headers.origin)) return json(res, { error: 'Cross-origin request blocked' }, 403);
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) return json(res, { error: 'Method not allowed' }, 405);
    if (req.method !== 'GET' && req.headers['x-relay-token'] !== token) return json(res, { error: 'Invalid session token. Reload the page.' }, 403);
    try {
      if (req.method === 'GET' && path === '/api/state') return json(res, {
        token, profiles: profiles.map(p => ({ ...p, hasKey: Boolean(keyFor(p)), requiresKey: requiresKey(p) })), tasks, skills: skills.list(), skillErrors: skills.errors,
        memories: store.memories(), sessions: store.sessions(), runs: store.runs(), active: active?.id || null,
        queue: queue.map(i => i.id), platform: process.platform, maxSteps: store.setting('maxSteps', 20),
      });
      if (req.method === 'GET' && path === '/api/computer') return json(res, await computer.status());
      if (req.method === 'GET' && path === '/api/export') {
        const isCsv = url.searchParams.get('format') === 'csv';
        res.setHeader('Content-Disposition', `attachment; filename="paces-results.${isCsv ? 'csv' : 'json'}"`);
        res.setHeader('Content-Type', isCsv ? 'text/csv' : 'application/json');
        const runs = store.runs();
        return res.end(isCsv ? csv(runs) : JSON.stringify({ exportedAt: new Date().toISOString(), version: '0.1.0', tasks, profiles, runs: runs.map(r => ({ ...r, events: store.events(r.id) })) }, null, 2));
      }
      let match;
      if (req.method === 'GET' && (match = path.match(/^\/api\/runs\/([a-f0-9-]+)$/))) {
        const run = store.run(match[1]);
        if (!run) return json(res, { error: 'Unknown run' }, 404);
        return json(res, { ...run, metadata: JSON.parse(run.metadata), events: store.events(run.id) });
      }
      if (req.method === 'GET' && (match = path.match(/^\/api\/events\/([a-f0-9-]+)$/))) {
        if (!store.run(match[1])) return json(res, { error: 'Unknown run' }, 404);
        res.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
        const after = Number(req.headers['last-event-id'] || url.searchParams.get('after') || 0);
        for (const event of store.events(match[1], Number.isFinite(after) ? after : 0)) res.write(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`);
        if (!listeners.has(match[1])) listeners.set(match[1], new Set());
        listeners.get(match[1]).add(res);
        const timer = setInterval(() => res.write(': heartbeat\n\n'), 15000);
        req.on('close', () => { clearInterval(timer); listeners.get(match[1])?.delete(res); });
        return;
      }
      if (req.method === 'GET' && (match = path.match(/^\/api\/screenshots\/([a-f0-9-]+)\/(\d+\.(?:jpg|png))$/))) {
        const bytes = await readFile(join(dataDir, 'screenshots', match[1], match[2]));
        res.setHeader('Content-Type', match[2].endsWith('png') ? 'image/png' : 'image/jpeg');
        return res.end(bytes);
      }
      if (req.method === 'GET' && (match = path.match(/^\/fixture\/([a-f0-9-]+)\/(\w+)$/))) {
        const state = fixtureStates.get(match[1]);
        if (!state) return json(res, { error: 'Fixture run expired' }, 404);
        const html = fixture(match[2], url.searchParams, state);
        if (!html) return json(res, { error: 'Unknown fixture' }, 404);
        res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(html);
      }
      if (req.method === 'GET' && (match = path.match(/^\/api\/sessions\/([a-f0-9-]+)$/))) return json(res, store.messages(match[1]));
      if (req.method === 'POST') {
        const data = await body(req);
        if (path === '/api/profiles') {
          const profile = profileSchema.parse(data);
          const oldProfile = profiles.find(p => p.id === profile.id);
          if (oldProfile && new URL(oldProfile.baseUrl).origin !== new URL(profile.baseUrl).origin) secrets.delete(profile.id);
          if (typeof data.apiKey === 'string' && data.apiKey.trim()) {
            secrets.set(profile.id, data.apiKey.trim());
            if (providerKeyVariable(profile)) providerSecrets.set(new URL(profile.baseUrl).origin, data.apiKey.trim());
          }
          profiles = oldProfile ? profiles.map(p => p.id === profile.id ? profile : p) : [...profiles, profile];
          store.setSetting('profiles', profiles); return json(res, { ok: true });
        }
        if (path === '/api/tasks') {
          const task = taskSchema.parse(data);
          tasks = [...tasks.filter(t => t.id !== task.id), task]; store.setSetting('tasks', tasks); return json(res, task);
        }
        if (path === '/api/settings') {
          const { maxSteps } = z.object({ maxSteps: z.number().int().min(1).max(100) }).parse(data);
          store.setSetting('maxSteps', maxSteps); return json(res, { ok: true });
        }
        if (path === '/api/skills/reload') { await skills.refresh(); return json(res, { skills: skills.list(), errors: skills.errors }); }
        if (path === '/api/memory') {
          const item = z.object({ id: z.string().optional(), content: z.string().trim().min(1).max(4000), pinned: z.boolean().default(false) }).parse(data);
          return json(res, store.remember(item));
        }
        if (path === '/api/review') {
          const { id, score, notes } = z.object({ id: z.string(), score: z.number().int().min(1).max(5), notes: z.string().max(4000) }).parse(data);
          const run = store.run(id);
          if (!run) return json(res, { error: 'Unknown run' }, 404);
          if (['queued', 'running'].includes(run.status)) throw new Error('Review the run after it finishes.');
          store.metadata(id, { ...JSON.parse(run.metadata), review: { score, notes } }); return json(res, { ok: true });
        }
        if (path === '/api/run') {
          const a = z.object({ session: z.string().optional(), prompt: z.string().trim().min(1).max(16000), profileId: z.string(), capabilities: caps }).parse(data);
          const profile = profiles.find(p => p.id === a.profileId);
          if (!profile) throw new Error('Select a model profile.');
          requireReady(profile, keyFor(profile));
          if (active || queue.length) throw new Error('Wait for the current queue, or stop it before a sandbox run.');
          const session = a.session || store.createSession().id;
          if (!store.session(session)) throw new Error('Unknown session');
          const id = enqueue({ ...a, session, profile, maxSteps: store.setting('maxSteps', 20) });
          setImmediate(pump); return json(res, { id, session });
        }
        if (path === '/api/batch') {
          const a = z.object({ profiles: z.array(z.string()).min(1).max(20), tasks: z.array(z.string()).min(1).max(30), repeats: z.number().int().min(1).max(10) }).parse(data);
          if (active || queue.length) throw new Error('Wait for the current queue, or stop it before starting another.');
          if (a.profiles.length * a.tasks.length * a.repeats > 100) throw new Error('Limit each batch to 100 runs.');
          const selectedProfiles = a.profiles.map(id => profiles.find(p => p.id === id));
          const selectedTasks = a.tasks.map(id => tasks.find(t => t.id === id));
          if (selectedProfiles.some(p => !p) || selectedTasks.some(t => !t)) throw new Error('Unknown model or task');
          for (const p of selectedProfiles) requireReady(p, keyFor(p));
          const batchId = randomUUID(), ids = [];
          // Alternate models within each task/repeat to reduce ordering bias.
          for (let repeat = 0; repeat < a.repeats; repeat++) for (const task of selectedTasks) for (const profile of selectedProfiles) {
            ids.push(enqueue({ session: store.createSession(`${task.name} · ${profile.label}`).id, prompt: task.prompt, profile, task, capabilities: task.capabilities, maxSteps: store.setting('maxSteps', 20), batchId }));
          }
          setImmediate(pump); return json(res, { ids, batchId });
        }
        if (path === '/api/stop') {
          if (!data.id || active?.id === data.id) active?.controller.abort();
          queue = queue.filter(item => {
            if (data.id && item.id !== data.id) return true;
            store.finish(item.id, 'stopped'); publish(item.id, 'done', { status: 'stopped' }); return false;
          });
          return json(res, { ok: true });
        }
      }
      if (req.method === 'DELETE' && (match = path.match(/^\/api\/(memory|profiles|tasks)\/([a-zA-Z0-9_-]+)$/))) {
        if (match[1] === 'memory') store.forget(match[2]);
        if (match[1] === 'profiles') { profiles = profiles.filter(p => p.id !== match[2]); secrets.delete(match[2]); store.setSetting('profiles', profiles); }
        if (match[1] === 'tasks') { tasks = tasks.filter(t => t.id !== match[2]); store.setSetting('tasks', tasks); }
        return json(res, { ok: true });
      }
      const files = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'], '/paces-mascot.png': ['paces-mascot.png', 'image/png'] };
      if (req.method === 'GET' && files[path]) {
        const [file, type] = files[path]; res.setHeader('Content-Type', type.startsWith('image/') ? type : `${type}; charset=utf-8`); return res.end(await readFile(join(ROOT, 'public', file)));
      }
      return json(res, { error: 'Not found' }, 404);
    } catch (error) {
      if (res.headersSent) return res.end();
      json(res, { error: error instanceof z.ZodError ? error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') : error.message }, error.status || (error.code === 'ENOENT' ? 404 : 400));
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, store, url: `http://127.0.0.1:${server.address().port}`, async close() {
    closing = true; queue = []; active?.controller.abort();
    for (const set of listeners.values()) for (const res of set) res.end();
    await new Promise(resolve => { server.close(resolve); server.closeIdleConnections(); });
    while (active) await new Promise(resolve => setTimeout(resolve, 20));
    store.close();
  } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const app = await createApp();
  console.log(`\n  Paces — local agent evaluation\n  ${app.url}\n  Ctrl+C to stop\n`);
  const stop = async () => { await app.close(); process.exit(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
