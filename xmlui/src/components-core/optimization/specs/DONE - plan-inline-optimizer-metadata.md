# Plan: Inline Optimizer Metadata into `createMetadata`

**Status:** Proposal  
**Created:** 2026-05-27  
**Supersedes:** The need for `OPTIMIZER_METADATA` central registry and `mergeOptimizerInjectedVars`

---

## 1. Problem Statement

### 1.1 The Central Registry Problem

`OPTIMIZER_METADATA` (in `optimizer-metadata.ts`) is a flat dictionary that maps component names to
their optimizer-relevant fields: `childInjectedVars`, `unstableChildInjectedVars`,
`isImplicitContainerByDefault`, and per-event `injectedVars`. It exists because the Vite plugin
runs in Node.js and cannot import React component files.

This split creates **a mandatory two-place maintenance model**:

| What to change | File 1 | File 2 |
|---|---|---|
| Add `$newVar` to List child scope | `List.tsx` (renderer) | `optimizer-metadata.ts` (registry) |
| Add new event with `$vars` to Form | `Form.tsx` (event def) | `optimizer-metadata.ts` (registry) |
| Add a new container component | `NewComp.tsx` | `optimizer-metadata.ts` |

The problem is not just DX inconvenience. The registry is deep inside `components-core/optimization/`
— a folder developers rarely open when adding or modifying components. The Layer 4 runtime throw
(`validateInjectedVars`) and U-audit.1/U-audit.2 tests exist precisely to catch the inevitable drift
this split creates.

### 1.2 What `OPTIMIZER_METADATA` Actually Contains

All fields in the registry are already part of `ComponentMetadata` (defined in `ComponentDefs.ts`):

```
ComponentMetadata.childInjectedVars         ← already a typed field
ComponentMetadata.unstableChildInjectedVars  ← already a typed field
ComponentMetadata.isImplicitContainerByDefault ← already a typed field
ComponentMetadata.events[*].injectedVars     ← ComponentEventMetadata.injectedVars
```

`mergeOptimizerInjectedVars` exists only because this data lives in OPTIMIZER_METADATA
**separately** from the runtime `ComponentMetadata`. At registration time (`wrapComponent`,
`createComponentRenderer`, `createLoaderRenderer`) it copies the data into the metadata object.

### 1.3 Why the Split Exists

The Vite plugin calls `computeUsesForTree(componentTree, lookupOptimizerMetadata)`. The callback
must map a component type name to a `ComponentMetadata`-shaped object. In Node.js, the component
`.tsx` files cannot be imported (they import React, SCSS, DOM globals), so the lookup must come
from a React-free source: `optimizer-metadata.ts`.

---

## 2. Proposed Solution

**Declare `childInjectedVars`, `isImplicitContainerByDefault`, `unstableChildInjectedVars`, and
`events[*].injectedVars` directly in each component's `createMetadata` call** — the same place
where `description`, `props`, `events`, and `apis` already live.

### 2.1 Before / After Comparison

**Before (Form.tsx + optimizer-metadata.ts):**

```typescript
// optimizer-metadata.ts
Form: withInjectedContext({
  isImplicitContainerByDefault: true,
  childInjectedVars: ["$data"],
  eventsInheritChildVars: ["willSubmit", "submit", "submitFailed", "cancel", "reset", "success"],
}),

// Form.tsx — events have no injectedVars, childInjectedVars missing
export const FormMd = createMetadata({
  events: {
    submit: { description: "..." },   // injectedVars absent
    ...
  }
});
```

**After (Form.tsx only):**

```typescript
// Form.tsx — everything in one place
export const FormMd = createMetadata({
  isImplicitContainerByDefault: true,
  childInjectedVars: ["$data"],
  events: {
    submit: {
      description: "...",
      injectedVars: ["$data", "$isDirty"],
    },
    willSubmit:    { description: "...", injectedVars: ["$data", "$isDirty"] },
    submitFailed:  { description: "...", injectedVars: ["$data", "$isDirty"] },
    cancel:        { description: "...", injectedVars: ["$data", "$isDirty"] },
    reset:         { description: "...", injectedVars: ["$data", "$isDirty"] },
    success:       { description: "...", injectedVars: ["$data", "$isDirty"] },
  },
});
```

### 2.2 Runtime Simplification

