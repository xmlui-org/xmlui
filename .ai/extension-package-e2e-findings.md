# Extension Package E2E Findings

Date: 2026-06-27

## Scope

Added a package-level Playwright E2E suite for the migrated website extension
packages. This gives the package migration a visible automated checkpoint
separate from the website route smoke tests.

## Files

- `playwright.extensions.config.ts`
- `packages/website-extension-packages.e2e.spec.ts`
- `package.json`
- `xmlui/src/testing/index.ts`
- `xmlui/src/testing/fixtures.ts`
- `xmlui/src/main.tsx`
- `xmlui/src/extensions/registry.ts`

## Coverage

The suite covers one smoke per migrated package:

- `xmlui-docs-blocks`: `ReadingTime` and `Breadcrumbs` render.
- `xmlui-website-blocks`: `HeroSection` renders.
- `xmlui-search`: inline search filters results.
- `xmlui-masonry`: children render in Masonry.
- `xmlui-gauge`: `id` API exposes `value` and `setValue`.
- `xmlui-echart`: SVG chart output renders from options.
- `xmlui-calendar`: month calendar renders an event.
- `xmlui-grid-layout`: grid DOM and child tiles render.
- `xmlui-tiptap-editor`: `id` API exposes `value` and `setValue`.

## Verification

Command:

- `npm run test:extensions:e2e`

Result:

- 9 passed.

Known non-failing output:

- Sass `if()` deprecation warnings from copied theme helpers.
- Vite/Floating UI unhandled rejection warnings observed during the run.
- Missing sourcemap warning from `react-grid-layout`.

## Remaining Test Debt

- The suite is package smoke coverage, not full old package parity.
- Old copied specs still need to be activated package by package.
- `xmlui-docs-blocks` old specs expose deeper work around `Share` defaults and
  XMLUI-defined docs block expansion in the extension harness.
