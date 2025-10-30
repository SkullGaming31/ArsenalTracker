# Contributing to Arsenal Tracker

Thanks for your interest in contributing! This document explains how to get your changes into the project and what we expect from contributors.

Getting started
- Fork the repository and create a feature branch from `main`.
- Keep changes focused and open small PRs with one logical change per PR.
- Run the test suite locally before opening a PR:

```powershell
npm install
npm run test:unit
```

Code style and checks
- The project uses TypeScript and Vue 3 Single File Components.
- Please run the type checker before opening a PR:

```powershell
npx vue-tsc --noEmit
```

Linting expectations (short)
- Run ESLint and fix reported issues in `src/` and test files before opening a PR.
- The repository intentionally relaxes a small set of lint rules for generated or Node-only helpers:
	- `docs/assets/**` contains compiled/minified build assets and is excluded from some rules that catch minified expressions.
	- `scripts/**` and `e2e/**` contain Node utilities and test helpers where CommonJS `require()` usage is allowed.

Local storage / backup key
- The application persists user overrides to `localStorage` under the key `arsenaltracker.v1`.
- When editing persistence code, prefer to keep compatibility with the versioned payload shape so users' saved data migrates cleanly.

Pull request checklist
- [ ] My branch is up to date with `main`.
- [ ] I ran the tests locally and they pass.
- [ ] I added or updated tests for any new behavior.
- [ ] I updated the README or docs if my change requires it.

Reporting bugs and requesting features
- Use the issue templates provided in `.github/ISSUE_TEMPLATE/`.

License & Code of Conduct
- By contributing you agree that your contributions will be licensed under the project license (MIT).
- Be respectful and follow the project's Code of Conduct (if provided).

Thank you — we welcome your contributions!
