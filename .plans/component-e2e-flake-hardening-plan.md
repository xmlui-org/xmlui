# Component E2E Flake Hardening Plan

Status: planning only  
Scope: `xmlui/src/components/**/*.spec.ts`  
Non-goal: Do not change component/runtime behavior unless a test exposes a real product bug.

## Audit Baseline

Scan all 196 component spec files for high-flake signals:

- fixed sleeps: `waitForTimeout`
- coordinate/outside clicks: `page.mouse.click`
- forced clicks and delayed clicks
- generic harness-sensitive locators: `getByRole("button")`
- hover/tooltip assertions
- `boundingBox()` geometry assertions

Result: 588 weak-signal candidates; 221 high-risk candidates after dropping broad
text/ordinal-only cases. Treat the groups below as the actionable set.

## Signal Review Guide

- `waitForTimeout`
  - Review whether the test waits for render, animation, async data, scroll, or
    debounce. Replace with the narrow observable condition: element state,
    `testState`, scroll position, visible item identity, event count, or stable
    geometry. Keep sleeps only when the component contract is elapsed time.
- `page.mouse.click(x, y)`
  - Review whether this is testing outside-click behavior or pixel positioning.
    Replace outside clicks with a stable backdrop/outside-target helper. For
    positioning tests, click a named anchor and assert relative geometry with
    tolerance.
- `force: true`
  - Review whether the test is a negative disabled/read-only case. If yes,
    assert disabled state first and dispatch the low-level event intentionally.
    If no, remove force and wait for the real user target to become actionable.
- delayed click, e.g. `click({ delay })`
  - Review what readiness the delay hides. Replace with explicit popup/list/item
    visibility or enabled-state assertions before clicking.
- `getByRole("button")`
  - Review for accidental matches against harness controls such as `Main target`.
    Add `testId`, accessible name, or component-scoped locator.
- hover/tooltip
  - Review trigger specificity and portal timing. Hover the exact trigger, then
    assert tooltip content in `toPass`; prefer role/testId over broad text.
- `boundingBox()`
  - Review whether exact pixels are product contract. Prefer CSS assertions,
    coarse relative comparisons with tolerance, and poll until two consecutive
    reads are stable.
- ordinal locators: `first`, `last`, `nth`
  - Review whether DOM order can vary under virtualization, portals, or parallel
    rendering. Prefer row/item keys, labels scoped inside a known container, or
    `data-testid` values.
- broad `getByText`
  - Review duplicate text across portals, examples, and harness UI. Scope to the
    component/root/popup under test or use role/testId.
- keyboard tests after pointer interactions
  - Review focus ownership. Assert focused element before `keyboard.press`, and
    use component drivers/API helpers when the test is not specifically about
    browser focus behavior.
- async API/event assertions
  - Review whether the assertion reads state immediately after an action. Wrap
    the full action+assertion in `toPass` only if re-running the action is safe;
    otherwise perform the action once and poll the resulting state.

## Priority 0: Observed Or Recently Reported

- `Drawer/Drawer.spec.ts:146` `closeOnClickAway=true closes drawer when clicking outside`
  - Surfaced as flaky in the latest full-suite run. Replace coordinate outside
    click with a stable backdrop/page-target helper and assert close via dialog
    state, not a raw `(10, 10)` click.
- Re-audit previously flaky tooltip and queue tests:
  - `Checkbox/Checkbox.spec.ts` tooltip/parts tests
  - `Link/Link.spec.ts` tooltip test
  - `Queue/Queue.compat.spec.ts` processError/confirmation tests
  - Goal: remove hover timing assumptions and generic toast/dialog races.

## Priority 1: Nested Overlay Stacks

Suspicious cases:

- `AutoComplete/AutoComplete.spec.ts:1335` `ModalDialog > DropdownMenu > AutoComplete`
- `AutoComplete/AutoComplete.spec.ts:1414` `ModalDialog > AutoComplete > DropdownMenu`
- `Select/Select.spec.ts:1785` `ModalDialog > Select > DropdownMenu`
- `DropdownMenu/DropdownMenu.spec.ts:659` `ModalDialog > Select > DropdownMenu`
- `ContextMenu/ContextMenu.foundation.spec.ts:43` click-away/Escape close
- `ContextMenu/ContextMenu.spec.ts:182,655,757` close/position tests
- `Drawer/Drawer.spec.ts:146,167,493` click-away tests

Fix recipe:

1. Add shared helpers for opening nested overlays with state assertions:
   `openAndExpectVisible(trigger, popupRoleOrTestId)`.
2. Replace coordinate click-away with semantic backdrop/outside-target helpers.
3. Avoid asserting an entire close cascade unless that is the behavior under test.
4. Verify each group with `--workers=4 --repeat-each=30`.

## Priority 2: Fixed Sleeps Around Async State

Suspicious families:

- Tree async loading and autoload:
  - `Tree-autoLoadAfter-field.spec.ts:38,127,209,271,356,418`
  - `Tree-dynamic-integration.spec.ts:45,184,232,295,358,405,461`
  - `Tree-loaded-field.spec.ts:297,377,424,514,547,579,636,670`
  - `Tree-spinnerDelay.spec.ts:114,164,212,259,304,488`
  - `Tree.spec.ts:3823,3853,3883,3922,3951,4048,4098,4530`
