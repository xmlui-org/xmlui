# Disable menu items conditionally

Bind `enabled` on `MenuItem` to a reactive expression so disabled state reflects the current selection.

When an action does not apply to the current context — nothing is selected, the item is already archived, or the user lacks permission — grey it out instead of hiding it. Disabled items remain visible so users know the action exists, but they cannot be clicked. Bind `enabled` to any expression and it re-evaluates reactively whenever the underlying data changes.

```xmlui-pg copy display name="Select a task to enable actions"
---app display
<App var.tasks="{[
    { id: 1, name: 'Design mockups', status: 'active' },
    { id: 2, name: 'Write tests', status: 'active' },
    { id: 3, name: 'Deploy v2', status: 'archived' }
  ]}"
  var.selected="{null}"
  var.lastAction=""
>
  <HStack verticalAlignment="center">
    <H2>Tasks</H2>
    <SpaceFiller />
    <DropdownMenu label="Actions" triggerButtonVariant="outlined">
      <MenuItem
        label="Edit"
        icon="edit"
        enabled="{selected !== null && selected.status !== 'archived'}"
        onClick="lastAction = 'Editing: ' + selected.name" />
      <MenuItem
        label="Archive"
        icon="archive"
        enabled="{selected !== null && selected.status === 'active'}"
        onClick="() => {
          lastAction = 'Archived: ' + selected.name;
          tasks = tasks.map(t =>
            t.id === selected.id ? { ...t, status: 'archived' } : t
          );
          selected = { ...selected, status: 'archived' };
        }" />
      <MenuSeparator />
      <MenuItem
        label="Delete"
        icon="trash"
        enabled="{selected !== null}"
        onClick="() => {
          lastAction = 'Deleted: ' + selected.name;
          tasks = tasks.filter(t => t.id !== selected.id);
          selected = null;
        }" />
    </DropdownMenu>
  </HStack>

  <Items data="{tasks}">
    <Card
      orientation="horizontal"
      onClick="selected = $item"
      borderColor="{selected?.id === $item.id ? '$color-primary' : ''}"
      title="{$item.name}"
    >
        <SpaceFiller />
        <Badge value="{$item.status}" />
    </Card>
  </Items>

  <Text when="{lastAction}" variant="caption" marginTop="$space-2">
    Last action: {lastAction}
  </Text>
</App>
```

## Key points

**`enabled` accepts any reactive expression**: Bind `enabled="{selected !== null}"` so the item becomes clickable only when a task is selected. The expression re-evaluates automatically whenever `selected` changes — no manual refresh needed.

**Disabled items are visible but non-interactive**: A disabled `MenuItem` renders with reduced opacity and does not fire its `onClick` handler. This is better than hiding the item entirely because users can discover the action and understand what prerequisite is missing.

**Combine multiple conditions with `&&`**: `enabled="{selected !== null && selected.status === 'active'}"` ensures Archive is available only for active tasks. Each condition is evaluated left to right; the short-circuit prevents a null-reference error.

**`MenuSeparator` adapts when all neighbours are hidden**: If you use `when` to remove items entirely (rather than disabling them), adjacent separators collapse automatically. Mixing `when` for removal and `enabled` for greying out gives the best user experience.

**The same `enabled` prop works on `DropdownMenu` itself**: Set `enabled="{false}"` on the `DropdownMenu` component to disable the trigger button and prevent the menu from opening at all — useful when the entire action set is unavailable.

---

## See also

- [Add a dropdown menu to a button](/docs/howto/add-a-dropdown-menu-to-a-button) — set up the dropdown and its trigger
- [Open a context menu on right-click](/docs/howto/open-a-context-menu-on-right-click) — use `enabled` on `MenuItem` inside a `ContextMenu`
- [Create a multi-level submenu](/docs/howto/create-a-multi-level-submenu) — nest `SubMenuItem` for deeper hierarchies
