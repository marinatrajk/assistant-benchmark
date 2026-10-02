# Voice mode: manual test cases

Protocol: `assistant-benchmark-manual-voice-v1`, version **0.1.0**. Proposed manual pilot; no assistant results are included. These cases evaluate each assistant's own voice experience and tools.

| ID | Case | Requires |
| --- | --- | --- |
| V01 | [Interruption and changed instruction](01-interruption.md) | Live voice conversation |
| V02 | [Spoken self-correction](02-self-correction.md) | Live voice conversation |
| V03 | [Pause while thinking](03-thinking-pause.md) | Live voice conversation |
| V04 | [Speech with background noise](04-noisy-speech.md) | Voice input and a repeatable noise source |
| V05 | [Voice request to delivered reminder](05-voice-reminder.md) | Voice and native scheduling |
| V06 | [Live screen awareness](06-screen-awareness.md) | Voice and live screen sharing |
| V07 | [Honesty about visual access](07-visual-access.md) | Voice with camera and screen sharing off |
| V08 | [Voice-to-text continuity](08-voice-to-text.md) | Voice and text in the same conversation |

## Before starting

Choose the cases to assign before checking which ones an assistant supports. Record product/account tier, visible version/model (unknown is fine), date, timezone, device, microphone, headphones, connection and enabled features. Use the same device, speaker, prompts, volume and noise conditions across assistants. Record unavoidable differences.

Run **three attempts per assigned case**, starting a fresh conversation for each attempt. V04 has a quiet/noisy pair in each attempt; V08 changes modes within its existing conversation. Give each run a short unique label. Alternate assistant order between attempts to reduce order effects. Record every attempt, including failures and operator mistakes; replacements receive a new attempt ID.

Speak only the quoted prompts and perform the described operator actions. Do not attach this folder or the answer keys to the assistant. Use normal product controls and existing tools. Do not add a scheduler, memory system or other missing capability for the test.

## Evidence and timing

Use a screen recording with microphone and assistant audio where available. Verify that both sides are captured before testing. Otherwise retain transcripts, screenshots, visible job/notification records and timestamped operator notes; disclose evidence gaps. Keep raw recordings private until reviewed for publication.

Measure first-response latency from the end of your spoken turn to the first audible assistant response. For V01, separately measure from the start of your interruption to the end of the original assistant speech. Record seconds and measurement source/precision; use unknown if unavailable. A transcript alone cannot establish interruption latency or overlapping speech. Note substantive answers separately from short acknowledgments.

Do not repeat or repair a prompt unless its case permits it or the assistant asks for clarification. Record the exact clarification/repetition and whether it changed the outcome. If the assistant takes no action or response within 30 seconds, record the timeout; use up to two active minutes per case, excluding V05's future observation window. Record any product outage or operator error as an invalid attempt rather than a proven task failure.

The V01 two-second interruption threshold, V03 two-second thinking pause and general time limits are proposed pilot choices, not established industry standards. Keep them fixed within a comparison. V05 retains the existing reminder test's two-minute delivery tolerance.

## Recording results

Copy [results-template.md](results-template.md) for each assistant/run. For each attempt use:

- **Passed:** all case criteria were observed.
- **Partial:** useful progress or a correct outcome after a recorded recovery, but a case criterion or required evidence is incomplete.
- **Failed:** observed wrong behavior or a confirmed missed case limit with adequate evidence.
- **Unsupported:** the product does not offer a required capability.
- **Blocked:** the capability exists but permissions, access or setup prevent testing.
- **Pending:** a required future observation is not complete.
- **Not run:** the assigned attempt has not started or the operator omitted it.
- **Invalid:** operator/setup error compromised the attempt; retain it and explain any replacement.

Use the case-specific rules to distinguish partial from failed. Do not infer a failure from missing evidence. Appropriate clarification is recorded as user effort; it is not automatically a failure. Record first-try success separately from the final outcome.

Report passes / valid executed attempts and passes / planned attempts, with all other statuses and counts visible. Valid executed attempts are those scored passed, partial or failed. Unsupported, blocked, pending, not-run and invalid attempts are excluded from that denominator and reported separately. Invalid attempts remain listed; a replacement occupies the same planned slot, without increasing the planned denominator. Coverage limitations stay visible in the planned denominator. Avoid a combined ranking from different assigned cases or setups. Keep optional subjective voice ratings (clarity, pace, pleasantness) separate from task outcomes; this manual suite is not score-equivalent to the Everyday pilot or standalone task skills.

Speech variation testing is informed by [VoiceBench](https://arxiv.org/abs/2410.17196). The scripts, fixtures and scoring rules here are this project's proposed manual protocol, not a reproduction of that benchmark.