After migration `mergeOptimizerInjectedVars` is completely removed:
- `wrapComponent.tsx`: remove 2 `mergeOptimizerInjectedVars(...)` calls + import
- `renderers.ts`: remove 1 call + import
- `DataSource.tsx`: remove 1 call + import

`resolveOptimizerMetadata` in `StandaloneApp.tsx` already reads `collectedComponentMetadata[type]`.
After migration the metadata objects have all fields inline — no merge needed.

```typescript
// StandaloneApp.tsx — stays the same, already works
function resolveOptimizerMetadata(type: string) {
  if (type === "DataLoader") return DataLoaderMd;
  return (collectedComponentMetadata as Record<string, unknown>)[type];
}
```

### 2.3 Vite Plugin Path — The Open Problem

`xmlui-parser.ts` is imported by the Vite plugin (Node.js) and calls:
```typescript
computeUsesForTree(component, lookupOptimizerMetadata);
```

After migration, `lookupOptimizerMetadata` cannot read from `collectedComponentMetadata` (React
imports). Two options:

#### Option VPP-A: Keep a thin `optimizer-metadata.ts` (pure data, manually maintained)

The central file shrinks from a full registry to a minimal pure-data file that only the Vite plugin
path uses. Runtime path ignores it. Developers still edit the file for new components, but the
runtime no longer duplicates the data — it reads from `ComponentMetadata` directly.

**Problem**: two-place maintenance still exists for the Vite plugin path.

#### Option VPP-B: Vite plugin does static AST extraction from `*.tsx` files ✅ Recommended

The Vite plugin reads component source files as text (no execution) and extracts the
`childInjectedVars`, `isImplicitContainerByDefault`, `unstableChildInjectedVars`, and event
`injectedVars` values via regex / simple AST. Builds an in-memory lookup at plugin startup.

This is proven feasible: `renderer-metadata-drift.test.ts` already does exactly this pattern
(`readFileSync` + regex) to extract `contextVars` arrays from component source files.

The extractor logic is ~50 lines:
1. Glob `components/**/*.tsx` files
2. For each file, find `createMetadata({...})` call
3. Extract: `childInjectedVars: [ ... ]` arrays (static array literal)
4. Extract: `isImplicitContainerByDefault: true` boolean
5. Extract: `unstableChildInjectedVars: [ ... ]` arrays
6. Extract: `events: { <name>: { injectedVars: [ ... ] } }` per-event arrays
7. Build `Record<string, Partial<ComponentMetadata>>` from results

**Constraint**: all these values must be **static string literal arrays** in the source (no
computed values, no spread, no function calls). This is already the convention.

**Limitation**: extension packages (`xmlui-masonry`, etc.) require their component folder to be
discoverable. The Vite plugin would accept an optional `optimizerSourceDirs` config option
(defaults to `xmlui/src/components`), pointing to additional folders.

---

## 3. What Gets Deleted

After full migration:

| Symbol | File | Action |
|---|---|---|
| `OPTIMIZER_METADATA` | `optimizer-metadata.ts` | Delete |
| `withInjectedContext()` | `optimizer-metadata.ts` | Delete |
| `lookupOptimizerMetadata()` | `optimizer-metadata.ts` | Delete (or repurpose for Vite plugin VPP-A) |
| `mergeOptimizerInjectedVars()` | `optimizer-metadata.ts` | Delete |
| `optimizer-metadata.ts` | `components-core/optimization/` | Delete (or repurpose for VPP-A) |
| import in `wrapComponent.tsx` | — | Remove |
| import in `renderers.ts` | — | Remove |
| import in `DataSource.tsx` | — | Remove |
| import in `DataLoader.tsx` (for `OPTIMIZER_METADATA` reference in `injectedVars`) | — | Remove (use inline literal) |
| import in `FrameworkGlobals.ts` | — | Replace with iteration over `collectedComponentMetadata` |

---

## 4. What Gets Changed — Component Files

The following 28 components need new/updated fields in their `createMetadata` call:

