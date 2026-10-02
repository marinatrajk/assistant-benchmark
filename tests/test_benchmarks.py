"""Regression checks for evidence requirements and the synthetic fixture ledger."""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


everyday = module('everyday', 'benchmarks/legacy/paces-everyday/scripts/validate_report.py')
portable = module('portable', 'benchmarks/legacy/paces-benchmark/scripts/validate_report.py')
fixtures = module('fixtures', 'benchmarks/legacy/paces-benchmark/scripts/serve_fixtures.py')
packages = module('packages', 'scripts/package_skills.py')


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.reports = {
            'everyday': json.loads((ROOT / 'benchmarks/legacy/paces-everyday/assets/report-template.json').read_text()),
            'portable': json.loads((ROOT / 'benchmarks/legacy/paces-benchmark/assets/report-template.json').read_text()),
        }

    def test_templates_are_structurally_valid_but_claim_no_passes(self):
        for name, validator in [('everyday', everyday), ('portable', portable)]:
            report = self.reports[name]
            self.assertEqual(validator.validate(report), [])
            self.assertFalse(any(task['status'] == 'passed' for task in report['tasks']))

    def test_unsubstantiated_full_pass_is_rejected(self):
        for name, validator in [('everyday', everyday), ('portable', portable)]:
            report = deepcopy(self.reports[name])
            report['tasks'][0]['status'] = 'passed'
            self.assertTrue(validator.validate(report))

    def test_missing_task_is_rejected(self):
        for name, validator in [('everyday', everyday), ('portable', portable)]:
            report = deepcopy(self.reports[name])
            report['tasks'].pop()
            self.assertTrue(validator.validate(report))

    def test_identity_can_remain_undisclosed(self):
        for name, validator in [('everyday', everyday), ('portable', portable)]:
            report = deepcopy(self.reports[name])
            report['harness'].update(name=None, model=None, version=None, reasoning_setting=None, model_source='unknown')
            self.assertEqual(validator.validate(report), [])

    def test_pending_reminder_needs_followup_and_deadline(self):
        report = deepcopy(self.reports['everyday'])
        task = next(t for t in report['tasks'] if t['task_id'] == 'reminder-delivery')
        task['status'] = 'pending'
        task['reason'] = 'Waiting for delivery.'
        errors = everyday.validate(report)
        self.assertTrue(any('follow-up' in error for error in errors), errors)
        self.assertTrue(any('observation deadline' in error for error in errors), errors)

    def test_frozen_skill_manifests_match(self):
        for name in ['paces-benchmark', 'paces-everyday']:
            self.assertIn('SKILL.md', packages.verified_files(ROOT / 'benchmarks/legacy' / name))

    def test_skill_archives_are_reproducible(self):
        with tempfile.TemporaryDirectory() as directory:
            first, second = Path(directory) / 'first', Path(directory) / 'second'
            packages.build(first)
            packages.build(second)
            self.assertEqual((first / 'SHA256SUMS').read_bytes(), (second / 'SHA256SUMS').read_bytes())


class FixtureTests(unittest.TestCase):
    def test_form_validates_and_records_real_submission(self):
        with tempfile.TemporaryDirectory() as directory:
            server, info = fixtures.make_server(Path(directory) / 'evidence', port=0)
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            try:
                base = info['fixture_base_url']
                with urlopen(base + '/form') as response:
                    self.assertIn(b'Send request', response.read())
                wrong = urlencode({'name': 'Wrong', 'email': 'ada@example.com', 'topic': 'Research'}).encode()
                with self.assertRaises(HTTPError) as error:
                    urlopen(Request(base + '/submitted', data=wrong))
                self.assertEqual(error.exception.code, 422)
                correct = urlencode({'name': 'Ada Lovelace', 'email': 'ada@example.com', 'topic': 'Research'}).encode()
                with urlopen(Request(base + '/submitted', data=correct)) as response:
                    self.assertIn(b'PACES-', response.read())
                rows = [json.loads(row) for row in (Path(directory) / 'evidence/submissions.jsonl').read_text().splitlines()]
                self.assertEqual([row['valid'] for row in rows], [False, True])
                self.assertIsNone(rows[0]['receipt'])
                self.assertTrue(rows[1]['receipt'].startswith('PACES-'))
                with self.assertRaises(HTTPError) as error:
                    urlopen(Request(base + '/plans', headers={'Origin': 'https://unrelated.invalid'}))
                self.assertEqual(error.exception.code, 403)
                with self.assertRaises(ValueError):
                    fixtures.make_server(Path(directory) / 'evidence', port=0)
            finally:
                server.shutdown()
                worker.join(timeout=3)
                server.server_close()


if __name__ == '__main__':
    unittest.main()
