#!/usr/bin/env python3
"""Validate one task report; evidence authenticity still needs human review.

This shared source is copied into every standalone skill by build_task_skills.py.
Each packaged copy reads only its own assets/task.json, with no repo dependencies.
"""
import argparse
from datetime import datetime, timedelta
import json
import math
from pathlib import Path
from urllib.parse import unquote, urlsplit

STATUSES = {"passed", "partial", "failed", "blocked", "unsupported", "pending", "awaiting_user", "not_run"}
CAPABILITIES = {"browser", "computer", "memory", "scheduling", "skills"}
SCHEDULE_TASKS = {"reminder-delivery", "reminder-change-cancel", "scheduled-research"}


def validate(report, evidence_root=None, task_spec=None):
    if task_spec is None:
        task_spec = json.loads((Path(__file__).resolve().parents[1] / "assets/task.json").read_text())
    errors = []

    def need(condition, message):
        if not condition:
            errors.append(message)

    def obj(value, label):
        if not isinstance(value, dict):
            errors.append(f"{label}: expected object")
            return {}
        return value

    def array(value, label):
        if not isinstance(value, list):
            errors.append(f"{label}: expected array")
            return []
        return value

    def text(value):
        return isinstance(value, str) and bool(value.strip())

    def choice(value, values):
        return isinstance(value, str) and value in values

    def stamp(value, label):
        if value is None:
            return None
        try:
            result = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if result.utcoffset() is None:
                raise ValueError("timezone missing")
            return result
        except (AttributeError, TypeError, ValueError):
            errors.append(f"{label}: timestamp needs an explicit UTC offset")
            return None

    r = obj(report, "report")
    task_id = task_spec["task_id"]
    for key in ["suite_id", "suite_version", "skill_name", "source_protocol"]:
        need(r.get(key) == task_spec[key], f"report.{key}: does not match this task skill")
    need(r.get("report_scope") == "task", "report_scope must be task")
    need(text(r.get("run_id")), "Choose a unique run_id")
    need(r.get("task_ids_requested") == [task_id], "Assign only this skill's task")
    need(choice(r.get("review_status"), {"unreviewed", "reviewed"}), "Invalid review_status")
    if r.get("review_status") == "reviewed":
        need(text(r.get("reviewer")) and text(r.get("review_notes")), "Reviewed report needs reviewer and review_notes")
    harness = obj(r.get("harness"), "harness")
    for key in ["name", "model", "version", "reasoning_setting"]:
        need(key in harness and (harness[key] is None or isinstance(harness[key], str)), f"harness.{key}: string or null required")
    need(choice(harness.get("model_source"), {"unknown", "configured", "reported"}), "Invalid model_source")
    environment = obj(r.get("environment"), "environment")
    need(choice(environment.get("execution_location"), {"local", "cloud", "unknown"}), "Invalid execution_location")
    deviations = array(r.get("deviations"), "deviations")
    need(all(isinstance(value, str) for value in deviations), "deviations must contain strings")
    started, updated = stamp(r.get("started_at"), "started_at"), stamp(r.get("updated_at"), "updated_at")
    if started and updated:
        need(updated >= started, "updated_at cannot precede started_at")
    config = obj(r.get("run_config"), "run_config")
    for key, default in task_spec["run_config"].items():
        value = config.get(key)
        if type(default) is int:
            need(type(value) is int and value > 0, f"run_config.{key}: positive integer required")
        elif isinstance(default, str):
            need(text(value), f"run_config.{key}: string required")
        elif type(default) is bool:
            need(type(value) is bool, f"run_config.{key}: boolean required")
    need(config.get("repetitions") == 1, "Use one attempt and a new run ID for repeats")
    inputs = obj(r.get("task_inputs"), "task_inputs")
    tasks = array(r.get("tasks"), "tasks")
    if len(tasks) != 1:
        return errors + ["Include exactly one task entry"]
    t = obj(tasks[0], "task")
    need(t.get("task_id") == task_id, "Wrong task_id for this skill")
    status = t.get("status")
    need(choice(status, STATUSES), "Invalid task status")
    if status != "not_run":
        need(r.get("run_id") != "replace-with-unique-run-id", "Replace the example run ID before starting")
    need(status == "passed" or text(t.get("reason")), "Explain any result other than passed")
    need(type(t.get("execution_started")) is bool, "execution_started must be boolean")

    evidence = array(t.get("evidence"), "evidence")
    evidence_ids = []
    for raw in evidence:
        e = obj(raw, "evidence entry")
        need(text(e.get("id")), "Evidence ID required")
        if isinstance(e.get("id"), str):
            evidence_ids.append(e["id"])
        need(choice(e.get("kind"), {"trace", "screenshot", "observation", "artifact", "operator_attestation"}), "Invalid evidence kind")
        need(choice(e.get("provenance"), {"agent_export", "operator", "platform"}), "Evidence provenance required")
        need(text(e.get("summary")), "Evidence summary required")
        need(text(e.get("ref")) or text(e.get("excerpt")), "Evidence ref or excerpt required")
        stamp(e.get("observed_at"), "evidence.observed_at")
        ref = e.get("ref")
        if text(ref):
            parts = urlsplit(ref)
            if parts.scheme or parts.netloc:
                need(parts.scheme == "https" and bool(parts.netloc), "Evidence URL must use HTTPS")
            else:
                path = Path(unquote(parts.path))
                safe = bool(parts.path) and not path.is_absolute() and ".." not in path.parts
                need(safe, "Evidence path must remain inside the report bundle")
                if safe and evidence_root is not None:
                    root = Path(evidence_root).resolve()
                    candidate = (root / path).resolve()
                    need(candidate.is_relative_to(root) and candidate.is_file(), f"Missing/unsafe local evidence file: {ref}")
    need(len(evidence_ids) == len(set(evidence_ids)), "Duplicate evidence IDs")

    def refs(value, label, required=False):
        found = array(value, label)
        need(all(isinstance(item, str) and item in evidence_ids for item in found), f"{label}: unresolved evidence IDs")
        if required:
            need(bool(found), f"{label}: evidence required")

    checks = array(t.get("checks"), "checks")
    ids, states = [], []
    for raw in checks:
        c = obj(raw, "check")
        ids.append(c.get("id"))
        states.append(c.get("status"))
        need(choice(c.get("status"), {"passed", "failed", "unverified"}), "Invalid check status")
        refs(c.get("evidence_ids"), "check.evidence_ids", c.get("status") in ("passed", "failed"))
    need(all(isinstance(item, str) for item in ids) and sorted(item for item in ids if isinstance(item, str)) == sorted(task_spec["checks"]), "Include each required check exactly once")
    if "failed" in states:
        need(status == "failed", "Failed check requires failed task")
    if status in ("not_run", "unsupported"):
        need(all(value == "unverified" for value in states) and t.get("execution_started") is False, "Unexecuted task cannot claim assessed checks or execution")
    if status == "partial":
        need(t.get("execution_started") is True and bool(evidence) and "unverified" in states, "Partial requires observed progress and an unverified check")

    tools = array(t.get("tools_used"), "tools_used")
    need(all(isinstance(item, str) for item in tools), "Tool names must be strings")
    if t.get("execution_started") and not tools:
        need(text(t.get("disclosure_note")), "Explain unavailable/withheld tool identifiers")
    caps = obj(t.get("capabilities"), "capabilities")
    for key in CAPABILITIES:
        cap = obj(caps.get(key), "capabilities." + key)
        need(choice(cap.get("status"), {"observed", "unverified", "unavailable", "not_applicable"}), "Invalid capability status: " + key)
        for field in ["mode", "label"]:
            need(cap.get(field) is None or isinstance(cap[field], str), f"{key}.{field}: string or null required")
        refs(cap.get("evidence_ids"), "capabilities." + key, cap.get("status") == "observed")
        if key == "skills" and cap.get("status") == "observed":
            need(cap.get("mode") == "native", "Document reading is not native skill loading")
    if "playbook-loaded" in ids:
        for raw in checks:
            if isinstance(raw, dict) and raw.get("id") == "playbook-loaded" and raw.get("status") == "passed":
                skill = obj(caps.get("skills"), "skills")
                need(skill.get("status") == "observed" and skill.get("mode") == "native", "Native skill loading evidence required")

    metrics = obj(t.get("metrics"), "metrics")
    keys = ["active_duration_ms", "elapsed_duration_ms", "tool_calls", "input_tokens", "output_tokens"]
    for key in keys:
        value = metrics.get(key)
        number = type(value) in (int, float) and math.isfinite(value) and value >= 0
        need(key in metrics and (value is None or number and (key.endswith("_ms") or type(value) is int)), "Invalid/missing metric: " + key)
    if any(metrics.get(key) is not None for key in keys):
        need(text(metrics.get("source")), "Measured metrics need a source")
    active, elapsed = metrics.get("active_duration_ms"), metrics.get("elapsed_duration_ms")
    if type(active) in (int, float) and type(elapsed) in (int, float):
        need(elapsed >= active, "Elapsed duration cannot be shorter than active duration")
    follow = obj(t.get("follow_up"), "follow_up")
    need(type(follow.get("required")) is bool, "follow_up.required must be boolean")
    deadline = stamp(follow.get("deadline_at"), "follow_up.deadline_at")
    if status in ("pending", "awaiting_user"):
        need(follow.get("required") is True and text(follow.get("next_action")), "Unfinished task needs follow-up")
    if status == "pending" and task_id in SCHEDULE_TASKS:
        need(deadline is not None, "Pending schedule needs an observation deadline")
    if status == "passed":
        need(bool(states) and all(value == "passed" for value in states), "Full pass requires all checks")
        need(t.get("execution_started") is True and text(t.get("answer")) and bool(evidence), "Full pass requires execution, answer and evidence")
        need(follow.get("required") is False, "Full pass cannot have required follow-up")
        for key in task_spec["required_inputs"]:
            value = inputs.get(key)
            need(text(value) and not any(marker in value for marker in ["[run_id]", "{run_id}", "[product", "FIXTURE_BASE_URL"]), "Resolve required task input: " + key)
            if key in ("product_url", "fixture_base_url") and text(value):
                target = urlsplit(value)
                need(target.scheme in ("http", "https") and bool(target.netloc), "Invalid target URL: " + key)
        for key, modes in task_spec["required_capabilities"].items():
            cap = obj(caps.get(key), key)
            need(cap.get("status") == "observed" and choice(cap.get("mode"), set(modes)), "Required native capability not observed: " + key)
        budget, limit, calls = config.get("active_timeout_seconds_per_task"), config.get("max_tool_calls_per_task"), metrics.get("tool_calls")
        if type(active) in (int, float) and type(budget) is int:
            need(active <= budget * 1000, "Active budget exceeded")
        if type(calls) is int and type(limit) is int:
            need(calls <= limit, "Tool budget exceeded")

    if task_id in SCHEDULE_TASKS:
        s = obj(t.get("schedule"), "schedule")
        dates = {key: stamp(s.get(key), "schedule." + key) for key in ["created_at", "original_due_at", "due_at", "source_observed_at", "delivered_at", "cancelled_at", "observation_through"]}
        refs(s.get("evidence_ids"), "schedule.evidence_ids", status == "passed")
        need(type(s.get("observation_complete")) is bool, "schedule.observation_complete must be boolean")
        if status == "passed":
            need(text(s.get("timezone")) and s.get("timezone") == config.get("timezone"), "Schedule timezone must match run_config")
            need(s.get("observation_complete") is True, "Observation window not complete")
            created, due = dates["created_at"], dates["due_at"]
            need(created is not None and due is not None and due > created, "Valid creation and due times required")
            if task_id in ("reminder-delivery", "scheduled-research"):
                delivered = dates["delivered_at"]
                key = "reminder_delivery_tolerance_seconds" if task_id == "reminder-delivery" else "research_delivery_tolerance_seconds"
                tolerance = config.get(key)
                need(delivered is not None, "Actual delivery timestamp required")
                if due and delivered and type(tolerance) is int:
                    need(due <= delivered <= due + timedelta(seconds=tolerance), "Delivery outside due window")
                if task_id == "reminder-delivery" and due and type(tolerance) is int:
                    observed = dates["observation_through"]
                    need(observed is not None and observed >= due + timedelta(seconds=tolerance), "Incomplete duplicate-delivery observation")
                if task_id == "scheduled-research":
                    fresh = dates["source_observed_at"]
                    need(due is not None and fresh is not None and delivered is not None and due <= fresh <= delivered, "Fresh source observation after due and before delivery required")
            else:
                original, cancelled, observed = dates["original_due_at"], dates["cancelled_at"], dates["observation_through"]
                need(original is not None and due is not None and original != due, "Distinct original and revised due times required")
                need(cancelled is not None and created is not None and original is not None and due is not None and created <= cancelled < min(original, due), "Cancel before both due times")
                grace = config.get("cancel_observation_grace_seconds")
                if original and due and type(grace) is int:
                    need(observed is not None and observed >= max(original, due) + timedelta(seconds=grace), "Cancellation observation window incomplete")
                need(dates["delivered_at"] is None, "Cancelled reminder was delivered")
    elif task_id == "memory-followup":
        memory = obj(t.get("memory"), "memory")
        refs(memory.get("evidence_ids"), "memory.evidence_ids", status == "passed")
        if status == "passed":
            need(text(memory.get("initial_session")) and text(memory.get("recall_session")) and memory["initial_session"] != memory["recall_session"], "Distinct initial and recall sessions required")
            need(memory.get("same_environment") is True and memory.get("isolated") is True, "Same environment and isolated memory required")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--check-files", action="store_true")
    parser.add_argument("--task-spec", type=Path, default=Path(__file__).resolve().parents[1] / "assets/task.json")
    args = parser.parse_args()
    try:
        report = json.loads(args.report.read_text())
        spec = json.loads(args.task_spec.read_text())
        errors = validate(report, args.report.parent if args.check_files else None, spec)
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, f"Invalid report: {error}\n")
    if errors:
        parser.exit(1, "\n".join(errors) + "\n")
    task = report["tasks"][0]
    print("Structure valid. Actual evidence still needs independent review.")
    print(json.dumps({"task_id": spec["task_id"], "status": task["status"], "provisional": task["status"] in ("pending", "awaiting_user")}, indent=2))


if __name__ == "__main__":
    main()
