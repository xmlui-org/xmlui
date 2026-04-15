# Open a context menu on right-click

Bind `onContextMenu` on a container and call `ContextMenu.openAt` to show per-item actions.

A `ContextMenu` is an invisible menu component that you open programmatically at the pointer position. Attach an `onContextMenu` handler to any element, call `menuId.openAt(event, data)` with the triggering event and an optional context object, and the menu appears right where the user clicked. Menu items access the context via `$context`.

```xmlui-pg copy display name="Right-click a project row" height="400px"
---app display
<App>
  <variable name="projects" value="{[
    { id: 1, name: 'Website Redesign', status: 'active' },
    { id: 2, name: 'Mobile App v2', status: 'planning' },
    { id: 3, name: 'API Migration', status: 'active' }
  ]}" />
  <variable name="lastAction" value="" />

  <ContextMenu id="projectMenu">
    <MenuItem
      label="Edit"
      onClick="lastAction = 'Edit: ' + $context.name" />
    <MenuItem
      label="Duplicate"
      onClick="lastAction = 'Duplicate: ' + $context.name" />
    <MenuSeparator />
    <MenuItem
      label="Archive"
      enabled="{$context.status !== 'paused'}"
      onClick="lastAction = 'Archive: ' + $context.name" />
    <MenuSeparator />
    <MenuItem
      label="Delete"
      onClick="() => {
        const yes = confirm('Delete project', 'Delete ' + 
          $context.name + ' permanently?');
        if (yes) {
          lastAction = 'Deleted: ' + $context.name;
          projects = projects.filter(p => p.id !== $context.id);
        }
      }" />
  </ContextMenu>

  <Text variant="strong" marginBottom="$space-2">Right-click a project row</Text>
  <Items data="{projects}">
    <Card onContextMenu="(e) => projectMenu.openAt(e, $item)">
      <HStack verticalAlignment="center">
        <Text variant="strong">{$item.name}</Text>
        <SpaceFiller />
        <Badge value="{$item.status}" />
      </HStack>
    </Card>
  </Items>

  <Text when="{lastAction}" variant="caption">
    Last action: {lastAction}
  </Text>
</App>
```

## Key points

**`openAt(event, context)` positions the menu at the pointer**: Pass the mouse event as the first argument so the menu appears exactly where the user right-clicked. The second argument becomes `$context` inside all menu items — pass the row data so items can act on it.

**`$context` gives menu items access to the triggering data**: Inside `MenuItem` handlers, read `$context.name`, `$context.id`, or any field from the object you passed to `openAt`. This is what connects a generic menu definition to the specific item that was clicked.

**Use `enabled` on `MenuItem` for conditional actions**: Bind `enabled="{$context.status !== 'paused'}"` to grey out actions that do not apply to the current item. The menu item remains visible but non-interactive.

**`MenuSeparator` groups related actions visually**: Place `<MenuSeparator />` between logical groups (edit actions, destructive actions) to help users scan the menu. Adjacent separators and leading/trailing separators are filtered out automatically.

**`ContextMenu` can also be opened from a button click**: Call `menuId.openAt(event)` from an `onClick` handler — there is no requirement that it come from a right-click. This is useful for a "more actions" (⋮) button pattern.

---

## See also

- [Add row actions with a context menu](/docs/howto/add-row-actions-with-a-context-menu) — attach a context menu to `Table` rows
- [Open a confirmation before delete](/docs/howto/open-a-confirmation-before-delete) — gate destructive menu items with the `confirm()` function
- [Show a slide-in settings drawer](/docs/howto/show-a-slide-in-settings-drawer) — open a non-blocking side panel instead of a menu
