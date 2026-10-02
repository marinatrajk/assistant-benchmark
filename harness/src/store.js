import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class Store {
  constructor(path) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, title TEXT NOT NULL, created TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, session TEXT REFERENCES sessions(id) ON DELETE CASCADE, role TEXT, content TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, session TEXT REFERENCES sessions(id) ON DELETE CASCADE, status TEXT, metadata TEXT DEFAULT '{}', created TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, run TEXT REFERENCES runs(id) ON DELETE CASCADE, type TEXT, data TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS memories (id TEXT PRIMARY KEY, content TEXT NOT NULL, pinned INTEGER DEFAULT 0, source TEXT, updated TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(id UNINDEXED, content, tokenize='unicode61');
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
      UPDATE runs SET status='interrupted' WHERE status IN ('running','queued');
    `);
  }
  close() { this.db.close(); }
  sessions() { return this.db.prepare('SELECT * FROM sessions ORDER BY rowid DESC').all(); }
  session(id) { return this.db.prepare('SELECT * FROM sessions WHERE id=?').get(id); }
  createSession(title = 'New session') {
    const id = randomUUID();
    this.db.prepare('INSERT INTO sessions(id,title) VALUES(?,?)').run(id, title);
    return this.session(id);
  }
  messages(id) { return this.db.prepare('SELECT * FROM messages WHERE session=? ORDER BY id').all(id); }
  message(session, role, content) {
    this.db.prepare('INSERT INTO messages(session,role,content) VALUES(?,?,?)').run(session, role, content);
    if (role === 'user') this.db.prepare("UPDATE sessions SET title=? WHERE id=? AND title='New session'").run(content.slice(0, 55), session);
  }
  createRun(session) {
    const id = randomUUID();
    this.db.prepare("INSERT INTO runs(id,session,status) VALUES(?,?,'running')").run(id, session);
    return id;
  }
  runs() { return this.db.prepare('SELECT * FROM runs ORDER BY rowid DESC LIMIT 500').all().map(r => ({ ...r, metadata: JSON.parse(r.metadata) })); }
  metadata(id, data) { this.db.prepare('UPDATE runs SET metadata=? WHERE id=?').run(JSON.stringify(data), id); }
  run(id) { return this.db.prepare('SELECT * FROM runs WHERE id=?').get(id); }
  latestRun(session) { return this.db.prepare('SELECT * FROM runs WHERE session=? ORDER BY rowid DESC LIMIT 1').get(session); }
  finish(id, status) { this.db.prepare('UPDATE runs SET status=? WHERE id=?').run(status, id); }
  event(run, type, data) {
    const { lastInsertRowid } = this.db.prepare('INSERT INTO events(run,type,data) VALUES(?,?,?)').run(run, type, JSON.stringify(data));
    return { id: Number(lastInsertRowid), type, data };
  }
  events(run, after = 0) {
    return this.db.prepare('SELECT id,type,data FROM events WHERE run=? AND id>? ORDER BY id').all(run, after).map(e => ({ ...e, data: JSON.parse(e.data) }));
  }
  memories(query = '') {
    const tokens = query.match(/[\p{L}\p{N}]+/gu)?.slice(0, 20) || [];
    if (!tokens.length) return this.db.prepare('SELECT * FROM memories ORDER BY pinned DESC, updated DESC, rowid DESC LIMIT 200').all();
    const match = tokens.map(t => `"${t}"`).join(' OR ');
    return this.db.prepare(`SELECT m.* FROM memory_fts f JOIN memories m ON m.id=f.id
      WHERE memory_fts MATCH ? ORDER BY m.pinned DESC, rank LIMIT 20`).all(match);
  }
  remember({ id = randomUUID(), content, pinned = false, source = 'user' }) {
    this.db.exec('BEGIN');
    try {
      this.db.prepare(`INSERT INTO memories(id,content,pinned,source) VALUES(?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET content=excluded.content,pinned=excluded.pinned,source=excluded.source,updated=CURRENT_TIMESTAMP`).run(id, content, +pinned, source);
      this.db.prepare('DELETE FROM memory_fts WHERE id=?').run(id);
      this.db.prepare('INSERT INTO memory_fts(id,content) VALUES(?,?)').run(id, content);
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
    return { id, content, pinned, source };
  }
  forget(id) {
    this.db.exec('BEGIN');
    try {
      this.db.prepare('DELETE FROM memories WHERE id=?').run(id);
      this.db.prepare('DELETE FROM memory_fts WHERE id=?').run(id);
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
    return { deleted: id };
  }
  setting(key, fallback) {
    const row = this.db.prepare('SELECT value FROM settings WHERE key=?').get(key);
    return row ? JSON.parse(row.value) : fallback;
  }
  setSetting(key, value) {
    this.db.prepare('INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, JSON.stringify(value));
  }
}
