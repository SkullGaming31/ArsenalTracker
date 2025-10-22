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