| Component | File | Changes needed |
|---|---|---|
| `App` | `App/App.tsx` | `unstableChildInjectedVars: ["$pathname","$routeParams","$queryParams","$linkInfo"]` |
| `DataLoader` | `components-core/loader/DataLoader.tsx` | Remove `OPTIMIZER_METADATA` reference in `fetch.injectedVars`; declare inline |
| `DataSource` | `DataSource/DataSource.tsx` | `fetch.injectedVars` inline (was manually set then removed — add back natively) |
| `APICall` | `APICall/APICall.tsx` | `mockExecute.injectedVars` inline |
| `List` | `List/List.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]` |
| `Items` | `Items/Items.tsx` | `childInjectedVars: [...]` |
| `Table` | `Table/Table.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]`, `contextMenu.injectedVars` |
| `TileGrid` | `TileGrid/TileGrid.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]`, `contextMenu.injectedVars` |
| `Tree` | `Tree/Tree.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: ["$item"]`, `contextMenu.injectedVars` |
| `Select` | `Select/Select.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]` |
| `AutoComplete` | `AutoComplete/AutoComplete.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]` |
| `Markdown` | `Markdown/Markdown.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]` |
| `DataGrid` | `DataGrid/DataGrid.tsx` | `isImplicitContainerByDefault: true` |
| `ModalDialog` | `ModalDialog/ModalDialog.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: [...]` |
| `ContextMenu` | `ContextMenu/ContextMenu.tsx` | `childInjectedVars: ["$context"]` |
| `Queue` | `Queue/Queue.tsx` | `childInjectedVars: [...]`, per-event `injectedVars` for 5 events |
| `Column` | `Column/Column.tsx` | `childInjectedVars: [...]` |
| `Form` | `Form/Form.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: ["$data"]`, 6 events `injectedVars` |
| `FormItem` | `FormItem/FormItem.tsx` | `childInjectedVars: [...]` |
| `FormSegment` | `FormSegment/FormSegment.tsx` | `childInjectedVars: [...]` |
| `Tabs` | `Tabs/Tabs.tsx` | `isImplicitContainerByDefault: true`, `childInjectedVars: ["$header"]` |
| `TabItem` | `TabItem/TabItem.tsx` | `childInjectedVars: ["$header"]` |
| `Stepper` | `Stepper/Stepper.tsx` | `isImplicitContainerByDefault: true` |
| `Drawer` | `Drawer/Drawer.tsx` | `isImplicitContainerByDefault: true` |
| `RadioGroup` | `RadioGroup/RadioGroup.tsx` | `childInjectedVars: [...]` |
| `Checkbox` | `Checkbox/Checkbox.tsx` | `childInjectedVars: [...]` |
| `Fallback` | `Fallback/Fallback.tsx` | `childInjectedVars: ["$error"]` |
| (any `$isSelected` fix) | `Table/Table.tsx` | Verify `$isSelected` is re-added if removed previously |

---

## 5. Test Changes

### 5.1 Tests to Remove

| Test | Location | Why removed |
|---|---|---|
| **U-audit.1** — `OPTIMIZER_METADATA reflected in runtime metadata` | `renderer-metadata-drift.test.ts` | The central registry no longer exists; runtime metadata IS the source |

### 5.2 Tests to Update

| Test | Location | What changes |
|---|---|---|
| **U-audit.2** — `OPTIMIZER_METADATA vars have a string-literal presence in source` | `renderer-metadata-drift.test.ts` | Replace `OPTIMIZER_METADATA` iteration with iteration over inline metadata from `collectedComponentMetadata`. The check becomes: for each component with `childInjectedVars`, verify string-literal presence of each `$var` in the component's source file |
| **Renderer contextVars drift** | `renderer-metadata-drift.test.ts` | No change needed — still reads `contextVars` from renderer source |

### 5.3 U-audit.2 Rewrite (Stage 2 of this Plan)

**Current U-audit.2 logic** (as described in `TODO - metadata-protection-layers-2-and-4.md`):
- Iterates `OPTIMIZER_METADATA`
- For each `$var` in `childInjectedVars`, checks string-literal presence in component source file

**New U-audit.2 logic** after migration:
- Iterates `collectedComponentMetadata` (plus DataLoaderMd, manually added)
- For each component with `childInjectedVars` or event `injectedVars`, reads its source file
- Checks string-literal presence of each `$var`

**The source file mapping** (same problem as before, same solution):
- Component name `"Form"` → file `components/Form/Form.tsx`
- Components in `components-core` → use `displayName` field from metadata for mapping

The checker requires a map from component type name to source file path. This can be built from
`collectedComponentMetadata` by resolving each import path (they are direct imports like
`import { FormMd } from "./Form/Form"`), or by a naming convention scan.

