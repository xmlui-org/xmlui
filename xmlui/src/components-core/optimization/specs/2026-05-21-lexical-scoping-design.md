# Lexical Scoping for `computedUses` — Architectural Design

**Date:** 2026-05-21
**Status:** Draft (under brainstorming review)
**Scope:** Replaces hardcoded constants `DATA_FETCH_HANDLER_INJECTED_KEYS` and `PARENT_STATE_DYNAMIC_VARS` in `computedUses.ts` with a unified, declarative, metadata-driven lexical scoping mechanism.
**Out of scope:** `IMPLICIT_CONTAINER_COMPONENT_NAMES` (covered by a separate `isImplicitContainerByDefault` metadata flag — see [implicit-containers-promotion.md](./implicit-containers-promotion.md)).

---

## 0. Motivation

The optimizer in `xmlui/src/components-core/optimization/computedUses.ts` currently couples its static analysis to two hardcoded string constants:

1. **`DATA_FETCH_HANDLER_INJECTED_KEYS`** — names that XMLUI runtime injects into `DataLoader` / `DataSource` event handlers (e.g., `$queryParams`). Hardcoded as a `Set`, with a type-check `node.type === "DataLoader" || node.type === "DataSource"`.
2. **`PARENT_STATE_DYNAMIC_VARS`** — `$`-prefixed names that genuinely live in parent state (e.g., `$context` from `ContextMenu.openAt()`) and must NOT be filtered out.

**Why this is broken:**

- Adding a new data-source-like component in an **Extension Package** (e.g., `GraphQLDataSource`, `WebsocketLoader`) cannot work — the optimizer's type-check rejects unknown component types, silently degrading performance.
- Adding a new component that implicitly dispatches a `$`-prefixed variable to parent state requires editing core `computedUses.ts` — impossible from extension packages.
- Both constants are time bombs: omissions cause silent reactivity bugs that surface only in production.

**Goal:** A single, declarative metadata mechanism where each component itself declares which variables it injects and where (per-event or per-children). The optimizer reads these declarations from the component registry — no hardcoded string sets remain.

---

## 1. Architecture & Data Flow

### 1.1 Strategy: Immutable Lexical Scope Propagation

We extend the existing immutable-parameter-passing pattern already used for `parentFunctionNames`. A new parameter `injectedVarsScope: ReadonlySet<string>` flows down the recursive traversal of `computeUsesInternal`. This guarantees **zero scope leakage by construction** — the JS call stack itself ensures that a child's scope extension cannot leak to its parent or to siblings.

### 1.2 Current vs New Signature

**Current:**
```typescript
function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false,
): [freeVars: Set<string>, escapingUIDs: Set<string>, freeReadVars: Set<string>]
```

**New:**
```typescript
function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false,
  injectedVarsScope: ReadonlySet<string> = EMPTY_SET,  // ← new
): [freeVars: Set<string>, escapingUIDs: Set<string>, freeReadVars: Set<string>]
```

`EMPTY_SET` is a module-level `Object.freeze(new Set<string>())` sentinel — guarantees the default value is never mutated.

### 1.3 Critical Distinction: Component Scope vs Event Scope

This is the **key invariant** that prevents a subtle horizontal-leak bug:

| Scope kind | Where it lives | Propagation rule |
|---|---|---|
| **Component scope** (`injectedVarsScope` parameter) | Flows **down the tree** to children of the node | Extended by `metadata.childInjectedVars` before recursing into children |
| **Event scope** (`eventScope` local variable) | Lives **only within one event handler iteration** | Extended by `eventMeta.injectedVars` for THIS event handler only; never seen by siblings or children |

**Why both?** Consider `DataLoader` with two events:
- `onFetch` — runtime injects `$queryParams`
- `onSuccess` — no injection; reads the global `$queryParams` from the router

If we extended `injectedVarsScope` (the component-level parameter) with `$queryParams` while processing `DataLoader`, then `onSuccess` would also have `$queryParams` filtered out — breaking the genuine global reference. Event-injected vars **must** be filtered in-place, scoped exclusively to that event handler's dependency extraction.

