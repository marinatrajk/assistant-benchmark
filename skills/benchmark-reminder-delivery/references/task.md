# reminder-delivery — remember to tell me later
Prompt: “In 10 minutes, remind me here: Paces [run_id] — take a screen break.”

Use the operator-configured delay. Read the actual current time; record creation time, timezone, and exact due time with offset. Confirm the intended time to the user. Use a one-time native reminder.

Checks:
- scheduled: native job record or scheduler observation confirms the exact text and due time.
- delivered: actual notification in the requested channel contains the run marker and requested message.
- on-time: delivery is not before due and is no more than two minutes late, according to a visible platform timestamp or operator observation.
- once: no duplicate delivery through due + 2 minutes, with the observation window confirmed complete.

A schedule ID alone is not delivery. Pending until the observation window finishes. If delivery cannot be inspected from the agent, ask the operator to return the notification and its timestamp; mark it operator-attested. Unavailable evidence is partial, not a fabricated failure. A confirmed missed deadline with a complete observation window is failed.
