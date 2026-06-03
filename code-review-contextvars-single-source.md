# Code Review (Detailed): contextVars as Single Source of Injected Vars

**Date:** 2026-06-01
**Reviewer pass:** Deep — verified against consuming code (`computedUses.ts`), regenerated snapshot, and per-variable coverage
**Branch:** `yurii/computedUses`
**Test status:** ✅ 205/205 optimization tests pass

---

## 0. Review Method

This pass did NOT trust the test suite alone. I verified:

1. **Per-variable coverage** — for every one of the 20 components, confirmed that each
   `$`-var removed from `childInjectedVars` is present in the regenerated snapshot's
   `contextVars`. (The drift test only audits components with *static* renderer arrays,
   so callback-renderer components like AutoComplete/Select/Checkbox are **not**
   oracle-checked — manual verification was required.)
2. **Consumer semantics** — read `computedUses.ts:473-485` to confirm the optimizer
   merges `contextVars` keys identically to `childInjectedVars`.
3. **Snapshot shape** — confirmed `isInternal: true` survives and descriptions land correctly.
4. **Type compatibility** — traced `static-extractor.ts → vite-xmlui-plugin.ts → computedUses`.

---

## 1. Correctness Verification (THE critical question)

> **Risk:** removing `childInjectedVars` is only safe if every var it held is *also* in
> `contextVars`. A var present in neither would be mis-classified by the optimizer as an
> external **parent** dependency → over-narrowing → stale renders.

### 1a. Optimizer reads both fields — proven equivalent