### 1.4 Algorithm Sketch (Final State After Both Iterations)

> Note: This sketch shows the algorithm after **both** iterations land. The intermediate state at end of Iteration 1 has the events branch wired but the children branch still passes `injectedVarsScope` through unchanged. See Section 3 for per-iteration deltas.

```typescript
function computeUsesInternal(node, parentFunctionNames, disableNarrowing, injectedVarsScope) {
  const metadata = lookupMetadata(node.type);

  // ─── EVENTS: per-event in-place scope ──────────────────────────────────
  for (const [eventName, handlerSrc] of Object.entries(node.events ?? {})) {
    const eventInjected = metadata?.events?.[eventName]?.injectedVars ?? [];
    const eventScope = eventInjected.length
      ? new Set([...injectedVarsScope, ...eventInjected])
      : injectedVarsScope;  // reuse parent reference if nothing to add

    const handlerDeps = depsOfValue(handlerSrc, ...);
    for (const d of handlerDeps) {
      if (!eventScope.has(d) && !isBuiltinGlobal(d) && !localDeclared.has(d)) {
        usedHere.add(d);
      }
    }
    // eventScope dies at end of iteration — does not affect siblings
  }

  // ─── PROPS / VARS / LOADERS: use componentScope (injectedVarsScope) ─────
  // (same keepDep logic, using injectedVarsScope.has(d))

  // ─── CHILDREN: extend with childInjectedVars, pass down ────────────────
  const childInjected = metadata?.childInjectedVars ?? [];
  const childScope = childInjected.length
    ? new Set([...injectedVarsScope, ...childInjected])
    : injectedVarsScope;  // reuse reference

  for (const child of node.children ?? []) {
    computeUsesInternal(child, childFunctionNames, nextDisableNarrowing, childScope);
  }
}
```

### 1.5 Single Filter Rule (`keepDep`)

```typescript
const keepDep = (d: string): boolean =>
  !localDeclared.has(d) &&
  !isBuiltinGlobal(d) &&
  !injectedVarsScope.has(d);  // replaces the three legacy checks
```

For event handlers, the in-place check uses `eventScope.has(d)` instead.

### 1.6 Artifacts Removed After Both Iterations

- `DATA_FETCH_HANDLER_INJECTED_KEYS` (Set constant)
- `PARENT_STATE_DYNAMIC_VARS` (Set constant)
- `isRuntimeContextVar()` (function)
- Hardcoded `node.type === "DataLoader" || node.type === "DataSource"` checks

### 1.7 Performance Characteristics

| Operation | Cost | Why |
|---|---|---|
| `injectedVarsScope.has(d)` per dependency check | **O(1)** | `ReadonlySet.has` |
| New `Set` allocation per node | **0** for plain nodes | Reference reuse when no new injections |
| New `Set` allocation per container/handler with injectedVars | **1 small Set (typically 2-4 elements)** | Bounded — components rarely inject >5 vars |
| GC pressure | **Negligible** | Boot-time only; bounded allocation |

---

## 2. Component Metadata API Extension

### 2.1 `EventDescriptor.injectedVars`

```typescript
export interface EventDescriptor {
  description?: string;
  // ... existing fields ...

  /**
   * Names of variables that XMLUI runtime injects into THIS event's
   * handler scope (in addition to standard event args).
   *
   * The computedUses optimizer treats these names as locally-scoped within
   * the handler — they will NOT be registered as parent-state dependencies.
   *
   * Example: DataLoader's `onFetch` injects `$queryParams` and `$pageInfo`.
   * Without this declaration, a handler like
   *   onFetch="{ fetch('/api?q=' + $queryParams.q) }"
   * would falsely register `$queryParams` as a parent dependency, causing
   * the loader to re-fetch infinitely when the router updates query params.
   */
  injectedVars?: readonly string[];
}
```

### 2.2 `ComponentMetadata.childInjectedVars`

