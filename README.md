# Assistant Benchmark

Real tasks. Each assistant's own tools. Evidence you can question.

**[Explore the results →](https://www.assistant-benchmark.com/)**

Assistant Benchmark is an open-source project that tests how well AI assistants handle everyday tasks. Can they research a purchase, get to checkout, deliver a reminder on time, or come back later with an update?

Each assistant uses its **own tools and capabilities**. The project evaluates the complete assistant experience: the model, its tools, and how reliably they work together.

## What we test

- **Research:** Compare products against a brief and support recommendations with sources.
- **Shopping:** Prepare a checkout and hand it back to the user before payment.
- **Scheduling:** Deliver reminders, handle changes and cancellations, and do work at a later time.
- **Files:** Turn messy information into usable files with accurate calculations.
- **Browser, computer, and memory:** Complete browser forms, operate a desktop app, and retrieve and update durable preferences.

The website now uses **11 individual tests**, each with its own [standalone benchmark skill](docs/SKILLS.md), evidence checklist and report. Tasks run one at a time. The project also includes a local harness for comparing models with a shared set of tools.

Human-operated [voice-mode tests](manual-testing/voice-mode/README.md) cover interruptions, spoken corrections, noisy speech, screen awareness, reminders, and continuity between voice and text. They include shared test pages, scoring criteria, and a results template.

## Current results

The individual task catalog covers **ChatGPT Dots, GrokBot, Instinct, and Muse**, starting with Dots. Every assistant has the same 11 task slots. The site shows reviewed passes, review coverage, pending work and unrun tests. Not-started tests are not failures.

Results are provisional observations, not a definitive ranking. Different environments and timing affect outcomes. Reviews are AI-assisted with Codex and are not blinded or independently replicated. [Read the methodology and limitations.](docs/METHODOLOGY.md)

The earlier multi-task pilot is retained as [historical data](benchmarks/legacy/reviews/everyday-pilot-20261002.json); its scores are not mixed into the current website.

## An open process

This repository shares the website, benchmark tasks, agent skills, review criteria, and selected evidence so people can inspect the process and challenge the conclusions. Private conversations and session records are excluded, so some judgments cannot be fully reconstructed from the public evidence alone.

Corrections, repeat evaluations, and independent reviews are welcome. See [Contributing](CONTRIBUTING.md) and [Release provenance](docs/PROVENANCE.md).

Assistant Benchmark began as **Paces**; that name remains in historical benchmark files. The project is independent of the assistant vendors evaluated.

Original code and documentation are [MIT licensed](LICENSE). Third-party assets and evidence retain their respective rights; see [NOTICE](NOTICE).
