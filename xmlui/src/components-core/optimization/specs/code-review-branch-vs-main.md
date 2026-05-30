# Code Review — `yurii/computedUses` branch vs `main`

Scope: the optimization feature delivered on this branch — `computedUses`,
`computedGlobalUses`, framework-globals filtering, the AST optimizer-metadata
extractor, standalone import resolution, and the `isStrictEnum` type-contract
change. As requested, the review is limited to the work described in
`optimization/specs/*` and the ~29 core files it touches; unrelated changes
merged in from `main` (i18n, managed-react waves, accessibility, the
scheduler/`enterRenderPhase` work in `ComponentAdapter`/`reducer`) are **out of
scope**.

Files in scope (3464 insertions, 270 deletions over the feature):
`optimization/computedUses.ts`, `optimization/static-extractor.ts`,
`optimization/validateInjectedVars.ts`, `optimization/metadataLookup.ts`,
`rendering/ContainerUtils.ts`, `rendering/ComponentWrapper.tsx`,
`rendering/ContainerWrapper.tsx`, `script-runner/visitors.ts`,
`parsers/xmlui-parser/transform.ts`, `parsers/scripting/code-behind-collect.ts`,
`StandaloneApp.tsx`, `type-contracts/{verifier,runtime,rules/enum}.ts`,
`abstractions/ComponentDefs.ts`.

Severity legend: **[H]** high · **[M]** medium · **[L]** low · **[D]** doc/cosmetic.

This review is branch-wide and stands alone. Where an item was already tracked
in the daily review (`code-review-2026-05-29.md`), it is cross-referenced and
its current status noted; items below marked **NEW** were not in that review.

---

## 1. Correctness bugs / risks

### 1.1 NEW — [M] ✅ FIXED — `for`-loop init dependencies are silently dropped in the dependency walker
`script-runner/visitors.ts:144-146`

```ts
case T_FOR_STATEMENT:
  thread.blocks!.push({ vars: {} });
  if (stmt.init) {
    stmtDeps.concat(collectDependencies([stmt.init], stmt, "for")); // result DISCARDED
  }
  if (stmt.cond) {
    stmtDeps = stmtDeps.concat(collectDependencies(stmt.cond, stmt, "for")); // assigned
  }
  ...
```

The `init` branch calls `.concat()` but does **not** assign the result, unlike
`cond`, `upd`, and `body`. `Array.prototype.concat` is non-mutating, so every
identifier referenced **only** in a `for(...)` init clause is lost from both the
`reads` and the `all` sets returned by `depsOfValueWithReads`.

Impact:
- A parent-scope variable used only in a for-init (`for (let i = startRow; i < total; i++)`)
  is omitted from `computedUses`/`computedGlobalUses` → a change to `startRow`
  does not re-render the container → **stale render**.
- A write-only assignment target appearing only in a for-init can be omitted from
  `all` → at runtime the script engine throws
  `"Left value variable not found in the scope"`.

Low frequency (for-loops over parent state inside reactive XMLUI expressions /
event handlers are uncommon), but it is a genuine analyzer hole and the kind of
bug that is invisible until a specific app hits it.

Fix: `stmtDeps = stmtDeps.concat(collectDependencies([stmt.init], stmt, "for"));`

**Resolution**: One-line fix applied in `visitors.ts`. Two regression tests added in `computedUses.test.ts` (describe block "computeUsesForTree — for-loop init dependency tracking") — both pass.

### 1.2 NEW — [M] ✅ GUARD TEST ADDED — `isStrictEnum` flip from opt-out to opt-in is not audited across components
`type-contracts/rules/enum.ts`, `type-contracts/verifier.ts:~`, `type-contracts/runtime.ts:42`

The semantics changed from *"`availableValues` present ⇒ strict closed-enum
validation"* to *"validation only fires when `isStrictEnum: true` is **also**
declared"*. This is a behavioural flip for **every** prop in the codebase that
declared `availableValues` and relied on it for validation.

The daily review (item 1.2, ✅) fixed exactly one helper — `dValidationStatus`
— and added four regression tests. But there is no systematic audit confirming
which *other* props (across all core + extension components) previously
validated and now silently accept invalid values. Any prop with
`availableValues` but no `isStrictEnum` is now permissive.

Risk: app-wide silent acceptance of out-of-enum values that used to surface as
diagnostics. Recommend an explicit audit and a guard test (see §8).

**Resolution**: 99 existing props with `availableValues` but no `isStrictEnum` are captured in an `INTENTIONALLY_PERMISSIVE` allow-list in `verifier.test.ts`. The guard test "every availableValues prop either has isStrictEnum:true or is in the allow-list" ensures any *new* prop with `availableValues` must explicitly declare `isStrictEnum:true` or be added to the allow-list. Timeout bumped from 30s → 120s to accommodate the cold-import cost of the full `collectedComponentMetadata` barrel (timed out on cold runs at 30s; consistently passes at 120s). All tests green.

