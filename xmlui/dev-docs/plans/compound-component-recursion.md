# Plan: Detect Circular and Unbounded User-Defined Component References

**Date:** 2026-04-27  
**Status:** Proposal

---

## Problem

XMLUI lets users declare User-Defined Components (UDCs) with `<Component name="...">`. Nothing prevents them from forming **render-time cycles** between UDCs, or **unbounded recursion** of a UDC referencing itself with no terminating condition.

```xml
<!-- Direct cycle: A↔B -->
<Component name="MyButton">
  <MyText />
</Component>

<Component name="MyText">
  <MyButton />
</Component>

<!-- Self-recursion with no base case -->
<Component name="Forever">
  <Forever />
</Component>
```

The first case is a true cycle; the second is unbounded recursion. Both make the renderer expand the component tree indefinitely. The user's concern that "this will freeze the browser" is well-founded:

- Each UDC instance is rendered through `CompoundComponent` ([`xmlui/src/components-core/CompoundComponent.tsx`](../../src/components-core/CompoundComponent.tsx)), which calls `renderChild` on its body.
- `renderChild` resolves the UDC by name, instantiates another `CompoundComponent`, and the chain repeats.
- There is no per-render cycle detector and no recursion-depth limit anywhere in the rendering pipeline. The relevant existing detectors are unrelated:
  - `CircularDependencyDetector` ([`xmlui/src/parsers/scripting/CircularDependencyDetector.ts`](../../src/parsers/scripting/CircularDependencyDetector.ts)) catches circular `import` statements between **scripting modules**, not UDC references.
  - `syncExecutionTimeout` (default 1000ms) in the scripting evaluator catches infinite loops in **expressions**, not in component rendering.

In the best case the browser tab hangs; in the worst case it crashes with a stack overflow that is hard to attribute to the offending markup. There is also no test coverage for this scenario today.

---

## Halting-Problem Question

The general problem of "does this component definition terminate?" is undecidable, because UDCs can be conditionally instantiated via `when` expressions, expression-driven `<Items>`, control-flow components, etc. The conditional could depend on runtime data. So we **cannot** statically prove termination.

However, we can decide the practical sub-cases:

1. **Static structural cycle** — UDC `A`'s body unconditionally contains `<B/>` (no `when`, not under any data-driven branch), and `B`'s body unconditionally contains `<A/>`. Detectable at registration time by walking the static UDC reference graph.
2. **Static structural self-recursion** — UDC `A`'s body unconditionally contains `<A/>`. Special case of (1).
3. **Runtime unbounded expansion** — every other case. Not statically decidable. Caught at render time with a depth budget.

The plan covers both: a static graph check that fires at app initialization, and a runtime depth budget that prevents browser freezes regardless of how the recursion is constructed.

---

## Goals

1. **Static cycle warning at registration time** for the decidable sub-case (unconditional structural cycles among UDCs).
2. **Runtime recursion-depth limit** that aborts the render and surfaces a clear error before the browser hangs.
3. **Test coverage** for both the cycle and the self-recursive case, including a recursive UDC **with** a base case (which must still work) and **without** one (which must fail gracefully).

---

## Background

Relevant code paths:
- `CompoundComponent` — wraps each UDC instance; the recursion engine point. [`xmlui/src/components-core/CompoundComponent.tsx`](../../src/components-core/CompoundComponent.tsx)
- `child-rendering.tsx` — supplies `renderChild` via context. [`xmlui/src/components-core/container/child-rendering.tsx`](../../src/components-core/container/child-rendering.tsx)
- `ComponentProvider` — registers UDCs and looks them up by name. (Search `registerCompoundComponentRenderer`.)
- `xmlUiMarkupToComponent` — parses markup to `ComponentDef` / `CompoundComponentDef` trees. Called from `StandaloneApp.tsx`.

