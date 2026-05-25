# Code Review: `yurii/computedUses` branch vs `main` — Outstanding Items

> Analysis Date: 2026-05-15
> Last Update: 2026-05-25
> Comparison: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD
> Resolved items (B1, D3, D4, D7, N1, N2, N3, N4, N5, D6, D8, C4, P3, R3, P4, D5) have been removed from this file.

---

## 🟠 Reference-identity / fragile patterns

### N6: Render-phase ref mutation also lives in `Container.tsx`

[Container.tsx:159-160](xmlui/src/components-core/rendering/Container.tsx#L159-L160):

```tsx
const componentStateRef = useRef<Record<string, any>>(componentState);
componentStateRef.current = componentState;
```

Same idempotent-write-during-render pattern as **R2**. Inline comment explains the intent ("Updated in render phase (idempotent assignment)"). Safe under React 18; same caveat about future React Cache / Server Components compatibility.

---

## 🟠 Render-phase side effects

### R2: Render-phase ref mutation in `ComponentWrapper`

[ComponentWrapper.tsx:105-106](xmlui/src/components-core/rendering/ComponentWrapper.tsx#L105-L106):

```tsx
const fullParentStateRef = useRef<Record<string, any> | undefined>(undefined);
fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;
```

Side-effect during render. React 18 strict mode doubles renders — assignment is idempotent, OK. Concurrent rendering may interrupt — on retry, the same value is assigned (because `state` is the same prop). Safe today; React docs label render-phase side effects as "avoid" with future React Cache / Server Components in mind.

**Mitigation if needed later:** Move to `useInsertionEffect` or wrap in `useSyncExternalStore` semantics. Not urgent.

---








---

## Summary (Remaining Items)

| #   | Location                                                        | Problem                                                                       | Severity        |
|-----|-----------------------------------------------------------------|-------------------------------------------------------------------------------|-----------------|
| N6  | `Container.tsx:159-160`                                         | Same render-phase ref mutation as R2                                          | 📝 Note         |
| R2  | `ComponentWrapper.tsx:106`                                      | Render-phase ref mutation                                                     | 📝 Note         |

All remaining items are defer-grade — none should block merging.

## Resolved Items (This Session)

- **P3**: Removed redundant `extractScopedState` in `StateContainer.tsx` — state already scoped by `ComponentWrapper`.
- **R3**: Moved render-counter to `useLayoutEffect` (Rules of Hooks fix included in follow-up commit).
- **P4**: Added `useShallowCompareMemoize(node)` in `ContainerWrapper` before `getWrappedWithContainer` — prevents unnecessary re-wrapping when node gets new object identity with same field values.
- **D5**: Added `Float16Array` (ES2025) to `JS_STDLIB_GLOBALS` + four-step MAINTENANCE NOTE checklist for future ES-version reviews.
