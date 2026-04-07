# Add a dropdown menu to a button

Use `DropdownMenu` with `MenuItem` and `MenuSeparator` for grouped button actions.

`DropdownMenu` renders a trigger button that opens a floating menu of actions. Place `MenuItem` children inside it for each action, and `MenuSeparator` to visually group them. The menu closes automatically after an item is clicked. Customise the trigger's label, icon, variant, and color — or replace it entirely with a `triggerTemplate`.

```xmlui-pg copy display name="Click the button to open the menu"
---app display
<App>
  <variable name="lastAction" value="(none)" />

  <HStack verticalAlignment="center">
    <H2>File manager</H2>
    <SpaceFiller />
    <DropdownMenu label="Actions" triggerButtonVariant="solid">
      <MenuItem
        label="New folder"
        icon="folder"
        onClick="lastAction = 'New folder created'" />
      <MenuItem
        label="Upload file"
        icon="upload"
        onClick="lastAction = 'Upload dialog opened'" />
      <MenuSeparator />
      <MenuItem
        label="Rename"
        icon="edit"
        onClick="lastAction = 'Rename mode'" />
      <MenuItem
        label="Move to trash"
        icon="trash"
        onClick="lastAction = 'Moved to trash'" />
    </DropdownMenu>
  </HStack>

  <Text marginTop="$space-3" variant="caption">Last action: {lastAction}</Text>
</App>
```

## Key points

**`label` and `triggerButtonVariant` style the built-in trigger**: Set `label` for the button text, `triggerButtonVariant` for the visual style (`"solid"`, `"outlined"`, `"ghost"`), and `triggerButtonThemeColor` for the color (`"primary"`, `"secondary"`, `"attention"`). An icon is shown by default; change it with `triggerButtonIcon`.

**`triggerTemplate` replaces the built-in button entirely**: When the default button is not enough, wrap any component — an `Icon`, a `Button` with custom markup, or even an avatar — inside `<property name="triggerTemplate">`. Clicking the template opens the menu.

**`MenuItem` fires `onClick` and auto-closes the menu**: Each `MenuItem` accepts an `onClick` handler. After the handler runs the menu automatically closes — no manual `close()` call needed. If no `onClick` is provided but `to` is set, clicking the item navigates to that URL instead.

**`MenuSeparator` groups related items visually**: Place `<MenuSeparator />` between logical groups. Adjacent separators and separators at the start or end of the menu are filtered out automatically, so conditional `when` attributes on items never leave orphaned dividers.

**`alignment` controls the dropdown position**: Set `alignment` to `"start"`, `"center"`, or `"end"` to align the menu relative to the trigger button. The default is `"start"` (left-aligned with the trigger).

---

## See also

- [Create a multi-level submenu](/docs/howto/create-a-multi-level-submenu) — nest `SubMenuItem` for deeper menu hierarchies
- [Disable menu items conditionally](/docs/howto/disable-menu-items-conditionally) — bind `enabled` to grey out inapplicable actions
- [Open a context menu on right-click](/docs/howto/open-a-context-menu-on-right-click) — show a menu at the pointer position instead of attached to a button
