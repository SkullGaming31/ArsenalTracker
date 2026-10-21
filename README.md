# arsenaltracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Homepage: https://arsenal-tracker.canadiendragon.live

How to contribute: see `CONTRIBUTING.md` for local setup, tests, and PR guidelines.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### TypeCheck, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

## Local storage / backup key

The app persists local overrides in localStorage under the key `arsenaltracker.v1`.
The persisted payload is a versioned JSON object. Example (representative, fields are flexible):

```
{
  "version": 1,
  "overrides": {
    "Rhino Prime": {
      "neuroptics_collected": true,
      "chassis_collected": false,
      "systems_collected": false,
      "blueprint_collected": false,
      "is_mastered": false,
      "neuroptics_resources": [
        { "name": "Credits", "quantity": 15000, "collected": true },
        { "name": "Alloy Plate", "quantity": 150, "collected": false }
      ]
    },
    "Braton Prime": {
      "parts_collected": ["Barrel", "Receiver"],
      "is_mastered": false
    },
    "Carrier Prime": {
      "mastered": true,
      "parts_collected": ["Chassis", "Systems"],
      "category": "robotics",
      "notes": "Companion override example: mastered + parts"
    }
  }
}
```

Notes:
- The top-level `version` is used for migrations; current version is `1` and should remain present in exported backups.
- `overrides` is a map keyed by the item name (warframe or weapon). Each override object is a partial set of the fields that appear on the original data; the store merges overrides onto the static data at runtime.
- Typical warframe override fields: `neuroptics_collected`, `chassis_collected`, `systems_collected`, `blueprint_collected`, `is_mastered`, and optional per-part resource arrays (e.g. `neuroptics_resources`).
- Typical weapon override fields: `parts_collected` (array of part names), `is_mastered`, or `parts` (detailed part shapes).
- Typical companion override fields: `mastered` or `is_mastered` (boolean), `parts_collected` (array of part names), `category` (e.g. `robotics`, `beasts`, `deimos`), and optional per-part resource arrays or notes. Companion overrides are stored in the same top-level `overrides` map keyed by companion name.
- You can export the current payload from the Dashboard (Export JSON) which uses the same versioned shape; importing accepts both the versioned shape and the legacy unversioned overrides map and will migrate automatically.

Be careful when editing backups by hand: the store expects JSON and will merge whatever keys you provide into the in-memory merged data. Prefer using the app's Export/Import workflow to create and restore backups.

### Twitch login

Twitch login uses the authorization-code flow in Vercel serverless functions. Create a Twitch application and set its OAuth redirect URL to `https://<your-domain>/api/auth/callback`. Add these values to the Vercel project environment (and to an ignored `.env.local` when using Vercel CLI locally):

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_REDIRECT_URI` — the exact callback URL registered with Twitch
- `SESSION_SECRET` — a private random value of at least 32 characters

Generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Never commit the Twitch client secret or session secret. Run `npm run dev` to use the local Vite app and API middleware.

#### Collection sync and Twitch Extension

The Dashboard's **Sync now** action sends the full merged Warframe, weapon, and companion collections to the server. The server associates the snapshot with the numeric Twitch account ID from the signed-in website session; clients cannot choose the account ID. The snapshot is private and is overwritten by the next sync.

Configure storage and extension access in the Vercel project environment:

- Create separate **private Vercel Blob stores** for production and development. Connect `prod-arsenal-tracker-blob` to this project for the **Production** environment, and `arsenal-tracker-blob` for **Development** (and Preview only if you want previews to use development data). Do not connect the development store to Production. Vercel supplies the store's `BLOB_STORE_ID` and OIDC credentials per connected environment, which the Blob SDK uses automatically. Redeploy after changing the store connections so the production functions receive the Production credentials.

  For local development, link the project and pull its Development variables into an ignored file:

  ```sh
  npx vercel link
  npx vercel env pull .env.development.local
  ```

  The Vercel Blob SDK uses `BLOB_STORE_ID` and `VERCEL_OIDC_TOKEN` for local OIDC access. A `BLOB_READ_WRITE_TOKEN` is an alternative for environments outside Vercel; keep it private.
- `TWITCH_EXTENSION_CLIENT_ID` — the Twitch Extension's client ID.
- `TWITCH_EXTENSION_SECRET` — the extension secret, base64-encoded as provided by Twitch.
- `TWITCH_EXTENSION_ORIGIN` — the exact HTTPS extension iframe origin(s), comma-separated if there is more than one. Do not include paths or trailing slashes.

The extension must enable identity sharing and request it from the embedded Twitch Extension Helper (`Twitch.ext.actions.requestIdShare()`). The API only returns a collection when the signed Extension JWT contains a linked numeric `user_id`; unlinked viewers cannot access account snapshots. Website OAuth uses the separate `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` settings above.

API contract:

- `POST /api/collection/sync` — requires the website's Twitch sign-in session cookie. Send `{ "version": 1, "collections": { "warframes": [...], "weapons": [...], "companions": [...] } }`. The response includes `syncedAt` and category counts.
- `GET /api/extension/collection` — send `Authorization: Bearer <Twitch Extension JWT>`. The response is the stored snapshot, including `user`, `syncedAt`, and `collections`. It returns `404` if that Twitch account has not synced yet.

The extension endpoint validates the JWT signature and expiry, checks the configured origin, and serves snapshots with private, no-store cache headers. Sync will return a storage error until the Blob store is connected and configured.

#### Read the snapshot in the Twitch Extension

Load the Twitch Extension Helper in the extension page. Enable identity sharing in the extension settings, then request it and fetch the snapshot whenever Twitch authorizes or refreshes the extension token:

```js
const trackerApi = 'https://<your-tracker-domain>'

Twitch.ext.actions.requestIdShare()

Twitch.ext.onAuthorized(async ({ token }) => {
  const response = await fetch(`${trackerApi}/api/extension/collection`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (response.status === 404) {
    showMessage('No collection synced yet. Sync from the tracker website first.')
    return
  }
  if (!response.ok) {
    showMessage('Unable to load the collection.')
    return
  }

  const snapshot = await response.json()
  const { warframes, weapons, companions } = snapshot.collections
  renderCollection({ user: snapshot.user, syncedAt: snapshot.syncedAt, warframes, weapons, companions })
})
```

Replace `trackerApi` with the deployed tracker origin. `showMessage` and `renderCollection` represent your extension's UI functions. The collection arrays contain the merged item records, including each item's `name` and progress fields. A `401` means the JWT is missing, expired, or has no linked viewer identity; a `403` means the extension origin is not in `TWITCH_EXTENSION_ORIGIN`.

The snapshot is now available to the extension UI. To use it for AI responses, send the question and only the relevant collection data to your own server-side AI endpoint. Keep AI provider credentials on the server; do not put them in the extension bundle.

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### ESLint overrides and why some paths are excluded

This repository intentionally excludes a few generated or Node-only paths from some strict ESLint rules to keep developer-facing lint output actionable:

- `docs/assets/**` — compiled/minified vendor and build assets live here; they can trigger rules like `no-unused-expressions` (minified code) and are not maintained by hand.
- `scripts/**` and `e2e/**` — utility and test helper scripts are Node-focused and sometimes use CommonJS `require()` for convenient scripting. The lint config disables the `no-require-imports` rule for these paths.

If you need to run the linter across these paths for a specific reason, you can temporarily enable rules or run `eslint` directly against the files. The CI/linting setup focuses on the `src/` code, tests, and Vue components which are the primary targets for type and style enforcement.
