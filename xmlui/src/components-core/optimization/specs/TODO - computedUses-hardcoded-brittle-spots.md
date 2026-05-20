# Hardcoded Brittle Spots in `computedUses.ts`

A catalog of places where the optimizer (`xmlui/src/components-core/optimization/computedUses.ts`) is currently coupled to specific string names. Each spot is a maintenance risk: adding a new component or renaming an existing concept can silently break the optimization without any compile-time error.

**Status after 2026-05-20 refactoring:**
Currently, there are **3** remaining hardcoded spots in `computedUses.ts`.

---

## 1. `IMPLICIT_CONTAINER_COMPONENT_NAMES`

```typescript
// computedUses.ts ~L64
export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", "Table", "DataGrid"]);
```

Used twice in `computeUsesInternal`:
- To add a component's own UID to `parentDependencies` so siblings can read its bubbled state.
- To decide `isImplicitDefault` (whether a component with free vars should be promoted to an implicit container).

### Risk
Every new component that should behave like `Select`/`List` (i.e., an internally-stateful
list-like component) must be manually added here. Omission means the component never gets
the narrowing optimization, silently degrading performance — no error is thrown.

### Proposed fix
Add `isImplicitContainerByDefault: true` to `createMetadata()`. The optimizer reads
this flag from the component registry instead of checking a hardcoded Set. The constant
`IMPLICIT_CONTAINER_COMPONENT_NAMES` can then be deleted.

---

## 2. `PARENT_STATE_DYNAMIC_VARS` / `$context`

```typescript
// computedUses.ts ~L164
const PARENT_STATE_DYNAMIC_VARS = new Set(["$context"]);
```

`$context` is written into the parent StateContainer via implicit dispatch by
`ContextMenu.openAt()`. It lives in the parent state map — unlike `contextVars`
which are per-render injections — so the optimizer must NOT filter it out.

### Risk
Any new component that writes a `$`-prefixed variable into the parent state via
implicit dispatch must be manually added here. Omission means that the optimizer
filters the variable out, the ancestor container becomes memo-blocked when it changes,
and the UI stops reacting to those state updates (the exact bug `$context` was added to fix).

### Proposed fix
Add `injectsStateVar: string | string[]` to the metadata of any component that
dispatches a `$`-prefixed variable into its parent container (e.g. `ContextMenu`).
During boot, `computedUses` builds `PARENT_STATE_DYNAMIC_VARS` dynamically by
scanning the component registry for this flag instead of hardcoding names.

---

## 3. Loader type checks + `DATA_FETCH_HANDLER_INJECTED_KEYS`

```typescript
// computedUses.ts ~L292 & ~L315
const isDataLoader = node.type === "DataLoader" || node.type === "DataSource";
// ...
if (isDataLoader && key === "fetch" && raw != null) {
  // filter out DATA_FETCH_HANDLER_INJECTED_KEYS
}
```

```typescript
// computedUses.ts ~L172
const DATA_FETCH_HANDLER_INJECTED_KEYS = new Set([
  "$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams",
]);
```

This is the "Bug 21" workaround (fully detailed in `event-context-shadowing-proposal.md`).
The optimizer detects a specific component type *by name* and a specific event *by name*
to apply special filtering for locally injected variables that collide with global routes.

### Risk
- If `DataLoader` or `DataSource` is renamed, the guard silently stops working.
- If a new loader component (e.g., `GraphQLLoader`) also injects `$queryParams` into
  its handler, this workaround must be manually duplicated for that new type.
- If the event is renamed from `"fetch"` to anything else, the guard silently stops working.

### Proposed fix
Described fully in `event-context-shadowing-proposal.md`. In summary:
- Add `injectedVars: string[]` to `EventDescriptor` in component metadata.
- `computedUses` reads `injectedVars` from the event's metadata and adds those variables
  to `localDeclared` while processing that event's AST.
- Delete `DATA_FETCH_HANDLER_INJECTED_KEYS`, `isDataLoader`, and the `key === "fetch"` guard.
- Add a dev-mode runtime guard in the event dispatcher to enforce that new components
  always declare their `injectedVars`.

---

## Summary

| # | Constant / Check | Risk if forgotten | Fix strategy |
|---|---|---|---|
| 1 | `IMPLICIT_CONTAINER_COMPONENT_NAMES` | New list-like component silently skips optimization | `isImplicitContainerByDefault` metadata flag |
| 2 | `PARENT_STATE_DYNAMIC_VARS` (`$context`) | New dispatch var stops triggering re-renders | `injectsStateVar` metadata flag on dispatching components |
| 3 | `isDataLoader` + `"fetch"` + injected keys | New loader gets no `$queryParams` protection | `injectedVars` on `EventDescriptor` + dev-mode guard |

