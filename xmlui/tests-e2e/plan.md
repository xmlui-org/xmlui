# E2E Test Performance Optimization Plan

## Current State

| Metric | Value |
|---|---|
| Total spec files | ~162 (139 xmlui + 23 packages) |
| Total `initTestBed()` calls | ~10,991 (10,013 xmlui + 978 packages) |
| Total `test()` cases | ~4,882 (xmlui) + packages |
| Playwright version | 1.57.0 |
| Workers (local) | 75% of CPU cores |
| Workers (CI) | 100% |
| CI runner | ubuntu-latest (2-core) / ubuntu-latest-16-core (sharded) |

### Heaviest spec files (by initTestBed calls)

| File | initTestBed calls |
|---|---|
| Form.spec.ts | 386 |
| Table.spec.ts | 371 |
| NumberBox.spec.ts | 341 |
| Text.spec.ts | 279 |
| Tree.spec.ts | 278 |
| TimeInput.spec.ts | 266 |
| Select.spec.ts | 256 |
| DateInput.spec.ts | 252 |
| TextBox.spec.ts | 246 |
| TextArea.spec.ts | 240 |

---

## Per-Test Startup Cost Analysis

Every single `initTestBed()` call triggers this full sequence:

1. **`page.addInitScript()`** — Injects `window.TEST_ENV` with the parsed XMLUI component tree
2. **`page.goto("/")`** — Full page navigation (new HTTP request to Vite/serve)
3. **HTML parse + JS bundle load** — Browser loads `index.html`, then `main.tsx` and all transitive imports
4. **React mount** — `ReactDOM.createRoot().render(<TestBed />)`
5. **Extension loading** — `TestBed` dynamically imports requested extensions from the registry
6. **StandaloneApp init** — `useStandalone()` resolves runtime, merges app definition, evaluates globals
7. **ApiInterceptorProvider** — Even when no `apiInterceptor` is defined, `waitForApiInterceptor={true}` is hardcoded in TestBed.tsx. When `VITE_MOCK_ENABLED` is true (always in dev mode), MSW service worker registers and starts on every navigation.
8. **React render** — The XMLUI component tree renders
9. **Wait for testState element** — `page.getByTestId(testStateViewTestId).waitFor({ state: "attached" })`

**With ~11,000 initTestBed calls, even 100ms of fixed overhead per call = ~18 minutes of pure overhead.**

Playwright creates a **fresh browser context and page per test** by default (since `page` is a test-scoped fixture). This means steps 1-9 repeat for every single test — no caching, no warm-up, no reuse.

---

## Identified Bottlenecks

### 1. MSW Service Worker Registration on Every Test (HIGH IMPACT)

**Problem:** `TestBed.tsx` hardcodes `waitForApiInterceptor={true}`, and the dev server sets `VITE_MOCK_ENABLED=true` by default. This means MSW's `interceptorWorker.start()` runs on every `page.goto("/")`, even though only ~183 tests (in 18 spec files) actually use `apiInterceptor`. The service worker registration is an async, network-involving operation that adds significant latency.

**Evidence:**
- `waitForApiInterceptor={true}` in [TestBed.tsx line 73](../src/testing/infrastructure/TestBed.tsx)
- `VITE_MOCK_ENABLED` set to `true` (default) in [start.ts](../src/nodejs/bin/start.ts)
- Only 183 out of ~11,000 initTestBed calls actually use `apiInterceptor`
- MSW worker lifecycle: import chunk → `initMock()` → `createApiInterceptorWorker()` → `worker.start()` with service worker registration → `worker.stop()` on unmount

**Potential fix:** Make `waitForApiInterceptor` conditional on whether the test actually provides an `apiInterceptor`. Pass a flag from the fixture through `window.TEST_ENV` so TestBed only enables MSW when needed. This alone could save 50-200ms per test for the ~98% of tests that don't use API mocking.

### 2. Full Page Navigation Per Test (HIGH IMPACT)

**Problem:** Every `initTestBed()` call does `page.goto("/")`, which triggers a full page load cycle: DNS lookup (cached), TCP connect (localhost, fast), HTTP request, HTML parse, JS module evaluation, React root creation, and full component mount. On a Vite dev server, this means on-demand module transformation for the entire dependency graph on every navigation.

