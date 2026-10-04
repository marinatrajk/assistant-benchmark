# Build a working booking website

Category: **Build a website**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `website-booking`.

## Scope and setup

Build a real application for the supplied fictional business. Use only synthetic customer details during verification.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Build a mobile-friendly site for the synthetic dog groomer in the input file. Include services, prices and a booking form. Validate required fields, show a confirmation, and provide a staff view that displays saved bookings after reload and from another browser session. Deliver a working preview and source/export.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Add the new Puppy introduction service: 20 minutes, USD 25. Update the booking flow and staff view while preserving existing bookings.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `content-layout` | Services, prices and opening hours match the brief. Operator checks usable navigation and form layout at 390px and 1440px widths. |
| `form-validation` | Empty name, invalid email, missing service and appointments outside opening hours are rejected with usable feedback. |
| `booking-state` | A valid submission creates one saved booking with the correct service, price and time. The staff view reflects it after reload and in a second browser session. |
| `revision` | The new service can be booked at USD 25 for 20 minutes; the prior booking remains correct and visible. |
| `handoff` | The preview runs and source/export plus startup instructions are usable; screenshots alone or a static fake confirmation cannot pass. |

## Run record and review

One attempt: **30 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
