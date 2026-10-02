# Paces — local agent evaluation

A lightweight, locally hosted workbench for comparing LLMs on **browser use, macOS computer use, memory, and skills**. One Node process, three direct dependencies, no build step, no Docker, and no external database.

## Start

Requires **Node 22.13+** (Node 24+ recommended). The browser uses installed Google Chrome on macOS, or Playwright Chromium elsewhere.

```sh
npm install
npm run setup
npm start
```

Open **http://127.0.0.1:4317**. In **Models → Configure**, enter your OpenAI API key. A key entered through the UI stays in server memory until restart. It is never returned to the frontend or included in configuration exports.

To retain your key across restarts:

```sh
cp .env.example .env
```

Edit `.env`, set `OPENAI_API_KEY`, then restart. `.env` and `.data/` are excluded from Git. Each custom profile can also read `RELAY_KEY_<PROFILE_ID>` from the environment, with its ID uppercased and hyphens changed to underscores. Official OpenAI, Anthropic, and Google endpoints use `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and `GEMINI_API_KEY`, respectively. A UI-entered key is shared with other profiles on that same official provider origin for the current process. Keys are never forwarded to a different origin; per-profile keys take precedence.

A fresh checkout needs dependency installation and setup. Native desktop control is optional and macOS-only.

## Run an evaluation

1. Configure the included model profiles or add your own. Use **OpenAI Responses**, **Anthropic Messages**, or **OpenAI-compatible chat** with the corresponding provider base URL. A local example is `http://localhost:11434/v1`; use a model installed in your local runtime that supports tools and images.
2. Select the same tasks for each model. Set repeats and the maximum model rounds in Models.
3. Click **Run evaluation**. Combinations run sequentially to prevent competing browser/desktop actions. Browser tasks open a separate visible Chrome window by default.
4. Open any run to inspect arguments, tool results, screenshots, and the answer. Add a separate 1–5 human score and notes.
5. Compare results or export CSV / JSON.

Generation settings let you specify an output token budget, optional temperature, and optional reasoning effort. Unsupported options are reported as provider errors rather than silently discarded. The default profile uses `gpt-6-luna` through Responses; change it to any model available to your account.

**Sandbox** is for interactive exploration. It keeps conversation messages and a shared editable memory store. **Continue in sandbox** reuses a run's conversation; its browser starts fresh, and evaluation memory is not carried over.

## Historical model-profile presets

Existing profiles are preserved; these four presets are added once on upgrade:

| Profile | API model ID | Protocol |
| --- | --- | --- |
| Gemini 4 Argon | Awaiting verified API ID; disabled | Google OpenAI-compatible chat |
| GPT-6 Astra | `gpt-6-astra` | OpenAI Responses |
| Claude Fable 5.1 | `claude-fable-5-1` | Anthropic Messages |
| Claude Opus 5.5 | `claude-opus-5-5` | Anthropic Messages |

These are the historical preset labels and model IDs from the October 2026 pilot, preserved for source transparency. They are not a guarantee of current API availability. Configure the exact model ID and endpoint available to your own provider account. Gemini's preset is disabled until you supply an ID. Live calls require your own credentials; the automated tests use mocks.

Only the first enabled profile is selected initially. Select the profiles you want to compare; disabled profiles remain visible but cannot be queued. Provider adapters are tested with mocked HTTP responses; live calls require your own keys and access.

## Included tasks

| Task | What is checked |
| --- | --- |
| Complete a browser form | Correct local submission, form tools used, confirmation in final response |
| Research with a skill | `browser-research` loaded, correct plan and price |
| Recall and update memory | Existing preference searched, skill loaded, updated value stored, obsolete value gone |
| Use Calculator on macOS | Desktop observation and app opening, expected result in final answer |

The first two tasks use deterministic local fixture pages, not live websites. Each run gets its own fixture token, fresh browser context, and private seeded in-memory SQLite database. Evaluation memory is discarded afterward; trace output records the memory operations.

The Calculator task is deselected initially. Desktop tasks operate on the **actual primary display**, which is shared across runs. Reset the app state yourself between comparable desktop runs. These are functional starter tasks, not a statistically validated benchmark. Checks are simple evidence: a substring match or tool call does not establish the overall quality of the work. Review screenshots and final answers.

## Metrics and reproducibility

Every run records:

- Lifecycle status: queued, running, completed, failed, stopped, limit, or interrupted.
- Each automated check's result, separately from completion and human score.
- Agent-loop duration, model request latencies, first complete model response time, model call attempts, tool calls, and tool errors. Responses are not token-streamed; first-response time is **not TTFT**.
- Input/output token usage when the provider reports it, including reasoning tokens where included by the provider. `usageReportedCalls` indicates how many requests reported usage. Missing usage is not a zero-cost claim.
- Exact task, model profile, generation settings, tool capabilities, round limit, seed memory, system hash, skill instruction hashes, and returned model IDs where supplied.
- Timestamped persistent events with tool arguments, outputs, and screenshots.

Comparisons group by a configuration fingerprint. Changing a model, task, generation settings, system prompt, or skill instruction catalog creates a separate group. Reference-file contents are retained in tool traces if read; only the primary skill instruction bodies are included in the initial fingerprint. Use pinned model IDs and unchanged reference files for comparisons. Provider caching and live network conditions can still affect latency.

