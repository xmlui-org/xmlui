# Component Architecture: The Two-File Pattern

Every built-in XMLUI component is built from two cooperating files. This document explains what each file does, why they exist separately, and how to read and write them.

---

## Why Two Files?

XMLUI separates **what a component is** from **how it renders**:

- **`ComponentName.tsx`** — the XMLUI side. Defines the component's public contract (props, events, APIs, theme variables) and the *bridge function* that translates XMLUI's reactive context into React props.
- **`ComponentNameNative.tsx`** — the React side. A normal `forwardRef` + `memo` component that takes plain props and produces DOM output.

This boundary exists for a specific reason: the bridge function in `ComponentName.tsx` runs in the XMLUI rendering pipeline and must not use React hooks. All hooks live in the native component. The separation makes this constraint structurally clear.

---

## The Renderer File (`ComponentName.tsx`)

### Structure

```
ComponentName.tsx:
  1. Import metadata helpers, SCSS styles
  2. Import the native component + defaultProps
  3. Define the metadata constant (ComponentNameMd)
  4. Define and export the renderer (componentNameComponentRenderer)
```

### Metadata — The Component's Public Contract

`createMetadata` defines everything the framework, tooling, and documentation system need to know about a component:

```typescript
const COMP = "Text";

export const TextMd = createMetadata({
  status: "stable",
  description: "Displays textual content with optional styling.",

  props: {
    value: {
      description: "The text to display.",
      valueType: "string",
    },
    variant: {
      description: "Named text style preset.",
      valueType: "string",
      availableValues: ["heading1", "heading2", "body", "caption"],
      defaultValue: defaultProps.variant,
    },
    preserveLinebreaks: {
      description: "Preserve line breaks in the text.",
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
  },

  events: {
    contextMenu: dContextMenu(COMP),
  },

  apis: {
    hasOverflow: {
      description: "Returns true when the text overflows its container.",
      signature: "hasOverflow(): boolean",
    },
  },

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`textColor-${COMP}`]:    "$textColor",
    [`fontSize-${COMP}`]:     "$fontSize",
    [`fontWeight-${COMP}`]:   "$fontWeight-normal",
  },
});
```

**What each section does:**

| Section | Purpose |
|---------|---------|
| `status` | Whether the component is `"stable"`, `"experimental"`, or `"deprecated"` |
| `description` | Shown in documentation and tooling |
| `props` | Defines accepted attributes with type, description, and default value |
| `events` | Named events the component fires (referenced in markup as `on<Event>`) |
| `apis` | Imperative methods callable via `id` in markup |
| `contextVars` | `$`-prefixed variables this component exposes to its children |
| `parts` | Named sub-elements for granular theming |
| `themeVars` | CSS custom properties the component responds to |
| `defaultThemeVars` | Fallback values for those variables |
| `nonVisual` | Set to `true` for components with no DOM output (skip SCSS and themeVars) |

**Helper functions** for common events:

| Helper | Produces |
|--------|---------|
| `d("desc")` | Generic descriptor |
| `dClick(COMP)` | Standard click event |
| `dInit(COMP)` | Init event (fires before first render) |
| `dGotFocus(COMP)` / `dLostFocus(COMP)` | Focus events |
| `dContextMenu(COMP)` | Context menu event |

### The Renderer Function

```typescript
export const textComponentRenderer = createComponentRenderer(
  "Text",
  TextMd,
  ({ node, extractValue, state, renderChild, lookupEventHandler,
     registerComponentApi, updateState, classes }) => {
    return (
      <Text
        variant={extractValue(node.props.variant)}
        preserveLinebreaks={extractValue.asOptionalBoolean(
          node.props.preserveLinebreaks,
          defaultProps.preserveLinebreaks
        )}
        registerComponentApi={registerComponentApi}
        onContextMenu={lookupEventHandler("contextMenu")}
        classes={classes}
      >
        {extractValue.asDisplayText(node.props.value) || renderChild(node.children)}
      </Text>
    );
  },
);
```

The renderer function is a **plain function, not a React component**. React hooks are not allowed here. Its job is to extract XMLUI values and hand them to the native React component as ordinary props.

**Key rules:**
- `node.props.*` values are raw (may be binding expression ASTs). Always route them through `extractValue` before passing to the native component.
- The event name string in `lookupEventHandler("contextMenu")` must match a key in the metadata's `events` section.
- `classes` carries per-part CSS generated from theme variables. Pass it through.

> **Note — active migration:** The codebase is progressively moving from the `createComponentRenderer` approach shown above to `wrapComponent`, a higher-level integration helper. Both produce the same runtime result; `wrapComponent` reduces boilerplate for the common case. The `wrapComponent` API is covered in depth in [05-wrapcomponent.md](05-wrapcomponent.md). When reading existing component source, you will encounter both patterns.

### Renderer Context Properties

The renderer receives a single context object:

