# 2. browser-research
Prompt: Use a relevant skill from your own existing skill library for browser research to compare the three plans at `{fixture_base_url}/plans`. Which is the cheapest plan with at least 10 projects? Give its monthly price and cite the page.

Required checks:
- `playbook-loaded`: Native skill-load event for a relevant skill from the harness's own library, including its name. A document read alone is unverified for this check.
- `source-observed`: A browser observation of the actual page, including prices and project limits.
- `correct-choice`: The answer selects the cheapest qualifying plan and the correct monthly price, supported by the observation.
- `source-cited`: The final answer cites the exact visited plans URL.

Do not use a search snippet or fixture source code as page evidence. Record how each plan meets or misses the constraint.
