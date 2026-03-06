# E2E Test Consolidation Plan

## Overview

The project has approximately **5,929 E2E test cases** spread across:
- 116 component spec files in `xmlui/src/components/**/`
- 27 general spec files in `xmlui/tests-e2e/`

Starting an E2E test is expensive (dev-server spin-up, XMLUI parse, browser render). The primary optimization is to **reduce the number of `initTestBed()` calls** by merging tests that can share a single rendered app instance.

Phases 1–9 are complete, saving approximately **~430 tests**. Phase 10 (below) targets the next ~400+ reduction across the remaining unanalyzed files.

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

## Completed Phases Summary (1–9)

| Phase | Files | Key merges | Actual reduction |
|-------|-------|-----------|-----------------|
| 1 | 4 tests-e2e frame files | breakpoints (17→6), responsive-when inner groups (25→8), data-bindings (8→2), global-vars | ~28 |
| 2 | 7 Heading files | H1–H6 → HeadingShortcuts (24→6), value-type tests (11→1), size-comparison (5→1) | ~54 |
| 3 | Text, Icon, Avatar, Br | forEach variant groups, invalid-name (9→1), initials (7→1), br pairs | ~75 |
| 4 | Checkbox, Switch, DateInput, TimeInput | initialValue type coercion groups | −81 |
| 5 | NavPanel, NavLink, NavGroup, Link | non-border static prop groups | −16 |
| 6 | FormItem, NumberBox, TextBox, TextArea, Form | labelPosition, requireLabelMode, resize | −24 |
| 7 | HStack, VStack, CVStack, CHStack, ContentSeparator | static layout groups | −13 |
| 8 | App-layout, App-layout-mobile | tall-content 3-test triples → sequential | −120 |
| 9 | Accordion, Tabs, Slider, Pagination, Tooltip, Drawer, Markdown | border/padding vars, coercion, position | −69 |
| **Total** | **~47 files** | | **~480** |

> **Note on the sequential `initTestBed` pattern** — Phases 1–6 primarily merged tests by
> rendering multiple component instances in one `initTestBed` call. Phases 7–9 established
> a second equally powerful pattern: **sequential `initTestBed` calls within one `test()`**.
> Each call fully re-renders the page, so even tests with different `testThemeVars` can be
> merged this way. This unlocks the border/padding theme-variable test families that were
> previously skipped in Phases 3 and 5 (Badge, NoResult, NavPanel, NavLink, Link).

---

## Phase 10 — Remaining High-Value Targets

**Estimated reduction: ~400+ tests**  
**Risk:** Low–Medium (all are pure property/theme-var variation, no complex state logic)

The files below follow the same patterns established in earlier phases. All are mergeable
using sequential `initTestBed` calls unless noted otherwise.

### 10.1 `Badge.spec.ts` (108 → ~12, −~96)

`Badge.spec.ts` contains two large theme-variable describe blocks — **"Theme Vars: Badge"**
and **"Theme Vars: Pill"** — with an identical test structure to `Accordion.spec.ts`:

| Group | Tests | Merge strategy |
|-------|-------|----------------|
| "Theme Vars: Badge" border-side tests | border, borderLeft, borderRight, borderHorizontal, borderHorizontal+borderLeft, borderHorizontal+borderRight, borderTop, borderBottom, borderVertical, borderVertical+borderTop, borderVertical+borderBottom ≈ **11 tests → 1** | sequential `initTestBed` with `createBadgeDriver` |
| "Theme Vars: Badge" border-color tests | border-color, border+border-color, border+border-color-horizontal … bottom ≈ **8 tests → 1** | sequential |
| "Theme Vars: Badge" border-style tests | border-style, border+border-style, …+horizontal/left/right/vertical/top/bottom ≈ **8 tests → 1** | sequential |
| "Theme Vars: Badge" border-thickness tests | border-thickness, border+border-thickness, …+horizontal/left/right/vertical/top/bottom ≈ **8 tests → 1** | sequential |
| "Theme Vars: Badge" padding tests | padding, paddingHorizontal, paddingLeft, paddingRight, paddingVertical, paddingTop, paddingBottom, padding+paddingHorizontal, …+Left, …+Right, …+Vertical, …+Top, …+Bottom ≈ **13 tests → 1** | sequential |
| "Theme Vars: Pill" (same five groups as Badge) | ≈ **50 tests → 5** | sequential |

