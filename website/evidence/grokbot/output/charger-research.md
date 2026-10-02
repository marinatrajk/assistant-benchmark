# USB-C wall charger research — run pe-20261001-1504-nb
Market: US / USD. Observed 2026-10-01 15:05–15:07 ET (UTC-04:00). Constraints: US plug, USB PD, ≥2 USB-C ports, ≥65 W advertised total, item price ≤ $50 before shipping/tax.
All three candidates meet every constraint. Prices are what the guest (logged-out) product page shows; nothing was added to a cart.

## Comparison

| | A. Anker 735 Charger (Nano II 65W) — **Recommended** | B. Anker Prime 67W GaN Wall Charger (3 Ports) | C. UGREEN Nexode 65W 3-Port Charger |
|---|---|---|---|
| Merchant | anker.com (Anker US official store, Shopify-backed) | anker.com | us.ugreen.com (UGREEN US official Shopify store) |
| Exact variant | Color **Black**, SKU **A2667114** (model A2667), Shopify variant 41581366575254 | Single variant ("Default Title"), SKU **A2669113** (model A2669), variant 42691852435606 | Option **"Only Charger"** (black), SKU **10334**, variant 39915659591742 |
| URL | https://www.anker.com/products/a2667?variant=41581366575254 | https://www.anker.com/products/a2669-3-port-wall-charger | https://us.ugreen.com/products/65w-3-ports-gan-fast-charger?variant=39915659591742 |
| Price (item) | **$29.99** | **$49.99** | **$39.99** list (compare-at also $39.99); page shows "Save 30%, Code: UL10334, Time-Limited Discount" with auto-discount flag → ≈$27.99 *if* applied at checkout (not verified) |
| Availability | JSON-LD InStock; quantityAvailable 25,546; currentlyNotInStock=false | JSON-LD InStock; quantityAvailable 4,452 | JSON-LD InStock; Shopify available=true |
| observed_at | 2026-10-01T15:06:25-04:00 | 2026-10-01T15:05:47-04:00 | 2026-10-01T15:05:41-04:00 |
| Ports | 2× USB-C + 1× USB-A | 2× USB-C + 1× USB-A | 2× USB-C + 1× USB-A |
| Total (advertised) | 65 W | 67 W (single port); 65 W two ports; 64.5 W three ports | 65 W |
| Single port | C1/C2 65 W, A 22.5 W | C1/C2 67 W, A 22.5 W | C1/C2 65 W, A 22.5 W |
| **Port sharing** | C1+C2 = **45 W + 20 W**; C1+A = 40 W + 22.5 W; C2+A = 12 W + 12 W; all three = 40 W + 12 W + 12 W (source: anker.com/products/a2667 Specs) | C1+C2 = **65 W max combined** (per-port split NOT published); C1+A 65 W; C2+A 65 W; three ports 64.5 W max (split not published) (source: anker.com A2669 Specs) | Two-port / three-port split **not in text on US page** (only "Intelligent Distribution"). Third-party manual (model 10335): C1+C2 = 45 W + 20 W; C1+A = 45 W + 18 W; C2+A = 8.5 W + 8.5 W; three ports 45 + 8.5 + 8.5 W. A UGREEN India listing for 15334 instead says 45 + 7.5 + 7.5 W (conflict) |
| Plug | US, foldable (US store, 100–240 V) | US, foldable (US store) | US, foldable (US store) |
| PD | Yes (USB-C PD, PPS) | Yes (USB-C PD 3.0, PPS) | Yes (PD 3.0/2.0, PPS, QC4+) |
| Returns | 30-day money-back for any reason, undamaged items; buyer pays return shipping for non-quality returns; product cost only refunded (https://www.anker.com/policies/refund-policy). Product page also says "Return one order per year with shipping costs covered by Anker." | Same as A | Return request within 30 calendar days of delivery; non-quality: customer pays return shipping, original shipping non-refundable; quality issues: prepaid label/reimbursement capped at $10 (https://us.ugreen.com/policies/refund-policy). Site banner: "30-Day Worry-Free Trial / 2-Year Product Warranty" |
| Shipping | Page: "Free shipping on all orders. Ships to US only." (also references "free shipping coupons" — exact conditions unverified) | Same as A | Banner: "Fast & Free Shipping Over $20" |
| Tax | Unknown until checkout (address-dependent) | Unknown | Unknown |
| Guest checkout | Likely (Shopify checkout); not tested (no cart per rules) | Likely; not tested | Likely (standard Shopify); not tested |

## Recommendation
**Anker 735 Charger (Nano II 65W), Black, SKU A2667114 — $29.99 at anker.com, in stock.**
https://www.anker.com/products/a2667?variant=41581366575254

Why: well under budget, the maker's own page publishes the full per-port split (so you know exactly what you get when sharing), huge reported stock, free US shipping stated, 30-day any-reason returns, and the price/stock are embedded in the page HTML (JSON-LD + variant JSON) so a plain fetch can re-check it.

Tradeoff: when two USB-C devices are plugged in, the 735 drops to **45 W + 20 W** (and 40 + 12 + 12 W with all three). If you need to charge a 65 W laptop *and* something else at full speed, the **Anker Prime 67W ($49.99)** keeps 65 W combined across two ports — but it costs $20 more (right at the $50 cap) and Anker does not publish how that 65 W is split per port. The **UGREEN** is a near-equivalent to the 735 (same 45 W + 20 W two-USB-C split per third-party manual) and could be ≈$28 with the 30% code, but its list price is $39.99, the discount application is unverified, and its sharing table isn't on the US page.

## Missing / unverified info
- Exact tax and final shipping for any candidate (requires address at checkout; not attempted).
- Guest checkout support is inferred from Shopify-based stores, not tested (no cart/checkout per rules).
- Anker Prime 67W: per-port split in 2-port (C1+C2) and 3-port modes not published (only combined maxima).
- UGREEN 10334: US page gives no textual port-sharing table; third-party sources conflict (8.5 W vs 7.5 W for the secondary ports in 3-port mode). Whether "UL10334 Save 30%" auto-applies, and the resulting price, is unverified.
- Delivery date estimates: not shown in fetched HTML for any candidate.
- Anker free-shipping "coupon" wording suggests possible limits; exact conditions not verified.
- Anker 735 variants A2667111/A2667113 exist in page data but only Black (A2667114) had price/stock exposed.
