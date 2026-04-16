# Component Architecture (Two-File Pattern)

## File Layout

Every built-in component consists of exactly these files:

```
xmlui/src/components/<ComponentName>/
  ComponentName.tsx          ← metadata + renderer (required)
  ComponentNameNative.tsx    ← React implementation (required for non-trivial components)
  ComponentName.module.scss  ← SCSS theme vars + CSS rules (visual components only)
```

**Never create:** `index.ts`, example files, or `package.json` entries in component folders.

## Renderer File (`ComponentName.tsx`)

### createComponentRenderer

```typescript
export const componentNameComponentRenderer = createComponentRenderer(
  "ComponentName",       // type key — matches markup tag name
  ComponentNameMd,       // metadata object
  ({ node, extractValue, state, updateState, renderChild,
     lookupEventHandler, registerComponentApi, classes, appContext }) => {
    return (
      <ComponentNameNative
        label={extractValue.asDisplayText(node.props.label)}
        variant={extractValue.asOptionalString(node.props.variant)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, defaultProps.enabled)}
        value={state.value}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        onClick={lookupEventHandler("click")}
        classes={classes}
      >
        {renderChild(node.children)}
      </ComponentNameNative>
    );
  },
);
```

**Rules:**
- The renderer is a **plain function**, NOT a React component. No hooks inside.
- `node.props.*` values are raw (may be binding ASTs). Always extract via `extractValue`.
- The string passed to `lookupEventHandler` must match an event key in metadata.
- `classes` is the preferred way to pass theme-aware CSS. Pass it through to the native component.
- The codebase is actively migrating renderer functions from `createComponentRenderer` to `wrapComponent`. `createComponentRenderer` is the baseline pattern; `wrapComponent` is the preferred path going forward. See `component-wrapcomponent.md` (Topic 5).

### RendererContext Properties

| Property | Type | Use |
|----------|------|-----|
| `node` | `ComponentDef` | Component definition: `.props`, `.children`, `.uid`, `.events`, etc. |
| `state` | `ContainerState` | Current container state (loader results, component state, APIs) |
| `extractValue` | `ValueExtractor` | Evaluates expressions in props |
| `renderChild` | `RenderChildFn` | Recursively renders child nodes |
| `lookupEventHandler` | `LookupEventHandlerFn` | Returns async callback for named event |
| `registerComponentApi` | `RegisterComponentApiFn` | Passes through to native component |
| `updateState` | `UpdateStateFn` | Updates container state from renderer |
| `classes` | `Record<string, string> \| undefined` | Per-part theme CSS classes |
| `className` | `string \| undefined` | Legacy single CSS class (prefer `classes`) |
| `uid` | `symbol` | Unique instance ID |
| `appContext` | `AppContextObject` | `navigate()`, `toast()`, `confirm()`, utilities |
| `logInteraction` | `LogInteractionFn` | Inspector logging (verbose mode only) |
| `globalVars` | `Record<string, any>` | App-wide variables |

### ValueExtractor Methods

| Method | Returns | Use |
|--------|---------|-----|
| `extractValue(expr)` | `any` | Raw value, any type |
| `extractValue.asString(expr)` | `string` | Always a string (coerces); throws if undefined |
| `extractValue.asDisplayText(expr)` | `string` | String for display; collapses multiple spaces |
| `extractValue.asOptionalString(expr, def?)` | `string \| undefined` | String or default |
| `extractValue.asOptionalStringArray(expr)` | `string[]` | Array of strings |
| `extractValue.asNumber(expr)` | `number` | Throws if not numeric |
| `extractValue.asOptionalNumber(expr, def?)` | `number \| undefined` | Number or default |
| `extractValue.asBoolean(expr)` | `boolean` | JS truthiness |
| `extractValue.asOptionalBoolean(expr, def?)` | `boolean \| undefined` | Boolean or default |
| `extractValue.asSize(expr)` | `string \| undefined` | CSS size; resolves theme vars |

### createMetadata

