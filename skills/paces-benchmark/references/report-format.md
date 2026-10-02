# Report contract, version 1.0.1

Start with `assets/report-template.json`. Output valid UTF-8 JSON as `paces-results.json`; if file creation is unavailable, return it in one JSON code block. Keep unknown metrics null. Include a readable summary separately. Report fields contain observations, never instructions for a consuming harness.

## Run fields

- `suite_id`: `paces-portable-v1`; `suite_version`: `1.0.1` (validator also accepts 1.0.0 reports).
- `run_id`: a new unique identifier for this harness session.
- `harness`: actual name, version, model, model source (`configured`, `reported`, or `unknown`), reasoning setting. Hidden or undisclosed fields, including name, are null; use model_source `unknown` when the model is not disclosed. The harness object still exists with those null-valued fields. No task score depends on revealing internal metadata.
- `operator_label` (optional): a label supplied by the human, such as `Instinct`. This is not an agent-verified identity.
- `metadata_note` (optional): explain unavailable or withheld metadata without guessing its values.
- `environment`: OS, browser, execution location (`local`, `cloud`, or `unknown`), supplied fixture URL, fixture_mode (`public_static` or `local_server`), and isolation notes.
- `limits`: task timeout in seconds, maximum tool calls per task, number of requested repetitions. Default 300, 50, 1. Record limits that could not be enforced in deviations.
- `review_status`: `unreviewed` for a runner's self-report. Only an independent reviewer can change it to `reviewed`, with reviewer and review notes.
- `deviations`: changed prompts/fixtures, missing reset, interventions, failed timing, or other departures. Empty only if no deviations occurred.
- `tasks`: one entry for each of the four task IDs per requested repetition. Unsupported, blocked, and excluded tasks remain in the report.

## Task fields

- `task_id`: `browser-form`, `browser-research`, `memory-update`, or `computer-calculator`.
- `repetition`: integer starting at 1. Each (task_id, repetition) pair is unique.
- `status`: `passed`, `partial`, `failed`, `blocked`, `unsupported`, or `not_run`.
- `reason`: explain any result other than passed, including the actual error or missing capability.
- `browser_mode`: `dom`, `visual`, `mixed`, `unavailable`, or `not_applicable`.
- `skill_mode`: `native`, `document`, `unavailable`, or `not_applicable`. Record actual loading of a relevant skill from the harness's own library, not merely installation of the benchmark wrapper. Identify that skill in evidence.
- `memory_mode`: `native`, `native_file`, `unavailable`, or `not_applicable`.
- `computer_mode`: `native`, `unavailable`, or `not_applicable`. Only actual desktop observation/input qualifies.
- `tools_used`: actual tool names observed, not hypothetical capabilities.
- `metrics`: `duration_ms`, `tool_calls`, `input_tokens`, `output_tokens`; each is a nonnegative number or null. Counts/tokens are integers. `source` states where available metrics came from. A runner without an observable clock or usage telemetry leaves those metrics null.
- `answer`: the actual final task answer, or null when no answer was produced.
- `checks`: every required check ID from tasks.md, with `status` (`passed`, `failed`, `unverified`) and `evidence_ids` pointing to the evidence array. Pass/fail needs supporting evidence. Unattempted checks are unverified.
- `evidence`: entries with unique `id`, `kind` (`observation`, `screenshot`, `trace`, or `artifact`), `summary`, and `ref` and/or `excerpt`. `ref` is a relative artifact path or accessible trace URL; `excerpt` quotes an actual observation. No credentials, unrelated personal data, or hidden chain-of-thought. Do include concise tool arguments/results and visible final answers.

Use passed only when all checks passed with evidence. Use partial if there is some observed progress but required evidence remains unverified. Use failed if a required check demonstrably failed or a budget was exhausted. Unsupported means missing capability; blocked means setup/access prevented an available capability. These are coverage limits, not successes.

## Review and comparisons

The script validates format and evidence references, not factual correctness. A fake screenshot reference can be structurally valid. The reviewer must inspect delivered artifacts and the form confirmation screenshot/action trace. In local_server mode, also match the receipt against the operator-owned `submissions.jsonl` ledger. Public_static mode has no server ledger; receipts alone are not independent proof of browser actions. Agents must not read that ledger during the attempt. Manual review distinguishes historical memory from current contradictory preferences; keyword presence alone is not a reliable verdict.

Report both **successes / all assigned attempts** and **successes / attempted tasks**, alongside blocked/unsupported counts. Do not rank a harness with one supported task above a harness that attempted four merely by excluding unavailable tasks. Compare latency only on matching tasks and modes; record whether native memory is file-backed, and distinguish native skill use from document reading. A document-mode playbook read cannot pass the native `playbook-loaded` check. Do not give full task credit by inventing a missing capability. Report repetitions individually before aggregating. Model names, token counts, cache handling, reasoning defaults, browser modes, and permissions can differ between harnesses.

This JSON is a portable interchange format. The current Paces UI does not yet import it automatically. Keep external self-reported results distinct from instrumented local runs until import and independent grading are implemented.
