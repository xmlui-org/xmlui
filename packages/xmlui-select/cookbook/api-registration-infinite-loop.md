# API Registration and the Infinite Loop

This document explains why naively registering component APIs in a `wrapCompound`-based component causes an infinite render loop, how the problem was solved in `SelectRender`, and what alternative approaches exist.

---

## 1. Background: what `registerApi` does

`wrapCompound` passes a `registerApi` function to the render component. Calling it registers methods (like `setValue`, `clear`, `focus`) on the XMLUI component instance, making them available to XMLUI markup via `id`-based API calls:

```xml
<SelectW id="mySelect" />
<Button onDidClick="mySelect.setValue('red')" />
```

Internally, `registerApi` is a thin wrapper over `registerComponentApi`, which stores API objects in a shared XMLUI state atom using **immer's `produce`**:

```ts
// Simplified XMLUI internals
setComponentApis(produce(draft => {
  draft[uid] = apiObject;   // immer checks each key by reference
}));
```

This is the root of the problem.

---

## 2. The infinite loop: step by step

### 2.1 Where unstable references come from

Every time XMLUI re-renders a component, `wrapCompound`'s renderer function runs. Inside it, `lookupEventHandler("didChange")` returns a **new function reference** — it wraps the user's event expression in a fresh closure each render. This new reference becomes `__onDidChange`.

`StateWrapper` (inside `wrapCompound`) creates `onChange` as:

```ts
const onChange = useCallback((newValue) => {
  setLocalValue(...);
  __onDidChange?.(newValue);
}, [__onDidChange]);  // <-- re-created whenever __onDidChange changes
```

Because `__onDidChange` is a new reference on every XMLUI render, `onChange` is also a new reference on every render.

### 2.2 The naive registration

The intuitive way to register APIs is:

```ts
useEffect(() => {
  registerApi({
    setValue: (v) => onChange(normalizeToArray(v)),  // captures onChange
    clear: () => onChange([]),
    getValue: () => selectedValues[0],
  });
}, [registerApi, onChange, selectedValues]);  // deps include onChange and selectedValues
```

This looks correct — the effect re-runs when `onChange` or `selectedValues` changes to keep the API functions fresh.

### 2.3 The loop

Here is what actually happens on every XMLUI render:

```
XMLUI renders
  → lookupEventHandler returns new __onDidChange reference
  → StateWrapper: onChange re-created (new reference)
  → SelectRender: useEffect deps changed ([..., onChange])
  → effect runs: registerApi({ setValue: () => onChange(...) })
  → registerComponentApi calls immer's produce
  → immer: draft[uid].setValue !== newSetValue  (new function reference!)
  → immer produces a new state object
  → setComponentApis triggers XMLUI re-render
  → XMLUI renders again  ← back to top
```

The loop is self-sustaining because every XMLUI re-render produces a new `onChange`, which produces new API functions, which immer sees as changed state, which causes another re-render.

### 2.4 The same problem with `handleValueChange`

Ark-UI's `Select.Root` has an internal `useEffect` that includes `onValueChange` in its dependency array. If `handleValueChange` is a new reference on every render (e.g. created with `useCallback([onChange])`), ark-ui re-fires `onValueChange` with the current value → `onChange` → `updateState` → XMLUI re-render → new `onChange` → loop.

---

## 3. The solution: stable refs

The fix applied in `SelectRender` is the **stable ref pattern**: decouple the function's *identity* from its *behavior*.

```ts
// 1. Keep a ref that always holds the latest onChange
const onChangeRef = useRef(onChange);
onChangeRef.current = onChange;         // updated synchronously during render

// 2. Keep refs for other values that need to be fresh at call time
const selectedValuesRef = useRef(selectedValues);
selectedValuesRef.current = selectedValues;
const multipleRef = useRef(multiple);
multipleRef.current = multiple;

// 3. Create API functions ONCE on mount — they read current values via refs
useEffect(() => {
  registerApi({
    focus:    () => triggerRef.current?.focus(),
    setValue: (v) => { onChangeRef.current(normalizeToArray(v)); },
    clear:    () => { onChangeRef.current([]); },
    getValue: () => multipleRef.current
      ? selectedValuesRef.current
      : selectedValuesRef.current[0] ?? undefined,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [registerApi]);  // runs once — registerApi itself is stable
```

**Why this works:**

