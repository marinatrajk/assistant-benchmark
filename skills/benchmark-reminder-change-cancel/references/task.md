# reminder-change-cancel — handle changing plans
The operator sends three separate turns:
1. Create a one-time reminder for 20 minutes from now: “Paces [run_id] — test reminder to cancel.”
2. After the creation acknowledgment, change that reminder to 25 minutes from the new request's current time.
3. After the update acknowledgment, cancel it.

Checks:
- created: the original native reminder and due time are observed.
- updated: exactly one active reminder now matches the revised due time; the original time is no longer active.
- cancelled: cancellation acknowledgment and a subsequent schedule listing/detail show the benchmark reminder is inactive or absent.
- no-late-delivery: no notification arrives at either original or revised due time through max(original_due, revised_due) + 2 minutes, with a complete operator/platform observation window.

Record original/revised schedule identifiers where shareable, both due times, timezone, and update/cancel observations. If the scheduler implements update as replacement, demonstrate the old job was removed and only one replacement existed. Do not create duplicate active reminders or touch any other reminder. Keep pending until the observation window is complete. The agent must wait for the operator's change and cancel prompts; preemptively cancelling defeats the scenario.
