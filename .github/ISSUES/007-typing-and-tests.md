---
title: "Replace remaining 'any' typings and add targeted tests"
labels: ["good first issue", "tech debt", "testing"]
assignees: []
---

## Summary

This issue tracks the remaining `any` usages across the codebase and proposes small, focused testing targets to increase confidence and coverage. The goal is to remove fragile `any` patterns, add concise interfaces, and cover critical store/utility behaviors with unit tests.

## Background

We recently added several typed files and store tests, and made progress on reducing `any`. There are still pockets of `any` (mostly in stores, import/legacy handling, and a few components) that cause TypeScript warnings and make it harder to add reliable tests.

This issue collects the high-impact spots that are easy to type and test, and suggests bite-sized tasks so contributors can make incremental, test-backed improvements.

## Proposed deliverables

- Inventory and replace remaining `any` with concrete types or narrow `unknown` + guards.
- Add targeted unit tests for importer utilities, migration edge cases, and persistence timing.
- Ensure CI runs the test suite and reports coverage; add a follow-up to raise coverage on any file below X% (suggest 80%).

## High-priority untyped / weakly-typed spots (candidate files)

Suggested starting points (search for `: any`/`as any` and review):

- `src/stores/search.ts`
  - Fuse index types and search result shapes. Add types for search entries and ensure `createFuse` / `search` signatures are explicit.

- `src/stores/collection.ts`
  - The `WarframeOverride` type is currently `Partial<Record<string, unknown>>` — consider a discriminated union or a `Record<string, OverrideValue>` with a typed subset for known keys (e.g., `crafted`, `parts_collected`, `is_mastered`).

- `src/lib/importer.*`
  - Parsing results and CSV mapping use loose shapes. Add explicit `ImportRow` and `OverridesMap` types.

- `src/pages/*.vue` (Warframes / Weapons pages)
  - Call sites that invoke `collection.setOverride` use locally-typed payloads that were previously cast; make the store API generic or align payload types.

- `src/components/*` small components that accept `unknown` props or emit `any` payloads (example: parts lists, card components).

## Suggested test targets (small, high-value)

1. Importer utility tests (already in `src/__tests__/importer.spec.ts`) — add more cases:
   - malformed CSV rows
   - unexpected column names
   - JSON import with non-array payloads (should return parse error)

2. Persistence / migration tests (collection store):
   - corrupt JSON in localStorage (already covered) — extend with partial-migration cases where `version` is present but `overrides` is malformed.
   - beforeunload flush behavior: simulate `setOverride`, ensure pending save is flushed when the unload handler runs.

3. Debounce/save timing: assert that in non-test env the watcher debounces and writes after the configured delay (we have a test; expand to multiple rapid updates to assert consolidation).

4. Merged view tests:
   - duplicates in static data where later entries have overrides — ensure merged result picks first occurrence and still applies later overrides to the combined item (see `mergedWeapons` and `mergedWarframes`).

5. Search store tests:
   - verify Fuse index picks expected fields, and ensures stable results when items are added/removed.

## Acceptance criteria

- A PR updates at least two of the high-priority untyped files to remove `any` and introduces types.
- New tests covering at least two of the suggested test targets are added and pass.
- The test run on CI remains green (no regressions).

## Implementation notes / hints

- Prefer adding narrow types and using `unknown` with guards rather than broad `any`.
- For `setOverride`, consider a generic signature like `setOverride<K extends string>(name: K, partial: Partial<Record<string, unknown>>)` or better, accept a typed override shape where practical.
- Use `vi.useFakeTimers()` in tests to control debounce timing. Remember to flush Vue's reactive microtask queue in tests with `await Promise.resolve()` after mutating store state so `watch` callbacks schedule timeouts predictably.

## Follow-ups

- After typing and tests, run coverage and add targeted PRs to raise low-coverage files (suggestion: `search.ts` and remaining store utilities).

---

If you'd like, I can open this in GitHub for you (requires repository push / API access) or create a ready-to-copy issue body in the PR description. I can also start by converting `src/stores/search.ts` and adding a few tests for it next.
