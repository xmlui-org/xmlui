# Native Component Pattern

The native component is the React implementation. It must work independently of the XMLUI renderer — other XMLUI components may use it directly.

## Standard Structure

```typescript
import React, { forwardRef, useRef } from "react";
import classnames from "classnames";
import styles from "./ComponentName.module.scss";
import { composeRefs } from "../../utils/ref-utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  variant?: "primary" | "secondary";
  enabled?: boolean;
  // XMLUI infrastructure props — pass through from renderer
  updateState?: (state: Record<string, unknown>) => void;
  registerComponentApi?: (api: Record<string, unknown>) => void;
}

export const defaultProps = {
  enabled: true,
  variant: "primary" as const,
};

export const ComponentNameNative = forwardRef<HTMLDivElement, Props>(
  function ComponentNameNative(
    {
      label,
      variant = defaultProps.variant,
      enabled = defaultProps.enabled,
      updateState,
      registerComponentApi,
      style,
      className,
      ...rest
    },
    ref,
  ) {
    const internalRef = useRef<HTMLDivElement>(null);
    const composedRef = composeRefs(ref, internalRef);

    // Register imperative API (if the component exposes methods to markup)
    useEffect(() => {
      registerComponentApi?.({
        focus: () => internalRef.current?.focus(),
        getValue: () => { /* return current value */ },
      });
    }, [registerComponentApi]);

    return (
      <div
        ref={composedRef}
        className={classnames(styles.component, styles[variant], {
          [styles.disabled]: !enabled,
        }, className)}
        style={style}
        aria-disabled={!enabled}
        {...rest}
      >
        {label && <span className={styles.label}>{label}</span>}
      </div>
    );
  },
);
```

## Key Rules

- Always use `forwardRef` — parent components need DOM refs.
- Wrap with `React.memo` to prevent unnecessary re-renders: `export const ComponentNameNative = memo(forwardRef(function ComponentNameNative(...) { ... }));`
- Export `defaultProps` — the renderer and metadata both reference these.
- Do NOT set `displayName` — not used in this codebase.
- Do NOT use `useImperativeHandle` — use `registerComponentApi` instead.
- Spread `...rest` onto the root element so HTML attributes pass through.
- Accept `style` explicitly and apply it to the root element (`layoutCss` from the renderer flows through `style`).
- Use `composeRefs` when you need both the forwarded ref and an internal ref.

## Default Props Pattern

Define defaults once in `defaultProps`; reference them in both the native component destructuring and the metadata:

```typescript
export const defaultProps = {
  size: "md" as const,
  enabled: true,
};

// Metadata references:
defaultValue: defaultProps.size,

// Native component destructuring:
size = defaultProps.size,

// Renderer does NOT apply defaults — the native component handles them.
```

## Imperative API

Register APIs that XMLUI markup can call (e.g., `componentId.focus()`):

```typescript
useEffect(() => {
  registerComponentApi?.({
    focus: () => inputRef.current?.focus(),
    setValue: (v: string) => {
      setLocalValue(v);
      updateState?.({ value: v });
    },
  });
}, [registerComponentApi, updateState]);
```
