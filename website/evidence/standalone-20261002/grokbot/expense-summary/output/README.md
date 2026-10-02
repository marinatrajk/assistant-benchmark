# Expense summary (synthetic data) - grokbot-expense-summary-20261002-01
- Duplicates: deduplicated by receipt_id, keeping the first occurrence. r005 repeats A103 (r003) with identical fields, so it is excluded.
- Refunds: r007 (A107, Paper Shop refund, -5.00 USD) is kept as a negative amount and reduces Office to 3.00.
- Missing amount: r010 (A110, Station Kiosk, Meals) has a blank amount. It is kept in the cleaned rows, flagged, never filled in, and excluded from numeric totals.
- Totals (USD): Transport 24.90, Meals 41.90 (incomplete), Office 3.00, Lodging 120.00, overall 189.80 (incomplete, since it is missing A110).
- Needs review: get the A110 amount; confirm the A103 duplicate is a true duplicate.
Files: cleaned-expenses.csv, category-totals.csv, overall-total.csv, review-flags.csv. The input in input/ is unmodified.
