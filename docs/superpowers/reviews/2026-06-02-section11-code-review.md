# Code Review — §11 Cross-`.xs` Import Resolution (dev-mode global narrowing)

**Date:** 2026-06-02
**Branch:** `yurii/computedUses`
**Scope reviewed:**
- `xmlui/src/components-core/StandaloneApp.tsx` (dev/inline import-resolution path)
- `xmlui/src/parsers/scripting/code-behind-collect.ts` (`hasUnresolvableImports` flag)
- `xmlui/src/components-core/optimization/computedUses.ts` (whitespace only)
- tests (`computedUses.test.ts`, `standalone-import-resolution.test.ts`)

**Verdict:** Functionally correct and safe. No blocking bugs. Several maintainability and performance items worth addressing before this pattern spreads further. The most important is structural duplication (the dev path is now the **third** near-identical copy of the same resolve-then-recompute block).

---

## Severity Legend
- 🔴 **High** — correctness risk or latent bug
- 🟠 **Medium** — maintainability / performance debt that will compound
- 🟢 **Low** — cosmetic, defensive, or nice-to-have
- ⚪ **Info** — design note / non-local invariant to be aware of

---

## 🟠 M1 — `MetadataHandler` literal duplicated three times (DRY / hardcode)

`StandaloneApp.tsx` now constructs the same 5-field `MetadataHandler` object literal in **three** places:
- line ~1250 (new dev/inline block)
- line ~1764 (schedule/reload block)
- line ~1848 (`metadataHandler`)

```ts
const wrappedMetadataHandler: MetadataHandler = {
  componentRegistered: (comp) => metadataProvider.getComponent(comp) !== null,
  getComponentProps:   (comp) => metadataProvider.getComponent(comp)?.getMetadata()?.props || {},
  getComponentEvents:  (comp) => metadataProvider.getComponent(comp)?.getMetadata()?.events || {},
  acceptArbitraryProps: () => true,
  getComponentValidator: () => null,
};
```

The hardcoded `acceptArbitraryProps: () => true` / `getComponentValidator: () => null` are copy-pasted verbatim. A divergence between copies (e.g. one path tightening `acceptArbitraryProps`) would be a silent behavior split.

**Recommendation:** Extract `createMetadataHandler(metadataProvider): MetadataHandler` once and call it from all three sites. Also note `getComponent(comp)` is invoked up to **3×** per call inside one handler — memoize the lookup inside the factory.

---

## 🟠 M2 — `resolve → recompute` block duplicated (dev path = 3rd copy)

The new dev block (lines ~1257-1272) is structurally identical to the schedule/reload block (lines ~1771-1780):

```ts
const resolvedAny = await collectImportsFromStandaloneSources(appDef, projectCompilation, handler);
if (resolvedAny) {
  computeUsesForTree(appDef.entryPoint as ComponentDef, resolveOptimizerMetadata, appGlobalNames);
  appDef.components?.forEach((c) => c.component &&
    computeUsesForTree(c.component, resolveOptimizerMetadata, appGlobalNames));
}
```

This is the same shape as the authoritative pass in `resolveRuntime` (lines ~780/811). Three copies of "walk entryPoint + every compound.component through `computeUsesForTree`" will drift.

**Recommendation:** Extract `recomputeUsesForApp(appDef, resolveOptimizerMetadata, appGlobalNames)` and reuse it in all three places (including the authoritative pass).

---

## 🟠 M3 — Double tree traversal: first `computeUsesForTree` pass is wasted for imported-code components

Flow today:
1. `resolveRuntime` runs `computeUsesForTree` on the whole tree (lines 780/811) — but components with cross-`.xs` imports still have `hasUnresolvableImports = true`, so their narrowing is **suppressed** (the optimizer bails for those subtrees).
2. The new dev block resolves imports, then runs `computeUsesForTree` **again** over the entire tree.

So for any app with cross-`.xs` imports, the first full traversal produces throw-away results for the imported subtrees, and the second traversal redoes the entire tree (not just the resolved subtrees). On `myworkdrive` (~35 containers) that is two full passes per load.

It is guarded by `lastImportResolutionKeyRef` so it runs once per input change, not per render — so this is **not** a hot-path regression. But it is avoidable work.

**Recommendation (optional):** Either (a) skip the first pass for subtrees flagged `hasUnresolvableImports`, or (b) make the second pass recompute only the subtrees that were actually resolved (see M4).

---

## 🟢 L4 — `resolvedAny` is app-global → recomputes the whole tree even if 1/N components resolved

`collectImportsFromStandaloneSources` returns a single boolean. If even one component resolves, the dev block recomputes **entryPoint + every compound.component**, including those that never had imports.

`computeUsesForTree` is idempotent so this is **correct**, just wasteful. For an app where 1 of 35 components imports cross-`.xs`, all 35 trees are re-walked.

