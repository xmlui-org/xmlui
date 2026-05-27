# Code Review: Inline Optimizer Metadata Implementation

> Post-implementation review of the `optimization: {}` migration. No code changes — observations + suggested refactorings only.

**Scope:** Tasks 1-16 (Phases 1-4). Branch `yurii/computedUses`.

---

## Severity Legend

- 🔴 **Critical** — correctness bug or maintenance trap
- 🟡 **Important** — code smell / duplication / inconsistency
- 🟢 **Minor** — style / polish

---

## 🟡 2. Hardcoded `DATALOADER_OPTIMIZER_META` in `xmlui-parser.ts`

**Where:** [xmlui-parser.ts](xmlui/src/components-core/xmlui-parser.ts) — a hand-maintained literal:

```ts
const DATALOADER_OPTIMIZER_META = {
  events: {
    fetch: {
      injectedVars: ["$url","$method","$queryParams","$requestBody","$requestHeaders","$pageParams"],
    },
  },
} as const;
```

**Problem:** This re-introduces the exact two-place maintenance burden the whole migration was meant to eliminate. If the DataLoader's `fetch` event ever gains/renames an injected var, a developer must update **both** [`DataLoader.tsx`](xmlui/src/components-core/loader/DataLoader.tsx) and this constant. Worse, the parser doesn't import from DataLoader.tsx (because of React/papaparse deps), so static type-checking won't catch a drift.

**Root cause:** `DataLoader.tsx` mixes pure metadata declarations with React/papaparse/toast imports, making the whole module un-importable from Node.js.

**Fix direction — split DataLoader into two files:**

```
xmlui/src/components-core/loader/DataLoaderMd.ts       ← pure TS, no React/DOM/SCSS
xmlui/src/components-core/loader/DataLoader.tsx        ← imports DataLoaderMd + React
```

`DataLoaderMd.ts` exports `DataLoaderMd` via `createMetadata({...})`. `xmlui-parser.ts` can then `import { DataLoaderMd } from "../loader/DataLoaderMd"` directly — no hardcoding, no drift. The same fix benefits `FrameworkGlobals.ts` which has the same workaround.

This pattern (split metadata from React implementation) is also the *general* solution if any other internal component needs the same treatment.

---

## 🟡 3. Duplication: `events` declared in two separate blocks

**Where:** Form, Queue, Table, TileGrid, Tree, DataLoader, DataSource, APICall — every component with per-event `injectedVars`.

Current pattern (e.g. `Form.tsx`):
```ts
optimization: {
  childInjectedVars: ["$data"],
  events: {
    willSubmit:   { injectedVars: ["$data"] },
    submit:       { injectedVars: ["$data"] },
    submitFailed: { injectedVars: ["$data"] },
    cancel:       { injectedVars: ["$data"] },
    reset:        { injectedVars: ["$data"] },
    success:      { injectedVars: ["$data"] },
  },
},
events: {
  willSubmit:   { description: "...", signature: "..." },
  submit:       { description: "...", signature: "..." },
  // ...same 6 names, repeated
},
```

**Problems:**
1. **Event names are spelled twice.** Renaming `submit` → `onSubmit` means touching two blocks, two indents apart. Easy to forget one.
2. **Mental model split.** A reader looking at the `willSubmit` event has to scroll between two distant blocks to see "what is this event + what vars does it inject?"
3. **`createMetadata` carries non-trivial merge logic** ([metadata-helpers.ts](xmlui/src/components/metadata-helpers.ts) lines 49-63) specifically to re-unite the two halves at runtime. The complexity exists only because we split them at source.
4. The U-audit.2 test has to check two structurally-different shapes (top-level `events[*].injectedVars` after the merge, and inside-`optimization` before the merge), making the test logic more involved than necessary.

**Better approach** — make `injectedVars` a first-class field on the existing event entry. The metadata for each event lives in **one** place:

```ts
optimization: {
  childInjectedVars: ["$data"],   // only field that's not per-event
},
events: {
  willSubmit:   { description: "...", signature: "...", injectedVars: ["$data"] },
  submit:       { description: "...", signature: "...", injectedVars: ["$data"] },
  submitFailed: { description: "...", signature: "...", injectedVars: ["$data"] },
  cancel:       { description: "...", signature: "...", injectedVars: ["$data"] },
  reset:        { description: "...", signature: "...", injectedVars: ["$data"] },
  success:      { description: "...", signature: "...", injectedVars: ["$data"] },
},
```

**Benefits:**
- Event names appear once.
- Each event entry is self-contained — description, signature, and runtime vars together.
- `createMetadata`'s `optEvents` merging branch disappears (~15 lines of code + their tests).
- `OptimizerInput.events?` drops out of `metadata-helpers.ts` entirely.
- The `OptimizerInput` type collapses to just `{ isImplicitContainerByDefault?, childInjectedVars?, unstableChildInjectedVars? }` — three flat booleans/arrays.
- `injectedVars` is already a documented field of `ComponentEventMetadata` (see [ComponentDefs.ts](xmlui/src/abstractions/ComponentDefs.ts)), so this is *more aligned* with the existing public API, not less.

**One concern to weigh:** mixing optimizer-relevant fields (`injectedVars`) with API-doc fields (`description`, `signature`) in the same object blurs "what is this metadata for." That's a real but small downside. The win in DRY-ness and reduced split-state complexity outweighs it, especially because `injectedVars` *describes the event's API contract* (which vars the handler receives) — it's not purely an optimizer hint.

**Migration cost:** roughly one edit per component listed above, mechanical, plus 4 lines deleted from `metadata-helpers.ts`.

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

| # | Severity | Title | Files |
|---|----------|-------|-------|
| 1 | 🔴 | DataLoader vars lost via `optimizerSourceDirs` | `vite-xmlui-plugin.ts`, `xmlui-parser.ts` |
| 2 | 🟡 | Hardcoded `DATALOADER_OPTIMIZER_META` | `xmlui-parser.ts`, `DataLoader.tsx` |
| 3 | 🟡 | Duplicated event names across two blocks | all components with event `injectedVars` |
| 4 | 🟡 | Regex-based source extraction | `static-extractor.ts` |
| 5 | 🟡 | Silently swallowed extension-dir errors | `vite-xmlui-plugin.ts` |
| 6 | 🟡 | No collision warnings on merge | `vite-xmlui-plugin.ts` |
| 7 | 🟡 | `as any` casts in metadata path | `metadata-helpers.ts`, `xmlui-parser.ts` |
| 8 | 🟢 | Module-level `ALL_OPTIMIZER_METADATA` spread | `xmlui-parser.ts` |
| 9 | 🟢 | Inconsistent `optimization:` block placement | many components |
| 10 | 🟢 | Narrow `extractComponentName` patterns | `static-extractor.ts` |
| 11 | 🟢 | `optimization` is a misleading name | naming convention |
| 12 | 🟢 | Hand-maintained sibling-file list in U-audit.2 | `renderer-metadata-drift.test.ts` |

---

## Recommended Order of Cleanup

1. **#1** (bug) — quick fix, no architectural change.
2. **#3** (events merge) — biggest structural win; deletes code from `metadata-helpers.ts` and removes a layer of indirection across many files.
3. **#2** (DataLoader split) — eliminates the worst remaining drift point; opens the door to dropping the hardcoded constant.
4. **#5, #6** (Vite plugin error handling) — small, defensive, before any extension packages start using `optimizerSourceDirs` in earnest.
5. **#4** (AST extractor) — only worth doing once a real-world false-positive surfaces, or when adding more extracted fields.
6. **#7-12** — opportunistic, alongside whatever else touches those files.
