# Release provenance

On October 3, 2026, the catalog gained a twelfth task: downloading and transcribing the supplied YouTube and TikTok videos. It has its own `assistant-benchmark-media-v1` protocol at version `1.0.0`. All four new result slots start as `not_run`; the original 11 packages and recorded outcomes are unchanged. The catalog denominator increases to 12 with review coverage shown separately.

## Current website format

On October 2, 2026, the website switched to the 11 individual tasks across its main list, profiles, comparison, methodology and JSON export. `website/review.json` is the current dataset. The previous six-task review was preserved unchanged at `benchmarks/legacy/reviews/everyday-pilot-20261002.json`; its scores are not carried forward into individual attempts. Old individual-run bookmarks resolve to the main views.

New individual attempts have their own run IDs, package hashes, execution conditions and reviewed evidence. Software and package test counts are separate from the number of assistant benchmark attempts completed.

## Initial open-source release

This repository begins with a clean source snapshot on October 2, 2026. It is not the complete development or conversation history. The project was developed with assistance from Codex before this repository was created.

## Included components

| Component | Source snapshot and changes for publication |
| --- | --- |
| Results website | Current Vercel results site, including Muse and its supplied logo; a GitHub footer link was added |
| Portable skill | `paces-portable-v1`, package version 1.0.1; original manifest-listed files preserved byte-for-byte |
| Everyday skill | `paces-everyday-v1`, package version 0.1.0; original manifest-listed files preserved byte-for-byte |
| Local harness | Existing Paces local harness source and tests; runtime data/dependencies/compiled helper excluded; README setup and historical model-preset wording clarified; license/repository metadata added |
| Static fixtures | Original synthetic form/pricing pages, excluding the obsolete duplicate results site |
| Public evidence | The selected files already present on the public results site, including synthetic expense outputs |

The release's packaged skill archives contain only their manifest and manifest-listed files. `SHA256SUMS` identifies the ZIP assets. `scripts/package_skills.py` recreates them with fixed archive metadata; it fails if a source hash differs from its original manifest. Aggregate repository release versions are separate from the two suite versions.

## Individual task skills, October 2, 2026

The four portable tests and seven Everyday scenarios now each have a standalone skill under `skills/`. The original two packages moved to `benchmarks/legacy/`, with their manifest-listed bytes preserved. Their original release archives remain available and can be reproduced with the packaging script's `--include-legacy` option.

The new format is `assistant-benchmark-tasks-v1`, version `1.0.0`. Each package records its source protocol and contains one task sheet, inputs, limits, report template and validator. Task criteria and default timing windows are retained; the new validator uses a consistent one-task report, permits sanitized traces when tool identifiers are withheld, and checks local evidence paths. Task selection and orchestration differ from the historical full-suite invocations, so the new reports are explicitly distinguished from pilot reports. No evaluated assistant was rerun, and no published pilot grade changed as part of this restructuring.

`benchmarks/task-catalog.json`, the frozen sheets and `benchmarks/task_report_validator.py` are the maintained sources. `scripts/build_task_skills.py` generates self-contained folders, and the repository checker verifies the generated content and manifests. Releases include one archive per skill plus a complete skill bundle; no package depends on an adjacent skill directory.

## What is not included

API keys, local environment files, credentials, app conversations, private operator observations, raw submitted report bundles, local SQLite databases, browser profiles, checkout session URLs, hidden model settings, temporary build outputs and provider account state are not part of this release. The Vellum Assistant reference checkout is not included.

The public dataset is a reviewer-authored summary, not an unmodified dump of every assistant's report. Public source availability therefore does not make every grade independently reproducible. See [Methodology](METHODOLOGY.md) for evidence limits, AI-assisted review, and the absence of a blinded regrade.

## Reproduction status

Unit tests cover local harness behavior, report validation and the synthetic fixture server. CI also runs synthetic browser/UI integration tests and compiles the macOS helper. These verify software behavior; they do not rerun the evaluated assistants, confirm live model access, or reproduce the published pilot outcomes.

New runs should preserve the exact commit, package hashes, operator configuration, raw self-report and a separate reviewed assessment. Protocol changes, retests and new evidence must be distinguished explicitly.
