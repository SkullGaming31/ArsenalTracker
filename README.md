# arsenaltracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Homepage: https://SkullGaming31.github.io/ArsenalTracker

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

### Type-Check, Compile and Minify for Production

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
    }
  }
}
```

Notes:
- The top-level `version` is used for migrations; current version is `1` and should remain present in exported backups.
- `overrides` is a map keyed by the item name (warframe or weapon). Each override object is a partial set of the fields that appear on the original data; the store merges overrides onto the static data at runtime.
- Typical warframe override fields: `neuroptics_collected`, `chassis_collected`, `systems_collected`, `blueprint_collected`, `is_mastered`, and optional per-part resource arrays (e.g. `neuroptics_resources`).
- Typical weapon override fields: `parts_collected` (array of part names), `is_mastered`, or `parts` (detailed part shapes).
- You can export the current payload from the Dashboard (Export JSON) which uses the same versioned shape; importing accepts both the versioned shape and the legacy unversioned overrides map and will migrate automatically.

Be careful when editing backups by hand: the store expects JSON and will merge whatever keys you provide into the in-memory merged data. Prefer using the app's Export/Import workflow to create and restore backups.

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
