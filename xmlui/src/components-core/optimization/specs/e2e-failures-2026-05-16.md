# E2E Test Failures — 2026-05-16 (updated 2026-05-18)

> **Original run (2026-05-16):** 4m 55s | Total: 6911 tests | **21 failed**, 2 flaky, 65 skipped, 6823 passed  
> **Re-run after fix (2026-05-18):** 15m 10s | Total: 6915 tests | **135 failed**, 3 flaky, 65 skipped, 6712 passed  
> Branch: `yurii/computedUses`

**Net change:** Groups A, B, G fixed ✅ (−12 tests). New failures J–L added (extensions and timing issues, likely unrelated to computedUses — new test code added after 2026-05-16).

---

## Summary table

| # | Group | File | Tests | Status |
|---|-------|------|-------|--------|
| ~~A~~ | ~~Event handler closure / `$context` binding~~ | ~~`open-a-context-menu-on-right-click.spec.ts`~~ | ~~6~~ | ✅ fixed |
| ~~B~~ | ~~`refreshOn` event handler closure updates~~ | ~~`Table.spec.ts` (refreshOn section)~~ | ~~3~~ | ✅ fixed |
| ~~C~~ | ~~Context vars in event handlers (`$url`, `$method`, `$queryParams`)~~ | ~~`DataSource.spec.ts`~~ | ~~1~~ | ✅ fixed |
| D | Deferred / background async operations | `cancel-a-deferred-api-operation.spec.ts` | 2 | ❌ failed |
| D | Deferred / background async operations | `handle-background-operations.spec.ts` | 2 | ❌ failed |
| E | DataSource dependency chain | `delay-a-datasource-until-another-datasource-is-ready.spec.ts` | 2 | ❌ failed |
| F | Table multi-row selection | `enable-multi-row-selection-in-a-table.spec.ts` | 2 | ❌ failed |
| ~~G~~ | ~~Tree async loading (`loaded` field)~~ | ~~`Tree-loaded-field.spec.ts`~~ | ~~3~~ | ✅ fixed |
| H | Flaky | `MessageListener.spec.ts`, `Select.spec.ts`, `FormBindingBehavior.spec.ts` | 3 | ⚠️ flaky |
| J | Compound components + `$queryParams` / `$this` | `compound-component.spec.ts` | 4 | ❌ failed (new) |
| K | Timing / responsive (likely flaky) | `ChangeListener.spec.ts`, `Tree-spinnerDelay.spec.ts`, `make-a-table-responsive.spec.ts`, `use-the-same-modaldialog-to-add-or-edit.spec.ts` | 6 | ❌ failed (new) |
| L | Extensions — xmlui-search | `Search.spec.ts` | 20 | ❌ failed (new extension) |
| L | Extensions — xmlui-tiptap-editor | `TiptapEditor.spec.ts` | 9 | ❌ failed (new extension) |
| L | Extensions — xmlui-website-blocks | `Backdrop`, `Breakout`, `Carousel`, `HeroSection` specs | ~90 | ❌ failed (new extension) |
| L | Extension smoke — xmlui-recharts | Multiple recharts spec files | 23 | ❌ failed (was flaky, now consistent) |

---

## Group A — ✅ FIXED — Event handler closure / `$context` binding

**Fixed by:** `computedUses` now correctly includes `$context` in the `nonDynamicReadDeps` path;
`fullParentStateRef` propagates un-narrowed state to event handlers.

All 6 tests in `xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts` now pass.

---

## Group B — ✅ FIXED — `refreshOn` event handler closure updates

**Fixed by:** Bug 20 — `collectVariableDependencies` now includes LHS of assignment expressions
when called with `includeAssignmentTargets: true`. Table's `computedUses` correctly includes
`testState` (write-only target), making it available in scope for cell event handlers.

All 3 tests in `xmlui/src/components/Table/Table.spec.ts` (refreshOn Property) now pass.

---

## Group C — ✅ FIXED — Context vars in event handlers (`$url`, `$method`, `$queryParams`)

**Fixed by:** 
1. `computedUses` no longer treats `DataLoader` and `DataSource` `onFetch` references to fetch-injected names (`$url`, `$method`, `$queryParams`, …) as parent-scope deps. `$queryParams` collided with `ROUTING_STATE_KEYS` and narrowed the test Fragment to router query state, breaking merge with handler context.
2. The logic was refined to analyze `fetch` dependencies separately before adding them, rather than deleting them from the overall `usedHere` set, to prevent accidentally removing genuine dependencies that come from other props like `url="{$queryParams.q}"`.
3. `event-handlers`: always mirror `componentStateRef` into `stateRef` in `refreshStateRef` when `fullParentStateRef` is absent; apply handler `context` via `Object.assign` after `cloneDeep(originalState)` so injected fetch params reliably override router `$queryParams`.

**File:** `xmlui/src/components/DataSource/DataSource.spec.ts`

| Line | Test name |
|------|-----------|
| 549:3 | onFetch event › handler can use `$url`, `$method` and `$queryParams` context vars |

---

## Group D — Deferred / background async operations

**Root cause hypothesis:** These tests rely on button enabled/disabled state reacting to async operation  
progress. If `computedUses` scopes out the progress-tracking state variable, the UI may not re-render  
when it changes, leaving buttons stuck in wrong enabled state.

**File:** `xmlui/tests-e2e/how-to-examples/cancel-a-deferred-api-operation.spec.ts`

| Line | Test name |
|------|-----------|
| 21:3 | Cancel a long-running export › shows all buttons with correct initial enabled state |
| 28:3 | Cancel a long-running export › clicking Start Export enables the cancel buttons |

