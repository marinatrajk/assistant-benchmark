# 3. memory-update
Setup outside task timing: use the synthetic persona `paces-test-{run_id}` in an isolated namespace. Seed exactly one preference: “The benchmark persona prefers Python as their programming language.” Save proof of the seed. Reset only this benchmark namespace for each repetition. Use the harness's own existing memory capability, including its established file-backed memory if applicable. Do not implement a replacement memory store. If the capability is absent, report unsupported; if it exists but cannot isolate benchmark data from real user preferences, report blocked.

Prompt: What is the benchmark persona's preferred programming language? Remember that they now prefer TypeScript instead. Use a relevant memory/preference skill from your own existing skill library.

Required checks:
- `playbook-loaded`: Evidence that a relevant existing skill was loaded through the harness's normal skill mechanism, including its name. A document read alone is unverified.
- `prior-retrieved`: An actual memory search/read retrieves the seeded preference.
- `current-updated`: A durable write updates the original preference to TypeScript without retaining a conflicting current preference.
- `readback-verified`: A subsequent search/read confirms the resulting state and identifies the original entry or file.

The report must include the seed, before/after content, IDs or file paths, and readback evidence. “TypeScript (previously Python)” is compatible with a successful update; a historical mention alone is not a contradiction. A current “prefers Python” entry alongside a current “prefers TypeScript” entry fails. If all relevant current entries cannot be inspected, mark the no-conflict assessment unverified rather than asserting it.

This tests read/write/update in a run, not recall across sessions or long-term retention. A new session is needed for a separate persistence benchmark.
