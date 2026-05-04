# Integration Test Infrastructure — Implementation Log

---

# Session 1 — 2026-05-04: Initial Implementation

## Status: In Progress

## What I'm doing

Implementing all files from `plan.md`. The plan describes an integration test suite that validates the xmlui production build across 4 modes:
- standalone (UMD scripts)
- vite-start (dev server)
- vite-build (built dist)
- vite-ssg (SSG mode)

## Files Being Created

### Extension package (`integration-tests/extension/`)
- `package.json`
- `src/index.tsx`
- `src/TestComponent.tsx`
- `src/TestComponent.module.scss`

### Test app (`integration-tests/test-app/`)
- `package.json`
- `index.html`
- `main.js`
- `vite-entrypoint.ts`
- `setup-standalone.mjs`
- `Main.xmlui`
- `pages/Home.xmlui`
- `pages/About.xmlui`
- `config.json`

### Tests (`integration-tests/tests/`)
- `playwright.config.ts`
- `integration.spec.ts`

### Modified files
- Root `package.json` — add workspaces
- `turbo.json` — add tasks

## Notes / Deviations from plan

- The `Gauge.module.scss` uses `:global()` and `!important` for web component CSS overrides — plan says to avoid these, and since our TestComponent is a pure React div, this is straightforward.
- The plan's `playwright.config.ts` has some issues:
  - `port` variable is declared as 3211 but then used inconsistently — each `webServer` has its own `portXxx` variable but the `port` field in webServer still references the shared `port: 3211` constant. The `port` field tells Playwright what port to *wait on* before running tests — it should match the command's `--port` arg. Fixed to use each project's own port.
  - `cwd` uses `${__dirname}/integraion-tests/test-app` (typo "integraion") — fixed to "integration-tests"
  - `vite-start` project has `portViteStart` as a key in `use` instead of `baseURL` — that's a bug in the plan. Fixed.
  - `vite-start` webServer uses `xmlui start` but the test app needs to be in Vite mode which serves dynamically; will use `npm run start` in the test-app directory.
- The `vite-ssg` project uses `preview-ssg` command — I'll use `npx serve dist-ssg` for a simpler approach since `preview-ssg` is a tool in the monorepo.
- The plan's `main.js` uses top-level `await` — this requires the `<script type="module">` tag which is already in the plan's HTML.
- For `wrapComponent` vs `wrapCompound`: TestComponent only needs a simple render, not a compound (stateful) component. Using `wrapComponent` with a `customRender` or just the simpler default render with plain props.
- Actually looking at the codebase more, the simplest approach is to use `createComponentRenderer` directly, which is what many internal components use. But `wrapComponent` is what extensions use, so I'll use that with a `customRender`.

## Observations

- The standalone UMD at `xmlui/dist/standalone/xmlui-standalone.umd.js` already exists.
- The extension's dist format: looking at gauge, it produces `xmlui-gauge.mjs` (ESM) and `xmlui-gauge.js` (CJS/UMD). The plan expects `xmlui-test-extension.js` for standalone mode — this would be the UMD/CJS build.
- Root `package.json` does NOT have an `integration-tests` directory yet.

## Completion

All files created and verified. Extension builds cleanly. Workspaces registered. See below for issues found.

## Issues Found & Fixed

### 1. Plan had `XMLUIExtensions:TestComponent` namespace syntax
XMLUI's component lookup (ComponentProvider.tsx:912-918) resolves extension components by name without namespace prefix. Used `<TestComponent>` directly.

### 2. Plan's playwright.config.ts had a typo + port bugs
- "integraion-tests" → "integration-tests"
- Each `webServer.port` now uses its own port variable (not the shared 3211 constant)
- `vite-start` project had `portViteStart` as an extra key instead of `baseURL` — fixed
- Used `path.resolve(__dirname, ...)` for `testAppDir` instead of template literals

### 3. Plan uses `wrapCompound` for a simple display component
Used `wrapComponent` instead (no state, no value change events). The `label` prop is declared in metadata, so `wrapComponent`'s generic forwarding loop passes it correctly.

### 4. Extension package.json doesn't need `clean-package`
The extension's exports already point to `./dist/` — confirmed this is correct. The `xmlui-test-extension#build:extension` task is separate from core's prepublishOnly.

### 5. turbo.json — extension build task
The plan's turbo tasks used `integration-tests/test-app#task` naming, which is the directory path form. Added an explicit `xmlui-test-extension#build:extension` task that depends on `xmlui#build:xmlui` (the lib build, not standalone).

## Session 1 — Final Status: ALL 16 TESTS PASS ✓

Ran: `npx playwright test --config integration-tests/tests/playwright.config.ts`
Result: 16 passed (22.0s)

## How to Run

```bash
# Build xmlui first (if not built)
npm run build-xmlui

# Run integration tests
npm run test-integration
```

Or step by step:
```bash
# Build and setup
npm run --workspace=integration-tests/extension build:extension
npm run --workspace=integration-tests/test-app setup:standalone
npm run --workspace=integration-tests/test-app build
npm run --workspace=integration-tests/test-app ssg

# Run playwright
npx playwright test --config integration-tests/tests/playwright.config.ts
```
