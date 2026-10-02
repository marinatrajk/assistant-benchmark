# Fresh page observations — run muse-purchase-research-20261002-01
All observations 2026-10-02 (America/New_York), via native text fetch of the
exact product pages. Prices USD, before tax/shipping.

## Candidate 1 — Griffin PowerBlock 65W Dual USB-C Wall Charger (ev-griffin)
- Page: https://incipio.com/products/grfwp1008-wht?variant=52660130677100 (observed ~13:51-13:52 EDT)
- Price: $34.99 USD (page text and og:price metadata agree)
- Availability: variants table lists Black ($34.99) and White ($34.99), both "Available"
- Specs: 65W GaN Power Delivery; dual USB-C ports; foldable prongs (US wall plug)
- Port sharing: page says each USB-C port can output up to 65W; exact shared-port
  split is NOT stated (missing data)
- Return policy: not observed on this page (missing data)

## Candidate 2 — Philips AC Charger, 1 USB-A + 2 USB-C, GaN 65W, White (ev-philips)
- Page: https://byjasco.com/products/philips-1-usb-and-2-usb-c-wall-charger-with-power-delivery-white?variant=55194167968113 (observed ~13:51-13:52 EDT)
- Model: DLP3653W/37; Price: $19.99 USD
- Availability: "> In stock, ready to ship"; JSON-LD offers Availability: InStock
- Specs: two USB-C Power Delivery ports + one USB-A; 65W total shared power (GaN);
  foldable plug; ETL safety certified; US merchant (Jasco Products Company, Oklahoma City, OK)
- Port sharing: "65 Watts of shared power", "one of which offers up to 65 Watts" —
  exact per-port split is NOT stated (missing data)
- Shipping: free shipping on orders of $50 or more; a $19.99 charger alone incurs
  a shipping fee whose amount was NOT observed (missing data)
- Return policy: a "Refund policy" footer link exists but its terms were NOT read
  (link indices drifted during navigation; missing data)

## Candidate 3 — Targus 65W Multi-Port GaN Wall Charger, White (ev-targus)
- Page: https://www.dell.com/en-us/shop/notebook-ac-adapters/apd/ad630368/pc-accessories (observed ~13:51-13:52 EDT)
- Mfr part APA11606TT; Price: $37.99 USD
- Availability: JSON-LD offers Availability: InStock
- Specs: 2 USB-C + 1 USB-A; "USB Power Delivery: 2 x Type-C 65W"; 65W max total;
  foldable prongs; Type A plug; 120V AC input; 2-year limited warranty
- Port sharing: "up to 65W on a single port" — exact shared-port split is NOT
  stated (missing data)
- Return policy / shipping cost: not observed on this page (missing data)

## Alternates examined but NOT counted as candidates
- IOGEAR GearPower Dual USB-C 65W GaN Charger ($35.95, iogear.com, observed ~13:51-13:52 EDT):
  best spec transparency of the lot — explicit split "USB-C #1 Up to 45W / USB-C #2
  Up to 20W", PD 3.0 + PPS, 6ft USB-C cable included — but the fetched page showed no
  add-to-cart/in-stock indicator, so availability is NOT confirmed (missing data).
- INIU Cougar A21 65W GaN Charger ($26.99, iniushop.com, observed ~13:51-13:52 EDT):
  met every spec (2C+1A, PD 3.0 + PPS, 65W MAX, foldable US plug, explicit
  45W+20W split) but the page showed "Sold out" — not purchasable.

## Coverage note
- Meta catalog search (13:50:51 EDT) returned 26 products under $50; the three
  candidates above were shortlisted and verified on current pages.
- A live-browser product-search task covering Amazon/Best Buy/Walmart was spawned
  at ~13:51 EDT but was still queued when this report was finalized; its results
  were not incorporated. No other tests or purchases were started; existing
  grocery and Best Buy carts were left untouched.
