# Website deployment

The public site is static. The repository-level `vercel.json` serves only `website/` and preserves the historical `/results/` redirect. The local harness is not a public web service and must not be deployed with it.

## Vercel

Import this GitHub repository into Vercel with the repository root as the root directory. Framework preset: Other. No build command is required; the configuration's output directory is `website`.

For an existing authorized project:

```sh
npx vercel link
npx vercel deploy --prod
```

Link your own account/project. No Vercel project IDs, credentials, or account environment files are included. Custom domains are configured in the Vercel project's domain settings.

The project's display name is **Best AI Agent for [ ]**. The public site is <https://www.assistant-benchmark.com/>. The Vercel alias <https://paces-beta.vercel.app/> remains available and retains the earlier Paces project name.

## Static hosting elsewhere

Serve the contents of `website/`. It uses relative assets and hash routes, so there is no SPA rewrite requirement. Update the canonical social-preview image URLs in `website/index.html` for your deployment. Only Vercel applies the `/results/` redirect automatically.

Serve `fixtures/` as a **separate site root** if agents need publicly accessible synthetic test pages. Do not mix fixture answer pages into the results website. Keep fixture mode and origin explicit in each report.

## Result updates

Edit `website/review.json` with evidence-backed individual task results. It is the single dataset for the main list, grid, profiles, comparison, exports and methodology. Its 12 task IDs and order match `benchmarks/task-catalog.json`. Adding an assistant also requires updating the `names` and `info` registry in `website/app.js` and providing its icon. Run repository checks and inspect list, grid, profile, comparison and tooltip views before deploying. Check that new public evidence contains no personal or session data.

The same dataset contains `project_name` and `use_cases`. Labels are derived from reviewed full passes on all mapped tasks; update the mapping only when its task scope is justified. The repository checker verifies mapping integrity, and `cd harness && npm run test:site` checks labels, use-case links and responsive site views. See [use-case labels](USE_CASES.md).

The new video task serves its protocol and skill ZIP from `website/protocols/` and `website/downloads/`. When revising it, rebuild the skill and ZIP, copy the protocol and archive into those folders, and update its `package_sha256` in `website/review.json`. The repository checker verifies that both published copies match the source protocol and generated package. Existing task links remain pinned to their original release.

The six-task pilot is archived at `benchmarks/legacy/reviews/everyday-pilot-20261002.json`. It is no longer displayed or exported by the website. The previous `#skill-runs` routes resolve to the main individual-task views, and `/skill-runs.json` redirects to `/review.json` on Vercel. Package checks do not execute assistant tests.