A UDC body is a `ComponentDef` tree. Walking it and collecting every child `node.type` that resolves to another registered UDC gives the **static reference set** for that UDC. Excluding nodes guarded by `when` is straightforward because `when` lives on `node.props.when`. (We treat any `when` — even one that always evaluates `true` — as making the reference "conditional" and therefore not part of the static cycle. False positives are worse than false negatives here.)

---

## Implementation Steps

### Step 1: Runtime recursion-depth limit (defence in depth)

This is the **must-have** safety net. It prevents browser freezes regardless of how cleverly the recursion is constructed.

In `CompoundComponent.tsx`, track the stack of UDC types currently being rendered along the React render path. The simplest mechanism is a React context that carries a stack of UDC type names plus a depth counter:

```ts
// xmlui/src/components-core/CompoundComponentDepthContext.ts
import { createContext, useContext } from "react";

export type CompoundDepthInfo = { stack: string[]; depth: number };
export const CompoundDepthContext = createContext<CompoundDepthInfo>({ stack: [], depth: 0 });
export const useCompoundDepth = () => useContext(CompoundDepthContext);

export const MAX_COMPOUND_DEPTH = 256; // tunable; well above any sane real-world UDC nesting
```

In `CompoundComponent`:

```tsx
const parent = useCompoundDepth();
const myType = node.type;
const nextDepth = parent.depth + 1;

if (nextDepth > MAX_COMPOUND_DEPTH) {
  const chainStr = [...parent.stack, myType].join(" → ");
  // Render an inline error component instead of recursing further.
  throw new Error(
    `[XMLUI] Compound component recursion limit (${MAX_COMPOUND_DEPTH}) exceeded. ` +
    `Chain: ${chainStr}. ` +
    `This usually means a UDC references itself or another UDC without a terminating condition.`
  );
}

const nextDepthInfo = useMemo(
  () => ({ stack: [...parent.stack, myType], depth: nextDepth }),
  [parent.stack, myType, nextDepth],
);

// Wrap the existing render output in the provider:
return (
  <CompoundDepthContext.Provider value={nextDepthInfo}>
    {/* existing renderChild output */}
  </CompoundDepthContext.Provider>
);
```

The `throw` is caught by the existing `ErrorBoundary` in the render tree (see `.ai/xmlui/error-handling.md`) and surfaces as a contained inline error, not a browser freeze. The error message includes the chain so the offending markup is identifiable.

**Why a depth limit, not a per-instance cycle detector at runtime?** Cycle detectors based on "type already on the stack" produce false positives for legitimate self-recursion with a base case (e.g., a `Tree` UDC). A depth budget allows correct base-case recursion up to a sensible nesting and only fails the truly unbounded case.

The constant `MAX_COMPOUND_DEPTH` should be exposed via `appContext.appGlobals` (or a config knob) so the rare legitimate use case can raise it.

### Step 2: Static reference-graph cycle check at registration time

In the place where UDCs are registered (search for `registerCompoundComponentRenderer` in `ComponentProvider.tsx`), build a **static UDC reference graph**:

```ts
// For each registered UDC name → set of UDC names it unconditionally references in its body.
type UdcRefGraph = Map<string, Set<string>>;
```

Walk each UDC's `component` definition tree, collecting every `node.type` that:
- Is the name of another registered UDC, AND
- Has no `when` prop on itself OR any of its ancestors within that UDC body, AND
- Is not inside a template/slot prop (template props are user-provided and not part of the static body).

Then run Tarjan or simple DFS to find SCCs of size > 1, plus self-loops. For every cycle found, log a single console warning at startup with the cycle chain:

```
[XMLUI] Detected unconditional structural cycle among compound components: MyButton → MyText → MyButton
This will recurse indefinitely at render time and will be aborted by the depth limit.
Add a `when` condition to break the cycle, or restructure the components.
```

This is a **warning, not an error**. The runtime limit from Step 1 is the hard safety; the static check is developer ergonomics.

### Step 3: Provide a clear error component for the depth-limit case

