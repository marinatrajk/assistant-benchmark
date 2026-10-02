#!/usr/bin/env python3
"""Validate Paces everyday report structure; human evidence review is still required."""
import argparse
from datetime import datetime, timedelta
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKS = json.loads((ROOT / "assets/scenarios.json").read_text())
STATUSES = {"passed", "partial", "failed", "blocked", "unsupported", "pending", "awaiting_user", "not_run"}
SCHEDULE_TASKS = {"reminder-delivery", "reminder-change-cancel", "scheduled-research"}
CAPABILITIES = {"browser", "computer", "memory", "scheduling", "skills"}


def validate(report, evidence_root=None):
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

    def nonempty(value):
        return isinstance(value, str) and bool(value.strip())

    def timestamp(value, label, required=False):
        if value is None and not required:
            return None
        try:
            stamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if stamp.utcoffset() is None:
                raise ValueError("timezone missing")
            return stamp
        except (AttributeError, TypeError, ValueError):
            errors.append(f"{label}: timestamp needs an explicit UTC offset")
            return None

    r = obj(report, "report")
    need(r.get("suite_id") == "paces-everyday-v1", "Unknown suite_id")
    need(r.get("suite_version") == "0.1.0", "Unknown suite_version")
    need(nonempty(r.get("run_id")), "run_id is required")
    harness = obj(r.get("harness"), "harness")
    for key in ["name", "model", "version", "reasoning_setting"]:
        need(key in harness and (harness[key] is None or isinstance(harness[key], str)), f"harness.{key}: string or null required")
    need(harness.get("model_source") in ("unknown", "configured", "reported"), "Invalid model_source")
    need(r.get("review_status") in ("unreviewed", "reviewed"), "Invalid review_status")
    if r.get("review_status") == "reviewed":
        need(nonempty(r.get("reviewer")) and nonempty(r.get("review_notes")), "Reviewed report needs reviewer and review_notes")
    for key in ["started_at", "updated_at"]:
        timestamp(r.get(key), key)
    deviations = array(r.get("deviations"), "deviations")
    need(all(isinstance(x, str) for x in deviations), "deviations must contain strings")
    requested = array(r.get("task_ids_requested"), "task_ids_requested")
    need(bool(requested) and all(isinstance(x, str) and x in CHECKS for x in requested), "Select valid requested task IDs")
    need(len(requested) == len({x for x in requested if isinstance(x, str)}), "Duplicate requested task IDs")
    config = obj(r.get("run_config"), "run_config")
    for key in ["active_timeout_seconds_per_task", "max_tool_calls_per_task", "reminder_delay_minutes",
                "reminder_delivery_tolerance_seconds", "cancel_original_delay_minutes", "cancel_revised_delay_minutes",
                "cancel_observation_grace_seconds", "research_delay_minutes", "research_delivery_tolerance_seconds"]:
        need(type(config.get(key)) is int and config[key] > 0, f"run_config.{key}: positive integer required")
    need(config.get("repetitions") == 1, "Pilot requires one attempt; use new run IDs for repeats")
    need(nonempty(config.get("timezone")), "run_config.timezone is required")
    tasks = array(r.get("tasks"), "tasks")
    seen = []

    for index, raw in enumerate(tasks):
        label = f"tasks[{index}]"
        t = obj(raw, label)
        task_id = t.get("task_id")
        if not isinstance(task_id, str) or task_id not in CHECKS:
            errors.append(f"{label}: unknown task_id")
            continue
        seen.append(task_id)
        label = task_id
        status = t.get("status")
        need(isinstance(status, str) and status in STATUSES, f"{label}: invalid status")
        need(status == "passed" or nonempty(t.get("reason")), f"{label}: reason required")
        need(type(t.get("execution_started")) is bool, f"{label}: execution_started must be boolean")
        if task_id not in requested:
            need(status == "not_run", f"{label}: unrequested task must remain not_run")

        evidence = array(t.get("evidence"), label + ".evidence")
        evidence_ids = []
        for raw_e in evidence:
            e = obj(raw_e, label + ".evidence")
            need(nonempty(e.get("id")), f"{label}: evidence ID required")
            if isinstance(e.get("id"), str):
                evidence_ids.append(e["id"])
            need(e.get("kind") in ("trace", "screenshot", "observation", "artifact", "operator_attestation"), f"{label}: invalid evidence kind")
            need(e.get("provenance") in ("agent_export", "operator", "platform"), f"{label}: evidence provenance required")
            need(nonempty(e.get("summary")), f"{label}: evidence summary required")
            need(nonempty(e.get("ref")) or nonempty(e.get("excerpt")), f"{label}: evidence ref or excerpt required")
            timestamp(e.get("observed_at"), label + ".evidence.observed_at")
            ref = e.get("ref")
            if evidence_root is not None and nonempty(ref):
                if ref.startswith("https://"):
                    continue
                root = Path(evidence_root).resolve()
                candidate = (root / ref).resolve()
                need(candidate.is_relative_to(root) and candidate.is_file(), f"{label}: missing/unsafe local evidence file: {ref}")
        need(len(evidence_ids) == len(set(evidence_ids)), f"{label}: duplicate evidence IDs")

        def refs(value, where, required=False):
            found = array(value, where)
            need(all(isinstance(x, str) and x in evidence_ids for x in found), f"{where}: unresolved evidence IDs")
            if required:
                need(bool(found), f"{where}: evidence required")

        checks = array(t.get("checks"), label + ".checks")
        check_ids, check_statuses = [], []
        for raw_c in checks:
            c = obj(raw_c, label + ".check")
            check_ids.append(c.get("id"))
            check_statuses.append(c.get("status"))
            need(c.get("status") in ("passed", "failed", "unverified"), f"{label}: invalid check status")
            refs(c.get("evidence_ids"), label + ".check.evidence_ids", c.get("status") in ("passed", "failed"))
        need(all(isinstance(x, str) for x in check_ids) and sorted(x for x in check_ids if isinstance(x, str)) == sorted(CHECKS[task_id]), f"{label}: include every required check exactly once")
        if "failed" in check_statuses:
            need(status == "failed", f"{label}: failed check requires failed task")
        if status in ("not_run", "unsupported"):
            need(all(s == "unverified" for s in check_statuses), f"{label}: unexecuted checks must be unverified")
            need(t.get("execution_started") is False, f"{label}: unexecuted task cannot claim execution")
        if status == "partial":
            need(t.get("execution_started") is True and bool(evidence) and "unverified" in check_statuses, f"{label}: partial requires observed progress and an unverified check")

        tools = array(t.get("tools_used"), label + ".tools_used")
        need(all(isinstance(x, str) for x in tools), f"{label}: tool names must be strings")
        if t.get("execution_started") and not tools:
            need(nonempty(t.get("disclosure_note")), f"{label}: explain unavailable/withheld tool identifiers")
        caps = obj(t.get("capabilities"), label + ".capabilities")
        for key in CAPABILITIES:
            cap = obj(caps.get(key), label + ".capabilities." + key)
            need(cap.get("status") in ("observed", "unverified", "unavailable", "not_applicable"), f"{label}: invalid capability status")
            need(cap.get("mode") is None or isinstance(cap.get("mode"), str), f"{label}: capability mode must be string or null")
            need(cap.get("label") is None or isinstance(cap.get("label"), str), f"{label}: capability label must be string or null")
            refs(cap.get("evidence_ids"), label + ".capabilities." + key, cap.get("status") == "observed")
            if key == "skills" and cap.get("status") == "observed":
                need(cap.get("mode") == "native", f"{label}: document reading is not native skill loading")

        metrics = obj(t.get("metrics"), label + ".metrics")
        for key in ["active_duration_ms", "elapsed_duration_ms", "tool_calls", "input_tokens", "output_tokens"]:
            need(key in metrics, f"{label}: missing metric {key}")
            value = metrics.get(key)
            need(value is None or type(value) in (int, float) and math.isfinite(value) and value >= 0 and (key.endswith("_ms") or type(value) is int), f"{label}: invalid metric {key}")
        if any(metrics.get(key) is not None for key in ["active_duration_ms", "elapsed_duration_ms", "tool_calls", "input_tokens", "output_tokens"]):
            need(nonempty(metrics.get("source")), f"{label}: metric source required")
        active, elapsed = metrics.get("active_duration_ms"), metrics.get("elapsed_duration_ms")
        if type(active) in (int, float) and type(elapsed) in (int, float):
            need(elapsed >= active, f"{label}: elapsed duration cannot be shorter than active duration")

        follow = obj(t.get("follow_up"), label + ".follow_up")
        need(type(follow.get("required")) is bool, f"{label}: follow_up.required must be boolean")
        deadline = timestamp(follow.get("deadline_at"), label + ".follow_up.deadline_at")
        if status in ("pending", "awaiting_user"):
            need(follow.get("required") is True and nonempty(follow.get("next_action")), f"{label}: unfinished task needs follow-up")
        if status == "pending" and task_id in SCHEDULE_TASKS:
            need(deadline is not None, f"{label}: pending schedule needs an observation deadline")
        if status == "passed":
            need(check_statuses and all(s == "passed" for s in check_statuses), f"{label}: full pass requires all outcome checks")
            need(t.get("execution_started") is True and nonempty(t.get("answer")) and bool(evidence), f"{label}: full pass requires execution, answer and evidence")
            need(follow.get("required") is False, f"{label}: full pass cannot have required follow-up")
            budget = config.get("active_timeout_seconds_per_task")
            if type(active) in (int, float) and type(budget) is int:
                need(active <= budget * 1000, f"{label}: active budget exceeded")
            calls, limit = metrics.get("tool_calls"), config.get("max_tool_calls_per_task")
            if type(calls) is int and type(limit) is int:
                need(calls <= limit, f"{label}: tool budget exceeded")

        if task_id in SCHEDULE_TASKS:
            s = obj(t.get("schedule"), label + ".schedule")
            dates = {key: timestamp(s.get(key), label + ".schedule." + key) for key in
                     ["created_at", "original_due_at", "due_at", "source_observed_at", "delivered_at", "cancelled_at", "observation_through"]}
            refs(s.get("evidence_ids"), label + ".schedule.evidence_ids", status == "passed")
            if status == "passed":
                cap = obj(caps.get("scheduling"), label + ".scheduling")
                need(cap.get("status") == "observed" and cap.get("mode") == "native", f"{label}: native scheduling evidence required")
                need(nonempty(s.get("timezone")), f"{label}: schedule timezone required")
                need(s.get("observation_complete") is True, f"{label}: observation window not complete")
                created, due = dates["created_at"], dates["due_at"]
                need(created is not None and due is not None and due > created, f"{label}: valid creation and due times required")
                if task_id in ("reminder-delivery", "scheduled-research"):
                    delivered = dates["delivered_at"]
                    need(delivered is not None, f"{label}: actual delivery timestamp required")
                    tolerance_key = "reminder_delivery_tolerance_seconds" if task_id == "reminder-delivery" else "research_delivery_tolerance_seconds"
                    tolerance = config.get(tolerance_key, 0)
                    if due and delivered and type(tolerance) is int:
                        need(due <= delivered <= due + timedelta(seconds=tolerance), f"{label}: delivery outside due window")
                    observed = dates["observation_through"]
                    if task_id == "reminder-delivery" and due and type(tolerance) is int:
                        need(observed is not None and observed >= due + timedelta(seconds=tolerance), f"{label}: incomplete duplicate-delivery observation")
                    if task_id == "scheduled-research":
                        fresh = dates["source_observed_at"]
                        need(due is not None and fresh is not None and delivered is not None and due <= fresh <= delivered, f"{label}: fresh source observation after due and before delivery required")
                else:
                    original, cancelled, observed = dates["original_due_at"], dates["cancelled_at"], dates["observation_through"]
                    need(original is not None and due is not None and original != due, f"{label}: distinct original and revised due times required")
                    need(cancelled is not None and created is not None and original is not None and due is not None and created <= cancelled < min(original, due), f"{label}: cancellation before both due times required")
                    grace = config.get("cancel_observation_grace_seconds", 0)
                    if original and due and type(grace) is int:
                        need(observed is not None and observed >= max(original, due) + timedelta(seconds=grace), f"{label}: cancellation observation window incomplete")
                    need(dates["delivered_at"] is None, f"{label}: cancelled reminder was delivered")
        elif task_id == "memory-followup":
            m = obj(t.get("memory"), label + ".memory")
            refs(m.get("evidence_ids"), label + ".memory.evidence_ids", status == "passed")
            if status == "passed":
                cap = obj(caps.get("memory"), label + ".memory")
                need(cap.get("status") == "observed" and cap.get("mode") in ("native", "native_file"), f"{label}: native durable memory evidence required")
                need(nonempty(m.get("initial_session")) and nonempty(m.get("recall_session")) and m["initial_session"] != m["recall_session"], f"{label}: distinct initial and recall sessions required")
                need(m.get("same_environment") is True and m.get("isolated") is True, f"{label}: same environment and isolated test memory required")

    need(len(seen) == len(set(seen)), "Duplicate task entries")
    need(set(seen) == set(CHECKS), "Include all seven scenario entries")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--check-files", action="store_true")
    args = parser.parse_args()
    try:
        report = json.loads(args.report.read_text())
        errors = validate(report, args.report.parent if args.check_files else None)
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, f"Invalid report: {error}\n")
    if errors:
        parser.exit(1, "\n".join(errors) + "\n")
    assigned = [t for t in report["tasks"] if t["task_id"] in report["task_ids_requested"]]
    passed = sum(t["status"] == "passed" for t in assigned)
    executed = sum(t["execution_started"] for t in assigned)
    print("Structure valid. Actual evidence still needs independent review.")
    print(json.dumps({"passes_over_assigned": [passed, len(assigned)],
                      "passes_over_executed": [passed, executed],
                      "provisional": any(t["status"] in ("pending", "awaiting_user") for t in assigned),
                      "statuses": {s: sum(t["status"] == s for t in assigned) for s in sorted(STATUSES)}}, indent=2))


if __name__ == "__main__":
    main()
