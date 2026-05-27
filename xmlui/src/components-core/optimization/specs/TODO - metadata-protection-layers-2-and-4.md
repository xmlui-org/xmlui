# TODO: Metadata Protection — Layer 2 (Static AST Audit) + Layer 4 (Runtime Hard-Fail)

**Status:** Layer 4 ✅ Done (2026-05-21). Layer 2 ✅ Done.
**Overall:** Layer 4 (Runtime Hard-Fail) повністю реалізовано — `validateInjectedVars` кидає `throw` в DEV (`import.meta.env?.DEV`) і `console.error` в production. Layer 2 (Static AST Audit) повністю реалізовано.
**Created:** 2026-05-21
**Related specs:**
- [2026-05-21-lexical-scoping-code-review.md](./2026-05-21-lexical-scoping-code-review.md)
- [TODO-metadata-validation.md](./TODO-metadata-validation.md) (earlier research)

---

## Background

After SSOT migration (§12 of code review), `OPTIMIZER_METADATA` is the canonical registry for all optimizer-relevant metadata (`childInjectedVars`, `events[*].injectedVars`). Components in `xmlui/src/components/**/*.tsx` import from it instead of duplicating values.

Two execution paths consume the registry:
1. **Standalone (runtime)** — browser, React rendering, `lookupOptimizerMetadata` wired in `StandaloneApp.tsx`.
2. **Vite plugin (build-time)** — Node.js, no React, `lookupOptimizerMetadata` wired in `xmlui-parser.ts`.

### Protection gap

Today the only protection against developer drift between **what the React renderer actually injects** and **what `OPTIMIZER_METADATA` declares** is:
- `validateInjectedVars` in `ComponentAdapter.tsx` and `wrapComponent.tsx` → DEV-mode `console.error` (easy to miss)
- U-audit.1 test → catches inline-literal divergence in `.tsx` files, but only at test time

Neither covers:
- Scenario A: developer adds `$newVar` to `<ScopeProvider vars={{...}}>` in renderer but forgets to update registry
- Scenario B: developer creates a new component with child-scope but forgets to add a registry entry
- Scenario D: developer removes a variable from the renderer but forgets to update registry

