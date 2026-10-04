# Trip planning under a budget

Category: **Travel planning**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `travel-planning`.

## Scope and setup

This controlled case tests constraint handling and travel cost calculations from frozen quotes. Live inventory checks and actual booking are outside this version.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Use the supplied frozen quote packet to plan a three-night London–Lisbon trip for two on November 12–15, 2026, for at most GBP 900. Include cabin bags and all listed taxes. Arrive before 20:00 local time. Choose a hotel within 1.5 km of the city centre with free cancellation. Return a costed itinerary, selected quote IDs and one alternative.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Reduce the total budget to GBP 700. A non-refundable hotel is now acceptable; keep every other constraint and explain the changes.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `constraints` | Initial and revised dates, party size, destination, arrival time, bags and hotel distance meet their respective briefs; cite the quote IDs. |
| `total-cost` | Recompute the full two-person flight/bag cost plus three hotel nights and per-person nightly city tax; no omitted charge or unsupported discount. |
| `sources` | Every selected option and material claim is traceable to the supplied quote packet. Identify it as a frozen scenario rather than current bookable inventory. |
| `itinerary` | Deliver a usable itinerary with local dates/times and a feasible qualifying alternative. |
| `revision` | The revised itinerary meets the GBP 700 budget and retains the initial version; no stale hotel, total or cancellation claim remains. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