The non-theme-var tests (render, colorMap, pill shape, fontSize, fontWeight) are short and
best left untouched (~8 tests untouched).

### 10.2 `Footer.spec.ts` (54 tests → ~14, −~40)

The "Visual State" describe block mirrors Badge/Accordion's border test structure exactly:
border-side (11), border-color (8), border-style (8), border-thickness (8) → merge each
family into one sequential test.

The "sticky property" describe block contains 12 tests for 6 layout × sticky/not-sticky.
Each test scrolls the page and checks position — these CAN be merged into two sequential
tests: one for all "sticky by default" layouts, one for all "sticky=false" layouts, since
each `initTestBed` call resets the scroll state.

### 10.3 `NoResult.spec.ts` (35 → ~3, −~32)

Previously skipped in Phase 3.6 because it uses different `testThemeVars` per test.
With sequential `initTestBed` calls this is now straightforward — identical structure to
Accordion's border/padding groups. All 35 border+padding theme-var tests → 3 merged tests
(border-sides, border-color/style/thickness, padding).

### 10.4 `Select.spec.ts` (122 → ~90, −~32)

Most tests involve user interaction (clicks, keyboard, option selection) and are not
mergeable. The following groups are safe:

| Group | Tests | Saves |
|-------|-------|-------|
| Visual State: width tests (px, px+label, %, %+label) | 4 → 1 | 3 |
| searchable: dropdownHeight tests (custom, default, search+height) | 3 → 1 | 2 |
| searchable: inProgressNotificationMessage (true, false) | 2 → 1 | 1 |
| Theme Variables describe block (forEach-generated tests — inspect exact count) | TBD | ~15–25 |

### 10.5 `Stack.spec.ts` (67 → ~45, −~22)

The `Stack` component has scroll-API tests: `scrollToTop`, `scrollToBottom`,
`scrollToStart`, `scrollToEnd` — each tested with `'smooth'`, `'instant'`, and default
behavior (3 variants each). These 3-variant groups match the App-layout pattern exactly
(Phase 8): merge each direction group into one sequential test.

Also: `showScrollerFade` with `overlay`/`whenMouseOver`/`whenScrolling` (3 → 1) and
`itemWidth` variants (px, %, fit-content, star) (4 → 1).

### 10.6 `IFrame.spec.ts` (49 → ~28, −~21)

Pure property-variation tests:

| Group | Tests | Saves |
|-------|-------|-------|
| `allow` property (empty, null, undefined) | 3 → 1 | 2 |
| `name` property (empty, null, undefined, unicode, normal) | 5 → 1 | 4 |
| `referrerPolicy` values (9 valid policies + null/invalid) | 9 → 1 | 8 |
| `sandbox` flag combinations (3 cases) | 3 → 1 | 2 |
| Theme variables (width, height, borderRadius, border — CSS checks) | 4–6 → 1 | ~4 |

### 10.7 `App.spec.ts` (58 → ~43, −~15)

| Group | Tests | Saves |
|-------|-------|-------|
| Layout variants (horizontal, condensed, vertical, vertical-full-header, vertical-sticky, horizontal-sticky, desktop) | 7–8 → 1 | ~6 |
| Fragment with `when` conditions (false, true, with Theme wrapper) | 3 → 1 | 2 |
| Drawer hamburger `when` conditions (none, true, {true}, false, {false}) | 5 → 1 | 4 |
| Layout input validation (unicode dashes, fallback, whitespace, extra spaces) | 4 → 1 | 3 |

### 10.8 `APICall.spec.ts` (88 → ~68, −~20)

`APICall` tests often click a button then wait for a response — but when the interaction
pattern is identical across variants they can still be merged sequentially.

| Group | Tests | Saves |
|-------|-------|-------|
| HTTP methods: GET, POST, PUT, DELETE | 4 → 1 | 3 |
| Context variables: `$param`, `$params`, `$result`, `$error` | 4 → 1 | 3 |
| Spinner delay values: 0, null, undefined, negative, numeric | 5 → 1 | 4 |
| `credentials` values: omit, same-origin, include, default | 4 → 1 | 3 |
| URL variants: absolute, relative, special characters | 3 → 1 | 2 |

### 10.9 Chart files — boolean prop groups (−~50 combined)