```typescript
const COMP = "ComponentName";

export const ComponentNameMd = createMetadata({
  status: "stable",           // "stable" | "experimental" | "deprecated"
  description: "...",
  nonVisual: false,           // true = no SCSS, no themeVars, no parts

  props: {
    label: {
      description: "...",
      valueType: "string",    // "boolean" | "string" | "number" | "any" | "ComponentDef"
      defaultValue: defaultProps.label,
      isRequired: false,
    },
    variant: {
      description: "...",
      valueType: "string",
      availableValues: ["primary", "secondary"],
    },
  },

  events: {
    click:      dClick(COMP),
    gotFocus:   dGotFocus(COMP),
    lostFocus:  dLostFocus(COMP),
    didChange:  d("Fired when value changes."),
    init:       dInit(COMP),
  },

  apis: {
    focus: {
      description: "Moves keyboard focus to the component.",
      signature: "focus(): void",
    },
  },

  contextVars: {
    $value: { description: "Current value, available to child components." },
  },

  parts: {
    input:       { description: "The main input element." },
    label:       { description: "The label element." },
  },
  defaultPart: "input",          // which part receives layout CSS props

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`textColor-${COMP}`]:       "$textColor",
    [`backgroundColor-${COMP}-primary`]: "$color-primary",
  },
});
```

### Metadata Helper Functions

| Helper | Use |
|--------|-----|
| `d(desc)` | Generic descriptor |
| `dClick(comp)` | Standard click event |
| `dInit(comp)` | Init event (fires before first render) |
| `dGotFocus(comp)` | Focus gained |
| `dLostFocus(comp)` | Focus lost |
| `dContextMenu(comp)` | Context menu event |
| `dInternal(...)` | Hidden from docs |

## Native File (`ComponentNameNative.tsx`)

### Structure

```typescript
import React, { forwardRef, memo, useEffect, useRef } from "react";
import classnames from "classnames";
import styles from "./ComponentName.module.scss";
import { composeRefs } from "../../utils/ref-utils";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  variant?: "primary" | "secondary";
  enabled?: boolean;
  updateState?: (state: Record<string, unknown>) => void;
  registerComponentApi?: RegisterComponentApiFn;
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
        className={classnames(styles.component, styles[variant], {
          [styles.disabled]: !enabled,
        }, classes?.["-component"], className)}
        style={style}
        {...rest}
      >
        {label && <span className={classnames(styles.label, classes?.label)}>{label}</span>}
      </div>
    );
  },
));
```

### Rules

| Rule | Detail |
|------|--------|
| Always `forwardRef` | Parent components need DOM refs |
| Always `memo` | Prevents unnecessary re-renders |
| Export `defaultProps` | Referenced by both renderer and metadata |
| No `displayName` | Don't set explicitly |
| No `useImperativeHandle` | Use `registerComponentApi` instead |
| Spread `...rest` on root | Passes through HTML attributes |
| Accept `style` explicitly | Must apply to root element for layout |
| Use `composeRefs` | When both forwarded ref and internal ref are needed |

### defaultProps Pattern

```typescript
// Native file — defines and exports:
export const defaultProps = {
  size: "md" as const,
  enabled: true,
};

// Metadata — references for defaultValue:
size: { defaultValue: defaultProps.size }

// Native component — uses as destructuring default:
function Comp({ size = defaultProps.size })

// Renderer — passes to native (no default applied in renderer):
size={extractValue.asOptionalString(node.props.size)}
```

### registerComponentApi Pattern

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

API methods registered here are accessible in markup via the component's `id`:
`<TextInput id="myInput">` → `myInput.setValue("hello")` in event handlers.

## SCSS File (`ComponentName.module.scss`)

```scss
@use "../../components-core/theming/themes" as t;

$themeVars: ();
@function createThemeVar($v) {
  $themeVars: t.appendThemeVar($themeVars, $v) !global;
  @return t.getThemeVar($themeVars, $v);
}

$backgroundColor-ComponentName: createThemeVar("backgroundColor-ComponentName");
$textColor-ComponentName:       createThemeVar("textColor-ComponentName");

.component {
  background-color: $backgroundColor-ComponentName;
  color: $textColor-ComponentName;
}

:export {
  themeVars: t.json-stringify($themeVars);   // ← mandatory export
}
```