```typescript
export type ComponentMetadata<...> = {
  // ... existing fields ...

  /**
   * Names of variables that this component injects into the SCOPE OF ITS
   * CHILDREN at render time (via per-render contextVars, not parent state).
   *
   * The computedUses optimizer adds these to the child scope so children
   * don't treat them as parent-state dependencies.
   *
   * Example: `List` injects `$item`, `$index`, `$isFirst`, `$isLast`,
   * so a template like `<Text value="{$item.name}" />` doesn't register
   * `$item` as a parent dependency.
   */
  childInjectedVars?: readonly string[];
};
```

### 2.3 Concrete Metadata Changes — Iteration 1 (Events)

Components requiring `injectedVars` on event descriptors:

| Component | Event | `injectedVars` (preliminary; verify in audit) |
|-----------|-------|------------------------------------------------|
| `DataLoader` | `onFetch` | `["$queryParams", "$pageInfo"]` |
| `DataSource` | `onFetch` | `["$queryParams", "$pageInfo"]` |
| (extension audit) | TBD | TBD |

**Audit task before implementation:** grep for `dispatch(.*\\$` and `injectedContextVars` within `xmlui/src/components/` to enumerate the exact set of dynamic event-scoped vars. The table above is preliminary; the audit produces the authoritative list.

### 2.4 Concrete Metadata Changes — Iteration 2 (Children)

| Component | `childInjectedVars` (preliminary; verify in audit) |
|-----------|----------------------------------------------------|
| `List` | `["$item", "$index", "$isFirst", "$isLast"]` |
| `Items` | `["$item", "$index", "$isFirst", "$isLast"]` |
| `Table` | `["$item", "$itemIndex", "$row", "$rowIndex"]` |
| `DataGrid` | `["$item", "$row", "$rowIndex", "$col", "$colIndex"]` |
| `Select` | `["$item"]` |

### 2.5 Why `$context` is NOT Listed in Metadata

`$context` (from `ContextMenu.openAt()`) is **dispatched into the parent `StateContainer`**, not injected into a child or event scope. It genuinely lives in parent state.

**After removing `PARENT_STATE_DYNAMIC_VARS`, no metadata replacement is needed.** The new algorithm behaves correctly by default:

1. The optimizer sees `{$context}` in some property's expression.
2. It checks the lexical scope (`eventScope` if in a handler, else `injectedVarsScope`).
3. `$context` is **not found** in either scope (because no component declares it as `injectedVars` or `childInjectedVars`).
4. Therefore `$context` is treated as a parent-state dependency — added to `computedUses` — and the container correctly re-renders when it changes.

The hardcoded `PARENT_STATE_DYNAMIC_VARS` Set was a workaround for a missing mechanism. With lexical scoping in place, the workaround is no longer needed — `$context` becomes "just another parent-state variable" with full reactive behavior.

### 2.6 Why Two Separate Keys (`injectedVars` vs `childInjectedVars`)

Rejected alternative: a single `injectedVars` key with mode discriminator.

**Why two keys win:**

1. **Different scope of effect.** `childInjectedVars` flows down to AST children. `injectedVars` (on EventDescriptor) is bound to a single handler expression. Conflating these invites misuse: a `List`'s `$item` is meaningless in the `List`'s own props, but a single key would suggest otherwise.
2. **Different registration point.** Event-injected vars belong to `EventDescriptor` (per-event metadata). Child-injected vars belong to `ComponentMetadata` (per-component contract).
3. **Self-documenting.** An extension developer reading `childInjectedVars` immediately knows "this is what my children will see." Reading `injectedVars` on an `EventDescriptor` immediately knows "this is what my onFetch handler will see."

---

## 3. Algorithm Changes Per Iteration

The work is split into two iterations following the "prove the mechanism on the smaller surface area before extending it" principle. Iteration 1 lands fast and unblocks Extension Packages. Iteration 2 extends the proven mechanism to children.

### 3.1 Iteration 1 — Events Only (Replaces `DATA_FETCH_HANDLER_INJECTED_KEYS`)

**Goal:** Remove `DATA_FETCH_HANDLER_INJECTED_KEYS` and the `node.type === "DataLoader" || "DataSource"` hardcode. Enable extension-defined data loaders.

**Code changes:**

1. **Add `injectedVars?: readonly string[]` to `EventDescriptor`** in `xmlui/src/abstractions/ComponentDefs.ts` (or wherever `EventDescriptor` is defined — verify in audit).