All Recharts-based chart files follow the same structure: a `test.describe` per prop, with
tests for `default` / `true` / (`false when applicable`). Each set is a direct 3→1 merge.

| File | Tests | Mergeable groups | Saves |
|------|-------|-----------------|-------|
| `AreaChart.spec.ts` | 62 | hideX, hideY, hideTickX, hideTickY, hideTooltip, showLegend, stacked, curved (3→1 each) | −16 |
| `BarChart.spec.ts` | 33 | hideX, hideY, hideTickX, hideTickY, stacked, legend, tooltip (2–3→1 each) | −10 |
| `DonutChart.spec.ts` | 35 | legend (3→1), innerRadius (5→1), showLabel (4→1), showLabelList (3→1) | −11 |
| `PieChart.spec.ts` | 33 | Similar to BarChart/DonutChart | ~−10 |
| `RadarChart.spec.ts` | 33 | Similar boolean prop groups | ~−8 |
| `Legend.spec.ts` | 27 | Property variant groups | ~−5 |
| `LabelList.spec.ts` | 25 | Property variant groups | ~−5 |
| `LineChart.spec.ts` | 24 | Similar boolean prop groups | ~−5 |

### 10.10 `Splitter.spec.ts` (51 → ~38, −~13)

| Group | Tests | Saves |
|-------|-------|-------|
| `when=false` on children (4 cases) | 4 → 1 | 3 |
| `orientation` (horizontal, vertical, default) | 3 → 1 | 2 |
| `initialPrimarySize` (25%, 100px, default 50%) | 3 → 1 | 2 |
| `floating` prop (true, false) | 2 → 1 | 1 |
| Size constraint edge cases (null, undefined, invalid) | 3 → 1 | 2 |
| Theme variables (borderColor, thickness variants, cursor) | 5 → 1–2 | ~3 |

### 10.11 `ScrollViewer.spec.ts` (40 → ~28, −~12)

| Group | Tests | Saves |
|-------|-------|-------|
| `scrollStyle` variants (normal, overlay, whenMouseOver, whenScrolling) | 4 → 1 | 3 |
| `showScrollerFade` (default, true, false) | 3 → 1 | 2 |
| Invalid `scrollStyle` values (null, undefined, invalid string) | 3 → 1 | 2 |
| Theme variables (size, backgroundColor-handle, borderRadius, minSize, backgroundColor-track) | 5 → 1 | 4 |

### 10.12 `AutoComplete.spec.ts` (65 → ~50, −~15)

Inspect the Theme Variables section — likely the same forEach validation-status pattern as
`Select.spec.ts`. Merge each property's 4-variant test group into one sequential test.
Also: requireLabelMode (6 → 2), validation feedback modes (5 → 2).

### 10.13 `ColorPicker.spec.ts` (64 → ~50, −~14)

| Group | Tests | Saves |
|-------|-------|-------|
| `requireLabelMode` variants (markRequired, markOptional, markBoth + form inheritance) | 6 → 2 | 4 |
| Theme variables (backgroundColor, borderColor, borderRadius, borderWidth, borderStyle, boxShadow, width, height) | 8 → 2 | 6 |
| `enabled` true/false | 2 → 1 | 1 |
| Edge cases (invalid color, required, readOnly) | 3 → 1 | 2 |

### 10.14 `RadioGroup.spec.ts` (48 → ~39, −~9)

| Group | Tests | Saves |
|-------|-------|-------|
| `initialValue` type variants (string/number/boolean matching/not-matching) | 6 → 2 | 4 |
| `requireLabelMode` variants | 7 → 2 | 5 |

### 10.15 `DatePicker.spec.ts` (41 → ~33, −~8)

| Group | Tests | Saves |
|-------|-------|-------|
| `requireLabelMode` variants | 7 → 2 | 5 |
| Validation feedback modes (verbose/concise, icon visibility, tooltip) | 5 → 2 | 3 |

### 10.16 `Table.spec.ts` (159 → ~140, −~19)

Most Table tests use complex interactions (sorting, selection, scrolling). Safe merges:

| Group | Tests | Saves |
|-------|-------|-------|
| `hideHeader` true/false | 2 → 1 | 1 |
| `hideSelectionCheckboxes` true/false | 2 → 1 | 1 |
| `checkboxTolerance` (compact, none, comfortable, spacious) | 8 → 2 | 6 |
| `alwaysShowSortingIndicator` true/false | 4 → 2 | 2 |
| `noDataTemplate` (null, empty, custom) | 3 → 1 | 2 |
| Width variants (4 layout cases) | 4 → 2 | 2 |
| Column alignment (horizontal: start, center, end) | 5 → 2 | 3 |

### 10.17 Smaller wins (−~60 combined)

| File | Tests | Target groups | Saves |
|------|-------|--------------|-------|
| `ProgressBar.spec.ts` *(leftover from Phase 3.7)* | ~16 | Edge-case values (9→1), basic values (7→1) | ~14 |
| `Spinner.spec.ts` | ~25 | Delay values (6→1), basic render (3→1), accessibility (2→1), fullScreen (2→1) | ~8 |
| `ResponsiveBar.spec.ts` | 33 | `dropdownText` (7→1), `dropdownAlignment` (4→1), `reverse` (5→2) | ~9 |
| `FileInput.spec.ts` | ~35 | Width tests (4→1), `requireLabelMode` (6→2), file type handling (4→1) | ~10 |
| `TableOfContents.spec.ts` | 33 | `maxHeadingLevel` (3→1), `smoothScrolling` (2→1) | ~3 |
| `ExpandableItem.spec.ts` | 56 | Icon positions (4→1), accessibility keyboard (6→2) | ~7 |
| `Carousel.spec.ts` | 41 | Dimension theme vars (4→2) | ~2 |
| `ContextMenu.spec.ts` | 32 | Alignment (2→1), theme vars (2→1) | ~2 |
| `Image.spec.ts` | 25 | `fit` property (3→1), lazy loading (3→1) | ~4 |

### Not analyzed (further opportunities at diminishing returns)

The following files have not been analyzed in detail. They likely contain merge opportunities
but at smaller scale:

`Tree.spec.ts` (139), `Tree-dynamic.spec.ts` (51), `Tree-replace-apis.spec.ts` (~20),
`Tree-loaded-field.spec.ts` (~15), `List.spec.ts` (67), `Queue.spec.ts` (29),
`AppState.spec.ts` (16), `CodeBlock.spec.ts` (15), `Button.spec.ts` (24),
`DropdownMenu.spec.ts` (24), `Option.spec.ts` (31), `Card.spec.ts` (24),
`RatingInput.spec.ts`, `Backdrop.spec.ts` (10), `ChangeListener.spec.ts` (8),
`FileUploadDropZone.spec.ts` (37), `HtmlTags.spec.ts`, and others.

---

## Guidelines for Implementers

### Creating merged tests

1. **Sequential `initTestBed` calls** — each call fully re-renders the page. Use this when
   tests differ only by a theme var (including `testThemeVars`), prop value, or markup variant.
2. **Parallel instances in one `initTestBed`** — render multiple component instances with
   unique `testId`s when they can live side-by-side. Use this for simple value-type checks
   where CSS state doesn't need to be isolated.
3. **Use `let` instead of `const`** for driver/component variables that are reassigned across
   sequential `initTestBed` calls: `let component = (await createDriver()).component`.
4. **Add inline comments** between `initTestBed` blocks to name each variant.
5. **Keep test names descriptive** — `"applies border-side theme variables"` not `"borderLeft"`.
6. **Wrap in `<App>` not `<Fragment>`** when the component needs routing or app context.

### When NOT to merge even though it looks possible

- Tests that require **different viewport sizes** per variant and there is no `initTestBed`
  call between the viewport change and the assertion — must stay separate.
- Tests whose intended behavior requires a **clean component state** that could bleed across
  sibling instances in the same render.
- Tests that **validate error or warning states** that might visually interact with siblings.
- Very long sequential blocks (>10 `initTestBed` calls) where a failure would be hard to
  diagnose — consider splitting into 2–3 merged tests instead of one giant one.

### Running merged tests

```bash
# Run a single spec file
npx playwright test path/to/Component.spec.ts --workers=4 --reporter=line

# Final validation under full parallelism (catches race conditions)
npx playwright test path/to/Component.spec.ts --workers=10
```

---

## Step Checklist

Progress legend: ⬜ not started · 🔄 in progress · ✅ done · ⏸ skipped

### Phases 1–9 (Complete)

