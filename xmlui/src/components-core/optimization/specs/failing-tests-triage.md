# Failing Tests Triage — 2026-05-14

Branch: `yurii/computedUses`  
Total failures: **191**

Likely root cause: changes to `computeUsesInternal` / `computedUses` logic that altered how
free/context variables are tracked, scoped, propagated, or memoized.

---

## Updated Failure Summary

| Group | Area | Notes |
|---|---|---|
| A | Context-variable propagation | `$param`, `$params`, `$context`, `$item`, `$row`, `$data`, `$this` |
| B | bindTo / form sync | `$data` synchronization broken across many inputs |
| C | APICall core | notifications, execute params, mockExecute context |
| D | APICall deferred mode | polling, cancellation, status updates |
| E | List selection system | selection APIs, keyboard shortcuts, row events |
| F | Table / ContextMenu | context variables, refreshOn, copy action |
| G | Modal / Form / Navigation | nested context propagation and routing events |
| H | Tree async loading | loaded-state and dynamic-node regressions |
| I | refreshOn regressions | Table + TileGrid closure refresh behavior |
| J | Toast / Queue / Option | rendering, accessibility, queue templates |
| K | E2E website examples | mostly downstream failures caused by A–J |
| L | Extensions | TableSelect, Gauge, TiptapEditor |
| M | Regression / compound components | `$this`, cleanup/init, context reuse |

---

# Stage 1 — Diagnose Root Cause

Goal:
- confirm whether failures come from one shared regression
- identify whether `computedUses` stopped tracking reactive/context variables correctly

Run representative failures:

```bash
npx playwright test xmlui/src/components/ModalDialog/ModalDialog.spec.ts:23 --reporter=list
npx playwright test xmlui/src/components/TextBox/TextBox.spec.ts:402 --reporter=list
```

Then compare:
- assertion failures
- stack traces
- undefined context-variable accesses
- stale closure behavior
- missing reactive dependency tracking

Focus review areas:
- `computeUsesInternal`
- `computedUses`
- variable scoping
- dependency graph generation
- refresh dependency invalidation
- closure refresh logic

---

# Stage 2 — Context Variable Propagation + bindTo Sync

This is the highest-priority fix stage because most downstream failures depend on it.

## Group A — Context Variables

### APICall
- notification message properties
- execute parameter access
- `$param`
- `$params`
- mockExecute variable exposure
- `$queryParams`
- `$requestBody`
- `$requestHeaders`

### ModalDialog
- imperative open with params
- `$param` in title
- `$param` in child variables
- reopening dialog with updated param

### ContextMenu / List / Table
- `$context`
- `$item`
- `$row`
- `$rowIndex`
- `$itemIndex`

### Queue / Toast / DataSource
- queue template context vars
- toast `$param`
- `$url`
- `$method`
- `$queryParams`

### Checkbox scope isolation
- `$checked`
- `$setChecked`

Verification:

```bash
npx playwright test --grep "\\$param|\\$context|context variable" --reporter=list
```

---

## Group B — bindTo / $data Synchronization

Failing components:

- AutoComplete
- Checkbox
- ColorPicker
- DateInput
- DatePicker
- FileInput
- NumberBox
- RadioGroup
- Select
- Slider
- Switch
- TextArea
- TextBox
- PasswordInput
- TimeInput
- TableSelect (extension)

Symptoms:
- component value updates but `$data` does not
- `$data` updates but UI does not
- stale bindings after rerender
- dependency graph not refreshing after state mutation

Verification:

```bash
npx playwright test --grep "bindTo syncs" --reporter=list
```

---

# Stage 3 — APICall System

## Group C — APICall Core

### Notifications
- success notifications
- 400 / 500 notifications
- unknown errors
- error details
- `onError` consistency

### execute()
- accepts parameters
- supports multiple parameters

### Edge cases
- null / undefined params
- very large payloads
- Unicode characters

### mockExecute
- exposes request context vars
- supports execute params
- mock data list example

---

## Group D — Deferred Mode

### Polling
- status requests
- interpolation of result variables
- polling loop
- timeout handling

### Status Updates
- `onStatusUpdate`
- stop polling from handler
- progress extraction
- notification updates

