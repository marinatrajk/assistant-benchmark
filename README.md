# Assistant Benchmark

Real tasks. Each assistant's own tools. Evidence you can question.

[Live results](https://paces-beta.vercel.app/) · [Methodology](docs/METHODOLOGY.md) · [Run a benchmark](docs/RUNNING.md) · [Release provenance](docs/PROVENANCE.md) · [Contribute](CONTRIBUTING.md)

Assistant Benchmark is an open-source project for testing what AI assistants can actually do: use a browser, prepare checkout, deliver reminders, research later, work with files, use skills, and remember preferences. It began as **Paces**; historical suite IDs, filenames, and skill names retain that name so existing reports remain compatible.

The public pilot compares **whole assistant products**, not just their underlying LLMs. GrokBot, Instinct, ChatGPT Dots, and Muse use their own capabilities. The optional local harness is a separate way to compare configured models using a shared set of tools.

## What's here

| Folder | Contents |
| --- | --- |
| [`website/`](website/) | The live results site's source, reviewed data, and selected public evidence |
| [`skills/paces-everyday/`](skills/paces-everyday/) | Everyday scenarios: shopping, research, scheduling, files, and an optional separate memory test |
| [`skills/paces-benchmark/`](skills/paces-benchmark/) | Original four-task portable benchmark, report validator, and local fixture server |
| [`harness/`](harness/) | Local model workbench with browser tools, macOS desktop tools, memory, three built-in skills, and tests |
| [`fixtures/`](fixtures/) | Static synthetic contact form and pricing pages |
| [`docs/`](docs/) | Operator instructions, grading rules, release provenance, and known limitations |
| [`tests/`](tests/) | Report-validator and fixture-server regression tests |
| [`scripts/`](scripts/) | Source checks and reproducible benchmark ZIP packaging |

## Preview the website

Python 3.10+ is sufficient; there is no frontend build step.

```sh
git clone https://github.com/marinatrajk/assistant-benchmark.git
cd assistant-benchmark
python3 -m http.server 4318 --bind 127.0.0.1 --directory website
```

Open <http://127.0.0.1:4318/>. The results data is [`website/review.json`](website/review.json); the rendering code is [`website/app.js`](website/app.js). The repository's Vercel configuration publishes only `website/`, not the local harness or private run data. See [deployment](docs/DEPLOYMENT.md).

## Give a benchmark to an assistant

```sh
python3 scripts/package_skills.py
```

This verifies the original package manifests and creates `artifacts/paces-everyday.zip`, `artifacts/paces-benchmark.zip`, and checksums. Attach the relevant ZIP and its `INVOCATION.txt` to a fresh conversation, or use the product's documented native skill mechanism. Reading an attachment alone does not establish native skill loading.

The evaluated assistant uses its **own existing tools**. The benchmark files describe tasks and evidence requirements; they do not supply replacement browser, computer, memory, or scheduling capabilities.

The Everyday scheduling test needs the operator to send separate change and cancel messages. Checkout stops before purchase. [Read the operator guide before starting.](docs/RUNNING.md)

## Run the local harness

Requires Node **22.13+** (Node 24 recommended). Desktop control requires macOS; browser, memory, and skill tools are portable.

```sh
cd harness
npm ci
npm run setup
npm start
```

Open <http://127.0.0.1:4317/> and configure your own model endpoint and API key. The server binds to loopback. “Local” describes the runtime and storage: prompts, tool observations, and screenshots are sent to the model endpoint you choose. See the [harness README](harness/README.md) for permissions, storage, provider settings, and limitations.

## Checks

```sh
python3 scripts/check_repository.py
python3 scripts/check_public_files.py
python3 -m unittest discover -s tests -v
npm --prefix harness ci
npm --prefix harness run check
npm --prefix harness test
```

The harness also has browser and UI integration tests. Those launch a browser against synthetic local fixtures with a mocked model; they require Chrome or Playwright Chromium. Run them with `npm --prefix harness run test:browser` and `npm --prefix harness run test:ui`. No live model API calls, purchases, or desktop clicks are required by CI.

## How to read the results

- The October 1–2, 2026 results are a **small, provisional pilot**, one attempt per assistant.
- Passing means the published reviewer assessment found support for the task criteria. A valid JSON report is not proof that an action occurred.
- Partial evidence, required user input, pending verification, and an untested scenario are different from failure.
- Initial reviews were assembled with Codex from submitted files and accessible app observations. They were not blinded or independently replicated. Muse was audited later; the earlier grades were retained.
- Different products, merchants, run times, accounts, and tool environments affect difficulty. Counts are not a general model ranking.
- Private conversations and session records are omitted. Some published judgments therefore cannot be independently reconstructed from the public subset alone. Evidence provenance and gaps are described in the [methodology](docs/METHODOLOGY.md).

Corrections, stronger evidence, repeat runs, and independent reviews are welcome. Keep an unsuccessful attempt in the record rather than silently replacing it with a better run.

## License and credits

Original project code, benchmark instructions, and documentation are released under the [MIT license](LICENSE). Third-party logos, product screenshots, and submitted evidence retain their respective rights; see [NOTICE](NOTICE).

Built with assistance from Codex. Vellum Assistant inspired the local harness's separation of the agent loop, tool registry, memory, and on-demand skills. This implementation is standalone and does not include the Vellum source tree. Dependencies retain their own licenses. This project is independent of the assistant vendors shown in the results.
