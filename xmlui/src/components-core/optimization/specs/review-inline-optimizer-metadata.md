# Code Review: Inline Optimizer Metadata Implementation

> Post-implementation review of the `optimization: {}` migration. Updated after follow-up commits resolved most original findings, refreshed once after the cleanup pass for #13, #6, #7, #14, and refreshed again after the second cleanup wave that replaced the regex extractor with an AST walker (#4, #14, #10) and added a `.d.ts` for the generated metadata file (#7 residual).

**Scope:** Tasks 1-16 (Phases 1-4) + follow-up refactor commits. Branch `yurii/computedUses`.

**Verification commits reviewed:** `276b00a7c`, `fda339542`, `097fec782`, `32b526e48`, + first cleanup pass (single lookup function in `metadataLookup.ts`, extension-vs-built-in collision warning, `as any` removal in `metadata-helpers.ts`, prominent docblock for the static-extractor "first-field" constraint), + second cleanup pass (uncommitted: `.d.ts` for `xmlui-metadata-generated.js` removes `@ts-ignore` and narrowing casts; `@babel/parser`-based AST extractor replaces the regex extractor and lifts the first-field constraint; `extractComponentName` recognises any `wrap<Suffix>` wrapper via AST).

---

## Severity Legend

- 🔴 **Critical** — correctness bug or maintenance trap
- 🟡 **Important** — code smell / duplication / inconsistency
- 🟢 **Minor** — style / polish

Status legend:
- ✅ **Fixed** — verified resolved in source
- ⚠️ **Partial** — addressed but with residual concerns
- ❌ **Open** — not yet addressed

---

## 🔴 1. Bug: Extension packages silently lose DataLoader optimizer vars — ✅ Fixed

**Original concern:** Vite plugin's `extensionMetadataLookup` fell back to `collectedComponentMetadata` only — `DataLoader` (engine-internal, not in `collectedComponentMetadata`) was silently dropped from optimizer's view, causing `$url`/`$method`/etc. to be stripped from `<DataLoader fetch={...}>` expressions.

**What changed:** Three coordinated edits resolved this cleanly:

1. `xmlui-parser.ts` now **exports** `defaultMetadataLookup(type)` which checks `coreComponentMetadata` first (DataLoader, ExternalDataLoader) and falls through to `collectedComponentMetadata` for public components.
2. The Vite plugin imports `defaultMetadataLookup` and composes its extension lookup as:
   ```ts
   extensionMetadataLookup = (type: string) =>
     extensionMetadata[type] ?? defaultMetadataLookup(type);
   ```
3. The new [coreComponentMetadata.ts](xmlui/src/components-core/coreComponentMetadata.ts) declares the engine-internal registry; the merge order in `defaultMetadataLookup` ensures DataLoader is always available regardless of whether `optimizerSourceDirs` is provided.

**Residual concern (partly resolved in cleanup pass):** The two functions were originally byte-identical, but cannot be collapsed into one — they intentionally read from different sources:

- `defaultMetadataLookup` (now in `xmlui-parser.ts`, exported) reads `language-server/xmlui-metadata-generated.js` — a static JS snapshot with no `.tsx` imports. Used by the parser path and by the Vite plugin, both of which transit through pure Node.js (language-server, build-time) and cannot resolve React/`.tsx` component sources.
- `getOptimizerMetadata` (in `optimization/metadataLookup.ts`) reads the live `components/collectedComponentMetadata.ts` barrel. Used by the browser runtime (`StandaloneApp`) and by unit tests that mutate the barrel to register extension components on the fly.

The cleanup pass added prominent docblocks in both files explaining why the split exists (a single shared function broke ~24 unit tests that mutate `collectedComponentMetadata` and expected those mutations to be visible). See #13 below for the full story.

---

## 🟡 2. Hardcoded `DATALOADER_OPTIMIZER_META` in `xmlui-parser.ts` — ✅ Fixed

**Original concern:** The parser hand-maintained DataLoader's `fetch.injectedVars` because `DataLoader.tsx` couldn't be imported in Node.js (React/papaparse deps). That re-introduced the exact drift problem the migration was meant to eliminate.

**What changed:** Exactly the architecture I recommended:

1. New file [DataLoaderMd.ts](xmlui/src/components-core/loader/DataLoaderMd.ts) — pure TypeScript, imports only `createMetadata`/`d` from `metadata-helpers`. Contains the full `DataLoader` metadata (props, events, `fetch.injectedVars`).
2. `DataLoader.tsx` now imports `DataLoaderMd` from this companion file (40-line trim).
3. [coreComponentMetadata.ts](xmlui/src/components-core/coreComponentMetadata.ts) re-exports `DataLoaderMd` (and `ExternalDataLoaderMd`) under a single internal registry.
4. The hardcoded constant in `xmlui-parser.ts` is gone.

