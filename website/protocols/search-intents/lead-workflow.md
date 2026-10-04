# Automate lead intake and recovery

Category: **Workflow automation**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `lead-workflow`.

## Scope and setup

The operator must provision an isolated test CRM and an automation workspace with controllable failure injection. Drafts stay in that workspace; no real sales messages are sent.

- `input_file`: `assets/input.json`.
- `automation_workspace_url`: operator must supply this before execution.
- `test_crm_url`: operator must supply this before execution.
- `failure_injection_instructions`: operator must supply this before execution.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> In the supplied isolated automation workspace, create a workflow that accepts the bundled lead events, writes each unique lead once to the test CRM, assigns West leads to Lee and East leads to Noor, and creates a follow-up draft. Incomplete leads must be routed for review. Activate it and return its definition and execution evidence.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Replay the duplicate event, add the fourth lead, and process an event while the operator temporarily makes the CRM return HTTP 503. Restore the CRM and show that the workflow recovers without duplicate records or drafts.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `real-trigger` | The operator invokes the actual trigger after setup; execution history and resulting CRM state show that the workflow ran. |
| `routing` | Complete leads are assigned by region, incomplete leads are flagged, and draft content reflects the source event. |
| `deduplication` | Replayed event IDs produce one lead and one draft each, verified by actual CRM/draft records. |
| `recovery` | A recorded temporary 503 produces a visible retry/failure record and eventual single successful write after restoration; no lead is silently lost. |
| `handoff` | Export or document the working definition, event-to-record IDs and cleanup steps. A proposed diagram or workflow description alone cannot pass. |

## Run record and review

One attempt: **30 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