| Property | Use |
|----------|-----|
| `node.props` | Raw prop values from markup |
| `node.children` | Child component definitions |
| `state` | Container state (loader results, component state) |
| `extractValue` | Evaluates expressions and coerces types |
| `renderChild(node.children)` | Recursively renders child nodes |
| `lookupEventHandler("name")` | Returns the async callback for a named event |
| `registerComponentApi` | Pass to native component so it can register imperative methods |
| `updateState` | Update this component's container state |
| `classes` | Per-part theme CSS class names |
| `appContext` | Global functions: `navigate()`, `toast()`, `confirm()` |

---

## Value Extraction

`extractValue` evaluates a prop that may be a literal, a binding expression `{...}`, or a constant. It also coerces the result to a target type:

| Method | Returns | Use |
|--------|---------|-----|
| `extractValue(expr)` | `any` | Raw evaluated value |
| `extractValue.asString(expr)` | `string` | Coerce to string; `""` if undefined |
| `extractValue.asDisplayText(expr)` | `string` | Like `asString` but collapses consecutive spaces |
| `extractValue.asOptionalString(expr, default?)` | `string \| undefined` | String or default |
| `extractValue.asNumber(expr)` | `number` | Throws if not numeric |
| `extractValue.asOptionalNumber(expr, default?)` | `number \| undefined` | Number or default |
| `extractValue.asBoolean(expr)` | `boolean` | JS truthiness semantics |
| `extractValue.asOptionalBoolean(expr, default?)` | `boolean \| undefined` | Boolean or default |
| `extractValue.asSize(expr)` | `string \| undefined` | CSS size string; resolves theme variables |

**Example:**
```typescript
// Markup: <Slider min="0" max="{limit}" step="5" />
minimum={extractValue.asOptionalNumber(node.props.min, 0)}    // → 0
maximum={extractValue.asOptionalNumber(node.props.max)}       // → value of 'limit'
step={extractValue.asOptionalNumber(node.props.step, 1)}      // → 5
```

---

## The Native File (`ComponentNameNative.tsx`)

The native component is a standard React component with two structural requirements: `forwardRef` (so parent components can obtain a DOM ref) and `memo` (to prevent unnecessary re-renders).

```typescript
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  variant?: "primary" | "secondary";
  enabled?: boolean;
  updateState?: (state: Record<string, unknown>) => void;
  registerComponentApi?: RegisterComponentApiFn;
  classes?: Record<string, string>;
}

export const defaultProps = {
  enabled: true,
  variant: "primary" as const,
};

export const ComponentNameNative = memo(forwardRef<HTMLDivElement, Props>(
  function ComponentNameNative(
    { label, variant = defaultProps.variant, enabled = defaultProps.enabled,
      updateState, registerComponentApi, style, className, classes, ...rest },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const composedRef = composeRefs(ref, innerRef);

    useEffect(() => {
      registerComponentApi?.({
        focus: () => innerRef.current?.focus(),
      });
    }, [registerComponentApi]);

    return (
      <div
        ref={composedRef}
        className={classnames(
          styles.component,
          styles[variant],
          { [styles.disabled]: !enabled },
          classes?.["-component"],
          className,
        )}
        style={style}
        {...rest}
      >
        {label && <span className={classnames(styles.label, classes?.label)}>{label}</span>}
      </div>
    );
  },
));
```

### Key Native Component Rules

| Rule | Why |
|------|-----|
| `forwardRef` always | Parent components and `id`-based refs need DOM access |
| `memo` always | Prevents re-renders when props don't change |
| Export `defaultProps` | Shared by renderer, metadata, and native destructuring |
| Accept `style` explicitly | Required for layout CSS from the framework |
| Spread `...rest` on root | HTML attributes (`data-*`, ARIA, etc.) must reach the DOM |
| No `displayName` | Don't set it manually |
| No `useImperativeHandle` | Use `registerComponentApi` instead |

### The `defaultProps` Contract

The `defaultProps` object is the single source of truth for default values across three locations:

```typescript
// Native file — defines and exports:
export const defaultProps = {
  enabled: true,
  size: "md" as const,
};

// Metadata — shows defaults in documentation:
enabled: { defaultValue: defaultProps.enabled }

// Native destructuring — applies the default:
function Comp({ enabled = defaultProps.enabled })

// Renderer — does NOT apply defaults:
enabled={extractValue.asOptionalBoolean(node.props.enabled)}
// (undefined → native component picks up defaultProps.enabled)
```

The renderer passes `undefined` when a prop is absent; the native component fills in the default. This keeps defaults defined in exactly one place.

### Registering Imperative APIs

When markup references `myComponent.methodName(args)`, those methods must be registered by the native component:

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

A component with `id="myInput"` in markup then exposes `myInput.focus()` and `myInput.setValue(...)` to event handlers throughout the page.

---

## The SCSS File

Visual components include a SCSS module that declares and collects theme variables:

