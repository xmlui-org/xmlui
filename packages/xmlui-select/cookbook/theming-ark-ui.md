# Theming Ark-UI Components with the XMLUI Theme System

This document explains how to integrate an ark-ui based component into the XMLUI theme system so it behaves exactly like the built-in core components (e.g. `Select`, `TextBox`, `Checkbox`).

---

## 1. How the XMLUI theme system works

The XMLUI theme system has three layers:

```
SCSS variables  →  CSS custom properties  →  React defaultThemeVars
(build-time)        (runtime)                  (in component metadata)
```

### 1.1 SCSS side: `createThemeVar`

Every themeable value is introduced through an SCSS variable. The `createThemeVar` function does two things at once:

1. Registers the variable name in the `$themeVars` list (later exported for `parseScssVar`)
2. Returns the corresponding CSS custom property reference (`var(--...)`)

```scss
@use "xmlui/themes.scss" as t;   // from a package
// or
@use "../../components-core/theming/themes" as t;  // from inside core

$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

// This creates a themeable variable:
$backgroundColor-trigger: createThemeVar("Input:backgroundColor-Select");
// → generates: var(--xmlui-Input-backgroundColor-Select)
```

The `Input:` prefix is the XMLUI namespace for input-like components. Use it for any component that functions as a form input.

### 1.2 `:export` — the bridge between SCSS and React

At the end of every SCSS module, this block is required:

```scss
:export {
  themeVars: t.json-stringify($themeVars);
}
```

This uses the CSS Modules `:export` mechanism: during the build, the accumulated `$themeVars` list is serialized as a JSON string and embedded in the JS bundle, where the React component can read it.

### 1.3 React side: `parseScssVar` and `defaultThemeVars`

In the `wrapCompound`/`createComponentRenderer` call, inside the metadata:

```tsx
import styles from "./Select.module.scss";
import { parseScssVar } from "xmlui"; // or relative path inside core

export const SelectMd = createMetadata({
  themeVars: parseScssVar(styles.themeVars),  // reads the :export list
  defaultThemeVars: {
    [`backgroundColor-Select`]: "$color-surface-50",  // token reference
    // ...
  },
});
```

`defaultThemeVars` defines fallback values. They apply when the application theme does not override them. Values can be:
- Token references: `"$color-primary"`, `"$borderRadius"`, etc.
- Literal values: `"1px"`, `"solid"`, `"36px"`
- References to other token values: `"$color-surface-300"`

---

## 2. Ark-UI specifics for styling

Ark-UI differs fundamentally from Radix UI (which most core components use), and this shows clearly in how styling works.

### 2.1 Data attributes instead of pseudo-classes

Ark-UI communicates interactive states via `data-*` attributes, not CSS pseudo-classes. This is the most important difference to internalize:

| State | Standard CSS | Ark-UI CSS |
|---|---|---|
| Hover | `:hover` | `[data-highlighted]` |
| Selected | — | `[data-selected]` |
| Disabled | `:disabled` | `[data-disabled]` |
| Open | — | `[data-state="open"]` |
| Closed | — | `[data-state="closed"]` |
| Indicator hidden | — | `[data-state="unchecked"]` |
| Placeholder visible | — | `[data-placeholder-shown]` |

**Example in SCSS:**

```scss
// Wrong — ark-ui does not use :hover on list items
.item:hover { background: red; }

// Correct — ark-ui sets this attribute
.item[data-highlighted] { background: red; }
```

The trigger element (`Select.Trigger`) is a real `<button>`, so standard pseudo-classes still work there (`:hover`, `:focus-visible`, `:disabled`). But inside the dropdown, always use data attributes.

### 2.2 `ItemIndicator` is always rendered

Ark-UI's `Select.ItemIndicator` is rendered for every item, not only the selected one. You must explicitly hide it for unselected items:

```scss
.itemIndicator {
  // ark-ui always renders this — hide it when unchecked
  &[data-state="unchecked"] {
    visibility: hidden;  // use visibility, not display:none, to preserve layout space
  }
}
```

### 2.3 Portal and CSS Modules — the biggest pitfall

Ark-UI renders the dropdown panel (`Select.Positioner` + `Select.Content`) through a `Portal`, which places the DOM node **directly under `<body>`**, outside the component's React subtree.

This means CSS Modules scoped class names (e.g. `.content_abc123`) **do not automatically reach** elements rendered through the portal. You must pass scoped class names explicitly as props:

```tsx
// Correct — pass the class name as a prop
<Select.Content className={styles.content}>
```

Parent–child CSS selectors will not work across the portal boundary:

