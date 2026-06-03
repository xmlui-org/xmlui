# TODO: Architectural Research — Redundant Implicit Containers Elimination

## Context
The current `computedUses` optimization strategy employs a "bottom-up" dependency propagation. When a component is marked with `isImplicitContainerByDefault: true` (e.g., `Form`, `Table`, `Splitter`, `Tabs`), it is promoted to a `StateContainer` if it or any of its descendants read from the parent state.

## The Problem: The "Matryoshka" Effect
Nested heavy components often create redundant `StateContainer` layers. 
**Example:**
```xml
<Splitter> <!-- Heavy, promoted if Form has deps -->
  <Form> <!-- Heavy, promoted if Table has deps -->
    <Table /> <!-- Heavy, promoted if it has deps -->
  </Form>
</Splitter>
```
If the `Table` reads `user.name`, all three components currently become containers. This leads to:
1.  **Deep React Trees:** Unnecessary `Context.Provider` and `React.memo` wrappers.
2.  **Redundant Evaluation:** Each container performs its own `shallowCompare` of dependencies, even though the inner-most shield already protects the bulk of the work.
3.  **Memory Overhead:** Multiple `computedUses` arrays and state slices for the same logical unit.

---

## Proposal: Smart Container Promotion (Shield Delegation)

Identify "Bare-Heavy" components that can skip container promotion if their children are already sufficiently isolated.

### The Strategy
A "Heavy" component (with `isImplicitContainerByDefault: true`) should **ONLY** be promoted to a container if:
1.  **Own Dependencies:** The component itself has read-dependencies in its props (e.g., `<Splitter proportion="{myVar}" />`).
2.  **Unshielded Descendants:** It has "light" children (primitives like `Text`, `Button`, `VStack`) that have read-dependencies and are not yet covered by an inner container.
3.  **Linear Complexity (Data Multipliers):** The component is a `List`, `Table`, or `DataGrid`. These should likely *always* be containers if they have *any* child dependencies, to prevent the parent from triggering a re-render of the entire iteration logic (the `.map()` call) on every unrelated state change.

### Analysis Requirements
To implement this, the `computeUsesInternal` function needs to distinguish between "bubbled-up shielded dependencies" and "unshielded dependencies".

---

## Fragility and Risks (The "Why this is hard" section)

1.  **The "Late Leaks" Problem:** If a `Splitter` is not promoted because its child `Form` is a container, but then a developer adds a simple `<Text value="{user.id}" />` as a sibling to the `Form` inside the `Splitter`, the `Splitter` **must** be retroactively promoted or the `Text` component will re-render on every `App` state change.
2.  **Dynamic Restructuring:** Some components (like `Page` or `CompoundComponent`) might restructure their children at runtime. Static analysis of "shielded children" might be invalidated if the runtime tree looks different.
3.  **Transparent Wrappers:** Layout components (`VStack`, `HStack`) are already transparent. We must ensure that "Heavy" components don't become *too* transparent, losing the benefit of protecting their own complex DOM or internal hooks.
4.  **Shadowing/Context Leakage:** If a component injects context (like `$item`), the boundary of the container must strictly align with where that context is available.

---

## Decision Matrix for Future Implementation

| Component Type | Subtree Status | Decision |
| :--- | :--- | :--- |
| **Structural** (`Splitter`, `Tabs`) | All children are Containers | **Skip Promotion** (Bare) |
| **Structural** (`Splitter`, `Tabs`) | Has 1+ Primitive child with Read-Deps | **Promote** (Container) |
| **Data Multiplier** (`List`, `Table`) | Any Read-Deps in subtree | **Always Promote** (Container) |
| **Atomic-Heavy** (`Markdown`) | Own Read-Deps | **Promote** (Container) |

## Next Steps
1.  **Profiling:** Use React DevTools to measure the impact of 3-4 nested `StateContainers` vs a single top-level shield.
2.  **Algorithm Update:** Modify `computeUsesInternal` to return a tuple or object that separates `unshieldedReadDeps` from `totalReadDeps`.
3.  **Metadata Extension:** Add `promotionPolicy: "always" | "smart"` to `ComponentMetadata` to distinguish between `List` and `Splitter`.
