# Create an editable board update

Category: **PowerPoint slides**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `board-slides`.

## Scope and setup

The packet is synthetic. Review both the editable artifact and its rendered appearance.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Turn the supplied project packet into exactly six board slides covering the executive summary, milestones, budget, risks, next steps and a decision request. Deliver an editable PPTX and rendered previews. Use accurate charts and concise source notes.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> The forecast total is now USD 170,000 and the requested additional funding is USD 50,000. Update every affected slide and chart while preserving the six-slide structure and editability.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `structure` | Exactly six slides cover the requested topics and make the board decision explicit. |
| `numeric-accuracy` | Budget, actual spend, completion rate and variances reconcile to the packet; charts and prose agree. |
| `editability` | The PPTX opens with editable text and chart data or editable shapes; a deck made solely of flattened slide screenshots cannot pass. |
| `readability` | Rendered slides have readable type, no clipping/overlap and clear chart labels at normal presentation size; operator inspects all six. |
| `revision` | The new forecast and funding request propagate through dependent figures, charts and decision text without stale totals. |

## Run record and review

One attempt: **25 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
