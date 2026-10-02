# scheduled-research — do work later
Prompt after research: “In 15 minutes, check the current price and stock for this exact product URL and variant, then send me one update here with the source and the time you checked: [selected URL and variant].”

Checks:
- scheduled: native one-time job record contains the exact target and requested work.
- fresh-execution: tool/page evidence shows a new source observation at or after due time, not a result prepared when scheduling.
- accurate-update: the notification correctly reports observed price, stock, variant, source URL and check time.
- delivered: the actual notification arrives in the requested channel between due and due + 5 minutes.

Record the tool observation and notification timestamps separately. A notification repeating the initial research result is not a fresh research pass, even if the price happens to be unchanged. The URL and variant must be supplied before scheduling. Do not purchase, subscribe, or create recurring monitoring. Pending until delivery/observation deadline; if no event arrives and complete observation confirms that fact, failed.
