# Individual benchmark skills

Every task is a standalone skill in `skills/`. Each folder includes its own assignment, inputs, limits, evidence checks, one-task report template, validator and invocation. The recipient uses its own tools; these packages do not provide replacement capabilities.

| Skill | What it evaluates | Inputs or follow-up |
| --- | --- | --- |
| [Browser form](../skills/benchmark-browser-form/) | Form entry, submission and observed confirmation | Reachable fixture URL; a public default is included |
| [Browser research](../skills/benchmark-browser-research/) | Plan comparison and native research skill use | Reachable fixture URL; a public default is included |
| [Memory update](../skills/benchmark-memory-update/) | Isolated durable preference retrieval, update and readback | Synthetic persona seeded during setup |
| [Computer Calculator](../skills/benchmark-computer-calculator/) | Actual desktop observation/input and native desktop skill use | Operating system Calculator and desktop tools |
| [Purchase research](../skills/benchmark-purchase-research/) | Current product sources, constraints and recommendation | Included charger brief, or an operator-supplied replacement |
| [Checkout handoff](../skills/benchmark-checkout-handoff/) | Exact guest cart, payment checkpoint and secure handoff | Exact product URL and variant; no purchase |
| [Reminder delivery](../skills/benchmark-reminder-delivery/) | Actual delivery, timeliness and absence of duplicates | One native reminder, then notification observation |
| [Reminder change/cancel](../skills/benchmark-reminder-change-cancel/) | Updating one reminder, cancelling it and absence of late delivery | Separate create, change and cancel user turns |
| [Scheduled research](../skills/benchmark-scheduled-research/) | Fresh price/stock observation and notification after due time | Exact product URL and variant, then future execution |
| [Memory follow-up](../skills/benchmark-memory-followup/) | Latest preferences retrieved and applied in a fresh conversation | Operator-supplied synthetic preferences, a separate update and a new recall conversation |
| [Expense summary](../skills/benchmark-expense-summary/) | Deduplication, refunds, flags, totals and usable files | Included synthetic expenses CSV |

Choose any one task. Checkout and scheduled research accept a target directly; purchase research is not a prerequisite. Memory follow-up remains one skill with separate conversation phases. Reminder change/cancel remains one skill with separate user turns. The package does not authorize the assistant to manufacture those turns.

## Reports and versions

All task skills use `assistant-benchmark-tasks-v1`, version `1.0.0`, with `report_scope: task`. Each report contains exactly one requested task and one task entry. Its `source_protocol` records the source suite, version and task ID. The one-task validator retains evidence, native-capability, budget and scheduling gates, and accepts undisclosed identities or tool names with an explanatory note and sanitized evidence.

The three portable skill-use tasks require a relevant existing native workflow skill, in addition to receiving this assignment. Loading the benchmark wrapper itself does not pass that check. Other everyday task outcomes record skill use separately.

The original multi-task packages are preserved under [benchmarks/legacy](../benchmarks/legacy/). Their prompts, templates, validators and manifests remain byte-for-byte as published. These new packages change task selection, orchestration and reporting; they are not drop-in full-suite reports and do not silently revise or rerun the public pilot. Record the exact task package version, hash, operator inputs and environment when comparing new runs.

See [the operator guide](RUNNING.md) for invocation and follow-up steps. Releases provide one ZIP per skill and `assistant-benchmark-skills.zip` containing all 11 folders. Supplying the whole bundle does not assign all 11 tasks; the operator selects tasks explicitly.
