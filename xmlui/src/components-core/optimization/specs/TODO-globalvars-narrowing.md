# TODO: Narrowing of Global Variables (`parentGlobalVars`)

## Problem

The current `computedUses` narrowing optimizes **parent local state** (`parentState`), but
leaves the **global-variables layer** (`parentGlobalVars`) completely un-narrowed.

`parentGlobalVars` is the channel through which `Globals.xs` declarations (and any
`global.*`-prefixed attributes from `App`) reach every component in the tree. It is
passed verbatim from parent to child in `ContainerWrapper` (`ContainerWrapper.tsx:206`)
without any filtering:

```
parentState     ← narrowed by computedUses     ← current optimization helps here
parentGlobalVars ← NEVER narrowed              ← this TODO
```

Whenever **any** global variable changes (e.g., `sortBy`, `view`, `catalogSelection`,
`fileEntries` in a typical app like myworkdrive), **every** `StateContainer` in the tree
receives a new `parentGlobalVars` reference. `useGlobalVariables` reconstructs
`stableCurrentGlobalVars`, which feeds into `componentState`. Even if a component doesn't
read `sortBy` at all, it re-renders because its merged `componentState` changed.

### Evidence from benchmark

Running the render-count benchmark (`traces/specs/benchmark-render-counts.spec.ts`)
in myworkdrive showed that toggling `COMPUTED_USES_ENABLED` on/off has **zero effect**
on the number of re-renders for any of the four scenarios (sort change, view switch,
selection, folder navigation). All of these scenarios change Globals.xs variables, and all
observed re-renders are caused by the un-narrowed `parentGlobalVars` propagation.

This means the existing `computedUses` optimization delivers **zero benefit** for
apps whose main reactive state lives in `Globals.xs` — which is the intended
architecture for medium-to-large myworkdrive-like apps.

### Affected component count (myworkdrive)

Every StateContainer in the app — `App`, `FilesPage`, `FileVersionsDrawer`, all modals,
sidebar, toolbar, breadcrumbs — re-renders on every global state change, even when the
component does not read the changed key. In myworkdrive that is 30+ components re-rendering
on every sort change or view switch.

---

## Root Cause

`parentGlobalVars` is a flat `Record<string, any>` passed down the tree. There is no
mechanism equivalent to `computedUses` that tracks which global-variable names a component
subtree actually reads.

---

## Recommended Solution

Introduce **`computedGlobalUses`**: a per-node annotation (analogous to `computedUses`)
that lists the Globals.xs names a component subtree reads.

### How it would work

**Static analysis pass** (extends `computeUsesForTree`):
- Identify which names in `usedHere` / `childDeps` also appear in `appGlobalNames`
  (the set built from `globalsXs.vars + globalsXs.functions` in `resolveRuntime`).
- Store those names as `node.computedGlobalUses`.

**Runtime: `ContainerWrapper`** — before passing to `StateContainer`:
```ts
const narrowedGlobalVars = node.computedGlobalUses
  ? extractScopedState(parentGlobalVars, node.computedGlobalUses)
  : parentGlobalVars;
```

**`useGlobalVariables`** — only re-evaluates when the keys it cares about changed,
using `useShallowCompareMemoize` on `narrowedGlobalVars` instead of the full map.

### Result

A component that reads only `events` from Globals.xs gets
`narrowedGlobalVars = { events: … }`. When `sortBy` changes, its narrowed object
is unchanged → `stableCurrentGlobalVars` is the same reference → no re-render.

---

## Complexity and Risk

**Medium** — requires:

1. Extending the `ComponentDef` type with `computedGlobalUses?: string[]`.
2. Extending `computeUsesForTree` to emit this annotation alongside `computedUses`.
   The logic is a natural extension: dep names that pass `appGlobalNames.has(d)` go
   into `computedGlobalUses` rather than being filtered out entirely.
3. Modifying `ContainerWrapper` to narrow `parentGlobalVars` before passing it down.
4. Passing `appGlobalNames` to the analysis (already done in `StandaloneApp.resolveRuntime`).
5. Tests and drift checks.

**Risk areas:**
- Globals.xs functions (not just vars): if a function is in `appGlobalNames` and a component
  calls it, the function must still be in `narrowedGlobalVars` so the call works at runtime.
  Functions cannot be filtered out even if only called, never "read" as a value.
  Solution: always include all Globals.xs **functions** in `narrowedGlobalVars`; only narrow
  the **vars** subset.
- Reactive var initializers: some Globals.xs vars depend on other Globals.xs vars
  (e.g., `var x = y + 1`). Narrowing must include both `x` and `y` when a component
  reads `x`. The dependency chain in `useGlobalVariables` already handles re-evaluation,
  so the narrowed set must include the full transitive dependency closure.

---

## Related

- `computed-uses-specification.md` — `appGlobalNames` filter section
- `TODO-pure-static-tracking.md` — proposed removal of `$`-prefix fallback
- Benchmark results: `myworkdrive/traces/specs/benchmark-render-counts.spec.ts`
