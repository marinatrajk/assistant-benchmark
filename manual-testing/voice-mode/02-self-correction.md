# V02 — Spoken self-correction

**Purpose:** Does the assistant keep the corrected fact and discard the superseded one?

## Steps

1. Say naturally, as one spoken turn: **“Write a short note: the meeting is Thursday—sorry, Friday—at two fifteen p.m. Read the final note back to me. Don't create a calendar event.”**
2. Listen to the final note and inspect the transcript when available.

## Pass criteria

- The final note states **Friday at 2:15 p.m.**
- Thursday is not retained as another meeting date or an unresolved choice.
- It reads back the note and does not create an event.

No calendar date, timezone or meeting attendees need to be inferred for this note. Equivalent wording and time formatting are acceptable.

**Partial:** It initially asks which weekday you meant, then gets the correct note after you reply **“Friday.”** Record the clarification.

**Failed:** Its final note contains the wrong day/time, retains conflicting dates, or creates a calendar event despite the explicit instruction.

**Evidence:** Original utterance, returned note/readback, clarification if any, and any visible external action.
