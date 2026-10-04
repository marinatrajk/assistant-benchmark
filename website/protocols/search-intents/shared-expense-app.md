# Build a shared expense app

Category: **Build an app**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `shared-expense-app`.

## Scope and setup

This case requires a working multi-user artifact. Operator-created extra users and expense values test behavior beyond the supplied examples.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Build a shared expense tracker for the synthetic users and entries in the input. Two separate user sessions must join one group, add expenses and see the correct balance. A different group must have isolated data. Deliver a running app, source/export and run instructions.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Add the supplied USD 10 refund to Alice’s groceries, then let Bob settle the resulting balance with Alice. Preserve the expense history and make the final balance zero.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `multi-user` | Alice and Bob use distinct sessions and see the same saved group expenses after reload. |
| `arithmetic` | Balances use exact money arithmetic and equal splits; the initial fixture and revised refund/settlement reconcile. |
| `isolation` | A newly created third user/group cannot read or edit the first group through the UI or the exposed data endpoints. |
| `revision` | Refund and settlement entries persist with an audit trail and produce the correct final balance without deleting earlier expenses. |
| `working-delivery` | Reviewer runs the delivered app and repeats the flows; a visual mockup or hardcoded fixture result does not pass. |

## Run record and review

One attempt: **30 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
