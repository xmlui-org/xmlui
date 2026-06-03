# 26 — Performance Profiling

## Why This Matters

React renders all components in a subtree by default whenever parent state changes. In an XMLUI app this means a single timer tick or a rapid sequence of user actions can cause dozens of containers to re-render even when their rendered output does not change. The tools described here let you measure that cost and verify that the `computedUses` narrowing optimization is actually working.

---

## Render-Count Profiler

The render-count profiler is a development-only lightweight counter built into `StateContainer`. It answers the question: *how many times has each container re-rendered since page load?*

**Available in development mode only** (`NODE_ENV === "development"`). In production builds the counter is never created and the helper functions are never registered.

### How It Works

Every `StateContainer` increments its own counter on each render and writes the cumulative value into `window.__renderCounts`. The key format is:

- `"Select"` — a container whose inner component has no explicit UID
- `"Select#my-dropdown"` — a container with a `testId` / UID

Reading the object at any point gives the total render count from page load:

```javascript
window.__renderCounts
// → { "App": 3, "Select": 6, "Button#tick-btn": 16, "Text": 16 }
```

### Helper Functions

Two helper functions are registered on `window` when the module loads in development builds.

**`window.__resetRenderCounts()`** — resets all counters to zero. Call this just before the interaction you want to isolate so the snapshot only reflects renders triggered by that specific action.

```javascript
window.__resetRenderCounts();
// … click the button 15 times …
window.__renderCounts;
// → { "Button#tick-btn": 15, "Text": 15, "Select": 1 }
//                                                  ^^ Select only rendered once — optimization working
```

**`window.__topRenderCounts(n = 10)`** — returns an array of `[label, count]` pairs sorted highest-first, capped at `n`. Use this to spot the hottest components at a glance.

```javascript
window.__topRenderCounts(5);
// → [["App", 42], ["Text", 16], ["Button#tick-btn", 16], ["Select", 6], ["Option", 6]]
```

### Typical Workflow

1. Open browser DevTools console (F12 → Console tab).
2. Reproduce the interaction that feels slow (click a button 10–15 times, wait for data load, navigate back and forth).
3. Call `__topRenderCounts(10)` — components near the top are the most expensive.
4. If a container renders far more often than expected, its `computedUses` is likely too broad or absent. A container without `computedUses` receives *all* parent state on every parent render.
5. Call `__resetRenderCounts()` and repeat a single targeted action to isolate which state change triggers the excess renders.

### Connection to `computedUses`

The `computedUses` static analysis (see `src/components-core/optimization/computedUses.ts`) narrows which parent-state keys each container subscribes to. A `Select` that only references `rarelyChanges` should show a render count of ≤5 even after 15 rapid `oftenChanges` updates — the framework skips re-rendering it because its subscribed keys did not change.

If the count tracks the parent's render count instead, `computedUses` is not being computed or is being suppressed. Common causes:

| Symptom in `__topRenderCounts` | Likely cause |
|--------------------------------|-------------|
| `Select` renders every parent render | `Select` has no `computedUses` — check that `parentDependencies` is populated in the parsed node |
| Narrowing works for `Select` directly in `App` but not inside a user component | The wrapping `<Component>` has a `<script>` block, which sets `nextDisableNarrowing = true` and propagates it to all children |
| All containers show identical counts | Parent state is changing on every render for an unrelated reason — check for unstable object references in the parent |

---

## Further Reading

- `src/components-core/optimization/computedUses.ts` — the static analysis that computes `computedUses`
- `dev-docs/guide/03-container-state.md` — how `StateContainer` layers compose state
- `dev-docs/guide/19-inspector-debugging.md` — the trace-based Inspector for event/handler/API debugging
