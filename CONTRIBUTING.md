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
