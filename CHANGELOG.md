## 2025-10-22 16:40 - E2E stability and test fixes

- Updated Playwright configuration (`playwright.config.ts`) to improve test stability:
	- Increased global test timeout to 120s and expect timeout to 10s.
	- Set `workers: 1` to avoid browser startup contention during local runs.
	- Kept `retries` unchanged for CI.

- Hardened import/export E2E test (`e2e/import-export.spec.ts`):
	- Navigate via in-app nav buttons rather than directly visiting SPA routes.
	- Use Playwright `context.addInitScript` to seed `localStorage` before the app loads so persisted overrides are read on initialization.
	- Added stable selectors (data-testid) for nav buttons and Warframe cards to reduce selector flakiness.
	- Improved assertions to check the actual checkbox state for Neuroptics instead of brittle text-match assertions.

- Added helpers and debug scripts under `e2e/` to assist local troubleshooting:
	- `e2e/debug-print.cjs` — prints card DOM and checkbox states for a given card.
	- `e2e/debug-apply-storage.cjs` — launches Playwright and applies localStorage before loading the app to validate persistence behavior.

These changes were made to diagnose and resolve intermittent test failures where Playwright sometimes failed to create browser contexts (timeout), and to make the import/export flow deterministic under test.


## 2025-10-22 - CI / Pages housekeeping

- Removed GitHub Pages deployment workflows and the Discord CHANGELOG poster from the repository:
	- Deleted `.github/workflows/pages-deploy.yml`, `.github/workflows/pages.yml`, and `.github/workflows/post-changelog-discord.yml`.
	- Rationale: consolidate deployment strategy and avoid deprecated action usage; Pages deployment can be reintroduced with a single consolidated workflow when ready.


## 2025-10-22 - Data: weapons parts merge + CDN probe

- Added utilities and data updates to improve weapon/parts data quality:
	- `scripts/apply-merge-weapons.cjs` — merges component/parts data from `src/data/weapons.api.json` into `src/data/weapons.json` by matching weapon names (case-insensitive).
	- `scripts/check-cdn-coverage.cjs` — probes `https://cdn.warframestat.us/img/*` URLs to check image availability for weapons and component parts; emits `tmp-cdn-coverage.csv` and `tmp-cdn-coverage-summary.json`.

- Applied merge run (local):
	- `src/data/weapons.json` overwritten with merged data for weapons present in the original file.
	- Total weapons in the file after merge: 347.
	- Parts populated for 292 weapons; 55 weapons remained unmatched (their `parts` arrays left empty) due to naming variations between datasets.

- CDN probe results (local run):
	- Probed 974 distinct CDN URLs (weapon images and component images).
	- 238 URLs returned OK; 736 were missing or returned non-2xx responses.
	- Generated artifacts: `tmp-cdn-coverage.csv`, `tmp-cdn-coverage-summary.json`.

- Notes & recommended follow-ups:
	- The canonical source `src/data/weapons.api.json` still contains 621 weapons; the merge preserved the existing `weapons.json` records and populated parts where names matched.
	- Consider running a name-normalization pass or appending missing API weapons into `src/data/weapons.json` to reach full coverage.
	- If you want the current merged `weapons.json` committed, run `git add src/data/weapons.json && git commit -m "chore(data): populate weapons.parts from weapons.api.json"`.
	-More work done on Weapons data quality

## Unreleased - 2025-10-27

- Tests & coverage
  - Added focused unit tests for `App.vue` and expanded `Dashboard` import/export tests to assert exact import/apply flows.
  - Added multiple store and importer unit tests to exercise edge-cases (migration, debounce/save timing, beforeunload flush, duplicate merges).
  - Re-ran the test suite with coverage and adjusted `vitest` coverage config to exclude non-runtime files so reports focus on `src/` runtime code.

- Lint & minor fixes
  - Fixed several test files to remove unused imports/duplicate blocks and made assertions more specific (`toHaveBeenCalledWith` / `expect.any(String)` where appropriate).
  - Addressed a few lint false-positives by narrowing test imports and adjusting an ad-hoc e2e debug script to avoid ESLint import/require confusion.

- UX / persistence
  - Continued polishing persistence and UI: header extraction into `AppHeader.vue`, per-key overrides mutation to reduce reactive churn, and Dashboard import/CSV preview flows.

Notes:
- This commit includes many test additions and small lint/test fixes. A broader typing sweep (replace remaining `any` usages) is tracked separately and will be addressed in follow-up work.


## Unreleased - 2025-10-30

- Landing page & visuals
	- Increased landing particle density and switched to continuous spawn while the landing page is mounted (capped to avoid unbounded DOM growth).
	- Each particle now animates along a random vector (per-particle CSS variables --dx/--dy), with inline styles and global keyframes so dynamically-created nodes animate correctly across browsers.
	- Tuned particle size, color palette, opacity, duration, and glow for a denser, more dynamic hero effect.

- Global background and Dashboard
	- Introduced a Warframe-inspired animated background using layered CSS gradients and blurred "energy veins".
	- Moved the background visuals from `src/pages/Dashboard.vue` into the main layout (`src/App.vue`) so the effect is visible across the app.
	- Added subtle blurred energy orbs and slow-moving vein animation to provide a moody, sci-fi backdrop without shipping image assets.

- Navigation & header
	- Redesigned `src/components/NavBar.vue` to a translucent, Warframe-inspired navigation panel with inline SVG glyphs, per-button accent colors, hover glow and a clear active indicator.
	- Wired `App.vue` to pass `:activeView="view"` into `NavBar` so the active page is highlighted (improves discoverability).

- About page (user-focused)
	- Redesigned `src/pages/About.vue` for end-users: hero, clear usage steps, backup & restore guidance, privacy/local-storage notes (key: `arsenaltracker.v1`), troubleshooting tips, and support CTA (Discord).
	- Replaced developer/GitHub-first CTA with user-facing actions: Get Started, How it works (scrolls to features), and Help & Support (opens Discord).

- Miscellaneous
	- Updated local todo/tracking entries in the repository for these visual and UX changes.
	- Fixed small TypeScript/ESLint lints triggered by the edits (removed unused bindings, narrowed catch parameter, adjusted style tag mismatches during refactors).

Notes:
- These UI changes are intentionally implemented with CSS (gradients, blur, transforms) to avoid extra assets and to keep runtime cost moderate. Consider adding a "reduce motion" or "low-power" toggle for users on low-end devices or with accessibility needs.