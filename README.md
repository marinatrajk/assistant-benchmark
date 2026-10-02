# Assistant Benchmark

Real tasks. Each assistant's own tools. Evidence you can question.

**[Explore the results →](https://www.assistant-benchmark.com/)**

Assistant Benchmark is an open-source project that tests how well AI assistants handle everyday tasks. Can they research a purchase, get to checkout, deliver a reminder on time, or come back later with an update?

Each assistant uses its **own tools and capabilities**. The public pilot evaluates the complete assistant experience: the model, its tools, and how reliably they work together.

## What we test

- **Research:** Compare products against a brief and support recommendations with sources.
- **Shopping:** Prepare a checkout and hand it back to the user before payment.
- **Scheduling:** Deliver reminders, handle changes and cancellations, and do work at a later time.
- **Files:** Turn messy information into usable files with accurate calculations.

The project also includes benchmark skills for browser use, computer use, and memory, plus a local harness for comparing models with a shared set of tools. Cross-session memory was not evaluated in the initial Everyday pilot.

## The first pilot

The October 1–2, 2026 pilot covers **ChatGPT Dots, GrokBot, Instinct, and Muse**, with one attempt per assistant. Results distinguish passes, partial completion, required user input, failures, pending checks, and tasks that were not tested.

These are provisional observations from a small pilot, not a definitive ranking. Different environments and timing affect the results. Initial reviews were AI-assisted with Codex, were not blinded or independently replicated, and did not receive identical review depth. [Read the methodology and limitations.](docs/METHODOLOGY.md)

## An open process

This repository shares the website, benchmark tasks, agent skills, review criteria, and selected evidence so people can inspect the process and challenge the conclusions. Private conversations and session records are excluded, so some judgments cannot be fully reconstructed from the public evidence alone.

Corrections, repeat evaluations, and independent reviews are welcome. See [Contributing](CONTRIBUTING.md) and [Release provenance](docs/PROVENANCE.md).

Assistant Benchmark began as **Paces**; that name remains in historical benchmark files. The project is independent of the assistant vendors evaluated.

Original code and documentation are [MIT licensed](LICENSE). Third-party assets and evidence retain their respective rights; see [NOTICE](NOTICE).
