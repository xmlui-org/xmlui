# contextVars as Single Source of Injected Vars — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `metadata.contextVars` the single declaration of every variable a core component injects into child scope, and remove `optimization.childInjectedVars` from core components — keeping documentation (`d`) and internal (`dInternal`) vars in one place, enforced by the existing renderer-drift test.

**Architecture:** The optimizer already merges `Object.keys(metadata.contextVars)` into the child scope (`computedUses.ts`), and the snapshot now carries `contextVars`. The existing `renderer-metadata-drift.test.ts` already validates that every var declared in a component's static `renderers: { slot: { contextVars: ["$x"] } }` block is declared in **either** `childInjectedVars` **or** `metadata.contextVars`. So the oracle and the merge already exist. This migration (a) moves any var currently only in `childInjectedVars` into `contextVars` (`d` for public, `dInternal` for internal), (b) removes `optimization.childInjectedVars` from core components, and (c) tightens the drift test to require `contextVars` — turning "don't forget to document" into a CI failure.

**Tech Stack:** TypeScript, Vitest, Vite metadata build, `createMetadata` / `d` / `dInternal` helpers.

**Scope / non-goals:**
- `unstableChildInjectedVars` stays as the one explicit exception (different semantics; no component uses it today, but the field and optimizer support remain).
- Extension packages (`packages/xmlui-*`) keep `childInjectedVars`; the optimizer still reads it and `U-audit.1-ext` still enforces it. Out of scope.
- No optimizer-code change is needed — it already reads `contextVars` keys.
- Known accepted caveat: the optimizer treats *every* `contextVars` key as child-injected, so a key that is not truly injected would over-narrow (stale render). The renderer-drift oracle checks the *injected ⊆ declared* direction, not the reverse; over-declaration is not auto-caught (same risk as today).

---

## Reference data: the 20 core components by bucket

**Bucket A — `contextVars` already covers everything; just delete `childInjectedVars` (11):**
`Column, List, Items, TileGrid, FormItem, FormSegment, Form, ModalDialog, Queue, ContextMenu, TabItem`

**Bucket B — add internal vars as `dInternal`, then delete `childInjectedVars` (4):**
| Component | Vars to add as `dInternal` |
|-----------|----------------------------|
| Checkbox | `$checked`, `$setChecked` |
| RadioGroup | `$checked`, `$setChecked` |
| AutoComplete | `$selectedValue`, `$inTrigger` (`$item` already documented) |
| Select | `$selectedValue`, `$inTrigger` (`$item`, `$itemContext`, `$group` already documented) |

**Bucket C — add public docs to `contextVars`, then delete `childInjectedVars` (5):**
| Component | Vars to document |
|-----------|------------------|
| Table | `$item, $itemIndex, $cell, $colIndex, $row, $rowIndex` |
| Tree | `$item` |
| Tabs | `$header` |
| Markdown | `$anchorId, $anchorHref` |
| Fallback | `$error` |

---

## Task 1: Tighten enforcement first (TDD — produces the migration worklist)

Tightening the drift test before migrating makes it fail for every component still relying on `childInjectedVars`, giving an exact, self-updating worklist.

**Files:**
- Modify: `xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`

- [ ] **Step 1: Require `contextVars` in the core audit (U-audit.1)**

In the core loop (around lines 121–130), **remove** the `childInjectedVars`
branch so only `metadata.contextVars` keys count as a valid declaration. Replace:

```typescript
  const optEntry = AUDIT_METADATA[componentType];
  const declared = new Set<string>();
  if (optEntry?.childInjectedVars) {
    for (const v of optEntry.childInjectedVars) declared.add(v);
  }
  // Also include `contextVars: { $x: d(...) }` keys from createMetadata.
  const ctxBlock = source.match(/contextVars:\s*\{([\s\S]*?)\n\s*\},/);
  if (ctxBlock) {
    for (const m of ctxBlock[1].matchAll(/(\$\w+)\s*:/g)) declared.add(m[1]);
  }
```

with:

```typescript
  // Core components must declare injected vars in metadata.contextVars
  // (public via d(), internal via dInternal()). childInjectedVars is no
  // longer an accepted declaration site for core components.
  const declared = new Set<string>();
  const ctxBlock = source.match(/contextVars:\s*\{([\s\S]*?)\n\s*\},/);
  if (ctxBlock) {
    for (const m of ctxBlock[1].matchAll(/(\$\w+)\s*:/g)) declared.add(m[1]);
  }
```

Also update the failure message in the `has zero drift` test (around line 158)
to point authors at `contextVars` instead of `optimization.childInjectedVars`:

