EXPENSE SUMMARY - USD

Known-amount net total: $189.80. This is incomplete until A110 is filled.
Transport $24.90 | Meals $41.90 | Office $3.00 | Lodging $120.00

10 source rows became 9 distinct receipts. Exact duplicate A103/r005 was removed, retaining r003. No other receipt was removed. Office refund A107/r007 (-$5.00) was retained and included. A110/r010 (Station Kiosk, Meals) has a blank amount, left unfilled and excluded from numeric totals. It is the only receipt needing amount review.

Files: cleaned-expenses.csv contains every retained receipt and amount status; category-totals.csv and overall-total.csv reconcile numeric amounts; review-flags.csv records the missing amount and informational cleanup flags; removed-duplicates.csv preserves the removed row. input/sample-expenses.csv is the unchanged source.
Amounts are plain decimal USD, not formulas. Missing amounts stay blank, never zero.
