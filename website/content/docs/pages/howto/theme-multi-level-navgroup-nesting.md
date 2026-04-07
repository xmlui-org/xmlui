# Theme multi-level NavGroup nesting

Customize styles for up to 4 nesting levels and dropdown overlays in NavGroup.

NavGroup renders expandable groups of navigation links. Each nesting level (1–4) gets its own padding vars, letting you indent sub-groups progressively. In horizontal mode, nested groups open as dropdown overlays styled with `backgroundColor-dropdown-NavGroup` and `boxShadow-dropdown-NavGroup`.

```xmlui-pg copy display name="NavGroup nesting level theming"
---app display
<App layout="vertical">
  <Theme
    marginTop-items-NavGroup="$space-2"
    marginBottom-items-NavGroup="$space-2"
    paddingLeft-level1-NavGroup="$space-3"
    paddingLeft-level2-NavGroup="$space-5"
    paddingLeft-level3-NavGroup="$space-7"
    expandIconAlignment-NavGroup="end"
    backgroundColor-dropdown-NavGroup="white"
    boxShadow-dropdown-NavGroup="0 4px 16px rgba(0,0,0,0.1)"
    borderRadius-dropdown-NavGroup="8px"
    minWidth-dropdown-NavGroup="180px"
  >
    <NavPanel>
      <NavGroup label="Products">
        <NavLink label="Overview" to="/products" />
        <NavGroup label="Categories">
          <NavLink label="Electronics" to="/products/electronics" />
          <NavLink label="Clothing" to="/products/clothing" />
        </NavGroup>
      </NavGroup>
      <NavGroup label="Reports">
        <NavLink label="Analytics" to="/reports/analytics" />
        <NavLink label="Exports" to="/reports/exports" />
      </NavGroup>
    </NavPanel>
    <Text padding="$space-4">Content area</Text>
  </Theme>
</App>
```

## Key points

**`paddingLeft-level{n}-NavGroup` indents each nesting level**: Set `paddingLeft-level1-NavGroup` for top-level group items, `paddingLeft-level2-NavGroup` for their children, and so on up to level 4. This creates a clear visual hierarchy without custom CSS.

**`expandIconAlignment-NavGroup` controls chevron position**: Set to `"end"` to align the expand/collapse chevron at the right edge of the group header, or `"start"` to place it before the label.

**`marginTop-items-NavGroup` and `marginBottom-items-NavGroup` control group spacing**: These set the gap above the first child and below the last child in a group's item list. Use them to add breathing room between groups.

**Dropdown vars only apply in horizontal mode**: `backgroundColor-dropdown-NavGroup`, `boxShadow-dropdown-NavGroup`, `borderRadius-dropdown-NavGroup`, and `minWidth-dropdown-NavGroup` style the popover overlay that appears when a NavGroup is clicked in a horizontal layout. They have no effect in vertical mode.

**Container-level vars apply to the group wrapper**: `padding-NavGroup` and `margin-NavGroup` style the outer wrapper around the label and items — the full group container, not individual items inside it.

---

## See also

- [Style NavPanel for horizontal mode](/docs/howto/style-navpanel-for-horizontal-mode) — control the outer NavPanel shell
- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Create a multi-level submenu](/docs/howto/create-a-multi-level-submenu) — nesting SubMenuItem inside DropdownMenu
