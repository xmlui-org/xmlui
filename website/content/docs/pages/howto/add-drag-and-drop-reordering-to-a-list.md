# Add drag-and-drop reordering to a list

Let users reorder list items with move-up and move-down buttons embedded in each row template.

XMLUI's `List` component does not expose native HTML5 drag events, so the reliable cross-device pattern is to add explicit reorder controls inside the item template. Move-up and move-down buttons swap adjacent items in the backing array; because XMLUI reacts to reassignment of a variable, the list re-renders immediately to reflect the new order.

```xmlui-pg copy display name="Reorderable task backlog"
---app
<App
  var.tasks="{[
    { id: 1, title: 'Define project requirements',      priority: 'High'   },
    { id: 2, title: 'Set up development environment',   priority: 'Normal' },
    { id: 3, title: 'Design database schema',           priority: 'High'   },
    { id: 4, title: 'Implement user authentication',    priority: 'Normal' },
    { id: 5, title: 'Write unit tests',                 priority: 'Low'    }
  ]}"
>
  <script>
    function moveItem(index, delta) {
      const target = index + delta;
      if (target < 0 || target >= tasks.length) return;
      const reordered = tasks.slice();
      reordered[index] = tasks[target];
      reordered[target] = tasks[index];
      tasks = reordered;
    }
  </script>
  <List data="{tasks}">
    <HStack verticalAlignment="center">
      <Icon name="grip-vertical" color="$color-surface-400" />
      <Text>{$item.title}</Text>
      <SpaceFiller />
      <Badge value="{$item.priority}" />
      <Button
        icon="chevronup"
        variant="ghost"
        enabled="{$itemIndex > 0}"
        onClick="moveItem($itemIndex, -1)"
      />
      <Button
        icon="chevrondown"
        variant="ghost"
        enabled="{$itemIndex < tasks.length - 1}"
        onClick="moveItem($itemIndex, 1)"
      />
    </HStack>
  </List>
</App>
```

## Key points

**Mutate then replace to trigger reactivity**: XMLUI only reacts to variable *reassignment* (`tasks = reordered`), not in-place mutations (`tasks[i] = x`). The `moveItem` function creates a copy with `.slice()`, swaps the two positions, then assigns the new array back to `tasks` — this is the correct pattern whenever you need to update an ordered list.

**`$itemIndex` gives the current 0-based position**: Pass it to your reorder function from the `onClick` handler. The index always reflects the item's current position in the `data` array, so it stays correct as the user moves items around.

**Disable buttons at the boundaries**: Set `enabled="{$itemIndex > 0}"` on the move-up button and `enabled="{$itemIndex < tasks.length - 1}"` on move-down. This prevents the first item from moving up and the last from moving down, avoiding out-of-bounds operations.

**A grip icon signals reorderability**: An `Icon name="grip-vertical"` at the left edge visually communicates to users that the row can be reordered — even when the actual repositioning happens through the arrow buttons rather than a drag gesture.

**Script functions have access to component-level variables**: Functions defined in a `<script>` block read and write `var.*` reactive variables declared on the same component. Calling `tasks = reordered` inside `moveItem` is equivalent to writing that assignment directly in the `onClick` expression.

---

## See also

- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — build richly styled list rows with Card, Badge, and Icon components
- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) — organize a reorderable list into named sections
- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — select multiple rows and act on them all at once
