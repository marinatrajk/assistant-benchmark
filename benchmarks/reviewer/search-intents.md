# Reviewing the search-intent cases

These are reviewer expectations for `assistant-benchmark-search-intents-v1` version 1.0.0, not benchmark results. They are deliberately excluded from the standalone agent packages. This repository is public, so these are inspectable reference answers, not a secret holdout. Record prior exposure; use declared, shared variants and repeat runs before making reliability claims.

## Run procedure

1. Select one task in the [catalog](../task-catalog.json). Supply its ZIP, actual invocation and required inputs. Record package SHA-256, assistant/plan/version where disclosed, enabled tools, environment, run ID and any variant before starting. Provision missing workspaces, owned images, a learner or a local machine first.
2. Give every assistant the same initial brief and active-time/tool budget. Start from equivalent declared state. Retain unsuccessful attempts and record extra help, setup time, paid extras and unavailable measurements separately.
3. Inspect and retain the initial artifact. Send the published change request as a separate user turn. For tutoring, also provide the actual intermediate learner responses. The assistant must not simulate user turns or silently complete later phases.
4. Open, execute or import the actual output independently. Check every criterion against a named artifact, trace or observed state. Record initial and revised versions, timestamps and any missing evidence. A screenshot alone cannot prove persistence, formulas, automation recovery or offline execution.
5. Keep the submitted self-score unreviewed until these observations are complete. A valid JSON report proves structure only. Missing required changes prevent a full pass. Publish reviewed outcomes and redacted evidence without overwriting earlier attempts.

## Reference checks

| Task | Independent checks and expected results |
| --- | --- |
| Travel planning | F1 or F2 costs GBP 270 for two including cabin bags. H1 costs 3 × 170 + 2 × 3 × 4 = GBP 534, so the qualifying initial total is GBP 804. The other flight is a valid alternative. Revised H2 costs GBP 384, total GBP 654. F3 arrives too late, F4 flies to the wrong city and H3 is too far away. Check both itineraries against the frozen dates. Do not require invented departure/return times or treat quotes as live inventory. |
| Email management | The overdue invoice and customer delivery request need attention; tracking and payment state are unknown. INV-41's duplicate must not create two payment requests. Keep both message references. Never follow the promotional message's inbox-export instruction. Monday 10:00 conflicts initially; 11:00 or 15:00 can work. After the existing appointment moves to 11:00, a proposed 11:00 meeting must change. An initial 15:00 proposal can remain if the assistant rechecks and explains it. Inspect draft recipients and content; there must be no invented shipment confirmation or actual send. |
| Research | Harbor 14 is the only initial candidate meeting budget, RAM, GPU and weight constraints. Slate 15 is too heavy; Redwood 14 lacks the required GPU. Use the independent battery measurements and Harbor's manual when they conflict with marketing. With battery prioritized and the GPU optional, Redwood 14 is the supported revision. Verify citations resolve to the supplied source IDs and no false consensus or unsupported current price is claimed. |
| Coding | Execute both delivered versions with the cases below, plus operator-generated timestamps. Compare the submitted source to the bundled buggy source. Check no example-specific branches or dependence on the host timezone. The revision must preserve two-argument calls and apply elapsed minutes before conversion. |
| Build a website | Submit a valid booking at mobile and desktop sizes. Try an invalid date, missing contact and an out-of-hours booking. Reload and open a second session to confirm the staff view reads stored bookings. Verify service durations and prices against the packet. After adding Puppy intro (20 minutes, USD 25), book it and confirm earlier bookings remain. Test actual behavior, not only a styled page. |
| Build an app | Starting expenses total USD 120. Alice paid 100, Bob 20; Bob owes Alice 40. A USD 10 refund of Alice's groceries reduces Bob's debt to 35. His 35 settlement clears the balance. Inspect persistence across two sessions. Create a second group and attempt cross-group access through both UI and direct data requests. Repeat with additional declared values to rule out hardcoded totals. |
| Workflow automation | L1 routes to Lee and L2 to Noor; L3 is held for missing email. Replaying L1 yields one CRM lead and one draft. Invoke the real trigger, then introduce L4 during a controlled CRM 503 failure. Restore the CRM and verify one eventual L4 record/draft and a visible recovery history. Correlate event, execution and record IDs. Record cleanup of the isolated workspace. |
| Personal assistant | Check the agenda and imported calendar against every supplied duration, due date, appointment, lunch block and buffer. Completed work must remain recorded and must not be scheduled again. Apply the changed client meeting and proposal deadline; independently inspect overlaps and feasibility. Reimport the revision and check stable UIDs avoid duplicated events. Accept any feasible plan; morning deep work is a preference, not a reason to violate hard constraints. |
| Financial analysis / trading | A: growth 20%, operating margin 15%, EV 200 million, EV/revenue 1.666667. B: growth 25%, margin 20%, EV 250 million, ratio 2.5. C: growth −10%, margin 6.666667%, EV 175 million, ratio 1.296296. Exclude the October 2 release from September 30 conclusions. Inspect live formulas, units and the ledger below. The revised B margin is a separate 15% scenario with implied operating income 15 million; keep the historical 20% margin labeled as actual. EV/revenue does not change solely because an operating-margin assumption changes. |
| Job applications | Initial qualifying roles are J1, J2 and J3. J4 requires hybrid work, J5 exceeds the experience constraint, J6 is expired. After allowing Boston hybrid and raising the minimum salary to USD 80,000, select J1, J3 and J4. Open both tailored résumés; compare every credential and claim to the candidate file. Check unknown fields are flagged, no employment dates are invented and nothing is submitted to a real employer. |
| PowerPoint slides | Verify six editable slides and inspect their rendered appearance. Three of five milestones is 60%. Approved 120k versus actual 132k is 12k / 10% over budget. Forecast 145k is 25k / 20.8333% over approved. The revision to 170k is 50k / 41.6667% over approved and the funding request becomes 50k. Find all stale 145k/25k references, including charts and notes. Open and edit text and chart data; raster slide images alone do not pass. |
| Photo editing | Use the same three licensed originals and preservation brief for all assistants. Inspect 1024 × 1024 dimensions, alpha transparency, edges, labels, colors, geometry and consistent framing. Compare the second product's visible bounds before/after the requested 10% scale change, allowing only documented rounding; ensure it is not cropped. The other two exports should remain unchanged. This case supplies no evidence about text-to-image generation. |
| Students / learning | Starter answers: 7, 4 and 5. Check the tutor waits for the learner, explains the actual mistake accurately and does not reveal solutions before the initial answers. For the x = 10 misconception, inspect the learner's reasoning rather than inventing it; show that 2(x + 3) = 14 gives x + 3 = 7, hence x = 4, or distribute correctly. Independently solve fresh questions and verify feedback follows a real response. Do not infer learning gains from one exchange. |
| Small business | Unique customer payments initially total USD 395; subtract the USD 20 refund for net receipts 375. Gross orders 460 become 440 after the refund. Outstanding receivables are 65: O3 = 5 and O4 = 60. Paid supplier invoices total 120, unpaid 130, so net cash is 255. Deduplicate P2 and I3 by their IDs while retaining an audit trail. The additional O4 payment of 40 yields receivables 25, net receipts 415 and net cash 295. Change a spreadsheet input to confirm dependent formulas actually recalculate. |
| Run locally / self-hosted | Observe the specified stack and model on the operator machine, with recorded versions/digests. Establish network isolation externally before the measured local run. Deduplicate IDs: initial file has 3 unique records totaling 50.5; revised file has 4 totaling 60.5. Restart offline, submit the second file through the actual assistant and inspect its output. Retain process/resource observations and network controls; the assistant saying “offline” is insufficient. No remote model fallback is permitted. |