Plug into the existing `ErrorBoundary` mechanism. Currently a thrown error renders the generic error UI. For this specific error class, render a tailored message:

- Short title: "Compound component recursion limit reached"
- Body: the chain of UDC names from `nextDepthInfo.stack`
- Suggestion: "Add a `when` condition or restructure to break the cycle."

This can be done by throwing a typed subclass like `CompoundRecursionError` and special-casing it in the inline error renderer in `xmlui/src/components-core/components/ErrorBoundary` (or wherever inline render errors are formatted).

### Step 4: Tests

Add Playwright tests under `xmlui/tests-e2e/` (or unit tests under `xmlui/tests/`) covering:

| Case | Expected behaviour |
|------|-------------------|
| `MyButton ↔ MyText` direct cycle | Static warning at startup; render shows the inline recursion-error component; no browser freeze |
| `Forever` self-references with no `when` | Static warning; inline recursion-error |
| `Tree` self-references inside `<Items when="{node.children}">` | No warning (guarded by `when`); renders correctly to depth implied by data; no error |
| `Counter` self-references with `<Self when="{depth < 5}" depth="{depth + 1}" />` | No warning; renders 5 levels deep; no error |
| Long but bounded indirect chain `A → B → C → A` with one `when` somewhere | No static warning; runs fine at runtime |

The cycle test should specifically assert the **chain** appears in the error message.

### Step 5: Document in dev-docs

Add a short section to `.ai/xmlui/user-defined-components.md` (and the corresponding `xmlui/dev-docs/guide/` chapter on UDCs) describing:
- Cycles among UDCs are not allowed in their unconditional form and produce a startup warning.
- Recursive UDCs are allowed but must have a terminating `when` condition.
- The `MAX_COMPOUND_DEPTH` budget and how to raise it for special cases.

---

## Files to Change

| File | Change |
|------|--------|
| `xmlui/src/components-core/CompoundComponentDepthContext.ts` | **New** — context + constant |
| `xmlui/src/components-core/CompoundComponent.tsx` | Read context, increment depth, throw on overflow, wrap output in provider |
| `xmlui/src/components-core/ComponentProvider.tsx` | Build UDC reference graph at registration; warn on cycles |
| `xmlui/src/components-core/components/ErrorBoundary/*` (or equivalent) | Special-case `CompoundRecursionError` in the inline error renderer |
| `xmlui/src/components-core/errors.ts` (or wherever error classes live) | Add `CompoundRecursionError` |
| `xmlui/tests-e2e/compound-component-recursion.spec.ts` | **New** — coverage matrix above |
| `.ai/xmlui/user-defined-components.md` | Add cycle/recursion section |
| `xmlui/dev-docs/guide/<udc-chapter>.md` | Same |

---

## Edge Cases & Open Questions

1. **Templates/slots.** When component `Card` accepts a `headerTemplate` prop, the user supplies a UDC tree at the *call site*. If the call site templates a UDC that contains a `<Card>`, that's a runtime-only cycle that the static graph cannot see. The runtime depth limit catches it.
2. **Code-behind UDCs.** UDCs with `.xmlui.xs` code-behind don't change the structural graph — their body is still parsed as XML. No special handling.
3. **Conditional cycle.** `MyButton` always renders `<MyText/>`, `MyText` renders `<MyButton when="{showButton}"/>`. Static check skips this (guarded by `when`); runtime depth limit catches it if `showButton` is true at every level.
4. **Choice of `MAX_COMPOUND_DEPTH`.** 256 is a starting point — well above any real UDC nesting depth (most apps stay under 20). Make it configurable via app `config.json` (`runtime.maxCompoundDepth`).
5. **Stack accuracy.** The stack tracked in context is the **dynamic** call chain along one render path, not the entire render tree. That's what we want for diagnostic purposes — it shows the offending recursion path.
6. **Performance.** Building the static reference graph runs once at registration; O(total UDC nodes). Negligible. The runtime depth context updates per `CompoundComponent` render — also negligible.
