# Component State Management

## Which Approach to Use

| Scenario | Approach |
|---|---|
| Simple local UI state (open/closed, hover) | `useState` in the native component |
| Value that XMLUI markup can read or bind to | `updateState` + `state` via the renderer |
| Value that XMLUI markup can set via API | `registerComponentApi` + `updateState` |
| Two-way sync with an external prop | Hybrid controlled/uncontrolled pattern |

## XMLUI State (updateState / state)

Use this when the component's value needs to be accessible in markup bindings (e.g., `{myInput.value}`).

**Renderer** — passes `state` and `updateState` to the native component:
```typescript
({ node, extractValue, state, updateState, registerComponentApi, lookupEventHandler }) => (
  <ComponentNative
    value={state.value}
    initialValue={extractValue(node.props.initialValue)}
    updateState={updateState}
    registerComponentApi={registerComponentApi}
    onDidChange={lookupEventHandler("didChange")}
  />
)
```

**Native component** — calls `updateState` when value changes:
```typescript
const handleChange = (newValue: string) => {
  updateState?.({ value: newValue });
  onDidChange?.();
};
```

**Imperative update via API**:
```typescript
useEffect(() => {
  registerComponentApi?.({
    setValue: (v: string) => {
      setLocalValue(v);
      updateState?.({ value: v });
      onDidChange?.();
    },
    getValue: () => localValue,
  });
}, [registerComponentApi, updateState, localValue, onDidChange]);
```

## Controlled vs Uncontrolled

```typescript
// Uncontrolled — manages its own state, notifies parent
const [value, setValue] = useState(defaultValue ?? "");
const handleChange = (v: string) => { setValue(v); onChange?.(v); };

// Controlled — parent owns the state
// (no internal state; value comes entirely from props)

// Hybrid — supports both patterns
const isControlled = value !== undefined;
const [internal, setInternal] = useState(defaultValue ?? "");
const effective = isControlled ? value : internal;
const handleChange = (v: string) => {
  if (!isControlled) setInternal(v);
  onChange?.(v);
};
```

## External Synchronization

When an external prop can change independently of user input, sync with `useEffect`:

```typescript
useEffect(() => {
  if (externalValue !== lastSynced.current) {
    setLocalValue(externalValue ?? "");
    lastSynced.current = externalValue;
  }
}, [externalValue]);
```

## Common React Hooks Reference

- `useState` — local state triggering re-renders
- `useRef` — mutable value without re-render (DOM refs, previous-value tracking)
- `useEffect` — side effects and cleanup
- `useMemo` — memoize expensive derived values
- `useCallback` — memoize callbacks passed to children
