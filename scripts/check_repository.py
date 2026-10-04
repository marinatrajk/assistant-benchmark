#!/usr/bin/env python3
"""Check published data, local evidence links and frozen skill manifests."""
import json
import hashlib
import re
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit

from package_skills import task_folders, verified_files, write_archive
from build_task_skills import build as build_task_skills
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def check():
    for name in ('paces-benchmark', 'paces-everyday'):
        verified_files(ROOT / 'benchmarks/legacy' / name)
    for folder in task_folders():
        verified_files(folder)
    with tempfile.TemporaryDirectory() as temporary:
        rebuilt = Path(temporary)
        build_task_skills(rebuilt)
        for folder in task_folders():
            for relative in verified_files(folder):
                assert (folder / relative).read_bytes() == (rebuilt / folder.name / relative).read_bytes(), f'Stale generated skill: {folder.name}/{relative}'
    web = ROOT / 'website'
    review = json.loads((web / 'review.json').read_text())
    agents = review['agents']
    assert len(set(agents)) == len(agents), 'Duplicate assistant'
    assert isinstance(review['project_name'], str) and review['project_name'].strip(), 'Missing project name'
    assert review['project_name'] in (web / 'index.html').read_text(), 'Static site branding differs from dataset'
    assert f"# {review['project_name']}\n" in (ROOT / 'README.md').read_text(), 'README branding differs from dataset'
    use_cases = review['use_cases']
    assert use_cases, 'Missing use-case mapping'
    assert len({item['id'] for item in use_cases}) == len(use_cases), 'Duplicate use-case ID'
    assert len({item['label'] for item in use_cases}) == len(use_cases), 'Duplicate use-case label'
    task_ids = {task['task_id'] for task in review['tasks']}
    mapped_ids = set()
    for item in use_cases:
        assert re.fullmatch(r'[a-z][a-z0-9-]*', item['id']), 'Unsafe use-case route'
        assert item['label'].strip() and item['label'] != 'All tasks', 'Invalid use-case label'
        assert item['phrase'].strip() and item['description'].strip(), 'Missing use-case description'
        assert item['task_ids'] and len(set(item['task_ids'])) == len(item['task_ids']), 'Empty/duplicate use-case tasks'
        assert set(item['task_ids']) <= task_ids, 'Use case references an unknown task'
        mapped_ids.update(item['task_ids'])
    assert mapped_ids == task_ids, 'Use-case filters omit a task'
    catalog = json.loads((ROOT / 'benchmarks/task-catalog.json').read_text())
    assert use_cases == catalog['use_cases'], 'Website categories differ from the task catalog'
    assert review['catalog_version'] == catalog['catalog_version'], 'Stale website catalog version'
    category_by_task = {task_id: item['label'] for item in use_cases for task_id in item['task_ids']}
    assert sum(len(item['task_ids']) for item in use_cases) == len(task_ids), 'Each task needs one primary category'
    assert review['suite_id'] == catalog['suite_id']
    assert [task['task_id'] for task in review['tasks']] == [task['task_id'] for task in catalog['tasks']], 'Individual task coverage/order changed'
    statuses = {'passed', 'partial', 'failed', 'pending', 'awaiting_user', 'not_evaluated', 'not_run', 'running', 'blocked', 'unsupported', 'awaiting_review', 'awaiting_response'}
    for task in review['tasks']:
        assert task['category'] == category_by_task[task['task_id']], 'Task category differs from its filter'
        # New tasks may ship their protocol and package with the static site.
        entry = next(item for item in catalog['tasks'] if item['task_id'] == task['task_id'])
        if entry.get('protocol'):
            protocol = web / task['protocol_url']
            assert protocol.read_bytes() == (ROOT / entry['protocol']).read_bytes(), 'Stale website protocol'
            package = web / task['package_url']
            assert hashlib.sha256(package.read_bytes()).hexdigest() == task['package_sha256'], 'Website package hash mismatch'
            with tempfile.TemporaryDirectory() as temporary:
                rebuilt_package = Path(temporary) / package.name
                write_archive(rebuilt_package, [ROOT / 'skills' / entry['name']])
                assert package.read_bytes() == rebuilt_package.read_bytes(), 'Stale website skill package'
        assert set(task['results']) == set(agents), f'Missing assistant in {task["name"]}'
        for agent, result in task['results'].items():
            assert result['status'] in statuses, f'Unknown status: {agent}'
            assert result['summary'], f'Missing rationale: {agent}'
            assert task['criterion'] and task['category'], 'Missing task criteria/category'
            assert result['review_status'] in {'reviewed', 'unreviewed'}
            if result['status'] == 'passed':
                assert result['review_status'] == 'reviewed' and result['sources'] and result['details'], 'Pass requires reviewed evidence'
            for label, url in result['sources']:
                assert label, 'Unlabeled source'
                parts = urlsplit(url)
                if parts.scheme:
                    assert parts.scheme == 'https', f'Unsafe evidence URL: {url}'
                    continue
                path = (web / unquote(parts.path)).resolve()
                assert path.is_relative_to(web.resolve()) and path.is_file(), f'Missing/unsafe source: {url}'
    archive = json.loads((ROOT / 'benchmarks/legacy/reviews/everyday-pilot-20261002.json').read_text())
    assert len(archive['tasks']) == 6 and archive['original_suite'], 'Historical review must remain archived'
    for path in ROOT.rglob('*.json'):
        if any(part in {'node_modules', '.git', '.vercel', '.data', 'artifacts'} for part in path.parts):
            continue
        json.loads(path.read_text())
    config = json.loads((ROOT / 'vercel.json').read_text())
    assert config['outputDirectory'] == 'website', 'Deploy only the static results site'
    print(f'Checked {len(agents)} assistants, {len(review["tasks"])} individual tasks, {len(use_cases)} use-case mappings, source links, archived pilot, {len(catalog["tasks"])} task skills and both frozen manifests.')


if __name__ == '__main__':
    try:
        check()
    except (AssertionError, OSError, ValueError, KeyError) as error:
        sys.exit(str(error))