- ✅ Phase 1: tests-e2e frame files (−28)
- ✅ Phase 2: Heading family — H1–H6 merged, value-types, sizes (−54)
- ✅ Phase 3: Text, Icon, Avatar, Br forEach/pair groups (−75); Badge and NoResult skipped → revisited in Phase 10; ProgressBar → Phase 10
- ✅ Phase 4: Checkbox, Switch, DateInput, TimeInput type-coercion groups (−81)
- ✅ Phase 5: Link, NavLink, NavGroup non-border groups (−16)
- ✅ Phase 6: FormItem, NumberBox, TextBox, TextArea, Form static groups (−24)
- ✅ Phase 7: HStack/VStack/CVStack/CHStack, ContentSeparator (−13)
- ✅ Phase 8: App-layout, App-layout-mobile tall-content triples (−120)
- ✅ Phase 9: Accordion, Tabs, Slider, Pagination, Tooltip, Drawer, Markdown (−69)

### Phase 10 — Remaining High-Value Targets

- ✅ 10.1 `Badge.spec.ts` border/padding theme-var tests (~108 → ~12, −~96)
- ⬜ 10.2 `Footer.spec.ts` border/padding theme-vars + sticky variants (~54 → ~14, −~40)
- ⬜ 10.3 `NoResult.spec.ts` border/padding theme-var tests (35 → ~3, −~32)
- ⬜ 10.4 `Select.spec.ts` theme-var + width + inProgress tests (−~30)
- ⬜ 10.5 `Stack.spec.ts` scroll-API method variants + scrollerFade + itemWidth (−~22)
- ⬜ 10.6 `IFrame.spec.ts` allow/name/referrerPolicy/sandbox/theme-var groups (−~21)
- ⬜ 10.7 `App.spec.ts` layout variants, hamburger conditions, input validation (−~15)
- ⬜ 10.8 `APICall.spec.ts` HTTP methods, context vars, delay, credentials, URL (−~20)
- ⬜ 10.9 `AreaChart.spec.ts` boolean prop groups (62 → ~46, −~16)
- ⬜ 10.10 `BarChart.spec.ts` boolean prop groups (33 → ~23, −~10)
- ⬜ 10.11 `DonutChart.spec.ts` legend/innerRadius/showLabel groups (35 → ~24, −~11)
- ⬜ 10.12 `PieChart.spec.ts` boolean prop groups (−~10)
- ⬜ 10.13 `RadarChart.spec.ts` boolean prop groups (−~8)
- ⬜ 10.14 `Legend.spec.ts` property variant groups (−~5)
- ⬜ 10.15 `LabelList.spec.ts` property variant groups (−~5)
- ⬜ 10.16 `LineChart.spec.ts` boolean prop groups (−~5)
- ⬜ 10.17 `Splitter.spec.ts` orientation/initialPrimarySize/floating/theme-var (−~13)
- ⬜ 10.18 `ScrollViewer.spec.ts` scrollStyle/showScrollerFade/theme-var (−~12)
- ⬜ 10.19 `AutoComplete.spec.ts` theme-var + requireLabelMode groups (−~15)
- ⬜ 10.20 `ColorPicker.spec.ts` requireLabelMode + theme-var + edge cases (−~14)
- ⬜ 10.21 `RadioGroup.spec.ts` initialValue types + requireLabelMode (−~9)
- ⬜ 10.22 `DatePicker.spec.ts` requireLabelMode + validation feedback (−~8)
- ⬜ 10.23 `Table.spec.ts` boolean props + tolerance + alignment groups (−~19)
- ⬜ 10.24 `ProgressBar.spec.ts` edge-case + basic value groups (−~14)
- ⬜ 10.25 `Spinner.spec.ts` delay + render + accessibility groups (−~8)
- ⬜ 10.26 `ResponsiveBar.spec.ts` dropdownText/Alignment/reverse groups (−~9)
- ⬜ 10.27 `FileInput.spec.ts` width/requireLabelMode/fileType groups (−~10)
- ⬜ 10.28 `TableOfContents.spec.ts` maxHeadingLevel/smoothScrolling (−~3)
- ⬜ 10.29 `ExpandableItem.spec.ts` icon positions + keyboard accessibility (−~7)
- ⬜ 10.30 Remaining smaller files (Image, Carousel, ContextMenu, …) (−~10)