2. **Annotate built-in metadata** for `DataLoader` and `DataSource` (and any other built-in Loader-like components found in audit) with `events.onFetch.injectedVars = ["$queryParams", "$pageInfo"]`. Exact list from audit.

3. **In `computeUsesInternal`** (`xmlui/src/components-core/optimization/computedUses.ts`):
   - Add fourth parameter `injectedVarsScope: ReadonlySet<string> = EMPTY_SET`.
   - Introduce module-level `const EMPTY_SET: ReadonlySet<string> = Object.freeze(new Set<string>())`.
   - In the existing event-handler loop, compute `eventScope = injectedVars.length ? new Set([...injectedVarsScope, ...injectedVars]) : injectedVarsScope`.
   - Replace `if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d))` with `if (!eventScope.has(d))` at the two existing call sites (lines ~436, ~440 per the audit).
   - Pass `injectedVarsScope` through to recursive `computeUsesInternal(child, childFunctionNames, nextDisableNarrowing, injectedVarsScope)` (Iteration 1 passes it through unchanged — children get the same scope as parent; component-level extension comes in Iteration 2).
   - **Do NOT yet remove** the constant `DATA_FETCH_HANDLER_INJECTED_KEYS` or the `node.type === "DataLoader"` check — keep both until the metadata-based path is proven by tests.

4. **Switch over and remove:**
   - Once all tests pass with the metadata-driven path, delete `DATA_FETCH_HANDLER_INJECTED_KEYS` constant.
   - Delete the `node.type === "DataLoader" || node.type === "DataSource"` branch entirely — the optimizer becomes type-agnostic.

**Risk surface:** Limited to event-handler dependency extraction. Cannot affect children or sibling components. Reversible if any test reveals a missed injection (just add it to the relevant `EventDescriptor.injectedVars`).

**Deliverable:** A merged PR that removes one hardcoded constant and unblocks extension-defined data loaders. Performance unchanged (one extra `Set` allocation per event handler with `injectedVars`, all reads stay O(1)).

### 3.2 Iteration 2 — Children Scope (Replaces `PARENT_STATE_DYNAMIC_VARS` + `isRuntimeContextVar`)

**Goal:** Remove `PARENT_STATE_DYNAMIC_VARS` and `isRuntimeContextVar`. Make all `$`-prefixed variables behave uniformly: locally injected ones are filtered via lexical scope; truly parent-state ones (`$context`) flow into `computedUses` naturally.

**Code changes:**

1. **Add `childInjectedVars?: readonly string[]` to `ComponentMetadata`** in `xmlui/src/abstractions/ComponentDefs.ts`.

2. **Annotate built-in metadata** for container components from the audit table (List, Items, Table, DataGrid, Select, etc.).

3. **In `computeUsesInternal`:**
   - Before the children loop, compute `childScope = childInjectedVars.length ? new Set([...injectedVarsScope, ...childInjectedVars]) : injectedVarsScope`.
   - Pass `childScope` (not `injectedVarsScope`) into the recursive call: `computeUsesInternal(child, childFunctionNames, nextDisableNarrowing, childScope)`.
   - Replace `!isRuntimeContextVar(d)` in `keepDep` (line ~496) with `!injectedVarsScope.has(d)`.
   - Replace the two `[...parentDependencies].filter((d) => !PARENT_STATE_DYNAMIC_VARS.has(d))` calls (lines ~519, ~527) with the same `!injectedVarsScope.has(d)` filter — though note: by Iteration 2 the dependencies array should already exclude scoped vars, so these filters may be removable entirely. Verify behavior with tests before deletion.

4. **Switch over and remove:**
   - Once tests pass: delete `PARENT_STATE_DYNAMIC_VARS`, `isRuntimeContextVar`, and any now-dead helpers.
   - The single `keepDep` rule remains, with `injectedVarsScope.has(d)` as the only scope check.

**Risk surface:** Wider — affects every container component that has `childInjectedVars`. The audit must be complete and accurate before this iteration ships. Mitigation: extensive snapshot tests (see Section 4) covering all known list/grid/select scenarios.

