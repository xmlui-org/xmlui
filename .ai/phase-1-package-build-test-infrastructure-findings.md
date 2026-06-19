# Phase 1 Findings: Package, Build, and Test Infrastructure

Status: initial infrastructure implemented

Phase 1 starts turning old command names and generated artifact expectations
into repeatable rewrite checks.

## Implemented

- Added old root command aliases where the experimental rewrite has an
  equivalent:
  - `build-xmlui`
  - `build-vscode-extension`
  - `build-extensions`
  - `build-docs`
  - `generate-docs`
  - `test-smoke`
  - `test-integration`
- Added old `xmlui` package command aliases where the rewrite has an equivalent:
  - `build:xmlui`
  - `build:xmlui-standalone`
  - `build:xmlui-metadata`
  - `test:unit`
  - `check:metadata`
  - `generate-docs`
- Added `scripts/phase1-integration-smoke.mjs` as the first
  `test-integration` replacement. It verifies command aliases and required
  debt/inventory entries. It does not yet recreate the old generated-app
  integration workflow.
- Added `scripts/compatibility-missing.mjs` so old command names without a
  rebuilt surface can fail with an explicit compatibility debt ID.
- Added compatibility tests for package scripts and debt-backed unsupported
  surfaces.

## Still Debt

- `COMP-0002`: full published package export shape is incomplete.
- `COMP-0003`: `create-xmlui-app` is not rebuilt.
- `COMP-0006`: playground is not rebuilt; `build-playground` is an intentional
  placeholder.
- `COMP-0007`: full old integration-test app workflow is not rebuilt.
- `COMP-0008`: CI/release workflows are not rebuilt.
- `COMP-0009`: only the `xmlui-counter-badge` extension fixture exists; old
  first-party packages are not ported.

## Practical Result

Phase 1 now gives future work stable command names to target. When the missing
tools arrive, their command bodies can replace the debt-backed placeholders
without changing the public command surface again.

## Verification

Verified commands:

```text
npm run test-integration
npx vitest run tests/compatibility
npm --workspace xmlui run test
npm run build-xmlui
npm run build-extensions
npm run build-docs
npm run build-vscode-extension
npm --workspace xmlui run compatibility:sweep
```

Results:

- Phase 1 integration smoke passed.
- Compatibility tests: 3 files, 11 tests passed.
- Compiler/runtime tests: 26 files, 209 tests passed.
- Framework build passed with the existing Vite chunk-size warning.
- Extension fixture build and metadata passed.
- Docs-reference generation passed.
- VS Code `.vsix` packaging passed.
- Full compatibility sweep passed, including 54 E2E tests.