```typescript
            `renderer "${d.slot}" injects [${d.missing.join(", ")}] not declared in ` +
            `metadata.contextVars of <Component>/${d.componentType}.tsx`,
```
and the trailing `Fix:` hint:
```typescript
      throw new Error(
        `Renderer contextVars drift detected:\n${report}\n\n` +
          `Fix: declare the missing $-keys in contextVars in <Component>/<Component>.tsx ` +
          `(use d("...") for documented values, dInternal("...") for internal ones).`,
      );
```

(Leave `U-audit.1-ext` for extension packages and `U-audit.2` unchanged — extensions keep `childInjectedVars`.)

- [ ] **Step 2: Run the drift test to get the worklist**

Run: `npm --prefix xmlui run test -- renderer-metadata-drift`
Expected: FAIL — the "zero drift" test lists every core component whose static
renderer injects a `$`-var not yet in `contextVars`. Record this list; it is the
ground truth for Buckets B and C. (Bucket A components inject vars already in
`contextVars`, so they will not appear here — their `childInjectedVars` is pure
duplication and is handled by Task 2.)

- [ ] **Step 3: Commit the tightened test**

```bash
git add xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts
git commit -m "test: require core components to declare injected vars in contextVars (tighten renderer drift)"
```

---

## Task 2: Bucket A — delete duplicated `childInjectedVars` (11 components)

Each of these already lists the same vars in `contextVars`, so removing the
`optimization` block changes nothing the optimizer sees.

**Files (one `optimization` block removal each):**
- `Column/Column.tsx`, `List/List.tsx`, `Items/Items.tsx`, `TileGrid/TileGrid.tsx`,
  `FormItem/FormItem.tsx`, `FormSegment/FormSegment.tsx`, `Form/Form.tsx`,
  `ModalDialog/ModalDialog.tsx`, `Queue/Queue.tsx`, `ContextMenu/ContextMenu.tsx`,
  `TabItem/TabItem.tsx`

- [ ] **Step 1: For each file, confirm contextVars already covers childInjectedVars**

Run (example for List):
`node -e "const m=require('./xmlui/src/language-server/xmlui-metadata-generated.js').default; const e=m.List; const ctx=Object.keys(e.contextVars||{}); console.log('uncovered:', (e.childInjectedVars||[]).filter(v=>!ctx.includes(v)))"`
Expected: `uncovered: []` for every Bucket A component. (If any is non-empty, that
component belongs in Bucket B/C instead — move it there.)

- [ ] **Step 2: Remove the `optimization` block in each file**

In each component's `createMetadata({ ... })`, delete the `optimization` property.
Example — `List/List.tsx` (around line 31):

```typescript
  // DELETE this block:
  optimization: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item","$itemIndex","$isFirst","$isLast","$isSelected","$group"],
  },
```

**Important — preserve `isImplicitContainerByDefault`.** If the `optimization`
block also sets `isImplicitContainerByDefault: true`, keep that flag by moving it
to a top-level `optimization: { isImplicitContainerByDefault: true }` (drop only
`childInjectedVars`/`unstableChildInjectedVars`). Do NOT remove the implicit-container
flag. For List the result is:

```typescript
  optimization: {
    isImplicitContainerByDefault: true,
  },
```

(Components without `isImplicitContainerByDefault` — e.g. ContextMenu, Form — can
have the whole `optimization` block removed.)

- [ ] **Step 3: Run the drift + optimizer tests**

Run: `npm --prefix xmlui run test -- renderer-metadata-drift computedUses`
Expected: PASS for Bucket A components (they were never in the drift list; this
confirms no regression). 

- [ ] **Step 4: Commit**

```bash
git add xmlui/src/components/Column xmlui/src/components/List xmlui/src/components/Items xmlui/src/components/TileGrid xmlui/src/components/FormItem xmlui/src/components/FormSegment xmlui/src/components/Form xmlui/src/components/ModalDialog xmlui/src/components/Queue xmlui/src/components/ContextMenu xmlui/src/components/TabItem
git commit -m "refactor: drop duplicated childInjectedVars from fully-documented components (contextVars covers them)"
```

---

## Task 3: Bucket C — document the gap vars, then delete `childInjectedVars` (5 components)

These inject **user-facing** vars that were never documented. Add them to
`contextVars` with `d("...")`, then remove `childInjectedVars`.

**Files:** `Table/Table.tsx`, `Tree/Tree.tsx`, `Tabs/Tabs.tsx`, `Markdown/Markdown.tsx`, `Fallback/Fallback.tsx`