**Deliverable:** A merged PR that removes the last two hardcoded constants and finalizes the lexical scoping architecture.

### 3.3 Recommended Per-Iteration File Touch Map

**Iteration 1 (Events):**
- `xmlui/src/abstractions/ComponentDefs.ts` — extend `EventDescriptor`
- `xmlui/src/components-core/optimization/computedUses.ts` — add parameter, in-place event filter
- `xmlui/src/components/DataLoader/*.tsx` (or wherever its metadata lives) — add `injectedVars` to `onFetch`
- `xmlui/src/components/DataSource/*.tsx` — same
- (audit-discovered loader-like components) — same
- `xmlui/tests/components-core/optimization/computedUses.test.ts` — new tests
- `xmlui/tests-e2e/computed-uses.spec.ts` — Bug 21 regression test

**Iteration 2 (Children):**
- `xmlui/src/abstractions/ComponentDefs.ts` — extend `ComponentMetadata`
- `xmlui/src/components-core/optimization/computedUses.ts` — wire children scope, remove constants
- Container component metadata files (List, Items, Table, DataGrid, Select, …) — add `childInjectedVars`
- `xmlui/tests/components-core/optimization/computedUses.test.ts` — extended tests
- `xmlui/tests-e2e/computed-uses.spec.ts` — `$context` reactivity scenario, deep-nesting scenario

### 3.4 Single Long-Lived Branch vs. Two PRs

Recommendation: **two separate PRs**, one per iteration. Rationale:
- Iteration 1 is small, isolated, and unblocks Extension Packages — should not wait on Iteration 2's wider audit.
- A regression in Iteration 2 (wider blast radius) can be bisected against Iteration 1 cleanly.
- Reviewers can validate the scoping primitive (Iteration 1) before committing to the broader migration.

### 3.5 Why No Runtime Feature Flag

A `USE_LEXICAL_SCOPING_FOR_EVENTS` runtime flag was considered and **rejected**:

1. **Static analysis, not runtime behavior.** `computeUsesInternal` is a pure function `AST → string[]`. Its output is deterministic and 100% verifiable in unit tests. If the unit tests show identical `computedUses` arrays between old hardcode and new metadata path, runtime cannot diverge by construction.
2. **Dead-code burden.** A flag would force maintaining both code paths (hardcoded check + lexical scope) inside `computeUsesInternal`, complicating an already non-trivial function.

The Parallel Change pattern (Expand → Migrate → Contract) within a single PR per iteration achieves the same safety with no long-term cost.

---

## 4. Testing Strategy & Critical Scenarios

### 4.1 Test Layer Priority

| Layer | Priority | Coverage target | Where |
|---|---|---|---|
| **Unit (AST → array)** | **Highest — 90% of correctness gained here** | All scope-flow rules, all hardcode-replacement scenarios | `xmlui/tests/components-core/optimization/computedUses.test.ts` |
| **E2E (behavioral)** | High — protects against silent reactivity regressions | Bug 21 regression, `$context` reactivity, deep nesting | `xmlui/tests-e2e/computed-uses.spec.ts` |
| **Performance** | Low — not in CI | Manual React Profiler run on heavy page | Local, one-shot per iteration |

**Rationale:** The optimizer is a pure static analyzer running before React mounts. Feeding it synthetic JSON trees with fake metadata gives near-complete confidence at unit-test speed. E2E exists to catch the cases where unit-test fixtures might miss real-world component metadata realities.

### 4.2 Unit Test Suite — Required Scenarios

For each scenario below, the test fixture is a synthetic `ComponentDef` tree + fake metadata registry, the assertion is the exact `computedUses` array produced by `computeUsesInternal`.

#### Iteration 1 (Events) — Required tests

