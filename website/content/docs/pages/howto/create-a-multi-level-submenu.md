# Create a multi-level submenu

Nest `SubMenuItem` inside `DropdownMenu` for two or more levels of menu hierarchy.

`SubMenuItem` acts as both a menu item and a container. It displays a label with a chevron indicator, and hovering or clicking it reveals a nested submenu. Nest `MenuItem`, `MenuSeparator`, and even more `SubMenuItem` components inside it to build as many levels as you need.

```xmlui-pg copy display name="Open the menu and hover over submenus"
---app display
<App>
  <variable name="lastAction" value="(none)" />

  <HStack verticalAlignment="center">
    <Text variant="strong">Document editor</Text>
    <SpaceFiller />
    <DropdownMenu label="Insert" triggerButtonVariant="outlined">
      <MenuItem
        label="Text block"
        icon="text"
        onClick="lastAction = 'Inserted text block'" />
      <MenuSeparator />
      <SubMenuItem label="Table" icon="table">
        <MenuItem
          label="2 × 2"
          onClick="lastAction = 'Inserted 2×2 table'" />
        <MenuItem
          label="3 × 3"
          onClick="lastAction = 'Inserted 3×3 table'" />
        <MenuItem
          label="4 × 4"
          onClick="lastAction = 'Inserted 4×4 table'" />
      </SubMenuItem>
      <SubMenuItem label="Media">
        <MenuItem
          label="Image"
          icon="image"
          onClick="lastAction = 'Inserted image'" />
        <MenuItem
          label="Video"
          onClick="lastAction = 'Inserted video'" />
        <MenuSeparator />
        <SubMenuItem label="Embed">
          <MenuItem
            label="YouTube"
            onClick="lastAction = 'Embedded YouTube'" />
          <MenuItem
            label="CodePen"
            onClick="lastAction = 'Embedded CodePen'" />
          <MenuItem
            label="Figma"
            onClick="lastAction = 'Embedded Figma'" />
        </SubMenuItem>
      </SubMenuItem>
      <MenuSeparator />
      <MenuItem
        label="Horizontal rule"
        onClick="lastAction = 'Inserted horizontal rule'" />
    </DropdownMenu>
  </HStack>

  <Text marginTop="$space-3" variant="caption">Last action: {lastAction}</Text>
</App>
```

## Key points

**`SubMenuItem` is both a trigger and a container**: Place `MenuItem`, `MenuSeparator`, or more `SubMenuItem` children inside it. The trigger shows the `label` text and a chevron; hovering or clicking opens the nested panel to the side.

**Nesting depth is unlimited**: A `SubMenuItem` inside another `SubMenuItem` creates a third level, and so on. Each level renders in its own portal so it is never clipped by overflow containers. Keep hierarchies shallow (two or three levels) for usability.

**`icon` on `SubMenuItem` works like `MenuItem`**: Set `icon="table"` to display an icon before the label. The icon is optional — omit it for submenus that don't need visual emphasis.

**Separators inside submenus are filtered automatically**: Place `<MenuSeparator />` freely between groups. If conditional `when` attributes hide all items in a group, adjacent separators collapse so no empty dividers appear.

**`triggerTemplate` lets you customise the submenu trigger**: Replace the default label + chevron with custom markup by providing a `triggerTemplate` property — useful when the submenu trigger needs a badge, shortcut hint, or different layout.

---

## See also

- [Add a dropdown menu to a button](/docs/howto/add-a-dropdown-menu-to-a-button) — set up the top-level dropdown and its trigger
- [Disable menu items conditionally](/docs/howto/disable-menu-items-conditionally) — grey out inapplicable actions inside any menu level
- [Build a toolbar with overflow menu](/docs/howto/build-a-toolbar-with-overflow-menu) — collapse toolbar items into a dropdown when space is tight
