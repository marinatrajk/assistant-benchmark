# Financial analysis and a paper backtest

Category: **Financial analysis / trading**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `financial-analysis`.

## Scope and setup

All companies, filings and prices are synthetic. The case evaluates analysis and simulation mechanics, not real-market profitability or brokerage integration.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Using only information available by the supplied cutoff, compare the three fictional companies, calculate revenue growth, operating margin and enterprise-value-to-revenue, and deliver a spreadsheet with working formulas. Backtest the declared rule on the supplied price series with fees and an explicit transaction ledger. This is a paper simulation.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Increase each-side trading fees from 0.1% to 0.5% and reduce the valuation assumption for company B’s operating margin to 15%. Update dependent calculations and explain what changes.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `filing-accuracy` | Financial figures and period labels reconcile to the supplied filings; the later-dated release is excluded from cutoff-based conclusions. |
| `spreadsheet` | Growth, margins and EV/revenue use correct formulas and units; changes to an input recalculate outputs. |
| `no-lookahead` | Signals use only closing prices already observed; trades execute at the next available open. No final-day signal invents a later price. |
| `fees-ledger` | Each buy/sell records date, price, quantity and both applicable fees. Cash, position value and final equity reconcile to the complete price path. |
| `revision` | The higher fees and revised operating-margin scenario propagate through the workbook and explanations; no claim of guaranteed or live trading profit. |

## Run record and review

One attempt: **25 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