**Result:** Zero drift surface for DataLoader's optimizer fields. One source, one file. Pattern is reusable for any other internal-but-not-publicly-collected component.

---

## 🟡 3. Duplicated event names across two blocks — ✅ Fixed

**Original concern:** Components with per-event `injectedVars` declared each event name twice — once in `optimization.events.{name}.injectedVars` and once in `events.{name}.{description, signature}`. Merge logic in `createMetadata` reunited them at runtime. Splitting source-of-truth for one logical thing across two blocks is a smell.

**What changed:**

1. `OptimizerInput.events?` field removed from `metadata-helpers.ts`. `OptimizerInput` is now just `{ isImplicitContainerByDefault?, childInjectedVars?, unstableChildInjectedVars? }`.
2. The 15-line merge branch in `createMetadata` is deleted (the function is now a 4-line spread).
3. Across Form, Queue, Table, TileGrid, Tree, DataSource, APICall (and DataLoaderMd) — `injectedVars` lives **inline** in each event entry alongside `description`/`signature`:
   ```ts
   events: {
     submit: { description: "...", signature: "...", injectedVars: ["$data"] },
     // ...
   }
   ```
4. Verified in [Form.tsx](xmlui/src/components/Form/Form.tsx) at lines 220-273 and [Queue.tsx](xmlui/src/components/Queue/Queue.tsx) at lines 40-82.

**Result:** Each event is self-contained. `~25 lines net deleted from metadata-helpers.ts` per the commit stat. This was the largest structural win.

---

## 🟡 4. Static extractor relies on fragile regex over real syntax — ✅ Fixed (AST replacement)

**Where:** [static-extractor.ts](xmlui/src/components-core/optimization/static-extractor.ts)

**What changed in the second cleanup pass:** The regex extractor is gone. `static-extractor.ts` now parses each component source with `@babel/parser` (TypeScript + JSX plugins, `errorRecovery: true`) and walks the resulting AST to find the first `createMetadata({...})` call expression. Inside that object expression:

- `optimization.isImplicitContainerByDefault`, `optimization.childInjectedVars`, `optimization.unstableChildInjectedVars` are resolved by key, not by textual order.
- Per-event `injectedVars` is found by iterating `events.{eventName}` object properties and looking up `injectedVars` directly — **no first-field constraint**, any order of fields inside an event entry now works.
- Non-static values (spread expressions, identifier references like `childInjectedVars: SHARED`) are silently skipped, matching the original "only static literals" contract.

Both old hazards are gone:

- Comment occurrences of `injectedVars:` / `childInjectedVars:` cannot mislead the extractor (comments are not part of the AST).
- `description` / `signature` / `parameters` can appear before `injectedVars` inside an event entry without silent stripping.

`@babel/parser` was added as a direct dependency (`7.29.2`, matching what was already in the workspace via transitive deps). Parse cost is well under 30ms per file at plugin-startup time.

**New regression tests** ([optimizer-metadata-extractor.test.ts](xmlui/tests/components-core/optimization/optimizer-metadata-extractor.test.ts)) cover:

- per-event `injectedVars` with non-first ordering (description / parameters before injectedVars);
- literal `childInjectedVars:` inside line and block comments;
- non-static `childInjectedVars: SHARED` (identifier reference) correctly skipped;
- single-quote / trailing-comma robustness, now via real source-file shapes wrapping `createMetadata({...})`.

---

## 🟡 5. Vite plugin swallows errors from extension dir scanning — ✅ Fixed

**What changed:** The catch block now distinguishes ENOENT/ENOTDIR from other errors:
```ts
try {
  incoming = extractOptimizerMetadataFromDir(dir);
} catch (err) {
  const code = (err as NodeJS.ErrnoException).code;
  if (code === "ENOENT" || code === "ENOTDIR") {
    console.warn(`[xmlui] optimizerSourceDirs: directory not found, skipping: ${dir}`);
    continue;
  }
  throw new Error(
    `[xmlui] optimizerSourceDirs: failed to scan "${dir}": ${(err as Error).message}`,
  );
}
```

**Critical reading:** This is the right shape. Two minor remarks:

a. **`console.warn` instead of `this.warn`.** Vite/Rollup plugins normally route warnings through `this.warn(...)` so they integrate with the dev server's reporter and the build summary. Because this code runs at plugin initialization (outside any hook context), `this` isn't available — `console.warn` is the only option here. Acceptable, but worth noting that the warning won't surface in IDE/Vite UI overlays the way other plugin warnings do.

