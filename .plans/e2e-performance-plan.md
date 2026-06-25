# E2E Performance Plan

Status: implemented  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`

## Scope

Reduce Playwright E2E startup overhead in the rewrite workspace by adopting the
original XMLUI test-bed pattern where it fits the current architecture.

Non-goals:

- Changing XMLUI runtime behavior outside test infrastructure.
- Rewriting existing E2E specs.
- Optimizing production, standalone, or SSG web-server startup in this step.

## Compatibility Source

Original XMLUI uses:

- `/Users/dotneteer/source/xmlui/playwright.config.ts`
  - `fullyParallel: true`
  - `workers: CI ? "80%" : "75%"`
  - one reusable test-bed server on port `3211`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/fixtures.ts`
  - worker-scoped browser context and page;
  - test-scoped `page` fixture backed by that worker page;
  - in-page app reinitialization after the first navigation;
  - cleanup of routes, storage, scroll, and replayed init scripts between tests.
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/infrastructure/main.tsx`
  - browser-side `__XMLUI_REINIT__` hook that remounts the test bed without a
    full page navigation.

## Current Rewrite Behavior

Current rewrite tests under `xmlui/src/components/**/*.spec.ts` use
`xmlui/src/testing/fixtures.ts`. Each `initTestBed` call stores XMLUI source in
`sessionStorage` and performs `page.goto("/?__xmluiTestBed=1")`, using
Playwright's default test-scoped page/context.

Top-level `xmlui/tests/e2e/**/*.spec.ts` use example navigation and should stay
on normal Playwright pages for now because they verify full-app routing,
production, standalone, and SSG behavior.

## Implementation Approach

1. Add a rewrite-local test-bed reinit hook in `xmlui/src/main.tsx`.
2. Reuse one browser context and page per Playwright worker in
   `xmlui/src/testing/fixtures.ts`.
3. Replay per-test `page.addInitScript` callbacks before fast reinit.
4. Enable Playwright file-level parallelism and original worker percentages.

## Verification

- Run focused component specs with multiple workers.
- Run at least one top-level example E2E spec to prove normal navigation still
  works.
- Run TypeScript for changed runtime/test files.

Completed verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui exec -- playwright test src/components/Badge/Badge.spec.ts src/components/Spinner/Spinner.spec.ts --workers=4 --reporter=line`
  - 57 passed
  - 1 skipped
- `npm --workspace xmlui exec -- playwright test src/components/EventSource/EventSource.spec.ts src/components/WebSocket/WebSocket.spec.ts --workers=2 --reporter=line`
  - 3 passed
  - 4 skipped
- `npm --workspace xmlui exec -- playwright test tests/e2e/event-tags.spec.ts --workers=2 --reporter=line`
  - 1 passed

The first sandboxed Playwright run failed before tests because the sandbox
blocked Vite from binding to `127.0.0.1:5173` with `EPERM`; rerunning with
local-server escalation succeeded.

## Risks

- Tests that intentionally depend on full page reload semantics may need the
  full-navigation fallback.
- A shared page can expose cleanup gaps. If flakes appear, prefer targeted
  cleanup modeled after the original fixture.
