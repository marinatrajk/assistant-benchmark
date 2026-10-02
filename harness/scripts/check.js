import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
for (const dir of ['src', 'public', 'scripts', 'test']) {
  for (const file of readdirSync(dir).filter(f => f.endsWith('.js'))) {
    if (spawnSync(process.execPath, ['--check', `${dir}/${file}`], { stdio: 'inherit' }).status) process.exitCode = 1;
  }
}