**Evidence:**
- `await page.goto("/")` in [fixtures.ts line 343](../src/testing/fixtures.ts)
- Playwright's default `page` fixture is test-scoped (fresh page per test)
- `addInitScript` runs before every navigation; it cannot selectively update the DOM

**Potential fix:** Instead of full navigation, create a `reinitTestBed` mechanism that uses `page.evaluate()` to:
  1. Unmount the React root (`root.unmount()`)
  2. Update `window.TEST_ENV` directly
  3. Remount (`root.render(<TestBed />)`)
  
  This skips the entire HTTP → parse → JS load cycle. The TestBed React app stays loaded; only the XMLUI component inside changes. This would require a shared `page` fixture (e.g., via `test.describe` + `beforeAll` that does the initial `goto`).

  **Caveat:** This requires careful isolation — any leaked global state between tests becomes a flaky test source. Start with opt-in for groups of tests that share the same `description` (no extensions, no apiInterceptor, no custom themes).

### 3. CI Uses Static Serve But Still Has Full Page Load Cost (MEDIUM IMPACT)

**Problem:** In CI, the pre-built dist is served via `npx serve`, which is faster than Vite dev server (no on-demand transforms). However, the full page load cost still applies to every test. The bundle is ~1.6MB+ of JS that the browser must parse on each navigation.

**Evidence:**
- CI command: `npx serve xmlui/src/testing/infrastructure/dist -p ${port}`
- `reuseExistingServer: !CI` means CI always starts a fresh server

**Potential fix:** Consider browser-level caching. Playwright's `storageState` or a shared `browserContext` with warm cache could help. Also, splitting the test bed bundle to separate core infrastructure from extensions would reduce parse time for the majority of tests.

### 4. Extension Registry Loads All Extensions Eagerly (MEDIUM IMPACT)

**Problem:** The `extension-registry.ts` has dynamic imports for 11 extension packages. While these are loaded lazily (only when `TEST_EXTENSION_IDS` includes them), the Vite dev server still has to resolve and potentially transform these modules during startup. In the pre-built dist, all extension chunks are bundled and must be parsed.

**Evidence:**
- [extension-registry.ts](../src/testing/infrastructure/extension-registry.ts) imports 11 packages
- Most core component tests (xmlui/) never use extensions (0 files with `extensionIds`)
- Only 22 package spec files use extensions

**Potential fix:** Create two separate test bed builds/endpoints:
  - `/` — Core-only test bed (no extension registry, smaller bundle)
  - `/ext` — Full test bed with extensions
  
  The fixture can route to the appropriate endpoint based on `description.extensionIds`.

### 5. No Test Batching / Grouping by Markup Template (MEDIUM IMPACT)

**Problem:** Many tests within a `describe` block use identical or near-identical markup. For example, a group of tests might all use `<Checkbox initialValue="true" />` but test different aspects of it. Each test does a full `initTestBed` → `page.goto` cycle for the same markup.

**Evidence:** The top spec files have 200-400 initTestBed calls each. Many tests in the same describe block share identical markup.

**Potential fix:** For read-only assertion tests (no mutation, just checking initial render), support a `test.describe` level `initTestBed` that renders once and multiple tests assert on the same page. This already works with `beforeEach` (64 usages found), but could be extended to a `beforeAll` pattern for pure assertion groups.

### 6. Vite Dev Server Cold Start Overhead (LOW-MEDIUM IMPACT for local dev)

**Problem:** When running `test-e2e-dev` locally, Vite's dev server does on-demand module transformation. The first test triggers Vite to transform the entire dependency graph. Subsequent tests hit Vite's module cache, but each `page.goto` still triggers module resolution and HTTP/2 requests for each module.

**Evidence:**
- `webServer.timeout: 50 * 1000` (50s allowed for server startup)
- `reuseExistingServer: !CI` means local runs reuse a running dev server (good)
- But each page load still requests modules individually (no bundling in dev)

**Potential fix:**
  - Pre-warm the Vite module graph: on startup, fetch `/` once before tests begin
  - Consider using Vite's `optimizeDeps.include` to force pre-bundling of the test bed's dependencies
  - For local development, recommend keeping the dev server running (`npm run start-test-bed -- --port 3211`) and running tests with `npm run test-e2e-dev`

### 7. Four Playwright Projects Run All Tests Twice (LOW IMPACT on timing, HIGH on organization)