```scss
// This will NOT work — the portal breaks the CSS scope
.selectContainer .content { ... }
```

**Practical rule:** every ark-ui sub-element that may be portaled needs its own `className={styles.xxx}` prop.

### 2.4 Animation: `data-state` based

Ark-UI's open/close animation uses the `data-state` attribute:

```scss
.content {
  &[data-state="open"] {
    animation: contentOpen 0.15s ease;
  }
  &[data-state="closed"] {
    animation: contentClose 0.1s ease;
  }
}

@keyframes contentOpen {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes contentClose {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-4px); }
}
```

---

## 3. Step-by-step: integrating an ark-ui component into the XMLUI theme system

### Step 1 — Identify the styleable parts

Inspect the ark-ui component's DOM output in DevTools and identify the logical regions. For `Select`:

- Trigger (the button)
- Content panel (the dropdown box)
- Item (a single option)
- ItemIndicator (the checkmark)
- ClearTrigger (the clear button)

### Step 2 — Declare SCSS variables

Create a `createThemeVar` call for every styleable property. Follow the XMLUI naming convention:

```text
[property]-[part]-[ComponentName]--[state]
```

```scss
$componentName: "MyComponent";

// Base state
$backgroundColor: createThemeVar("Input:backgroundColor-#{$componentName}");
$borderColor:     createThemeVar("Input:borderColor-#{$componentName}");

// Hover state
$backgroundColor--hover: createThemeVar("Input:backgroundColor-#{$componentName}--hover");

// Sub-part (item)
$backgroundColor-item:           createThemeVar("Input:backgroundColor-item-#{$componentName}");
$backgroundColor-item--hover:    createThemeVar("Input:backgroundColor-item-#{$componentName}--hover");
$backgroundColor-item--selected: createThemeVar("Input:backgroundColor-item-#{$componentName}--selected");
```

### Step 3 — Write CSS rules using data attributes

```scss
@layer components {
  .trigger {
    background-color: #{$backgroundColor};
    border: #{$borderWidth} #{$borderStyle} #{$borderColor};

    // Standard pseudo-classes still work on the trigger button
    &:hover:not(:disabled) {
      background-color: #{$backgroundColor--hover};
    }

    // Handle disabled in both forms (ark-ui data attr + native HTML)
    &:disabled,
    &[data-disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .item {
    // Data attribute required here — :hover will not fire
    &[data-highlighted] {
      background-color: #{$backgroundColor-item--hover};
    }
    &[data-selected] {
      background-color: #{$backgroundColor-item--selected};
    }
    &[data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
```

### Step 4 — Add the `:export` block

```scss
:export {
  themeVars: t.json-stringify($themeVars);
}
```

### Step 5 — Wire up `defaultThemeVars` in the React wrapper

```tsx
export const MyComponentMd = createMetadata({
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // Use token references wherever possible — avoid hard-coded values.
    [`backgroundColor-MyComponent`]: "$color-surface-50",
    [`borderColor-MyComponent`]:     "$color-surface-300",
    [`borderRadius-MyComponent`]:    "$borderRadius",

    // State-specific
    [`backgroundColor-MyComponent--hover`]:          "$color-surface-100",
    [`backgroundColor-item-MyComponent--selected`]:  "$color-primary-100",

    // Light / dark tone overrides
    light: {
      [`backgroundColor-MyComponent`]: "$color-surface-0",
    },
    dark: {
      [`backgroundColor-MyComponent`]: "$color-surface-100",
    },
  },
});
```

---

## 4. Package vs. core: `@use` path difference

The `@use` path differs depending on whether you work inside an external package or inside the XMLUI core:

```scss
// In a package (xmlui-select, xmlui-dnd, etc.)
@use "xmlui/themes.scss" as t;

// Inside core (xmlui/src/components/*)
@use "../../components-core/theming/themes" as t;
```

---

## 5. Quick checklist

For every new ark-ui component integrated into XMLUI theming:

- [ ] `@use "xmlui/themes.scss" as t` at the top of the SCSS file
- [ ] `$themeVars: ()` and `createThemeVar` boilerplate in place
- [ ] Every styleable part has a `createThemeVar` call
- [ ] CSS rules use `data-*` attributes for hover/selected/disabled states on list items
- [ ] `[data-state="unchecked"]` used to hide the `ItemIndicator` when not selected
- [ ] Portaled elements receive their scoped class via `className={styles.xxx}` prop (no parent selectors)
- [ ] `:export { themeVars: ... }` at the end of the SCSS file
- [ ] `parseScssVar(styles.themeVars)` in the component metadata
- [ ] `defaultThemeVars` uses token references, includes `light` / `dark` overrides where needed