### Cancellation
- `cancel()`
- local-only cancel mode
- polling cleanup

### Integration
- encryption workflow
- concurrent deferred operations
- resume polling
- component unmount cleanup

Verification:

```bash
npx playwright test xmlui/src/components/APICall/APICall.spec.ts --reporter=list
```

---

# Stage 4 — Selection, Table, Modal, Navigation

## Group E — List Selection

### Events
- `selectionDidChange`
- `rowDoubleClick`

### Selection rules
- `rowUnselectablePredicate`
- hidden selection checkboxes
- overlay checkbox mode

### APIs
- `selectAll`
- `clearSelection`
- `getSelectedIds`
- `getSelectedItems`
- `selectId`

### Keyboard
- Ctrl+A
- Ctrl+C
- Ctrl+X
- Delete
- Ctrl+V

---

## Group F — Table

### Context menu
- right-click behavior
- row context vars
- clickable links

### Keyboard
- copy action

### refreshOn
- closure updates
- stale handlers
- refresh consistency

---

## Group G — Modal / Form / Navigation

### Form
- nested submit handling
- modal context access
- data URL propagation

### Navigation
- willNavigate
- didNavigate
- nested routes

### Nested Dropdown + Modal interactions
- DropdownMenu + Select
- AutoComplete + DropdownMenu
- modal focus interaction

Verification:

```bash
npx playwright test \
  xmlui/src/components/List \
  xmlui/src/components/Table \
  xmlui/src/components/Form \
  xmlui/src/components/App \
  --reporter=list
```

---

# Stage 5 — Tree Async Loading

Failing areas:
- `setAutoLoadAfter()`
- `setDynamic()`
- loaded-state tracking
- empty children handling
- load error handling
- `getNodeLoadingState`

Verification:

```bash
npx playwright test xmlui/src/components/Tree --reporter=list
```

---

# Stage 6 — Remaining Unit-Level Regressions

## Group I — refreshOn regressions

### TileGrid
- closure refresh update
- unchanged refresh behavior
- historic refresh behavior

Likely same root cause as Table `refreshOn`.

---

## Group J — Toast / Queue / Option

### Toast
- show API
- update existing toast
- `$param`
- accessibility role=status

### Queue
- progress feedback template
- large queue operations
- context variables

### Option
- dynamic Items integration

---

# Stage 7 — E2E + Extensions

Do not investigate until unit-level groups pass.

## Group K — Website E2E Examples

Main affected flows:

- context menus
- modal dialogs
- deferred API operations
- optimistic UI
- refetch chaining
- datasource chaining
- table row selection
- background queues
- fetched Select defaults
- mock-data workflows

Most of these are expected to recover automatically after fixing:
- context propagation
- bindTo sync
- APICall deferred mode
- selection APIs

---

## Group L — Extensions

### xmlui-crm-blocks
- TableSelect bindTo sync

### xmlui-gauge
- Gauge didChange

### xmlui-tiptap-editor
- getMarkdown API

---

## Group M — Regression / Infrastructure Tests

### E2E regressions
- extracted APICall component
- compound component `$this`
- Queue handler `$this`
- context variable double resolution
- cleanup/init AppState access

---

# Recommended Fix Order

```text
1. Diagnose shared root cause
2. Fix computedUses context propagation
3. Fix bindTo / reactive synchronization
4. Fix APICall core
5. Fix deferred polling system
6. Fix List/Table selection systems
7. Fix Modal/Form/navigation interactions
8. Fix Tree async loading
9. Run unit suite again
10. Run E2E suite
11. Fix remaining extension regressions
```

---

# Fast Verification Commands

## Context + bindTo

```bash
npx playwright test --grep "bindTo syncs|\\$param|\\$context" --reporter=list
```

## APICall

```bash
npx playwright test xmlui/src/components/APICall/APICall.spec.ts --reporter=list
```

## Selection systems

```bash
npx playwright test \
  xmlui/src/components/List \
  xmlui/src/components/Table \
  --reporter=list
```

## Tree

```bash
npx playwright test xmlui/src/components/Tree --reporter=list
```

## Full E2E

```bash
npx playwright test xmlui/tests-e2e --reporter=list
```
