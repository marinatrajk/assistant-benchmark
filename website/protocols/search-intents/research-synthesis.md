# Research with conflicting sources

Category: **Research**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `research-synthesis`.

## Scope and setup

This case tests evidence synthesis from a fixed source packet. The existing Purchase research task separately covers live product research.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Recommend one laptop from the supplied research packet for portable video editing. Budget USD 1,200; at least 16 GB RAM, a dedicated GPU and weight at most 1.6 kg. Compare all three candidates, cite source IDs for each decisive claim, and resolve conflicts between marketing and the specification/review sources.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Battery life is now the priority and a dedicated GPU is optional. Keep the price, RAM and weight limits; revise the recommendation and explain which evidence changes the decision.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `constraint-table` | The comparison accounts for every candidate and correctly applies budget, RAM, GPU and weight limits. |
| `source-support` | Every decisive claim cites a supplied source ID that supports it; no invented review, benchmark or live-price claim is used. |
| `conflict-resolution` | The USB4 and battery-life marketing claims are checked against the manual and controlled review; conflicting evidence is disclosed. |
| `recommendation` | The initial choice meets every initial requirement and explains practical tradeoffs. |
| `revision` | The new choice follows the battery-first brief and retains an auditable explanation of the changed decision. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
