# Quasar Migration Roadmap

This document outlines a prioritized, test-first roadmap to progressively migrate UI pieces to Quasar while keeping the app stable and tests passing.

## Goals

- Standardize layout with Quasar `QLayout`, `QHeader`, `QDrawer`, `QPageContainer`.
- Migrate controls and components progressively to Quasar equivalents for consistent look-and-feel.
- Keep unit tests and runtime behavior stable at every step.

## High-level priorities (order)

1. App shell & layout (done): wrap app with `QLayout` so Quasar drawers/headers are supported. (see `src/App.vue`)
2. Low-risk component: `AppFooter.vue` — replace with `QFooter`. Small, quick win.
3. Navigation: `NavBar.vue` — finalize hybrid drawer/aside behavior. Ensure accessibility, focus trap, and test IDs.
4. Cards: `WarframeCard.vue`, `WeaponCard.vue` — harmonize card components (Quasar card or keep PrimeVue PCard if desired). Validate virtualization sizing.
5. Page controls: `Warframes.vue`, `Weapons.vue` — migrate in-page inputs and toggles to `QInput`, `QToggle`, `QSelect` as needed.
6. Landing page: `Landing.vue` — migrate controls, tune particle settings and reduced-motion.
7. Remaining pages: `Dashboard.vue`, `About.vue`, `Primary.vue`, `Secondary.vue`, `Melee.vue` — migrate progressively.

## Per-step plan (detailed)

Step A — `AppFooter.vue` (low risk)

- What: Replace existing footer markup with `QFooter` preserving content and links.
- Why: Easy, small component to convert and validates Quasar installation in layout.
- Tests: Run `npm run test -- --run` after change. Add `global.plugins: [Quasar]` in tests that mount `AppFooter` if needed.
- Estimate: 15–45m
- Acceptance: Visual parity, tests pass.

Step B — Finalize `NavBar.vue` (medium risk)

- What: Ensure the hybrid design (desktop aside + mobile `QDrawer`) is robust: focus trap, Esc-to-close, backdrop click closes, `data-testid` attributes present for tests.
- Why: Central to mobile UX and navigation; must be reliable before other pages rely on it.
- Tests: Update `src/__tests__/NavBar.spec.ts` as needed. Mount with Quasar plugin in tests (`global.plugins: [Quasar]`) and ensure `q-drawer` is allowed within `QLayout`.
- Estimate: 1–3h (depending on edge cases)
- Acceptance: Mobile drawer works, desktop aside visible, tests pass.

Step C — Cards (`WarframeCard`, `WeaponCard`) (medium risk)

- What: Convert card markup to either Quasar `QCard` or standardize styling while preserving PrimeVue PCard if tests rely on it. Ensure IntersectionObserver and lazy image logic is intact.
- Why: Cards are used heavily by virtual-scroller — must avoid layout thrash.
- Tests: `WarframeCard.spec.ts`, `WeaponCard.spec.ts` should still mount and pass. Update selectors as needed.
- Acceptance: Cards show correct content; virtualization still renders correctly.

Step D — Page controls (`Warframes`, `Weapons`) (medium-high risk)

- What: Migrate page-level search and toggles to `QInput` / `QToggle`, harmonize props with AppHeader. Adjust virtual-row `itemSize` if needed.
- Why: Align UX across header + pages; avoid duplicate control implementations.
- Tests: Update page tests and ensure performance tests (virtualization) still pass.
- Acceptance: Controls behave identically; no CPU regressions.

Step E — `Landing.vue` (visual, medium risk)

- What: Replace controls with Quasar equivalents, add reduced-motion toggle, tune particle density/pausing.
- Why: Large visual area that benefits from controlled animations and Quasar controls.
- Tests: Minimal unit tests; perform manual visual smoke tests.

Step F — Remaining pages (low risk)

- What: Migrate small pages and controls as needed; finish theming via `src/quasar-variables.sass`.

## Testing & CI guidance

- Always register Quasar in unit test mounts: e.g.

```ts
import { Quasar } from 'quasar'
mount(MyComponent, { global: { plugins: [Quasar] } })
```

- If `q-layout` or other elements are stubbed by your test runner, disable that stub when you need children to render: `stubs: { 'q-layout': false }`.
- Add `data-testid` attributes to critical interactive elements (nav toggles, drawer items, search inputs) to avoid fragile selectors.

## Performance & accessibility notes

- Honor `prefers-reduced-motion` in CSS and Quasar components where possible.
- Throttle expensive scroll/layout recomputations using `requestAnimationFrame` and micro-throttles.
- Ensure `QDrawer` is focus-trapped when open and closes on `Esc` and backdrop clicks.

## Theming & style variables

- Use `src/quasar-variables.sass` to set Quasar color tokens and spacing to match the site's theme.
- Keep PrimeVue styles until you replace all PrimeVue components (if you keep both, ensure class names don't clash).

## Git & commit guidance

- Make small commits per step. Example:

```bash
git checkout -b feat/quasar-footer
git add src/components/AppFooter.vue docs/quasar-migration-roadmap.md
git commit -m "feat(quasar): migrate AppFooter to QFooter" -m "Replaces site footer with Quasar QFooter. Tests updated to register Quasar plugin." 
git push -u origin feat/quasar-footer
```

## Estimated overall effort

- Minimal rollout (footer + nav polish): 1–4 hours.
- Full control & cards migration: 6–12 hours depending on iteration and visual tuning.

## Checklist before merging each feature branch

- [ ] Unit tests (all) pass: `npm run test -- --run`.
- [ ] E2E / Playwright smoke run (if available) or local `npm run dev` manual check.
- [ ] Accessibility check for keyboard navigation (tab order, Esc close, aria labels).
- [ ] Add/adjust `data-testid` where tests rely on DOM structure.

---
If you want, I can start now with Step A (`AppFooter.vue`) and push a branch with the change. Which step should I implement first?
