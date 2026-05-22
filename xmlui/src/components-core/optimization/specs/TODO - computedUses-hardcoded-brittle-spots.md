# Hardcoded Brittle Spots in `computedUses.ts`

A catalog of places where the optimizer (`xmlui/src/components-core/optimization/computedUses.ts`) is currently coupled to specific string names. Each spot is a maintenance risk: adding a new component or renaming an existing concept can silently break the optimization without any compile-time error.

**Status:**
Currently, there is **1** remaining hardcoded spot in `computedUses.ts`.

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

## Summary

| # | Constant / Check | Risk if forgotten | Fix strategy |
|---|---|---|---|
| 1 | `IMPLICIT_CONTAINER_COMPONENT_NAMES` | New list-like component silently skips optimization | `isImplicitContainerByDefault` metadata flag |
