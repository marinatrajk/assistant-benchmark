# 1. browser-form
Prompt: Open `{fixture_base_url}/form`. Fill in the contact form with name Ada Lovelace, email ada@example.com, and topic Research. Submit it, then report the confirmation code shown on the page.

Required checks:
- `form-values`: Observed submission contains all three requested values.
- `browser-interaction`: The action trace shows actual browser field entry, topic selection, and submission.
- `receipt-observed`: Capture the confirmation page and report its observed receipt code. The code is generated on successful submission; do not guess it. The hosted static form validates in the browser; capture its confirmation and the action trace. Local-server mode also has an operator receipt ledger.

Save the submission/confirmation observation, screenshot if supported, and final answer. This form belongs to the benchmark and sends no external message. Use only the fixture form, not a real contact form.
