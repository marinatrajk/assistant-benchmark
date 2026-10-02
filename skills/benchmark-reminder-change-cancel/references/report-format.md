# Single-task report

Use assets/report-template.json and write the result filename named in assets/task.json. Include only this task in tasks and task_ids_requested. The standalone format is assistant-benchmark-tasks-v1, version 1.0.0; source_protocol records the frozen protocol from which the task was extracted. It is not a full legacy suite report.

Choose a unique run_id. Keep suite_id, suite_version, skill_name, report_scope and source_protocol unchanged. Record operator_label separately from disclosed harness metadata; hidden model, harness and settings remain null, with model_source unknown. Record environment, actual task_inputs, run_config, deviations and timestamped evidence. ISO timestamps need explicit UTC offsets. Keep review_status unreviewed; an independent reviewer adds reviewer and review_notes when changing it to reviewed.

## Task outcome

Retain every required check ID from assets/task.json exactly once. A check is passed, failed or unverified, and passed/failed checks cite evidence_ids. Evidence entries have a unique id, kind (observation, screenshot, trace, artifact or operator_attestation), summary, provenance (agent_export, operator or platform), ref and/or an actual excerpt, and observed_at when available. Use bundle-relative files or accessible HTTPS references. Do not include private credentials, card data or unrelated conversations.

Outcome statuses:
- passed: every required check has evidence and no required follow-up remains.
- partial: observed progress with an unverified outcome or missing evidence.
- failed: observed incorrect behavior, confirmed missed deadline or exhausted measured budget.
- blocked: an existing capability is prevented by access, setup or permissions.
- unsupported: the needed capability is absent.
- pending: a future event or observation window is incomplete.
- awaiting_user: a prerequisite input/takeover or required operator turn is outstanding.
- not_run: no attempt was assigned or started.

Set execution_started only when an actual task action occurred beyond capability/setup inspection. Give the actual final answer and explain any result other than passed. Never turn a missing observation into an invented failure or claim a pass from a promise.

For checkout-handoff, reaching the actual payment step and supplying the usable secure handoff completes the assigned task when all checks are supported. The user paying later is outside the benchmark; do not keep it awaiting_user for payment. An earlier handoff for address, login or another prerequisite stays awaiting_user/blocked and does not establish a full payment-step outcome.

## Capabilities and measurements

For browser, computer, memory, scheduling and skills, use observed, unverified, unavailable or not_applicable. An observed capability needs evidence_ids; mode and label can remain null when withheld. Browser modes are dom, visual or mixed; actual desktop input is native; durable memory is native or native_file; actual scheduling and skill loading are native. Document reading is not native skill loading. The benchmark assignment itself is not proof that a separate workflow skill was selected. The portable research, memory-update and Calculator tasks retain their native playbook-loaded check; other tasks record skill use separately from task success.

tools_used contains actual disclosed names; if unavailable, leave it empty and explain in disclosure_note while retaining sanitized action/results evidence. Never infer the backend model or tool names.

Metrics are active_duration_ms, elapsed_duration_ms, tool_calls, input_tokens and output_tokens, plus source. Leave unobservable values null. Exclude setup/seed and report writing from active timing; exclude waiting for user turns or scheduled events from active time, but include waiting in elapsed time. State boundaries and unavailable enforcement in source/deviations. Count recovery inside the same attempt. Defaults and overrides are recorded in run_config. Use a new run ID for another attempt and retain the original attempt.

## Deferred scenarios

pending or awaiting_user needs follow_up.required true and a concrete next_action. A pending schedule needs a known observation deadline. Save a provisional report and return control; update the same report after user turns or observations. A full pass has follow_up.required false.

Scheduling reports retain created_at, original_due_at, due_at, source_observed_at, delivered_at, cancelled_at, observation_through, observation_complete, timezone, job_id (nullable) and evidence_ids. The task sheet defines which fields apply. Creation is not delivery. On-time delivery must be at or after due and inside the configured tolerance. Cancellation needs evidence through both due times, plus grace; acknowledgment alone is insufficient. Record notification and source times separately. If exact receipt seconds are unavailable, retain the timestamp precision and mark unresolved timing checks unverified rather than inventing seconds.

memory-followup retains initial_session, recall_session, same_environment, isolated and evidence_ids. A full pass requires distinct sessions in the same environment, isolated durable memory retrieval, the updated preference and its application. Keep seed/update evidence out of the fresh recall context.

Validate with `python3 scripts/validate_report.py PATH_TO_RESULTS.json --check-files` if execution is available; otherwise state that validation was unavailable. File checks resolve local evidence inside the report bundle and never fetch remote links. Validation checks consistency and timing gates, not evidence authenticity, source accuracy, arithmetic or privacy. Independent review must inspect the actual artifacts.
