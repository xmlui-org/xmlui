# E2E Test Consolidation Plan

## Overview

The project has approximately **5,929 E2E test cases** spread across:
- 121 component spec files in `xmlui/src/components/**/`
- 27 general spec files in `xmlui/tests-e2e/`

Starting an E2E test is expensive (dev-server spin-up, XMLUI parse, browser render). The primary optimization is to **reduce the number of `initTestBed()` calls** by merging tests that can share a single rendered app instance.

The total estimated reduction from the plan below is roughly **1,400–1,700 test cases eliminated** (~25–30% reduction).

---

## The Core Merging Pattern

The reference pattern comes from `responsive-when.spec.ts` — the
`"all combinations of when + when-xs + when-md"` test:

**Before (N separate tests, N `initTestBed` calls):**
```typescript
test("visible at xs (when-xs=true)", async ({ page, initTestBed }) => {
  await page.setViewportSize(VP.xs);
  await initTestBed(`<Text testId="t" value="hello" when-xs="true" />`);
  await expect(page.getByTestId("t")).toBeVisible();
});
test("hidden at md (when-md=false wins)", async ({ page, initTestBed }) => {
  await page.setViewportSize(VP.md);
  await initTestBed(`<Text testId="t" value="hello" when-xs="true" when-md="{false}" />`);
  await expect(page.getByTestId("t")).not.toBeVisible();
});
```