**Problem:** The playwright config defines 4 projects: `xmlui-nonsmoke`, `xmlui-smoke`, `extensions-nonsmoke`, `extensions-smoke`. The smoke/nonsmoke split uses `grep`/`grepInvert` on `@smoke` tag. When running all tests, the same test directory is scanned twice.

**Evidence:** [playwright.config.ts](../../playwright.config.ts) — projects array
  
**Note:** This is not a performance issue per se — Playwright filters efficiently. But it does mean test organization is flat (grep-based) rather than structurally separated.

---

## Recommended Priority Order

### Phase 1: Quick Wins (no test rewrite required)

1. **Conditional MSW initialization** — Make `waitForApiInterceptor` dynamic based on whether `TEST_ENV` actually contains an `apiInterceptor`. Modify TestBed.tsx to check `window.TEST_ENV?.apiInterceptor` and only set `waitForApiInterceptor={true}` when present. **Estimated savings: 50-200ms × ~10,800 tests = 9-36 minutes** (especially impactful in dev mode where MSW setup is more expensive).

2. **Pre-build for local development too** — Add a `test-e2e-fast` script that builds the test bed first (like CI), then serves with `npx serve` instead of Vite dev server. This eliminates on-demand module transformation overhead. The turbo cache means rebuilds are fast when nothing changed.

3. **Vite `optimizeDeps.include` for test bed** — Add the test bed's heavy dependencies to Vite's pre-bundling list so they get bundled upfront instead of on-demand during the first test run.

### Phase 2: Medium Effort (fixture/infrastructure changes)

4. **In-page re-rendering** — Create an alternative `reinitTestBed` fixture that reuses the same page and React root across tests within a `describe` block. Instead of `page.goto("/")`, it calls `page.evaluate()` to swap `window.TEST_ENV` and trigger a React re-render. This eliminates the HTTP round-trip, HTML parsing, and JS re-evaluation. Gate behind an opt-in flag initially.

5. **Split test bed bundles** — Create a core-only test bed (no extensions) and a full test bed. Route most component tests to the core bundle, which will be significantly smaller and faster to parse.

6. **Shared browser context** — Use Playwright's `test.describe.configure({ mode: 'serial' })` with a shared page for groups of independent read-only tests, avoiding the per-test browser context overhead.

### Phase 3: Structural Improvements (larger effort)

7. **Test bed as a lightweight shell** — Refactor TestBed to be a thin React shell that accepts component markup via a postMessage/evaluate API, avoiding full page reloads entirely. The shell stays mounted, and only the XMLUI content area swaps. This is the highest-impact change but requires the most validation work.

8. **Parallel test bed servers** — For the sharded CI workflow, consider running one test bed server per shard instead of sharing. This eliminates contention on the serve process.

9. **Progressive test splitting** — Split the heaviest spec files (Form: 386, Table: 371, NumberBox: 341) into multiple smaller files that Playwright can distribute across workers more evenly.

---

## Measurement Plan

Before implementing any changes, establish baselines:

```bash
# Baseline: full suite timing (CI mode, pre-built)
PLAYWRIGHT_USE_DEV_SERVER=false npx playwright test --reporter=json 2>&1 | jq '.stats'

# Baseline: single heavy file timing
PLAYWRIGHT_USE_DEV_SERVER=false npx playwright test Form.spec.ts --reporter=json 2>&1 | jq '.stats'

# Baseline: per-test timing distribution
npx playwright test --reporter=json | jq '[.suites[].specs[].tests[].results[].duration] | sort'
```

After each change, re-run these measurements to validate improvement.

---

## Applied Changes — Commit `0425300` ("Accelerate e2e tests #3222")

All changes below are contained in a single commit across 8 files. They address both **performance** (eliminating per-test overhead) and **flakiness** (fixing ~60 intermittent test failures).

### Changed Files

| File | Summary |
|---|---|
| `xmlui/src/testing/fixtures.ts` | Worker-scoped shared page, in-page reinit fast path, post-render stability wait, focus-visible activation, mouse cleanup |
| `xmlui/src/testing/infrastructure/main.tsx` | `__XMLUI_REINIT__` function for in-page re-rendering with toast cleanup |
| `xmlui/src/testing/infrastructure/TestBed.tsx` | Conditional MSW service worker initialization |
| `xmlui/src/testing/infrastructure/vite.config-overrides.ts` | New file: Vite pre-bundling for heavy dependencies |
| `xmlui/src/components/Theme/NotificationToast.tsx` | Fix `toasterMounted` flag leak on unmount |
| `playwright.config.ts` | Increased `expect` timeout to 10s |
| `package.json` | Added `test-e2e-fast` script |

