import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { join, relative, isAbsolute } from 'node:path';
import { parse } from 'yaml';

export class Skills {
  constructor(roots) { this.roots = roots; this.items = new Map(); this.errors = []; }
  async refresh() {
    const items = new Map();
    this.errors = [];
    for (const root of this.roots) {
      let entries;
      try { entries = await readdir(root, { withFileTypes: true }); }
      catch (e) { this.errors.push(`${root}: ${e.message}`); continue; }
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const directory = join(root, entry.name);
        try {
          const file = join(directory, 'SKILL.md');
          if ((await stat(file)).size > 64000) throw new Error('SKILL.md exceeds 64 KB');
          const raw = await readFile(file, 'utf8');
          const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
          const meta = front ? parse(front[1]) : {};
          const id = entry.name;
          if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Use letters, digits, hyphens or underscores for the directory name');
          items.set(id, { id, name: String(meta?.name || id), description: String(meta?.description || '').slice(0, 1500), directory, body: raw.slice(front?.[0].length || 0).trim() });
        } catch (e) { if (e.code !== 'ENOENT') this.errors.push(`${entry.name}: ${e.message}`); }
      }
    }
    this.items = items;
    return this.list();
  }
  list() { return [...this.items.values()].map(({ body, ...item }) => item); }
  load(id) {
    const skill = this.items.get(id);
    if (!skill) throw new Error(`Unknown skill: ${id}`);
    return { id, instructions: skill.body, description: skill.description };
  }
  async read(id, path) {
    const skill = this.items.get(id);
    if (!skill) throw new Error(`Unknown skill: ${id}`);
    const root = await realpath(skill.directory);
    const file = await realpath(join(root, path));
    const rel = relative(root, file);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Reference must stay inside the skill directory');
    if ((await stat(file)).size > 64000) throw new Error('Reference exceeds 64 KB');
    return { path, content: await readFile(file, 'utf8') };
  }
}