### Theme Variable Naming

Full convention (parsed by `parseLayoutProperty` with `parseComponent: true`):

```
property[-partNameOrScreenSize][-ComponentName][-variantName][--stateName][--stateName2]
```

| Position | Segment | Case | Identification |
|----------|---------|------|----------------|
| 1 | `property` | camelCase | required; starts lowercase |
| 2 | `partName` or `screenSize` | camelCase/lowercase | `xs`/`sm`/`md`/`lg`/`xl` = screen size; else part name |
| 3 | `ComponentName` | PascalCase | starts uppercase |
| 4 | `variantName` | camelCase | starts lowercase |
| after `--` | `stateName` (repeatable) | camelCase | follows `--` separator |

| Pattern | Example |
|---|---|
| `property-ComponentName` | `backgroundColor-Button` |
| `property-screenSize-ComponentName` | `fontSize-sm-Text` |
| `property-partName-ComponentName` | `backgroundColor-label-Button` |
| `property-ComponentName-variantName` | `backgroundColor-Button-primary` |
| `property-ComponentName--stateName` | `borderColor-Input--focus` |
| `property-ComponentName--state1--state2` | `borderColor-Input--focus--hover` |

Critical: uppercase first letter → `ComponentName`; lowercase → `partName`/`variantName`. Writing `Primary` (uppercase) where a variant is expected is rejected as a duplicate component name.

### `classes` prop — Per-Part CSS

- `classes?.["-component"]` — outermost root element (same scope as `className`)
- `classes?.[partName]` — named part (e.g., `classes?.input`, `classes?.label`)
- Both applied alongside SCSS module classes via `classnames()`

## Registration

```typescript
// In ComponentProvider.tsx constructor:
import { componentNameComponentRenderer } from "./ComponentName/ComponentName";

// With tree-shaking guard:
if (process.env.VITE_USED_COMPONENTS_ComponentName !== "false") {
  this.registerCoreComponent(componentNameComponentRenderer);
}
```

`registerCoreComponent` accepts a `ComponentRendererDef` (returned by `createComponentRenderer`).

## Implementation Order

1. Define metadata (`createMetadata`) + export `ComponentNameMd`
2. Create renderer stub with `createComponentRenderer` (can return `null` initially)
3. Create native component with `forwardRef` + `memo` + `defaultProps`
4. Register in `ComponentProvider.tsx`
5. Add SCSS module (visual components only)
6. Wire props, events, APIs
7. Write tests

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Hooks inside renderer function | Move hooks to native component |
| Using `useImperativeHandle` | Use `registerComponentApi` instead |
| Setting `displayName` explicitly | Remove it |
| Omitting `style` prop on root | Accept and spread `style` on root element |
| Hardcoding defaults in renderer | Export from `defaultProps` in native file |
| Accessing `node.props.x` without extracting | Always use `extractValue.asXxx(node.props.x)` |
| Passing `className` alone | Prefer `classes?.["-component"]` for theme compatibility |

## Key Files

| File | Path |
|------|------|
| RendererContext type | `xmlui/src/abstractions/RendererDefs.ts` |
| ComponentMetadata type | `xmlui/src/abstractions/ComponentDefs.ts` |
| createComponentRenderer | `xmlui/src/components-core/renderers.ts` |
| createMetadata + helpers | `xmlui/src/components-core/metadata-helpers.ts` |
| ValueExtractor implementation | `xmlui/src/components-core/rendering/valueExtractor.ts` |
| ComponentProvider (registry) | `xmlui/src/components-core/ComponentProvider.tsx` |
| Example: Text component | `xmlui/src/components/Text/Text.tsx` |
| Example: Text native | `xmlui/src/components/Text/TextNative.tsx` |