---

### 1. Worker-Scoped Shared Page (`fixtures.ts`)

**Plan reference:** Phase 2 item 4 (in-page re-rendering) + Phase 2 item 6 (shared browser context)

**Before:** Playwright created a fresh `BrowserContext` + `Page` for every test (default behavior). Every `initTestBed()` called `page.goto("/")` — a full HTTP request → HTML parse → JS bundle load → React mount cycle.

**After:** Two new worker-scoped fixtures (`_sharedContext`, `_sharedPage`) create a single browser context and page per Playwright worker. The test-scoped `page` fixture is overridden to return `_sharedPage`. This means all tests within a worker share the same browser page.

The `page` fixture override also:
- Applies `test.use({ viewport })` to the shared page (prevents viewport leaks between tests)
- Intercepts `page.addInitScript()` into a queue so the reinit fast path can replay them
- Clears `localStorage` and `sessionStorage` between tests
- Resets mouse to `(0, 0)` to prevent `:hover` CSS from bleeding between tests

### 2. In-Page Reinit Fast Path (`main.tsx`, `fixtures.ts`)

**Plan reference:** Phase 2 item 4

`main.tsx` now exposes `window.__XMLUI_REINIT__()` which:
1. Calls `toast.remove()` to clear stale notifications from `react-hot-toast`'s module-level store
2. Increments a React key and calls `flushSync(() => root.render(<TestBed key={…} />))`

The `flushSync` ensures the old tree is torn down and the new tree is mounted synchronously — no stale DOM lingers.

In `fixtures.ts`, `initTestBed()` checks `window.__XMLUI_READY__`:
- **First test in worker (slow path):** Full `page.goto("/")` — loads HTML, JS bundle, boots React
- **Subsequent tests (fast path):** Replays queued init scripts via `page.evaluate()`, updates `window.TEST_ENV`, resets the URL via `history.replaceState`, then calls `__XMLUI_REINIT__()`. Falls back to full navigation if reinit throws.

This eliminates the HTTP round-trip, HTML parsing, and JS re-evaluation for ~99% of tests.

### 3. Conditional MSW Service Worker (`TestBed.tsx`)

**Plan reference:** Phase 1 item 1

**Before:** `waitForApiInterceptor={true}` was hardcoded. MSW's service worker registered and started on every test, even though only ~183 of ~11,000 `initTestBed` calls use `apiInterceptor`.

**After:** `waitForApiInterceptor` is set to `!!window.TEST_ENV?.apiInterceptor`. The ~98% of tests that don't use API mocking skip MSW setup entirely.

### 4. Vite Pre-Bundling (`vite.config-overrides.ts`)

**Plan reference:** Phase 1 item 3

New file that configures `optimizeDeps.include` for 30+ heavy dependencies (React, Radix UI, TanStack, Framer Motion, etc.). This forces Vite to pre-bundle these packages at dev server startup instead of transforming them on-demand during the first test page load. Reduces cold-start latency for local `test-e2e-dev` runs.

### 5. `test-e2e-fast` Script (`package.json`)

**Plan reference:** Phase 1 item 2

New npm script: `"test-e2e-fast": "turbo run xmlui#build:xmlui-test-bed && cross-env PLAYWRIGHT_USE_DEV_SERVER=false playwright test"`

Builds the test bed first (using turbo cache if nothing changed), then serves the pre-built dist with `npx serve` instead of the Vite dev server. Eliminates on-demand module transformation overhead for local development.

### 6. Toast/Notification State Leak Fix (`NotificationToast.tsx`, `main.tsx`)

**Root cause:** `NotificationToast` uses a module-level `let toasterMounted = false` guard to prevent duplicate Toaster mounts. The `useEffect` never reset this flag on unmount. After the first test that rendered a toast, subsequent tests in the same worker could not mount a new Toaster — the flag stayed `true` permanently.

Additionally, `react-hot-toast` keeps a module-level store of active toasts that leaked between tests.

**Fixes:**
- Added `return () => { toasterMounted = false; }` cleanup to the `useEffect` in `NotificationToast.tsx`
- Added `toast.remove()` at the start of `__XMLUI_REINIT__` in `main.tsx`

