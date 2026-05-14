# Failing Tests Triage — 2026-05-13

Branch: `yurii/computedUses`  
Total failures: **189**

Likely root cause: changes to `computeUsesInternal` / `computedUses` logic that altered how
free/context variables are tracked, scoped, or propagated.

---

## Group Summary

| # | Group | Count | Priority |
|---|-------|-------|----------|
| A | Context-variable propagation (`$param`, `$context`, `$item`, etc.) | ~25 | P0 — root cause |
| B | `bindTo` / form-value sync (`$data`) | ~16 | P0 — likely same root |
| C | APICall — core (notifications, execute, edge-cases, mockExecute) | ~20 | P1 |
| D | APICall — Deferred Mode (polling, cancellation, integration) | ~13 | P1 |
| E | List row-selection (events, APIs, keyboard shortcuts) | ~15 | P2 |
| F | Table (onContextMenu, keyboard copy, refreshOn) | ~10 | P2 |
| G | Form / Navigation events | ~5 | P2 |
| H | Tree async loading | ~6 | P2 |
| I | TileGrid refreshOn | ~3 | P3 |
| J | Toast | ~4 | P3 |
| K | E2E how-to-examples (@website) | ~45 | P3 — depend on A–H |
| L | Extensions (TableSelect, Gauge, TiptapEditor) | ~3 | P3 |
| M | Other E2E (compound-component, context-vars, init-cleanup) | ~4 | P3 |

---

## Stage 1 — Diagnose (Before Writing Any Fix)

**Goal:** confirm what error message the tests actually produce; check if it's one root cause
or many.

Tasks:
1. Run one representative test from Group A and capture the full error:
   ```
   npx playwright test xmlui/src/components/ModalDialog/ModalDialog.spec.ts:23 --reporter=list
   ```
2. Run one from Group B:
   ```
   npx playwright test xmlui/src/components/TextBox/TextBox.spec.ts:402 --reporter=list
   ```
3. Compare stack traces — if they share the same failing assertion / internal throw, Groups A
   and B have a common fix.
4. Check `computeUsesInternal` diff against `main` for any accidental narrowing of free-variable
   sets that would hide `$param`, `$data`, or `$item`.

---

## Stage 2 — Fix Context-Variable Propagation (Groups A + B)

**Why first:** Every E2E how-to test (Group K) depends on context variables working.
Fixing A+B unblocks the largest downstream group.

### Group A — Context-variable propagation

Files:
- `ModalDialog.spec.ts` lines 23, 37, 53, 203, 218, 235 — `$param` in open/close
- `APICall.spec.ts` lines 1316, 1344 — `$param`, `$params` in context variables
- `ContextMenu.spec.ts` lines 50, 125 — `$context` via `openAt`
- `Checkbox.spec.ts` lines 885, 900 — `$checked`/`$setChecked` scope isolation
- `DataSource.spec.ts` line 549 — `$url`, `$method`, `$queryParams` in `onFetch`
- `Table.spec.ts` lines 1484–1572 — `$item`, `$row`, `$rowIndex`, `$itemIndex` in `onContextMenu`
- `Toast.spec.ts` line 107 — `$param` in default template
- `Queue.spec.ts` line 737 — context variables in templates
- `List.spec.ts` line 14 — `$context` via `contextMenu`

### Group B — `bindTo` / `$data` sync

All these tests assert that the component's internal value and `$data` in a parent variable
stay in sync. Failing components:

- AutoComplete (line 403)
- Checkbox (line 651)
- ColorPicker (line 385)
- DateInput (line 816)
- DatePicker (line 556)
- FileInput (line 133)
- NumberBox (line 520)
- RadioGroup (line 600)
- Select (line 1040)
- Slider (line 513)
- Switch (line 615)
- TextArea (line 932)
- TextBox (lines 402, 417)
- TimeInput (line 1435)
- TableSelect/extension (line 562)

Verification after fix:
```
npx playwright test --grep "bindTo syncs" --reporter=list
```

---

## Stage 3 — Fix APICall (Groups C + D)

### Group C — Core notifications, execute, edge-cases, mockExecute

Tests:
- Notification properties (lines 998–1176)
- Execute with parameters (lines 1226, 1251)
- Edge cases: null/undefined, large payloads, Unicode (lines 1432, 1506, 1531)
- mockExecute event: `$queryParams`, `$requestBody`, `$requestHeaders`, `$param`, `$params`,
  mock list example (lines 3382–3595)

### Group D — Deferred Mode

Tests (all in `APICall.spec.ts`):
- Step 3 — Single Poll (lines 2153–2230)
- Step 4 — Polling Loop (lines 2266–2358)
- Step 5 — Status Update Event (lines 2400–2488)
- Step 6 — Progress & context variables (line 2552)
- Step 7 — Notifications (line 2677)
- Step 11 — Cancellation (lines 2917, 2970)
- Step 12 — Integration & Polish (lines 3072–3272)

Verification after fix:
```
npx playwright test xmlui/src/components/APICall/APICall.spec.ts --reporter=list
```

---

## Stage 4 — Fix Interaction Events (Groups E + F + G)

### Group E — List row-selection

- `selectionDidChange` event (lines 1513, 1530, 1550)
- `rowDoubleClick` event (lines 1569, 1585)
- `rowUnselectablePredicate` (lines 1606–1682)
- `hideSelectionCheckboxes` (line 1753)
- `selectionCheckboxPosition` overlay (line 1887)
- Selection APIs: `selectAll`, `clearSelection`, `getSelectedIds`, `getSelectedItems`, `selectId`
  (lines 1977–2100)
