# Contributing

Issues and pull requests are welcome for test design, clearer evidence, grading corrections, reproducibility, accessibility and code fixes.

## Submit a benchmark run

State the suite/version, package hash or repository commit, assistant label, date/timezone, budgets, permitted capabilities and any operator interventions. Model identity and private settings may remain undisclosed. Include the original self-report and a separate reviewer assessment, with redacted screenshots/traces and usable output files where possible.

Retain unsuccessful attempts and distinguish missing evidence from a failed action. Do not replace an old run with a better repeat. A fresh attempt needs a new run ID. Explain unavailable evidence and any difference from the published protocol, including missed operator turns.

Use the report validators, then review the actual evidence. Do not send API keys, real addresses, personal conversations, session URLs, cookies or unrelated screenshots in an issue or pull request. Use synthetic data wherever possible.

## Change a score

Identify the exact task criterion, the previous assessment, the proposed result and the supporting evidence. State whether the evidence existed during the original run or came from a new attempt. Keep an audit trail in the pull request and Git history. Identity-blinded reviews and independent replications are particularly useful; don't label a review blinded unless it actually was.

## Change the protocol

The original two published packages are frozen pilot versions under `benchmarks/legacy/`. Individual task skills live in `skills/`; see [the task catalog](docs/SKILLS.md). Update their maintained sources in `benchmarks/task-catalog.json`, the shared validator or `scripts/build_task_skills.py`, then regenerate with `python3 scripts/build_task_skills.py`. Changes to measured prompts, criteria or budgets need deliberate versions, updated manifests and comparability notes. Run `python3 scripts/package_skills.py` to verify and package the exact files; `--include-legacy` also reproduces the originals.

## Development checks

Run the repository/source checks and benchmark tests listed in [the CI workflow](.github/workflows/checks.yml). Unit tests use synthetic inputs and mock providers. Browser integration tests use only local fixtures. Native desktop use and real shopping/scheduling require a deliberate operator-run evaluation, not CI.

Explain what changed and how it was verified in the pull request. Contributions of original code/docs are under the project license; identify any third-party material and its rights separately.