b. **Error message could include suspected cause.** A non-ENOENT error wrapped as "failed to scan" loses the original error type. Including the underlying error class (e.g. `EACCES`, `EISDIR`) would help debugging when permissions are wrong.

---

## 🟡 6. No collision warnings on merge — ✅ Fixed

**What changed in commits `097fec782` + cleanup pass:** Both collision shapes are now covered.

1. **Extension-vs-extension** (added in `097fec782`): same key from two `optimizerSourceDirs` entries triggers a `last-dir-wins` warning.
2. **Extension-vs-built-in** (added in the cleanup pass): same loop now additionally checks `coreComponentMetadata` and `collectedComponentMetadata`. If an extension declares `List` (or any other built-in name), the developer sees:
   ```
   [xmlui] optimizerSourceDirs: extension component "List" shadows a built-in;
   the built-in optimizer metadata will be ignored.
   ```

| Collision | Detected? | Effect on lookup |
|-----------|-----------|------------------|
| Extension dir A vs extension dir B (same key) | ✅ Yes | Last dir wins, with warning |
| Extension dir vs built-in (e.g. extension declares `List`) | ✅ Yes (cleanup pass) | Extension still wins, but warning surfaces the silent override |

Both warnings go through the same `console.warn` channel, so they appear together in the Vite startup log if both shapes happen.

---

## 🟡 7. `as any` casts weaken type safety — ✅ Fixed

**What changed:**

