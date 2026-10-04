# Teach and adapt to misconceptions

Category: **Students / learning**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `adaptive-tutoring`.

## Scope and setup

A human operator supplies the learner turns. This case measures accurate adaptive tutoring; learning gains require an actual learner and an independent pre/post assessment.

- `input_file`: `assets/input.json`.
- `learner_session`: operator must supply this before execution.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Teach me how to solve the linear equations in the supplied starter sheet. First ask for my answers without revealing the solutions. After I reply, identify my mistakes, explain the relevant ideas and give two fresh practice questions. Keep each explanation short and adapt to the mistakes I actually made.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> I still think 2(x + 3) = 14 gives x = 10. Explain what went wrong, ask one transfer question, then wait for my answer and grade it with a reason.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `diagnosis` | The tutor waits for actual learner answers and accurately identifies the observed mistakes without inventing a learner response. |
| `correctness` | Worked explanations, solutions and grading are mathematically correct and match each equation. |
| `adaptation` | Follow-up explanation and practice address the specific misconception, including distribution over parentheses. |
| `interaction` | The tutor asks fresh practice/transfer questions, waits for answers and gives reasoned feedback rather than completing both sides of the conversation. |
| `evidence` | Retain the real interaction and independent solution checks. Record transfer performance separately; a simulated learner is not evidence that a person learned. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
