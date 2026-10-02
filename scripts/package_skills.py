#!/usr/bin/env python3
"""Verify original manifests and build reproducible, self-contained skill ZIPs."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]


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


def build(output):
    output.mkdir(parents=True, exist_ok=True)
    hashes = []
    for name in ('paces-benchmark', 'paces-everyday'):
        folder = ROOT / 'skills' / name
        files = verified_files(folder)
        target = output / f'{name}.zip'
        with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
            for relative in files:
                entry = zipfile.ZipInfo(f'{name}/{relative}', date_time=(2026, 10, 1, 0, 0, 0))
                entry.compress_type = zipfile.ZIP_DEFLATED
                entry.external_attr = 0o100644 << 16
                bundle.writestr(entry, (folder / relative).read_bytes())
        hashes.append(f'{hashlib.sha256(target.read_bytes()).hexdigest()}  {target.name}')
        print(f'{target.name}: {len(files)} verified files')
    (output / 'SHA256SUMS').write_text('\n'.join(hashes) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'artifacts')
    build(parser.parse_args().output)
