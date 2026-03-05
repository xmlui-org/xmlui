# Theming Mantine Components in XMLUI

Reference implementation: `GradientSegmentedControl` wrapping Mantine's `SegmentedControl`.

---

## The Problem

Mantine components style themselves via their own CSS custom properties (`--sc-*`, `--mantine-*`). XMLUI's theming system works through a different set of CSS vars. The two systems need to be bridged explicitly — Mantine won't automatically pick up XMLUI design tokens.

---

## Step 1 — Discover Mantine's CSS vars

Before writing any code, inspect the Mantine component's stylesheet to find which `--*` vars it reads:

```
node_modules/@mantine/core/styles/<ComponentName>.css
```

Key findings for `SegmentedControl`:
- `--sc-radius` → border radius of root + indicator + label
- `--sc-label-color` → text color of the **active** label (others come from `--mantine-color-*`)
- `--sc-color` → solid background of the indicator (overridden by `background-image` for gradient)
- `.root` background: hardcoded to `--mantine-color-gray-1` / `--mantine-color-dark-8`
- `.indicator` background: `var(--sc-color, white/dark-5)`
- `.label` active color: `var(--sc-label-color, black/white)`

Mantine exposes `classNames` prop on every component, accepting `{ root, indicator, label, ... }`. This is the correct injection point — not `styles` prop (which is applied inline and less composable), not global CSS overrides.

---

## Step 2 — The SCSS Module

```scss
@use "xmlui/themes.scss" as t;

$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$componentName: "MyComponent";

// Declare one XMLUI var per styleable dimension
$backgroundColor-MyComponent: createThemeVar("backgroundColor-#{$componentName}");
$textColor-MyComponent:       createThemeVar("textColor-#{$componentName}");
// ... etc.

// Wrapper div: translate XMLUI vars → local --mc-* shorthand vars,
// then bridge into Mantine's --sc-* (or --mantine-*) vars.
.wrapper {
  --mc-bg:   #{$backgroundColor-MyComponent};
  --mc-text: #{$textColor-MyComponent};

  // bridge to whatever Mantine reads
  --sc-radius: var(--mc-radius);
  --sc-label-color: var(--mc-active-text);
}

// Inject into Mantine's internal elements via classNames
.root      { background-color: var(--mc-bg) !important; }
.indicator { background-image: linear-gradient(...) !important; }
.label     { color: var(--mc-text); }

:export {
  themeVars: t.json-stringify($themeVars);
}
```

**Why a wrapper div + local `--mc-*` vars?**  
The wrapper div is the CSS cascade root that holds both the XMLUI-resolved vars (set by the theming system) and the per-instance inline overrides (set by the native component's `style` prop). The local `--mc-*` indirection lets SCSS rules and Mantine bridge vars both read from the same source without referencing the long XMLUI var names everywhere.

**Why `!important` on some Mantine elements?**  
Mantine's built-in selectors use `[data-mantine-color-scheme='light'] .m_xxx` specificity, which beats a plain class selector. `!important` is the correct override mechanism here — it's not sloppy, it's intentional.

---

## Step 3 — The Native Component

The wrapper div serves two purposes:
1. Receives the SCSS `.wrapper` class (XMLUI theme vars land here via the theming system).
2. Receives inline `style` with per-instance `--mc-*` overrides computed from component props.

```tsx
import styles from "./MyComponent.module.scss";

const wrapperVars: React.CSSProperties = {
  ...(backgroundColor !== undefined && { "--mc-bg": backgroundColor } as any),
  ...(textColor !== undefined && { "--mc-text": textColor } as any),
};

return (
  <MantineProvider>
    <div className={`${styles.wrapper}${className ? ` ${className}` : ""}`} style={wrapperVars}>
      <MantineComponent
        classNames={{
          root: styles.root,
          indicator: styles.indicator,
          label: styles.label,
        }}
      />
    </div>
  </MantineProvider>
);
```

**Why `MantineProvider`?**  
Mantine components require a provider for their CSS vars to resolve. Wrap each component individually rather than wrapping the whole XMLUI app — the provider is lightweight.

**Prop override pattern:** Props are `undefined` by default. Only set inline CSS vars when the prop is actually provided. This ensures theme-var values aren't silently shadowed when the user hasn't specified a prop.

**Don't pass `className` to the Mantine component.** XMLUI's `className` contains layout CSS (width, margin, etc.) and must go on the outermost element you control — the wrapper div.

---

## Step 4 — The Renderer (`wrapComponent`)

```tsx
import { wrapComponent, createMetadata, d, parseScssVar } from "xmlui";
import styles from "./MyComponent.module.scss";

export const MyComponentMd = createMetadata({
  // ...props...
  themeVars: parseScssVar(styles.themeVars),  // ← registers vars for tooling/docs
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-200",  // references XMLUI design tokens
    light: {
      [`textColor-${COMP}`]: "$textColor-secondary",
    },
    dark: {
      [`textColor-${COMP}`]: "$textColor-secondary",
    },
  },
});

export const myComponentRenderer = wrapComponent(COMP, MyComponentNative, MyComponentMd, {
  booleans: ["disabled"],
  strings: ["backgroundColor", "textColor"],
  events: { didChange: "onChange" },
});
```

`defaultThemeVars` keys are plain (no namespace prefix). Use `$token-name` syntax to reference XMLUI design tokens. Supply `light`/`dark` sub-objects when defaults should differ between color schemes.

---

## Cascade Priority (lowest → highest)

1. `defaultThemeVars` in metadata — baked-in fallbacks, light/dark aware
2. App-level `<Theme>` component attributes or `config.json` theme overrides
3. Scoped `<Theme>` wrapping a subtree
4. Per-instance component props → inline `style` CSS vars on the wrapper div

---

## Checklist for a New Mantine Component

- [ ] Read `node_modules/@mantine/core/styles/<Component>.css` — note all `--sc-*` / `--mantine-*` vars the component reads
- [ ] Identify Mantine's `classNames` keys (`root`, `label`, `indicator`, `input`, etc.)
- [ ] Create `MyComponent.module.scss` with XMLUI boilerplate + local `--mc-*` vars + bridges
- [ ] Wrap render output in `<MantineProvider>` + a wrapper `<div className={styles.wrapper} style={wrapperVars}>`
- [ ] Pass `classNames` (not `styles` prop) to the Mantine component
- [ ] Place XMLUI `className` on the wrapper div, not the Mantine component
- [ ] Add per-prop override variables only when `prop !== undefined`
- [ ] Add `themeVars: parseScssVar(styles.themeVars)` and `defaultThemeVars` to `createMetadata`
- [ ] Declare override props as `strings` / `numbers` / `booleans` in `wrapComponent` config
