# Component Architecture: Renderer + Defaults + React Implementation

Most built-in XMLUI components are built from three cooperating files. This document explains what each file does, why they exist separately, and how to read and write them.

---

## Why Three Files?

XMLUI separates **what a component is**, **what its static defaults are**, and **how it renders**:

- **`ComponentName.tsx`** — the XMLUI side. Defines the component's public contract (props, events, APIs, theme variables) and the *bridge function* that translates XMLUI's reactive context into React props.
- **`ComponentName.defaults.ts`** — the shared defaults side. Defines `defaultProps` in a pure module that both metadata and React code can import without pulling React implementation code into metadata builds.
- **`ComponentNameReact.tsx`** — the React side. A normal `forwardRef` + `memo` component that takes plain props and produces DOM output. All component React implementations use the `*React.tsx` filename convention.

This boundary exists for a specific reason: the bridge function in `ComponentName.tsx` runs in the XMLUI rendering pipeline and must not use React hooks. All hooks live in the React implementation file. The separation makes this constraint structurally clear.

The defaults file exists for a separate build-system reason: metadata generation imports component metadata, and metadata often references `defaultProps`. Keeping defaults in a pure `ComponentName.defaults.ts` file prevents metadata-only builds from loading React components, hooks, SCSS side effects beyond the metadata file, or third-party implementation libraries just to read default values.

---

## The Defaults File (`ComponentName.defaults.ts`)

### Structure

```
ComponentName.defaults.ts:
  1. Import only types needed to describe defaults
  2. Define and export defaultProps
```

The defaults file is the single source of truth for default property values. Both `ComponentName.tsx` and `ComponentNameReact.tsx` import from it.

```typescript
import type { ComponentVariant } from "../abstractions";

export const defaultProps: {
  enabled: boolean;
  variant: ComponentVariant;
} = {
  enabled: true,
  variant: "primary",
};
```

**Key rules:**
- Keep this file pure: no React imports, JSX, hooks, DOM access, SCSS/CSS imports, theme lookups, or runtime services.
- Use `import type` for any types needed by the defaults object.
- Do not import from `ComponentName.tsx` or `ComponentNameReact.tsx`.
- Do not compute defaults from runtime state. Defaults should be static values that can be safely loaded by metadata tooling.
- If another component needs these defaults, import them from `ComponentName.defaults.ts`, not from the renderer or React file.

---

## The Renderer File (`ComponentName.tsx`)

### Structure

