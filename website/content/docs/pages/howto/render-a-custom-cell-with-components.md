# Render a custom cell with components

Place any component — Badge, Icon, Button, Link — inside a `Column` to replace the default text cell with rich, interactive content.

By default a `Column` renders the raw value of its `bindTo` property as plain text. To display something richer, add child components inside `<Column>`. The children become the cell template and have access to `$item` (the full row object), `$cell` (the current column's value), and `$rowIndex`. Any XMLUI component works: badges for status, icons for visual cues, buttons for inline actions, or even nested layouts.

```xmlui-pg copy display name="Table with rich cell templates"
---app display /lastAction/
<App var.lastAction="">
  <Table
    data="{[
      { 
        id: 1, name: 'Alice Johnson', role: 'Senior Developer', 
        status: 'Active', priority: 'high' 
      },
      { 
        id: 2, name: 'Bob Martinez', role: 'Campaign Lead', 
        status: 'On Leave', priority: 'normal' 
      },
      { 
        id: 3, name: 'Carol Chen', role: 'UX Designer', 
        status: 'Active', priority: 'low' 
      },
      { 
        id: 4, name: 'David Kim', role: 'Backend Developer', 
        status: 'Inactive', priority: 'normal' 
        }
    ]}"
  >
    <Column header="Name" bindTo="name">
      <HStack gap="$space-2" verticalAlignment="center">
        <Icon name="user" size="sm" />
        <Text fontWeight="bold">{$item.name}</Text>
      </HStack>
    </Column>

    <Column header="Role" bindTo="role" />

    <Column header="Status" bindTo="status">
      <Badge
        value="{$cell}"
        colorMap="{{
          Active: '$color-success',
          'On Leave': '$color-warn',
          Inactive: '$color-surface-400'
        }}"
      />
    </Column>

    <Column header="Priority" bindTo="priority">
      <Badge
        value="{$cell}"
        variant="pill"
        colorMap="{{
          high: '$color-danger',
          normal: '$color-info',
          low: '$color-success'
        }}"
      />
    </Column>

    <Column header="Actions" width="120px">
      <HStack gap="$space-1">
        <Button
          label="View"
          size="xs"
          variant="ghost"
          onClick="lastAction = 'Viewed ' + $item.name"
        />
      </HStack>
    </Column>
  </Table>

  <Text when="{lastAction}">{lastAction}</Text>
</App>
```

## Key points

**`$item` and `$cell` are available in every Column template**: `$item` is the full row object — use it to combine fields or drive conditional logic. `$cell` is the shorthand for `$item[bindTo]`, the value of the column's bound property.

**`bindTo` is still useful even with a custom template**: Setting `bindTo` enables click-to-sort on the column header and makes `$cell` available. Omit it only for columns that have no corresponding data property (like an "Actions" column).

**`colorMap` on `Badge` maps values to colors declaratively**: Pass a double-brace object literal mapping each possible value to a theme token or hex color — no ternary chain needed.

**Any component tree works as a cell**: Nest `HStack`, `Icon`, `Text`, `Button`, `Link`, or even `ProgressBar` inside a `Column`. The cell template is rendered once per row, with `$item` scoped to that row's data.

---

## See also

- [Highlight rows conditionally](/docs/howto/highlight-rows-conditionally) — vary the entire row's visual style based on data values
- [Pin columns in a wide table](/docs/howto/pin-columns-in-a-wide-table) — freeze a column with rich content at the table edge
- [Add row actions with a context menu](/docs/howto/add-row-actions-with-a-context-menu) — use a right-click menu instead of inline action buttons
