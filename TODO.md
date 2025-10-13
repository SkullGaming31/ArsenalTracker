# Arsenal Tracker - TODO

This file contains the project roadmap, current status, and suggested next steps. It is synced with the in-repo todo list and will be kept up-to-date as work progresses.

## Completed

- Convert Warframe CSV to JSON — Parsed Warframe_export.csv into the project's Warframe JSON schema.
- Write `src/data/warframes.json` — Created/overwrote the dataset used by the app.
- Run diagnostics — Type-checks and basic diagnostics were run after importing data.
- Ensure weapons display cards — `WeaponCard.vue` styles/markup fixed.
- Dashboard (landing page) — Dashboard with stats created.
- Add footer with social links — `AppFooter.vue` added and wired.
- Add social icons to footer — inline SVG icons added.
- Fix WarframeCard empty render — corrected invalid markup so cards render.
- Polish dashboard UI — enriched stat cards and progress visuals.
- Add CI workflow — GitHub Actions for type-check and tests added.
- Finish git init & initial commit — Local repo created and initial commit made.
- Push repository to GitHub — Remote created and initial push completed.
- Rename project to `arsenaltracker` — `package.json`, `README.md`, and references updated.
- Write project description — Short/medium/long descriptions drafted.
 - Configure repo metadata & GitHub Pages — homepage metadata added to `package.json`, `docs/index.html` created and pushed; Pages responding at the repository homepage URL.

## In-progress

None at the moment — short-term work items are listed under "Next steps (recommended)" and backlog.

## Backlog / Not started

The following items are planned improvements and features to make Arsenal Tracker more useful and production-ready.

1. Persist collection state
   - Persist collected/mastered state to `localStorage` with versioning and migration support. Add export/import backup flows.

2. Add mastered auto-mark + undo
   - When a Warframe/Weapon is marked mastered, auto-mark all parts/resources and set a local `mastered_date`. Show a temporary undo toast.

3. Bulk operations for weapons/warframes
   - Multi-select UI, bulk mark mastered/collected, bulk export, and undo support.

4. Pagination / Virtualization
   - Integrate virtual scrolling (e.g., `vue-virtual-scroller`) or pagination for long lists (weapons page).

5. Search improvements
   - Debounce search input, add fuzzy search (Fuse.js), highlight matches and add filter chips.

6. Import/Export runtime
   - UI to import Warframe CSV/JSON exports at runtime with validation and mapping preview. Allow exporting current state to JSON/CSV.

7. Add images/reference assets
   - Thumbnails for warframes/weapons with lazy-loading and an asset manifest. Optionally fetch from public APIs.

8. Update README/docs
   - Add contributor docs, explain Prime vs Standard data, how cards work, and include the roadmap and contribution guide.

9. Show warframe cards on dashboard
   - Replace the simple recent list with a small featured grid of `WarframeCard` components.

10. Add persistent local storage and backup
	- Versioned `localStorage` schema, backup/restore UI and guidance for users.

11. Runtime import/export (CSV/JSON) with validation
	- More advanced import flow with field mapping, error reporting and user feedback.

12. Make app a PWA (offline-first)
	- Add service worker, web manifest and offline caching so the app works offline and is installable.

13. Optional cloud sync / user accounts
	- Design an opt-in cloud sync using OAuth (GitHub/Google) and encrypted storage (e.g., Firebase or user Gists).

14. Export/restore via GitHub Gists or cloud providers
	- Quick export/import to Gist, Google Drive or Dropbox for multi-device sync.

15. Improve mobile/responsive UI & accessibility
	- Responsive design, touch-friendly controls, keyboard navigation, ARIA labels and WCAG basics.

16. Internationalization (i18n) support
	- Prepare strings for translation and add a locale switcher.

17. Image thumbnails & asset pipeline
	- Manifest-based assets, lazy-loading, and optional CDN integration.

18. Bulk operations & selection UI
	- Advanced multi-select and bulk action UX with confirmations and undo.

19. Performance: virtualized lists and pagination
	- Keep UI snappy by virtualizing long lists.

20. Advanced search: fuzzy, filters, highlighting
	- Fuse.js, filter chips and highlighted match UX.

21. E2E tests and automated QA
	- Expand Playwright tests, add nightly runs and cross-browser matrix.

22. Developer experience: CLI & dev scripts
	- Add scripts for CSV imports, seeding, pre-commit hooks (husky), linting and CI helpers.

23. Packaging & self-hosting (Docker)
	- Dockerfile and simple self-host instructions, plus Pages deployment workflow.

24. Docs, CONTRIBUTING, LICENSE and Code of Conduct
	- Add CONTRIBUTING.md, LICENSE (MIT suggestion), CODE_OF_CONDUCT.md and issue/PR templates.

25. Community & repo maintenance tasks
	- Labels, issue templates, a roadmap file, GitHub Topics and a project board for contributors.

## Next steps (recommended)

- Short term (1–2 days): Persist local state, add runtime export/import, and update README with contribution instructions.
- Mid term (1–2 weeks): Add PWA support, image thumbnails, and better search (Fuse.js). Add tests for persistence.
- Long term: Optional cloud sync, i18n, and enhanced CI with nightly QA runs.


Start scaffolding PWA support: add vite-plugin-pwa to the project, create manifest.webmanifest, and add a basic service worker strategy (cache-first for assets, network-first for API/data).
Implement Fuse.js search: wire a search store or composable, update search input with debounce and highlight results in WarframeCard.vue. DONE
Add image thumbnails pipeline: create public/assets/ manifest, update cards to lazy-load and fallback to SVG placeholders.
Add tests for persistence: create Vitest tests for src/stores/collection.ts offline behaviors and migration edge cases.
