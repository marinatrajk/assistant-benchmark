# Best AI Agent for [ ]

Real tasks. Each assistant's own tools. Evidence you can question.

**[Explore the results →](https://www.assistant-benchmark.com/)**

Best AI Agent for [ ] is an open-source project that helps people choose an AI assistant for a specific task. Can it research a purchase, get to checkout, deliver a reminder on time, or come back later with an update?

Each assistant uses its **own tools and capabilities**. The project evaluates the complete assistant experience: the model, its tools, and how reliably they work together.

## What we test

- **Research:** Compare products against a brief and support recommendations with sources.
- **Shopping:** Prepare a checkout and hand it back to the user before payment.
- **Scheduling:** Deliver reminders, handle changes and cancellations, and do work at a later time.
- **Video:** Download YouTube and TikTok videos and deliver verified, timestamped transcripts.
- **Files:** Turn messy information into usable files with accurate calculations.
- **Browser, computer, and memory:** Complete browser forms, operate a desktop app, and retrieve and update durable preferences.

The website now uses **12 individual tests**, each with its own [standalone benchmark skill](docs/SKILLS.md), evidence checklist and report. Tasks run one at a time. The project also includes a local harness for comparing models with a shared set of tools.

Human-operated [voice-mode tests](manual-testing/voice-mode/README.md) cover interruptions, spoken corrections, noisy speech, screen awareness, reminders, and continuity between voice and text. They include shared test pages, scoring criteria, and a results template.

## Current results

The individual task catalog covers **ChatGPT Dots, GrokBot, Instinct, and Muse**, starting with Dots. Every assistant has the same 12 task slots. The site shows reviewed passes, review coverage, pending work and unrun tests. Not-started tests are not failures.

Choose a use case to fill the brackets and compare its task results. Each assistant's labels are derived from **reviewed full passes on every mapped test**. Reminders, for example, requires both timely delivery and successful change/cancel. Labels describe the tested scope. See [the use-case mapping](docs/USE_CASES.md).

Results are provisional observations, not a definitive ranking. Different environments and timing affect outcomes. Reviews are AI-assisted with Codex and are not blinded or independently replicated. [Read the methodology and limitations.](docs/METHODOLOGY.md)

The earlier multi-task pilot is retained as [historical data](benchmarks/legacy/reviews/everyday-pilot-20261002.json); its scores are not mixed into the current website.

## An open process

This repository shares the website, benchmark tasks, agent skills, review criteria, and selected evidence so people can inspect the process and challenge the conclusions. Private conversations and session records are excluded, so some judgments cannot be fully reconstructed from the public evidence alone.

Corrections, repeat evaluations, and independent reviews are welcome. See [Contributing](CONTRIBUTING.md) and [Release provenance](docs/PROVENANCE.md).

Best AI Agent for [ ] was previously **Assistant Benchmark** and began as **Paces**; those names remain in historical benchmark files and protocol identifiers. The project is independent of the assistant vendors evaluated.

Original code and documentation are [MIT licensed](LICENSE). Third-party assets and evidence retain their respective rights; see [NOTICE](NOTICE).
