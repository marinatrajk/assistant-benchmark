# Prepare accurate job applications

Category: **Job applications / résumé**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `job-application-prep`.

## Scope and setup

Listings and candidate data are frozen synthetic inputs. This tests application preparation; no real employer submission is authorized.

- `input_file`: `assets/input.json`.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Use the supplied synthetic candidate profile and job listings. Find three active jobs matching the location, salary and seniority limits. Rank them, tailor a résumé for the strongest two, and prepare complete application field answers for review. Deliver usable résumé files and source-linked job IDs.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> The candidate can now consider hybrid jobs in Boston but needs at least USD 80,000. Re-evaluate the shortlist and revise the two application packets without inventing experience.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `job-matching` | The shortlist has three active roles that meet the current location, minimum salary and experience constraints; rejected listings have an accurate reason. |
| `truthful-resumes` | Both résumés retain only supported experience, skills, employers and dates from the profile; wording may change but facts may not. |
| `application-fields` | Each packet contains correct contact, location, work-authorization and role-specific answers; unknown fields are flagged for user input. |
| `usable-files` | Delivered résumés open and render cleanly; job IDs and the matching rationale are traceable. |
| `revision` | The Boston/salary change is applied throughout the revised shortlist, résumés and answers while preserving initial artifacts. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
