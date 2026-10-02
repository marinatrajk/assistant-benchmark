# checkout-handoff — prepare a real order
Prompt: “Use the exact charger you recommended. Add one to a fresh guest cart and proceed to checkout. Verify the item, variant, quantity, price, shipping and tax information shown. Stop at payment and hand control back to me; do not buy it.”

Use the same selected product across paired agent runs when isolating checkout performance. If research did not produce a candidate, the operator can give both agents the same explicit URL; record that intervention. Do not silently choose a replacement.

Checks:
- exact-cart: browser evidence identifies the correct variant and quantity 1.
- checkout-reached: the checkout's payment step is actually visible; a cart alone is partial progress.
- totals: report displayed subtotal, delivery, taxes and total; explicitly identify any amount not yet calculated.
- handoff: provide a usable exact checkout/cart URL or explain session handoff limitations, request secure payment takeover, and stop before an order/charge.

If login, delivery address, CAPTCHA, or another prerequisite prevents reaching payment, record awaiting_user or blocked and the last observed checkpoint. Never invent customer details. Address collection before payment is not a completed payment handoff. A remote session may not transfer via URL; say so. Do not use saved cards, express purchase, or paid reservations. Do not empty an existing cart. Preserve a newly prepared test cart until the operator confirms cleanup.
