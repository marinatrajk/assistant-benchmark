#!/usr/bin/env python3
"""Catch likely secrets and accidental runtime files in the tracked release tree.

This is a heuristic guard, not a complete privacy/security review. It prints only
filenames and finding types, never matching credential values.
"""
from pathlib import Path
import re
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'possible credential': re.compile(r'(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)'),
    'private home path': re.compile(r'/(?:Users|home)/[A-Za-z][A-Za-z0-9._-]+/'),
    'session credential in URL': re.compile(r'https?://[^\s"<>]*(?:[?&](?:access_token|api_key|session_token|checkout_token)=)'),
}


def main():
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
    findings = []
    for name in filter(None, tracked):
        path = ROOT / name
        parts = path.relative_to(ROOT).parts
        forbidden = any(part in {'.vercel', '.data', 'node_modules', '__pycache__', 'private-results'} for part in parts)
        forbidden |= path.name.startswith('.env') and path.name != '.env.example'
        forbidden |= bool(re.search(r'\.(?:sqlite(?:-wal|-shm)?|db|pyc)$', name))
        forbidden |= name == 'harness/native/desktop'
        if forbidden or path.is_symlink():
            findings.append((name, 'runtime/private file or symlink'))
            continue
        texts = []
        try:
            texts.append(path.read_text())
        except UnicodeDecodeError:
            if path.suffix == '.xlsx':
                with zipfile.ZipFile(path) as archive:
                    texts.extend(archive.read(member).decode('utf-8', errors='replace')
                                 for member in archive.namelist() if member.endswith('.xml'))
        for label, pattern in PATTERNS.items():
            if any(pattern.search(text) for text in texts):
                findings.append((name, label))
    for name, label in findings:
        print(f'{name}: {label}')
    if findings:
        sys.exit(1)
    print('Tracked-file guard passed. Manual privacy review is still required for evidence.')


if __name__ == '__main__':
    main()
