# Operator guide

## Everyday pilot

1. Build the ZIPs with `python3 scripts/package_skills.py` or use the matching GitHub release assets. Record the repository commit, suite version and manifest.
2. Start a fresh conversation in the assistant you want to evaluate. Attach `paces-everyday.zip` and send its `INVOCATION.txt`. If ZIPs are unsupported, extract the package and supply its files through the assistant's supported document or skill interface.
3. Use the same `assets/run-config.json` and task brief across participants. Record the date, reset state, permissions and changes. The default six tasks exclude the separate memory scenario.
4. Keep the initial reminder and price-check notifications, with platform timestamps. A provisional report is expected while future events remain pending.
5. Complete the separate change/cancel sequence below. Missing these turns means that scenario was not evaluated.
6. Collect the final report, evidence and actual expense artifact. Keep an immutable private copy before making redactions for publication.
7. Validate the report from the directory containing its evidence:

```sh
python3 skills/paces-everyday/scripts/validate_report.py /path/to/paces-everyday-results.json --check-files
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

Use `skills/paces-benchmark/START-HERE.txt` and its invocation. The historical invocation includes the public fixture URL used in the pilot. You can instead host the included `fixtures/` directory as its own static site, or run the local ledger-backed fixture server:

```sh
python3 skills/paces-benchmark/scripts/serve_fixtures.py --port 4320 --output ./fixture-evidence
```

Use a new empty output directory each run. Send the generated `fixture-evidence/invocation.txt`, which contains the actual randomized local URL. Cloud browsers cannot reach a server on your laptop at `127.0.0.1`.

For a static local preview:

```sh
python3 -m http.server 4321 --bind 127.0.0.1 --directory fixtures
```

Record `public_static` or `local_server` in the report. Static form receipts are generated in the browser and have no server ledger; a code alone does not prove execution. The ledger is for the reviewer, not a source the evaluated assistant may read for answers. The fixture source is open for transparency, but source inspection is prohibited during a measured browser task.

```sh
python3 skills/paces-benchmark/scripts/validate_report.py /path/to/paces-results.json
```

## Record limitations

Keep unavailable identity/settings null. Separate native skill loading from reading a document. Do not install capabilities mid-run or replace missing tools with this project's harness. Use a new run ID for a repeat and retain unsuccessful attempts. Never publish raw private records simply to make a result look more complete.