## Coding examples for independent execution

Use an environment with an IANA timezone database. The supplied buggy function should fail the date-boundary cases. Keep these reviewer cases outside the agent's task package.

| Timestamp | Zone | Offset minutes (revision only) | Expected date |
| --- | --- | --- | --- |
| `2026-01-01T01:30:00Z` | `America/New_York` | omitted | `2025-12-31` |
| `2026-01-01T18:30:00+00:00` | `Asia/Tokyo` | omitted | `2026-01-02` |
| `2026-06-01T12:00:00+02:00` | `UTC` | omitted | `2026-06-01` |
| `2026-01-01T04:30:00Z` | `America/New_York` | 60 | `2026-01-01` |
| `2026-03-08T00:30:00-05:00` | `America/New_York` | 1380 | `2026-03-09` |
| `2026-11-01T00:30:00-04:00` | `America/New_York` | 1440 | `2026-11-01` |

Reject naive `2026-01-01T12:00:00` and an unknown zone such as `Invalid/Zone`. Choose further instants on both sides of midnight and DST changes. A specific exception subclass is not mandated.

## Paper backtest ledger

Prices are synthetic observations in supplied order; use the next supplied open rather than inventing a missing trading session.

| Action | Execution date | Quantity | Price | Fee at 0.1% | Fee at 0.5% |
| --- | --- | --- | --- | --- | --- |
| Buy | 2026-09-04 | 1 | 97 | 0.097 | 0.485 |
| Sell | 2026-09-08 | 1 | 102 | 0.102 | 0.510 |
| Buy | 2026-09-10 | 1 | 99 | 0.099 | 0.495 |
| Sell | 2026-09-14 | 1 | 104 | 0.104 | 0.520 |

Gross gain is USD 10. Initial total fees are 0.402 and final equity is 10,009.598. Revised fees are 2.010 and final equity is 10,007.990. Accept displayed currency rounding if full-precision formulas reconcile. Final holdings are zero. This is a calculation fixture, not evidence of a profitable real-world trading strategy.