CSV contains summary rows. JSON includes configurations and full text traces, with screenshot paths served by the local app. To move screenshots and results together, copy `.data/`; JSON is not a self-contained image archive. No model price assumptions or automatic LLM judge are included.

## Custom tasks

Click **New task**. Provide the prompt, tool capabilities, initial memories, and a JSON array of checks:

```json
[
  { "type": "skill_loaded", "value": "browser-research" },
  { "type": "response_contains", "value": "Studio" },
  { "type": "tool_called", "value": "browser_navigate" }
]
```

Supported check types: `response_contains`, `tool_called`, `skill_loaded`, `memory_contains`, `memory_not_contains`, `browser_url_contains`, and `fixture`. Tool checks count successful calls only. Response checks inspect the final answer, not intermediate commentary. `{{fixture}}/form` and `{{fixture}}/plans` expand to that run's controlled pages. The `form-submitted` fixture check verifies Ada Lovelace / ada@example.com / Research.

## Skills

Drop a folder under `skills/` with `SKILL.md`:

```markdown
---
name: compare-options
description: Compare alternatives against the user's constraints.
---
1. Inspect the provided sources.
2. Eliminate options that do not satisfy the constraints.
3. Verify the remaining option and cite its source.
```

Click **Reload skills**. Descriptions are exposed in the initial catalog; the model uses `skill_load` for the full instructions and `skill_read` for supporting text files. Reference reads cannot escape the skill folder through traversal or symlinks. Additional directories can be configured with `SKILLS_DIR`.

This supports instruction/reference skills. It does **not** execute skill scripts, expand inline shell commands, or implement Vellum's custom `TOOLS.json` executors. Skills and source documents do not override the user's request. The model sees untrusted browser, memory, and reference content as observations.

## macOS computer use

`npm run setup` builds `native/desktop` using Swift and the macOS frameworks. Install Xcode Command Line Tools if needed (`xcode-select --install`). In **System Settings → Privacy & Security**, enable:

- **Accessibility** for the terminal or app launching Paces, to click, type, and send keys.
- **Screen Recording / Screen & System Audio Recording** for screenshots.

Depending on macOS attribution, the helper may appear separately; grant access to the listed launching application/helper, then restart Paces. The Models page shows the helper's observed permission status. The app never changes these permissions automatically.

Screenshots are rendered at logical primary-display dimensions to match click coordinates. Tools support screenshots, clicks/double clicks/right clicks, drag, Unicode text, common keyboard shortcuts, scrolling, and opening named apps. Native desktop actions currently support **macOS only**. Browser, memory, and skills are portable.

## Local operation

- HTTP binds only to `127.0.0.1`. Host/Origin validation and a per-process request token protect writes from unrelated websites. This is a single-user local application, not a multi-user remote service or OS sandbox.
- Selected prompts, memory, skill instructions, tool outputs, and screenshots go to the configured model endpoint. “Local” refers to the runtime, tools, database, and UI. Local inference requires a local compatible provider.
- Sandbox memory, conversations, configurations, runs, and traces live in `.data/relay.sqlite` (the original filename is retained to preserve existing data). Screenshots live in `.data/screenshots/`. These local records may contain content observed during tasks.
- Stop cancels in-flight model requests and closes the run's browser. Completed desktop actions are not undone. Unfinished runs are marked interrupted after restart.
- Browser state is always fresh, including Sandbox runs. Browser tools cover the main document and opened tabs; iframe/shadow-DOM and file upload/download workflows are not first-class in this version.
- APIs have a 120-second request timeout. Browser actions have bounded timeouts. There are no hidden retries. Older tool observations are truncated, with only the latest two screenshots retained in model context; complete traces remain local.

Configuration: `PORT`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_MODEL`, `DATA_DIR`, `SKILLS_DIR`, `BROWSER_HEADLESS=true`.

## Code map

```text
src/server.js      Local HTTP API, run queue, profiles, and fixtures
src/agent.js       Provider → tool → observation loop, budgets, metrics
src/provider.js    OpenAI Responses + compatible Chat Completions adapters
src/anthropic.js   Native Claude Messages and signed tool-loop context
src/profiles.js    Provider presets, availability, and configuration validation
src/tools.js       Validated, capability-scoped tool registry
src/browser.js     Isolated Playwright browser and fresh element references
src/computer.js    macOS helper bridge and screenshots
native/desktop.swift  Quartz/AppKit input actions
src/store.js       SQLite sessions, memories, search, traces, settings
src/skills.js      Local discovery, lazy instruction and reference loading
src/evaluate.js   Task definitions, checks, CSV export
public/           Dependency-free UI
```

Vellum Assistant inspired the separation of the agent loop, tool registry, memory, and on-demand skills. This is a standalone implementation; it does not depend on or modify the Vellum checkout.

Provider details follow the [OpenAI function-calling documentation](https://developers.openai.com/api/docs/guides/function-calling). Browser operations use [Playwright](https://playwright.dev/docs/api/class-page), and persistence uses [Node SQLite](https://nodejs.org/api/sqlite.html).

## Verify

```sh
npm run check
npm test
npm run test:browser
npm run test:ui
```

Tests use mock model responses and isolated temporary databases. The browser integration test drives a real browser through a form, deliberately tries a stale reference, recovers, and verifies checks plus screenshot delivery. UI tests exercise actual model/memory/task forms and a run inspector. Provider tests verify native Claude tool results, image observations, signed thinking, and compatible-chat tool signatures. Tests do not send requests to live model providers or perform native desktop clicks.
