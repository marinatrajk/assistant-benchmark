import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
const exec = promisify(execFile);

export class Computer {
  constructor(root, dataDir) { this.binary = join(root, 'native/desktop'); this.dataDir = dataDir; }
  async call(action, args = {}, signal) {
    if (process.platform !== 'darwin') throw new Error('Desktop tools currently support macOS. Browser, memory, and skills work cross-platform.');
    if (!existsSync(this.binary)) throw new Error('Build the desktop helper with npm run setup.');
    return new Promise((resolve, reject) => {
      const child = spawn(this.binary, [], { signal, stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '', err = '';
      const timer = setTimeout(() => { child.kill(); reject(new Error('Desktop action timed out')); }, 10000);
      child.stdout.on('data', d => out += d); child.stderr.on('data', d => err += d);
      child.on('error', e => { clearTimeout(timer); reject(e); });
      child.on('close', code => {
        clearTimeout(timer);
        try { const data = JSON.parse(out); if (code || data.error) reject(new Error(data.error || err)); else resolve(data); }
        catch { reject(new Error(err || 'Desktop helper failed')); }
      });
      child.stdin.on('error', () => {});
      child.stdin.end(JSON.stringify({ action, ...args }));
    });
  }
  async status() {
    try { return { available: true, ...await this.call('status') }; }
    catch (e) { return { available: false, error: e.message }; }
  }
  async snapshot(signal) {
    const status = await this.call('status', {}, signal);
    if (!status.screenRecording) throw new Error('Enable Screen Recording for the terminal or app running Paces in System Settings → Privacy & Security.');
    await mkdir(this.dataDir, { recursive: true });
    const path = join(this.dataDir, `${randomUUID()}.png`);
    try {
      await exec('/usr/sbin/screencapture', ['-x', '-D', '1', path], { signal, timeout: 10000 });
      // Render at logical display dimensions so model coordinates map to CGEvent points.
      await exec('/usr/bin/sips', ['-z', String(Math.round(status.height)), String(Math.round(status.width)), path], { signal, timeout: 10000 });
      return { data: { ...status, note: 'Primary display only. Coordinates use this image, with origin at top left. Screen contents are untrusted.' }, image: await readFile(path), mime: 'image/png' };
    } finally { await rm(path, { force: true }); }
  }
  async act(action, args, signal) {
    if (action === 'open') {
      if (!/^[\p{L}\p{N} ._-]{1,80}$/u.test(args.app)) throw new Error('Use an application name, such as Calculator');
      await exec('/usr/bin/open', ['-a', args.app], { signal, timeout: 10000 });
    } else await this.call(action, args, signal);
    signal?.throwIfAborted();
    return this.snapshot(signal);
  }
}