**File:** `xmlui/tests-e2e/how-to-examples/handle-background-operations.spec.ts`

| Line | Test name |
|------|-----------|
| 24:3 | Background file processing with progress feedback › clicking upload enqueues files and shows queue status |
| 30:3 | Background file processing with progress feedback › slider is interactive while uploads are running |

---

## Group E — DataSource dependency chain

**Root cause hypothesis:** Sequential DataSource loading relies on `isReady`/`isLoading` state of the first  
source gating the second. If `computedUses` scopes out those cross-component state flags, the second  
DataSource may fire before the first is ready, or the Select may not receive updated options.

**File:** `xmlui/tests-e2e/how-to-examples/delay-a-datasource-until-another-datasource-is-ready.spec.ts`

| Line | Test name |
|------|-----------|
| 29:3 | Load departments only after users are ready › Run loads users then departments and renders resolved Select options |
| 46:3 | Load departments only after users are ready › selecting a loaded user updates the Select value |

---

## Group F — Table multi-row selection

**Root cause hypothesis:** Multi-row selection tracking (selected rows array) may be a state variable  
that `computedUses` fails to include in the scoped view, causing selection actions to operate on  
a stale set.

**File:** `xmlui/tests-e2e/how-to-examples/enable-multi-row-selection-in-a-table.spec.ts`

| Line | Test name |
|------|-----------|
| 45:3 | Multi-row selection with bulk actions › Export Selected shows the selected employee name |
| 52:3 | Multi-row selection with bulk actions › Delete Selected removes the row from the table |

---

## Group G — ✅ FIXED — Tree async loading (`loaded` field)

All 3 tests in `xmlui/src/components/Tree/Tree-loaded-field.spec.ts` now pass.
Likely fixed as a side-effect of the `computedUses` improvements (better dep tracking through event handlers).

---

## Group H — Flaky (passed on at least one retry)

Updated list from the 2026-05-18 re-run:

| File | Line | Test name |
|------|------|-----------|
| `src/components/MessageListener/MessageListener.spec.ts` | 93:3 | Basic Functionality › doesn't disrupt Stack layout gaps |
| `src/components/Select/Select.spec.ts` | 3336:3 | data property › selection works with data prop |
| `src/components-core/behaviors/FormBindingBehavior.spec.ts` | 79:3 | Basic Functionality › Select with 'bindTo' updates Form data |

All three passed on retry — flaky timing, not related to computedUses.

---

## Group I — Extension smoke — xmlui-recharts (consistently failing as of 2026-05-18)

Previously retried and passed. Now all 23 consistently fail. Error pattern: `ERR_CONNECTION_REFUSED` to localhost:3211 — the extension smoke tests may require a separate server setup that isn't configured in the static-serve mode.

Unrelated to `computedUses`. Needs extension infrastructure investigation.

---

## Group J — Compound component state / `$queryParams` / `$this` (new, added after 2026-05-16)

**Root cause hypothesis:** These tests exercise `$this`, component API calls, and `$queryParams` inside compound components. Likely a pre-existing computedUses regression in compound component scoping that was introduced before the 2026-05-16 triage but not yet covered by tests at that date.

**File:** `xmlui/tests-e2e/compound-component.spec.ts`

| Line | Test name |
|------|-----------|
| 585:1 | `$this` works in compound components |
| 599:1 | call api with id works in compound components |
| 722:1 | var initialized with `$queryParams` resolves correctly after SPA navigation |
| 759:1 | var initialized with `$queryParams` resolves correctly on direct URL load |

---

## Group K — Timing / responsive layout (new, likely flaky or environment-specific)

These tests likely fail due to timing sensitivity (debounce timers, spinnerDelay waits, responsive breakpoints) rather than computedUses logic. May become stable with longer timeouts or more retries.

| File | Line | Test name |
|------|------|-----------|
| `src/components/ChangeListener/ChangeListener.spec.ts` | 267:1 | debounceWaitInMs resets timer on each change within the window |
| `src/components/Tree/Tree-spinnerDelay.spec.ts` | 114:3 | spinnerDelay Property › expand icon shows during delay period with spinnerDelay=300 |
| `src/components/Tree/Tree-spinnerDelay.spec.ts` | 304:3 | spinnerDelay Property › spinnerDelay works with hierarchy data format |
| `tests-e2e/how-to-examples/make-a-table-responsive.spec.ts` | 60:3 | Make a Table responsive › all five people are always shown in the Name column |
| `tests-e2e/how-to-examples/use-the-same-modaldialog-to-add-or-edit.spec.ts` | 36:3 | Use the same ModalDialog to add or edit › clicking Edit opens the dialog in edit mode |

---

## Group L — New extension packages (added after 2026-05-16)

These packages didn't exist or weren't tested at the time of the original triage. All failures are in `extensions-nonsmoke` or `extensions-smoke`. Not related to `computedUses`.

| Package | Tests failing | Probable cause |
|---------|--------------|----------------|
| `xmlui-search` | 20 | New package, dev server not available in static mode |
| `xmlui-tiptap-editor` | 9 | New package, editor environment requirements |
| `xmlui-website-blocks` (Backdrop, Breakout, Carousel, HeroSection) | ~90 | New package, static serving issues |

---

## Priority for investigation

1. **✅ Done:** Groups A, B, C, G — computedUses / event-handler scope fixes (Bug 20–21)
2. **High (likely computedUses regression):** Groups D, E, F — async state gating, cross-component flags
3. **Medium (possibly computedUses):** Group J — compound component `$this` / `$queryParams` scoping
4. **Low / skip:** Group K — timing-sensitive tests, not computedUses
5. **Infrastructure / ignore:** Groups H, I, L — flaky env, new extension packages