- [ ] **Step 1: Add `contextVars` to Table** (mirror Column's documented set)

In `Table/Table.tsx` `createMetadata({...})`, add a `contextVars` block:

```typescript
  contextVars: {
    $item: d("The complete data row object being rendered."),
    $itemIndex: d("Zero-based index of the row in the data array."),
    $cell: d("The value of the current cell for this column."),
    $colIndex: d("Zero-based index of the current column."),
    $row: d("The complete data row object being rendered (alias of `$item`)."),
    $rowIndex: d("Zero-based row index (alias of `$itemIndex`)."),
  },
```
then delete `childInjectedVars` from the `optimization` block (keep
`isImplicitContainerByDefault: true`).

- [ ] **Step 2: Add `contextVars` to Tree**

```typescript
  contextVars: {
    $item: d("The current tree node's data item."),
  },
```
Remove `childInjectedVars` (keep `isImplicitContainerByDefault` if present).

- [ ] **Step 3: Add `contextVars` to Tabs**

```typescript
  contextVars: {
    $header: d("The tab's header context (matches TabItem's `$header`)."),
  },
```
Remove `childInjectedVars` (keep `isImplicitContainerByDefault` if present).

- [ ] **Step 4: Add `contextVars` to Markdown**

```typescript
  contextVars: {
    $anchorId: d("The generated id of the current heading anchor."),
    $anchorHref: d("The href (#id) of the current heading anchor."),
  },
```
Remove `childInjectedVars` (keep `isImplicitContainerByDefault` if present).

- [ ] **Step 5: Add `contextVars` to Fallback**

```typescript
  contextVars: {
    $error: d("The error captured by this Fallback boundary."),
  },
```
Remove `childInjectedVars`.

- [ ] **Step 6: Run the drift + optimizer tests**

Run: `npm --prefix xmlui run test -- renderer-metadata-drift computedUses`
Expected: the Bucket C entries disappear from the drift report. If a component
used a **callback** `contextVars: (vars) => vars` renderer (not a static array),
it was never in the drift report — migration is still correct, just not
oracle-enforced (note it).

- [ ] **Step 7: Commit**

```bash
git add xmlui/src/components/Table xmlui/src/components/Tree xmlui/src/components/Tabs xmlui/src/components/Markdown xmlui/src/components/Fallback
git commit -m "feat: document previously-undocumented context vars (Table/Tree/Tabs/Markdown/Fallback), drop childInjectedVars"
```

---

## Task 4: Bucket B — add internal vars via `dInternal`, then delete `childInjectedVars` (4 components)

These vars are intentionally hidden from docs. `dInternal()` sets
`isInternal: true`; the docs generator already filters those out
(`MetadataProcessor.mjs`: `filter: (name, v) => !v.isInternal && v.description`),
while the optimizer still sees the key.

**Files:** `Checkbox/Checkbox.tsx`, `RadioGroup/RadioGroup.tsx`, `AutoComplete/AutoComplete.tsx`, `Select/Select.tsx`

- [ ] **Step 1: Checkbox — add internal contextVars**

In `Checkbox/Checkbox.tsx`, add (or extend) `contextVars`:

```typescript
  contextVars: {
    $checked: dInternal("Current checked state, injected into the input template."),
    $setChecked: dInternal("Setter for the checked state, injected into the input template."),
  },
```
Remove the `childInjectedVars` entry from `optimization`. Ensure `dInternal` is
imported from `../metadata-helpers` (it likely already is, or `d` is — add
`dInternal` to the same import).

- [ ] **Step 2: RadioGroup — same pattern**

```typescript
  contextVars: {
    $checked: dInternal("Current checked state, injected into the option template."),
    $setChecked: dInternal("Setter for the checked state, injected into the option template."),
  },
```
Remove `childInjectedVars`.

- [ ] **Step 3: AutoComplete — extend existing contextVars with internals**

`$item` is already documented; add the two internals alongside it:

```typescript
    $selectedValue: dInternal("Currently selected value, injected into the trigger/option template."),
    $inTrigger: dInternal("True when rendering inside the trigger (vs the dropdown list)."),
```
Remove `childInjectedVars`.

- [ ] **Step 4: Select — extend existing contextVars with internals**

```typescript
    $selectedValue: dInternal("Currently selected value, injected into the trigger/option template."),
    $inTrigger: dInternal("True when rendering inside the trigger (vs the dropdown list)."),
```
Remove `childInjectedVars`.

- [ ] **Step 5: Verify docs filtering — internal vars must NOT leak into docs**

Run: `node -e "const m=require('./xmlui/src/language-server/xmlui-metadata-generated.js')"` is not enough here (snapshot not yet regenerated). Instead assert on live metadata:
Run: `npm --prefix xmlui run test -- renderer-metadata-drift computedUses`
Expected: PASS. (Docs-leak verification happens in Task 5 after regeneration via the existing docs filter; the unit signal here is that drift + optimizer stay green.)

- [ ] **Step 6: Commit**

```bash
git add xmlui/src/components/Checkbox xmlui/src/components/RadioGroup xmlui/src/components/AutoComplete xmlui/src/components/Select
git commit -m "refactor: move internal injected vars to contextVars via dInternal, drop childInjectedVars"
```

---

## Task 5: Regenerate snapshot, repoint the snapshot test, full verification

**Files:**
- Modify (regenerate): `xmlui/src/language-server/xmlui-metadata-generated.js`
- Modify: `xmlui/tests/components-core/optimization/snapshot-optimizer-fields.test.ts`

- [ ] **Step 1: Regenerate the snapshot**

Run: `npm --prefix xmlui run build:xmlui-metadata && npm --prefix xmlui run gen:langserver-metadata`
Expected: snapshot rewritten; core components now have the injected vars under
`contextVars` and no `childInjectedVars`.

- [ ] **Step 2: Repoint `snapshot-optimizer-fields.test.ts` from `childInjectedVars` to `contextVars`**

The earlier regression test asserted `childInjectedVars`; core components no longer
have it. Replace the data-assertion block so it checks `contextVars` keys instead:

```typescript
  const cases: Array<[string, string[]]> = [
    ["Table", ["$item", "$itemIndex", "$cell", "$colIndex", "$row", "$rowIndex"]],
    ["Tree", ["$item"]],
    ["Tabs", ["$header"]],
    ["Checkbox", ["$checked", "$setChecked"]],
    ["RadioGroup", ["$checked", "$setChecked"]],
    ["Markdown", ["$anchorId", "$anchorHref"]],
  ];

  it.each(cases)("%s injects its vars via contextVars (build-time path)", (comp, expected) => {
    const entry = snapshot[comp];
    expect(entry, `snapshot missing entry for ${comp}`).toBeDefined();
    const keys = Object.keys(entry.contextVars ?? {});
    for (const v of expected) {
      expect(keys, `${comp}.contextVars keys`).toContain(v);
    }
    // childInjectedVars must be gone for core components
    expect(entry.childInjectedVars ?? []).toEqual([]);
  });
```

Leave the behavioral `describe.skipIf` block as-is — it already uses the pristine
snapshot lookup and asserts `$item` does not bubble; it still passes because the
optimizer reads `contextVars` keys.

- [ ] **Step 3: Verify internal vars are filtered from docs output**

Run: `node -e "const m=require('./xmlui/src/language-server/xmlui-metadata-generated.js').default; const c=m.Checkbox.contextVars; console.log('checked.isInternal=', c['\$checked']?.isInternal, '| setChecked.isInternal=', c['\$setChecked']?.isInternal)"`
Expected: both `isInternal= true` — confirming the docs generator will exclude
them (it filters `!v.isInternal`).

- [ ] **Step 4: Full test + guard sweep**

Run: `npm --prefix xmlui run test -- tests/components-core/optimization && npm --prefix xmlui run check:metadata && npm --prefix xmlui run check:metadata-snapshot`
Expected: all PASS; the snapshot drift guard (from the previous plan) is clean
(exit 0).

- [ ] **Step 5: Commit**

```bash
git add xmlui/src/language-server/xmlui-metadata-generated.js xmlui/tests/components-core/optimization/snapshot-optimizer-fields.test.ts
git commit -m "fix: regenerate snapshot for contextVars single-source; repoint regression test to contextVars"
```

---

## Final verification & acceptance

- [ ] **No core component still declares `childInjectedVars`**

Run: `grep -rl "childInjectedVars" xmlui/src/components | grep -v metadata-helpers`
Expected: no output (extension packages under `packages/` and `metadata-helpers.ts`/`ComponentDefs.ts` type defs may still reference it — that is intended).

- [ ] **Acceptance criteria**
  1. Every core injected var is declared in `contextVars` (public `d`, internal `dInternal`); `childInjectedVars` removed from all 20 core components. ✓ (Tasks 2–4)
  2. Tightened `renderer-metadata-drift` test fails on an undocumented injected var and passes after migration. ✓ (Task 1 + per-bucket green)
  3. Internal vars (`$checked`, `$setChecked`, `$selectedValue`, `$inTrigger`) carry `isInternal: true` and are filtered from docs. ✓ (Task 4 / Task 5 Step 3)
  4. Optimizer still narrows correctly via the snapshot (behavioral test green). ✓ (Task 5)
  5. `check:metadata-snapshot` guard clean; `unstableChildInjectedVars` and extension-package `childInjectedVars` untouched. ✓

## Self-review notes (for the implementer)
- If the drift worklist (Task 1 Step 2) names a component **not** in Buckets B/C
  (e.g. a static renderer var missed by this plan), treat it like Bucket C: add a
  `d()`/`dInternal()` entry and remove `childInjectedVars`. The test, not this
  list, is the source of truth.
- Callback-`contextVars` components (e.g. Checkbox) are not oracle-enforced by the
  drift test; their migration correctness is confirmed by `computedUses` +
  snapshot behavioral tests instead.
- Do not touch `unstableChildInjectedVars` handling in `computedUses.ts` or the
  `OptimizerInput` type — it remains a supported, separate concept.
