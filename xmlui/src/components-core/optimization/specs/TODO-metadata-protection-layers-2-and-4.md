# TODO: Metadata Protection — Layer 2 (Static AST Audit) + Layer 4 (Runtime Hard-Fail)

**Status:** Planned / Not started
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

## Layer 2: U-audit.2 — Static AST Audit Test

### What it does

A vitest test that, for every entry in `OPTIMIZER_METADATA`:

1. Locates the corresponding component source file (`xmlui/src/components/<Name>/<Name>.tsx` or `*React.tsx`).
2. Parses it with TypeScript Compiler API (`ts.createSourceFile`).
3. Extracts the **actual set of `$`-prefixed variable keys** the renderer provides:
   - For `childInjectedVars`: find `<ScopeProvider vars={{...}}>` or equivalent context-provider JSX, extract object literal keys starting with `$`.
   - For `events[*].injectedVars`: find `lookupEventHandler(eventName, { ... })` or wrapping calls, extract keys.
4. Compares extracted set to `OPTIMIZER_METADATA[componentType].childInjectedVars` / `.events.<event>.injectedVars`.
5. Fails the test with a clear message on any mismatch.

### File layout

- **New test:** `xmlui/tests/components-core/optimization/staticMetadataAudit.test.ts`
- **New helper module:** `xmlui/tests/components-core/optimization/helpers/auditAst.ts`
  - Exports `extractChildScopeVars(filePath: string): string[]`
  - Exports `extractEventScopeVars(filePath: string, eventName: string): string[]`
  - Exports `resolveSourceFile(componentType: string): string` (convention-based mapping)

### Test cases

For each component in `OPTIMIZER_METADATA`:
- **`<X>.childInjectedVars matches renderer source`** — assert `extractChildScopeVars(file)` deep-equals registry.
- **`<X>.events.<e>.injectedVars matches renderer source`** — for each declared event, assert match.

Plus two negative-control tests:
- **`extractor finds known good case`** — known component (e.g. `List`), known expected vars, assert extractor returns the right list.
- **`extractor flags injected fixture`** — synthetic test fixture with intentional mismatch, assert the audit fails.

### Convention assumption (document explicitly)

To keep the AST analyzer simple, require/enforce:
- Each component places its `ScopeProvider` (or context-provider) call in **one of**:
  - `xmlui/src/components/<Name>/<Name>.tsx`
  - `xmlui/src/components/<Name>/<Name>React.tsx`
  - `xmlui/src/components/<Name>/<Name>Native.tsx`
- The `vars` prop (or equivalent) is passed as an **object literal**, not a spread of a variable.

If a component doesn't fit the convention, an explicit override file or annotation lets it opt out (with a TODO to refactor later).

### Edge cases to handle

| Case | Handling |
|------|----------|
| Component uses both `childInjectedVars` and event `injectedVars` | Audit checks both independently |
| Component uses spread `vars={{...defaults, $x}}` | Extractor must recursively resolve spreads or fail loudly with "unsupported pattern" |
| Component splits child scope across multiple providers (e.g. nested `ScopeProvider`) | Extractor must collect union of all `$` keys |
| Component has no `<ScopeProvider>` but is in registry | Audit fails: "registry claims childInjectedVars but no provider found" |
| Component has `<ScopeProvider>` but no registry entry | Audit warns/fails: "renderer provides child scope but no OPTIMIZER_METADATA entry" |

### Performance budget

- Parsing 18 component files synchronously in one test: target < 200ms total.
- Avoid heavy `ts-morph` if `typescript` standalone parser suffices.

### Acceptance criteria

- [ ] All current components in `OPTIMIZER_METADATA` pass the audit out of the box (no false positives).
- [ ] Intentionally adding `$bogus` to `OPTIMIZER_METADATA.List.childInjectedVars` causes the test to fail with a clear message.
- [ ] Intentionally removing `$item` from `List.tsx` renderer (without updating registry) causes the test to fail.
- [ ] Test runs in < 1s as part of the standard test suite.

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

- [ ] Removing `$item` from `OPTIMIZER_METADATA.List.childInjectedVars` while `List.tsx` still injects it → app throws on first render of a `List`.
- [ ] Production builds (`import.meta.env.DEV === false`) skip validation entirely (zero runtime cost).
- [ ] Error message names the component, the location (`childInjectedVars` vs `events.<name>.injectedVars`), and the exact diff.

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