[computedUses.ts:473-485](xmlui/src/components-core/optimization/computedUses.ts#L473-L485):

```typescript
const childInjected = [
  ...(metadata?.childInjectedVars ?? []),
  ...(metadata?.unstableChildInjectedVars ?? []),
  ...Object.keys(metadata?.contextVars ?? {}),   // ← contextVars keys already merged
];
const childScope = childInjected.length > 0
  ? new Set([...injectedVarsScope, ...childInjected])
  : injectedVarsScope;
```

`contextVars` keys were **already** folded into `childScope` before this PR. Moving a var
from `childInjectedVars` to `contextVars` is therefore a **no-op for the optimizer's
runtime path**. ✅ Migration is provably safe at the merge site.

### 1b. Per-variable coverage — ZERO vars lost

Verified against the regenerated snapshot for **all 20 components**:

| Bucket | Components | Result |
|--------|-----------|--------|
| A (11) | Column, List, Items, TileGrid, FormItem, FormSegment, Form, ModalDialog, Queue, ContextMenu, TabItem | ✅ all `childInjectedVars` ⊆ `contextVars` |
| B (4)  | Checkbox, RadioGroup, AutoComplete, Select | ✅ all covered (incl. callback-renderer vars) |
| C (5)  | Table, Tree, Tabs, Markdown, Fallback | ✅ all covered |

**No variable was dropped in any component.** This is the single most important result and
it passes cleanly. (Verified by enumerating the pre-migration `childInjectedVars` lists and
diffing against `Object.keys(snapshot[comp].contextVars)`.)

### 1c. Internal vars correctly hidden from docs

`snapshot.Checkbox.contextVars.$checked = {"description":"...","isInternal":true}` ✅
The docs generator filters `!v.isInternal`, so `$checked / $setChecked / $selectedValue /
$inTrigger` will not leak into public documentation, while the optimizer still sees the key.

### 1d. Type compatibility through the build-time extension path

`static-extractor.ts` produces `contextVars: Record<string, Record<never,never>>` →
`{ $x: {} }`. Consumed by `vite-xmlui-plugin.ts:164` → fed to `computedUses`, which only
does `Object.keys(metadata.contextVars)`. The view type
([ComponentDefs.ts:759](xmlui/src/abstractions/ComponentDefs.ts#L759)) is
`Record<string, unknown>` with the comment *"Only the keys of contextVars are read"*. ✅
Shapes are compatible; keys-only extraction is sufficient.

---

## 2. Findings

### 🔴 FINDING 1 — Stale, now-incorrect comment in the consumer (Medium)

**Location:** [computedUses.ts:476-484](xmlui/src/components-core/optimization/computedUses.ts#L476-L484)

```typescript
// metadata.contextVars keys ($item, $itemIndex, etc.) document what this
// component type injects into children (Language Server + runtime metadata).
// For core components this is typically redundant with childInjectedVars
// declared in the `optimization: {}` block of createMetadata. For
// extension-package components (Masonry, ReactFlow, etc.) that may not have
// an `optimization.childInjectedVars` entry, this is the ONLY optimizer hint
// available in Standalone mode ...
```

**Problem:** This comment now describes the *pre-migration* world. After this PR:
- "For core components this is **typically redundant** with childInjectedVars" — **false.**
  Core components no longer have `childInjectedVars`; `contextVars` is now the **sole**
  source for them too, not a redundant mirror.

This is the most important finding precisely *because* the entire PR's thesis is "contextVars
is the single source" — yet the code that consumes it still tells future maintainers the
opposite. A maintainer reading this could wrongly conclude core components still carry
`childInjectedVars` and "clean up" the `contextVars` merge, silently breaking every core
component's narrowing.

**Recommendation:** Update the comment to state that `contextVars` keys are now the primary
injected-var source for **both** core (post-migration) and extension components; only
extension packages still *also* use `childInjectedVars`.

---

### 🟡 FINDING 2 — Optimizer snapshot now carries doc prose it doesn't need (Low)

**Observation:** Bucket C migration replaced compact string arrays with full descriptor
objects in the generated snapshot:

```
before:  Table.childInjectedVars = ["$item","$itemIndex","$cell","$colIndex","$row","$rowIndex"]
after:   Table.contextVars = { $item: { description: "The complete data row..." }, ... }  // ×6 prose strings
```

The build-time optimizer needs **only the keys**, yet the snapshot
(`xmlui-metadata-generated.js`) now ships ~6 prose descriptions per Bucket C component that
weren't there before (Table, Tree, Tabs, Markdown). Net snapshot growth in the diff: +216/-216
lines churned, with description strings added for the newly-documented components.

**Assessment:** Acceptable, **not a regression.** The snapshot doubles as the Language-Server /
docs source, so descriptions legitimately belong there. Just noting the optimizer payload grew
and is now coupled to doc-string length. If snapshot size ever becomes a concern, a keys-only
optimizer view could be split from the doc view — out of scope here.

---

### 🟡 FINDING 3 — Seven orphan blank lines left by block removal (Low, cosmetic)

Where the **entire** `optimization` block was deleted, a stray blank line remains between the
description and `props:`. Confirmed in:

`Column.tsx:18`, `Items.tsx:14`, plus `ContextMenu`, `FormItem`, `FormSegment`, `Queue`,
`TabItem` (7 files total).

```
17:     "XMLUI components for rich cell content.",
18:                         ← orphan blank line (was `optimization: {...}`)
19:   props: {
```

**Recommendation:** Trivial cleanup — remove the stray blank lines. Not functionally
significant; will likely be flagged by Prettier/lint on commit anyway.

---

### 🟡 FINDING 4 — drift-test regex is now the sole oracle but remains fragile (Low, pre-existing)

**Location:** [renderer-metadata-drift.test.ts:127](xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts#L127)

```typescript
const ctxBlock = source.match(/contextVars:\s*\{([\s\S]*?)\n\s*\},/);
```

This regex requires the metadata `contextVars` object to **terminate with `\n  },`** (closing
brace, comma, newline). It also non-greedily grabs the *first* `contextVars: {` — fine today
because renderer-level contextVars use `[...]` (array) not `{...}`.

**Why it matters more now:** before this PR, a missed `contextVars` extraction was backstopped
by the `childInjectedVars` branch. That branch is **gone** (correctly), so this regex is now
the *only* thing proving a core component declared its injected vars. If a future author writes
the block without a trailing comma, or with unusual formatting, extraction silently yields an
empty set → the drift test **passes with a false negative** → an undeclared injected var ships
and the optimizer mis-narrows it.

**Recommendation:** Harden to AST-based extraction. The infrastructure already exists —
`static-extractor.ts` parses `contextVars` from the AST robustly. The drift test could reuse
`extractOptimizerMetadataFromSource(source).contextVars` instead of the regex. Worth a
follow-up; not blocking.

---

### 🟡 FINDING 5 — static-extractor drops `isInternal` (Low, document the intent)

**Location:** [static-extractor.ts:151-156](xmlui/src/components-core/optimization/static-extractor.ts#L151-L156)

```typescript
const ctx: Record<string, Record<never, never>> = {};
for (const prop of contextVarsNode.properties) {
  const key = getPropertyKeyName(prop);
  if (key) ctx[key] = {};   // ← value intentionally empty; isInternal/description discarded
}
```

The build-time extension path captures keys only, discarding `isInternal` and `description`.
**Correct for the optimizer** (keys are all it needs), but if any future build-time logic wants
to distinguish internal vars via this path, the information is gone. The `Record<never, never>`
type is technically precise but reads oddly.

**Recommendation:** Add a one-line comment stating the values are intentionally empty
(keys-only, for optimizer scope merging). Optionally type as `Record<string, {}>` for clarity.

---

### 🟢 FINDING 6 — `$header` documented on both Tabs and TabItem (Note, intentional)

`Tabs.contextVars.$header` ("The tab's header context...") and
`TabItem.contextVars.$header` ("This context value represents the header...") now both exist
with **different** descriptions. Two public doc entries for the conceptually-same variable in
two component scopes. Intended per the plan (Bucket C Step 3 explicitly mirrors TabItem), and
harmless — but worth knowing two doc pages will describe `$header`.

---

### 🟢 FINDING 7 — Bucket A classification verified correct (Note)

Bucket A components had **no** `contextVars` added in the diff — yet the snapshot shows them
populated (e.g. `ContextMenu.contextVars=[$context]`). This confirms they already had a
pre-existing `contextVars` block; the removed `childInjectedVars` was pure duplication. The
"already covered" classification was accurate for all 11. ✅

---

## 3. Asymmetry sanity-check (all correct)

| Pattern | Components | Correct? |
|---------|-----------|----------|
| Kept `optimization:{isImplicit}` + existing `contextVars` | List, TileGrid, Form, ModalDialog | ✅ implicit-container preserved |
| Kept `optimization:{isImplicit}` + **new** `contextVars` | Table, Tree, Tabs, Markdown, AutoComplete, Select | ✅ |
| Removed whole `optimization` block, has own `contextVars` | Column, Items, FormItem, FormSegment, Queue, ContextMenu, TabItem | ✅ never implicit containers |
| Replaced `optimization` with `contextVars` (no isImplicit) | Checkbox, RadioGroup, Fallback | ✅ never implicit containers |

No component lost an `isImplicitContainerByDefault` flag (the one truly behavior-affecting
field). Verified `Table.isImplicitContainerByDefault === true` survives in snapshot.

---

## 4. Summary

| Area | Verdict |
|------|---------|
| **Correctness (vars preserved)** | ✅ Zero vars lost across all 20 components (manually verified) |
| **Optimizer semantics** | ✅ Provably equivalent (contextVars keys already merged) |
| **Docs filtering (isInternal)** | ✅ Preserved in snapshot |
| **Type safety (build-time path)** | ✅ Keys-only extraction compatible |
| **Extension packages** | ✅ Untouched, still use childInjectedVars |
| **Blocking bugs** | None |

### Action items — all fixed ✅
1. ✅ Updated stale comment in `computedUses.ts:476-484`.
2. ✅ Removed 7 orphan blank lines in Column, Items, ContextMenu, FormItem, FormSegment, Queue, TabItem.
3. ✅ Replaced fragile regex in drift-test with AST-based `extractOptimizerMetadataFromSource(source).contextVars`.
4. ✅ Added keys-only intent comment in `static-extractor.ts`.

**Tests after fixes:** 205/205 ✅

**Overall:** Solid, provably-safe migration. All issues resolved. Ready to commit.
