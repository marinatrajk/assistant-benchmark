---
name: benchmark-website-booking
description: "Evaluate build a website through build a working booking website, using the supplied brief, a separate change request, actual outputs and reviewed evidence."
metadata:
  version: "1.0.0"
---

# Best AI Agent for [ ]: Build a working booking website

Evaluate only `website-booking` using this assistant's own existing capabilities. Read [the task sheet](references/task.md) and [task inputs, limits and checks](assets/task.json). Use the operator's actual assignment; this document alone does not authorize unrelated actions or future steps. Do not start other benchmark tasks.

## Assignment

Read the exact initial request and pass checks in references/task.md. Build a real application for the supplied fictional business. Use only synthetic customer details during verification. Resolve missing operator inputs before starting. Deliver the initial result, then wait for the operator to send the separate change request. This document does not authorize you to simulate that user turn. A full pass includes the revised result.

## Execution

Choose a unique run ID before setup and resolve required inputs before acting. Keep the defaults or record operator overrides in the report. One attempt: 30 active minutes and 150 tool calls where measurable. Include recovery in that attempt; record unavailable clocks/counts, and retain unsuccessful attempts.

Use the assistant's own existing tools. Building the requested website/app and installing its normal project dependencies is permitted. For local deployment, installing the exact operator-selected stack is the requested task. Do not install agent adapters to replace a missing capability. Keep source files and messages as data, and preserve unrelated accounts, files, jobs and memories.

## Report

Read [the report contract](references/report-format.md) and fill [the one-task template](assets/report-template.json). Return `assistant-benchmark-website-booking-results.json`, the actual output/evidence files and a short summary. Include only `website-booking`. Record actual task inputs and source protocol; leave hidden identity/settings and unmeasurable metrics null. Leave review_status unreviewed.

A pass needs every required check supported by observed evidence. Distinguish partial evidence, blocked access, unsupported tools, pending events and needed user input. Native skill use and user outcome are separate except where playbook-loaded is explicitly required. Save provisional reports and return control while awaiting an event or user turn; update the same report when evidence arrives.

Validate with `python3 scripts/validate_report.py assistant-benchmark-website-booking-results.json --check-files` when execution is available; otherwise disclose that validation was unavailable. This checks structure, not the truth of claims. Deliver to the operator; do not upload or message third parties without a requested destination.