```
ComponentName.tsx:
  1. Import metadata helpers, SCSS styles
  2. Import defaultProps from ComponentName.defaults.ts
  3. Import the React component
  4. Define the metadata constant (ComponentNameMd)
  5. Define and export the renderer, usually with wrapComponent
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

  childInjectedVars: ["$textContext"], // Declares variables passed to children for the Lexical Scope Optimizer

  events: {
    contextMenu: dContextMenu(COMP),
    // If an event exposes custom $vars, it must declare them here:
    // onChange: { description: "...", injectedVars: ["$newValue"] }
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

### Property Value Types and Contracts

`valueType` is not just documentation. It drives `wrapComponent` prop extraction, docs generation, language-server diagnostics, and the type-contract checker used by Managed React strict mode.

Common value types include:

| `valueType` | Meaning |
|-------------|---------|
| `"string"` | Text-like values |
| `"string[]"` | Arrays of text values |
| `"number"` | Numeric values |
| `"integer"` | Whole numbers |
| `"boolean"` | Boolean values |
| `"length"` | CSS lengths and intrinsic length keywords |
| `"color"` | CSS color values |
| `"url"` | URL/path-like values |
| `"icon"` | Registered icon names |
| `"id-ref"` | Reference to another component by `id` |
| `"hash"` | Object/hash values, equivalent to TypeScript `Record<string, any>` |
| `"ComponentDef"` | XMLUI component definition/template |
| `"any"` | Explicit opt-out when the prop accepts arbitrary values |

Use `valueType`, not `type`. The old `type` property is not read by `wrapComponent` or the type-contract rules. When a prop is intentionally broad, prefer `valueType: "any"` so the opt-out is explicit.

### The Renderer Function

`wrapComponent` is the preferred renderer path for standard components:

```typescript
export const componentNameComponentRenderer = wrapComponent(
  "ComponentName",
  ComponentNameReact,
  ComponentNameMd,
  {
    events: ["click"],
    exposeRegisterApi: true,
  },
);
```

`wrapComponent` reads metadata, extracts props according to `valueType`, wires events, forwards theme classes, renders `ComponentDef` templates, and handles common stateful input plumbing. See [05-wrapcomponent.md](05-wrapcomponent.md) for the full API.

Use `createComponentRenderer` when the component needs custom top-level rendering, runtime-dependent child layout, specialized extraction such as `asDisplayText()` or `asSize()`, or other logic that cannot be expressed with `wrapComponent` configuration:

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

The renderer function is a **plain function, not a React component**. React hooks are not allowed here. Its job is to extract XMLUI values and hand them to the React component as ordinary props.

**Key rules:**
- `node.props.*` values are raw (may be binding expression ASTs). Always route them through `extractValue` before passing to the React component.
- The event name string in `lookupEventHandler("contextMenu")` must match a key in the metadata's `events` section.
- `classes` carries per-part CSS generated from theme variables. Pass it through.

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
| `registerComponentApi` | Pass to React component so it can register imperative methods |
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
| `extractValue.asInteger(expr, default?)` | `number \| undefined` | Whole-number helper |
| `extractValue.asColor(expr)` | `string \| undefined` | Validated CSS color helper |
| `extractValue.asLength(expr)` | `string \| undefined` | Validated CSS length helper |
| `extractValue.asUrl(expr)` | `string \| undefined` | Validated URL/path helper |
| `extractValue.asIcon(expr)` | `string \| undefined` | Validated icon-name helper |
| `extractValue.asLayoutProp(propName, expr, valueType?)` | `any` | Validated layout-prop helper |
| `extractValue.asStyleProp(expr, componentName?)` | `string \| undefined` | Validated style-string helper |

**Example:**
```typescript
// Markup: <Slider min="0" max="{limit}" step="5" />
minimum={extractValue.asOptionalNumber(node.props.min, 0)}    // → 0
maximum={extractValue.asOptionalNumber(node.props.max)}       // → value of 'limit'
step={extractValue.asOptionalNumber(node.props.step, 1)}      // → 5
```

---

## The React File (`ComponentNameReact.tsx`)

The React component is a standard React component with two structural requirements: `forwardRef` (so parent components can obtain a DOM ref) and `memo` (to prevent unnecessary re-renders).

```typescript
import { defaultProps } from "./ComponentName.defaults";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  variant?: "primary" | "secondary";
  enabled?: boolean;
  updateState?: (state: Record<string, unknown>) => void;
  registerComponentApi?: RegisterComponentApiFn;
  classes?: Record<string, string>;
}

