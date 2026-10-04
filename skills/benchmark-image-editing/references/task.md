# Prepare consistent product images

Category: **Photo editing / image generation**. Protocol: `assistant-benchmark-search-intents-v1`, version **1.0.0**. Task: `image-editing`.

## Scope and setup

The operator supplies the same three owned/licensed images and a short list of details to preserve to every assistant. This version tests editing; text-to-image generation quality needs a separate task.

- `product_image_1`: operator must supply this before execution.
- `product_image_2`: operator must supply this before execution.
- `product_image_3`: operator must supply this before execution.
- `details_to_preserve`: operator must supply this before execution.

Inputs are synthetic unless the operator explicitly supplies a named test environment or a frozen external source. Resolve every missing input before measured execution. Give every assistant the same files, conditions, change request and limits; record any override as a separate variant.

## Initial user request

> Using the three operator-supplied product photographs, remove the backgrounds and deliver three 1024×1024 transparent PNGs with consistent product scale and margins. Preserve product geometry, colours, label text and distinctive details. Include a contact sheet for inspection.

Deliver an inspectable initial result and return control. Retain its files and evidence. If a required environment or input is unavailable, report awaiting_user, blocked or unsupported with the actual reason.

## Separate operator change request

After receiving the first result, the operator sends:

> Increase the product scale by 10% in the second image only, retaining the 1024×1024 canvas, transparency and complete uncropped product. Deliver a separate revised file.

Only act on this when the operator sends it as a user turn. Preserve the first result and deliver a distinct revision. Until then, required follow-up remains outstanding and the task cannot receive a full pass.

## Pass checks and evidence

Every row must be supported by the actual output or observed system state. A prose promise or a self-reported completion is insufficient.

| Check ID | Required outcome and evidence |
| --- | --- |
| `correct-files` | All three initial PNGs decode at 1024×1024 with genuine alpha transparency; a painted checkerboard background does not pass. |
| `product-fidelity` | Side-by-side inspection confirms the original product colours, shape, label text and distinctive details were preserved. |
| `consistent-framing` | Initial images use consistent visual scale and margins, with no clipped product or leftover source background. |
| `revision` | Only the requested second image is revised; its product is about 10% larger, remains uncropped, and keeps the required dimensions/transparency. |
| `handoff` | Originals, initial outputs, revised output and contact sheet are identifiable; output files are actually delivered, not merely described. |

## Run record and review

One attempt: **20 active minutes**, **150 tool calls** where observable. Waiting for the operator does not consume active time. Record subscription/plan, enabled tools, elapsed time, active time, paid extras and user interventions in the evidence bundle. Unknown cost or usage remains unknown rather than zero. Count operator changes separately from extra help requested by the assistant.

Return the one-task report and actual output files or test-environment URLs. Cite a distinct evidence record for each check, retaining initial and revised artifacts. Keep the assistant report unreviewed. The operator independently opens/runs the output, verifies the checks and records the environment and observation times. The structural report validator does not establish artifact correctness.

Repeated attempts need new run IDs. One reviewed pass demonstrates this specific case; it does not establish broad category reliability, best-in-category status or subscription value.
