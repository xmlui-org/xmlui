# DONE: Narrowing of Global Variables (`parentGlobalVars`) — `computedGlobalUses`

**Status: IMPLEMENTED** (2026-05-29)

---

## Problem

The `computedUses` narrowing optimized **parent local state** (`parentState`) but left
the **global-variables layer** (`parentGlobalVars`) completely un-narrowed.

`parentGlobalVars` is the channel through which `Globals.xs` declarations reach every
component in the tree. Without narrowing, any change to **any** global variable caused
every `StateContainer` in the tree to re-render — even components that don't read the
changed key. In myworkdrive that was 30+ components re-rendering on every sort change or
view switch, and the existing `computedUses` optimization delivered zero benefit because
all reactive state lived in `Globals.xs`.

---

## Solution: `computedGlobalUses`

Introduced **`computedGlobalUses`**: a per-node annotation analogous to `computedUses`
that lists the Globals.xs variable names a component subtree actually reads. At runtime,
`parentGlobalVars` is narrowed to this set before being passed into `ContainerWrapper`,
so a component that reads only `events` is completely isolated from changes to `sortBy`.

---

## What Was Implemented

### 1. `ComponentDefs.ts` — new field

Added `computedGlobalUses?: string[]` to `ComponentDef`:

```typescript
/**
 * Automatically computed minimal set of Globals.xs variable names actually
 * read within this node's subtree. Populated by `computeUsesForTree()` at
 * transform/boot time alongside `computedUses`.
 * ...
 */
computedGlobalUses?: string[];
```

### 2. `computedUses.ts` — static analysis extended

`computeUsesInternal` now returns a 4-tuple
`[parentDeps, escapingUIDs, parentDepsReads, globalDepsUsed]`.

Key changes:
- `node.computedGlobalUses = undefined` is cleared unconditionally at the start of each
  traversal (same mechanical-guard pattern as `computedUses`, see Invariant 5.5).
- A new `childGlobalDeps: Set<string>` accumulator collects global names from children.
- After `processChildList`, an `isGlobalDep` predicate identifies names from `usedHere`
  that pass `appGlobalNames.has(d)` and are not in `localDeclared` or `injectedVarsScope`.
  These, union the `childGlobalDeps`, form `globalDepsUsed`.
- For container nodes: if `globalDepsUsed` is non-empty and `node.uses === undefined`,
  `node.computedGlobalUses = Array.from(globalDepsUsed).sort()`.
- The 4th element propagates upward through all return paths so that global deps from
  deeply nested non-container nodes bubble up to the nearest container.

**Why a separate 4th return value?**  
`keepDep` already filters out `appGlobalNames` from `parentDependencies`, so global deps
would be silently lost without explicit tracking. The 4th value is the only path for
them to travel upward to the parent container.

### 3. `ContainerWrapper.tsx` — annotation forwarded to container

`getWrappedWithContainer` now mirrors the `computedUses` move-and-delete pattern for
`computedGlobalUses`:

```typescript
computedGlobalUses: node.computedGlobalUses,   // added to ContainerWrapperDef
...
delete wrappedNode.computedGlobalUses;          // prevent isContainerLike re-detection
```

### 4. `ContainerUtils.ts` — new `narrowGlobalVars` function

```typescript
export function narrowGlobalVars(
  vars: Record<string, any>,
  uses: readonly string[],
): Record<string, any>
```

Rules applied per key:
- **`__tree_*` keys** (expression ASTs for dep-tracking in `useGlobalVariables`): included
  only when the corresponding variable name (`key.slice(7)`) is in `uses`.
- **Function-valued keys**: always included — Globals.xs functions can be called from any
  expression in the subtree and cannot be safely filtered.
- **Value keys**: included only when listed in `uses`.

### 5. `ComponentWrapper.tsx` — runtime narrowing applied

```typescript
import { extractScopedState, narrowGlobalVars } from "./ContainerUtils";

const nodeComputedGlobalUses = nodeWithTransformedDatasourceProp.computedGlobalUses;
const scopedGlobalVars = useShallowCompareMemoize(
  useMemo(
    () =>
      nodeComputedGlobalUses && globalVars
        ? narrowGlobalVars(globalVars, nodeComputedGlobalUses)
        : globalVars,
    [globalVars, nodeComputedGlobalUses],
  ),
);
// ...
<ContainerWrapper parentGlobalVars={scopedGlobalVars} ... />
```

