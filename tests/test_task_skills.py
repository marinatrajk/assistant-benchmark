"""Single-task reports and independently extracted packages, using synthetic evidence."""
from contextlib import redirect_stdout
from copy import deepcopy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import package_skills

spec = importlib.util.spec_from_file_location("task_validator", ROOT / "benchmarks/task_report_validator.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
CATALOG = json.loads((ROOT / "benchmarks/task-catalog.json").read_text())["tasks"]


def fixture(task_id, passed=False):
    entry = next(task for task in CATALOG if task["task_id"] == task_id)
    folder = ROOT / "skills" / entry["name"]
    task_spec = json.loads((folder / "assets/task.json").read_text())
    report = json.loads((folder / "assets/report-template.json").read_text())
    if not passed:
        return task_spec, report
    report["run_id"] = "synthetic-validator-test"
    report["task_inputs"].update({key: "synthetic-input" for key, value in report["task_inputs"].items() if value is None})
    for key in ["fixture_base_url", "product_url"]:
        if key in report["task_inputs"]:
            report["task_inputs"][key] = "https://example.invalid/fixture"
    if "reminder_text" in report["task_inputs"]:
        report["task_inputs"]["reminder_text"] = report["task_inputs"]["reminder_text"].replace("[run_id]", report["run_id"])
    task = report["tasks"][0]
    task.update(status="passed", reason=None, execution_started=True,
                answer="Synthetic validator test only; this does not represent a real benchmark run.",
                tools_used=[], disclosure_note="Names undisclosed; sanitized synthetic trace supplied.")
    task["evidence"] = [{"id": "synthetic", "kind": "trace", "summary": "Synthetic report validation fixture",
                         "provenance": "operator", "excerpt": "Test-only action/results; no live action occurred.", "observed_at": None}]
    for check in task["checks"]:
        check.update(status="passed", evidence_ids=["synthetic"])
    for key, modes in task_spec["required_capabilities"].items():
        task["capabilities"][key].update(status="observed", mode=modes[0], evidence_ids=["synthetic"])
    if task["schedule"] is not None:
        schedule = task["schedule"]
        schedule.update(created_at="2026-10-02T12:00:00-04:00", due_at="2026-10-02T12:10:00-04:00",
                        delivered_at="2026-10-02T12:11:00-04:00", observation_through="2026-10-02T12:12:00-04:00",
                        observation_complete=True, timezone="America/New_York", evidence_ids=["synthetic"])
        if task_id == "scheduled-research":
            schedule.update(due_at="2026-10-02T12:15:00-04:00", source_observed_at="2026-10-02T12:15:15-04:00",
                            delivered_at="2026-10-02T12:16:00-04:00", observation_through="2026-10-02T12:20:00-04:00")
        elif task_id == "reminder-change-cancel":
            schedule.update(original_due_at="2026-10-02T12:20:00-04:00", due_at="2026-10-02T12:30:00-04:00",
                            delivered_at=None, cancelled_at="2026-10-02T12:07:00-04:00",
                            observation_through="2026-10-02T12:32:00-04:00")
    if task["memory"] is not None:
        task["memory"].update(initial_session="seed-session", recall_session="fresh-session",
                              same_environment=True, isolated=True, evidence_ids=["synthetic"])
    return task_spec, report


class TaskReportTests(unittest.TestCase):
    def test_every_template_contains_only_its_task_and_claims_no_pass(self):
        for entry in CATALOG:
            with self.subTest(task=entry["task_id"]):
                task_spec, report = fixture(entry["task_id"])
                self.assertEqual(validator.validate(report, task_spec=task_spec), [])
                self.assertEqual(report["task_ids_requested"], [entry["task_id"]])
                self.assertEqual([task["task_id"] for task in report["tasks"]], [entry["task_id"]])
                self.assertEqual(report["tasks"][0]["status"], "not_run")

    def test_observed_pass_reports_allow_undisclosed_metadata_and_tools(self):
        for entry in CATALOG:
            with self.subTest(task=entry["task_id"]):
                task_spec, report = fixture(entry["task_id"], passed=True)
                self.assertEqual(validator.validate(report, task_spec=task_spec), [])

    def test_pass_requires_actual_evidence_and_resolved_inputs(self):
        for entry in CATALOG:
            with self.subTest(task=entry["task_id"]):
                task_spec, report = fixture(entry["task_id"], passed=True)
                report["tasks"][0]["evidence"] = []
                self.assertTrue(validator.validate(report, task_spec=task_spec))
        for task_id in ["checkout-handoff", "scheduled-research"]:
            task_spec, report = fixture(task_id, passed=True)
            report["task_inputs"]["product_url"] = None
            self.assertTrue(validator.validate(report, task_spec=task_spec))

    def test_no_other_task_can_be_padded_into_a_task_report(self):
        task_spec, report = fixture("browser-form")
        report["tasks"].append(deepcopy(report["tasks"][0]))
        self.assertIn("Include exactly one task entry", validator.validate(report, task_spec=task_spec))
        task_spec, report = fixture("browser-form")
        report["tasks"][0]["task_id"] = "browser-research"
        self.assertIn("Wrong task_id for this skill", validator.validate(report, task_spec=task_spec))

    def test_search_intent_passes_require_every_check_and_operator_input(self):
        for entry in CATALOG:
            if entry['family'] != 'search_intent':
                continue
            for check_id in entry['checks']:
                with self.subTest(task=entry['task_id'], check=check_id):
                    task_spec, report = fixture(entry['task_id'], passed=True)
                    check = next(item for item in report['tasks'][0]['checks'] if item['id'] == check_id)
                    check.update(status='unverified', evidence_ids=[])
                    self.assertIn('Full pass requires all checks', validator.validate(report, task_spec=task_spec))
            for key, value in entry['inputs'].items():
                if value is None:
                    with self.subTest(task=entry['task_id'], missing_input=key):
                        task_spec, report = fixture(entry['task_id'], passed=True)
                        report['task_inputs'][key] = None
                        self.assertTrue(validator.validate(report, task_spec=task_spec))

    def test_video_requires_evidence_for_both_sources_and_file_handoff(self):
        for check_id in [f"{platform}-{check}" for platform in ("youtube", "tiktok")
                         for check in ("source", "download", "transcript", "verification")] + ["usable-artifacts"]:
            with self.subTest(check=check_id):
                task_spec, report = fixture("video-download-transcription", passed=True)
                check = next(item for item in report["tasks"][0]["checks"] if item["id"] == check_id)
                check["evidence_ids"] = []
                self.assertIn("check.evidence_ids: evidence required", validator.validate(report, task_spec=task_spec))

    def test_one_completed_video_is_partial_and_cannot_pass(self):
        task_spec, report = fixture("video-download-transcription", passed=True)
        task = report["tasks"][0]
        task.update(status="partial", reason="YouTube completed; TikTok access blocked.")
        for check in task["checks"]:
            if check["id"].startswith("tiktok-") or check["id"] == "usable-artifacts":
                check.update(status="unverified", evidence_ids=[])
        self.assertEqual(validator.validate(report, task_spec=task_spec), [])
        task["status"] = "passed"
        self.assertIn("Full pass requires all checks", validator.validate(report, task_spec=task_spec))

    def test_missing_check_and_wrong_source_protocol_are_rejected(self):
        task_spec, report = fixture("purchase-research", passed=True)
        report["tasks"][0]["checks"].pop()
        report["source_protocol"]["suite_version"] = "different-protocol"
        errors = validator.validate(report, task_spec=task_spec)
        self.assertIn("Include each required check exactly once", errors)
        self.assertTrue(any("source_protocol" in error for error in errors))

    def test_document_only_loading_cannot_pass_portable_skill_checks(self):
        for task_id in ["browser-research", "memory-update", "computer-calculator"]:
            with self.subTest(task=task_id):
                task_spec, report = fixture(task_id, passed=True)
                report["tasks"][0]["capabilities"]["skills"]["mode"] = "document"
                self.assertTrue(validator.validate(report, task_spec=task_spec))

    def test_scheduling_creation_alone_stays_pending(self):
        for task_id in ["reminder-delivery", "reminder-change-cancel", "scheduled-research"]:
            with self.subTest(task=task_id):
                task_spec, report = fixture(task_id)
                report["run_id"] = "pending-test"
                task = report["tasks"][0]
                task.update(status="pending", reason="Waiting for actual observations.")
                self.assertTrue(validator.validate(report, task_spec=task_spec))
                task["follow_up"].update(required=True, next_action="Return timestamped notification observations.",
                                         deadline_at="2026-10-02T12:40:00-04:00")
                self.assertEqual(validator.validate(report, task_spec=task_spec), [])
                task["status"] = "passed"
                self.assertTrue(validator.validate(report, task_spec=task_spec))

    def test_late_and_early_reminders_do_not_pass(self):
        for delivered in ["2026-10-02T12:09:59-04:00", "2026-10-02T12:12:01-04:00"]:
            task_spec, report = fixture("reminder-delivery", passed=True)
            report["tasks"][0]["schedule"]["delivered_at"] = delivered
            self.assertIn("Delivery outside due window", validator.validate(report, task_spec=task_spec))

    def test_cancellation_needs_observation_at_both_due_times(self):
        task_spec, report = fixture("reminder-change-cancel", passed=True)
        report["tasks"][0]["schedule"]["observation_through"] = "2026-10-02T12:22:00-04:00"
        self.assertIn("Cancellation observation window incomplete", validator.validate(report, task_spec=task_spec))
        task_spec, report = fixture("reminder-change-cancel", passed=True)
        report["tasks"][0]["schedule"]["delivered_at"] = "2026-10-02T12:20:00-04:00"
        self.assertIn("Cancelled reminder was delivered", validator.validate(report, task_spec=task_spec))

    def test_scheduled_research_needs_a_fresh_observation(self):
        task_spec, report = fixture("scheduled-research", passed=True)
        report["tasks"][0]["schedule"]["source_observed_at"] = "2026-10-02T12:01:00-04:00"
        self.assertIn("Fresh source observation after due and before delivery required", validator.validate(report, task_spec=task_spec))

    def test_same_chat_or_unisolated_memory_cannot_pass(self):
        task_spec, report = fixture("memory-followup", passed=True)
        report["tasks"][0]["memory"]["recall_session"] = "seed-session"
        self.assertIn("Distinct initial and recall sessions required", validator.validate(report, task_spec=task_spec))
        task_spec, report = fixture("memory-followup", passed=True)
        report["tasks"][0]["memory"]["isolated"] = False
        self.assertIn("Same environment and isolated memory required", validator.validate(report, task_spec=task_spec))

    def test_user_input_can_be_pending_without_creating_other_tasks(self):
        task_spec, report = fixture("checkout-handoff")
        report["run_id"] = "awaiting-input-test"
        task = report["tasks"][0]
        task.update(status="awaiting_user", reason="Exact target has not been supplied.")
        task["follow_up"].update(required=True, next_action="Supply the product URL and exact variant.")
        self.assertEqual(validator.validate(report, task_spec=task_spec), [])

    def test_local_evidence_cannot_escape_bundle_and_missing_files_are_rejected(self):
        task_spec, report = fixture("expense-summary", passed=True)
        evidence = report["tasks"][0]["evidence"][0]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            evidence["ref"] = "output.csv"
            self.assertTrue(validator.validate(report, root, task_spec))
            (root / "output.csv").write_text("synthetic output\n")
            self.assertEqual(validator.validate(report, root, task_spec), [])
            evidence["ref"] = "../outside.csv"
            self.assertTrue(validator.validate(report, root, task_spec))
            with tempfile.TemporaryDirectory() as outside:
                target = Path(outside) / "file.csv"
                target.write_text("outside bundle\n")
                (root / "link.csv").symlink_to(target)
                evidence["ref"] = "link.csv"
                self.assertTrue(validator.validate(report, root, task_spec))


class TaskPackageTests(unittest.TestCase):
    def test_all_catalog_archives_run_without_the_repo_or_other_skills(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "archives"
            with redirect_stdout(io.StringIO()):
                package_skills.build(output)
            self.assertEqual(len(list(output.glob("benchmark-*.zip"))), len(CATALOG))
            for entry in CATALOG:
                with self.subTest(skill=entry["name"]):
                    extracted = Path(directory) / entry["name"]
                    with zipfile.ZipFile(output / f'{entry["name"]}.zip') as archive:
                        archive.extractall(extracted)
                    folder = extracted / entry["name"]
                    for target, source in entry.get('bundled_inputs', {}).items():
                        self.assertEqual((folder / target).read_bytes(), (ROOT / source).read_bytes())
                    self.assertFalse(any('reviewer' in path.parts for path in folder.rglob('*')))
                    result = subprocess.run([sys.executable, str(folder / "scripts/validate_report.py"),
                                             str(folder / "assets/report-template.json"), "--check-files"],
                                            cwd=extracted, capture_output=True, text=True)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertIn("Structure valid", result.stdout)
            with zipfile.ZipFile(output / "assistant-benchmark-skills.zip") as archive:
                prefixes = {Path(name).parts[0] for name in archive.namelist()}
                self.assertEqual(prefixes, {entry["name"] for entry in CATALOG})


if __name__ == "__main__":
    unittest.main()
