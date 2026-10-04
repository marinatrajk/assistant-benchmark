# Fix a timezone boundary bug

Category: **Coding**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `coding-timezone`.

## Scope and setup

A small standard-library Python repository is bundled. The reviewer uses independent timestamp examples; reading the reviewer answer files is outside the assignment.

- `project_file`: `assets/project/reminders.py`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Fix assets/project/reminders.py so reminder_day returns the calendar date in the requested IANA timezone for an aware ISO timestamp. Treat naive timestamps as invalid. Preserve the function signature and add concise run instructions. Deliver the patched source, not only an explanation.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Add optional keyword argument offset_minutes=0. Apply that offset to the instant before converting to the requested timezone. Keep existing callers working and include examples crossing midnight and a daylight-saving transition.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `initial-correctness` | Reviewer executes the initial source with UTC instants that fall on different local calendar dates in New York and Tokyo; returned ISO dates are correct. |
| `input-contract` | Naive timestamps and unknown timezone names are rejected; aware Z and explicit-offset timestamps work without changing the public function name. |
| `regression` | Unshifted UTC and same-day conversions still work; no hardcoded example answers or dependency on the operator machine timezone. |
| `revision` | The revised function accepts the optional offset, preserves calls without it and applies elapsed minutes before timezone conversion, including DST boundary cases. |
| `usable-code` | Deliver both versions, a reviewable diff and executable instructions. Reviewer runs the code independently and records outputs. |

## Run record and review

One attempt: **25 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
