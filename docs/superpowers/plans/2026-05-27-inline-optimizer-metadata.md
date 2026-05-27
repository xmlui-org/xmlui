# Inline Optimizer Metadata into `createMetadata` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the `OPTIMIZER_METADATA` central registry by inlining `childInjectedVars`, `isImplicitContainerByDefault`, `unstableChildInjectedVars`, and `events[*].injectedVars` directly into each component's `createMetadata` call, then replace the Vite plugin path with a static AST extractor.

**Architecture:** Phase 1 inlines values into 28 component files and removes `mergeOptimizerInjectedVars`; Phase 2 rewrites U-audit.2 to iterate `collectedComponentMetadata` instead of the deleted registry; Phase 3 replaces `optimizer-metadata.ts` with a static source-file extractor for the Vite plugin. Phases are independently mergeable PRs.

**Tech Stack:** TypeScript, Vitest (unit tests), Node.js `fs`/`glob` for Phase 3 extractor.

---

## Reference: Full OPTIMIZER_METADATA Values

Use these exact values when inlining in Tasks 1–6:

| Component | isImplicitContainerByDefault | childInjectedVars | events / injectedVars |
|---|---|---|---|
| App | — | — | unstableChildInjectedVars: `["$pathname","$routeParams","$queryParams","$linkInfo"]` |
| DataLoader | — | — | `fetch.injectedVars: ["$url","$method","$queryParams","$requestBody","$requestHeaders","$pageParams"]` |
| DataSource | — | — | `fetch.injectedVars: ["$url","$method","$queryParams","$requestBody","$requestHeaders","$pageParams"]` |
| APICall | — | — | `mockExecute.injectedVars: ["$pathParams","$queryParams","$requestBody","$cookies","$requestHeaders","$param","$params"]` |
| List | true | `["$item","$itemIndex","$isFirst","$isLast","$isSelected","$group"]` | — |
| Items | — | `["$item","$itemIndex","$isFirst","$isLast"]` | — |
| Table | true | `["$item","$itemIndex","$cell","$colIndex","$row","$rowIndex"]` | `contextMenu: ["$item","$row","$rowIndex","$itemIndex"]` |
| TileGrid | true | `["$item","$itemIndex","$isFirst","$isLast","$selected"]` | `contextMenu: ["$item","$itemIndex"]` |
| Tree | true | `["$item"]` | `contextMenu: ["$item"]` |
| Select | true | `["$item","$itemContext","$group","$selectedValue","$inTrigger"]` | — |
| AutoComplete | true | `["$item","$selectedValue","$inTrigger"]` | — |
| Markdown | true | `["$anchorId","$anchorHref"]` | — |
| DataGrid | true | — | — |
| ModalDialog | true | `["$param","$params"]` | — |
| ContextMenu | — | `["$context"]` | — |
| Queue | — | `["$completedItems","$queuedItems"]` | `willProcess/process/didProcess/processError/complete: ["$completedItems","$queuedItems"]` |
| Column | — | `["$item","$cell","$itemIndex","$colIndex","$row","$rowIndex"]` | — |
| Form | true | `["$data"]` | `willSubmit/submit/submitFailed/cancel/reset/success: ["$data"]` |
| FormItem | — | `["$value","$setValue","$validationResult"]` | — |
| FormSegment | — | `["$segmentData","$segmentValidationIssues","$hasSegmentValidationIssue"]` | — |
| Tabs | true | `["$header"]` | — |
| TabItem | — | `["$header"]` | — |
| Stepper | true | — | — |
| Drawer | true | — | — |
| RadioGroup | — | `["$checked","$setChecked"]` | — |
| Checkbox | — | `["$checked","$setChecked"]` | — |
| Fallback | — | `["$error"]` | — |

---

## PHASE 1 — Runtime Path

### Task 1: Inline metadata in App.tsx

**Files:**
- Modify: `xmlui/src/components/App/App.tsx`

- [ ] **Step 1: Find the `createMetadata` call in App.tsx**

  Open `xmlui/src/components/App/App.tsx` and locate `export const AppMd = createMetadata({`. Add `unstableChildInjectedVars` at the top level of the config object (alongside `description`, `props`, etc.):

  ```typescript
  export const AppMd = createMetadata({
    // ...existing props...
    unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
    // ...rest of existing content...
  });
  ```

- [ ] **Step 2: Run U-audit.1 to confirm no regression**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'App:|PASS|FAIL|Error'
  ```

  Expected: `App: runtime metadata uses OPTIMIZER_METADATA.App.unstableChildInjectedVars` → PASS

- [ ] **Step 3: Commit**

  ```bash
  git add xmlui/src/components/App/App.tsx
  git commit -m "feat: inline unstableChildInjectedVars into App createMetadata"
  ```

---

### Task 2: Inline metadata in DataLoader.tsx

**Files:**
- Modify: `xmlui/src/components-core/loader/DataLoader.tsx`

Currently line 65:
```typescript
injectedVars: OPTIMIZER_METADATA.DataLoader.events.fetch.injectedVars,
```

- [ ] **Step 1: Replace the OPTIMIZER_METADATA reference with the inline array**

  In `DataLoader.tsx`, find the `fetch` event in `createMetadata` and replace:

  ```typescript
  // BEFORE (line ~65):
  fetch: {
    description: "When defined, this event handler replaces the default fetch logic",
    injectedVars: OPTIMIZER_METADATA.DataLoader.events.fetch.injectedVars,
  },

  // AFTER:
  fetch: {
    description: "When defined, this event handler replaces the default fetch logic",
    injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
  },
  ```

- [ ] **Step 2: Remove the OPTIMIZER_METADATA import from DataLoader.tsx**

  Find and delete this line (around line 27):
  ```typescript
  import { OPTIMIZER_METADATA } from "../optimization/optimizer-metadata";
  ```

- [ ] **Step 3: Run U-audit.1 for DataLoader**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'DataLoader|PASS|FAIL|Error'
  ```

  Expected: `DataLoader.events.fetch: runtime metadata uses OPTIMIZER_METADATA entry` → PASS

- [ ] **Step 4: Commit**

  ```bash
  git add xmlui/src/components-core/loader/DataLoader.tsx
  git commit -m "feat: inline DataLoader fetch.injectedVars into createMetadata"
  ```

---

### Task 3: Inline metadata in DataSource.tsx

**Files:**
- Modify: `xmlui/src/components/DataSource/DataSource.tsx`

`DataSource.tsx` currently calls `mergeOptimizerInjectedVars(COMP, DataSourceMd)` at module level (line ~216) to inject `fetch.injectedVars`. We need to add it inline and remove the call.