**Alternative for U-audit.2**: Extract the source-file path at registration time by adding
a `__sourceFile__: import.meta.url` field to the metadata (dev-only, stripped in production). This
makes the mapping trivial and eliminates the naming-convention assumption.

### 5.4 New Vite Plugin Test (if VPP-B is chosen)

Add a unit test for the static AST extractor:
- Provide synthetic `*.tsx` source strings as fixtures
- Verify extraction of `childInjectedVars`, `injectedVars`, `isImplicitContainerByDefault`
- Verify robustness: multi-line arrays, trailing commas, single/double quotes
- Test file: `xmlui/tests/components-core/optimization/optimizer-metadata-extractor.test.ts`

---

## 6. `FrameworkGlobals.ts` Migration

Currently iterates `OPTIMIZER_METADATA` to build `UNSTABLE_GLOBAL_VARS`:

```typescript
import { OPTIMIZER_METADATA } from "../optimization/optimizer-metadata";

export const UNSTABLE_GLOBAL_VARS = new Set<string>();
for (const meta of Object.values(OPTIMIZER_METADATA)) {
  const unstableVars = (meta as any).unstableChildInjectedVars;
  if (unstableVars) {
    for (const v of unstableVars) UNSTABLE_GLOBAL_VARS.add(v);
  }
}
```

After migration, replace with iteration over `collectedComponentMetadata` plus the extra metadata
objects (`DataLoaderMd`, etc.) that are not in the collection:

```typescript
import { collectedComponentMetadata } from "../components/collectedComponentMetadata";
import { DataLoaderMd } from "./loader/DataLoader";

const ALL_METADATA = { ...collectedComponentMetadata, DataLoader: DataLoaderMd };

export const UNSTABLE_GLOBAL_VARS = new Set<string>();
for (const meta of Object.values(ALL_METADATA)) {
  const unstableVars = (meta as any)?.unstableChildInjectedVars;
  if (unstableVars) {
    for (const v of unstableVars) UNSTABLE_GLOBAL_VARS.add(v);
  }
}
```

---

## 7. Implementation Phases

### Phase 1 — Runtime path (no Vite plugin changes)

**Goal**: Inline all optimizer fields in component metadata. Remove `mergeOptimizerInjectedVars`.
Vite plugin still uses old `optimizer-metadata.ts` (kept temporarily).

Steps:
1. For each of the 28 components in §4: add `childInjectedVars` / `isImplicitContainerByDefault` /
   `unstableChildInjectedVars` and event `injectedVars` directly in their `createMetadata` call.
   Copy values verbatim from `OPTIMIZER_METADATA` — no logic change.
2. Remove `mergeOptimizerInjectedVars` calls from `wrapComponent.tsx`, `renderers.ts`, `DataSource.tsx`.
3. Remove the `mergeOptimizerInjectedVars` export from `optimizer-metadata.ts`.
4. Update `FrameworkGlobals.ts` to use `collectedComponentMetadata` (§6).
5. Verify `resolveOptimizerMetadata` in `StandaloneApp.tsx` works as-is (it already reads
   `collectedComponentMetadata[type]`).
6. Run full unit test suite — all must pass.
7. Remove `withInjectedContext` helper from `optimizer-metadata.ts` (no longer used).

**Test changes in Phase 1**:
- Remove U-audit.1 describe block (it tested the now-deleted merge mechanism).
- Run the test suite; confirm no regressions.

**Duration estimate**: 3–4h (mechanical — copying values to 28 files, removing merge machinery).

---

### Phase 2 — Test updates (U-audit.2 rewrite)

**Goal**: Rewrite U-audit.2 to iterate `collectedComponentMetadata` instead of the deleted
`OPTIMIZER_METADATA`.

Steps:
1. Replace the OPTIMIZER_METADATA iteration in the `"OPTIMIZER_METADATA vars have a string-literal
   presence in source"` describe block with iteration over `collectedComponentMetadata` + DataLoaderMd.
2. Update the source-file resolver: instead of `components/<Name>/<Name>.tsx` via OPTIMIZER_METADATA
   keys, derive the path from the actual import in `collectedComponentMetadata.ts` OR use the
   existing naming convention scan (same logic, different root set).
3. Rename the describe block to: `"childInjectedVars / injectedVars vars have a string-literal
   presence in source (U-audit.2)"`.
