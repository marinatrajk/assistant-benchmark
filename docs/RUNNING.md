# Operator guide

## Run one task

1. Pick a skill from [the task catalog](SKILLS.md). Download that task's ZIP from a matching release, or build the archives with `python3 scripts/package_skills.py`. Record the commit, skill version and package hash.
2. Start a fresh conversation in the assistant being evaluated. Attach the individual ZIP and send its `INVOCATION.txt`, or use its supported native skill interface. If ZIPs are unsupported, extract and provide that folder's files. Reading an assignment as a document does not itself establish native workflow skill loading.
3. Supply the required inputs and use the same task brief, limits and environment across compared runs. Checkout and scheduled research accept an exact product URL and variant directly. They do not automatically run purchase research. The expense skill includes its CSV. The video skill includes both source URLs and a shared 20-minute/120-call attempt budget.
4. Collect the single-task result JSON, actual evidence and output files. Keep required future events and operator turns pending; update the same report when evidence arrives. Memory follow-up requires a genuinely fresh conversation without the seed/update transcript or report.
5. Validate using the script inside the selected skill, then independently inspect the evidence. For example:

```sh
python3 skills/benchmark-checkout-handoff/scripts/validate_report.py /path/to/assistant-benchmark-checkout-handoff-results.json --check-files
```

Each report includes only its own task. The package's `references/operator-turns.md` describes the change/cancel or memory follow-up phases where relevant. Use a new run ID for a repeat and keep the previous attempt.

Maintainers can regenerate task folders from the frozen task sheets, new protocols in `benchmarks/protocols/`, catalog and shared validator with `python3 scripts/build_task_skills.py`. The repository checker verifies that committed task packages match those sources. `python3 scripts/package_skills.py --include-legacy` also reproduces the historical archives.

## Historical Everyday pilot

1. Use the original v0.1.0 release assets, or build the frozen ZIPs with `python3 scripts/package_skills.py --include-legacy`. Record the repository commit, suite version and manifest.
2. Start a fresh conversation in the assistant you want to evaluate. Attach `paces-everyday.zip` and send its `INVOCATION.txt`. If ZIPs are unsupported, extract the package and supply its files through the assistant's supported document or skill interface.
3. Use the same `assets/run-config.json` and task brief across participants. Record the date, reset state, permissions and changes. The default six tasks exclude the separate memory scenario.
4. Keep the initial reminder and price-check notifications, with platform timestamps. A provisional report is expected while future events remain pending.
5. Complete the separate change/cancel sequence below. Missing these turns means that scenario was not evaluated.
6. Collect the final report, evidence and actual expense artifact. Keep an immutable private copy before making redactions for publication.
7. Validate the report from the directory containing its evidence:

```sh
python3 benchmarks/legacy/paces-everyday/scripts/validate_report.py /path/to/paces-everyday-results.json --check-files
```

Validation is only a structural check. Apply the task criteria to the observed behavior and document disagreements with the self-score.

### Change/cancel operator turns

The initial invocation asks the assistant to create a test reminder and wait. After its creation acknowledgment, send a **new message** identifying that exact benchmark reminder:

> Change the “Paces [actual run ID] — test reminder to cancel” reminder to 25 minutes from now. Confirm the new due time and that exactly one matching reminder is active.

After the update acknowledgment, send another message:

> Cancel that benchmark reminder. Confirm it is inactive or absent, without changing any other reminder.

Replace the run ID yourself. Record the original and revised due times, cancellation evidence, and observe the channel through the later due time plus two minutes. Do not preemptively combine these turns or grade cancellation from acknowledgment alone.

### Checkout and memory

Checkout stops at visible payment fields with a secure user handoff. Never place an order or enter payment credentials for this test. If login, delivery information or another prerequisite blocks progress, retain that checkpoint and mark required user input. Use the same product and merchant across runs if you want to isolate checkout performance; otherwise disclose the difference.

Memory-followup requires a separate conversation with only the synthetic persona identifier and recall request. Do not paste the answer key or previous transcript into it. Follow the exact scenario's isolated memory rules.

## Original portable suite

Use `benchmarks/legacy/paces-benchmark/START-HERE.txt` and its invocation. The historical invocation includes the public fixture URL used in the pilot. You can instead host the included `fixtures/` directory as its own static site, or run the local ledger-backed fixture server:

```sh
python3 benchmarks/legacy/paces-benchmark/scripts/serve_fixtures.py --port 4320 --output ./fixture-evidence
```

Use a new empty output directory each run. Send the generated `fixture-evidence/invocation.txt`, which contains the actual randomized local URL. Cloud browsers cannot reach a server on your laptop at `127.0.0.1`.

For a static local preview:

```sh
python3 -m http.server 4321 --bind 127.0.0.1 --directory fixtures
```

Record `public_static` or `local_server` in the report. Static form receipts are generated in the browser and have no server ledger; a code alone does not prove execution. The ledger is for the reviewer, not a source the evaluated assistant may read for answers. The fixture source is open for transparency, but source inspection is prohibited during a measured browser task.

```sh
python3 benchmarks/legacy/paces-benchmark/scripts/validate_report.py /path/to/paces-results.json
```

## Record limitations

Keep unavailable identity/settings null. Separate native skill loading from reading a document. Do not install capabilities mid-run or replace missing tools with this project's harness. Use a new run ID for a repeat and retain unsuccessful attempts. Never publish raw private records simply to make a result look more complete.

## Search-intent cases

Catalog version 1.1.0 includes 15 new cases covering the [search-intent categories](USE_CASES.md). Select a skill from [the catalog](SKILLS.md), supply its bundled fixtures and resolve any required null input before execution. Follow the exact initial request, retain the initial output, then send the task sheet's change request as a separate user turn. A full pass needs both phases. Tutoring also requires actual learner replies; workflow automation requires an isolated CRM and failure controls; image editing requires licensed originals; local deployment requires a specified stack and an operator-controlled machine.

Use the [reviewer guide](../benchmarks/reviewer/search-intents.md) to check actual outputs, formulas, persisted state and revisions. Reviewer answers are public but excluded from agent ZIPs; record prior exposure and declare variants consistently. Record plan, paid extras, elapsed/active time and interventions. Package validation does not run these benchmarks or award assistant passes.
