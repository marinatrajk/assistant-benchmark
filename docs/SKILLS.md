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
| [Video download and transcription](../skills/benchmark-video-download-transcription/) | Full YouTube and TikTok downloads, timestamped transcripts and audio verification | Both supplied video links are included; one task covers both sources |

## Search-intent cases added October 4, 2026

All 15 new cases are initially unrun. Each includes a separate operator change; full pass requires evidence for both phases. Required external inputs must be supplied before execution.

| Category | Skill / initial task | Required inputs |
| --- | --- | --- |
| Travel planning | [Trip planning under a budget](../skills/benchmark-travel-planning/) | Bundled files |
| Email management | [Inbox triage and reply drafts](../skills/benchmark-email-management/) | Bundled files |
| Research | [Research with conflicting sources](../skills/benchmark-research-synthesis/) | Bundled files |
| Coding | [Fix a timezone boundary bug](../skills/benchmark-coding-timezone/) | Bundled files |
| Build a website | [Build a working booking website](../skills/benchmark-website-booking/) | Bundled files |
| Build an app | [Build a shared expense app](../skills/benchmark-shared-expense-app/) | Bundled files |
| Workflow automation | [Automate lead intake and recovery](../skills/benchmark-lead-workflow/) | Bundled files; supply `automation_workspace_url`, `test_crm_url`, `failure_injection_instructions` |
| Personal assistant | [Plan and revise a working week](../skills/benchmark-weekly-planning/) | Bundled files |
| Financial analysis / trading | [Financial analysis and a paper backtest](../skills/benchmark-financial-analysis/) | Bundled files |
| Job applications / résumé | [Prepare accurate job applications](../skills/benchmark-job-application-prep/) | Bundled files |
| PowerPoint slides | [Create an editable board update](../skills/benchmark-board-slides/) | Bundled files |
| Photo editing / image generation | [Prepare consistent product images](../skills/benchmark-image-editing/) | Operator inputs; supply `product_image_1`, `product_image_2`, `product_image_3`, `details_to_preserve` |
| Students / learning | [Teach and adapt to misconceptions](../skills/benchmark-adaptive-tutoring/) | Bundled files; supply `learner_session` |
| Small business | [Reconcile business cash and invoices](../skills/benchmark-business-reconciliation/) | Bundled files |
| Run locally / self-hosted | [Run an assistant offline](../skills/benchmark-local-deployment/) | Bundled files; supply `target_stack_and_version`, `model_and_digest`, `test_machine`, `offline_control_and_measurement` |

Choose any one task. Checkout and scheduled research accept a target directly; purchase research is not a prerequisite. Memory follow-up remains one skill with separate conversation phases. Reminder change/cancel remains one skill with separate user turns. The package does not authorize the assistant to manufacture those turns.

## Reports and versions

All task skills use `assistant-benchmark-tasks-v1`, version `1.0.0`, with `report_scope: task`. Each report contains exactly one requested task and one task entry. Its `source_protocol` records the source suite, version and task ID. The video task uses `assistant-benchmark-media-v1` version `1.0.0`; the search-intent cases use `assistant-benchmark-search-intents-v1` version `1.0.0`. Catalog version `1.1.0` adds tasks without changing the report contract or the previous 12 packages. The one-task validator retains evidence, native-capability, budget and scheduling gates, and accepts undisclosed identities or tool names with an explanatory note and sanitized evidence.

The three portable skill-use tasks require a relevant existing native workflow skill, in addition to receiving this assignment. Loading the benchmark wrapper itself does not pass that check. Other everyday task outcomes record skill use separately.

The original multi-task packages are preserved under [benchmarks/legacy](../benchmarks/legacy/). Their prompts, templates, validators and manifests remain byte-for-byte as published. These new packages change task selection, orchestration and reporting; they are not drop-in full-suite reports and do not silently revise or rerun the public pilot. Record the exact task package version, hash, operator inputs and environment when comparing new runs.

See [the operator guide](RUNNING.md) for invocation and follow-up steps. Release v0.2.0 contains the original 11 skills. The expanded catalog builds one ZIP per skill and `assistant-benchmark-skills.zip` containing all 27 folders. Supplying the whole bundle does not assign all 27 tasks; the operator selects tasks explicitly.