| # | Scenario | Assertion |
|---|---|---|
| **U1.1** | Built-in `DataLoader` with `onFetch="{ fetch('/api?q=' + $queryParams.q) }"` | `$queryParams` NOT in `computedUses`; only genuine parent deps present |
| **U1.2** | Custom `ExtensionLoader` (unknown to old hardcode) with metadata `events.onFetch.injectedVars = ["$queryParams"]` | `$queryParams` NOT in `computedUses` — **proves extension support** |
| **U1.3** | `DataLoader` with `onFetch` (uses `$queryParams`) AND `onSuccess` (uses `$queryParams` referencing the global router var) | `$queryParams` NOT in `computedUses` from `onFetch`; IS in `computedUses` from `onSuccess` — **proves no horizontal event-scope leak** |
| **U1.4** | Two sibling `DataLoader` nodes both reading `$queryParams` in `onFetch` | Each container's `computedUses` independently lacks `$queryParams` — **proves no sibling leak** |
| **U1.5** | Event handler mixing scoped and non-scoped: `onFetch="{ Actions.submit($queryParams, $context) }"` | `$queryParams` filtered; `$context` retained in `computedUses` |
| **U1.6** | Loader with NO `injectedVars` metadata declared (legacy/missing metadata) | Should NOT crash; should treat all `$`-vars as parent deps (safe fallback) |
| **U1.7** | Same handler source text used twice across different nodes (AST cache path) | Cached AST does not leak scope between the two analysis passes |

#### Iteration 2 (Children) — Required tests

| # | Scenario | Assertion |
|---|---|---|
| **U2.1** | `List` with `<Text value="{$item.name}" />` child | `$item` NOT in container's `computedUses`; container parent deps correct |
| **U2.2** | `List` inside `Table` inside another container — child references `$item` AND `$row` | Both scoped names filtered at correct levels — **proves deep-nesting correctness** |
| **U2.3** | `ContextMenu` with `<MenuItem label="{$context.label}" />` | `$context` IS in `computedUses` — **proves `$context` flows as a real parent dep after `PARENT_STATE_DYNAMIC_VARS` removal** |
| **U2.4** | Two sibling `List` nodes, each with `{$item.x}` in its child | Each container correctly filters `$item`; neither leaks into the other — **scope leakage check** |
| **U2.5** | Mixed: `List` containing `DataLoader` containing handler `onFetch="{ fetch('/api/' + $item.id + '?q=' + $queryParams.q) }"` | Both `$item` (component scope from List) AND `$queryParams` (event scope from onFetch) filtered; `computedUses` empty of both |
| **U2.6** | Custom extension component `MyCarousel` with metadata `childInjectedVars = ["$slide"]` | `$slide` filtered in children — **proves extension support for children** |
| **U2.7** | Component with `childInjectedVars: undefined` (no declaration) | Scope unchanged for children; no crash |

### 4.3 The Three Critical Regression Hot-Spots

These hot-spots come directly from architectural review. Each MUST be covered by at least one unit test.

#### Hot-spot A — Scope Leakage (highest risk)

**What goes wrong:** A scope extension flows to a sibling or back up to a parent, causing siblings to silently lose parent dependencies.

**Why immutable approach prevents it by construction:** The new `Set` is bound to a local variable in the current stack frame. When the function returns, the parent's `injectedVarsScope` reference is untouched. Siblings traversed in the same loop see the *original* parameter, not the extended version.

**Tests guarding this:** U1.3, U1.4, U2.4, U1.7 (AST cache reuse).

#### Hot-spot B — Deep Nesting

**What goes wrong:** A `DataLoader` inside a `List` inside a `Table` fails to compose scopes correctly — e.g., `$item` is forgotten at the innermost level.

**Why immutable approach handles it:** Each level computes `new Set([...parentScope, ...localInjections])`, so the innermost handler sees the union of all enclosing scopes. The base case (root) starts with `EMPTY_SET`; every nested level monotonically extends.

**Tests guarding this:** U2.2, U2.5.

#### Hot-spot C — Mixed Global/Local Vars in One Expression

**What goes wrong:** Handler reads `$queryParams` (local to event) and `$context` (genuine parent dep) in the same expression. Optimizer must distinguish them.

**Why immutable approach handles it:** Per-dependency filter checks `eventScope.has(d)`. `$queryParams` matches; `$context` doesn't — flows through to `computedUses` naturally.

**Tests guarding this:** U1.5, U2.5.

### 4.4 E2E Tests — Behavioral Regressions

