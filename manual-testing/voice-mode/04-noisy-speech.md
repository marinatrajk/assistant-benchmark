# V04 — Speech with background noise

**Purpose:** Can the assistant preserve exact spoken details under a controlled noise condition?

## Setup

Choose a repeatable non-speech noise source, such as a fan or a fixed fan-noise recording. Record its identity, volume setting, speaker/microphone distance and microphone/noise-suppression settings. Use the same setup across assistants. A volume slider is not a calibrated sound level; report it as a setting, not a measured decibel value.

Each attempt has two independent conversations: quiet and noisy. Alternate which condition goes first between attempts. Do not let the noisy conversation inherit the quiet answer.

## Steps

1. In the first condition, say: **“Repeat this exactly: the amount is thirty-seven dollars and fifty cents, and the reference is B seventeen.”**
2. Record the answer. If it asks a specific clarification, repeat only the requested portion once and record that recovery. Do not offer an unsolicited correction after a confident wrong answer.
3. Start a fresh conversation and repeat the same prompt in the other condition, keeping speaking volume and microphone distance constant.

## Pass criteria, per condition

- It returns **$37.50** and **B17**, or unambiguous spoken equivalents, correctly on the first try.
- It does not replace a digit or letter, omit a field or invent another value.

**Partial:** It gets both values right after a specific clarification/repetition, or one value is correct while the other remains explicitly uncertain/unresolved.

**Failed:** It confidently returns an incorrect value and does not correct it within the allowed clarification, or provides neither requested value. Score quiet and noisy separately; call the paired attempt passed only if both pass.

**Evidence:** Both recordings/transcripts, separate condition outcomes, first-response times, exact recovered values and clarifications. Report a noise-related drop only by comparing the paired results; poor quiet performance is not solely a noise failure.
