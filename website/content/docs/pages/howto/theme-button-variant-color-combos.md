# Theme Button variant×color combos

Override Button theme vars for solid, outlined, and ghost variants crossed with primary, secondary, and attention colors.

Button theming uses a three-segment naming pattern: `{property}-Button-{themeColor}-{variant}`. This gives you surgical control over each combination — a purple solid primary button can coexist with a teal outlined secondary button on the same page. Append `--hover`, `--active`, or `--focus` to target interactive states.

```xmlui-pg copy display name="Button variant and color theming"
---app display
<App>
  <Theme
    backgroundColor-Button-primary-solid="#7c3aed"
    backgroundColor-Button-primary-solid--hover="#6d28d9"
    textColor-Button-primary-solid="white"
    borderRadius-Button-primary-solid="4px"
    textColor-Button-secondary-outlined="#7c3aed"
    borderColor-Button-secondary-outlined="#7c3aed"
    backgroundColor-Button-secondary-outlined--hover="#ede9fe"
    textColor-Button-attention-ghost="#dc2626"
    textColor-Button-attention-ghost--hover="#b91c1c"
    backgroundColor-Button-attention-ghost--hover="#fee2e2"
  >
    <HStack>
      <Button label="Primary solid" variant="solid" themeColor="primary" />
      <Button label="Secondary outlined" variant="outlined" themeColor="secondary" />
      <Button label="Attention ghost" variant="ghost" themeColor="attention" />
    </HStack>
  </Theme>
</App>
```

## Key points

**Three-segment pattern for variant combinations**: Button theme variables follow `{property}-Button-{themeColor}-{variant}`. The three accepted values for `themeColor` are `primary`, `secondary`, and `attention`; the three accepted values for `variant` are `solid`, `outlined`, and `ghost`. Every combination gets its own set of variables.

**Append `--hover`, `--active`, or `--focus` for interaction states**: Add `--hover` to override hover appearance: `backgroundColor-Button-primary-solid--hover`. The `--focus` suffix controls the focus-visible outline ring — use `outlineColor-Button-primary-solid--focus` and `outlineWidth-Button-primary-solid--focus` for accessible keyboard navigation.

**Disabled state is shared across all variants**: `backgroundColor-Button--disabled`, `textColor-Button--disabled`, and `borderColor-Button--disabled` apply to every button regardless of variant or color. Set these once on a wrapping `<Theme>` to define a global disabled appearance.

**Size padding is controlled separately**: Padding for `xs`, `sm`, `md`, and `lg` sizes lives at `padding-Button-xs` through `padding-Button-lg` — independent of variant and color. Adjust these to tighten or widen buttons without touching colors.

**`gap-Button` controls the icon-label gap**: When a Button has an icon, `gap-Button` sets the space between the icon and label text. This single var is shared across all variants and colors.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — wrapping components in `<Theme>` for scoped overrides
- [Theme Badge colors and sizes](/docs/howto/theme-badge-colors-and-sizes) — style Badge using the same property-component pattern
- [Disable menu items conditionally](/docs/howto/disable-menu-items-conditionally) — use the `enabled` prop rather than styling for behavioral disabling
