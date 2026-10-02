#!/usr/bin/env python3
"""Validate report completeness/consistency; does not verify agent behavior."""
import argparse
import json
import math
from pathlib import Path

CHECKS = {
    'browser-form': ['form-values', 'browser-interaction', 'receipt-observed'],
    'browser-research': ['playbook-loaded', 'source-observed', 'correct-choice', 'source-cited'],
    'memory-update': ['playbook-loaded', 'prior-retrieved', 'current-updated', 'readback-verified'],
    'computer-calculator': ['playbook-loaded', 'desktop-input', 'display-observed', 'answer-matches'],
}
STATUSES = {'passed', 'partial', 'failed', 'blocked', 'unsupported', 'not_run'}


def validate(report):
    errors = []

    def check(condition, message):
        if not condition:
            errors.append(message)

    def required(obj, keys, path):
        if not isinstance(obj, dict):
            errors.append(f'{path} must be an object')
            return {}
        for key in keys:
            check(key in obj, f'{path}.{key} is required')
        return obj

    r = required(report, ['suite_id', 'suite_version', 'run_id', 'harness', 'environment', 'limits', 'review_status', 'deviations', 'tasks'], 'report')
    check(r.get('suite_id') == 'paces-portable-v1', 'Unknown suite_id')
    check(r.get('suite_version') in {'1.0.0', '1.0.1'}, 'Unknown suite_version')
    check(isinstance(r.get('run_id'), str) and bool(r['run_id'].strip()), 'run_id must be nonempty')
    harness = required(r.get('harness'), ['name', 'version', 'model', 'model_source', 'reasoning_setting'], 'harness')
    check(harness.get('name') is None or isinstance(harness['name'], str) and bool(harness['name'].strip()), 'harness.name must be a nonempty string or null')
    if 'operator_label' in r:
        check(r['operator_label'] is None or isinstance(r['operator_label'], str) and bool(r['operator_label'].strip()), 'operator_label must be a nonempty string or null')
    if 'metadata_note' in r:
        check(r['metadata_note'] is None or isinstance(r['metadata_note'], str), 'metadata_note must be string or null')
    check(harness.get('model_source') in {'configured', 'reported', 'unknown'}, 'Invalid model_source')
    for key in ['version', 'model', 'reasoning_setting']:
        check(harness.get(key) is None or isinstance(harness[key], str), f'harness.{key} must be string or null')
    environment = required(r.get('environment'), ['os', 'browser', 'execution_location', 'fixture_base_url', 'isolation_notes'], 'environment')
    check(environment.get('execution_location') in {'local', 'cloud', 'unknown'}, 'Invalid execution_location')
    limits = required(r.get('limits'), ['task_timeout_seconds', 'max_tool_calls_per_task', 'repetitions'], 'limits')
    for key in ['task_timeout_seconds', 'max_tool_calls_per_task', 'repetitions']:
        check(type(limits.get(key)) is int and limits[key] > 0, f'limits.{key} must be a positive integer')
    repetitions = limits.get('repetitions', 1)
    if type(repetitions) is not int or not 1 <= repetitions <= 100:
        errors.append('repetitions must be 1..100')
        repetitions = 1
    check(r.get('review_status') in {'unreviewed', 'reviewed'}, 'Invalid review_status')
    if r.get('review_status') == 'reviewed':
        check(bool(r.get('reviewer')) and bool(r.get('review_notes')), 'Reviewed reports require reviewer and review_notes')
    check(isinstance(r.get('deviations'), list) and all(isinstance(x, str) for x in r.get('deviations', [])), 'deviations must be an array of strings')
    tasks = r.get('tasks', [])
    if not isinstance(tasks, list):
        return errors + ['tasks must be an array']
    pairs = []
    for i, raw in enumerate(tasks):
        label = f'tasks[{i}]'
        t = required(raw, ['task_id', 'repetition', 'status', 'reason', 'browser_mode', 'skill_mode', 'memory_mode', 'computer_mode', 'tools_used', 'metrics', 'answer', 'checks', 'evidence'], label)
        task_id = t.get('task_id')
        if not isinstance(task_id, str) or task_id not in CHECKS:
            errors.append(f'{label}: unknown task_id')
            continue
        rep = t.get('repetition')
        check(type(rep) is int and 1 <= rep <= repetitions, f'{label}: invalid repetition')
        if type(rep) is int:
            pairs.append((task_id, rep))
        status = t.get('status')
        check(status in STATUSES, f'{label}: invalid status')
        check(status == 'passed' or isinstance(t.get('reason'), str) and bool(t['reason'].strip()), f'{label}: reason required')
        modes = {
            'browser_mode': {'dom', 'visual', 'mixed', 'unavailable', 'not_applicable'},
            'skill_mode': {'native', 'document', 'unavailable', 'not_applicable'},
            'memory_mode': {'native', 'native_file', 'unavailable', 'not_applicable'},
            'computer_mode': {'native', 'unavailable', 'not_applicable'},
        }
        for key, choices in modes.items():
            check(t.get(key) in choices, f'{label}: invalid {key}')
        check(isinstance(t.get('tools_used'), list) and all(isinstance(x, str) for x in t.get('tools_used', [])), f'{label}: tools_used must be strings')
        metrics = required(t.get('metrics'), ['duration_ms', 'tool_calls', 'input_tokens', 'output_tokens', 'source'], label + '.metrics')
        for key in ['duration_ms', 'tool_calls', 'input_tokens', 'output_tokens']:
            value = metrics.get(key)
            valid_number = type(value) in (int, float) and math.isfinite(value) and value >= 0
            check(value is None or valid_number and (key == 'duration_ms' or type(value) is int), f'{label}: invalid metric {key}')
        if any(metrics.get(key) is not None for key in ['duration_ms', 'tool_calls', 'input_tokens', 'output_tokens']):
            check(isinstance(metrics.get('source'), str) and bool(metrics['source'].strip()), f'{label}: measured metrics need a source')
        evidence = t.get('evidence', [])
        if not isinstance(evidence, list):
            errors.append(f'{label}: evidence must be an array')
            evidence = []
        evidence_ids = []
        for item in evidence:
            e = required(item, ['id', 'kind', 'summary'], label + '.evidence')
            check(isinstance(e.get('id'), str) and bool(e['id']), f'{label}: evidence id must be nonempty')
            if isinstance(e.get('id'), str):
                evidence_ids.append(e['id'])
            check(e.get('kind') in {'observation', 'screenshot', 'trace', 'artifact'}, f'{label}: invalid evidence kind')
            check(isinstance(e.get('summary'), str) and bool(e['summary'].strip()), f'{label}: evidence summary required')
            check(any(isinstance(e.get(k), str) and e[k].strip() for k in ['ref', 'excerpt']), f'{label}: evidence needs ref or excerpt')
        check(len(evidence_ids) == len(set(evidence_ids)), f'{label}: duplicate evidence IDs')
        checks = t.get('checks', [])
        if not isinstance(checks, list):
            errors.append(f'{label}: checks must be an array')
            checks = []
        ids, statuses = [], []
        for item in checks:
            c = required(item, ['id', 'status', 'evidence_ids'], label + '.checks')
            ids.append(c.get('id'))
            statuses.append(c.get('status'))
            check(c.get('status') in {'passed', 'failed', 'unverified'}, f'{label}: invalid check status')
            refs = c.get('evidence_ids', [])
            check(isinstance(refs, list) and all(isinstance(ref, str) and ref in evidence_ids for ref in refs), f'{label}: unresolved evidence references')
            if c.get('status') in {'passed', 'failed'}:
                check(bool(refs), f'{label}: assessed checks need evidence')
            if c.get('id') == 'playbook-loaded' and c.get('status') == 'passed':
                check(t.get('skill_mode') == 'native', f'{label}: document reading cannot pass native skill loading')
        check(all(isinstance(x, str) for x in ids) and sorted(x for x in ids if isinstance(x, str)) == sorted(CHECKS[task_id]), f'{label}: include each required check exactly once')
        if status == 'passed':
            check(bool(statuses) and all(x == 'passed' for x in statuses), f'{label}: passed task has incomplete checks')
            check(bool(t.get('answer')), f'{label}: passed task needs its final answer')
            check(bool(t.get('tools_used')), f'{label}: passed task needs an observed tool trace')
            if task_id.startswith('browser-'):
                check(t.get('browser_mode') in {'dom', 'visual', 'mixed'}, f'{label}: browser capability required')
            if task_id == 'memory-update':
                check(t.get('memory_mode') in {'native', 'native_file'}, f'{label}: native memory required')
            if task_id == 'computer-calculator':
                check(t.get('computer_mode') == 'native', f'{label}: native computer use required')
        if 'failed' in statuses:
            check(status == 'failed', f'{label}: failed check requires a failed task')
        if status in {'not_run', 'unsupported'}:
            check(all(x == 'unverified' for x in statuses), f'{label}: unattempted task cannot contain assessed checks')
        if status == 'partial':
            check('unverified' in statuses and 'passed' in statuses, f'{label}: partial requires both observed progress and unverified checks')
    expected = {(key, rep) for key in CHECKS for rep in range(1, repetitions + 1)}
    check(len(pairs) == len(set(pairs)), 'Duplicate task/repetition pairs')
    check(set(pairs) == expected, 'Include all four tasks for each repetition, even when unavailable')
    return errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', type=Path)
    args = parser.parse_args()
    try:
        report = json.loads(args.report.read_text(encoding='utf-8'))
        errors = validate(report)
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, f'Invalid report: {error}\n')
    if errors:
        parser.exit(1, '\n'.join(errors) + '\n')
    print('Report structure is valid. Outcomes remain subject to independent evidence review.')
    counts = {status: sum(t['status'] == status for t in report['tasks']) for status in sorted(STATUSES)}
    print(json.dumps(counts, indent=2))