**Recommendation (optional):** Have the resolver return the set of resolved roots and recompute only those. Low priority unless tree sizes grow.

---

## ⚪ I5 — `hasUnresolvableImports = false` is correct but rests on a non-local invariant

`code-behind-collect.ts` sets, unconditionally after a successful `ModuleLoader.loadFromSource`:

```ts
// Since we are in the WithImports version and ModuleLoader succeeded,
// we have resolved the imports encountered in collectStatementFromModule.
result.hasUnresolvableImports = false;
```

I traced this: `loadFromSource` → `parseWithImports` → `fetcher`. The standalone `moduleFetcher` **throws** on a missing module (`if (!response.ok) throw`), which propagates to `loadFromSource`'s `catch` → returns `err`. So `ok: true` **does** guarantee every transitive import was fetched and parsed. The `= false` is therefore sound.

**The fragility:** this correctness depends entirely on *every* fetcher throwing on missing modules. A future fetcher that returns `""` (or a sentinel) instead of throwing would make `ok: true` coexist with an unresolved import, and `= false` would then **wrongly re-enable narrowing** — the exact class of render-time bug Task 5 was created to prevent.

Also note the sources-map fetcher: `if (sources[modulePath]) return sources[modulePath]` uses a truthy check, so an empty-string source entry falls through to network `fetch`. Edge case, unlikely, but it means a legitimately-empty module is treated as "not in sources."

**Recommendation:** Document the invariant at the assignment site ("relies on fetcher throwing on missing modules") and/or assert it in `parseWithImports`. Change the sources-map check to `modulePath in sources` to handle empty modules.

---

## 🟢 L6 — Repeated `appDef.entryPoint as ComponentDef` cast; no `entryPoint` null guard

The dev block casts `appDef.entryPoint as ComponentDef` and passes it straight to `computeUsesForTree`. There is an `if (!appDef) throw` guard above, but not `if (!appDef.entryPoint)`. A malformed app with `appDef` present but `entryPoint` undefined would reach `computeUsesForTree(undefined, ...)`.

**Recommendation:** Narrow once (`const entryPoint = appDef.entryPoint as ComponentDef; if (!entryPoint) return;`) and reuse — also removes one of the repeated casts.

---

## 🟢 L7 — `componentRegistered` uses `!== null` but `getComponent` may return `undefined`

```ts
componentRegistered: (comp) => metadataProvider.getComponent(comp) !== null,
```

If `getComponent` can return `undefined` (the other handler fields use `?.`, implying it can), then `undefined !== null` is `true` — an unregistered component would be reported as registered. Use `!= null` (loose) or `Boolean(getComponent(comp))`.

---

## 🟢 L8 — Whitespace-only noise in the diff

- `computedUses.ts`: the only working-tree change is a single added blank line (~line 503). No functional content.
- `StandaloneApp.tsx`: a stray blank line added before `return;` (~line 1314).

**Recommendation:** Drop these from the commit to keep the diff signal-clean.

---

## ⚪ I9 — Performance: `clearAllModuleCaches()` per component forces re-parse of shared modules

`collectCodeBehindFromSourceWithImports` calls `clearAllModuleCaches()` on entry, and `collectImportsFromStandaloneSources` resolves components **sequentially** (comment C4: "Sequential execution because this clears global caches").

Consequence: if 10 components each `import` the same `utils.xs`, that shared module is fetched+parsed **10 times** — the cache is wiped between each component. Complexity is O(components × shared-modules) instead of O(unique-modules), and the global-cache design forbids parallelizing the awaits.

This is pre-existing (not introduced here) but the dev path now exercises it on every dev load. Worth a tracked follow-up: a resolution-scoped cache (cleared once per resolution pass, not per component) would allow both memoization and parallelism.

---

## ✅ What's done well

- **Fail-safe error handling.** The `catch` in `resolveForComponent` leaves `hasUnresolvableImports = true` (narrowing stays disabled) on any failure — correct fail-closed posture for a performance optimization.
- **Task 5 fix is right.** Propagating `resolved.hasUnresolvableImports` (instead of force-`false`) and setting `hasUnresolvableImports: true` on `loadResult` failure correctly blocks narrowing when resolution genuinely fails.
- **Idempotency-based memo guard** (`lastImportResolutionKeyRef`) prevents the expensive resolve+recompute from re-running on unrelated re-renders.
- **Comment quality** (C1–C4, M2–M3, H1) explains the non-obvious sequencing and merge-precedence decisions.

---

## Suggested priority order
1. **M1 + M2** — extract `createMetadataHandler` and `recomputeUsesForApp`; collapses three copies into one each. Highest leverage, removes the drift risk.
2. **I5** — document/assert the fetcher-throws invariant; fix the `in sources` check.
3. **L6 / L7 / L8** — quick defensive + cleanup pass.
4. **M3 / L4 / I9** — performance follow-ups; track but not blocking.