- Timer:
  - `Timer.spec.ts:51,73,97,127,153,182,207,280,301,327,346,376`
  - `Timer.foundation.spec.ts:3`
- Form async validation/persistence:
  - `Form.spec.ts:1174,1535,1562,1592,1674,1702,1971,2011,4127,4249,4279`
- Scroll/virtualization:
  - `Stack.spec.ts:98,115,950,984,1016,1046,1074,1097,1127,1159,1192,1226,1258,1288,1316,1349,1883`
  - `Card.spec.ts:216,244,278,310,344,376,406,434,467`
  - `FlowLayout.spec.ts:514,537,554,1386,1420,1452,1482,1510,1543,1576`
  - `List.spec.ts:585,622,1176,1211,1250`
  - `Table.spec.ts:2945,3130,3286,3319,3375,3403,3430,3454,3478,3501,3575,3611,3696,3740,4598`
  - `ScrollViewer.spec.ts:157,176,204,223`
  - `NavPanel.spec.ts:1160,1202,1249,1287`

Fix recipe:

1. Replace sleeps with `expect.poll`, `toPass`, visible-item counts, scrollTop
   polling, or component API state.
2. For timer tests, use fake/controlled clocks if supported; otherwise assert
   event counts with generous polling windows and no exact elapsed sleeps.
3. For virtualization, poll for rendered row/item identity rather than fixed
   post-scroll waits.

## Priority 3: Forced Or Delayed Clicks

Suspicious cases:

- Disabled/read-only interaction checks:
  - `AutoComplete.spec.ts:296`
  - `Checkbox.spec.ts:278,290`
  - `DatePicker.spec.ts:865,879,919`
  - `NavGroup.foundation.spec.ts:37`
  - `NavGroup.spec.ts:26,73`
  - `NavLink.foundation.spec.ts:17`
  - `RadioGroup.spec.ts:315`
  - `RatingInput.spec.ts:75`
  - `Select.spec.ts:137`
  - `Switch.spec.ts:223`
  - `ToneSwitch.spec.ts:20,34,75,84`
- Other force/delay risks:
  - `Accordion.spec.ts:28,54`
  - `Form.spec.ts:482,1764,3709`
  - `List.spec.ts:1750`
  - `ResponsiveBar.spec.ts:939`
  - `Spinner.spec.ts:176`
  - `Table.spec.ts:639,678,3836,3889,3923,3954,4026`
  - `Tooltip.foundation.spec.ts:37`

Fix recipe:

1. For disabled/read-only cases, assert disabled ARIA/state first, then dispatch
   the event only if the test intentionally proves handlers are suppressed.
2. Replace delayed clicks with readiness assertions for the target overlay/row.
3. Avoid `force: true` on user-flow tests; use it only for explicit negative
   interaction tests and name that intent.

## Priority 4: Ambiguous Harness Buttons

Components with notable generic `getByRole("button")` exposure:

- `ToneChangerButton.spec.ts` many tests
- `Heading.spec.ts` overflow API tests
- `DateInput.spec.ts` API tests
- `Checkbox.spec.ts`, `Pagination.spec.ts`, `ScrollViewer.spec.ts`,
  `Stepper.spec.ts`, `DropdownMenu.spec.ts`, `Form.spec.ts`, `Spinner.spec.ts`

Fix recipe:

1. Prefer `testId` on control buttons inside test markup.
2. When testing a component button, use accessible name or component-scoped
   locators, never page-wide unnamed `getByRole("button")`.
3. Sweep with a simple locator audit after each component is fixed.

## Priority 5: Hover, Tooltip, And Geometry Tests

Suspicious families:

- Tooltip/hover-heavy specs:
  - `Tooltip.spec.ts`, `TextBox.spec.ts`, `TextArea.spec.ts`,
    `DateInput.spec.ts`, `NumberBox.spec.ts`, `Select.spec.ts`,
    `Checkbox.spec.ts`, `Link.spec.ts`
- Geometry/positioning-heavy specs:
  - `Table.spec.ts:545,588,725,768,819,862`
  - `ContextMenu.spec.ts:655,757`
  - `ResponsiveBar.spec.ts:493`
  - layout-heavy `App`, `FlowLayout`, `Stack`, `ExpandableItem`,
    `RadioGroup`, `DatePicker`

Fix recipe:

1. For tooltip tests, hover the exact trigger, then assert tooltip by role/testId
   inside `toPass`.
2. For geometry, compare coarse relationships with tolerance and poll until
   dimensions are stable across two reads.
3. Avoid testing implementation pixel details unless the component contract
   requires them.

## Verification Rules

- Targeted checks must use multiple workers, e.g. `--workers=4`.
- For each repaired family, run the specific spec(s) with `--repeat-each=30`.
- After batch fixes, run the full `npm --workspace xmlui run test:e2e`.
- Stop and record remaining flakes if the full-suite budget is exhausted.
