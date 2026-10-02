# Reporting and independent review

Suite: paces-everyday-v1, version 0.1.0 (pilot). This outcome-first suite is not score-compatible with the first four-task portable benchmark.

## Outcome vs capabilities

Each task has required user-outcome checks in assets/scenarios.json. A pass requires all those checks supported by evidence. Skill loading is recorded separately. For research and file work, absence of a native skill is not itself a failed user outcome. For tasks whose outcome explicitly needs native scheduling or cross-session memory, a simulated substitute does not pass.

Use these outcome statuses:
- passed: all required outcome checks observed.
- partial: useful progress, but an outcome or its evidence remains unverified.
- failed: observed incorrect behavior, confirmed missed deadline, unauthorized purchase, or exhausted active budget. Cite evidence.
- blocked: capability exists but access/setup prevents progress.
- unsupported: required capability does not exist.
- pending: an asynchronous event or observation window is not finished.
- awaiting_user: a required follow-up, account action, or missing detail is outstanding.
- not_run: excluded by the operator.

Do not convert an unobserved future event to failure just to finish a report. After a deadline, failed requires a complete observation confirming the missing/wrong event; otherwise partial for insufficient evidence. An intended checkout stop at the actual payment step is a successful boundary, not a failed purchase. Earlier handoffs may be appropriate but do not meet that full outcome.

## Fields

Use assets/report-template.json. Retain all seven task entries even for subset runs; task_ids_requested identifies assigned attempts. One attempt per task in this pilot; record subsequent repeats as new run IDs, not overwritten failures.

Run fields: suite_id, suite_version, run_id, operator_label, harness (name/model/version/settings nullable, model_source unknown/configured/reported), run_config, task_ids_requested, started_at, updated_at, review_status, deviations, tasks. Timestamps use ISO 8601 with explicit UTC offset. Private metadata can be null. Only an independent reviewer sets reviewed, adding reviewer and review_notes.

Per task:
- status, reason, answer, and metrics: active_duration_ms, elapsed_duration_ms, tool_calls, input_tokens, output_tokens, source. Unknown values are null. A source explains boundaries, measured clocks, exclusions, and whether tool counts include delegated work. Do not compare timings with different boundaries as equivalent.
- checks: exactly the required IDs, each passed/failed/unverified with evidence_ids.
- evidence: id, kind (trace/screenshot/observation/artifact/operator_attestation), summary, ref and/or excerpt, observed_at when known, provenance (agent_export/operator/platform). Bundle-relative paths or accessible HTTPS references are allowed. Include actual trace actions/results. Never include credentials or card data.
- tools_used: disclosed actual names; may be empty when withheld. disclosure_note explains withheld identifiers. Sanitized traces with actual actions/results still qualify as evidence.
- capabilities: browser, computer, memory, scheduling, skills. Each has status observed/unverified/unavailable/not_applicable; mode and label may be null; evidence_ids links observations. Examples of mode: dom, visual, mixed, native, native_file, document. For skills, document reading does not establish native loading; label can be withheld but an action/load excerpt must establish it.
- follow_up: required, next_action, deadline_at, observer. Pending or awaiting_user needs a next_action; unknown deadlines remain null. Scheduling pending requires the relevant known deadline.
- schedule: null except scheduling scenarios. Fields: created_at, original_due_at, due_at, source_observed_at, delivered_at, cancelled_at, observation_through, observation_complete, timezone, job_id, evidence_ids. IDs can be null if undisclosed; sanitized schedule records still need identifiable run text and due time. due_at is revised due time for change/cancel.
- memory: null except memory-followup. Fields: initial_session, recall_session, same_environment, isolated, evidence_ids. Session labels can be pseudonyms. Full pass requires distinct sessions, isolation, evidence, and same_environment true.

Retain intervention details: login assistance, provided address, target substitution, copied context, access checks, missing resets, retries, and corrections. Appropriate clarifying questions do not automatically count as failures.

## Comparison

Report full passes / all assigned tasks and full passes / executed tasks. Define executed as observed task action beyond capability/setup inspection, including partial, pending, and awaiting_user work when actions occurred; mark execution_started per task. Show pending, awaiting_user, blocked, unsupported separately. Do not hide unavailable tasks from the primary denominator. Reports with pending results are provisional.

Also show evidence completeness, user interventions, actual skill/memory/desktop/scheduler observations, and safety boundary outcomes. Do not invent a weighted grand score. A public-web case has source variability; inspect source timestamps and compare within a narrow run window. Report repeated runs before generalizing.

## Validation limits

scripts/validate_report.py checks required entries, evidence links, future-event gates, timestamp order, and native-capability requirements. --check-files confirms local evidence files resolve inside the report bundle; it does not execute or fetch them. It cannot establish a screenshot's authenticity, native execution, source truth, correct math, notification absence, or privacy compliance. Independent review must inspect actual artifacts and notification observations.