- Keyboard: Ctrl+A, Ctrl+C, Ctrl+X, Delete, Ctrl+V (lines 2100–2179)

### Group F — Table

- Context menu: link clickability (line 1433), `onContextMenu` context vars (lines 1484–1572)
- Keyboard copy (line 3019)
- `refreshOn`: updates/no-update/not-provided (lines 4487, 4510, 4536)

### Group G — Form & App Navigation

- `Form.spec.ts`: nested form submit (line 1307), nested form + modal context (line 1351),
  data URL through modal context (line 3439)
- `App-navigation-events.spec.ts`: willNavigate+didNavigate sequence (line 152),
  willNavigate blocks (line 191), nested routes (line 303)
- `Select.spec.ts`: DropdownMenu+Select nested in Modal (lines 1658, 1737),
  changing options does not reset value (lines 2695, 2741)
- `DropdownMenu.spec.ts`: nested with Select in Modal (lines 594, 673)
- `AutoComplete.spec.ts`: nested DropdownMenu+AutoComplete in Modal (lines 1005, 1084)

Verification after fix:
```
npx playwright test xmlui/src/components/List xmlui/src/components/Table \
  xmlui/src/components/Form xmlui/src/components/App --reporter=list
```

---

## Stage 5 — Fix Tree Async Loading (Group H)

Tests:
- `Tree-autoLoadAfter-field.spec.ts` line 412 — `setAutoLoadAfter()` API precedence
- `Tree-dynamic-integration.spec.ts` line 232 — `setDynamic()` override
- `Tree-loaded-field.spec.ts` lines 335, 377, 424, 579 — marks loaded, handles empty/error,
  `getNodeLoadingState`

Verification:
```
npx playwright test xmlui/src/components/Tree --reporter=list
```

---

## Stage 6 — Fix Remaining Unit Tests (Groups I + J)

### Group I — TileGrid refreshOn

- Lines 930, 956, 982 — same pattern as Table refreshOn (Stage 4 fix may solve these too)

### Group J — Toast

- Line 8 — renders via show API
- Line 83 — updates existing toast on multiple calls
- Line 107 — `$param` context variable (may already be fixed in Stage 2)
- Line 131 — accessibility role='status'

### Other (Option, Queue)

- `Option.spec.ts` line 286 — works with dynamic data through Items
- `Queue.spec.ts` lines 496, 646 — progressFeedback template, large queue operations

---

## Stage 7 — E2E + Extensions (Groups K + L + M)

Run only after all unit groups pass; E2E failures are almost certainly downstream of A–J.

### Group K — how-to-examples (@website)

Files (all in `xmlui/tests-e2e/how-to-examples/`):
- `add-row-actions-with-a-context-menu` (3 cases)
- `buffer-a-reactive-edit` (3 cases)
- `build-a-fullscreen-modal-dialog` (2 cases)
- `build-a-master-detail-layout` (2 cases)
- `cancel-a-deferred-api-operation` (2 cases)
- `chain-a-refetch` (4 cases)
- `control-cache-invalidation` (3 cases)
- `delay-a-datasource-until-another-datasource-is-ready` (2 cases)
- `enable-multi-row-selection-in-a-table` (4 cases)
- `filter-and-transform-data-from-an-api` (3 cases)
- `handle-background-operations` (2 cases)
- `markup` (1 case)
- `open-a-context-menu-on-right-click` (6 cases)
- `pass-data-to-a-modal-dialog` (2 cases)
- `prevent-undefined-requests-in-chained-datasources` (2 cases)
- `render-a-custom-cell-with-components` (1 case)
- `set-the-initial-value-of-a-select-from-fetched-data` (2 cases)
- `update-ui-optimistically` (4 cases)
- `use-mock-data-during-development` (2 cases)
- `use-the-same-modaldialog-to-add-or-edit` (3 cases)

### Group L — Extensions

- `TableSelect.spec.ts` line 562 — bindTo sync (may be fixed in Stage 2)
- `Gauge.spec.ts` line 44 — `didChange` event
- `TiptapEditor.spec.ts` line 58 — `getMarkdown` API

### Group M — Other E2E

- `api-call-as-extracted-component.spec.ts` line 3
- `compound-component.spec.ts` lines 585, 666 — `$this` in compound/Queue handlers
- `context-vars-regression.spec.ts` line 3 — vars resolved multiple times
- `init-cleanup-events.spec.ts` lines 224, 314 — cleanup updates AppState, accesses init state

Verification:
```
npx playwright test xmlui/tests-e2e --reporter=list
npx playwright test packages/ --reporter=list
```

---

## Quick-reference Checklist

```
Stage 1  [ ] Diagnose — capture error messages from Groups A & B
Stage 2  [ ] Fix context-variable propagation (A) + bindTo sync (B)
Stage 3  [ ] Fix APICall core (C) + Deferred Mode (D)
Stage 4  [ ] Fix List selection (E) + Table (F) + Form/Nav (G)
Stage 5  [ ] Fix Tree async loading (H)
Stage 6  [ ] Fix TileGrid, Toast, Option, Queue (I+J)
Stage 7  [ ] E2E + Extensions sweep (K+L+M)
```
