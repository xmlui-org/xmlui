# Component Metadata

Metadata is the **single source of truth** for a component's API. It drives documentation generation, VS Code IntelliSense, build-time validation, and dev tools.

## Structure

```typescript
import { createMetadata, d, dClick, dInit, dGotFocus, dLostFocus, dInternal } from "../metadata-helpers";
import styles from "./ComponentName.module.scss";

const COMP = "ComponentName";

export const ComponentNameMd = createMetadata({
  status: "stable",            // "stable" | "experimental" | "deprecated"
  description: "Brief description.",
  nonVisual: false,            // set true for non-visual components (no theme vars/SCSS)

  props: {
    label: {
      description: "The label displayed for the component.",
      valueType: "string",
      defaultValue: defaultProps.label,
      isRequired: false,
    },
    variant: {
      description: "Visual style variant.",
      valueType: "string",
      availableValues: ["primary", "secondary"],
      defaultValue: defaultProps.variant,
    },
  },

  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: d("Fired when the value changes."),
    init: dInit(COMP),
  },

  apis: {
    setValue: {
      description: "Sets the component value programmatically.",
      signature: "setValue(value: string): void",
    },
  },

  contextVars: {
    $value: {
      description: "The current value, available to child components.",
    },
  },

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
  },
});
```

## Helper Functions

| Helper | Purpose |
|---|---|
| `d(desc)` | General property/event descriptor |
| `dClick(comp)` | Standard click event |
| `dInit(comp)` | Init event (fires before first render) |
| `dGotFocus(comp)` | Focus gained |
| `dLostFocus(comp)` | Focus lost |
| `dInternal(...)` | Internal-only — hidden from docs |

## Parts Metadata

Add `parts` when the component has named sub-elements that should be stylable or selectable in tests:

```typescript
parts: {
  label: { description: "The label element." },
  input: { description: "The main input area." },
  startAdornment: { description: "Decorative element at the start." },
  endAdornment: { description: "Decorative element at the end." },
},
defaultPart: "input",  // which part receives layout properties
```

## Context Variables

Expose data to child markup via `$variableName`:

```typescript
contextVars: {
  $value: { description: "Current value." },
  $index: { description: "Item index (in lists)." },
},
```

## Theme Variable Registration

`themeVars: parseScssVar(styles.themeVars)` reads exported vars from the SCSS module. For non-visual components omit this field entirely and do not create a SCSS module.

`defaultThemeVars` maps variable names to their light-theme fallback values. Convention: `propertyName-ComponentName[-VariantName]`.
