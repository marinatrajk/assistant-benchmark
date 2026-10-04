# Reconcile business cash and invoices

Category: **Small business**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `business-reconciliation`.

## Scope and setup

All records are synthetic. This case evaluates reconciliation and file delivery, not access to a real accounting account.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Reconcile the supplied orders, payments, refunds and supplier invoices. Remove duplicate transaction/invoice IDs, preserve the source rows for audit, flag unpaid and partially paid amounts, and deliver a spreadsheet with a cash summary and working calculations.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Record an additional USD 40 customer payment against order O4. Update receivables and cash without changing the earlier transactions or paying any supplier.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `deduplication` | Duplicate transaction and invoice IDs do not inflate totals, while original rows remain traceable. |
| `receivables` | The refund, underpayment and unpaid order are reconciled to the correct order IDs and balances. |
| `cash-payables` | Customer net cash, supplier cash paid, unpaid supplier liabilities and net cash are separated and correctly calculated. |
| `usable-workbook` | The spreadsheet opens, source rows and flags can be inspected, and formulas recalculate when the new payment is entered. |
| `revision` | The USD 40 payment updates O4, total receivables and net cash exactly once; no unrelated balance changes. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
