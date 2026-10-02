# V06 — Live screen awareness

**Purpose:** Can the assistant reason from the currently shared screen and notice a change?

## Setup

Open [comparison-a.html](fixtures/comparison-a.html) locally in a browser. Use the same window size and zoom for every assistant, with the entire table visible. Share that window through the assistant's existing live screen-sharing feature. If live sharing is absent, mark unsupported; a screenshot-upload test is a separately labeled variant.

These pages are synthetic and require no network access. The scoring answers below are for the operator only. Do not upload this document or give the fixture files/source to the assistant. It should use the shared screen.

## Steps

1. With comparison A visible, ask aloud: **“Which is the cheapest charger on my screen with at least two USB-C ports and at least sixty-five watts total output, under fifty dollars? Give its name, price and why it qualifies.”**
2. After the answer, use the page's **Open comparison B** link. Wait three seconds for the shared screen to update.
3. Ask: **“The page has changed. Using what you can see now and the same requirements, which one should I choose, and what changed?”** Do not name the changed value.

## Pass criteria

- On A: **Cedar, $39, two USB-C ports, 65 W**. Birch has only one USB-C port; Spruce qualifies but costs more.
- On B: **Spruce, $45, two USB-C ports, 100 W**.
- It identifies Cedar's change from **65 W to 45 W**, which disqualifies it, and bases its second recommendation on the updated screen.

**Partial:** Only one stage is correct, the final choice is right but the reason/change is unverified, or a repeat screen observation is needed to recover from a stale frame.

**Failed:** Neither stage meets the criteria, or it continues confidently inventing screen details after the final request. Record a screen-sharing transport failure as blocked/invalid when it prevents a fair observation.

**Evidence:** Recording of the shared page, page switch, spoken prompts, both answers and any screen-refresh/repetition. This tests live visual context; it does not establish that the assistant controlled the browser or bought a product.