```scss
@use "../../components-core/theming/themes" as t;

$themeVars: ();
@function createThemeVar($v) {
  $themeVars: t.appendThemeVar($themeVars, $v) !global;
  @return t.getThemeVar($themeVars, $v);
}

$backgroundColor-ComponentName: createThemeVar("backgroundColor-ComponentName");
$borderColor-ComponentName:     createThemeVar("borderColor-ComponentName");

.component {
  background-color: $backgroundColor-ComponentName;
  border: 1px solid $borderColor-ComponentName;
}

:export {
  themeVars: t.json-stringify($themeVars);   // mandatory — renderer reads this
}
```

The `:export` block is required. The renderer reads it via `parseScssVar(styles.themeVars)` to populate the metadata's `themeVars` list.

### Theme Variable Naming

Theme variable names follow a positional convention parsed by `parseLayoutProperty`. Segments are separated by `-`; state names follow a `--` double-dash separator. The full structure is:

```
property[-partNameOrScreenSize][-ComponentName][-variantName][--stateName][--stateName2]
```

| Position | Segment | Case | Identification rule | Example |
|----------|---------|------|---------------------|---------|
| 1 (required) | `property` | camelCase | starts with lowercase | `backgroundColor`, `fontSize` |
| 2 (optional) | `partName` or `screenSize` | camelCase / lowercase | `xs`/`sm`/`md`/`lg`/`xl` → screen size; otherwise part name | `label`, `sm` |
| 3 (optional) | `ComponentName` | PascalCase | starts with uppercase | `Button`, `Input`, `Text` |
| 4 (optional) | `variantName` | camelCase | starts with lowercase | `primary`, `compact` |
| after `--` | `stateName` (repeatable) | camelCase | follows `--` separator | `focus`, `hover`, `disabled` |

| Pattern | Example |
|---------|---------|
| `property-ComponentName` | `backgroundColor-Button` |
| `property-screenSize-ComponentName` | `fontSize-sm-Text` |
| `property-partName-ComponentName` | `backgroundColor-label-Button` |
| `property-ComponentName-variantName` | `backgroundColor-Button-primary` |
| `property-ComponentName--stateName` | `borderColor-Input--focus` |
| `property-ComponentName--state1--state2` | `borderColor-Input--focus--hover` |

The parser uses the first letter of each `-`-separated segment to classify it: uppercase = `ComponentName`, lowercase = `partName` or `variantName` (further distinguished by position). Variant and part names must always start with lowercase — writing `Primary` with an uppercase P where a variant is expected would be rejected as a duplicate component name.

### Applying Per-Part Classes

The `classes` prop carries CSS class names keyed by part name. Apply them alongside SCSS module classes:

```typescript
// Root element:
className={classnames(styles.component, classes?.["-component"], className)}

// Named parts:
className={classnames(styles.label, classes?.label)}
className={classnames(styles.input, classes?.input)}
```

`"-component"` (with the leading dash) is the key for the outermost element.

---

## Registration

Add the renderer to `ComponentProvider.tsx`:

```typescript
import { componentNameComponentRenderer } from "./ComponentName/ComponentName";

// In constructor, wrapped with tree-shaking guard:
if (process.env.VITE_USED_COMPONENTS_ComponentName !== "false") {
  this.registerCoreComponent(componentNameComponentRenderer);
}
```

---

## Implementation Sequence

1. Write metadata (`createMetadata`) — this defines the public API
2. Create renderer stub (can return `null`) — enough to register the component
3. Write native component with `forwardRef` + `memo` + `defaultProps`
4. Register in `ComponentProvider.tsx`
5. Add SCSS module (visual components)
6. Wire props, events, and APIs between renderer and native
7. Add E2E and unit tests

---

## Common Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Calling `useState` or `useEffect` in the renderer | All hooks go in the native component |
| Using `useImperativeHandle` | Register methods via `registerComponentApi` |
| Accessing `node.props.x` directly | Always use `extractValue.asXxx(node.props.x)` |
| Setting `displayName` manually | Remove it; the function name is used automatically |
| Missing `style` prop on root element | Explicitly accept and spread `style` |
| Defining defaults in the renderer | Keep all defaults in `defaultProps` in the native file |

---

## Key Takeaways

1. The two-file split enforces a strict boundary: no React hooks in the renderer, all hooks in the native component.
2. `createMetadata` is the single source of truth for a component's public API — props, events, APIs, theme variables, and documentation are all derived from it.
3. `extractValue` is mandatory before using any `node.props.*` value; raw values may be binding expressions, not plain values.
4. `defaultProps` is exported from the native file and referenced by the renderer and metadata — define defaults in exactly one place.
5. `registerComponentApi` is the only way to expose imperative methods to markup; don't use `useImperativeHandle`.
6. `classes?.["-component"]` on the root element and `classes?.[partName]` on named parts enable theme variable targeting at part granularity.
7. Tree-shaking guards (`process.env.VITE_USED_COMPONENTS_X !== "false"`) in `ComponentProvider.tsx` allow unused components to be excluded from production bundles.
