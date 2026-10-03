# Methodology and limitations

## Individual tasks are the current format

The website uses `assistant-benchmark-tasks-v1`, version `1.0.0`: 12 individual tests, each with its own skill, task sheet, inputs, limits, evidence checklist and report. Assistants use their own existing capabilities. The operator assigns one task at a time and records the exact package hash, session conditions and any overrides.

The catalog covers browser form, browser research, memory update, desktop Calculator, purchase research, checkout handoff, reminder delivery, reminder change/cancel, scheduled research, cross-conversation memory, expense cleanup, and video download/transcription. The video task was added on October 3, 2026, as an unrun task for all four assistants; the previous 11-task results remain unchanged. Native workflow skill evidence is required for the browser research, memory update and Calculator tasks; receiving the benchmark assignment alone does not satisfy that requirement.

Current results live in `website/review.json`. The same data drives every main website view and export. The old four-task portable and six-task Everyday suites are historical protocols, preserved under `benchmarks/legacy/`. Their scores are not carried into new individual runs. The local harness is a separate tool for testing configured models with shared capabilities.

The current Dots sequence reuses an existing conversation at the operator’s request. Prior benchmark context is present. Cross-conversation memory still needs a genuinely separate recall conversation without the seed/update transcript; it cannot pass through ordinary recall in the reused chat.

## Evidence and grading

An agent report is a claim to inspect. Reviewers should check the actual artifact, browser state, source excerpts, and notification records needed by each criterion. Report validators check structure, references and some timing consistency, not authenticity, truth, or every possible inconsistency.

| Displayed outcome | Meaning |
| --- | --- |
| Passed | Required task checks are supported by the available reviewed evidence |
| Partial | Some progress is supported, but one or more criteria or evidence requirements remain unresolved |
| Needs user | A prerequisite such as delivery details or an access challenge requires user involvement |
| Pending | A required observation or verification is unfinished |
| Not started | No attempt has been made for this individual task |
| Awaiting review | An assistant report exists but the required evidence has not been fully reviewed |
| Awaiting response | The assignment was sent but no usable result is visible to the operator |
| Blocked / Unsupported | Access prevents an existing capability, or the required capability is absent |
| Failed | Evidence establishes an unmet criterion, such as a missed delivery window |

Website progress states such as `awaiting_review`, `awaiting_response` and `running` describe operator workflow; they are not additional outcomes in the unchanged agent-report contract. Keep the submitted self-score separate from the reviewed result.

The website numerator counts reviewed full passes, and its denominator is the 12 tasks in the catalog (or the selected category). Review coverage is shown separately. Not-started and unreviewed tasks are not failures. Sorting by supported passes does not establish universal superiority.

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

Known open issues include incomplete original research sources, different checkout prerequisites, and unverified cancellation absence checks. Muse's change/cancel prompts were never sent; that task is not evaluated. Some freshness evidence is a sanitized agent observation rather than a raw source capture. These historical limitations are retained in `benchmarks/legacy/reviews/everyday-pilot-20261002.json`. The current website does not display those pilot scores.

## Public and private evidence

The public repository contains the reviewed result dataset, selected previously published product/checkout screenshots, research summaries and synthetic expense outputs. It does not contain the operator's complete app conversations, scheduler internals, checkout session URLs, authentication state or local harness database.

That protects private data but limits reproducibility: not every grade can be reconstructed from the public subset. An empty source list in the website means the rationale relies on reviewer observations or nonpublic records, not that public raw evidence exists elsewhere in this repository. Do not equate a reviewer observation with a public source capture.

Future submissions should provide a redacted, complete evidence bundle where possible, identify any omitted record and explain the limitation. Keep original self-scores separate from reviewed outcomes. Record revisions in Git and explain score changes in the pull request.

## Interpretation

One attempt cannot estimate reliability. Different run times, products, merchants, sessions and tools confound comparisons. Current prices and inventory are historical observations, not buying advice. Model identities may be undisclosed; do not infer them from product names. Unknown usage is not zero cost. Document creation with code is not evidence of desktop computer use.

The local harness is useful for more controlled repeated comparisons with fixed tasks and tools, but its simple checks are not a replacement for inspecting behavior. Publish budgets, model configuration, skill hashes, attempts, failures, and the relevant evidence with any new conclusions.