4. Confirm all existing components still pass; no false positives.

**Duration estimate**: 2–3h.

---

### Phase 3 — Vite plugin path (VPP-B: static AST extractor)

**Goal**: Replace `optimizer-metadata.ts` import in `xmlui-parser.ts` with a static extractor
that reads from component source files. Delete `optimizer-metadata.ts` entirely.

Steps:
1. Implement `extractOptimizerMetadataFromDir(dir: string): Record<string, Partial<ComponentMetadata>>`
   in a new file `components-core/optimization/static-extractor.ts`:
   - Glob `**/*.tsx` in `dir` (exclude `*React.tsx`, `*.spec.*`, `*.test.*`)
   - For each file: read as string, extract with regex/string ops:
     - `childInjectedVars: [ ... ]` — extract array literal
     - `isImplicitContainerByDefault: true` — boolean flag presence
     - `unstableChildInjectedVars: [ ... ]` — extract array literal
     - Per event `injectedVars`: find `events: { eventName: { ..., injectedVars: [ ... ] } }`
   - Extract component type name via existing `extractRegisteredName()` helper (already in
     `renderer-metadata-drift.test.ts` — move to shared utility)
   - Return map: `{ Form: { childInjectedVars: [...], events: { submit: { injectedVars: [...] } } } }`
2. Update `vite-xmlui-plugin.ts` to call the extractor once at plugin startup (or lazily on first
   `.xmlui` file transform). Cache result.
3. Update `xmlui-parser.ts`: accept an optional `metadataLookup` parameter; default to
   `lookupOptimizerMetadata` for backward compat. OR: update `xmlUiMarkupToComponent` to not
   hardcode the lookup (pass it as an argument from the call site).
4. Delete `optimizer-metadata.ts` (or reduce to an empty compatibility shim if needed).
5. Write unit tests for the extractor (§5.4).

**Duration estimate**: 4–6h (extractor logic + tests + integration).

---

### Phase 4 — Extension packages support

**Goal**: Extension packages (`xmlui-masonry`, `xmlui-echart`, etc.) that have container-like
components with `childInjectedVars` should also use inline metadata and be discoverable by the
Vite plugin.

Steps:
1. Add `optimizerSourceDirs?: string[]` option to `PluginOptions` in `vite-xmlui-plugin.ts`.
2. Extractor globs all dirs: `[defaultXmluiDir, ...optimizerSourceDirs]`.
3. Packages that need this add their src dir in their Vite config.
4. Update docs.

**Duration estimate**: 1–2h.

---

## 8. Rollback Plan

Phase 1 is the only risky step (touches 28 component files). Rollback: revert Phase 1 changes;
`OPTIMIZER_METADATA` is still present and `mergeOptimizerInjectedVars` is still exported (just
unused from the component side). The Vite plugin is unaffected until Phase 3.

Each phase is independently mergeable. Recommended merge order: 1 → 2 → 3 → 4, each as a
separate PR.

---

## 9. Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Wrong value copied from OPTIMIZER_METADATA to createMetadata | Low | U-audit.1 test catches this during Phase 1 (keep it until Phase 2 removes it) |
| U-audit.2 rewrite introduces false positives | Medium | Run against all 28 components before merging Phase 2 |
| Vite plugin extractor misses a component after Phase 3 | Medium | computedUses optimizer degrades gracefully (no-op, not a crash); Layer 4 DEV throw still fires at runtime |
| Extractor breaks on unusual formatting | Low | Cover in unit tests; `createMetadata` style is stable and enforced by formatters |
| Extension package components unoptimized | Existing gap | Phase 4 closes it; currently they are already unoptimized |

---

## 10. Summary of Code Impact

```
Files added:      1  (static-extractor.ts — Phase 3)
Files deleted:    1  (optimizer-metadata.ts — Phase 3)
Files modified:  ~35 (28 component files + FrameworkGlobals + wrapComponent +
                      renderers + DataSource + DataLoader + xmlui-parser +
                      vite-xmlui-plugin + renderer-metadata-drift.test.ts)
Net LOC delta:   ~-150  (registry + merge helpers removed > inline declarations added)
```

The migration is **neutral in correctness**: all `computeUsesForTree` inputs remain identical.
The optimization behavior of the runtime and Vite plugin does not change.
