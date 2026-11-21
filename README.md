# swapr-web

The single-page web app for swapr, a barter marketplace where users trade their own items for nearby items instead of paying money. It is built with React, Vite and TypeScript and hosted on Cloudflare Pages.

## Requirements

- Node 24 (pinned in `.nvmrc` and in `engines` in `package.json`). With nvm, run `nvm use`.
- npm, using the committed `package-lock.json`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server on http://localhost:5173 |
| `npm run lint` | Runs ESLint and fails on any warning |
| `npm run typecheck` | Runs the TypeScript compiler without output |
| `npm test` | Runs the Vitest unit tests once |
| `npm run build` | Builds the production bundle into `dist` |
| `npm run preview` | Serves the built `dist` locally |

## Local setup

1. Run `npm install`.
2. Copy `public/config.example.json` to `public/config.json`. The copy is gitignored.
3. In `public/config.json`, replace the placeholders with the QA Supabase project URL and anon key.
4. Run `npm run dev` and open http://localhost:5173.

The build never ships `public/config.json`. It is removed from `dist` after every build, and CI writes the real one at deploy time.

## Runtime config

The app loads `/config.json` from its own origin before it renders anything. The bundle holds no environment values and no defaults, so one build runs in every environment. If the file is missing, is not valid JSON, lacks a key, has an empty key or has an unknown `environment`, the app shows a "Configuration error" screen.

| Key | Purpose |
|---|---|
| `environment` | `local`, `qa` or `prod`. The header shows it as a badge except in `prod`. |
| `supabaseUrl` | The Supabase project URL for sign-in in that environment |
| `supabaseAnonKey` | The Supabase anon key for that environment. It is public, but still comes from config. |
| `userServiceUrl` | The base URL of `user-service` in that environment (`http://localhost:8081` locally) |

Code reads the loaded config with the `useConfig` hook from `src/config.tsx`.

## Pipeline

The `pipeline` workflow in `.github/workflows/pipeline.yml` has three jobs:

- `verify` runs on every push to any branch: `npm ci`, lint, type check, unit tests and the production build. It uploads `dist` as an artifact kept for 7 days.
- `deploy-qa` runs after `verify` on a push to `main`, in GitHub Environment `qa`. It writes `config.json` into the artifact from the Environment's variables, deploys it to the Pages project `swapr-web-qa`, and then fails unless `https://swapr-web-qa.pages.dev/config.json` reports `environment` `qa` and the Environment's `SUPABASE_URL`. QA deploys run one at a time and are never cancelled.
- `deploy-prod` runs after `deploy-qa`, in GitHub Environment `prod`, and waits for a required reviewer to approve it. It deploys the same artifact to `swapr-web-prod` the same way, never rebuilding. A newer run cancels an older one still waiting or running.

Static hosting files in `public` are published at the root of the build: `_redirects` sends every path to `index.html` so deep links and reloads work, and `_headers` serves `/config.json` with `Cache-Control: no-cache`.

## One-time setup

1. In Cloudflare, create two Pages projects using direct upload (not git integration), named `swapr-web-qa` and `swapr-web-prod`, each with production branch `main`.
2. Create a Cloudflare API token with the permission Account → Cloudflare Pages → Edit, and note the account ID.
3. In this GitHub repo, create the Environments `qa` and `prod`. In each, add:
   - secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`;
   - variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `USER_SERVICE_URL` with that environment's values. `USER_SERVICE_URL` is `user-service`'s Render URL for that environment. These are variables, not secrets, because they end up public in `config.json`.
4. On `prod`, add yourself as a required reviewer.
5. After the first green run, open both `*.pages.dev` URLs and check the layout at phone and desktop widths. QA should show the "qa" badge, and prod should show no badge.
