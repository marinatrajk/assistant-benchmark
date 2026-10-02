# Everyday scenarios

Read the operator's prompt and assets/run-config.json for the exact assignment. Defaults are US market, USD, America/New_York, one attempt, 10 active minutes and 80 tool calls per task when measurable. Exclude time waiting for a scheduled event or user response from active time; report elapsed time too. A run is not complete while a required future observation is pending.

The operator can run a subset. The research and checkout use real public websites, whose prices, inventory, and access can change. Archive observations with timestamps; compare agents run close together with the same constraints. Access barriers are blocked coverage, not invented negative findings.

## purchase-research — buy the right thing

Default prompt: “Find three USB-C wall chargers sold online for delivery in the US. I need a US plug, USB Power Delivery, at least two USB-C ports, and at least 65 W advertised total output. My item-price budget is $50 before shipping and tax. Compare current price, availability, output when sharing ports, and the return policy. Recommend one and explain the tradeoff.”

Use current manufacturer/retailer sources and links to the exact variant. Do not confuse total wattage with per-port simultaneous output. Explicitly identify missing information. If fewer than three qualifying products can be verified, show the evidence and report partial, rather than relaxing constraints. The operator may provide a replacement product brief before any agent runs; record it.

Checks:
- constraints: three distinct verified candidates meet the brief, including plug and port count.
- current-sources: price and stock observations cite exact pages and observation time.
- tradeoffs: port sharing, shipping/tax unknowns, and return terms are addressed without invention.
- recommendation: the recommended exact variant is justified and linked.

Record the selected merchant URL and variant as the checkout and scheduled-research input. Do not use a canned expected product: the reviewer evaluates the sources observed in this run.

## checkout-handoff — prepare a real order

Prompt: “Use the exact charger you recommended. Add one to a fresh guest cart and proceed to checkout. Verify the item, variant, quantity, price, shipping and tax information shown. Stop at payment and hand control back to me; do not buy it.”

Use the same selected product across paired agent runs when isolating checkout performance. If research did not produce a candidate, the operator can give both agents the same explicit URL; record that intervention. Do not silently choose a replacement.

Checks:
- exact-cart: browser evidence identifies the correct variant and quantity 1.
- checkout-reached: the checkout's payment step is actually visible; a cart alone is partial progress.
- totals: report displayed subtotal, delivery, taxes and total; explicitly identify any amount not yet calculated.
- handoff: provide a usable exact checkout/cart URL or explain session handoff limitations, request secure payment takeover, and stop before an order/charge.

If login, delivery address, CAPTCHA, or another prerequisite prevents reaching payment, record awaiting_user or blocked and the last observed checkpoint. Never invent customer details. Address collection before payment is not a completed payment handoff. A remote session may not transfer via URL; say so. Do not use saved cards, express purchase, or paid reservations. Do not empty an existing cart. Preserve a newly prepared test cart until the operator confirms cleanup.

## reminder-delivery — remember to tell me later

Prompt: “In 10 minutes, remind me here: Paces [run_id] — take a screen break.”

Use the operator-configured delay. Read the actual current time; record creation time, timezone, and exact due time with offset. Confirm the intended time to the user. Use a one-time native reminder.

Checks:
- scheduled: native job record or scheduler observation confirms the exact text and due time.
- delivered: actual notification in the requested channel contains the run marker and requested message.
- on-time: delivery is not before due and is no more than two minutes late, according to a visible platform timestamp or operator observation.
- once: no duplicate delivery through due + 2 minutes, with the observation window confirmed complete.

A schedule ID alone is not delivery. Pending until the observation window finishes. If delivery cannot be inspected from the agent, ask the operator to return the notification and its timestamp; mark it operator-attested. Unavailable evidence is partial, not a fabricated failure. A confirmed missed deadline with a complete observation window is failed.

## reminder-change-cancel — handle changing plans

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

## scheduled-research — do work later

Prompt after research: “In 15 minutes, check the current price and stock for this exact product URL and variant, then send me one update here with the source and the time you checked: [selected URL and variant].”

Checks:
- scheduled: native one-time job record contains the exact target and requested work.
- fresh-execution: tool/page evidence shows a new source observation at or after due time, not a result prepared when scheduling.
- accurate-update: the notification correctly reports observed price, stock, variant, source URL and check time.
- delivered: the actual notification arrives in the requested channel between due and due + 5 minutes.

Record the tool observation and notification timestamps separately. A notification repeating the initial research result is not a fresh research pass, even if the price happens to be unchanged. The URL and variant must be supplied before scheduling. Do not purchase, subscribe, or create recurring monitoring. Pending until delivery/observation deadline; if no event arrives and complete observation confirms that fact, failed.

## memory-followup — remember preferences across conversations

The operator supplies synthetic preferences in an initial conversation, then changes one preference in a separate turn. After acknowledgment, the operator starts a new conversation in the same agent environment and supplies only the synthetic persona identifier and a request to apply remembered preferences. The fresh conversation must not contain the old transcript or answer key.

Checks:
- stored: native isolated durable memory records the supplied synthetic preferences.
- updated: the revised preference replaces the old current value, with readback and no conflicting current value.
- new-session-recall: native retrieval in the fresh conversation recovers the latest preferences without reseeding or copying the transcript.
- applied: the final suggestion satisfies every current preference and uses the updated constraint.

Record seed, update, entry identifiers/scope where shareable, fresh-session identity evidence, retrieval, and answer. The operator joins the two conversations' evidence. If no isolated durable namespace exists, blocked; if no durable memory capability exists, unsupported. Same-chat recall does not establish cross-conversation memory. A ranked top-one search alone is not an exhaustive no-conflict audit; record that limitation if current entries cannot all be inspected. Remove only this synthetic persona after the reviewer has the evidence and the operator requests cleanup.

## expense-summary — turn messy data into something useful

Prompt: “Clean up the attached sample expenses. Deduplicate by receipt_id, keep refunds, flag missing amounts, and create an Excel workbook or CSV bundle with cleaned rows, category totals and an overall total. Give me a short summary of what needs review.”

Input: assets/sample-expenses.csv. All amounts are USD. The file is synthetic benchmark data. Use the harness's own file tools and relevant available skills. Desktop interaction is allowed but not required; record whether it was actually used.

Checks:
- cleaned-data: retain distinct valid receipts once; preserve refunds; flag incomplete records without assigning invented amounts.
- correct-totals: category and overall totals reconcile to included numeric rows.
- usable-artifact: deliver an accessible, readable workbook or CSV bundle containing cleaned rows, summaries and review flags.
- explanation: explain duplicate handling, exclusions, refund treatment and rows needing review.

Evidence includes the actual output files and observations of their content, not a screenshot of an answer claiming a workbook exists. Do not modify the input asset.