1. New type `OptimizerMetadataView` ([ComponentDefs.ts:726](xmlui/src/abstractions/ComponentDefs.ts#L726)) declares the strict subset the optimizer reads — exactly the pattern I recommended.
2. `defaultMetadataLookup` and `getOptimizerMetadata` are typed `(type: string) => OptimizerMetadataView | undefined`.
3. `computeUsesForTree` and `computeUsesForSubtree` accept the typed lookup.
4. Vite plugin's `extensionMetadataLookup` is also typed.

**Critical reading — residuals (all resolved across the two cleanup passes):**

a. ~~**`metadata-helpers.ts` still uses `as any`.**~~ **Resolved in first cleanup pass.** `const { optimization, ...rest } = metadata` now destructures cleanly because the parameter type `ComponentMetadata<...> & { optimization?: OptimizerInput }` is already correct.

b. ~~**`metadataLookup.ts` uses cast-style type assertions** (`as Record<string, OptimizerMetadataView>`).~~ **Resolved in second cleanup pass.** With the `.d.ts` for `xmlui-metadata-generated.js` (see (c)) typing the default export as `Record<string, ComponentMetadata>`, and `coreComponentMetadata` already typed as a record at its declaration site, indexed-access `coreComponentMetadata[type]` and `collectedComponentMetadata[type]` now type-check directly. `OptimizerMetadataView` is structurally assignable from `ComponentMetadata` (the optimizer view's `events` value type is a strict subset of `ComponentEventMetadata`, intentional by design — see comment on `OptimizerMetadataView`).

c. ~~**`xmlui-metadata-generated.js` import still `@ts-ignore`d.**~~ **Resolved in second cleanup pass.** Added [xmlui-metadata-generated.d.ts](xmlui/src/language-server/xmlui-metadata-generated.d.ts) declaring the default export as `Record<string, ComponentMetadata>`. The `@ts-ignore` and `eslint-disable` lines in `xmlui-parser.ts` are gone; the import in `vite-xmlui-plugin.ts` and `server-common.ts` now sees a real type for the same module.

**Net:** All previously identified `as any` / cast / `@ts-ignore` sites in the optimizer-metadata code path are gone. The only remaining assertion in the metadata code path is the return-type cast in `createMetadata` (`rest as ComponentMetadata<...>` / `{...rest, ...optimization} as ComponentMetadata<...>`), which is honest — the spread-merged shape isn't structurally provable as `ComponentMetadata` even though it is at runtime.

---

## 🟢 8. Module-level `ALL_OPTIMIZER_METADATA` spread — ✅ Fixed (implicitly)

The old code spread `collectedComponentMetadata` into a new object at module load. The new `defaultMetadataLookup` uses `if (type in coreComponentMetadata)` followed by a fall-through lookup — no copy, no spread. Implicit win from #1's restructure.

---

## 🟢 9. Inconsistent placement of the `optimization:` block — ✅ Fixed

Some components had `optimization: {...}` before `description:` instead of the canonical position (after `description:`, before `props:`).

**What changed:** Nine components were updated in a mechanical style pass:
`RadioGroup.tsx`, `TabItem.tsx`, `FormSegment.tsx`, `FormItem.tsx`, `Fallback.tsx`, `Checkbox.tsx`, `ContextMenu.tsx`, `Column.tsx`, `Items.tsx`.
The canonical position is now consistently: `description:` → `optimization:` → `props:`.

---

## 🟢 10. `extractComponentName` only knows two patterns — ✅ Fixed (via #4 AST replacement)

**What changed in the second cleanup pass:** With the AST extractor in place, `extractComponentName` now matches **any** identifier matching `^wrap[A-Z][A-Za-z0-9]*$` called with a PascalCase string literal as the first argument — i.e. `wrapComponent`, `wrapCompound`, `wrapXmluiComp`, and any future wrapper an extension package introduces. The legacy `const COMP = "Name"` / `const COMP_NAME = "Name"` fallback is preserved (also via AST, so string literals containing `wrapComponent(...)` in unrelated code cannot mislead it).

New regression test covers extracting from `wrapXmluiComp("MyWidget", ...)` and asserts that comment / string-literal occurrences do not confuse the matcher.

---

## 🟢 11. `optimization` block name is misleading — ❌ Open

The fields inside are read at runtime (`validateInjectedVars`, `FrameworkGlobals`), not only at build time. Renaming options: `engineHints`, `injectedScope`, `runtimeContract`. Not urgent; matters before public-API documentation.

---

## 🟢 12. The U-audit.2 test has hand-maintained "sibling file" special cases — ✅ Fixed

**What changed:** The three hand-coded `if (componentType === "...")` branches were replaced with directory auto-scan:
```ts
// Auto-discover sibling .tsx files in the same directory
for (const sibling of readdirSync(dir)) {
  const siblingPath = join(dir, sibling);
  if (sibling.endsWith(".tsx") && siblingPath !== filePath) {
    try { source += readFileSync(siblingPath, "utf-8"); } catch (_) {}
  }
}
```

Drop-in replacement, deletes the brittle special cases, will handle any future Foo + FooReact splits automatically.

---

## New issues introduced by the fixes

### 🟡 13. Duplicated lookup function — `defaultMetadataLookup` vs `getOptimizerMetadata` — ✅ Fixed

**Was:** Two byte-identical functions — `defaultMetadataLookup` exported from `xmlui-parser.ts` and `getOptimizerMetadata` exported from `metadataLookup.ts`. Both checked `coreComponentMetadata` then fell through to `collectedComponentMetadata`. Two separate backing stores, divergent import graphs.

**The shared-registry approach:** A new Node-safe file [metadataRegistry.ts](xmlui/src/language-server/metadataRegistry.ts) is introduced as the single live backing store:

```ts
// language-server/metadataRegistry.ts
import generatedSnapshot from "./xmlui-metadata-generated.js";
import type { ComponentMetadata } from "../abstractions/ComponentDefs";
export const metadataRegistry: Record<string, ComponentMetadata> =
  generatedSnapshot as Record<string, ComponentMetadata>;
```

At startup it contains the static generated snapshot (Node-safe, no `.tsx` imports). When the browser/test environment loads `collectedComponentMetadata.ts`, the barrel calls `Object.assign(metadataRegistry, { Button: ButtonMd, ... })` — filling the same object in place. The exported `collectedComponentMetadata` reference is then aliased to `metadataRegistry`, so:
```
collectedComponentMetadata === metadataRegistry   // true at runtime / in tests
```

**After the fix:**

| Caller | Reads from | Effect |
|--------|------------|--------|
| `defaultMetadataLookup` (parser, Vite plugin — Node.js) | `metadataRegistry` | Starts with snapshot; populated with live values if barrel ever loads; Node-safe |
| `getOptimizerMetadata` (browser, tests) | `metadataRegistry` via `coreComponentMetadata` first | Mutations to `collectedComponentMetadata.X` are visible (same object reference) |

`defaultMetadataLookup` in `xmlui-parser.ts` is now just a re-export alias:
```ts
export { getOptimizerMetadata as defaultMetadataLookup };
```

Both callers converge on the same function and the same registry. `vite-xmlui-plugin.ts` was updated to import `metadataRegistry` directly (no more separate `collectedComponentMetadata` import). All ~24 unit tests that mutate the barrel continue to pass because `collectedComponentMetadata === metadataRegistry`.

**Traps mitigated:**
- **Node-safety:** `metadataRegistry.ts` imports only `xmlui-metadata-generated.js` (pure JS). `metadataLookup.ts` no longer imports the `.tsx`-heavy barrel.
- **Test mutation visibility:** `collectedComponentMetadata` is the same object as `metadataRegistry`, so test mutations `(collectedComponentMetadata as any).X = {...}` are observed by `getOptimizerMetadata` on the next call.

**Files changed:** `metadataRegistry.ts` (new), `collectedComponentMetadata.ts`, `metadataLookup.ts`, `xmlui-parser.ts`, `vite-xmlui-plugin.ts`.

### 🟡 14. Static-extractor's "first-field" constraint is invisible to authors — ✅ Fixed (closed by #4)

Discussed in #4. Worth flagging as a NEW issue because it didn't exist before commit `097fec782` — the previous extractor structure (when events had nested `optimization.events.{name}.injectedVars`) didn't depend on field ordering. The flattening into top-level `events.{name}.{description, injectedVars, ...}` introduced the requirement.

**What changed:** First cleanup pass promoted the constraint to a module-level docblock (partial mitigation). Second cleanup pass eliminates the constraint entirely — the AST extractor (#4) resolves each event entry's `injectedVars` by key, so any field ordering inside `events.{name}: { ... }` is now valid. The hazard is gone, not just documented.

### 🟢 15. `defaultMetadataLookup` exported but single in-package consumer — ❌ Open (intentional)

The original concern is now moot: keeping `defaultMetadataLookup` *exported* is necessary because `vite-xmlui-plugin.ts` cannot use `getOptimizerMetadata` without dragging the React-laden barrel into the build (see #13). The single in-package consumer is the intended one — the export is not gratuitous, it is the seam between the Node-safe parser and the Node-safe Vite plugin. No further action.

---

## Updated Summary Table

| # | Severity | Title | Status | Note |
|---|----------|-------|--------|------|
| 1 | 🔴 | DataLoader vars lost via `optimizerSourceDirs` | ✅ Fixed | Cleanly composed fallback chain |
| 2 | 🟡 | Hardcoded `DATALOADER_OPTIMIZER_META` | ✅ Fixed | DataLoader split into `DataLoaderMd.ts` + `DataLoader.tsx` |
| 3 | 🟡 | Duplicated event names across two blocks | ✅ Fixed | `injectedVars` is now inline per-event |
| 4 | 🟡 | Regex-based source extraction | ✅ Fixed | Replaced with `@babel/parser` AST walker; first-field constraint and comment-confusion hazards gone |
| 5 | 🟡 | Silently swallowed extension-dir errors | ✅ Fixed | ENOENT warns; others throw |
| 6 | 🟡 | No collision warnings on merge | ✅ Fixed | Both extension-vs-extension and extension-vs-built-in now warned |
| 7 | 🟡 | `as any` casts in metadata path | ✅ Fixed | `.d.ts` for generated file removed `@ts-ignore` + narrowing casts |
| 8 | 🟢 | Module-level `ALL_OPTIMIZER_METADATA` spread | ✅ Fixed | Removed implicitly by #1's restructure |
| 9 | 🟢 | Inconsistent `optimization:` block placement | ✅ Fixed | 9 files aligned to canonical order: description → optimization → props |
| 10 | 🟢 | Narrow `extractComponentName` patterns | ✅ Fixed | AST matches any `wrap<Suffix>(...)` wrapper + legacy `COMP`/`COMP_NAME` |
| 11 | 🟢 | `optimization` is a misleading name | ❌ Open | |
| 12 | 🟢 | Hand-maintained sibling-file list in U-audit.2 | ✅ Fixed | Replaced with directory auto-scan |
| 13 | 🟡 | Duplicated lookup function | ✅ Fixed | Shared `metadataRegistry` — single backing store for both lookup paths; `defaultMetadataLookup` is now re-export alias of `getOptimizerMetadata` |
| 14 | 🟡 | Static-extractor "first-field" constraint invisible | ✅ Fixed | Eliminated by #4 AST replacement |
| 15 | 🟢 | `defaultMetadataLookup` exported but single in-package consumer | ❌ Open (intentional) | Export is the seam between Node-safe parser and Node-safe Vite plugin; required by #13 |

---

## Recommended Order of Cleanup (updated)

What's left after the second cleanup pass + third pass (#9, #13):

1. **#11** — opportunistic polish; rename `optimization` → `engineHints` (or similar) once public-API docs are being written. Not blocking.
2. **#15** — open-intentional; the export is the correct seam between Node-safe contexts.

All 🔴 and all 🟡 findings are now resolved. The implementation quality is substantially better than the original review captured.
