# Add row actions with a context menu

Right-click a table row to open a context menu with actions that operate on that row's data.

A `ContextMenu` is a non-visual component that you place as a sibling of the `Table`. When the user right-clicks a row, the Table's `onContextMenu` event fires with the row's `$item` in scope. Call `contextMenu.openAt(event, $item)` to show the menu at the cursor position and pass the row data as context. Inside the menu, reference `$context` to access the row object.

```xmlui-pg copy display name="Table with right-click context menu"
---app display /lastAction/
<App var.lastAction="">
  <ContextMenu id="rowMenu">
    <MenuItem
      label="Edit"
      onClick="lastAction = 'Edit: ' + $context.name"
    />
    <MenuItem
      label="Duplicate"
      onClick="lastAction = 'Duplicate: ' + $context.name"
    />
    <MenuSeparator />
    <MenuItem
      label="Delete"
      onClick="lastAction = 'Delete: ' + $context.name"
    />
  </ContextMenu>

  <Table
    data="{[
      { id: 1, name: 'Landing Page Redesign', status: 'In Progress', owner: 'Alice' },
      { id: 2, name: 'API Documentation', status: 'Done', owner: 'Bob' },
      { id: 3, name: 'Mobile App Prototype', status: 'To Do', owner: 'Carol' },
      { id: 4, name: 'Database Migration', status: 'In Progress', owner: 'David' }
    ]}"
    onContextMenu="(ev) => rowMenu.openAt(ev, $item)"
  >
    <Column bindTo="name" header="Project" />
    <Column bindTo="status" header="Status">
      <Badge value="{$cell}" />
    </Column>
    <Column bindTo="owner" header="Owner" />
  </Table>

  <Text when="{lastAction}">Last action: {lastAction}</Text>
</App>
```

## Key points

**`openAt(event, context)` positions the menu and passes row data**: The first argument is the mouse event (for positioning); the second is any value — typically `$item` — that becomes available as `$context` inside the menu's children.

**`$context` is available on every `MenuItem`**: Use it in `onClick` handlers or in `label` / `when` expressions to make menu items data-aware — for example, disabling "Delete" for rows in a certain status.

**`MenuSeparator` groups related actions visually**: Place it between logical groups (edit actions vs destructive actions) to add a dividing line.

**`ContextMenu` is non-visual until opened**: It renders nothing in the layout. Place it as a sibling of the `Table`, not inside it. Multiple tables can share the same `ContextMenu` by calling `openAt` with different context data.

---

## See also

- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — add inline action buttons as an alternative to context menus
- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — select rows before applying a bulk action
- [Build a master–detail layout](/docs/howto/build-a-master-detail-layout) — show full row details in a side panel instead of a menu
