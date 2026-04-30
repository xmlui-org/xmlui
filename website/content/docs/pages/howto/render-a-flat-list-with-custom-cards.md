# Render a flat list with custom cards

Replace the default plain rows with styled Card items by placing your layout directly inside `List`.

Any component placed as a direct child of `List` becomes the item template — rendered once per data item with full access to the row's data via `$item`. Wrapping each row in a `Card` gives it its own bordered container and removes the default hover-highlight row chrome.

```xmlui-pg copy display name="Team directory with custom card rows"
---app
<App
  var.team="{[
    { 
      id: 1, name: 'Alice Chen', role: 'Senior Developer', 
      dept: 'Engineering', status: 'active'
    },
    { 
      id: 2, name: 'Bob Martinez', role: 'UI Designer',      
      dept: 'Design', status: 'active'   
    },
    { 
      id: 3, name: 'Carol Kim', role: 'Product Manager',  
      dept: 'Product', status: 'on-leave' 
    },
    { 
      id: 4, name: 'Dave Lee', role: 'DevOps Engineer',  
      dept: 'Engineering', status: 'active'   
    },
    { 
      id: 5, name: 'Eve Torres', role: 'UX Researcher',    
      dept: 'Design', status: 'active'   
    }
  ]}"
>
  <List data="{team}">
    <Card>
      <HStack verticalAlignment="center">
        <VStack>
          <Text fontWeight="bold">{$item.name}</Text>
          <Text variant="secondary">{$item.role}</Text>
          <Text variant="secondary">{$item.dept}</Text>
        </VStack>
        <SpaceFiller />
        <Badge
          value="{$item.status}"
          colorMap="{{ active: '$color-success', 'on-leave': '$color-warn' }}"
        />
      </HStack>
    </Card>
  </List>
</App>
```

## Key points

**Direct children of `List` become the item template automatically**: Placing a component as a child of `List` uses it as the row template for every item — no `<property name="itemTemplate">` wrapper needed. XMLUI calls this "children as template".

**`$item` exposes the current row's full data object**: Use `{$item.name}`, `{$item.role}`, and any other field from your data array. `$itemIndex` gives the 0-based position; `$isFirst` and `$isLast` mark the edge items; `$isSelected` is `true` when `rowsSelectable="{true}"` is set and the row is selected.

**Cards replace the default list row chrome**: A plain `List` row has a hover highlight and a divider. Wrapping each item in `Card` gives it its own visual container with a border, shadow, and inner padding — effectively turning the list into a card stack.

**`colorMap` maps data values to theme color tokens declaratively**: Instead of an inline ternary, pass a `colorMap="{{ active: '$color-success', 'on-leave': '$color-warn' }}"` to `Badge`. Every key-value pair in the map is resolved to the corresponding theme color automatically.

**Virtualization applies to custom templates too**: `List` renders only the visible rows regardless of how complex the item template is. Avoid storing per-row local state inside the template component; keep state in parent `var.*` variables, because off-screen items are unmounted and remounted as the user scrolls.

---

## See also

- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) — add collapsible department headers and per-group footers
- [Display an empty-state illustration](/docs/howto/display-an-empty-state-illustration) — show a placeholder card when the list has no data
- [Build a responsive card grid](/docs/howto/build-a-responsive-card-grid) — arrange cards in multiple columns with `TileGrid` or `HStack wrapContent`
