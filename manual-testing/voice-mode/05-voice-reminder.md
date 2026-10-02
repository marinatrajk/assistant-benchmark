# V05 — Voice request to delivered reminder

**Purpose:** Does a spoken request produce a real, timely notification after voice mode ends?

## Setup

Record the current timezone and notification channel. Verify that notifications are enabled and an existing native scheduler is available. If scheduling is absent, mark unsupported; do not substitute a timer app or a new background process. Use a unique short spoken marker for each attempt, such as `V05 A1`, and record it verbatim.

## Steps

1. Say: **“In ten minutes, remind me here: [actual unique marker], take a screen break. Confirm the exact due time and timezone.”** Replace the bracketed instruction before speaking.
2. Record the request completion time, creation acknowledgment and any visible native schedule record. If the due time is not provided, ask once: **“What exact time and timezone is that due?”** Record this extra effort.
3. End voice mode normally and leave the app open. Do not prompt the assistant to deliver the reminder. Observe the requested notification channel through **due time plus two minutes**.
4. Record actual delivery time, content and any duplicates. Use a new marker for another attempt. Testing with the app closed is a separate labeled variant, not the default here.

## Pass criteria

- A native one-time reminder is created for ten minutes after scheduling, with the requested message and a confirmed due time/timezone.
- The actual notification contains the marker and screen-break message in the requested channel.
- Delivery occurs **at or after due and no later than due + 120 seconds**.
- Exactly one notification is observed through due + 120 seconds.

Formatting/capitalization differences in the spoken marker are acceptable when its identity is unambiguous. A schedule acknowledgment or job ID alone is not delivery evidence. Record any due-time clarification separately as user effort; it does not prevent a pass if all outcome criteria are observed.

**Pending:** The observation window is still open.

**Partial:** There is observed progress or delivery, but the timing, job identity or completed observation window cannot be established. Minute-only timestamps cannot prove a boundary-sensitive result; keep the unresolved check visible.

**Failed:** Complete observation establishes no delivery, an early/late notification, wrong message/channel or a duplicate. If an unrelated outage or notification-setting mistake invalidates the setup, record that instead of attributing the failure to the assistant.

**Evidence:** Spoken request, due-time confirmation, accessible schedule observation, notification with platform timestamp and observation end time. Record timestamp precision and distinguish platform evidence from operator notes. Confirmed creation with no accessible job detail may be retained as partial evidence; do not invent a scheduler record.
