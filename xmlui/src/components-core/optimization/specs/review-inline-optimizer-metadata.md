# Code Review: Inline Optimizer Metadata Implementation

> Post-implementation review of the `optimization: {}` migration. No code changes — observations + suggested refactorings only.

**Scope:** Tasks 1-16 (Phases 1-4). Branch `yurii/computedUses`.

---

## Severity Legend

- 🔴 **Critical** — correctness bug or maintenance trap
- 🟡 **Important** — code smell / duplication / inconsistency
- 🟢 **Minor** — style / polish

---

## ~~🟡 2. Hardcoded `DATALOADER_OPTIMIZER_META` in `xmlui-parser.ts`~~ ✅ DONE

**Where:** [xmlui-parser.ts](xmlui/src/components-core/xmlui-parser.ts) — ~~a hand-maintained literal~~

**Resolution:** Created [DataLoaderMd.ts](xmlui/src/components-core/loader/DataLoaderMd.ts) as a pure-TypeScript module (no React/papaparse deps) that exports `DataLoaderMd` via `createMetadata`. `DataLoader.tsx` re-exports it. `xmlui-parser.ts` now imports `DataLoaderMd` directly instead of the hardcoded constant. No drift possible.

---

## ~~🟡 3. Duplication: `events` declared in two separate blocks~~ ✅ DONE

**Where:** Form, Queue, Table, TileGrid, Tree, DataLoader, DataSource, APICall.

**Resolution:** `injectedVars` is now a first-class field on each event entry (placed first, before `description`/`signature`/`parameters`). The `optimization.events` sub-block is removed from all components. `OptimizerInput.events?` is removed from `metadata-helpers.ts`, and the per-event merge loop in `createMetadata` is deleted (~15 lines). The static extractor continues to work because `injectedVars` is placed as the first field in each event, so the back-tracking regex finds the event name without encountering nested braces.

---

## 🟡 4. Static extractor relies on fragile regex over real syntax

**Where:** [static-extractor.ts](xmlui/src/components-core/optimization/static-extractor.ts)

**Issues with the current approach:**

a. **Comments and strings can produce false matches.** A line like:
   ```ts
   // childInjectedVars: ["$old"] — removed in #1234
   ```
   …would be picked up, and `$old` would be re-injected into the optimizer's view.

b. **Multiple top-level matches are skipped.** `childInjectedVars` is extracted with `.exec()` (non-global) — only the first occurrence is read. Two declarations in one file (legitimate or accidental) would silently lose the second.

c. **Event-name back-tracking is brittle.** The regex `/(\w+)\s*:\s*\{[^{}]*$/` searches backwards from `injectedVars:` for the nearest `<word>: {`. If an event body contains an inline object literal (e.g. `parameters: {...}` then later `injectedVars: [...]`), the back-tracking would land on the wrong name.

d. **`childInjectedVars` detection is ambiguous** between the `optimization` block and any other place that happens to use the same key name (unlikely today, but the extractor is regex, not AST — it has no idea about scope).

**Fix direction:** Replace with an AST parser. `@babel/parser` or `typescript`'s own parser would let us:
- Find the `createMetadata({...})` call expression.
- Walk into its `optimization: {...}` property only.
- Read array literals as actual nodes (no false matches in comments/strings).
- Pair `injectedVars` with the *correct* enclosing event name via parent chain, not regex back-tracking.

The runtime cost (parsing ~50 .tsx files at plugin startup) is negligible compared to the rest of a Vite build. The extractor only runs once per plugin lifetime.

If full AST is overkill, at minimum the regex passes should scope to a substring of the source bounded by `optimization: {` … matching `}`, so comments outside that block can't contaminate.

---


## 🟡 7. `as any` casts weaken type safety

**Where:**
- [metadata-helpers.ts](xmlui/src/components/metadata-helpers.ts) line 43, 49, 52
- [xmlui-parser.ts](xmlui/src/components-core/xmlui-parser.ts) — `(collectedComponentMetadata as any)`, `defaultMetadataLookup(type: string): any`
- [vite-xmlui-plugin.ts](xmlui/src/nodejs/vite-xmlui-plugin.ts) — same `as any` cast

**Problem:** `metadataLookup?: (type: string) => any` discards all type information for downstream consumers. `computeUsesForTree` happens to use only `childInjectedVars`/`isImplicitContainerByDefault`/`events[*].injectedVars`, but a future addition to the optimizer would fail to type-check against the lookup signature.

**Fix direction:** Define an explicit `OptimizerMetadataView` interface (the strict subset of `ComponentMetadata` the optimizer reads) and type the lookup as `(type: string) => OptimizerMetadataView | undefined`. This documents exactly what consumers can rely on and prevents accidental coupling to unrelated metadata fields.

---


## 🟢 9. Inconsistent placement of the `optimization:` block

Some components have `optimization: {...}` *before* `props:` (e.g. App, Items, FormItem). Others have it *after* `props:`. A few were fixed in a style commit but inconsistency remains in the broader codebase.

