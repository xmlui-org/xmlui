# E2E Test Failures — 2026-05-16

> Run: `npm test` → `turbo run //#_e2e`  
> Duration: 4m 55s | Total: 6911 tests | **21 failed**, 2 flaky, 65 skipped, 6823 passed  
> Branch: `yurii/computedUses`

---

## Summary table

| # | Group | File | Tests | Status |
|---|-------|------|-------|--------|
| A | Event handler closure / `$context` binding | `open-a-context-menu-on-right-click.spec.ts` | 6 | ❌ failed |
| B | `refreshOn` event handler closure updates | `Table.spec.ts` (refreshOn section) | 3 | ❌ failed |
| C | Context vars in event handlers (`$url`, `$method`, `$queryParams`) | `DataSource.spec.ts` | 1 | ❌ failed |
| D | Deferred / background async operations | `cancel-a-deferred-api-operation.spec.ts` | 2 | ❌ failed |
| D | Deferred / background async operations | `handle-background-operations.spec.ts` | 2 | ❌ failed |
| E | DataSource dependency chain | `delay-a-datasource-until-another-datasource-is-ready.spec.ts` | 2 | ❌ failed |
| F | Table multi-row selection | `enable-multi-row-selection-in-a-table.spec.ts` | 2 | ❌ failed |
| G | Tree async loading (`loaded` field) | `Tree-loaded-field.spec.ts` | 3 | ❌ failed |
| H | Flaky (passed on retry) | `Table.spec.ts`, `datasource-responseHeaders.spec.ts` | 2 | ⚠️ flaky |
| I | Extension smoke — xmlui-recharts | Multiple recharts spec files | 23 retries | ⚠️ retried (likely flaky) |

---

## Group A — Event handler closure / `$context` binding (computedUses regression candidate)

**Root cause hypothesis:** `computedUses` narrows what parent state props trigger a re-render.  
When a right-click handler reads `$context` (the row bound at click time), it may read a stale closure  
because the Container was memo-blocked and `stateRef.current` was not updated.  
Related to B1 finding in `code-review-computedUses-branch.md`.

**File:** `xmlui/tests-e2e/how-to-examples/open-a-context-menu-on-right-click.spec.ts`

| Line | Test name |
|------|-----------|
| 29:3 | Right-click a project row › right-clicking a card opens the context menu with all actions |
| 41:3 | Right-click a project row › pressing Escape closes the context menu |
| 49:3 | Right-click a project row › clicking Edit records the last action for the right-clicked row |
| 61:3 | Right-click a project row › clicking Duplicate records the last action for the right-clicked row |
| 73:3 | Right-click a project row › clicking Archive records the last action for the right-clicked row |
| 85:3 | Right-click a project row › the `$context` binds to the row that was right-clicked |

---

## Group B — `refreshOn` event handler closure updates (computedUses regression candidate)

**Root cause hypothesis:** The `refreshOn` property triggers a re-render so that loaders/handlers  
pick up fresh closure values. If `computedUses` memo-blocks the Container, the closure update  
may not propagate — exactly the "stale event handler" scenario from B1.

**File:** `xmlui/src/components/Table/Table.spec.ts`

| Line | Test name |
|------|-----------|
| 4487:3 | refreshOn Property › updates event handler closures when refreshOn changes |
| 4510:3 | refreshOn Property › does not update event handler closures when refreshOn is unchanged |
| 4536:3 | refreshOn Property › updates event handler closures if refreshOn is not provided |

---

## Group C — Context vars in event handlers (`$url`, `$method`, `$queryParams`)

**Root cause hypothesis:** `$url`, `$method`, `$queryParams` are injected as `$param`-style dynamic context  
vars during DataSource fetch. If `computedUses` static analysis fails to mark them as dependencies  
(they're injected at runtime, not declared in the component tree), the `onFetch` handler may  
receive stale or missing context. Connected to the `$param in computedUses` root-cause finding  
documented in session 4 handoff.

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

## Group G — Tree async loading (`loaded` field)

**Root cause hypothesis:** Tree uses an async loading pattern where child nodes are fetched on demand.  
The `loaded` field tracks which nodes have completed loading. If `computedUses` scopes this out  
of the render state, Tree may not reflect the correct loading state in its UI or API methods.

**File:** `xmlui/src/components/Tree/Tree-loaded-field.spec.ts`

| Line | Test name |
|------|-----------|
| 335:3 | Async Loading with loaded Field › marks node as loaded after successful load |
| 377:3 | Async Loading with loaded Field › handles empty children response |
| 579:3 | API Methods with loaded Field › `getNodeLoadingState` returns correct state |

---

## Group H — Flaky (passed on at least one retry)

These tests passed on retry — not definitively broken, but unstable.

| File | Line | Test name |
|------|------|-----------|
| `xmlui/src/components/Table/Table.spec.ts` | 4181:3 | Column width theme variables › column width is consistent whether specified as px or equivalent em theme var |
| `xmlui/tests-e2e/datasource-responseHeaders.spec.ts` | 3:1 | DataSource exposes responseHeaders after successful fetch |

---

## Group I — Extension smoke tests — xmlui-recharts (all retried, likely flaky environment)

All 23 retry attempts are from `[extensions-smoke]` project, `packages/xmlui-recharts/src/`.  
They are NOT in the final "21 failed" list — all passed on retry. Likely unrelated to computedUses;  
probable cause: chart rendering timing / canvas not ready.

| File | Tests retried |
|------|--------------|
| `AreaChart/AreaChart.spec.ts` | 4 (basic props, chart elements, empty data, single data point) |
| `BarChart/BarChart.spec.ts` | 2 (basic props, bar series count) |
| `DonutChart/DonutChart.spec.ts` | 4 (basic props, sectors, structure, innerRadius) |
| `Legend/Legend.spec.ts` | 2 (within PieChart, within BarChart) |
| `LineChart/LineChart.spec.ts` | 2 (basic props, line series count) |
| `PieChart/PieChart.spec.ts` | 3 (basic props, sectors, structure) |
| `RadarChart/RadarChart.spec.ts` | 4 (basic props, elements count, empty data, single point) |
| `Tooltip/TooltipContent.spec.ts` | 2 (hover in PieChart, hover in BarChart) |

---

## Priority for investigation

1. **High (likely computedUses regression):** Groups A, B, C — event handler closures, `$context`, `$queryParams`
2. **Medium (likely computedUses regression):** Groups D, E, F — async state gating and selection
3. **Medium (may be unrelated):** Group G — Tree loaded field
4. **Low / ignore for now:** Groups H, I — flaky timing issues