- The arrow functions passed to `registerApi` are created exactly once (on mount). Their references never change, so immer sees no difference between renders and never updates the API state atom.
- The refs (`onChangeRef`, `selectedValuesRef`, `multipleRef`) are mutated synchronously during rendering (not in effects), so they always hold fresh values by the time any API method is called.
- `registerApi` itself is stable — it comes from `wrapCompound`'s `StateWrapper` via `useCallback([], [__registerComponentApi])`, and `registerComponentApi` is a stable XMLUI internal.

The same pattern fixes `handleValueChange`:

```ts
const handleValueChange = useCallback(
  ({ value: newValues }) => {
    onChangeRef.current(newValues);   // reads latest onChange via ref
  },
  [],  // empty deps — identity never changes
);
```

Ark-ui's internal effect sees a stable `onValueChange` reference and never re-fires spuriously.

---

## 4. Why updating refs during render is safe

Mutating `ref.current` during the render phase (outside of effects) is a documented React pattern. React guarantees that renders are pure and deterministic when using concurrent features — but ref mutation during render is explicitly allowed for "escape hatches" that need to be kept up-to-date synchronously without triggering re-renders. The React docs use this exact pattern for event handler refs.

The key invariant to maintain: **never read `ref.current` during rendering itself** (only during events/effects). In `SelectRender`, the refs are only read inside callback bodies, which run in response to user interaction or API calls — never during the render phase.

---

## 5. Alternatives

### 5.1 `useEvent` (React RFC / XMLUI utility)

The XMLUI core already ships a `useEvent` hook (in `useEvent` from `../../components-core/utils/misc`). It implements the stable ref pattern as a reusable abstraction:

```ts
import { useEvent } from "xmlui";

const handleValueChange = useEvent(({ value: newValues }) => {
  onChange(newValues);
});
```

`useEvent` returns a stable function identity that internally delegates to the latest version of the callback. This is cleaner than managing refs manually.

**Limitation:** `useEvent` works for a single callback. When you need to expose *multiple* API methods that all need access to the same ref, the manual pattern from section 3 is more explicit about what is shared.

### 5.2 `useReducer` to decouple state from callbacks

Instead of `useState` + callbacks that capture the current value, you can use `useReducer`. The dispatch function is guaranteed stable by React:

```ts
const [state, dispatch] = useReducer(reducer, initialState);

useEffect(() => {
  registerApi({
    setValue: (v) => dispatch({ type: "SET_VALUE", payload: v }),
    clear:    () => dispatch({ type: "CLEAR" }),
    getValue: () => stateRef.current.value,  // still need a ref for reads
  });
}, [registerApi]);
```

`dispatch` never changes, so the effect only runs on mount. The tradeoff is that `onChange` (which must call the XMLUI `updateState`) still needs the ref pattern, since `dispatch` only updates local state.

### 5.3 Fix the source: stable event handlers in XMLUI

The root cause is that `lookupEventHandler` returns a new function reference on every render. If XMLUI's internals memoized event handlers by component uid + event name, the entire ref pattern would be unnecessary.

This is an upstream fix that would benefit all `wrapCompound` components, not just `SelectRender`. The cost is that the memoization must be invalidated correctly when the XMLUI markup changes (e.g. when an expression binding updates).

### 5.4 Do not use `wrapCompound` — manage state manually

If the API surface is complex enough, it may be cleaner to write a full `createComponentRenderer` manually, managing all XMLUI state and API registration explicitly. This removes the intermediate `StateWrapper` layer and gives full control over when effects run and what they depend on.

The tradeoff is more boilerplate: you must handle `initialValue`, `updateState`, value syncing, and `registerComponentApi` yourself — everything that `wrapCompound` provides for free.

---

## 6. Summary

| Approach | API identity stable? | Fresh values at call time | Complexity |
|---|---|---|---|
| Naive `useEffect([onChange])` | No — loop | Yes | Low |
| Stable ref pattern (used here) | Yes | Yes (via refs) | Medium |
| `useEvent` per callback | Yes | Yes | Low |
| `useReducer` | Yes (dispatch) | Partial | Medium |
| Upstream fix in XMLUI | Yes | Yes | High (core change) |
| Manual `createComponentRenderer` | Full control | Full control | High |

The stable ref pattern was chosen because it is explicit, requires no external abstractions, and makes the reasoning about the infinite loop directly visible in the code through comments.
