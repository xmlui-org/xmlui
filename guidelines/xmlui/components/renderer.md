# Component Renderer

The renderer bridges XMLUI markup and the native React component. It is created with `createComponentRenderer` and registered in `ComponentProvider.tsx`.

## Registration

```typescript
// In ComponentProvider.tsx
import { componentNameComponentRenderer } from "./ComponentName/ComponentName";
// ...
if (process.env.VITE_USED_COMPONENTS_ComponentName !== "false") {
  this.registerCoreComponent(componentNameComponentRenderer);
}
```

## Critical rule: no React hooks in renderer functions

Renderer functions are **not** React components — they are plain factory functions. Never put `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, or any other hook directly inside a renderer function. Hooks belong in the native component.

```typescript
// ❌ WRONG — hooks in renderer function
export const componentRenderer = createComponentRenderer(COMP, ComponentMd,
  ({ node, extractValue }) => {
    const [state, setState] = useState();  // ← forbidden
    useEffect(() => { ... }, []);          // ← forbidden
    return <ComponentNative ... />;
  },
);

// ✅ CORRECT — all hooks live in the native component
export const componentRenderer = createComponentRenderer(COMP, ComponentMd,
  ({ node, extractValue, state, updateState, registerComponentApi, lookupEventHandler, layoutCss }) => {
    return (
      <ComponentNameNative
        value={extractValue(node.props.value)}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        onDidChange={lookupEventHandler("didChange")}
        style={layoutCss}
      />
    );
  },
);
```

## Renderer Skeleton

```typescript
import { createComponentRenderer } from "../../components-core/utils/createComponentRenderer";
import { ComponentNameNative, defaultProps } from "./ComponentNameNative";
import { ComponentNameMd } from "./ComponentName";

export const componentNameComponentRenderer = createComponentRenderer(
  "ComponentName",
  ComponentNameMd,
  ({ node, extractValue, state, updateState, renderChild, lookupEventHandler,
     registerComponentApi, layoutCss, appContext }) => {
    return (
      <ComponentNameNative
        label={extractValue.asDisplayText(node.props.label)}
        variant={extractValue.asOptionalString(node.props.variant)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, defaultProps.enabled)}
        value={state.value}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        onClick={lookupEventHandler("click")}
        onDidChange={lookupEventHandler("didChange")}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </ComponentNameNative>
    );
  },
);
```

## Renderer Context Properties

| Property | Use |
|---|---|
| `node.props.*` | Raw prop values from markup (may be binding expressions) |
| `node.children` | Child nodes |
| `state` | Current XMLUI container state for this component |
| `extractValue(prop)` | Evaluates a prop (resolves bindings) |
| `renderChild(children)` | Recursively renders child nodes |
| `lookupEventHandler(name)` | Returns a callback for the named event |
| `registerComponentApi` | Pass to native to register imperative API methods |
| `updateState` | Pass to native to update container state |
| `layoutCss` | Pre-computed layout styles — always pass as `style` |
| `uid` | Unique component instance ID |
| `appContext` | Global app functions: `navigate`, `toast`, `confirm` |

## Value Extraction

```typescript
extractValue(node.props.value)                          // raw — any type
extractValue.asString(node.props.label)                 // string or undefined
extractValue.asDisplayText(node.props.label)            // string for display (coerces)
extractValue.asOptionalString(node.props.variant)       // string | undefined
extractValue.asOptionalBoolean(node.props.enabled, true)// boolean with default
extractValue.asOptionalNumber(node.props.count, 0)      // number with default
extractValue.asSize(node.props.width)                   // CSS size string
```

## Event Handlers

```typescript
onClick={lookupEventHandler("click")}
onFocus={lookupEventHandler("gotFocus")}
onBlur={lookupEventHandler("lostFocus")}
onDidChange={lookupEventHandler("didChange")}
```

The string passed to `lookupEventHandler` must match the event key in the component's metadata.

## Rendering Children

```typescript
// Simple — render children as-is
renderChild(node.children)

// With layout wrapper
renderChild(node.children, { type: "Stack", orientation: "horizontal" })

// Conditional
renderChild(node.children) || <span>{label}</span>
```
