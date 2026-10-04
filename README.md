# Best AI Agent for [ ]

Real tasks. Each assistant's own tools. Evidence you can question.

**[Explore the results →](https://www.assistant-benchmark.com/)**

Best AI Agent for [ ] is an open-source project that helps people choose an AI assistant for a specific task. Can it research a purchase, get to checkout, deliver a reminder on time, or come back later with an update?

Each assistant uses its **own tools and capabilities**. The project evaluates the complete assistant experience: the model, its tools, and how reliably they work together.

## What we test

The catalog covers **15 categories**: Travel planning, Email management, Research, Coding, Build a website, Build an app, Workflow automation, Personal assistant, Financial analysis / trading, Job applications / résumé, PowerPoint slides, Photo editing / image generation, Students / learning, Small business, and Run locally / self-hosted.

There are **27 individual tests**, each with a [standalone benchmark skill](docs/SKILLS.md), inputs, pass criteria and evidence requirements. The 15 new cases include an initial request and a separate change request: revise a travel budget, resolve an inbox/calendar conflict, fix a timezone bug, build and update a booking site, and more. All 15 start as **Not started**. The existing 12 tasks and their results are retained.

Tasks run one at a time using the assistant's own tools. The local harness separately compares models with a shared set of tools.

Human-operated [voice-mode tests](manual-testing/voice-mode/README.md) cover interruptions, spoken corrections, noisy speech, screen awareness, reminders, and continuity between voice and text. They include shared test pages, scoring criteria, and a results template.

## Current results

The individual task catalog covers **ChatGPT Dots, GrokBot, Instinct, and Muse**, starting with Dots. Every assistant has the same 27 task slots. The site shows reviewed passes, review coverage, pending work and unrun tests. Not-started tests are not failures.

Choose a category to fill the brackets, compare its results and open its test briefs and skill downloads. An assistant gets a category tag when at least one mapped test has been reviewed. The tag shows **reviewed passes / tests**, so it describes coverage and outcomes without claiming a complete category pass. See [the category mapping](docs/USE_CASES.md).

Results are provisional observations, not a definitive ranking. Different environments and timing affect outcomes. Reviews are AI-assisted with Codex and are not blinded or independently replicated. [Read the methodology and limitations.](docs/METHODOLOGY.md)

The earlier multi-task pilot is retained as [historical data](benchmarks/legacy/reviews/everyday-pilot-20261002.json); its scores are not mixed into the current website.

## An open process

This repository shares the website, benchmark tasks, agent skills, review criteria, and selected evidence so people can inspect the process and challenge the conclusions. Private conversations and session records are excluded, so some judgments cannot be fully reconstructed from the public evidence alone.

Corrections, repeat evaluations, and independent reviews are welcome. See [Contributing](CONTRIBUTING.md) and [Release provenance](docs/PROVENANCE.md).

Best AI Agent for [ ] was previously **Assistant Benchmark** and began as **Paces**; those names remain in historical benchmark files and protocol identifiers. The project is independent of the assistant vendors evaluated.

Original code and documentation are [MIT licensed](LICENSE). Third-party assets and evidence retain their respective rights; see [NOTICE](NOTICE).
