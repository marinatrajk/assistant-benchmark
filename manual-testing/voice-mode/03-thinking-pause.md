# V03 — Pause while thinking

**Purpose:** Can the assistant handle an unfinished spoken request?

## Steps

1. Begin: **“Help me choose dinner. Let me think…”**
2. Pause for **two seconds** without touching the microphone controls.
3. Continue: **“Choose between vegetable stir-fry and chicken pasta. I'm vegetarian. Give me one choice and one short reason.”**

## Pass criteria

- It allows the pause without launching a substantive dinner recommendation before you finish. A brief acknowledgment such as “take your time” is acceptable.
- It chooses **vegetable stir-fry**, with a reason consistent with the vegetarian constraint.
- It gives one choice and one short reason without requiring you to restart the request.

**Partial:** It starts a substantive answer during the pause but stops and incorporates the completed request correctly, or needs one clarification/repetition to recover.

**Failed:** The final recommendation is chicken pasta, omits the constraint, or remains unrelated to the two choices after your complete request.

**Evidence:** Audio/video showing the actual pause duration, any overlapping response, final choice and recovery. Record deviations if the pause differs materially from two seconds.
