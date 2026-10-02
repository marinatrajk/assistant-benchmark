const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const icon = name => { const paths = { evaluations:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', sandbox:'<path d="m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18"/>', models:'<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10"/>', memory:'<path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h4"/>', skills:'<path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>', results:'<path d="M4 20V10m8 10V4m8 16v-7M2 21h20"/>' }; return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">${paths[name]}</svg>`; };
const profileEnabled = p => p.enabled !== false && Boolean(p.model?.trim());
const protocolLabel = p => ({responses:'Responses API',chat:'Chat Completions',anthropic:'Anthropic Messages'})[p.api];
const navItems = { evaluations:'Evaluations', results:'Results', sandbox:'Sandbox', models:'Models', memory:'Memory', skills:'Skills' };
let state, page = 'evaluations', selectedModels = new Set(), selectedTasks = new Set(), repeats = 1;
let session, currentRun, source, runEvents = [], sandboxMessages = [], sandboxProfile = 'openai';
let sandboxCaps = { browser:true, computer:false, memory:true, skills:true };
let initialized = false, desktopStatus;
api('/api/computer').then(s=>{desktopStatus=s;}).catch(()=>{});
const duration = ms => ms == null ? '—' : ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
const number = n => n == null ? '—' : Number(n).toLocaleString();
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); setTimeout(() => $('#toast').classList.remove('visible'), 4200); }
async function api(path, body, method = 'POST') {
  const response = await fetch(path, body === undefined ? {} : { method, headers: { 'Content-Type':'application/json', 'X-Relay-Token':state?.token || '' }, body:JSON.stringify(body) });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Request failed');
  return value;
}
async function refresh(renderPage = true) {
  state = await api('/api/state');
  if (!initialized) {
    const initialProfile = state.profiles.find(profileEnabled);
    if (initialProfile) selectedModels.add(initialProfile.id);
    state.tasks.filter(t => t.category !== 'computer').forEach(t => selectedTasks.add(t.id));
    initialized = true;
  }
  selectedModels = new Set([...selectedModels].filter(id => state.profiles.some(p => p.id === id && profileEnabled(p))));
  selectedTasks = new Set([...selectedTasks].filter(id => state.tasks.some(t => t.id === id)));
  if (renderPage) render();
}
function heading(eyebrow, title, subhead, actions = '') { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subhead">${subhead}</p></div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`; }
function stats() {
  const done = state.runs.filter(r => !['queued','running'].includes(r.status));
  const evaluated = done.filter(r => r.metadata.task && r.metadata.checks?.length);
  const passed = evaluated.filter(r => r.status === 'completed' && r.metadata.checks.every(c => c.passed));
  const ms = done.filter(r => r.metadata.metrics).map(r => r.metadata.metrics.durationMs);
  return `<div class="stats">${[
    ['Total runs',state.runs.length,'Every attempt, recorded'],
    ['Checks pass rate',evaluated.length ? `${Math.round(passed.length/evaluated.length*100)}%` : '—',`${evaluated.length} evaluated runs`],
    ['Avg. run time',ms.length ? duration(ms.reduce((a,b)=>a+b,0)/ms.length) : '—','End-to-end execution'],
    ['Model profiles',state.profiles.length,`${state.tasks.length} tasks in your suite`],
  ].map(([label,value,note]) => `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`).join('')}</div>`;
}
function runTable(runs) {
  if (!runs.length) return '<div class="empty"><span class="empty-symbol">⌁</span><strong>A clean slate for your next experiment</strong>Choose tasks and models above, then run your first evaluation.</div>';
  return `<div class="mini-table"><table><thead><tr><th>Task / model</th><th>Status</th><th>Checks</th><th>Time</th><th>Tools</th><th>Tokens</th><th>Human</th></tr></thead><tbody>${runs.map(r => {
    const m = r.metadata, c = m.checks || [], metrics = m.metrics;
    return `<tr data-run="${r.id}" tabindex="0" role="button" aria-label="Inspect ${esc(m.task?.name || 'sandbox run')}"><td><strong>${esc(m.task?.name || 'Sandbox')}</strong><div class="note">${esc(m.profile?.label)}</div></td><td><span class="status ${r.status}">${r.status}</span></td><td>${c.length ? `${c.filter(x=>x.passed).length}/${c.length}` : '—'}</td><td>${duration(metrics?.durationMs)}</td><td>${metrics ? `${metrics.toolCalls}${metrics.toolErrors ? ` <span class="danger">(${metrics.toolErrors} errors)</span>` : ''}` : '—'}</td><td>${metrics?.usageAvailable ? number(metrics.inputTokens + metrics.outputTokens) : '—'}</td><td>${m.review ? `${m.review.score}/5` : '—'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function comparison() {
  const groups = new Map();
  for (const r of state.runs) {
    if (!r.metadata.task || !r.metadata.metrics || ['running','queued'].includes(r.status)) continue;
    const key = r.metadata.configHash || `${r.metadata.profile.id}:${r.metadata.task.id}`;
    if (!groups.has(key)) groups.set(key, []); groups.get(key).push(r);
  }
  if (!groups.size) return '';
  return `<div class="section-heading"><h2>Model × task comparison</h2></div><div class="panel mini-table"><table class="comparison"><thead><tr><th>Model</th><th>Task</th><th>Runs</th><th>All checks pass</th><th>Avg. time</th><th>Avg. tool errors</th></tr></thead><tbody>${[...groups.values()].map(g => `<tr><td>${esc(g[0].metadata.profile.label)}<div class="note">${esc(g[0].metadata.configHash || '')}</div></td><td>${esc(g[0].metadata.task.name)}</td><td>${g.length}</td><td>${g.filter(r=>r.status==='completed' && r.metadata.checks.length && r.metadata.checks.every(c=>c.passed)).length}/${g.length}</td><td>${duration(g.reduce((n,r)=>n+r.metadata.metrics.durationMs,0)/g.length)}</td><td>${(g.reduce((n,r)=>n+r.metadata.metrics.toolErrors,0)/g.length).toFixed(1)}</td></tr>`).join('')}</tbody></table></div><p class="note">Comparisons group by a fingerprint of model, task, tools, round limit, system prompt, and loaded skill catalog. Changed configurations get separate rows.</p>`;
}
function render() {
  $('#nav').innerHTML = Object.entries(navItems).map(([key,label]) => `<button data-page="${key}" class="${page===key?'active':''}">${icon(key)}<span>${label}</span></button>`).join('');
  $('#page-name').textContent = navItems[page];
  if (page === 'evaluations') renderEvaluations();
  if (page === 'results') $('#main').innerHTML = heading('OBSERVE. COMPARE. IMPROVE.','See what actually works.','Inspect every action. Compare outcomes across models and repeat runs.', '<button data-action="export-csv">↓ CSV</button><button data-action="export-json">↓ JSON</button>') + stats() + comparison() + `<div class="section-heading"><h2>All runs <span class="count">${state.runs.length}</span></h2></div><div class="panel">${runTable(state.runs)}</div>`;
  if (page === 'models') renderModels();
  if (page === 'memory') renderMemory();
  if (page === 'skills') renderSkills();
  if (page === 'sandbox') renderSandbox();
}
function renderEvaluations() {
  const count = selectedModels.size*selectedTasks.size*repeats;
  const busy = Boolean(state.active || state.queue.length);
  $('#main').innerHTML = heading('THE LOCAL AGENT LAB','Put your models to work.','One set of tools. Repeatable tasks. A clear view of how each model performs.', '<button data-action="new-task">＋ New task</button>') +
    (!state.profiles.some(p=>profileEnabled(p) && (p.hasKey || !p.requiresKey)) ? '<div class="banner">Connect a model to run your first evaluation. <button class="inline-link" data-action="configure">Add your OpenAI API key →</button></div>' : '') + stats() +
    `<section class="panel"><div class="panel-head"><div><h2 class="panel-title">Build an evaluation</h2><div class="panel-kicker">Pick your models and tasks. We’ll run each combination.</div></div><span class="tag">SUITE 01</span></div><div class="panel-body"><div class="section-label">01 / Models</div><div class="profiles-select">${state.profiles.map(p=>`<label class="profile-chip"><input type="checkbox" data-model="${p.id}" ${selectedModels.has(p.id)?'checked':''} ${profileEnabled(p)?'':'disabled'}>${esc(p.label)}<small>${esc(profileEnabled(p)?p.model:p.model?'Disabled':'API ID needed')}</small></label>`).join('')}<button class="ghost" data-action="new-profile">＋ Add model</button></div><div class="section-label">02 / Tasks</div><div class="task-grid">${state.tasks.map(t=>`<label class="task-card"><input type="checkbox" data-task="${t.id}" ${selectedTasks.has(t.id)?'checked':''}><div><span class="tag ${esc(t.category)}">${esc(t.category)}</span><h3>${esc(t.name)}</h3><p>${t.checks.length} checks · ${t.capabilities.computer ? 'Shared desktop state' : 'Fresh browser & memory'}</p></div><button class="task-edit" data-edit-task="${t.id}" aria-label="Edit ${esc(t.name)}">⋯</button></label>`).join('')}</div></div><div class="batch-footer"><label>Repeat each <input id="repeats" aria-label="Repeat count" type="number" min="1" max="10" value="${repeats}"> times</label><div class="actions"><span class="batch-summary">${busy ? `${state.queue.length} queued` : `${count} runs · ${state.maxSteps} rounds max`}</span>${busy ? '<button class="danger" data-action="stop-all">Stop queue</button>' : `<button class="primary" data-action="run-batch" ${count?'':'disabled'}>Run evaluation <span aria-hidden="true">↗</span></button>`}</div></div></section><div class="section-heading"><h2>Recent runs <span class="count">${state.runs.length}</span></h2><button class="ghost" data-page="results">View all results →</button></div><section class="panel">${runTable(state.runs.slice(0,8))}</section><p class="note">Browser and memory reset for every evaluation. Desktop tasks use your current primary screen. Automated checks are evidence for review, not a complete quality judgment.</p>`;
}
function renderModels() {
  $('#main').innerHTML = heading('THE CONTENDERS','Bring your models.','Compare OpenAI, Claude, Gemini, and local models with their own profiles.', '<button class="primary" data-action="new-profile">＋ Add model</button>') + `<div class="cards">${state.profiles.map(p=>`<article class="card"><span class="tag">${protocolLabel(p)}</span>${profileEnabled(p)?'':' <span class="tag">Disabled</span>'}<h3>${esc(p.label)}</h3><p>${esc(p.model || 'API model ID needed')}</p><div class="path">${esc(p.baseUrl)}</div><p class="note">${p.hasKey?'● API key available':p.requiresKey?'○ No API key configured':'○ Key optional for this endpoint'}</p>${p.availabilityNote && !profileEnabled(p)?`<p class="note">${esc(p.availabilityNote)}</p>`:''}<div class="actions"><button data-edit-profile="${p.id}">Configure</button><button class="ghost danger" data-delete-profile="${p.id}">Remove</button></div></article>`).join('')}</div><div class="section-heading"><h2>Run settings</h2></div><div class="card">${desktopStatus ? `<div class="banner">Desktop helper: ${desktopStatus.available ? `built · Screen Recording ${desktopStatus.screenRecording?'enabled':'required'} · Accessibility ${desktopStatus.accessibility?'enabled':'required'}` : esc(desktopStatus.error)}</div>` : ''}<label class="field">Maximum model rounds per run<input id="max-steps" type="number" min="1" max="100" value="${state.maxSteps}"></label><button data-action="save-settings">Save settings</button><p class="note">Keys entered here stay in server memory until restart. For persistent configuration, use .env. Model calls run remotely when you choose a hosted provider; selected observations and screenshots are sent to that provider.</p></div>`;
}
function renderMemory() {
  $('#main').innerHTML = heading('A LITTLE CONTEXT GOES A LONG WAY','Memory, made visible.','Edit the facts your sandbox agent remembers. Evaluations get their own seeded memory.', '<button class="primary" data-action="new-memory">＋ Add memory</button>') + `<div class="cards">${state.memories.length ? state.memories.map(m=>`<article class="card"><span class="tag">${m.pinned?'Pinned context':'Memory'}</span><div class="memory-content">${esc(m.content)}</div><div class="memory-meta">${esc(m.updated)} · ${esc(m.source)}</div><div class="actions"><button data-edit-memory="${m.id}">Edit</button><button class="ghost danger" data-delete-memory="${m.id}">Forget</button></div></article>`).join('') : '<div class="panel full empty"><span class="empty-symbol">▤</span><strong>Room for things worth remembering</strong>Add a fact here, or ask the sandbox agent to remember something.</div>'}</div>`;
}
function renderSkills() {
  $('#main').innerHTML = heading('SMALL PLAYBOOKS. REUSABLE KNOW-HOW.','Give your agents a method.','Skills are local SKILL.md documents. The agent discovers descriptions, then loads instructions on demand.', '<button data-action="reload-skills">↻ Reload skills</button>') + `<div class="cards">${state.skills.map(s=>`<article class="card"><span class="tag skills">Skill</span><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><div class="path">${esc(s.directory)}/SKILL.md</div></article>`).join('')}</div><div class="card" style="margin-top:24px"><h3>Add a skill</h3><p>Create <code>skills/your-skill/SKILL.md</code> with a <code>name</code> and <code>description</code> in YAML frontmatter, followed by its workflow. Reference files can live beside it. Reload to discover changes.</p><p class="note">Instruction and reference loading is supported. Skill scripts and custom tool executors are not run by this harness.</p></div>${state.skillErrors.map(e=>`<p class="form-error">${esc(e)}</p>`).join('')}`;
}
function renderSandbox() {
  if (!state.profiles.some(p => p.id === sandboxProfile && profileEnabled(p))) sandboxProfile = state.profiles.find(profileEnabled)?.id;
  $('#main').innerHTML = heading('EXPLORE BEFORE YOU EVALUATE','Try a task by hand.','Work with one model, inspect its tools, and turn a useful prompt into a repeatable evaluation.', '<button data-action="new-session">＋ New session</button>') + `<div class="sandbox-layout"><section class="panel"><div class="chat" id="chat">${sandboxMessages.length ? sandboxMessages.map(m=>`<div class="chat-message"><div class="author">${esc(m.role)}</div>${esc(m.content)}</div>`).join('') : '<div class="empty"><span class="empty-symbol">↗</span><strong>What should the agent try?</strong>Browse a page, practice a skill, or test a desktop workflow.</div>'}</div><form class="composer" id="sandbox-form"><textarea id="prompt" required placeholder="Give the agent a task…" aria-label="Task prompt"></textarea><div class="actions"><span class="note">⌘ / Ctrl + Enter to run</span><button class="primary" ${state.active||state.queue.length||!sandboxProfile?'disabled':''}>Run task ↗</button></div></form></section><div class="sandbox-controls"><div class="card"><label class="field">Model profile<select id="sandbox-model">${state.profiles.map(p=>`<option value="${p.id}" ${sandboxProfile===p.id?'selected':''} ${profileEnabled(p)?'':'disabled'}>${esc(p.label)}${profileEnabled(p)?'':' (disabled)'}</option>`).join('')}</select></label><div class="section-label">Available tools</div>${Object.entries(sandboxCaps).map(([key,value])=>`<label class="capability">${key[0].toUpperCase()+key.slice(1)}<input type="checkbox" data-cap="${key}" ${value?'checked':''}></label>`).join('')}<p class="note">Desktop tools control your primary macOS screen. The browser starts fresh each run.</p></div><div class="card"><h3>Keep the trace</h3><p>Every run appears in Results with its actions, screenshots, and metrics.</p><button data-page="results">Open results →</button></div></div></div>`;
  $('#sandbox-form').addEventListener('submit', async e => {
    e.preventDefault(); const prompt = $('#prompt').value.trim(); if (!prompt) return;
    try {
      const result = await api('/api/run', { session, prompt, profileId:$('#sandbox-model').value, capabilities:sandboxCaps });
      session = result.session; sandboxMessages.push({ role:'user', content:prompt });
      await refresh(); await inspect(result.id);
    } catch(e) { toast(e.message); }
  });
  $('#prompt').addEventListener('keydown', e => { if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) { e.preventDefault(); $('#sandbox-form').requestSubmit(); } });
}
function openDialog(title, content, onSubmit) {
  $('#dialog-content').innerHTML = `<form id="modal-form"><div class="dialog-head"><h2>${title}</h2><button type="button" class="icon-button" data-action="close-dialog" aria-label="Close dialog">×</button></div>${content}<div class="form-error" id="form-error"></div><div class="dialog-footer"><button type="button" data-action="close-dialog">Cancel</button><button class="primary" type="submit">Save</button></div></form>`;
  $('#modal-form').addEventListener('submit', async e => {
    e.preventDefault(); const button = e.submitter; button.disabled = true;
    try { await onSubmit(new FormData(e.target)); $('#dialog').close(); await refresh(); }
    catch(error) { $('#form-error').textContent = error.message; }
    finally { button.disabled = false; }
  });
  $('#dialog').showModal();
}
function profileDialog(profile) {
  const p = profile || { id:crypto.randomUUID(), label:'', model:'', api:'responses', baseUrl:'https://api.openai.com/v1' };
  openDialog(profile?'Configure model':'Add a model', `${p.availabilityNote && !profileEnabled(p)?`<div class="banner">${esc(p.availabilityNote)}</div>`:''}<label class="field">Profile name<input name="label" required value="${esc(p.label)}" placeholder="e.g. OpenAI · candidate"></label><div class="row"><label class="field">Model ID<input name="model" value="${esc(p.model)}" placeholder="Exact API model ID"></label><label class="field">API protocol<select name="api"><option value="responses" ${p.api==='responses'?'selected':''}>OpenAI Responses</option><option value="chat" ${p.api==='chat'?'selected':''}>OpenAI-compatible chat</option><option value="anthropic" ${p.api==='anthropic'?'selected':''}>Anthropic Messages</option></select></label></div><label class="field">Base URL<input name="baseUrl" type="url" required value="${esc(p.baseUrl)}"><small>Include /v1 where required. Local example: http://localhost:11434/v1</small></label><label class="field">API key<input name="apiKey" type="password" autocomplete="off" placeholder="${p.hasKey?'Key configured — leave blank to keep':'Enter key locally'}"><small>Kept in server memory; shared with profiles using the same official provider. Never returned to the UI or included in exports.</small></label><label class="capability">Enable this profile<input type="checkbox" name="enabled" ${p.enabled!==false?'checked':''}></label><details><summary class="note">Generation settings</summary><div class="row" style="margin-top:14px"><label class="field">Output token limit<input name="maxOutputTokens" type="number" min="128" max="128000" value="${p.maxOutputTokens||8192}"></label><label class="field">Temperature<input name="temperature" type="number" min="0" max="2" step="0.1" value="${p.temperature??''}" placeholder="Provider default"></label></div><label class="field">Reasoning effort<select name="reasoningEffort">${['','none','minimal','low','medium','high','xhigh','max'].map(v=>`<option value="${v}" ${(p.reasoningEffort||'')===v?'selected':''}>${v||'Provider default'}</option>`).join('')}</select><small>Support varies by model. Unsupported settings are reported as provider errors.</small></label></details>`, f => api('/api/profiles', { ...p, ...Object.fromEntries(f), id:p.id, enabled:f.has('enabled'), maxOutputTokens:Number(f.get('maxOutputTokens')), temperature:f.get('temperature')===''?null:Number(f.get('temperature')), reasoningEffort:f.get('reasoningEffort')||null }));
}
function taskDialog(task) {
  const t = task || { id:crypto.randomUUID(), name:'', category:'custom', prompt:'', capabilities:{ browser:true, computer:false, memory:false, skills:true }, checks:[], seedMemory:[] };
  openDialog(task?'Edit evaluation task':'Create evaluation task', `<label class="field">Task name<input name="name" required value="${esc(t.name)}"></label><label class="field">Prompt<textarea name="prompt" required rows="4">${esc(t.prompt)}</textarea><small>Use {{fixture}}/form or {{fixture}}/plans for the built-in controlled pages.</small></label><div class="profiles-select">${Object.entries(t.capabilities).map(([key,value])=>`<label class="profile-chip"><input name="cap-${key}" type="checkbox" ${value?'checked':''}>${key}</label>`).join('')}</div><label class="field">Checks (JSON array)<textarea name="checks" rows="4">${esc(JSON.stringify(t.checks,null,2))}</textarea><small>Types: response_contains, tool_called, skill_loaded, memory_contains, memory_not_contains, browser_url_contains, fixture. Each check has a type and value.</small></label><label class="field">Seed memories (JSON array of strings)<textarea name="seedMemory" rows="2">${esc(JSON.stringify(t.seedMemory||[]))}</textarea></label>`, f => api('/api/tasks', { ...t, name:f.get('name'), prompt:f.get('prompt'), checks:JSON.parse(f.get('checks')), seedMemory:JSON.parse(f.get('seedMemory')), capabilities:Object.fromEntries(Object.keys(t.capabilities).map(key=>[key,f.has(`cap-${key}`)])) }));
}
function memoryDialog(memory) {
  openDialog(memory?'Edit memory':'Add memory', `<label class="field">Fact or preference<textarea name="content" required rows="5">${esc(memory?.content||'')}</textarea></label><label class="profile-chip"><input type="checkbox" name="pinned" ${memory?.pinned?'checked':''}>Pin to sandbox context</label>`, f=>api('/api/memory', { id:memory?.id, content:f.get('content'), pinned:f.has('pinned') }));
}
async function inspect(id) {
  source?.close(); currentRun = await api(`/api/runs/${id}`); runEvents = currentRun.events;
  drawInspector();
  if (['queued','running'].includes(currentRun.status)) {
    source = new EventSource(`/api/events/${id}?after=${runEvents.at(-1)?.id||0}`);
    source.onmessage = async e => {
      const event = JSON.parse(e.data);
      if (runEvents.some(x=>x.id===event.id)) return;
      runEvents.push(event);
      if (event.type==='start') currentRun.status='running';
      if (event.type==='done') {
        source.close(); currentRun.status=event.data.status;
        currentRun = await api(`/api/runs/${id}`); runEvents=currentRun.events;
        if (session===currentRun.session) sandboxMessages=await api(`/api/sessions/${session}`);
        await refresh(page !== 'sandbox' || session===currentRun.session);
      }
      drawInspector();
    };
  }
}
function drawInspector() {
  const r = currentRun, m=r.metadata;
  const events = runEvents.filter(e=>e.type!=='step');
  const step = runEvents.filter(e=>e.type==='step').at(-1)?.data;
  const scroll = $('.inspector-body')?.scrollTop || 0;
  const nearBottom = !$('.inspector-body') || $('.inspector-body').scrollHeight-$('.inspector-body').clientHeight-scroll < 120;
  $('#inspector').classList.remove('hidden');
  $('#inspector').innerHTML = `<div class="inspector-head"><div><div class="eyebrow">RUN INSPECTOR</div><h2>${esc(m.task?.name||'Sandbox run')}</h2><div class="note">${esc(m.profile?.label)} · ${esc(m.profile?.model)}</div></div><button class="icon-button" data-action="close-inspector" aria-label="Close inspector">×</button></div><div class="inspector-metrics"><span class="status ${r.status}">${r.status}</span>${m.metrics ? `<span>${duration(m.metrics.durationMs)}</span><span>${m.metrics.toolCalls} tool calls</span><span>${m.metrics.toolErrors} errors</span>` : ''}${step?`<span>Round ${step.step}/${step.maxSteps}</span>`:''}${['running','queued'].includes(r.status)?'<button class="danger" data-action="stop-run">Stop</button>':''}</div><div class="inspector-body">${m.checks?.length?`<div class="check-list" style="margin-bottom:22px">${m.checks.map(c=>`<span class="check-result ${c.passed?'pass':''}">${c.passed?'✓':'×'} ${esc(c.type)}: ${esc(c.value)}</span>`).join('')}</div>`:''}${events.map(event=>{
    const d=event.data;
    if(event.type==='start')return `<div class="trace-item"><h4>Task started</h4><p>${esc(d.prompt)}</p></div>`;
    if(event.type==='message')return `<div class="trace-item"><h4>Assistant</h4><p>${esc(d.text)}</p></div>`;
    if(event.type==='error')return `<div class="trace-item error"><h4>Run notice</h4><p>${esc(d.message)}</p></div>`;
    if(event.type==='tool_start')return `<div class="trace-item"><h4>↗ ${esc(d.name)}</h4><details><summary>Arguments</summary><pre>${esc(d.arguments)}</pre></details></div>`;
    if(event.type==='tool_end')return `<div class="trace-item ${d.ok?'':'error'}"><h4>${d.ok?'✓':'×'} ${esc(d.name)} <span class="muted">· ${duration(d.durationMs)}</span></h4>${d.screenshot?`<a href="${esc(d.screenshot)}" target="_blank" rel="noopener"><img src="${esc(d.screenshot)}" alt="${esc(d.name)} observation" loading="lazy"></a>`:''}<details><summary>${d.ok?'Tool output':'Error details'}</summary><pre>${esc(JSON.stringify(d.data,null,2))}</pre></details></div>`;
    if(event.type==='done')return `<div class="trace-item"><h4>Run ${esc(d.status)}</h4></div>`;
    return '';
  }).join('')||'<div class="empty">Waiting in queue…</div>'}</div>${!['running','queued'].includes(r.status)?`<div class="review-box"><div class="actions" style="justify-content:space-between;margin-bottom:12px"><div class="section-label" style="margin:0">Human review</div><button class="ghost" data-action="continue-run">Continue in sandbox →</button></div><div class="row"><select id="review-score" aria-label="Human score">${[1,2,3,4,5].map(n=>`<option value="${n}" ${m.review?.score===n?'selected':''}>${n}/5</option>`).join('')}</select><input id="review-notes" aria-label="Review notes" placeholder="What worked? What failed?" value="${esc(m.review?.notes||'')}"><button data-action="save-review">Save</button></div></div>`:''}`;
  $('.inspector-body').scrollTop = nearBottom ? $('.inspector-body').scrollHeight : scroll;
}
function updateSelectionSummary() {
  const count=selectedModels.size*selectedTasks.size*repeats;
  const summary=$('.batch-summary'); if(summary&&!state.active&&!state.queue.length) summary.textContent=`${count} runs · ${state.maxSteps} rounds max`;
  const button=$('[data-action=run-batch]');if(button)button.disabled=!count;
}
document.addEventListener('change', e => {
  const el=e.target;
  if(el.dataset.model) { el.checked?selectedModels.add(el.dataset.model):selectedModels.delete(el.dataset.model);updateSelectionSummary(); }
  if(el.dataset.task) { el.checked?selectedTasks.add(el.dataset.task):selectedTasks.delete(el.dataset.task);updateSelectionSummary(); }
  if(el.id==='repeats') { repeats=Math.max(1,Math.min(10,Number(el.value)||1));el.value=repeats;updateSelectionSummary(); }
  if(el.id==='sandbox-model') sandboxProfile=el.value;
  if(el.dataset.cap) sandboxCaps[el.dataset.cap]=el.checked;
});
document.addEventListener('click', async e => {
  const el=e.target.closest('button,[data-run]'); if(!el) return;
  try {
    if(el.dataset.page) { page=el.dataset.page;render(); }
    if(el.dataset.run) await inspect(el.dataset.run);
    if(el.dataset.editProfile) profileDialog(state.profiles.find(p=>p.id===el.dataset.editProfile));
    if(el.dataset.editTask) { e.preventDefault(); taskDialog(state.tasks.find(t=>t.id===el.dataset.editTask)); }
    if(el.dataset.editMemory) memoryDialog(state.memories.find(m=>m.id===el.dataset.editMemory));
    for(const kind of ['Profile','Memory']) if(el.dataset[`delete${kind}`]) {
      await api(`/api/${kind==='Profile'?'profiles':'memory'}/${el.dataset[`delete${kind}`]}`,{},'DELETE');await refresh();
    }
    const action=el.dataset.action;
    if(action==='new-profile') profileDialog();
    if(action==='configure') profileDialog(state.profiles[0]);
    if(action==='new-task') taskDialog();
    if(action==='new-memory') memoryDialog();
    if(action==='close-dialog') $('#dialog').close();
    if(action==='close-inspector') { source?.close(); $('#inspector').classList.add('hidden'); }
    if(action==='export-csv') location.href='/api/export?format=csv';
    if(action==='export-json') location.href='/api/export?format=json';
    if(action==='reload-skills') { await api('/api/skills/reload',{});await refresh();toast('Skills reloaded'); }
    if(action==='save-settings') { await api('/api/settings',{maxSteps:Number($('#max-steps').value)});await refresh();toast('Run settings saved'); }
    if(action==='run-batch') {
      el.disabled=true;
      const result=await api('/api/batch',{profiles:[...selectedModels],tasks:[...selectedTasks],repeats});
      await refresh();toast(`${result.ids.length} evaluation runs queued`);await inspect(result.ids[0]);
    }
    if(action==='stop-all'||action==='stop-run') { await api('/api/stop',action==='stop-run'?{id:currentRun.id}:{});await refresh(); }
    if(action==='save-review') {
      await api('/api/review',{id:currentRun.id,score:Number($('#review-score').value),notes:$('#review-notes').value});
      toast('Review saved');await inspect(currentRun.id);
    }
    if(action==='continue-run') { session=currentRun.session; sandboxProfile=currentRun.metadata.profile.id; sandboxCaps={...currentRun.metadata.capabilities}; sandboxMessages=await api(`/api/sessions/${session}`); source?.close(); $('#inspector').classList.add('hidden'); page='sandbox'; render(); }
    if(action==='new-session') { session=undefined;sandboxMessages=[];renderSandbox(); }
    if(el.id==='refresh') await refresh();
  } catch(error) { toast(error.message); if(el.dataset.action==='run-batch')el.disabled=false; }
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.run){e.preventDefault();inspect(e.target.dataset.run).catch(e=>toast(e.message));}});
await refresh();
setInterval(async()=>{
  try { const wasBusy=Boolean(state.active||state.queue.length);await refresh(false);if((wasBusy||state.active)&&['evaluations','results'].includes(page)&&!$('#dialog').open&&!document.activeElement?.matches('input,textarea,select'))render(); }
  catch { $('.connection').textContent='Runtime disconnected'; }
},2500);