### 7. Post-Render Stability Wait (`fixtures.ts`)

After `waitFor({ state: "attached" })`, `initTestBed` now runs:

```ts
await page.evaluate(() =>
  document.fonts.ready.then(() =>
    new Promise<void>(resolve => {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    })
  )
);
```

This waits for: **(1)** web fonts to load, **(2)** one animation frame (layout/paint), **(3)** one macrotask (deferred `useEffect` callbacks scheduled via `MessageChannel`). Ensures the component tree is fully rendered and all deferred effects have run before assertions begin.

### 8. `:focus-visible` Activation (`fixtures.ts`)

Chrome only applies `:focus-visible` CSS when its internal `had_keyboard_event` flag is set. After `initTestBed`, we press `Shift` — a no-op key that doesn't move focus or trigger component handlers but flips Chrome into keyboard-navigation mode. Without this, programmatic `.focus()` calls followed by CSS assertions on `:focus-visible` outlines intermittently found no outline.

### 9. Assertion Timeout Increase (`playwright.config.ts`)

Added `expect: { timeout: 10_000 }` (up from the Playwright default of 5s). Auto-retrying assertions like `toBeVisible()`, `toHaveCSS()`, and `toBeInViewport()` now have 10 seconds to succeed. Accommodates slower CI environments and asynchronous operations like smooth scrolling, theme style injection, and animation completion.

---

## Follow-Up Changes (Post-Commit Flaky Test Fixes)

Additional fixes applied after commit `0425300` to address remaining flaky tests exposed by the shared-page infrastructure. These include one more infrastructure fix and targeted test-level changes.

### Infrastructure: StyleRegistry Race Condition (`main.tsx`)

**Root cause:** XMLUI's CSS-in-JS system (`StyleRegistry`) uses `useInsertionEffect` to inject `<style>` tags and `useEffect` + `setTimeout(0)` to clean them up via ref counting. When `__XMLUI_REINIT__` unmounts the old tree and mounts a new one synchronously, the old tree's deferred `setTimeout` cleanup fires *after* the new tree's `useInsertionEffect` has already injected a `<style>` tag with the same hash. The old cleanup removes the new tag because it matches the same `querySelector("style[data-style-hash='…']")`.

**Fix:** Before mounting the new tree, `__XMLUI_REINIT__` now strips all `<style data-style-hash>` elements from `<head>`. The new `StyleRegistry` re-injects everything via `useInsertionEffect` (synchronous during render), so no styles are lost.

**Symptom:** Theme variable tests (`testThemeVars`) intermittently failed `toHaveCSS()` assertions — the custom theme style tag was removed by the old tree's cleanup timer. Affected Avatar, Link, Tree, and other components with theme variable tests.

### Test-Level Fixes

| File | Fix |
|---|---|
| `Stack.spec.ts` | Replaced `waitForTimeout(100)` with rAF+macrotask wait after OverlayScrollbars viewport scroll. Removed two unnecessary `waitForTimeout(100)` calls where `toHaveCount()` already auto-retries. |
| `StickySection.spec.ts` | Added `waitForScrollerReady()` helper — polls until OverlayScrollbars viewport's `scrollHeight > clientHeight` (initialization is async; CSS `position: sticky` has no effect until the ancestor is scrollable). Fixed `scrollTo()` to target `[data-overlayscrollbars-viewport]` instead of the outer wrapper. |
| `Drawer.spec.ts` | Added rAF+macrotask wait after drawer `toBeVisible()` before click-away. Radix Dialog's `onPointerDownOutside` handler isn't registered until the open animation completes. |
| `Form.spec.ts` | Replaced direct `testState()` reads (non-retrying) with `expect.poll()`. Added label text to empty `<Button/>` elements that rendered invisible (Playwright's actionability check requires visible content). |
| `Tree.spec.ts` | Converted one-shot `getComputedStyle(el).boxShadow` read to `expect.poll()` so it retries until the theme style applies. |

### Validation Results

| Scope | Result |
|---|---|
| Unit tests (Vitest) | 8,809 passed |
| Targeted flaky tests (×2 repeat, 0 retries) | 257 passed, 0 failed |
| Full affected spec files (with retries) | 748 passed, 0 flaky |
| StickySection stress test (×3 repeat, 0 retries) | 33 passed, 0 failed |