**After (1 test, 1 `initTestBed` call, multiple assertions):**
```typescript
test("all initialValue type edge cases render correctly", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <ComponentName testId="null-case"      initialValue="{null}" />
      <ComponentName testId="undefined-case" initialValue="{undefined}" />
      <ComponentName testId="empty-case"     initialValue="" />
      <ComponentName testId="string-case"    initialValue="hello" />
    </App>
  `);
  await expect(page.getByTestId("null-case")).toHaveText("");
  await expect(page.getByTestId("undefined-case")).toHaveText("");
  await expect(page.getByTestId("empty-case")).toHaveText("");
  await expect(page.getByTestId("string-case")).toHaveText("hello");
});
```

### When merging is appropriate

✅ **Safe to merge:**
- Tests that differ only in a single prop value (static renders)
- Tests that check different CSS theme variable effects on separate instances
- Tests that verify different values of the same property (null, undefined, "", numbers, booleans)
- Tests that verify different display variants of the same component

❌ **Do NOT merge:**
- Tests that require user interaction (clicks, drags, keyboard input)
- Tests that require state transitions between steps
- Tests that verify timing behavior (delays, animations)
- Tests that require specific viewport/scroll positions to be isolated per test
- Tests where a failing assertion would make it unclear which variant failed (add comments
  to clearly label each assertion's purpose)

---

## Phase 1 — tests-e2e Frame-Level Tests

**Files:** `xmlui/tests-e2e/`  
**Estimated reduction:** ~30 tests eliminated  
**Risk:** Low (small files, clear patterns)

### 1.1 `screen-breakpoints.spec.ts` (17 tests → ~6)

All 17 tests use identical markup, differing only in `page.setViewportSize()` width. Group
by breakpoint tier — one test per tier iterates through 2–3 representative widths.

```
xs-tier:  3 tests → 1
sm-tier:  3 tests → 1
md-tier:  3 tests → 1
lg-tier:  3 tests → 1
xl-tier:  3 tests → 1
xxl-tier: 2 tests → 1
```

### 1.2 `responsive-when.spec.ts` (the within-describe groups)

The `"when-md only"` describe block has 6 tests — one per viewport — all checking the same
`when-md="true"` markup. Merge each inner describe block from 4–6 separate viewport tests into
a single test that loops over viewports:

```
"when-md only" describe (6 tests) → 1 test
"base when + when-md" describe (4 tests) → 1 test
"when-xs + when-md" describe (5 tests) → 1 test
"when-xs + when-lg" describe (6 tests) → 1 test
```

The existing `"all combinations"` test and `"base when only"` loop test are already merged —
keep them as-is.

### 1.3 `data-bindings.spec.ts` (8 tests → ~3)

Six of the eight tests all verify the same final text (`STRING_DATA_FROM_API`) by binding
data via different mechanisms (inline DataSource, reference, property, url, url-binding).
Render all binding approaches as separate component instances in a single Fragment, assert
all six outputs in one test.

### 1.4 `global-variables.spec.ts`

The first two tests (`displays global variable in Text component` and `displays global
variable from function call`) are pure static renders — merge into one test.

---

## Phase 2 — Heading Component Family

**Files:** `H1.spec.ts`, `H2.spec.ts`, `H3.spec.ts`, `H4.spec.ts`, `H5.spec.ts`, `H6.spec.ts`,
`Heading.spec.ts`  
**Estimated reduction:** ~50 tests eliminated  
**Risk:** Low

### 2.1 Merge H1–H6 files entirely (30 tests → 4–5 tests)

All 6 files are structurally identical — each has 5 tests:
1. "renders as hN level heading" — checks rendered tag name
2. "renders with value property"
3. "is equivalent to Heading with level='hN'"
4. "ignores level property"
5. (some have a 5th)

**Strategy:** Replace the 6 files with a single `H1-H6.spec.ts` that uses a for-loop or
`test.describe.each` over `["h1","h2","h3","h4","h5","h6"]`. Within each iteration, render
all 3 static cases in one `initTestBed`:

```typescript
for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
  const Tag = level.toUpperCase(); // H1, H2, ...

  test(`${level}: renders correctly and is equivalent to Heading`, async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <${Tag} testId="tag"      value="Hello" />
        <Heading testId="heading" level="${level}" value="Hello" />
        <${Tag} testId="ignore"   level="h3" value="Hello" />
      </App>
    `);
    await expect(page.getByTestId("tag")).toHaveText("Hello");
    await expect(page.getByTestId("heading")).toHaveText("Hello");
    // tag and heading should produce the same rendered element
    const tagName = await page.getByTestId("tag").evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe(level);
    // ignores level override
    const ignoreTagName = await page.getByTestId("ignore").evaluate(el => el.tagName.toLowerCase());
    expect(ignoreTagName).toBe(level);
  });
}
```

### 2.2 `Heading.spec.ts` — value-type tests (11 tests → 1)

The describe block testing different `value` types (null, undefined, empty string, integer,
float, boolean, object, array) all render `<Heading value="{X}"/>` and check `toHaveText()`.
Render all 11 variants with unique testIds in one Fragment, assert all in a single test.

### 2.3 `Heading.spec.ts` — size-comparison tests (5 tests → 1)

All 5 size-comparison tests use the same setup (render all 6 headings together) and check
`h(n) > h(n+1)`. The setup already renders all 6 headings — just consolidate all 5 assertions
into a single test.

---

## Phase 3 — Simple Display Components

**Files:** `Text.spec.ts`, `Icon.spec.ts`, `Avatar.spec.ts`, `Badge.spec.ts`, `Br.spec.ts`,
`Bookmark.spec.ts`, `NoResult.spec.ts`, `ProgressBar.spec.ts`  
**Estimated reduction:** ~120 tests eliminated  
**Risk:** Low–Medium

### 3.1 `Text.spec.ts` — value-type tests (~90 tests)

The ~13 tests that render `<Text value="{X}"/>` for each value type (undefined, null, empty
string, integer, float, boolean, object, array) all follow the same pattern. Render all 13
in one Fragment with unique testIds, assert all.

Additionally, merge the three "renders" tests (no value, with `value` prop, with text content)
into a single test.

**Estimated:** ~90 tests → ~50 (removing ~40 tests)

### 3.2 `Icon.spec.ts` — invalid name tests (9 tests → 1)

The 9 tests for "handles X name gracefully" (non-existent, empty, null, undefined, special
chars, unicode, emoji, component-syntax, very-long) all render `<Icon name="X"/>` and assert
`count() === 0`. Render all 9 instances in one Fragment, assert all counts in one test.

Similarly, the 4 predefined-size tests (xs, sm, md, lg) and 3 custom-size tests (px, em, rem)
can each be merged into single tests.

**Estimated:** ~62 tests → ~45

### 3.3 `Avatar.spec.ts` — name rendering tests (8 tests → 1)

All 8 "name rendering" tests (empty, symbols, numeric, unicode, single word, three words,
many words) render `<Avatar name="X"/>` and check initials text. Render all 8 in one Fragment.

Also merge custom-size tests (6 variants) into one test.

**Estimated:** ~97 tests → ~70

### 3.4 `Badge.spec.ts` — border-side tests (~85 tests)

The long runs of `border*` theme variable tests (border, borderLeft, borderRight, borderTop,
borderBottom, borderHorizontal, borderVertical and all color/style/thickness combos per
variant) are the primary opportunity. Each test renders the same Badge with one different
theme var set.

Strategy: Group by variant (badge/pill), render one instance per border-property theme var
combination with unique testIds, assert all in a few consolidated tests.

**Estimated:** ~113 tests → ~70

### 3.5 `Br.spec.ts` — lowercase/uppercase pairs (7 tests → 4)

Three pairs of tests (`br rendered`, `br with attributes`, `br in text`) each test the same
behavior for `<br/>` and `<Br/>`. Merge each pair into one test containing both.

### 3.6 `NoResult.spec.ts` — border-side tests

Similar to Badge: ~8 border-side tests can use one `initTestBed` with 8 instances, one
per theme var. Assert all borders in one test.

**Estimated:** ~35 tests → ~22

### 3.7 `ProgressBar.spec.ts` — edge case value tests (9 tests → 1)

The 9 "Edge Cases" tests (negative value, > 1, NaN, undefined, null, small decimal,
non-number string, empty string, boolean) all render `<ProgressBar value="{X}"/>` and call
`getProgressRatio()`. Render all 9 in one Fragment, assert all.

The 7 "Basic Functionality" value tests (0.7, 0, 1, 0.335, string "0.6", no prop) can
similarly be merged into one test.

**Estimated:** ~21 tests → ~8

---

## Phase 4 — Input Components: Type Coercion Tests ✅ COMPLETE (601 → 520, −81)

**Files:** `Checkbox.spec.ts`, `Switch.spec.ts`, `DateInput.spec.ts`, `TimeInput.spec.ts`  
**Estimated reduction:** ~150–200 tests eliminated  
**Risk:** Medium (large files, require careful validation after changes)

### 4.1 `Checkbox.spec.ts` — `initialValue` type tests (~25 tests → 1)

The ~25 `initialValue handles X` tests are the biggest single consolidation opportunity in
this file. Each renders `<Checkbox initialValue="..."/>` with one different value type and
asserts `toBeChecked()` or `not.toBeChecked()`. Replace with one test that renders ~25
Checkbox instances in a single `<App>` Fragment, each with a unique testId, assert all
25 outcomes in one pass.

Similarly merge `component renders`, `component renders with label`, and the first
`initialValue sets checked state` test into one.

**Estimated:** ~132 tests → ~95

### 4.2 `Switch.spec.ts` — same structure as Checkbox

Identical to Phase 4.1. Apply the exact same strategy.

**Estimated:** ~125 tests → ~90

### 4.3 `DateInput.spec.ts` — dateFormat and initialValue tests (~35 tests → 2)

- **8 `dateFormat` tests** (different format strings): render all 8 DateInput instances with
  distinct `format` props and unique testIds in one `initTestBed`, assert all displayed values.
- **~20 `initialValue` graceful-handling tests** (null, undefined, empty, invalid, numeric,
  object, boolean, etc.): render all 20 instances at once, assert all show empty/cleared.

**Estimated:** ~161 tests → ~120

### 4.4 `TimeInput.spec.ts` — initialValue and combination tests (~25 tests → 2)

- **~20 `initialValue` graceful-handling tests**: same as DateInput strategy.
- **4 `hour24 × seconds` combination tests**: render all 4 instances at once.
- **`clearable` true/false pair**: render both in one test.

**Estimated:** ~171 tests → ~130

---

## ✅ Phase 5 — Navigation Components: Border Theme Variable Tests — COMPLETE (188 → 172, −16)

**Files:** `NavPanel.spec.ts`, `NavLink.spec.ts`, `NavGroup.spec.ts`, `Link.spec.ts`

**Key finding:** All border tests use different `testThemeVars` per test → cannot merge (same constraint as Badge/NoResult in Phase 3). Merges focused on non-border tests.

**Completed merges:**
- `Link.spec.ts`: breakMode 5→1, overflowMode simple 4→1, preserveLinebreaks 2→1, ellipses 2→1 (−9)
- `NavLink.spec.ts`: noIndicator 9→5 (merged active+displayActive+vertical, hover true/false, null+undefined) (−4)
- `NavGroup.spec.ts`: noIndicator null+undefined 2→1, expandIconAlignment tests 1+2 merged (−2)
- `NavPanel.spec.ts`: no merges possible (all tests use distinct testThemeVars or navigation interactions)

---

## ✅ Phase 6 — Form Components — COMPLETE (687 → 663, −24)

**Files:** `Form.spec.ts` (176, unchanged), `FormItem.spec.ts` (107→95), `NumberBox.spec.ts` (173→165), `TextBox.spec.ts` (115→111), `TextArea.spec.ts` (116→114)

**Completed merges:**
- `FormItem.spec.ts`: requireLabelMode 6→1 (−5), Type Property 8→1 (−7)
- `NumberBox.spec.ts`: enabled pair 2→1 (−1), hasSpinBox pair 2→1 (−1), labelPosition 6→1 (−5)
- `TextBox.spec.ts`: labelPosition 4→1 (−3)
- `TextArea.spec.ts`: resize 3→1 (−2)
- `Form.spec.ts`: no merges (all tests involve interactions or different testThemeVars)

---

## Phase 7 — Layout Components

**Files:** `Stack.spec.ts`, `HStack.spec.ts`, `VStack.spec.ts`, `CVStack.spec.ts`,
`CHStack.spec.ts`, `ContentSeparator.spec.ts`, `FlowLayout.spec.ts`  
**Estimated reduction:** ~40–60 tests eliminated  
**Risk:** Medium–High (layout tests use `getBounds()` and pixel-precise assertions)

### 7.1 Stack family files (3 tests each → 1 each)

`HStack.spec.ts`, `VStack.spec.ts`, `CVStack.spec.ts`, `CHStack.spec.ts` each have 4 tests
that can be rendered together in one `initTestBed` call (one instance per variant: empty,
populated, reversed orientation). The centering/bounds assertions can stay in the same test.

**Estimated:** 4 × 4 tests = 16 tests → 4 tests

### 7.2 `ContentSeparator.spec.ts` — margin theme variable tests (~15 tests → 2–3)

The Theme Variables section has ~15 tests that each set one theme var and assert one margin
property. Group into 2–3 tests by margin direction (vertical vs horizontal, overrides).

**Estimated:** ~50 tests → ~35

### 7.3 `FlowLayout.spec.ts` (82 tests)

Primarily layout-measurement tests — many call `getBounds()`. The static behavior flag tests
(wrapping, gap, alignment props) may be consolidatable but require careful review.

**Estimated reduction: low** (~10–15 tests)

---

## Phase 8 — App Layout Tests

**Files:** `App-layout.spec.ts` (188 tests), `App-layout-mobile.spec.ts` (193 tests)  
**Estimated reduction:** ~60–80 tests eliminated  
**Risk:** High (scroll interaction, pixel-precise positioning — do last)

Both files have the same 32 `test.describe` blocks. Within each describe, there are 4–6
tests for different scroll positions (top, mid-scroll, bottom, short-content). These are not
as easily merged because each scroll state requires navigation to a different position.

However, within each describe, the "short content" test (no scrolling needed) and the
"renders header/nav/main/footer" test could be merged.

Also, many describe blocks test structurally identical combos:
- 8 Layout × 4 property combos = 32 describes, each having the same test names
- Consider a cross-describe consolidation: render all 8 layouts simultaneously in one
  viewport, assert all layout positions at once for the "short content" case.

**Strategy:** Address only the within-describe "static layout" tests (no scroll required)
in this phase. Leave scroll-dependent tests as-is.

---

## Phase 9 — Remaining High-Value Targets

**Files:** `Accordion.spec.ts`, `Tabs.spec.ts`, `Slider.spec.ts`, `Select.spec.ts`,
`RadioGroup.spec.ts`, `AutoComplete.spec.ts`, `ColorPicker.spec.ts`, `Tooltip.spec.ts`,
`Drawer.spec.ts`, `Pagination.spec.ts`, `Markdown.spec.ts`  
**Estimated reduction:** ~80 tests eliminated  
**Risk:** Mixed

### 9.1 `Accordion.spec.ts` — border/padding theme variable tests (~35 tests → 3–4)

Same pattern as NavPanel. Group all border-side variants, border-color variants,
border-thickness variants into separate combined tests.

### 9.2 `Tabs.spec.ts` — `tabAlignment` tests (8 tests → 1)

All 8 tabAlignment tests render with a single `tabAlignment` prop value and check CSS.

### 9.3 `Slider.spec.ts` — graceful-handling tests (5 tests → 1)

5 "handles X gracefully" tests (NaN, null, undefined, empty string, "abc") → one test.

### 9.4 `Pagination.spec.ts` — `showPageSizeSelector` coercion tests (8 tests → 1)

8 type-coercion tests for the `showPageSizeSelector` prop → one test with 8 instances.

### 9.5 `Tooltip.spec.ts` — `side` and theme variable tests (4+5=9 tests → 2)

4 `side` position tests and 5 theme variable tests can each be consolidated into one test.

### 9.6 `Markdown.spec.ts` — File Download Attribute tests (6 tests → 1)

6 tests for different link URL patterns (extensions, web pages, query params) → one test.

### 9.7 `Drawer.spec.ts` — `position` tests (4 tests → 1)

The 4 position tests (left/right/top/bottom) open a Drawer and assert position offset.
These require interaction (click to open) but all use the same interaction sequence — render
4 drawers with different positions, open each one, assert, close each one.

---

## Summary Table

| Phase | Files | Current Tests | Estimated After | Reduction |
|-------|-------|--------------|-----------------|-----------|
| 1 | tests-e2e frame tests | ~70 | ~42 | ~28 |
| 2 | Heading family (7 files) | ~109 | ~55 | ~54 |
| 3 | Display components (8 files) | ~425 | ~293 | ~132 |
| 4 | Input type-coercion (4 files) | ~591 | ~435 | ~156 |
| 5 | Navigation border tests (4 files) | ~207 | ~127 | ~80 |
| 6 | Form components (5 files) | ~767 | ~668 | ~99 |
| 7 | Layout components (7 files) | ~353 | ~302 | ~51 |
| 8 | App layout (2 files) | ~381 | ~321 | ~60 |
| 9 | Remaining high-value (11 files) | ~456 | ~376 | ~80 |
| **Total** | | **~3,359** | **~2,619** | **~740** |

> Note: These estimates cover the ~37 files analyzed in detail. The remaining ~111 files
> (not analyzed here) contain further opportunities but at diminishing returns.

---

## Execution Workflow (per step)

Each step follows this exact sequence:

1. **Pre-flight** — Run the affected spec file(s) to confirm they all pass before changes.
2. **Refactor** — Apply the consolidation (merge tests into fewer `initTestBed` calls).
3. **Post-flight** — Run the same spec file(s) to confirm all tests still pass.
4. **Mark complete** — Update this plan (check off the step).
5. **Request approval** — Pause and ask before moving to the next step.

Progress legend: ⬜ not started · 🔄 in progress · ✅ done

---

## Step Checklist

### Phase 1 — tests-e2e Frame-Level Tests
- ✅ 1.1 `screen-breakpoints.spec.ts` (17 → 6 tests)
- ✅ 1.2 `responsive-when.spec.ts` inner describe blocks (25 → 8 tests)
- ✅ 1.3 `data-bindings.spec.ts` (8 → 2 tests)
- ✅ 1.4 `global-variables.spec.ts` (merged 3 static tests → 1)

### Phase 2 — Heading Component Family
- ✅ 2.1 Merge H1–H6 into `HeadingShortcuts.spec.ts` (24 → 6 tests)
- ✅ 2.2 `Heading.spec.ts` value-type tests (11 → 1)
- ✅ 2.3 `Heading.spec.ts` size-comparison tests (5 → 1)

### Phase 3 — Simple Display Components
- ✅ 3.1 `Text.spec.ts` variant forEach (23→1), htmlElement forEach (~15→1), value-type forEach (13→1), edge-case forEach (4→1), whitespace pair (2→1) (~53 reduction)
- ✅ 3.2 `Icon.spec.ts` invalid-name tests (9→1), predefined sizes (4→1), custom sizes (3→1) (~13 reduction)
- ✅ 3.3 `Avatar.spec.ts` initials tests (7→1) (~6 reduction)
- ⏸ 3.4 `Badge.spec.ts` — skipped (each test uses different `testThemeVars`; cannot share `initTestBed`)
- ✅ 3.5 `Br.spec.ts` lowercase/uppercase pairs (6→3) (~3 reduction)
- ⏸ 3.6 `NoResult.spec.ts` — skipped (same reason as Badge)
- ⬜ 3.7 `ProgressBar.spec.ts` edge-case value tests (16 → 2)

### Phase 4 — Input Components: Type Coercion Tests
- ⬜ 4.1 `Checkbox.spec.ts` initialValue type tests (~37 reduction)
- ⬜ 4.2 `Switch.spec.ts` initialValue type tests (~35 reduction)
- ⬜ 4.3 `DateInput.spec.ts` dateFormat + initialValue tests (~41 reduction)
- ⬜ 4.4 `TimeInput.spec.ts` initialValue + combination tests (~41 reduction)

### Phase 5 — Navigation Components: Border Theme Variable Tests
- ⬜ 5.1 `NavPanel.spec.ts` border tests (~33 reduction)
- ⬜ 5.2 `NavLink.spec.ts` border tests (~33 reduction)
- ⬜ 5.3 `Link.spec.ts` border-side tests (~28 reduction)
- ⬜ 5.4 `NavGroup.spec.ts` noIndicator combination tests (6 → 1)

### Phase 6 — Form Components
- ⬜ 6.1 `FormItem.spec.ts` type property tests (~23 reduction)
- ⬜ 6.2 `Form.spec.ts` static property tests (~22 reduction)
- ⬜ 6.3 `NumberBox.spec.ts` labelPosition and flag tests (~28 reduction)
- ⬜ 6.4 `TextBox.spec.ts` labelPosition and adornment tests (~14 reduction)
- ⬜ 6.5 `TextArea.spec.ts` resize option tests (~12 reduction)

### Phase 7 — Layout Components
- ⬜ 7.1 HStack/VStack/CVStack/CHStack (16 → 4 tests)
- ⬜ 7.2 `ContentSeparator.spec.ts` margin theme-var tests (~15 reduction)
- ⬜ 7.3 `FlowLayout.spec.ts` static behavior flag tests (~10 reduction)

### Phase 8 — App Layout Tests (last, highest risk)
- ⬜ 8.1 `App-layout.spec.ts` within-describe static layout tests (~30 reduction)
- ⬜ 8.2 `App-layout-mobile.spec.ts` same strategy (~30 reduction)

### Phase 9 — Remaining High-Value Targets
- ⬜ 9.1 `Accordion.spec.ts` border/padding theme-var tests (~35 reduction)
- ⬜ 9.2 `Tabs.spec.ts` tabAlignment tests (8 → 1)
- ⬜ 9.3 `Slider.spec.ts` graceful-handling tests (5 → 1)
- ⬜ 9.4 `Pagination.spec.ts` showPageSizeSelector coercion tests (8 → 1)
- ⬜ 9.5 `Tooltip.spec.ts` side and theme-var tests (~9 reduction)
- ⬜ 9.6 `Markdown.spec.ts` File Download Attribute tests (6 → 1)
- ⬜ 9.7 `Drawer.spec.ts` position tests (4 → 1)

---

## Guidelines for Implementers

### Creating merged tests

1. **Use unique testIds** for each component instance: `testId="null-case"`, `testId="xs-size"`, etc.
2. **Add comments** to each assertion explaining which variant it tests.
3. **Keep test name descriptive** — the merged test name should describe the group:
   `"handles all invalid initialValue types gracefully"` instead of `"handles null initialValue"`.
4. **Wrap in `<App>` not `<Fragment>`** when the component needs routing or context.
5. **Keep failures readable** — if merging makes a failure hard to diagnose, it's too aggressive.

### When NOT to merge even though it looks possible

- Tests that check **mutually exclusive CSS states** on the same element (e.g. borderLeft
  vs borderRight on the same component) → use separate instances with separate testIds
- Tests whose intended behavior requires a **clean component state** (e.g. form validation
  state bleeds across sibling instances)
- Tests that **validate error or warning states** that might visually interact

### Running merged tests

After each phase, validate:

```bash
# Run the specific spec file(s) that were changed
npx playwright test path/to/Component.spec.ts --workers=1 --reporter=line

# Final validation with full parallelism
npx playwright test path/to/Component.spec.ts --workers=10
```

Always run with `--workers=10` before considering a phase complete to catch race conditions
that only appear under parallel execution.

---

## Execution Order Recommendations

Start with **Phase 1** and **Phase 2** — they have the most predictable outcomes, are small
files, and produce immediate wins. Use them to validate the approach and build confidence.

Move to **Phase 4** (Checkbox/Switch/DateInput/TimeInput) next — these are the highest single-
file ROI but require careful handling of the test assertions.

**Phase 8** (App layout) should be tackled last — it is the most complex and high-risk phase.

The phases are independent of each other and can be tackled in parallel by different contributors.