- [ ] **Step 1: Read the DataSource.tsx createMetadata events section**

  Open `xmlui/src/components/DataSource/DataSource.tsx` and locate the `fetch` event inside `createMetadata`. It currently has a description but no `injectedVars`. Add it:

  ```typescript
  // In createMetadata events:
  fetch: {
    description: "...", // keep existing description exactly as-is
    injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
  },
  ```

- [ ] **Step 2: Remove the module-level mergeOptimizerInjectedVars call**

  Find the line at the bottom of the file:
  ```typescript
  mergeOptimizerInjectedVars(COMP, DataSourceMd);
  ```
  Delete it entirely.

- [ ] **Step 3: Remove the mergeOptimizerInjectedVars import from DataSource.tsx**

  Find and delete (line ~3):
  ```typescript
  import { mergeOptimizerInjectedVars } from "../../components-core/optimization/optimizer-metadata";
  ```

- [ ] **Step 4: Run U-audit for DataSource**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'DataSource|PASS|FAIL|Error'
  ```

  Expected: `DataSource.events.fetch: runtime metadata uses OPTIMIZER_METADATA entry` → PASS

- [ ] **Step 5: Commit**

  ```bash
  git add xmlui/src/components/DataSource/DataSource.tsx
  git commit -m "feat: inline DataSource fetch.injectedVars; remove mergeOptimizerInjectedVars call"
  ```

---

### Task 4: Inline metadata in APICall.tsx

**Files:**
- Modify: `xmlui/src/components/APICall/APICall.tsx`

The `mockExecute` event in `APICallMd` currently has no `injectedVars`.

- [ ] **Step 1: Add injectedVars to the mockExecute event**

  In `APICall.tsx`, find `mockExecute:` inside the `events:` block of `createMetadata` and add:

  ```typescript
  mockExecute: {
    // ...keep all existing description/signature/args fields...
    injectedVars: ["$pathParams", "$queryParams", "$requestBody", "$cookies", "$requestHeaders", "$param", "$params"],
  },
  ```

- [ ] **Step 2: Run U-audit for APICall**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'APICall|PASS|FAIL|Error'
  ```

  Expected: `APICall.events.mockExecute: runtime metadata uses OPTIMIZER_METADATA entry` → PASS

- [ ] **Step 3: Commit**

  ```bash
  git add xmlui/src/components/APICall/APICall.tsx
  git commit -m "feat: inline APICall mockExecute.injectedVars into createMetadata"
  ```

---

### Task 5: Inline metadata in simple-container components

Components that only add `isImplicitContainerByDefault: true` with no `childInjectedVars`:
- `DataGrid/DataGrid.tsx`
- `Stepper/Stepper.tsx`
- `Drawer/Drawer.tsx`

**Files:**
- Modify: `xmlui/src/components/DataGrid/DataGrid.tsx`
- Modify: `xmlui/src/components/Stepper/Stepper.tsx`
- Modify: `xmlui/src/components/Drawer/Drawer.tsx`

- [ ] **Step 1: Add isImplicitContainerByDefault to DataGrid.tsx**

  In `DataGrid.tsx`, find `export const DataGridMd = createMetadata({` and add:
  ```typescript
  export const DataGridMd = createMetadata({
    isImplicitContainerByDefault: true,
    // ...existing props, events, etc. unchanged...
  });
  ```