#### E1 — Bug 21 Regression (Iteration 1)

**Setup:** App with `DataLoader` that fetches based on `$queryParams.q`; router URL has `?q=foo`.

**Action:** Programmatically navigate to `?q=bar` and back to `?q=foo`.

**Assertion:** Fetch fires exactly once per actual query change. No infinite loop. No re-fetch when an unrelated parent-state variable changes.

#### E2 — `$context` Reactivity (Iteration 2)

**Setup:** App with `ContextMenu` whose `customRender` uses `$context.targetId`.

**Action:** Trigger `openAt()` on three different targets in sequence.

**Assertion:** `customRender` re-runs each time with the new `$context.targetId`. The container is NOT memo-blocked.

#### E3 — Full E2E Suite (Both iterations)

**Setup:** `pnpm test:e2e` end-to-end.

**Assertion:** Same pass count as baseline (currently 6847 passing per `e2e-failures-2026-05-16.md`). Zero new failures.

### 4.5 Performance Verification (Manual, Per Iteration)

Not in CI. Run locally once per iteration before merging:

1. Boot a heavy XMLUI page (e.g., the largest dashboard example in `xmlui/examples/`).
2. Open Chrome DevTools → Performance → Record cold load.
3. Compare boot time vs. baseline (`main` branch) — must be within ±5%.
4. Spot-check: open React Profiler, click a few state-changing buttons, confirm no extra re-renders introduced.

Acceptance: no measurable boot-time regression, no extra re-renders during interaction.

---

## 5. Migration & Backward Compatibility

### 5.1 Backward Compatibility Guarantees

| Concern | Guarantee |
|---|---|
| **Existing components without `injectedVars`/`childInjectedVars`** | Continue to work. `metadata?.events?.[eventName]?.injectedVars ?? []` and `metadata?.childInjectedVars ?? []` default to empty arrays — scope is just `injectedVarsScope` reused by reference. No behavior change for these components. |
| **Third-party components without metadata** | Same as above — opt-in mechanism. Without `injectedVars`, all `$`-prefixed reads are treated as parent deps (safe; may slightly over-subscribe but never under-subscribe). |
| **Public API of `computeUsesInternal`** | Internal function (not exported across module boundary). The new 4th parameter has a safe default — no external callers break. |
| **`EventDescriptor` interface** | New field is optional (`?:`). All existing event metadata remains valid. |
| **`ComponentMetadata` interface** | New field is optional (`?:`). All existing component metadata remains valid. |

### 5.2 Removed Public Exports (Breaking Only If Imported Externally)

After Iteration 2:

| Symbol | Currently exported? | Removal impact |
|---|---|---|
| `IMPLICIT_CONTAINER_COMPONENT_NAMES` | Yes (`export const`) | OUT OF SCOPE — handled by separate spec |
| `PARENT_STATE_DYNAMIC_VARS` | No (module-local `const`) | Zero external impact |
| `DATA_FETCH_HANDLER_INJECTED_KEYS` | No (module-local `const`) | Zero external impact |
| `isRuntimeContextVar` | No (module-local `const`) | Zero external impact |

**Conclusion:** No external API breakage from this work.

### 5.3 Documentation Updates Required

| Doc | Update |
|---|---|
| `xmlui/dev-docs/component-metadata.md` (or equivalent) | Document `EventDescriptor.injectedVars` and `ComponentMetadata.childInjectedVars` with examples |
| `xmlui/src/components-core/optimization/specs/computed-uses-specification.md` | Update Section 4 (Architectural Decisions) to reflect lexical scope mechanism replacing the three hardcoded constants |
| `xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md` | After completion: mark spots 2 and 3 as resolved; leave spot 1 (`IMPLICIT_CONTAINER_COMPONENT_NAMES`) as open |
| Extension Package developer guide (if exists) | Add a section on declaring `injectedVars`/`childInjectedVars` for custom data sources and container-like components |

### 5.4 Audit Tasks (Prerequisite to Implementation)

Before Iteration 1 starts:

