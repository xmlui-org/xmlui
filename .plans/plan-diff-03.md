# Plan Diff 03

Snapshot: `master-plan-03.md`  
Previous snapshot: `master-plan-02.md`

## 1. Prompt

Our master plan is complete. In the future, I will create separate plans for
each experiment. Please set up the project skeleton and dev-server integration.

## 1. Edit Summary

- Updated the master plan's project-skeleton scope from a single-package setup
  to a monorepo setup.
- Changed the required root structure to use npm workspaces with root scripts
  that delegate to package-level scripts.
- Established `xmlui/` as the workspace package for the framework
  implementation.
- Moved framework-local expectations into `xmlui/`, including package scripts,
  TypeScript configuration, Vite configuration, example app files, compiler,
  runtime, Vite plugin, examples, and tests.
- Added explicit placeholder package areas for future `tools/`, `vscode/`, and
  `website/` packages.
- Removed `npm workspaces` from the "keep out for now" list because the
  monorepo structure now uses workspaces from the beginning.
