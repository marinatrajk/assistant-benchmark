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

The public site is <https://www.assistant-benchmark.com/>. The Vercel alias <https://paces-beta.vercel.app/> remains available and retains the earlier Paces project name.

## Static hosting elsewhere

Serve the contents of `website/`. It uses relative assets and hash routes, so there is no SPA rewrite requirement. Update the canonical social-preview image URLs in `website/index.html` for your deployment. Only Vercel applies the `/results/` redirect automatically.

Serve `fixtures/` as a **separate site root** if agents need publicly accessible synthetic test pages. Do not mix fixture answer pages into the results website. Keep fixture mode and origin explicit in each report.

## Result updates

Edit `website/review.json` with evidence-backed changes. Adding an assistant currently also requires updating the `names` and `info` registry in `website/app.js` and providing its icon. Run repository checks and inspect list, grid, profile, comparison and tooltip views before deploying. Check that new public evidence contains no personal or session data.

The downloadable results graphic is explicitly labeled October 1; it is a historical snapshot of the first three assistants. Current results are in the interactive site and reviewed JSON.