**Fix direction:** Pick one canonical position (recommendation: just below `description:`, before `props:` — keeps "what is this for the engine" near the top, "what does it expose to authors" below). Apply via a single style pass. This matters for new contributors trying to learn the pattern by example.

---

## 🟢 10. `extractComponentName` only knows two patterns

**Where:** [static-extractor.ts](xmlui/src/components-core/optimization/static-extractor.ts)

```ts
/wrap(?:Component|Compound)\s*\(\s*["']([A-Z][A-Za-z0-9]*)["']/
/const\s+COMP(?:_NAME)?\s*=\s*["']([A-Z][A-Za-z0-9]*)["']/
```

Components that register differently (e.g. `const TYPE_NAME = ...`, `wrapXmluiComp(...)`, third-party patterns) are silently skipped — the file is scanned, no name is found, the result is discarded. For extension packages with unusual registration conventions this is invisible breakage.

**Fix direction:** Add a fallback that reads from `createMetadata`'s assignment context: if `const FooMd = createMetadata({...})` is found, derive `Foo` from the variable name (strip `Md` suffix). Or document the supported patterns prominently. AST parsing (see #4) would resolve this naturally.

---

## 🟢 11. `optimization` block name is misleading

The name suggests "this is only for the build-time AST optimizer," but the same fields are read at runtime by `validateInjectedVars` (for dev-time guardrails) and by `FrameworkGlobals` (for `UNSTABLE_GLOBAL_VARS`). They're not just optimizer hints — they describe what variables the component **injects** into child/handler scope.

**Fix direction:** Consider renaming the source-file key. Options:
- `engineHints` — emphasises framework-internal use
- `injectedScope` — emphasises *what* (a scope of injected vars)
- `runtimeContract` — emphasises *contract* (binding obligation)

`optimization` is fine as a working name; nothing about it actively breaks. But if we ever document this API publicly, the name will need to change to reflect that the data has runtime semantics, not just optimizer semantics.

---

## 🟢 12. The U-audit.2 test has hand-maintained "sibling file" special cases

**Where:** [renderer-metadata-drift.test.ts](xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts) lines 224-235

```ts
if (componentType === "Table" || componentType === "Column") { /* read TableReact.tsx */ }
else if (componentType === "RadioGroup") { /* read RadioGroupReact.tsx */ }
else if (componentType === "Checkbox") { /* read Toggle.tsx */ }
```

**Problem:** Every time a component splits its rendering between `Foo.tsx` and a sibling file, this test silently fails to find string literals — *unless* someone remembers to add the sibling to this hand-coded list. This is the same drift problem the inline migration was meant to solve, just at the test level.

**Fix direction:** Auto-discover sibling files. For a given `Foo/Foo.tsx`, scan all `.tsx` files in `Foo/` and use them all as the haystack for string-literal checks. Drop the special-case branches.

---

## Summary Table

| # | Severity | Title | Files | Status |
|---|----------|-------|-------|--------|
| 1 | 🔴 | DataLoader vars lost via `optimizerSourceDirs` | `vite-xmlui-plugin.ts`, `xmlui-parser.ts` | |
| 2 | 🟡 | Hardcoded `DATALOADER_OPTIMIZER_META` | `xmlui-parser.ts`, `DataLoader.tsx` | ✅ Done |
| 3 | 🟡 | Duplicated event names across two blocks | all components with event `injectedVars` | ✅ Done |
| 4 | 🟡 | Regex-based source extraction | `static-extractor.ts` | |
| 5 | 🟡 | Silently swallowed extension-dir errors | `vite-xmlui-plugin.ts` | |
| 6 | 🟡 | No collision warnings on merge | `vite-xmlui-plugin.ts` | |
| 7 | 🟡 | `as any` casts in metadata path | `metadata-helpers.ts`, `xmlui-parser.ts` | |
| 8 | 🟢 | Module-level `ALL_OPTIMIZER_METADATA` spread | `xmlui-parser.ts` | |
| 9 | 🟢 | Inconsistent `optimization:` block placement | many components | |
| 10 | 🟢 | Narrow `extractComponentName` patterns | `static-extractor.ts` | |
| 11 | 🟢 | `optimization` is a misleading name | naming convention | |
| 12 | 🟢 | Hand-maintained sibling-file list in U-audit.2 | `renderer-metadata-drift.test.ts` | |

---

## Recommended Order of Cleanup

1. ~~**#1** (bug) — quick fix, no architectural change.~~ *(todo)*
2. ~~**#3** (events merge) — biggest structural win; deletes code from `metadata-helpers.ts` and removes a layer of indirection across many files.~~ ✅ Done
3. ~~**#2** (DataLoader split) — eliminates the worst remaining drift point; opens the door to dropping the hardcoded constant.~~ ✅ Done
4. **#5, #6** (Vite plugin error handling) — small, defensive, before any extension packages start using `optimizerSourceDirs` in earnest.
5. **#4** (AST extractor) — only worth doing once a real-world false-positive surfaces, or when adding more extracted fields.
6. **#7-12** — opportunistic, alongside whatever else touches those files.