- [ ] **Step 2: Add isImplicitContainerByDefault to Stepper.tsx**

  In `Stepper.tsx`, find `export const StepperMd = createMetadata({` and add:
  ```typescript
  export const StepperMd = createMetadata({
    isImplicitContainerByDefault: true,
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 3: Add isImplicitContainerByDefault to Drawer.tsx**

  In `Drawer.tsx`, find `export const DrawerMd = createMetadata({` and add:
  ```typescript
  export const DrawerMd = createMetadata({
    isImplicitContainerByDefault: true,
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 4: Run U-audit.1 for these components**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'DataGrid|Stepper|Drawer|PASS|FAIL|Error'
  ```

  Expected: all three PASS

- [ ] **Step 5: Commit**

  ```bash
  git add xmlui/src/components/DataGrid/DataGrid.tsx xmlui/src/components/Stepper/Stepper.tsx xmlui/src/components/Drawer/Drawer.tsx
  git commit -m "feat: inline isImplicitContainerByDefault for DataGrid, Stepper, Drawer"
  ```

---

### Task 6: Inline metadata in childInjectedVars-only components

Components that only add `childInjectedVars` (no events, no `isImplicitContainerByDefault`):
- `Items/Items.tsx` → `["$item","$itemIndex","$isFirst","$isLast"]`
- `ContextMenu/ContextMenu.tsx` → `["$context"]`
- `Column/Column.tsx` → `["$item","$cell","$itemIndex","$colIndex","$row","$rowIndex"]`
- `FormItem/FormItem.tsx` → `["$value","$setValue","$validationResult"]`
- `FormSegment/FormSegment.tsx` → `["$segmentData","$segmentValidationIssues","$hasSegmentValidationIssue"]`
- `TabItem/TabItem.tsx` → `["$header"]`
- `RadioGroup/RadioGroup.tsx` → `["$checked","$setChecked"]`
- `Checkbox/Checkbox.tsx` → `["$checked","$setChecked"]`
- `Fallback/Fallback.tsx` → `["$error"]`

**Files:** Modify all 9 component files listed above.

- [ ] **Step 1: Update Items.tsx**

  ```typescript
  export const ItemsMd = createMetadata({
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 2: Update ContextMenu.tsx**

  ```typescript
  export const ContextMenuMd = createMetadata({
    childInjectedVars: ["$context"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 3: Update Column.tsx**

  ```typescript
  export const ColumnMd = createMetadata({
    childInjectedVars: ["$item", "$cell", "$itemIndex", "$colIndex", "$row", "$rowIndex"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 4: Update FormItem.tsx**

  ```typescript
  export const FormItemMd = createMetadata({
    childInjectedVars: ["$value", "$setValue", "$validationResult"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 5: Update FormSegment.tsx**

  ```typescript
  export const FormSegmentMd = createMetadata({
    childInjectedVars: ["$segmentData", "$segmentValidationIssues", "$hasSegmentValidationIssue"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 6: Update TabItem.tsx**

  ```typescript
  export const TabItemMd = createMetadata({
    childInjectedVars: ["$header"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 7: Update RadioGroup.tsx**

  ```typescript
  export const RadioGroupMd = createMetadata({
    childInjectedVars: ["$checked", "$setChecked"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 8: Update Checkbox.tsx**

  ```typescript
  export const CheckboxMd = createMetadata({
    childInjectedVars: ["$checked", "$setChecked"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 9: Update Fallback.tsx**

  ```typescript
  export const FallbackMd = createMetadata({
    childInjectedVars: ["$error"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 10: Run U-audit.1 for all updated components**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'Items:|ContextMenu|Column:|FormItem|FormSegment|TabItem|RadioGroup|Checkbox|Fallback|PASS|FAIL|Error'
  ```

  Expected: all PASS

- [ ] **Step 11: Commit**

  ```bash
  git add \
    xmlui/src/components/Items/Items.tsx \
    xmlui/src/components/ContextMenu/ContextMenu.tsx \
    xmlui/src/components/Column/Column.tsx \
    xmlui/src/components/FormItem/FormItem.tsx \
    xmlui/src/components/FormSegment/FormSegment.tsx \
    xmlui/src/components/TabItem/TabItem.tsx \
    xmlui/src/components/RadioGroup/RadioGroup.tsx \
    xmlui/src/components/Checkbox/Checkbox.tsx \
    xmlui/src/components/Fallback/Fallback.tsx
  git commit -m "feat: inline childInjectedVars for Items, ContextMenu, Column, FormItem, FormSegment, TabItem, RadioGroup, Checkbox, Fallback"
  ```

---

### Task 7: Inline metadata in isImplicitContainerByDefault + childInjectedVars components

Components:
- `List/List.tsx` → `isImplicit: true`, `childInjectedVars: ["$item","$itemIndex","$isFirst","$isLast","$isSelected","$group"]`
- `Select/Select.tsx` → `isImplicit: true`, `childInjectedVars: ["$item","$itemContext","$group","$selectedValue","$inTrigger"]`
- `AutoComplete/AutoComplete.tsx` → `isImplicit: true`, `childInjectedVars: ["$item","$selectedValue","$inTrigger"]`
- `Markdown/Markdown.tsx` → `isImplicit: true`, `childInjectedVars: ["$anchorId","$anchorHref"]`
- `ModalDialog/ModalDialog.tsx` → `isImplicit: true`, `childInjectedVars: ["$param","$params"]`
- `Tabs/Tabs.tsx` → `isImplicit: true`, `childInjectedVars: ["$header"]`

**Files:** Modify all 6 component files listed above.

- [ ] **Step 1: Update List.tsx**

  ```typescript
  export const ListMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$isSelected", "$group"],
    // ...existing content unchanged...
  });
  ```

  > **Note:** Also verify that `$isSelected` is used/mentioned in the source file. The spec warns it may have been removed previously. Search List.tsx for `$isSelected` — if absent, check if it belongs in `childInjectedVars` by looking at the renderer's `contextVars`.

- [ ] **Step 2: Update Select.tsx**

  ```typescript
  export const SelectMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemContext", "$group", "$selectedValue", "$inTrigger"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 3: Update AutoComplete.tsx**

  ```typescript
  export const AutoCompleteMd = createMetadata({
    isImplicitContainerByDefault: true,
    // Keep this comment: Keep aligned with the `optionTemplate` renderer's `contextVars`
    childInjectedVars: ["$item", "$selectedValue", "$inTrigger"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 4: Update Markdown.tsx**

  ```typescript
  export const MarkdownMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$anchorId", "$anchorHref"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 5: Update ModalDialog.tsx**

  ```typescript
  export const ModalDialogMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$param", "$params"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 6: Update Tabs.tsx**

  ```typescript
  export const TabsMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$header"],
    // ...existing content unchanged...
  });
  ```

- [ ] **Step 7: Run U-audit.1 for all updated components**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'List:|Select:|AutoComplete|Markdown:|ModalDialog|Tabs:|PASS|FAIL|Error'
  ```

  Expected: all PASS

- [ ] **Step 8: Commit**

  ```bash
  git add \
    xmlui/src/components/List/List.tsx \
    xmlui/src/components/Select/Select.tsx \
    xmlui/src/components/AutoComplete/AutoComplete.tsx \
    xmlui/src/components/Markdown/Markdown.tsx \
    xmlui/src/components/ModalDialog/ModalDialog.tsx \
    xmlui/src/components/Tabs/Tabs.tsx
  git commit -m "feat: inline isImplicitContainerByDefault + childInjectedVars for List, Select, AutoComplete, Markdown, ModalDialog, Tabs"
  ```

---

### Task 8: Inline metadata in components with events + childInjectedVars

Components:
- `Table/Table.tsx` — `isImplicit: true`, `childInjectedVars`, `contextMenu.injectedVars`
- `TileGrid/TileGrid.tsx` — `isImplicit: true`, `childInjectedVars`, `contextMenu.injectedVars`
- `Tree/Tree.tsx` — `isImplicit: true`, `childInjectedVars: ["$item"]`, `contextMenu.injectedVars: ["$item"]`
- `Queue/Queue.tsx` — `childInjectedVars`, 5 events `injectedVars`
- `Form/Form.tsx` — `isImplicit: true`, `childInjectedVars: ["$data"]`, 6 events `injectedVars`

**Files:** Modify all 5 component files listed above.

- [ ] **Step 1: Update Table.tsx**

  Add at top level of `createMetadata`:
  ```typescript
  export const TableMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$cell", "$colIndex", "$row", "$rowIndex"],
    // ...existing content...
  });
  ```

  Find the `contextMenu` event inside `events:` and add `injectedVars`:
  ```typescript
  events: {
    // ...other events...
    contextMenu: {
      // ...existing description/signature...
      injectedVars: ["$item", "$row", "$rowIndex", "$itemIndex"],
    },
  },
  ```

  > **Important:** Verify `$isSelected` is still in `childInjectedVars` for List (not Table). Table uses `$isSelected` for row selection — double-check the renderer's `contextVars` to confirm `$isSelected` is NOT in Table's `childInjectedVars` (it's in List only).

- [ ] **Step 2: Update TileGrid.tsx**

  Add at top level:
  ```typescript
  export const TileGridMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$selected"],
    // ...existing content...
  });
  ```

  Add to `contextMenu` event:
  ```typescript
  contextMenu: {
    // ...existing content...
    injectedVars: ["$item", "$itemIndex"],
  },
  ```

- [ ] **Step 3: Update Tree.tsx**

  Add at top level:
  ```typescript
  export const TreeMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item"],
    // ...existing content...
  });
  ```

  Add to `contextMenu` event:
  ```typescript
  contextMenu: {
    // ...existing content...
    injectedVars: ["$item"],
  },
  ```

- [ ] **Step 4: Update Queue.tsx**

  Add at top level:
  ```typescript
  export const QueueMd = createMetadata({
    childInjectedVars: ["$completedItems", "$queuedItems"],
    // ...existing content...
  });
  ```

  Add `injectedVars` to each of these 5 events inside `events:`:
  ```typescript
  willProcess: {
    // ...existing content...
    injectedVars: ["$completedItems", "$queuedItems"],
  },
  process: {
    // ...existing content...
    injectedVars: ["$completedItems", "$queuedItems"],
  },
  didProcess: {
    // ...existing content...
    injectedVars: ["$completedItems", "$queuedItems"],
  },
  processError: {
    // ...existing content...
    injectedVars: ["$completedItems", "$queuedItems"],
  },
  complete: {
    // ...existing content...
    injectedVars: ["$completedItems", "$queuedItems"],
  },
  ```

- [ ] **Step 5: Update Form.tsx**

  Add at top level of `createMetadata`:
  ```typescript
  export const FormMd = createMetadata({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$data"],
    // ...existing content...
  });
  ```

  Add `injectedVars: ["$data"]` to each of these 6 events inside `events:`:
  - `willSubmit` → `injectedVars: ["$data"]`
  - `submit` → `injectedVars: ["$data"]`
  - `submitFailed` → `injectedVars: ["$data"]`
  - `cancel` → `injectedVars: ["$data"]`
  - `reset` → `injectedVars: ["$data"]`
  - `success` → `injectedVars: ["$data"]`

  Example:
  ```typescript
  willSubmit: {
    description: "...", // keep existing
    signature: "...",   // keep existing
    args: { ... },      // keep existing
    injectedVars: ["$data"],
  },
  submit: {
    // ...existing...
    injectedVars: ["$data"],
  },
  // ...same pattern for submitFailed, cancel, reset, success...
  ```

- [ ] **Step 6: Run U-audit.1 for these components**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'Table:|TileGrid|Tree:|Queue:|Form:|PASS|FAIL|Error'
  ```

  Expected: all PASS

- [ ] **Step 7: Run full test suite to verify no regressions**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -20
  ```

  Expected: all tests PASS

- [ ] **Step 8: Commit**

  ```bash
  git add \
    xmlui/src/components/Table/Table.tsx \
    xmlui/src/components/TileGrid/TileGrid.tsx \
    xmlui/src/components/Tree/Tree.tsx \
    xmlui/src/components/Queue/Queue.tsx \
    xmlui/src/components/Form/Form.tsx
  git commit -m "feat: inline childInjectedVars + event injectedVars for Table, TileGrid, Tree, Queue, Form"
  ```

---

### Task 9: Remove mergeOptimizerInjectedVars call sites

All 28 component values are now inline. Remove the merge calls.

**Files:**
- Modify: `xmlui/src/components-core/wrapComponent.tsx` (lines 526, 1070)
- Modify: `xmlui/src/components-core/renderers.ts` (line 25)

- [ ] **Step 1: Remove both mergeOptimizerInjectedVars calls from wrapComponent.tsx**

  Find line ~526 — it will be inside `wrapComponent` function body:
  ```typescript
  // DELETE this line:
  mergeOptimizerInjectedVars(type, metadata);
  ```

  Find line ~1070 — it will be inside `wrapCompound` or `createComponentRenderer` function body:
  ```typescript
  // DELETE this line:
  mergeOptimizerInjectedVars(type, metadata);
  ```

  Remove the import at line 7:
  ```typescript
  // DELETE this line:
  import { mergeOptimizerInjectedVars } from "./optimization/optimizer-metadata";
  ```

- [ ] **Step 2: Remove mergeOptimizerInjectedVars from renderers.ts**

  Find line ~25 inside `createComponentRenderer`:
  ```typescript
  // DELETE this line:
  mergeOptimizerInjectedVars(type, metadata);
  ```

  Remove the import at line 11:
  ```typescript
  // DELETE this line:
  import { mergeOptimizerInjectedVars } from "./optimization/optimizer-metadata";
  ```

- [ ] **Step 3: Run U-audit.1 to confirm inline values are sufficient**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'PASS|FAIL|Error' | head -30
  ```

  Expected: all U-audit.1 tests still PASS (values now come from inline declarations, not merge)

- [ ] **Step 4: Commit**

  ```bash
  git add xmlui/src/components-core/wrapComponent.tsx xmlui/src/components-core/renderers.ts
  git commit -m "refactor: remove mergeOptimizerInjectedVars calls from wrapComponent and renderers"
  ```

---

### Task 10: Update FrameworkGlobals.ts

**Files:**
- Modify: `xmlui/src/components-core/state/FrameworkGlobals.ts`

Currently iterates `OPTIMIZER_METADATA` to build `UNSTABLE_GLOBAL_VARS`. After migration the source of truth is `collectedComponentMetadata`.

- [ ] **Step 1: Replace OPTIMIZER_METADATA import with collectedComponentMetadata**

  Current file content:
  ```typescript
  import { OPTIMIZER_METADATA } from "../optimization/optimizer-metadata";

  export { XMLUI_GLOBAL_NAMES } from "./appContextFactory";

  export const UNSTABLE_GLOBAL_VARS = new Set<string>();

  for (const meta of Object.values(OPTIMIZER_METADATA)) {
    const unstableVars = (meta as any).unstableChildInjectedVars;
    if (unstableVars) {
      for (const v of unstableVars) {
        UNSTABLE_GLOBAL_VARS.add(v);
      }
    }
  }
  ```

  Replace with:
  ```typescript
  import { collectedComponentMetadata } from "../../components/collectedComponentMetadata";
  import { DataLoaderMd } from "../loader/DataLoader";

  export { XMLUI_GLOBAL_NAMES } from "./appContextFactory";

  const ALL_METADATA = { ...collectedComponentMetadata, DataLoader: DataLoaderMd };

  export const UNSTABLE_GLOBAL_VARS = new Set<string>();

  for (const meta of Object.values(ALL_METADATA)) {
    const unstableVars = (meta as any)?.unstableChildInjectedVars;
    if (unstableVars) {
      for (const v of unstableVars) {
        UNSTABLE_GLOBAL_VARS.add(v);
      }
    }
  }
  ```

  > **Why DataLoaderMd is added separately:** DataLoader is internal and not in `collectedComponentMetadata`. DataLoader has no `unstableChildInjectedVars` currently, but it's added for completeness/future-proofing.

  > **Why AppMd via collectedComponentMetadata:** App is registered in `collectedComponentMetadata` (exported as `AppMd`), so its `unstableChildInjectedVars` will be picked up automatically.

- [ ] **Step 2: Run full test suite**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -20
  ```

  Expected: all PASS

- [ ] **Step 3: Commit**

  ```bash
  git add xmlui/src/components-core/state/FrameworkGlobals.ts
  git commit -m "refactor: replace OPTIMIZER_METADATA iteration with collectedComponentMetadata in FrameworkGlobals"
  ```

---

### Task 11: Clean up optimizer-metadata.ts and remove U-audit.1

**Files:**
- Modify: `xmlui/src/components-core/optimization/optimizer-metadata.ts`
- Modify: `xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`

At this point, `mergeOptimizerInjectedVars` and `withInjectedContext` are unused. `OPTIMIZER_METADATA` and `lookupOptimizerMetadata` still needed for `xmlui-parser.ts` (Phase 3 removes them).

- [ ] **Step 1: Remove mergeOptimizerInjectedVars export from optimizer-metadata.ts**

  Delete the entire `mergeOptimizerInjectedVars` function (from its JSDoc comment through the closing `}`). It spans from `/** Populate a component descriptor's metadata...` through `}` (the last export at the bottom of the file).

- [ ] **Step 2: Remove withInjectedContext export from optimizer-metadata.ts**

  Delete the entire `withInjectedContext` function. It is no longer used anywhere — all call sites are inside `OPTIMIZER_METADATA` which still exists as a temporary shim for `lookupOptimizerMetadata`.

  > **Wait:** `withInjectedContext` is still used by `OPTIMIZER_METADATA` entries. Keep it for now as a private internal function (remove the `export` keyword only):
  ```typescript
  // Change from:
  export function withInjectedContext(...)
  // To:
  function withInjectedContext(...)
  ```

- [ ] **Step 3: Remove U-audit.1 describe block from renderer-metadata-drift.test.ts**

  Find and delete the entire:
  ```typescript
  describe("OPTIMIZER_METADATA reflected in runtime metadata (U-audit.1)", () => {
    // ...all content...
  });
  ```

  > **Note:** Keep the `RUNTIME_METADATA` const that appears just before U-audit.1 (it may be used by other describe blocks — check before deleting).

- [ ] **Step 4: Run full test suite**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -30
  ```

  Expected: all PASS, no more U-audit.1 tests in output

- [ ] **Step 5: Commit**

  ```bash
  git add \
    xmlui/src/components-core/optimization/optimizer-metadata.ts \
    xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts
  git commit -m "refactor: remove mergeOptimizerInjectedVars export and U-audit.1 test (Phase 1 complete)"
  ```

---

## PHASE 2 — U-audit.2 Rewrite

### Task 12: Rewrite U-audit.2 to use collectedComponentMetadata

**Files:**
- Modify: `xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`

Current U-audit.2 iterates `OPTIMIZER_METADATA`. After Phase 2 it iterates `collectedComponentMetadata` (plus `DataLoaderMd`).

- [ ] **Step 1: Update the U-audit.2 describe block**

  Replace the entire `describe("OPTIMIZER_METADATA vars have a string-literal presence in source (U-audit.2)", ...)` block with:

  ```typescript
  const AUDIT2_METADATA: Record<string, any> = {
    ...collectedComponentMetadata,
    DataLoader: DataLoaderMd,
  };

  describe("childInjectedVars / injectedVars vars have a string-literal presence in source (U-audit.2)", () => {
    // Map component names to their source code (reuse existing componentToSourceMap logic)
    const componentToSourceMap = new Map<string, { file: string; source: string }>();

    for (const file of allFilesToAudit) {
      const source = readFileSync(file, "utf-8");
      const componentType = extractRegisteredName(source);
      if (componentType) {
        componentToSourceMap.set(componentType, { file, source });
      }
    }

    // DataLoader is internal (not in allFilesToAudit) — map it manually
    const dataLoaderFile = resolve(__dirname, "../../../src/components-core/loader/DataLoader.tsx");
    componentToSourceMap.set("DataLoader", {
      file: dataLoaderFile,
      source: readFileSync(dataLoaderFile, "utf-8"),
    });

    for (const [componentType, runtimeMd] of Object.entries(AUDIT2_METADATA)) {
      const entry = runtimeMd as {
        childInjectedVars?: readonly string[];
        unstableChildInjectedVars?: readonly string[];
        events?: Record<string, { injectedVars?: readonly string[] }>;
      };

      const hasVarsToCheck =
        (entry.childInjectedVars?.length ?? 0) > 0 ||
        (entry.unstableChildInjectedVars?.length ?? 0) > 0 ||
        Object.values(entry.events ?? {}).some((e) => (e.injectedVars?.length ?? 0) > 0);

      if (!hasVarsToCheck) continue;

      it(`${componentType}: has string literals for all inline injected variables`, () => {
        const sourceInfo = componentToSourceMap.get(componentType);

        let source = sourceInfo?.source;
        let filePath = sourceInfo?.file;

        if (!source) {
          const potentialFile = allFilesToAudit.find((f) =>
            f.endsWith(`/${componentType}/${componentType}.tsx`),
          );
          if (potentialFile) {
            source = readFileSync(potentialFile, "utf-8");
            filePath = potentialFile;
          }
        }

        if (!source) {
          throw new Error(
            `[U-audit.2] Could not find source file for component "${componentType}". ` +
            `Add it to componentToSourceMap or ensure it follows the <Name>/<Name>.tsx naming convention.`,
          );
        }

        // Special cases: some vars live in sibling React files
        if (componentType === "Table" || componentType === "Column") {
          const tableReactFile = filePath!.replace("Column/Column.tsx", "Table/TableReact.tsx");
          try { source += readFileSync(tableReactFile, "utf-8"); } catch (_) {}
          const columnReactFile = filePath!.replace(".tsx", "React.tsx");
          try { source += readFileSync(columnReactFile, "utf-8"); } catch (_) {}
        } else if (componentType === "RadioGroup") {
          const radioReactFile = filePath!.replace(".tsx", "React.tsx");
          try { source += readFileSync(radioReactFile, "utf-8"); } catch (_) {}
        } else if (componentType === "Checkbox") {
          const toggleFile = filePath!.replace("Checkbox/Checkbox.tsx", "Toggle/Toggle.tsx");
          try { source += readFileSync(toggleFile, "utf-8"); } catch (_) {}
        }

        function checkVars(vars: readonly string[], label: string) {
          const missing: string[] = [];
          for (const v of vars) {
            const escapedV = v.replace("$", "\\\\$");
            const regex = new RegExp(`${escapedV}(?![a-zA-Z0-9_])`);
            if (
              !source!.includes(`"${v}"`) &&
              !source!.includes(`'${v}'`) &&
              !source!.includes(`\`${v}\``) &&
              !source!.includes(`${v}:`) &&
              !regex.test(source!)
            ) {
              missing.push(v);
            }
          }
          if (missing.length > 0) {
            throw new Error(
              `[U-audit.2] String literal presence check failed for ${componentType} (${label}) in ${filePath}:\n` +
              `  Missing: [${missing.join(", ")}]\n\n` +
              `Fix: Either use the variable in the component source, or remove it from createMetadata.`,
            );
          }
        }

        if (entry.childInjectedVars?.length) checkVars(entry.childInjectedVars, "childInjectedVars");
        if (entry.unstableChildInjectedVars?.length) checkVars(entry.unstableChildInjectedVars, "unstableChildInjectedVars");

        if (entry.events) {
          for (const [eventName, eventEntry] of Object.entries(entry.events)) {
            if (eventEntry.injectedVars?.length) {
              checkVars(eventEntry.injectedVars, `events.${eventName}.injectedVars`);
            }
          }
        }
      });
    }
  });
  ```

- [ ] **Step 2: Remove the now-unused OPTIMIZER_METADATA import (if no longer needed)**

  Check if `OPTIMIZER_METADATA` is still referenced anywhere in the test file. If the U-audit.1 block and U-audit.2 block are both migrated, remove:
  ```typescript
  import { OPTIMIZER_METADATA } from "../../../src/components-core/optimization/optimizer-metadata";
  ```

  > **Note:** Only remove if `OPTIMIZER_METADATA` is no longer referenced in the file.

- [ ] **Step 3: Remove unused RUNTIME_METADATA const (if U-audit.1 was the only consumer)**

  If `RUNTIME_METADATA` was only used by U-audit.1 (now deleted), delete it:
  ```typescript
  // DELETE if unused:
  const RUNTIME_METADATA: Record<string, any> = {
    ...collectedComponentMetadata,
    DataLoader: DataLoaderMd,
    DataSource: DataSourceMd,
    APICall: APICallMd,
  };
  ```

- [ ] **Step 4: Run U-audit.2 to confirm all components pass**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/renderer-metadata-drift.test.ts --reporter=verbose 2>&1 | grep -E 'U-audit.2|PASS|FAIL|Error'
  ```

  Expected: all U-audit.2 `it(...)` blocks PASS with no false positives

- [ ] **Step 5: Run full test suite**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -20
  ```

  Expected: all PASS

- [ ] **Step 6: Commit**

  ```bash
  git add xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts
  git commit -m "refactor: rewrite U-audit.2 to iterate collectedComponentMetadata instead of OPTIMIZER_METADATA (Phase 2 complete)"
  ```

---

## PHASE 3 — Vite Plugin Static AST Extractor

### Task 13: Create static-extractor.ts

**Files:**
- Create: `xmlui/src/components-core/optimization/static-extractor.ts`

- [ ] **Step 1: Write a failing test first**

  Create `xmlui/tests/components-core/optimization/optimizer-metadata-extractor.test.ts`:

  ```typescript
  import { describe, it, expect } from "vitest";
  import { extractOptimizerMetadataFromSource } from "../../../src/components-core/optimization/static-extractor";

  describe("extractOptimizerMetadataFromSource", () => {
    it("extracts childInjectedVars from a single-line array", () => {
      const source = `
        export const ListMd = createMetadata({
          childInjectedVars: ["$item", "$itemIndex"],
        });
      `;
      expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
        childInjectedVars: ["$item", "$itemIndex"],
      });
    });

    it("extracts childInjectedVars from a multi-line array", () => {
      const source = `
        export const TableMd = createMetadata({
          childInjectedVars: [
            "$item",
            "$itemIndex",
            "$row",
          ],
        });
      `;
      expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
        childInjectedVars: ["$item", "$itemIndex", "$row"],
      });
    });

    it("extracts isImplicitContainerByDefault", () => {
      const source = `
        export const FormMd = createMetadata({
          isImplicitContainerByDefault: true,
        });
      `;
      expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
        isImplicitContainerByDefault: true,
      });
    });

    it("extracts unstableChildInjectedVars", () => {
      const source = `
        export const AppMd = createMetadata({
          unstableChildInjectedVars: ["$pathname", "$routeParams"],
        });
      `;
      expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
        unstableChildInjectedVars: ["$pathname", "$routeParams"],
      });
    });

    it("extracts per-event injectedVars", () => {
      const source = `
        export const FormMd = createMetadata({
          events: {
            submit: { description: "...", injectedVars: ["$data"] },
            cancel: { description: "...", injectedVars: ["$data"] },
          },
        });
      `;
      const result = extractOptimizerMetadataFromSource(source);
      expect(result.events?.submit?.injectedVars).toEqual(["$data"]);
      expect(result.events?.cancel?.injectedVars).toEqual(["$data"]);
    });

    it("returns empty object when no optimizer fields are present", () => {
      const source = `
        export const ButtonMd = createMetadata({
          props: { label: d("The button label") },
        });
      `;
      const result = extractOptimizerMetadataFromSource(source);
      expect(result.childInjectedVars).toBeUndefined();
      expect(result.isImplicitContainerByDefault).toBeUndefined();
    });

    it("handles single-quoted strings in arrays", () => {
      const source = `
        childInjectedVars: ['$item', '$index'],
      `;
      expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
        childInjectedVars: ["$item", "$index"],
      });
    });

    it("handles trailing commas", () => {
      const source = `
        childInjectedVars: ["$item", "$index",],
      `;
      expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
        childInjectedVars: ["$item", "$index"],
      });
    });
  });
  ```

- [ ] **Step 2: Run the test to confirm it fails**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/optimizer-metadata-extractor.test.ts 2>&1 | tail -10
  ```

  Expected: FAIL with "Cannot find module `../../../src/components-core/optimization/static-extractor`"

- [ ] **Step 3: Implement static-extractor.ts**

  Create `xmlui/src/components-core/optimization/static-extractor.ts`:

  ```typescript
  import { readdirSync, readFileSync, statSync } from "node:fs";
  import { join } from "node:path";
  import type { ComponentMetadata } from "../../abstractions/ComponentDefs";

  type OptimizerMeta = Partial<ComponentMetadata> & {
    events?: Record<string, { injectedVars?: readonly string[] }>;
  };

  /**
   * Extract a static string array literal from source text starting at `startIdx`.
   * Finds the matching `]` and parses the contents as string literals.
   * Returns empty array if the content is not a static literal array.
   */
  function extractStringArray(source: string, startIdx: number): string[] | null {
    const open = source.indexOf("[", startIdx);
    if (open === -1) return null;
    let depth = 0;
    let end = -1;
    for (let i = open; i < source.length; i++) {
      if (source[i] === "[") depth++;
      else if (source[i] === "]") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) return null;
    const body = source.slice(open + 1, end);
    // Parse string literals (single or double quoted)
    const matches = [...body.matchAll(/["'](\$[^"']+)["']/g)];
    return matches.map((m) => m[1]);
  }

  /**
   * Extract optimizer-relevant metadata fields from a component source file string.
   * Only extracts STATIC values — computed or spread values are ignored.
   */
  export function extractOptimizerMetadataFromSource(source: string): OptimizerMeta {
    const result: OptimizerMeta = {};

    // isImplicitContainerByDefault: true
    if (/isImplicitContainerByDefault\s*:\s*true/.test(source)) {
      result.isImplicitContainerByDefault = true;
    }

    // childInjectedVars: [ ... ]
    const childMatch = /childInjectedVars\s*:/.exec(source);
    if (childMatch) {
      const arr = extractStringArray(source, childMatch.index);
      if (arr && arr.length > 0) result.childInjectedVars = arr;
    }

    // unstableChildInjectedVars: [ ... ]
    const unstableMatch = /unstableChildInjectedVars\s*:/.exec(source);
    if (unstableMatch) {
      const arr = extractStringArray(source, unstableMatch.index);
      if (arr && arr.length > 0) result.unstableChildInjectedVars = arr;
    }

    // Per-event injectedVars: find each `injectedVars: [...]` inside an events block.
    // Strategy: find all occurrences of `injectedVars:` and back-track to find the event name.
    const eventVarsRe = /injectedVars\s*:/g;
    let m: RegExpExecArray | null;
    while ((m = eventVarsRe.exec(source)) !== null) {
      const arr = extractStringArray(source, m.index);
      if (!arr || arr.length === 0) continue;

      // Back-track from m.index to find the event name (last identifier before `{`)
      const before = source.slice(0, m.index);
      const eventNameMatch = /(\w+)\s*:\s*\{[^{}]*$/.exec(before);
      if (!eventNameMatch) continue;
      const eventName = eventNameMatch[1];
      if (!result.events) result.events = {};
      result.events[eventName] = { injectedVars: arr };
    }

    return result;
  }

  /**
   * Extract the registered component type name from source.
   * Components use `wrapComponent("TypeName", ...)` or `const TYPE = "TypeName"`.
   */
  function extractComponentName(source: string): string | null {
    // Try: wrapComponent("Name", ...) or wrapCompound("Name", ...)
    const wrapMatch = /wrap(?:Component|Compound)\s*\(\s*["']([A-Z][A-Za-z0-9]*)["']/.exec(source);
    if (wrapMatch) return wrapMatch[1];
    // Try: const COMP_TYPE = "Name" (all-caps const assigned to PascalCase)
    const constMatch = /const\s+[A-Z_]+\s*=\s*["']([A-Z][A-Za-z0-9]*)["']/.exec(source);
    if (constMatch) return constMatch[1];
    return null;
  }

  function listTsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const s = statSync(p);
      if (s.isDirectory()) {
        out.push(...listTsxFiles(p));
      } else if (
        entry.endsWith(".tsx") &&
        !entry.endsWith("React.tsx") &&
        !entry.endsWith(".spec.tsx") &&
        !entry.includes(".test.")
      ) {
        out.push(p);
      }
    }
    return out;
  }

  /**
   * Build a Record<componentTypeName, OptimizerMeta> by scanning all *.tsx files in `dir`.
   * Used by the Vite plugin instead of importing optimizer-metadata.ts.
   */
  export function extractOptimizerMetadataFromDir(dir: string): Record<string, OptimizerMeta> {
    const result: Record<string, OptimizerMeta> = {};
    for (const file of listTsxFiles(dir)) {
      const source = readFileSync(file, "utf-8");
      const name = extractComponentName(source);
      if (!name) continue;
      const meta = extractOptimizerMetadataFromSource(source);
      const hasData =
        meta.isImplicitContainerByDefault ||
        meta.childInjectedVars ||
        meta.unstableChildInjectedVars ||
        (meta.events && Object.keys(meta.events).length > 0);
      if (hasData) result[name] = meta;
    }
    return result;
  }
  ```

- [ ] **Step 4: Run the test to confirm it passes**

  ```bash
  cd xmlui && npx vitest run tests/components-core/optimization/optimizer-metadata-extractor.test.ts --reporter=verbose 2>&1 | tail -20
  ```

  Expected: all tests PASS

- [ ] **Step 5: Commit**

  ```bash
  git add \
    xmlui/src/components-core/optimization/static-extractor.ts \
    xmlui/tests/components-core/optimization/optimizer-metadata-extractor.test.ts
  git commit -m "feat: add static AST extractor for optimizer metadata (Phase 3)"
  ```

---

### Task 14: Integrate static extractor into xmlui-parser.ts

**Files:**
- Modify: `xmlui/src/components-core/xmlui-parser.ts`

Currently `xmlui-parser.ts` calls:
```typescript
computeUsesForTree(component as ComponentDef, lookupOptimizerMetadata);
```

The Vite plugin calls `xmlUiMarkupToComponent` which internally uses `lookupOptimizerMetadata`. We need to allow injecting a custom lookup.

- [ ] **Step 1: Add optional metadataLookup parameter to xmlUiMarkupToComponent**

  Find the function signature:
  ```typescript
  export function xmlUiMarkupToComponent(
    source: string,
    fileId: string | number = 0,
    preResolvedImports?: CollectedDeclarations,
  ): ParserResult {
  ```

  Change to:
  ```typescript
  export function xmlUiMarkupToComponent(
    source: string,
    fileId: string | number = 0,
    preResolvedImports?: CollectedDeclarations,
    metadataLookup?: (type: string) => ComponentMetadata | undefined,
  ): ParserResult {
  ```

  Inside the function, update the `computeUsesForTree` call:
  ```typescript
  // BEFORE:
  computeUsesForTree(component as ComponentDef, lookupOptimizerMetadata);

  // AFTER:
  computeUsesForTree(component as ComponentDef, metadataLookup ?? lookupOptimizerMetadata);
  ```

- [ ] **Step 2: Run full test suite to confirm no regressions**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -20
  ```

  Expected: all PASS

- [ ] **Step 3: Find and update the Vite plugin call site**

  In `xmlui/src/nodejs/vite-xmlui-plugin.ts`, find all calls to `xmlUiMarkupToComponent` and update them to pass the extractor-built lookup.

  At plugin startup, build the lookup once:
  ```typescript
  import { extractOptimizerMetadataFromDir } from "../components-core/optimization/static-extractor";
  import { resolve, dirname } from "node:path";

  // Inside the plugin's buildStart or configResolved hook:
  const COMPONENTS_DIR = resolve(__dirname, "../components");
  const extractedMetadata = extractOptimizerMetadataFromDir(COMPONENTS_DIR);

  function staticMetadataLookup(type: string): any {
    return extractedMetadata[type];
  }
  ```

  Then pass `staticMetadataLookup` to `xmlUiMarkupToComponent` calls:
  ```typescript
  // BEFORE:
  xmlUiMarkupToComponent(source, fileId, preResolvedImports)

  // AFTER:
  xmlUiMarkupToComponent(source, fileId, preResolvedImports, staticMetadataLookup)
  ```

  > **Note:** The exact structure of vite-xmlui-plugin.ts needs to be checked to find the right hook. Look for `xmlUiMarkupToComponent` calls. Cache `extractedMetadata` to avoid re-scanning on every file transform.

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  cd xmlui && npx tsc --noEmit 2>&1 | grep -E 'error|Error' | head -20
  ```

  Expected: no errors

- [ ] **Step 5: Commit**

  ```bash
  git add xmlui/src/components-core/xmlui-parser.ts xmlui/src/nodejs/vite-xmlui-plugin.ts
  git commit -m "feat: inject static metadata extractor into xmlui-parser (Phase 3)"
  ```

---

### Task 15: Delete optimizer-metadata.ts and clean up imports

**Files:**
- Delete: `xmlui/src/components-core/optimization/optimizer-metadata.ts`
- Modify: `xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`

At this point `optimizer-metadata.ts` should have no remaining importers (DataLoader.tsx, wrapComponent.tsx, renderers.ts, DataSource.tsx, FrameworkGlobals.ts already cleaned up in Phase 1; xmlui-parser.ts now uses static extractor).

- [ ] **Step 1: Verify no remaining imports**

  ```bash
  grep -r "optimizer-metadata" /Users/yurii/projects/nsoftware/xmlui-monorepo/xmlui/src/ --include="*.ts" --include="*.tsx" -l
  ```

  Expected: only `optimizer-metadata.ts` itself (or empty). If any other file shows up — fix it before deleting.

- [ ] **Step 2: Check renderer-metadata-drift.test.ts for remaining OPTIMIZER_METADATA usage**

  ```bash
  grep -n "OPTIMIZER_METADATA\|optimizer-metadata" /Users/yurii/projects/nsoftware/xmlui-monorepo/xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts
  ```

  If any references remain, remove them (should have been cleaned up in Task 12).

- [ ] **Step 3: Delete optimizer-metadata.ts**

  ```bash
  rm xmlui/src/components-core/optimization/optimizer-metadata.ts
  ```

- [ ] **Step 4: Run full test suite**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -20
  ```

  Expected: all PASS, no import errors

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "refactor: delete optimizer-metadata.ts — all data now inline in component createMetadata (Phase 3 complete)"
  ```

---

## PHASE 4 — Extension Packages Support

### Task 16: Add optimizerSourceDirs to Vite plugin options

**Files:**
- Modify: `xmlui/src/nodejs/vite-xmlui-plugin.ts`

- [ ] **Step 1: Find the PluginOptions type**

  In `vite-xmlui-plugin.ts`, find the interface or type for plugin options (likely `PluginOptions` or similar). Add the new field:

  ```typescript
  interface PluginOptions {
    // ...existing fields...
    /**
     * Additional directories to scan for optimizer metadata.
     * Use this for extension packages that have container-like components
     * with childInjectedVars. Each entry is an absolute path.
     * Defaults to the xmlui built-in components directory.
     */
    optimizerSourceDirs?: string[];
  }
  ```

- [ ] **Step 2: Update extractOptimizerMetadataFromDir call to include extra dirs**

  In the plugin startup code (from Task 14), update to scan all dirs:

  ```typescript
  const allDirs = [COMPONENTS_DIR, ...(options.optimizerSourceDirs ?? [])];
  const extractedMetadata: Record<string, any> = {};
  for (const dir of allDirs) {
    Object.assign(extractedMetadata, extractOptimizerMetadataFromDir(dir));
  }
  ```

- [ ] **Step 3: Run full test suite**

  ```bash
  cd xmlui && npx vitest run 2>&1 | tail -20
  ```

  Expected: all PASS

- [ ] **Step 4: Commit**

  ```bash
  git add xmlui/src/nodejs/vite-xmlui-plugin.ts
  git commit -m "feat: add optimizerSourceDirs option to Vite plugin for extension packages (Phase 4 complete)"
  ```

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement | Covered By |
|---|---|
| Inline childInjectedVars into 28 components | Tasks 1–8 |
| Remove mergeOptimizerInjectedVars from wrapComponent | Task 9 |
| Remove mergeOptimizerInjectedVars from renderers.ts | Task 9 |
| Remove mergeOptimizerInjectedVars from DataSource.tsx | Task 3 |
| Update FrameworkGlobals.ts | Task 10 |
| Remove U-audit.1 | Task 11 |
| Rewrite U-audit.2 | Task 12 |
| Create static-extractor.ts (VPP-B) | Task 13 |
| Update xmlui-parser.ts | Task 14 |
| Delete optimizer-metadata.ts | Task 15 |
| optimizerSourceDirs for extension packages | Task 16 |
| DataLoader — remove OPTIMIZER_METADATA reference | Task 2 |
| $isSelected verification for Table/List | Task 7 (List), Task 8 (Table note) |

### Gaps Found and Fixed

- **DataSource.tsx**: Has a module-level `mergeOptimizerInjectedVars` call (not in wrapComponent) — covered in Task 3.
- **DataLoader.tsx**: References OPTIMIZER_METADATA inline (not via mergeOptimizerInjectedVars) — covered in Task 2.
- **FrameworkGlobals.ts** at non-obvious path `state/FrameworkGlobals.ts` — covered in Task 10 with correct relative import paths.
- **DataLoader not in collectedComponentMetadata**: Added manually in FrameworkGlobals (Task 10) and U-audit.2 (Task 12).

### Type Consistency

- `extractOptimizerMetadataFromSource` (exported in Task 13) is the same name used in tests in Task 13's Step 1.
- `extractOptimizerMetadataFromDir` (exported in Task 13) is called in Task 14's Step 3 and Task 16's Step 2.
- `staticMetadataLookup` defined in Task 14's Step 3, used in Task 14's Step 3.
