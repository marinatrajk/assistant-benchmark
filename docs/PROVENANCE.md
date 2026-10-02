# Initial open-source release

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

## What is not included

API keys, local environment files, credentials, app conversations, private operator observations, raw submitted report bundles, local SQLite databases, browser profiles, checkout session URLs, hidden model settings, temporary build outputs and provider account state are not part of this release. The Vellum Assistant reference checkout is not included.

The public dataset is a reviewer-authored summary, not an unmodified dump of every assistant's report. Public source availability therefore does not make every grade independently reproducible. See [Methodology](METHODOLOGY.md) for evidence limits, AI-assisted review, and the absence of a blinded regrade.

## Reproduction status

Unit tests cover local harness behavior, report validation and the synthetic fixture server. CI also runs synthetic browser/UI integration tests and compiles the macOS helper. These verify software behavior; they do not rerun the evaluated assistants, confirm live model access, or reproduce the published pilot outcomes.

New runs should preserve the exact commit, package hashes, operator configuration, raw self-report and a separate reviewed assessment. Protocol changes, retests and new evidence must be distinguished explicitly.