Vite plugin path is fully unprotected (runs in Node.js, can't introspect React).

---

## Goal

Add **two complementary protection layers** that together cover all listed scenarios for both Vite plugin and standalone paths:

- **Layer 2 (static AST audit)** — CI-enforced test that statically analyzes component source files and compares to registry. Universal: works regardless of runtime.
- **Layer 4 (runtime hard-fail)** — convert existing DEV-mode `console.error` to `throw`. Makes silent failures impossible to ignore during development.

---

## Layer 2: U-audit.2 — Static String-Literal Presence Check

### What it does

A vitest test that, for every entry in `OPTIMIZER_METADATA` with a non-empty `childInjectedVars`:

1. Locates the corresponding component source file (`xmlui/src/components/<Name>/<Name>.tsx` or `*React.tsx`).
2. For each `$var` in `OPTIMIZER_METADATA[type].childInjectedVars` (and event-level `injectedVars`),
   checks that the string `"$var"` appears somewhere as a string literal in the source file.
3. Fails with a clear message if any `$var` has no matching string literal.

### Why a "string-literal presence" check rather than a full AST audit

Two previously-considered anchors are not viable:

1. **`ScopeProvider` JSX detection** — original plan, dropped because most components inject via
   `renderChild(node, { contextVars: { $item: ... } })` inline, not via a `<ScopeProvider>` element.
   Requires full TypeScript Compiler API to trace.

2. **`metadata.contextVars` bidirectional check** — dropped because `metadata.contextVars` is
   **intentionally a subset**: it documents only user-facing variables for the Language Server.
   Internal variables (`$cell`, `$colIndex`, `$isFirst`, `$isLast`, `$inTrigger`, etc.) are absent
   from `contextVars` by design. A bidirectional check would fail for Items, Tree, Column, Markdown,
   Select, AutoComplete immediately — all legitimate, not bugs.

A string-literal presence check is weaker (a `"$item"` in a comment would satisfy it) but:
- Requires **zero TypeScript AST tooling** — pure `readFileSync` + regex.
- Catches the most dangerous drift: developer adds `"$newVar"` to `OPTIMIZER_METADATA` and never
  touches the component file at all.
- Complements Layer 4 (`validateInjectedVars` DEV throw) which is the **strong guard**: if the
  variable is declared in OPTIMIZER_METADATA but never injected by the renderer, DEV throws on
  first render.

### What this check does NOT catch

- A variable removed from the renderer but left in OPTIMIZER_METADATA (Layer 4 catches this).
- A variable present in a comment but absent from the actual `renderChild` call (accepted limitation).
- Extension-package components (`xmlui-masonry`, etc.) — they have no OPTIMIZER_METADATA entry,
  so there is nothing to check. They rely on `metadata.contextVars` and runtime validation only.

### File layout

- **Extend existing test:** `xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`
  - Add a new `describe` block: `"OPTIMIZER_METADATA vars have a string-literal presence in source"`.
  - Reuse the same `readFileSync`-based approach already present.
  - Extractor: for each `$var` in `childInjectedVars`, check `source.includes('"' + var + '"')`.

### Test cases

For each entry in `OPTIMIZER_METADATA` with non-empty `childInjectedVars`:
- **Every `$var` in `childInjectedVars` MUST appear as a string literal in the component `.tsx` file.**
  Catches: "developer added `$newVar` to OPTIMIZER_METADATA and never referenced it in the component".

For each entry in `OPTIMIZER_METADATA` with per-event `injectedVars`:
- **Every `$var` in `events[*].injectedVars` MUST appear as a string literal in the component `.tsx` file.**

### Acceptance criteria

- [x] All current components pass out of the box (no false positives).
- [x] Intentionally adding `"$bogus"` to `OPTIMIZER_METADATA.List.childInjectedVars` causes the test to fail with a clear message naming the component and the missing key.
- [x] Test runs in < 200ms as part of the standard test suite (pure file reads, no TS compilation).

---

## Layer 4: Runtime Hard-Fail in DEV

### What it does

Convert `validateInjectedVars` from `console.error` to `throw new Error(...)` in DEV mode. Production behavior unchanged (no validation runs at all).

### Files to change

- `xmlui/src/components-core/optimization/validateInjectedVars.ts`
  - Replace `console.error(...)` with `throw new Error(...)`.
  - Keep `EVENT_PAYLOAD_RESERVED_NAMES` carve-out.
  - Keep `if (import.meta.env.DEV)` guard at the **call site** (`ComponentAdapter`, `wrapComponent`) — function itself stays neutral, but error message must clearly state which component / event / vars are out of sync and how to fix.

### Error message template

```
[XMLUI Optimizer] Metadata mismatch in <ComponentType>.<location>:
  Declared in OPTIMIZER_METADATA: [$a, $b]
  Actually injected by renderer:  [$a, $b, $c]
  Missing from registry:          [$c]
  Extra in registry:              []

Fix: update OPTIMIZER_METADATA.<ComponentType>.<location> in
  xmlui/src/components-core/optimization/optimizer-metadata.ts
```

### Why throw instead of console.error

- `console.error` is trivial to miss when browser console is noisy.
- A thrown error in DEV mode surfaces immediately via React error boundary → impossible to ignore.
- Cost: developer must fix before continuing, which is the whole point.

### Acceptance criteria

- [x] Removing `$item` from `OPTIMIZER_METADATA.List.childInjectedVars` while `List.tsx` still injects it → app throws on first render of a `List`.
- [x] Production builds (`import.meta.env.DEV === false`) skip validation entirely (zero runtime cost).
- [x] Error message names the component, the location (`childInjectedVars` vs `events.<name>.injectedVars`), and the exact diff.

---

## Coverage summary after both layers land

| Scenario | IDE | CI / Pre-commit | Build | Runtime DEV |
|----------|-----|-----------------|-------|-------------|
| A — added var, forgot registry | — | ✅ U-audit.2 | — | ✅ throw |
| B — new component, no registry entry | — | ✅ U-audit.2 (extractor warns) | — | (component just won't appear in lookup) |
| C — inline literal divergence | — | ✅ U-audit.1 (existing) | — | — |
| D — removed var, kept registry | — | ✅ U-audit.2 | — | ✅ throw |

Note: this plan deliberately omits Layer 1 (`useChildScope` refactor) and Layer 3 (Vite plugin heuristic warning). They remain viable future enhancements but are not required to close the gaps above.

---

## Order of work

1. **Layer 4 first** (smallest blast radius, fastest payoff):
   - 1 file changed (`validateInjectedVars.ts`)
   - Improves DX immediately without touching tests
   - Estimated effort: 30 min

2. **Layer 2 second** (larger but self-contained):
   - 2 new files (test + helper)
   - No changes to production code
   - Estimated effort: 3–5 hours, depending on TS AST helper polish

3. **Validation pass**:
   - Run full test suite, confirm no regressions
   - Intentionally break one component to confirm both layers fire
   - Revert the break

---

## Open questions (to resolve during implementation)

1. **Spread pattern in `vars` object** — how aggressively to support? Document the answer in the helper module's JSDoc.
2. **Source file mapping convention** — should we enforce a strict convention (e.g. `<Name>.tsx` always holds the provider), or add a `__optimizerSource__` annotation field per component for overrides? Recommend strict convention + annotation for opt-out.
3. **Failure mode for `events.<e>.injectedVars` extraction** — many events don't use a dedicated wrapper. Decide whether to scope this part of the audit to a known whitelist (DataLoader, DataSource, APICall) or attempt generic detection.

---

## Out of scope (for this TODO)

- Layer 1 (typed `useChildScope` hook + 18-component refactor)
- Layer 3 (Vite plugin heuristic warning for unknown component types)
- Runtime registration API for third-party extension components
- Migration of `OPTIMIZER_METADATA` into per-component sibling `*.metadata.ts` files
