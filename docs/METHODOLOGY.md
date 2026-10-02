# Methodology and limitations

## Three distinct evaluations

| Evaluation | What it tests | How it is judged |
| --- | --- | --- |
| Local harness starter tasks | Configured LLMs using this harness's shared tools | Instrumented checks plus human review; checks are intentionally simple |
| `paces-portable-v1` | Existing assistant browser, desktop, memory, and native skill capabilities | Four task sheets, evidence requirements, independent assessment of self-reports |
| `paces-everyday-v1` | Whole assistants performing everyday work with their own tools | Six assigned scenarios in this pilot; a seventh memory scenario is run separately |

These suites are not interchangeable. Their native-skill requirements differ: the portable suite explicitly requires skill evidence for certain full passes; Everyday task success and observed native skill use are separate fields.

The exact task criteria and budgets live in the versioned skill packages. The repository preserves the original files and SHA-256 manifests used for this pilot. The Everyday manifest's `pilot-not-yet-agent-tested` stage is historical package metadata from creation, not the current evaluation status.

## Evidence and grading

An agent report is a claim to inspect. Reviewers should check the actual artifact, browser state, source excerpts, and notification records needed by each criterion. Report validators check structure, references and some timing consistency, not authenticity, truth, or every possible inconsistency.

| Displayed outcome | Meaning |
| --- | --- |
| Passed | Required task checks are supported by the available reviewed evidence |
| Partial | Some progress is supported, but one or more criteria or evidence requirements remain unresolved |
| Needs user | A prerequisite such as delivery details or an access challenge requires user involvement |
| Pending | A required observation or verification is unfinished |
| Not tested | The scenario could not be evaluated, including missing operator follow-up steps |
| Failed | Evidence establishes an unmet criterion, such as a missed delivery window |

Portable reports additionally distinguish unsupported tools and blocked access. `not_evaluated` is a **website review status**; it is not a new value in the unchanged agent-report contracts. Preserve the original submitted status and record reviewer interpretation separately when collecting new results.

The website numerator counts full passes, and its denominator is the number of assigned tasks. It does not award fractional credit. A missing operator sequence is displayed separately and must not be described as an assistant failure. Sort order reflects these counts, not a claim of universal superiority.

## Timing

Record the due time, source-observation time, send time, and visible conversation receipt time separately. Use the configured timezone and explicit UTC offsets.

- Reminder delivery: not early, at most 120 seconds late, exactly once through the observation window.
- Scheduled research: a fresh observation after due, followed by an accurate source-linked update within five minutes.
- Change/cancel: observe creation, one updated active job, cancellation and no arrival through the later due time plus two minutes.

A scheduler creation confirmation is not delivery evidence. A minute-level platform timestamp supports an interval, not an exact second. Sender logs and worker timestamps must not be described as independently measured receipt latency. Conversation records do not establish push notification arrival or whether the user read the message. Merely passing a deadline in real time does not complete an unobserved absence check.

## Initial pilot provenance

GrokBot, Instinct and ChatGPT Dots ran on October 1, 2026. Muse ran on October 2. Each received the Everyday brief and used its own tools. Memory across fresh conversations was excluded. No purchase was placed.

The initial reviews were assembled with Codex using submitted files, available screenshots, spreadsheet/CSV contents, and accessible desktop app observations. They are **AI-assisted reviewer judgments**, not independent certification. Reviews were not blinded; different assistants expose different records. In particular, the Dots environment exposed detailed platform records. That can make its actions easier to verify without demonstrating a superior underlying model.

Muse was added after a separate audit. The prior three assessments were retained rather than regraded anonymously alongside it. This is a documented fairness limitation. An independent, anonymized regrade against one evidence standard is a useful next step, not something this release claims to have completed.

Known open issues include incomplete original research sources, different checkout prerequisites, and unverified cancellation absence checks. Muse's change/cancel prompts were never sent; that task is not evaluated. Some freshness evidence is a sanitized agent observation rather than a raw source capture. These limitations are attached to individual results in `website/review.json`.

## Public and private evidence

The public repository contains the reviewed result dataset, selected previously published product/checkout screenshots, research summaries and synthetic expense outputs. It does not contain the operator's complete app conversations, scheduler internals, checkout session URLs, authentication state or local harness database.

That protects private data but limits reproducibility: not every grade can be reconstructed from the public subset. An empty source list in the website means the rationale relies on reviewer observations or nonpublic records, not that public raw evidence exists elsewhere in this repository. Do not equate a reviewer observation with a public source capture.

Future submissions should provide a redacted, complete evidence bundle where possible, identify any omitted record and explain the limitation. Keep original self-scores separate from reviewed outcomes. Record revisions in Git and explain score changes in the pull request.

## Interpretation

One attempt cannot estimate reliability. Different run times, products, merchants, sessions and tools confound comparisons. Current prices and inventory are historical observations, not buying advice. Model identities may be undisclosed; do not infer them from product names. Unknown usage is not zero cost. Document creation with code is not evidence of desktop computer use.

The local harness is useful for more controlled repeated comparisons with fixed tasks and tools, but its simple checks are not a replacement for inspecting behavior. Publish budgets, model configuration, skill hashes, attempts, failures, and the relevant evidence with any new conclusions.
