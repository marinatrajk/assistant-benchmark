# Search-intent categories

Best AI Agent for [ ] uses the jobs people search for as categories. Selecting a category fills the brackets, compares the same tasks for all assistants and opens its briefs and skill ZIPs. Direct links such as `#for/travel` and `#for/coding` are shareable.

The authoritative mapping lives in `benchmarks/task-catalog.json` and is copied into `website/review.json`. The repository checker requires them to match. Tags appear after at least one mapped result has `review_status: reviewed`; the numerator counts only `status: passed` with completed review. Each tag displays reviewed passes / mapped tests. Zero passes can coexist with reviewed partial or failed outcomes. Untested categories remain available as filters.

| Category | Route | Mapped task IDs |
| --- | --- | --- |
| Travel planning | `#for/travel` | `travel-planning` |
| Email management | `#for/email` | `email-management` |
| Research | `#for/research` | `browser-research`, `purchase-research`, `video-download-transcription`, `research-synthesis` |
| Coding | `#for/coding` | `coding-timezone` |
| Build a website | `#for/website` | `website-booking` |
| Build an app | `#for/app` | `shared-expense-app` |
| Workflow automation | `#for/automation` | `lead-workflow` |
| Personal assistant | `#for/personal` | `browser-form`, `memory-update`, `computer-calculator`, `checkout-handoff`, `reminder-delivery`, `reminder-change-cancel`, `scheduled-research`, `memory-followup`, `weekly-planning` |
| Financial analysis / trading | `#for/finance` | `financial-analysis` |
| Job applications / résumé | `#for/jobs` | `job-application-prep` |
| PowerPoint slides | `#for/slides` | `board-slides` |
| Photo editing / image generation | `#for/images` | `image-editing` |
| Students / learning | `#for/students` | `adaptive-tutoring` |
| Small business | `#for/business` | `expense-summary`, `business-reconciliation` |
| Run locally / self-hosted | `#for/local` | `local-deployment` |

Catalog version **1.1.0** adds 15 cases on October 4, 2026, for 27 total. Every new assistant/task slot is unrun and unreviewed. The prior 12 results, evidence and review timestamps are unchanged. Each new task has an initial brief, required inputs, a separate operator change, five evidence checks and an independent skill ZIP. See the [skills](SKILLS.md), [operator guide](RUNNING.md) and [reviewer expectations](../benchmarks/reviewer/search-intents.md).

A category is broader than any one case: photo editing does not establish image-generation quality, frozen travel quotes do not establish live booking, and a paper backtest does not establish real trading returns. Personal-assistant and research coverage also includes the earlier specific tasks. Tags are coverage summaries, not endorsements or estimates of reliability.

The supplied Google autocomplete snapshot (October 3, 2026) informed this taxonomy. It supplies no measured search volumes. Brand comparisons, “free,” “pricing,” “reddit” and month/year modifiers are comparison or trust questions, not separate capabilities. Record plan, costs, extra help, environment and repeat attempts to support those comparisons; do not label an assistant free or best from a single pass.

Earlier category links redirect to their broader category: reminders, shopping, memory, memory-updates, browser-forms, computer and scheduled-research → Personal assistant; files → Small business; browser-research and video → Research.
