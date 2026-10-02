# Operator turns

These are separate user messages, not permission for the assistant to run all steps at once. Replace the run marker with the actual run ID and record any delay override consistently across agents.

1. Ask the assistant to create one reminder for 20 minutes from now: `Paces [run_id] — test reminder to cancel`. Collect creation evidence and the exact original due time.
2. After acknowledgment, send a new message: “Change that exact benchmark reminder to 25 minutes from now. Confirm the revised due time and that exactly one matching reminder is active.” Collect the update evidence.
3. After acknowledgment, send another message: “Cancel that benchmark reminder. Confirm it is inactive or absent, without changing any other reminder.” Collect cancellation acknowledgment and subsequent scheduler inspection.
4. Observe the requested channel through max(original_due, revised_due) + 120 seconds (or configured grace). Return timestamped platform evidence or an explicitly operator-attested observation. The report remains pending until this window is complete; missing operator turns mean the scenario is unfinished, not an agent cancellation failure.