1. **Find all built-in loader-like components.** Grep for components whose runtime dispatches `$`-prefixed names. Candidates: `DataLoader`, `DataSource`, possibly websocket/file loaders.
2. **Enumerate exact `injectedVars` per loader event.** Read each loader's React renderer to find what names actually get dispatched into the handler scope.

Before Iteration 2 starts:

3. **Find all built-in container-like components that inject child contextVars.** Candidates: `List`, `Items`, `Table`, `DataGrid`, `Select`, `ItemTemplate`-using components.
4. **Enumerate exact `childInjectedVars` per container.** Read each container's React renderer to find what names it adds to `contextVars` for children.

Each audit produces an authoritative list that replaces the preliminary tables in Section 2.

### 5.5 Rollback Plan

Each iteration is one PR. If a regression slips through:

1. **Iteration 1 regression:** Revert the single PR — restores the `DATA_FETCH_HANDLER_INJECTED_KEYS` hardcode and the `node.type === "DataLoader"` check. Extension Package work remains blocked, but built-in loaders are safe again.
2. **Iteration 2 regression:** Revert the second PR — restores `PARENT_STATE_DYNAMIC_VARS` and `isRuntimeContextVar`. Iteration 1's benefits (event scope + extension support) remain intact.

The two-PR split makes rollbacks surgical.

### 5.6 Definition of Done

**Iteration 1 is done when:**
- All U1.x unit tests pass.
- E1 (Bug 21) E2E test passes.
- Full E2E suite shows no regressions vs. baseline.
- `DATA_FETCH_HANDLER_INJECTED_KEYS` constant and `node.type === "DataLoader"` hardcode are deleted.
- `xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md` updates to mark spot 3 as resolved.

**Iteration 2 is done when:**
- All U2.x unit tests pass.
- E2 (`$context` reactivity) E2E test passes.
- Full E2E suite shows no regressions vs. baseline.
- `PARENT_STATE_DYNAMIC_VARS` constant, `isRuntimeContextVar` function, and `parentDependencies` filtering against `PARENT_STATE_DYNAMIC_VARS` are deleted.
- `TODO - computedUses-hardcoded-brittle-spots.md` updates to mark spot 2 as resolved.
- `computed-uses-specification.md` Section 4 reflects the new lexical scoping mechanism.

---

## 6. Summary of Changes

### Files Created
- (none)

### Files Modified
| File | Iteration | Change |
|---|---|---|
| `xmlui/src/abstractions/ComponentDefs.ts` | 1 + 2 | Add `injectedVars` to `EventDescriptor`; add `childInjectedVars` to `ComponentMetadata` |
| `xmlui/src/components-core/optimization/computedUses.ts` | 1 + 2 | Add `injectedVarsScope` parameter, per-event scope, children scope, delete three hardcoded constants |
| `xmlui/src/components/DataLoader/*` | 1 | Add `injectedVars` to `onFetch` metadata |
| `xmlui/src/components/DataSource/*` | 1 | Same |
| (audit-discovered loader files) | 1 | Same |
| `xmlui/src/components/List/*`, `Items/*`, `Table/*`, `DataGrid/*`, `Select/*` | 2 | Add `childInjectedVars` |
| (audit-discovered container files) | 2 | Same |
| `xmlui/tests/components-core/optimization/computedUses.test.ts` | 1 + 2 | Add U1.x and U2.x unit tests |
| `xmlui/tests-e2e/computed-uses.spec.ts` | 1 + 2 | Add E1, E2 regression tests |
| `xmlui/src/components-core/optimization/specs/TODO - computedUses-hardcoded-brittle-spots.md` | 1 + 2 | Mark spots 2 and 3 as resolved |
| `xmlui/src/components-core/optimization/specs/computed-uses-specification.md` | 2 | Update Section 4 |

### Files Deleted
- (none — all changes in-place)

### Net Code Delta
- **Lines added:** ~100 (metadata field declarations, scope extension logic, ~30-40 new unit tests, 2 e2e tests)
- **Lines deleted:** ~50 (three constants + `isRuntimeContextVar` + two `filter` chains + dead hardcoded type-checks)
- **Net:** ~+50 lines, but eliminates an entire class of silent reactivity bugs.


