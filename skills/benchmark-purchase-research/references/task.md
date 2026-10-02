# purchase-research — buy the right thing
Default prompt: “Find three USB-C wall chargers sold online for delivery in the US. I need a US plug, USB Power Delivery, at least two USB-C ports, and at least 65 W advertised total output. My item-price budget is $50 before shipping and tax. Compare current price, availability, output when sharing ports, and the return policy. Recommend one and explain the tradeoff.”

Use current manufacturer/retailer sources and links to the exact variant. Do not confuse total wattage with per-port simultaneous output. Explicitly identify missing information. If fewer than three qualifying products can be verified, show the evidence and report partial, rather than relaxing constraints. The operator may provide a replacement product brief before any agent runs; record it.

Checks:
- constraints: three distinct verified candidates meet the brief, including plug and port count.
- current-sources: price and stock observations cite exact pages and observation time.
- tradeoffs: port sharing, shipping/tax unknowns, and return terms are addressed without invention.
- recommendation: the recommended exact variant is justified and linked.

Record the selected merchant URL and variant as the checkout and scheduled-research input. Do not use a canned expected product: the reviewer evaluates the sources observed in this run.
