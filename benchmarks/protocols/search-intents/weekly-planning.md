# Plan and revise a working week

Category: **Personal assistant**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `weekly-planning`.

## Scope and setup

This case measures weekly planning and calendar-file delivery. Native reminder delivery and durable memory retain their separate existing tests.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Plan the supplied week around fixed appointments, working hours, deadlines, task durations and preferences. Deliver a readable agenda, a structured schedule and an importable calendar file. Keep fixed events intact and leave travel/break buffers.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Move the Monday client call to Tuesday 10:00–11:00 and bring the proposal deadline forward to Tuesday 15:00. Replan unfinished work, preserving completed tasks and stable calendar event IDs.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `feasible-schedule` | All required work fits working hours, durations, fixed events and deadlines without overlap; specified buffers are present. |
| `preferences` | Deep work is placed before noon where feasible and lunch is preserved. Any unavoidable conflict is explicitly explained. |
| `calendar-artifact` | The ICS file imports with correct timezone, starts, ends and stable event UIDs; the structured schedule agrees with it. |
| `revision` | The revised week reflects both changed constraints, retains the completed task and does not duplicate or erase unchanged events. |
| `traceability` | Every task/event ID is accounted for, with initial and revised artifacts and the operator’s import/inspection evidence. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