export const ComponentNameReact = memo(forwardRef<HTMLDivElement, Props>(
  function ComponentNameReact(
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

### Key React Component Rules

| Rule | Why |
|------|-----|
| `forwardRef` always | Parent components and `id`-based refs need DOM access |
| `memo` always | Prevents re-renders when props don't change |
| Import `defaultProps` from `ComponentName.defaults.ts` | Shared by renderer, metadata, and React component destructuring without metadata-build React leaks |
| Accept `style` explicitly | Required for layout CSS from the framework |
| Spread `...rest` on root | HTML attributes (`data-*`, ARIA, etc.) must reach the DOM |
| No `displayName` | Don't set it manually |
| No `useImperativeHandle` | Use `registerComponentApi` instead |

### The `defaultProps` Contract

The `defaultProps` object is the single source of truth for default values across three locations:

```typescript
// ComponentName.defaults.ts — defines and exports:
export const defaultProps = {
  enabled: true,
  size: "md" as const,
};

// ComponentName.tsx — imports defaults for metadata:
import { defaultProps } from "./ComponentName.defaults";

// Metadata — shows defaults in documentation:
enabled: { defaultValue: defaultProps.enabled }

// ComponentNameReact.tsx — imports defaults for runtime fallback:
import { defaultProps } from "./ComponentName.defaults";

// React component destructuring — applies the default:
function Comp({ enabled = defaultProps.enabled })

// Renderer — does NOT apply defaults:
enabled={extractValue.asOptionalBoolean(node.props.enabled)}
// (undefined → React component picks up defaultProps.enabled)
```

The renderer passes `undefined` when a prop is absent; the React component fills in the default. This keeps defaults defined in exactly one place.

### Registering Imperative APIs

When markup references `myComponent.methodName(args)`, those methods must be registered by the React component:

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

## Managed React Considerations

Most Managed React features live outside individual components, but component authors affect whether those features can validate, trace, and harden an app correctly.

| Area | Component author responsibility |
|------|---------------------------------|
| Type contracts | Declare accurate `valueType`, `availableValues`, `defaultValue`, and `isRequired` metadata. `strictTypeContracts` uses these declarations for diagnostics. |
| Events | Define every public event in metadata and give non-trivial events signatures/parameters. This keeps `on<Event>` validation and inspector traces meaningful. |
| Accessibility | Prefer semantic DOM, labels, ARIA attributes, focus handling, and keyboard support in the React component. `strictAccessibility` can escalate missing-accessible-name and related diagnostics. |
| Errors and lifecycle | Surface user-facing failures through framework error APIs where applicable, and keep cleanup in React effects synchronous unless the XMLUI lifecycle subsystem explicitly owns async disposal. |
| Browser/global APIs | For behavior exposed to XMLUI markup, prefer framework-managed APIs such as `App.fetch`, `navigate`, `toast`, `AppState`, and `Clipboard` over raw browser globals so sandboxing, tracing, and strict-mode diagnostics can observe the action. |

Do not add Managed React app-globals to a component just because the feature exists. Mention or wire them here only when the component's public contract depends on that validation or managed API surface.

---

## Implementation Sequence

1. Write `ComponentName.defaults.ts` with static `defaultProps`
2. Write metadata (`createMetadata`) — this defines the public API
3. Create the renderer, preferably with `wrapComponent` for standard prop/event wiring
4. Write the React component with `forwardRef` + `memo`, importing `defaultProps` from the defaults file
5. Register in `ComponentProvider.tsx`
6. Add SCSS module (visual components)
7. Wire props, events, and APIs between renderer and React component
8. Add E2E and unit tests

---

## Common Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Calling `useState` or `useEffect` in the renderer | All hooks go in the React component |
| Using `useImperativeHandle` | Register methods via `registerComponentApi` |
| Accessing `node.props.x` directly | Always use `extractValue.asXxx(node.props.x)` |
| Setting `displayName` manually | Remove it; the function name is used automatically |
| Missing `style` prop on root element | Explicitly accept and spread `style` |
| Defining defaults in the renderer | Keep all defaults in `defaultProps` in `ComponentName.defaults.ts` |
| Defining defaults in the React file | Move them to `ComponentName.defaults.ts` and import from there |
| Importing `defaultProps` from `ComponentNameReact.tsx` | Import `defaultProps` from `ComponentName.defaults.ts` |
| Naming the React implementation `ComponentNameNative.tsx` | Rename it to `ComponentNameReact.tsx` |
| Using `type` instead of `valueType` in metadata | Use `valueType`; `wrapComponent` and type contracts ignore `type` |
| Leaving broad props untyped by accident | Use a precise `valueType`, or `valueType: "any"` for intentional arbitrary values |

---

## Key Takeaways

1. The renderer/defaults/React split enforces strict boundaries: no React hooks in the renderer, pure static values in the defaults file, and all hooks in the React component.
2. `createMetadata` is the single source of truth for a component's public API — props, events, APIs, theme variables, and documentation are all derived from it.
3. Prefer `wrapComponent` for standard components; use `createComponentRenderer` only when the render path needs custom logic.
4. `valueType` metadata matters: it drives extraction, documentation, type-contract diagnostics, and Managed React strict mode.
5. `extractValue` is mandatory before using any `node.props.*` value in manual renderers; raw values may be binding expressions, not plain values.
6. `defaultProps` is exported from `ComponentName.defaults.ts` and referenced by the renderer, metadata, and React component — define defaults in exactly one pure file.
7. `registerComponentApi` is the only way to expose imperative methods to markup; don't use `useImperativeHandle`.
8. `classes?.["-component"]` on the root element and `classes?.[partName]` on named parts enable theme variable targeting at part granularity.
9. Tree-shaking guards (`process.env.VITE_USED_COMPONENTS_X !== "false"`) in `ComponentProvider.tsx` allow unused components to be excluded from production bundles.
