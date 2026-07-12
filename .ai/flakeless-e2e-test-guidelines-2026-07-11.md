# Flakeless E2E Test Guidelines

Date: 2026-07-11

Context: The XMLUI component E2E suite had failures and flakes concentrated in
async tree loading, nested overlays, tooltip portals, keyboard shortcuts,
hidden checkbox inputs, fixed sleeps, coordinate clicks, and ambiguous
page-wide selectors. The suite was stabilized by changing tests to wait for
observable user-facing state, scope interactions precisely, and verify under
parallel Playwright workers.

## Core Rules

- Run focused checks with multiple workers. A test that passes serially is not
  proven fixed for `test:e2e`; use `--workers=4` or the same concurrency model
  as the suite.
- Prefer visible or state-driven assertions over sleeps. Replace
  `waitForTimeout` with `expect.poll`, `expect(...).toBeVisible()`,
  `toPass`, URL/storage/state polling, or DOM text/role assertions.
- Assert the behavior contract, not incidental implementation timing. For
  example, wait for loaded tree children to appear rather than waiting for an
  arbitrary spinner delay.
- Scope selectors to the component under test. Avoid page-wide unnamed
  `getByRole("button")` when the harness, wrapper, or a portal can add more
  controls.
- Keep test output quiet. Do not leave `console.log`, `console.dir`, or debug
  handlers in mock APIs or test markup unless the test asserts logging.

## Reliable Interaction Patterns

- Tooltip and portal overlays:
  - Hover the exact trigger, then assert the tooltip inside `expect(...).toPass`.
  - Use `page.getByRole("tooltip")` for normal tooltips and the component's
    actual tooltip container selector only when that is the exposed contract.
  - Re-hover inside the retry block; the portal may not exist on the first
    event-loop turn.

- Nested menus, dialogs, popovers, and selects:
  - Open each layer by role/name or a stable `testId`.
  - Assert the intended layer is visible before interacting with the next one.
  - Close overlays through their public dismissal path (`Escape`, named close
    button, or click-away target) and assert they are gone before proceeding.

- Keyboard shortcuts:
  - Focus the component first and assert focus or visibility before pressing
    keys.
  - For positive paths, poll the state or visible result after the keypress.
  - For negative paths, use a short stability helper that confirms state remains
    unchanged over a meaningful window instead of a one-time read.

- Hidden or visually replaced inputs:
  - If the test is about user row/header selection, click the visible row/header
    target at a locator-relative position.
  - If the test is explicitly about hidden input wiring, call
    `locator.evaluate((el) => (el as HTMLElement).click())` after asserting the
    input is attached. Avoid `force: true` as a generic escape hatch.

- Geometry and positioning:
  - Prefer coarse relationships with tolerance over exact pixel equality.
  - Poll until bounding boxes are present and stable before comparing them.
  - Use locator-relative clicks (`locator.click({ position })`) rather than
    global `page.mouse.click(x, y)` when the target element is known.

## Common Flake Smells

- `waitForTimeout` used as a substitute for render, request, animation, or
  storage completion.
- `force: true` masking an overlay, disabled state, or wrong target.
- `delay` in clicks used to make behavior "settle".
- Page-wide unnamed role selectors in tests that render harness controls.
- Assertions immediately after hover, focus, keypress, scroll, or async API
  calls without polling the expected state.
- Direct coordinate math from `boundingBox` when a locator-relative interaction
  would express the same user action.
- Mock handlers or inline XMLUI snippets that print debug data during normal
  test runs.

## Verification Practice

- After fixing one test, rerun the smallest relevant group with
  `--workers=4 --repeat-each=N`; choose `N` based on risk and cost.
- After changing shared helpers or broad families, run a representative batch
  across all affected components with multiple workers.
- If the full suite reports a flake, first reproduce the exact concurrency
  shape before changing code.
- Record which tests were targeted, how many repeated runs passed, and whether
  the full suite was or was not run.

## XMLUI-Specific Notes

- `initTestBed` can render harness/UI controls that collide with generic roles;
  prefer `testId` in inline test markup for API trigger buttons.
- Tooltip behavior often crosses portals, so the trigger and tooltip are not in
  the same subtree. Scope the trigger, not the tooltip.
- Tree async loading and autoload tests should observe expanded nodes, loaded
  child text, API result state, or spinner disappearance instead of elapsed
  time.
- Table row-selection tests must distinguish between visible user interactions
  and hidden checkbox implementation checks.
- APICall mocks should return deterministic data and avoid logging request
  details unless a logging behavior is the actual subject of the test.
