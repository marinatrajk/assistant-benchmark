# expense-summary — turn messy data into something useful
Prompt: “Clean up the attached sample expenses. Deduplicate by receipt_id, keep refunds, flag missing amounts, and create an Excel workbook or CSV bundle with cleaned rows, category totals and an overall total. Give me a short summary of what needs review.”

Input: assets/sample-expenses.csv. All amounts are USD. The file is synthetic benchmark data. Use the harness's own file tools and relevant available skills. Desktop interaction is allowed but not required; record whether it was actually used.

Checks:
- cleaned-data: retain distinct valid receipts once; preserve refunds; flag incomplete records without assigning invented amounts.
- correct-totals: category and overall totals reconcile to included numeric rows.
- usable-artifact: deliver an accessible, readable workbook or CSV bundle containing cleaned rows, summaries and review flags.
- explanation: explain duplicate handling, exclusions, refund treatment and rows needing review.

Evidence includes the actual output files and observations of their content, not a screenshot of an answer claiming a workbook exists. Do not modify the input asset.