### 1.3 — [M] Standalone import resolution re-runs on every effect invocation (carried over, still open)
`StandaloneApp.tsx:1711`, effect deps `[resolvedRuntime, standaloneAppDef, basePath]` at `:1762`

`resolveRuntime` is memoized (`useMemo` at `:954`), but the async
`collectImportsFromStandaloneSources` pass runs inside the effect over a freshly
rebuilt `newAppDef`. Each rebuild carries `scriptCollected.hasUnresolvableImports = true`
again, so the in-tree idempotency guard does not prevent re-fetching when
`standaloneAppDef`/`basePath` change or under React StrictMode double-invoke.
`moduleFetcher` falls back to `fetch()` (`:2107`) for any specifier not in the
`sources` map — so redundant network requests are possible.

Mitigation present: the `sources` map is consulted first, and a guarded
duplicate-compilation check exists. But the resolution itself is not memoized on
resolved-source identity. Gate it behind a ref keyed on the resolved source, or
move it into a `useMemo`/once-per-identity latch.

### 1.4 — [L] One `fileId` resolves an entire subtree (carried over, documented)
`StandaloneApp.tsx:2132-2135`, `:2146`

`walkTreeAndResolve` resolves every node in a subtree against a single `fileId`.
Documented as correct for the single-file-per-component case; relative import
specifiers (`./helpers.xs`) in a merged multi-source tree would resolve against
the wrong base. Currently a documented assumption, not an enforced invariant.

---

## 2. Performance / re-render losses

### 2.1 NEW — [M] `depsOfValueWithReads` walks every AST twice
`script-runner/visitors.ts:566-569`, `:590-595`

```ts
const all   = collectVariableDependencies(tree, {}, { includeAssignmentTargets: true });
const reads = collectVariableDependencies(tree);  // full second traversal
```

Each value (every prop, var, event handler, `when`, api entry) is parsed once
(cached) but **walked twice** to produce `all` vs `reads`. `computeUsesInternal`
fans this out across the whole tree, and `collectScriptFunctionDeps` additionally
gives every code-behind function its own independent top-level pass (a
consequence of the union-only cache, see `computedUses.ts:186-192`). Net effect:
boot-time analysis cost scales at roughly 2× the AST node count for
script-heavy apps.

This is one-time at boot (acceptable), but it grows with app size. A single walk
that returns both sets (reads + write-only targets) would halve it. Worth
measuring on the largest target app before deciding to act.

### 2.2 — [M] `narrowGlobalVars` forwards ALL Globals.xs functions into the change-detection snapshot (carried over, open)
`rendering/ContainerUtils.ts:369-373`, `ComponentWrapper.tsx:116-124`

Every function key is copied into the narrowed snapshot unconditionally
(functions "may be invoked from any expression"). The snapshot is the input to
`useShallowCompareMemoize`. If any global function's reference changes between
snapshots — even one the subtree never calls reactively — the shallow compare
breaks and the container re-renders. Function-ref stability across data-only
global snapshots is assumed but **not** verified by a test (see §8). If
`global-variables.ts` guarantees stable function identities this is harmless;
that guarantee is currently undocumented and untested.

### 2.3 — [L] Asymmetric narrowing: `StateContainer` / `useGlobalVariables` still receive ALL globals (carried over, accepted)
`ComponentWrapper.tsx:108-126`

By design, narrowing only feeds the re-render change-detection snapshot; the
full `globalVars` object is still passed downward (write targets must remain
reachable). So the optimization isolates *re-renders* but not *work inside* the
StateContainer's global-var bookkeeping. Accepted tradeoff; noted for
completeness.

---

## 3. Fragile spots

### 3.1 NEW — [M] ✅ FIXED — `hoistScriptCollectedFromFragments` detects context vars with a text regex and concatenates raw scripts
`parsers/xmlui-parser/transform.ts:1511`, `:1530`

```ts
const hasContextVarReferences = child.script != null && /\$[a-zA-Z_]/.test(child.script);
...
component.script = (component.script || "") + "\n" + (child.script || "");
```

Two fragilities:
1. **Textual heuristic over source.** Any `$identifier` *anywhere* in the raw
   script text — inside a string literal, a comment, or a `$total` price label —
   blocks hoisting (false positive → lost optimization). It cannot tell a real
   `$item` lexical reference from incidental text, because it runs on the string
   rather than the already-collected AST in `child.scriptCollected`.
