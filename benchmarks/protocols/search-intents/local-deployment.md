# Run an assistant offline

Category: **Run locally / self-hosted**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `local-deployment`.

## Scope and setup

The operator selects and provisions an isolated local machine and an installable assistant stack. Hosted-only products may be unsupported. Network isolation applies only to the benchmark runtime, and is performed by the operator.

- `target_stack_and_version`: operator must supply this before execution.
- `model_and_digest`: operator must supply this before execution.
- `test_machine`: operator must supply this before execution.
- `offline_control_and_measurement`: operator must supply this before execution.
- `input_file`: `assets/expenses.csv`.
- `second_input_file`: `assets/expenses-revised.csv`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Install the exact assistant stack, version and model specified by the operator on the supplied test machine. Record dependencies and model digest. After setup, the operator will disable outbound networking for that isolated runtime. Use the running local assistant to reconcile the supplied CSV and produce a usable output file. Record startup steps, runtime and peak memory.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Restart the isolated runtime while it remains offline, then process the second supplied CSV. Show that the assistant still works and report any persistence or setup problems.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `reproducible-setup` | The exact stack/model versions, file digests, machine/OS details and startup commands are recorded; the reviewer can reproduce startup. |
| `offline-execution` | Operator network controls and traffic observations establish that the measured task ran without outbound access. A statement that it is local is insufficient. |
| `correct-output` | The local assistant actually processes each CSV and produces correct row counts, refund treatment and totals in usable files. |
| `resource-record` | Record measured runtime and peak memory with their measurement methods; leave unavailable measurements explicitly unknown. |
| `restart` | The second offline run succeeds after a restart using the existing installation, with separate observed logs and the revised CSV result. |

## Run record and review

One attempt: **30 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
