# Use-case labels

Best AI Agent for [ ] organizes the existing tests around the jobs people want an assistant to do. Selecting a use case fills the brackets and shows the same mapped tests for every assistant. Links such as `#for/reminders` can be shared or opened directly.

The mapping is stored in `website/review.json` under `use_cases`, alongside `project_name` and the reviewed results. Labels are calculated from that data for list, grid, profile and comparison views. They are included as a mapping in the JSON export rather than maintained as a second set of per-assistant judgments.

An assistant receives a label only when **every mapped task has `status: passed` and `review_status: reviewed`**. Partial, blocked, unsupported, unrun, pending and unreviewed outcomes do not earn a label. No label is a reason to inspect the individual results; it can reflect missing evidence or an unfinished evaluation.

| Label | Required task IDs | Scope demonstrated by a full pass |
| --- | --- | --- |
| Purchase research | `purchase-research` | Compare qualifying products and support a purchase recommendation |
| Checkout handoff | `checkout-handoff` | Prepare the requested checkout and return control before payment |
| Reminders | `reminder-delivery`, `reminder-change-cancel` | Timely delivery plus changing and cancelling a reminder |
| Expense cleanup | `expense-summary` | Reconcile the supplied receipt data into accurate, usable files |
| Browser forms | `browser-form` | Complete and submit the synthetic form with matching confirmation |
| Memory recall | `memory-followup` | Retrieve updated preferences across separate conversations |
| Browser research | `browser-research` | Choose the correct plan using the required native research workflow |
| Memory updates | `memory-update` | Update isolated durable preferences using the required native workflow |
| Scheduled research | `scheduled-research` | Check a source later and deliver an accurate update within the deadline |
| Computer use | `computer-calculator` | Complete the operating-system Calculator task through desktop controls |
| Video & transcripts | `video-download-transcription` | Deliver both videos and audio-verified, timestamped transcripts |

The scope is deliberately specific. Expense cleanup does not establish suitability for all small-business work. Memory recall does not establish that the separate memory-update test passed. A cancellation pass alone does not earn Reminders.

The project name expresses a buying question. A use-case label records observed task completion. Repeated runs, broader tasks, comparable conditions, user effort and cost are needed before recommending a best agent for a category. The current results remain provisional; see [methodology](METHODOLOGY.md).

Coding, travel planning, email management, trading, website/app building, job applications, slides, image editing and local deployment need dedicated tasks before they can earn labels. Search autocomplete supplied candidate categories, not measured search volumes or evidence of an assistant's capabilities.
