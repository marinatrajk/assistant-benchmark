#!/usr/bin/env python3
"""Verify manifests and package each task skill independently, plus one full bundle."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LEGACY_NAMES = ('paces-benchmark', 'paces-everyday')


def task_folders():
    catalog = json.loads((ROOT / 'benchmarks/task-catalog.json').read_text())
    names = [task['name'] for task in catalog['tasks']]
    if len(names) != len(set(names)) or not all(re.fullmatch(r'[a-z0-9-]+', name) for name in names):
        raise ValueError('Invalid or duplicate task skill name')
    return [ROOT / 'skills' / name for name in sorted(names)]


def verified_files(folder):
    manifest = json.loads((folder / 'manifest.json').read_text())
    files = ['manifest.json', *sorted(manifest['files'])]
    for name, expected in manifest['files'].items():
        path = (folder / name).resolve()
        if not path.is_relative_to(folder.resolve()) or not path.is_file():
            raise ValueError(f'Invalid manifest path: {folder.name}/{name}')
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError(f'Manifest mismatch: {folder.name}/{name}')
    return files


def write_archive(target, folders, date=(2026, 10, 2, 0, 0, 0)):
    count = 0
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
        for folder in folders:
            for relative in verified_files(folder):
                entry = zipfile.ZipInfo(f'{folder.name}/{relative}', date_time=date)
                entry.compress_type = zipfile.ZIP_DEFLATED
                entry.external_attr = 0o100644 << 16
                bundle.writestr(entry, (folder / relative).read_bytes())
                count += 1
    print(f'{target.name}: {count} verified files')
    return f'{hashlib.sha256(target.read_bytes()).hexdigest()}  {target.name}'


def build(output, include_legacy=False):
    output.mkdir(parents=True, exist_ok=True)
    hashes = []
    folders = task_folders()
    for folder in folders:
        hashes.append(write_archive(output / f'{folder.name}.zip', [folder]))
    hashes.append(write_archive(output / 'assistant-benchmark-skills.zip', folders))
    if include_legacy:
        for name in LEGACY_NAMES:
            folder = ROOT / 'benchmarks/legacy' / name
            hashes.append(write_archive(output / f'{name}.zip', [folder], date=(2026, 10, 1, 0, 0, 0)))
    (output / 'SHA256SUMS').write_text('\n'.join(sorted(hashes)) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'artifacts')
    parser.add_argument('--include-legacy', action='store_true', help='Also reproduce the two frozen pilot archives')
    args = parser.parse_args()
    build(args.output, args.include_legacy)
