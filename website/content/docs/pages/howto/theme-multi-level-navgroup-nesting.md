# Theme multi-level NavGroup nesting

Customize vertical nesting levels separately from horizontal dropdown overlays in NavGroup.

NavGroup renders expandable groups of navigation links. In vertical navigation, each nesting level can get its own padding so sub-groups step inward progressively. In horizontal navigation, nested groups open in dropdown overlays; the dropdown-specific theme variables only become visible in that horizontal layout.

## Vertical default

Use the default vertical menu first as a baseline. The nested groups expand in place, and the labels use the built-in indentation.

```xmlui-pg copy display name="Vertical NavGroup defaults" height="360px"
---app display
<App layout="vertical">
  <NavPanel>
    <NavLink label="Home" to="/" icon="home" />
    <NavGroup label="Products" icon="box">
      <NavLink label="Overview" to="/products" />
      <NavGroup label="Catalog">
        <NavLink label="Electronics" to="/products/electronics" />
        <NavGroup label="Accessories">
          <NavLink label="Chargers" to="/products/accessories/chargers" />
          <NavLink label="Adapters" to="/products/accessories/adapters" />
        </NavGroup>
      </NavGroup>
    </NavGroup>
    <NavGroup label="Reports" icon="chart">
      <NavLink label="Analytics" to="/reports/analytics" />
      <NavLink label="Exports" to="/reports/exports" />
    </NavGroup>
  </NavPanel>
  <Text padding="$space-4">Content area</Text>
</App>
```

## Vertical themed

Set the level-specific padding vars when the vertical hierarchy needs stronger separation. The increasing left padding is visible against the nav panel edge.

```xmlui-pg copy display name="Vertical NavGroup with progressive padding" height="360px"
---app display
<Theme
  backgroundColor-NavPanel="$color-surface-100"
  borderRight-NavPanel-vertical="1px solid $color-surface-300"
  paddingLeft-level1-NavGroup="$space-4"
  paddingLeft-level2-NavGroup="$space-10"
  paddingLeft-level3-NavGroup="$space-16"
  paddingLeft-level4-NavGroup="$space-22"
  paddingVertical-level1-NavGroup="$space-2"
  paddingVertical-level2-NavGroup="$space-2"
  paddingVertical-level3-NavGroup="$space-2"
  paddingVertical-level4-NavGroup="$space-2"
  marginTop-items-NavGroup="$space-1"
  marginBottom-items-NavGroup="$space-1"
  expandIconAlignment-NavGroup="end"
>
  <App layout="vertical">
    <NavPanel>
      <NavLink label="Home" to="/" icon="home" />
      <NavGroup label="Products" icon="box">
        <NavLink label="Overview" to="/products" />
        <NavGroup label="Catalog">
          <NavLink label="Electronics" to="/products/electronics" />
          <NavGroup label="Accessories">
            <NavLink label="Chargers" to="/products/accessories/chargers" />
            <NavLink label="Adapters" to="/products/accessories/adapters" />
          </NavGroup>
        </NavGroup>
      </NavGroup>
      <NavGroup label="Reports" icon="chart">
        <NavLink label="Analytics" to="/reports/analytics" />
        <NavLink label="Exports" to="/reports/exports" />
      </NavGroup>
    </NavPanel>
    <Text padding="$space-4">Content area</Text>
  </App>
</Theme>
```

## Horizontal themed

Use a horizontal layout to see the dropdown overlay vars. The nested `Catalog` group opens as an overlay, so `backgroundColor-dropdown-NavGroup`, `boxShadow-dropdown-NavGroup`, `borderRadius-dropdown-NavGroup`, and `minWidth-dropdown-NavGroup` affect the menu panel instead of the vertical tree.

```xmlui-pg copy display name="Horizontal NavGroup dropdown theming" height="320px"
---app display
<Theme
  textColor-NavLink="$color-primary-300"
  textColor-NavLink--hover="$color-primary-400"
  textColor-NavLink--active="$color-primary-500"
  textColor-NavLink--pressed="$color-primary-500"
  backgroundColor-NavLink="$color-surface-0"
  backgroundColor-NavLink--hover="$color-surface-100"
  backgroundColor-NavLink--active="$color-surface-100"
  paddingHorizontal-NavGroup="$space-4"
  paddingVertical-NavGroup="$space-3"
  paddingVertical-level2-NavGroup="$space-2"
  backgroundColor-dropdown-NavGroup="$color-surface-100"
  boxShadow-dropdown-NavGroup="0 14px 36px rgba(0,0,0,0.4)"
  borderRadius-dropdown-NavGroup="8px"
  minWidth-dropdown-NavGroup="220px"
  paddingLeft-level1-NavLink="$space-4"
  paddingRight-level1-NavLink="$space-4"
  paddingTop-level1-NavLink="$space-2"
  paddingBottom-level1-NavLink="$space-2"
  paddingLeft-level2-NavLink="$space-5"
  paddingRight-level2-NavLink="$space-5"
  paddingTop-level2-NavLink="$space-2"
  paddingBottom-level2-NavLink="$space-2"
>
  <App layout="horizontal">
    <NavPanel>
      <NavLink label="Home" to="/" icon="home" />
      <NavGroup label="Products" icon="box">
        <NavLink label="Overview" to="/products" />
        <NavGroup label="Catalog">
          <NavLink label="Electronics" to="/products/electronics" />
          <NavLink label="Accessories" to="/products/accessories" />
        </NavGroup>
      </NavGroup>
      <NavGroup label="Reports" icon="chart">
        <NavLink label="Analytics" to="/reports/analytics" />
        <NavLink label="Exports" to="/reports/exports" />
      </NavGroup>
    </NavPanel>
    <Text padding="$space-4">Content area</Text>
  </App>
</Theme>
```

## Key points

**Use vertical examples for level padding**: `paddingLeft-level1-NavGroup`, `paddingLeft-level2-NavGroup`, and the rest of the level-specific padding vars apply to the in-place nested menu tree. They are easiest to understand in a vertical NavPanel where every nested row remains visible.

**Use horizontal examples for dropdown vars**: `backgroundColor-dropdown-NavGroup`, `boxShadow-dropdown-NavGroup`, `borderRadius-dropdown-NavGroup`, and `minWidth-dropdown-NavGroup` style the dropdown overlay created by nested groups in horizontal navigation. They have no visible effect on the vertical in-place list.

**`expandIconAlignment-NavGroup` controls chevron position**: Set it to `"end"` to align the expand/collapse chevron at the right edge of the group header, or `"start"` to place it after the label.

**`marginTop-items-NavGroup` and `marginBottom-items-NavGroup` control group spacing**: These set the gap above the first child and below the last child in a group's item list. Use them to add breathing room between groups.

**Container-level vars apply to the group wrapper**: `padding-NavGroup` and `margin-NavGroup` style the outer wrapper around the label and items, not just an individual child link.

---

## See also

- [NavGroup component](/docs/reference/components/NavGroup) - full prop and theme variable reference
- [NavPanel component](/docs/reference/components/NavPanel) - horizontal and vertical navigation container styles
- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) - how `<Theme>` scoping works
