import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
if (process.platform === 'darwin') {
  const result = spawnSync('xcrun', ['swiftc', '-O', join(root, 'native/desktop.swift'), '-o', join(root, 'native/desktop')], { stdio: 'inherit' });
  if (result.status !== 0) { console.error('Desktop build failed. Install Xcode Command Line Tools: xcode-select --install'); process.exitCode = 1; }
}
if (process.platform !== 'darwin' || !existsSync('/Applications/Google Chrome.app')) {
  const result = spawnSync(process.execPath, [join(root, 'node_modules/playwright/cli.js'), 'install', 'chromium'], { stdio: 'inherit' });
  if (result.status !== 0) process.exitCode = 1;
}
console.log('Setup finished. Run npm start, then open http://127.0.0.1:4317.');