`useShallowCompareMemoize` on the narrowed object means the reference is stable when
non-relevant globals change — `useGlobalVariables` sees the same input, `stableCurrentGlobalVars`
does not change, and the `StateContainer` does not re-render.

---

## Key Design Decisions

### Functions always pass through
Globals.xs functions are always forwarded regardless of `computedGlobalUses`. A function
may be invoked from an event handler even when it's not visibly referenced in a prop
expression, and a static analysis pass cannot always prove a function is never called.
Only value variables (non-function entries) are narrowed.

### `__tree_*` metadata is co-narrowed with its variable
`useGlobalVariables` (step 1) uses `__tree_<name>` keys to track expression-level deps
within a global var's initializer. Forwarding `__tree_sortBy` when `sortBy` is not in
`computedGlobalUses` would be redundant at best and misleading at worst. The narrowing
therefore includes `__tree_<name>` iff `name` is in the uses set.

### No changes to `useGlobalVariables` or `StateContainer`
The narrowing happens entirely upstream in `ComponentWrapper`. `StateContainer` and
`useGlobalVariables` receive an already-narrow `parentGlobalVars` and behave correctly
without modification. The existing `useShallowCompareMemoize` in `useGlobalVariables`
already provides reference stability once the input stops changing.

### Correctness invariant
`computedGlobalUses` on a container node covers the **union** of all global deps in its
entire subtree. Narrowing at the container therefore never starves a grandchild component
that reads a global — the grandchild's reads are always included in the ancestor's set.

---

## Files Changed

| File | Change |
|------|--------|
| `xmlui/src/abstractions/ComponentDefs.ts` | Added `computedGlobalUses?: string[]` to `ComponentDef` |
| `xmlui/src/components-core/optimization/computedUses.ts` | Extended `computeUsesInternal` return type and logic |
| `xmlui/src/components-core/rendering/ContainerWrapper.tsx` | Forwarded `computedGlobalUses` to container; deleted from wrappedNode |
| `xmlui/src/components-core/rendering/ContainerUtils.ts` | Added `narrowGlobalVars()` |
| `xmlui/src/components-core/rendering/ComponentWrapper.tsx` | Applied `narrowGlobalVars`, pass `scopedGlobalVars` |

---

## Tests Added

Unit tests in `xmlui/tests/components-core/optimization/computedUses.test.ts`
(new `computedGlobalUses` describe block, 6 tests):

1. Component reading a global var → `computedGlobalUses` annotated correctly
2. Component reading no globals → `computedGlobalUses` is `undefined`
3. Multiple globals collected and sorted alphabetically
4. Global used only in deeply nested child bubbles up to the ancestor container
5. Stale `computedGlobalUses` cleared on re-analysis (Invariant 5.5 applies equally)
6. Non-container nodes do not get the annotation — only containers do

---

## Additional Tests (Recommended)

The unit tests above cover the static analysis. The following integration/E2E-level
tests would complete the validation:

### Integration tests
- **`narrowGlobalVars` unit tests** (`ContainerUtils.test.ts`): verify that function-valued
  keys always pass through, `__tree_*` keys are filtered correctly, and value keys are
  narrowed as expected; also test with empty `uses = []` and `undefined`/`null` values.
- **Render-count regression** (`computedUses.e2e.ts` or similar): add a test-app scenario
  where a `Globals.xs` variable changes and verify that components not referencing it do
  not re-render (using `window.__renderCounts`).

### Benchmark (myworkdrive)
- Re-run the existing benchmark spec (`traces/specs/benchmark-render-counts.spec.ts`) in
  myworkdrive with `COMPUTED_USES_ENABLED=true` and compare against the baseline recorded
  before this feature. Expected: significant reduction in re-render counts for sort/view
  switch scenarios where multiple containers previously re-rendered due to un-narrowed globals.


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