2. **Script concatenation.** Merging `parent.script + "\n" + child.script`
   produces a single text blob. If parent and Fragment both declare a top-level
   name, the concatenated source contains a duplicate declaration; the
   `scriptCollected.functions`/`vars` merge resolves the object collision
   (child or parent wins), but if that concatenated `script` is ever re-parsed —
   e.g. by the import-resolution path `collectCodeBehindFromSourceWithImports`
   (`StandaloneApp.tsx:2117`) — the duplicate declaration throws.

Prefer AST-level detection (inspect `child.scriptCollected` / collected
identifiers) over a regex on source, and a structured merge that detects name
collisions rather than blind string concatenation.

**Resolution**: Replaced `/\$[a-zA-Z_]/.test(child.script)` with AST-level `scriptCollectedReadsContextVars(sc)` — walks `sc.vars[*].tree` and `sc.functions[*]` (stored directly as ArrowExpression) via `collectVariableDependencies`. Added duplicate-name collision guard before merge (skips hoisting when parent and child share a key). String-literal false-positives and collisions are now correctly handled. Four regression tests in `transform.script.test.ts` (describe block "Fragment script hoisting") — all pass.

### 3.2 — [M] Two-step `globalVarsWithStableRef` memo relies on a disabled lint rule (carried over, open)
`rendering/ComponentWrapper.tsx:125-126`

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
const globalVarsWithStableRef = useMemo(() => globalVars, [narrowedGlobalVarsForComparison ?? globalVars]);
```

The pattern is correct (return the full object, but only change its reference
when the narrow snapshot changes), but its correctness is enforced only by a
hand-disabled exhaustive-deps rule and a non-obvious invariant. There is no test
that fails if a future edit drops `globalVars` from the closure or mis-specifies
the dep. The `?? globalVars` fallback also means that when
`computedGlobalUses` is absent the memo key is the raw `globalVars` identity —
fine, but it couples two distinct code paths into one dependency expression.

### 3.3 — [L] `parse()` failures are not cached (carried over, accepted)
`optimization/computedUses.ts:33-50`, `addEvent` at `:371-394`

The AST cache stores only successful parses. An event handler whose string fails
`parse()` is re-parsed (and re-thrown/caught) on every analysis pass. Analysis
runs more than once (parse-time pass + authoritative StandaloneApp pass + import
re-resolution). Low impact, but unbounded re-parse of known-bad input.

---

## 4. Hardcoding / duplication

### 4.1 NEW (consolidated) — [L] Five hand-maintained "framework knowledge" literals that can drift
- `JS_STDLIB_GLOBALS` — `computedUses.ts:80` (with a "review every June" maintenance comment)
- `BROWSER_HOST_GLOBALS` — `computedUses.ts:134`
- `XMLUI_GLOBAL_NAMES` — imported from `appContextFactory`
- `FRAMEWORK_VARS` — `ContainerUtils.ts:197` (duplicates `metadata.contextVars` knowledge)
- `EVENT_PAYLOAD_RESERVED_NAMES` — `validateInjectedVars.ts:6`

Each encodes framework behaviour as a string list that must be kept in sync with
the real source of truth (TC39, metadata `contextVars`, the event-payload
injector). `FRAMEWORK_VARS` is the most concerning because the canonical list
already exists in component metadata; the duplicate can silently diverge when a
new framework `$var` is added. The daily review marked 4.2/4.3 as "accepted as
is" — that is reasonable short-term, but the consolidated drift surface is
larger than any single list and deserves a single documented owner/source.

### 4.2 NEW — [L] Process-global `astCache` is never reset per app
`optimization/computedUses.ts:31`

`astCache` is a module-level `Map` (LRU-bounded to 1000) keyed by raw source
text, shared across every app instance and every test in the process, never
cleared. Bounded and pure (same source ⇒ same AST), so functionally safe, but it
is undocumented global mutable state with no reset hook — surprising in a
multi-app or long-running test process.

### 4.3 — [L] Resolved (verified): `__tree_` magic offset, `addAll` boilerplate, worklist over Set-mutation
`ContainerUtils.ts:266` (`TREE_PREFIX`), `computedUses.ts:256` (`addAll`), `:355` (worklist).
The daily review's 4.1 / 4.4 / 3.3 cleanups are present and correct in the
current code.

---

## 5. Architecture & maintainability

### 5.1 — [Good] Unified container predicate
`isContainerLike` (`ContainerUtils.ts:86`) is now the single source of truth for
both runtime wrapping (`ContainerWrapper.tsx`, non-strict) and static analysis
(`computedUses.ts`, `strict: true`). This removes a long-standing duplicate
predicate. Good consolidation.

### 5.2 — [Good] AST-based optimizer-metadata extractor replaces the regex extractor
`optimization/static-extractor.ts` resolves keys positionally inside the real
`createMetadata({...})` object and ignores comments — eliminating the two
silent-stripping hazards of the prior regex version (field-order dependence;
first-textual-match inside comments). This is a real robustness win.

### 5.3 — [Good] `safeToNarrow` applied symmetrically
Both `computedUses` and `computedGlobalUses` respect the same guard
(`computedUses.ts:560`, `:590`): nodes with `hasInvalidStatements` /
`hasUnresolvableImports` are not narrowed, preventing silent loss of deps from
unparsed statements.

### 5.4 — [Good] `_narrowCache` immutability contract
The shared narrowed object is frozen in dev (`ContainerUtils.ts:390`), so an
accidental in-place mutation of a cross-container shared snapshot fails loudly
instead of corrupting siblings.

### 5.5 — [D] `ComputeUsesContext` options bag + accurate 4-tuple JSDoc
The 6-positional-parameter signature was replaced by an options object
(`computedUses.ts:264`) and the tuple JSDoc now matches the code (daily review
5.1 / 5.2, ✅).

---

## 6. Things verified correct (no action)
- Escaping-UID bubbling through implicit containers and explicit-owner capture
  (`computedUses.ts:594-613`) is internally consistent and well-documented.
- The union-only cache invariant in `collectScriptFunctionDeps` is correct *as
  used* (consumer takes the union over all top-level names) and is now explicitly
  documented (`computedUses.ts:186-192`).
- `extractScopedState` Symbol/`$`-var preservation (`ContainerUtils.ts:186-215`)
  correctly keeps component-instance state and lexical framework vars out of the
  narrowing filter.
- `narrowGlobalVars` transitive closure via index-based worklist
  (`ContainerUtils.ts:355-367`) processes each dep once and is immune to the
  set-mutation-during-iteration footgun.
- The `undefined` fast-path in `ComponentWrapper` (`:119-124`) avoids an
  O(n-globals) shallow comparison when a subtree reads no globals.

---

## 7. Missing tests worth adding (prioritized)

High value (would catch a real correctness hole):
1. ✅ **For-loop init dependency tracking** — an event handler / `.xs` function with
   `for (let i = parentVar; ...)` must list `parentVar` in `computedUses`.
   Directly exercises bug 1.1. **Done** — 2 tests in `computedUses.test.ts`.
2. ✅ **`isStrictEnum` migration guard** — a meta-test that enumerates every prop
   metadata with `availableValues` and asserts its intended `isStrictEnum`
   status (allow-list), so future `availableValues` additions can't silently
   skip validation. Covers 1.2. **Done** — guard test in `verifier.test.ts`.
3. **`computedGlobalUses` end-to-end re-render isolation** — changing a global
   NOT in `computedGlobalUses` must not re-render the container; changing one
   that IS must. Plus the transitive case (global X depends on global Y; only X
   in `uses`).

Medium value (fragility / regression guards):
4. **Standalone import resolution idempotency** — under repeated effect runs /
   StrictMode, `collectImportsFromStandaloneSources` must not re-`fetch()` an
   already-resolved module. Covers 1.3.
5. **Global-function ref stability** — assert `global-variables.ts` keeps
   function identities stable across data-only snapshots, so 2.2 cannot cause
   spurious re-renders.
6. **Two-step memo missing-dep guard** — a test that fails if
   `globalVarsWithStableRef` stops updating when `globalVars` changes (locks down
   the eslint-disabled invariant, 3.2).
7. ✅ **Fragment script hoisting** — (a) hoisting is NOT blocked by an incidental
   `$word` inside a string literal; (b) parent+Fragment scripts that declare the
   same name merge without throwing. Covers 3.1. **Done** — 4 tests in `transform.script.test.ts`.
8. **`collectScriptFunctionDeps` mutual recursion** — `a→b→a` where each reads a
   distinct parent var; assert the union recovers both deps despite the
   incomplete cached entry.

Low value (edge/robustness):
9. Parse-failure path: an event handler with invalid script doesn't crash
   analysis and degrades gracefully (and ideally isn't re-parsed every pass, 3.3).
10. `static-extractor.ts`: dynamic/spread `createMetadata` argument and
    non-literal `injectedVars` arrays are skipped without throwing.

---

## 8. Recommended priority order
1. **1.1** — fix the for-init `concat` (one line; latent stale-render / runtime throw).
2. **1.2** — audit `availableValues` props for lost strict validation; add the guard test (#7.2).
3. **1.3** — memoize/latch standalone import resolution to stop redundant fetches.
4. **3.1** — replace regex context-var detection + blind script concat with AST-level logic.
5. **2.1 / 2.2** — measure boot-time double-walk and global-function-ref churn on the largest app; act only if measurable.
6. **3.2 / 4.x** — add the memo guard test; document a single owner for the framework-knowledge literals.

Everything in §5 and §6 is sound and should be preserved as-is.
