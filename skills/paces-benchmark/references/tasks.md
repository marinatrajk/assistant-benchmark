# Task suite: paces-portable-v1

Use the fixture base URL exactly as supplied, without a trailing slash. For the hosted pages it is the site origin; for the local Python fixtures it ends in `/case/<case-id>`. Both provide `/form` and `/plans` (a trailing-slash redirect is acceptable). Preserve task prompts and budgets across harnesses. This portable suite is a new version of the Paces starter tasks: it uses a dynamic form receipt, a synthetic memory persona, and evidence-aware checks. Do not silently merge its scores with the older in-app suite.

Every required check below has a stable ID for the result file. Do not assume an answer because another run succeeded.

## 1. browser-form

Prompt: Open `{fixture_base_url}/form`. Fill in the contact form with name Ada Lovelace, email ada@example.com, and topic Research. Submit it, then report the confirmation code shown on the page.

Required checks:
- `form-values`: Observed submission contains all three requested values.
- `browser-interaction`: The action trace shows actual browser field entry, topic selection, and submission.
- `receipt-observed`: Capture the confirmation page and report its observed receipt code. The code is generated on successful submission; do not guess it. The hosted static form validates in the browser; capture its confirmation and the action trace. Local-server mode also has an operator receipt ledger.

Save the submission/confirmation observation, screenshot if supported, and final answer. This form belongs to the benchmark and sends no external message. Use only the fixture form, not a real contact form.

## 2. browser-research

Prompt: Use a relevant skill from your own existing skill library for browser research to compare the three plans at `{fixture_base_url}/plans`. Which is the cheapest plan with at least 10 projects? Give its monthly price and cite the page.

Required checks:
- `playbook-loaded`: Native skill-load event for a relevant skill from the harness's own library, including its name. A document read alone is unverified for this check.
- `source-observed`: A browser observation of the actual page, including prices and project limits.
- `correct-choice`: The answer selects the cheapest qualifying plan and the correct monthly price, supported by the observation.
- `source-cited`: The final answer cites the exact visited plans URL.

Do not use a search snippet or fixture source code as page evidence. Record how each plan meets or misses the constraint.

## 3. memory-update

Setup outside task timing: use the synthetic persona `paces-test-{run_id}` in an isolated namespace. Seed exactly one preference: “The benchmark persona prefers Python as their programming language.” Save proof of the seed. Reset only this benchmark namespace for each repetition. Use the harness's own existing memory capability, including its established file-backed memory if applicable. Do not implement a replacement memory store. If the capability is absent, report unsupported; if it exists but cannot isolate benchmark data from real user preferences, report blocked.

Prompt: What is the benchmark persona's preferred programming language? Remember that they now prefer TypeScript instead. Use a relevant memory/preference skill from your own existing skill library.

Required checks:
- `playbook-loaded`: Evidence that a relevant existing skill was loaded through the harness's normal skill mechanism, including its name. A document read alone is unverified.
- `prior-retrieved`: An actual memory search/read retrieves the seeded preference.
- `current-updated`: A durable write updates the original preference to TypeScript without retaining a conflicting current preference.
- `readback-verified`: A subsequent search/read confirms the resulting state and identifies the original entry or file.

The report must include the seed, before/after content, IDs or file paths, and readback evidence. “TypeScript (previously Python)” is compatible with a successful update; a historical mention alone is not a contradiction. A current “prefers Python” entry alongside a current “prefers TypeScript” entry fails. If all relevant current entries cannot be inspected, mark the no-conflict assessment unverified rather than asserting it.

This tests read/write/update in a run, not recall across sessions or long-term retention. A new session is needed for a separate persistence benchmark.

## 4. computer-calculator

Prompt: Use a relevant desktop workflow skill from your own existing skill library. Open the operating system's Calculator app, calculate 137 × 29 using that app, inspect the displayed result, and report it. Do not edit other apps or files.

Required checks:
- `playbook-loaded`: Evidence that a relevant existing skill was loaded through the harness's normal skill mechanism, including its name. A document read alone is unverified.
- `desktop-input`: Trace shows opening Calculator and entering the expression with desktop input tools.
- `display-observed`: Screenshot or native accessibility observation shows Calculator's result after input.
- `answer-matches`: Final answer matches the displayed result and the requested multiplication.

Record the OS and Calculator app used. If no desktop tools exist, report unsupported. If tools exist but permissions or Calculator availability prevent execution, report blocked. A correct number alone is insufficient evidence of computer use. Verification may independently check arithmetic after the desktop attempt, but code execution must not replace the app workflow.
