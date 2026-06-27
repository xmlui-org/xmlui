# Highlight rows conditionally

Apply per-row styling inside Column templates so rows with certain data values stand out visually.

The Table component does not expose a per-row style prop, but every Column's cell template has access to `$item` — the full row object. Use conditional expressions on `backgroundColor`, `fontWeight`, `color`, or any visual prop within the cell template to highlight the row's content based on its data. Wrapping the cell content in a styled container makes the effect consistent across all columns.

```xmlui-pg copy display name="Conditional row highlighting"
---app display
<App>
  <Table
    data="{[
      { 
        id: 1, title: 'Fix login bug', status: 'overdue', 
        dueDate: '2025-12-01', assignee: 'Alice' 
      },
      { 
        id: 2, title: 'Update docs', status: 'on-track', 
        dueDate: '2026-04-15', assignee: 'Bob' 
      },
      { 
        id: 3, title: 'Redesign dashboard', status: 'at-risk', 
        dueDate: '2026-03-20', assignee: 'Carol' 
      },
      { 
        id: 4, title: 'Add dark mode', status: 'on-track', 
        dueDate: '2026-05-01', assignee: 'David' 
      },
      { 
        id: 5, title: 'Migrate database', status: 'overdue', 
        dueDate: '2025-11-15', assignee: 'Eva' 
      }
    ]}"
  >
    <Column bindTo="title" header="Task">
      <Text
        fontWeight="{$item.status === 'overdue' ? 'bold' : 'normal'}"
        color="{$item.status === 'overdue' ? '$color-danger' : ''}"
      >
        {$cell}
      </Text>
    </Column>

    <Column bindTo="status" header="Status">
      <Badge
        value="{$cell}"
        colorMap="{{
          overdue: '$color-danger',
          'at-risk': '$color-warn',
          'on-track': '$color-success'
        }}"
      />
    </Column>

    <Column bindTo="dueDate" header="Due Date">
      <Text color="{$item.status === 'overdue' 
        ? '$color-danger' : ''}">{$cell}</Text>
    </Column>

    <Column bindTo="assignee" header="Assignee">
      <Text fontStyle="{$item.status === 'overdue' 
        ? 'italic' : 'normal'}">{$cell}</Text>
    </Column>
  </Table>
</App>
```

## Key points

**Use `$item` in conditional expressions on visual props**: Since `$item` exposes the full row object inside every Column template, expressions like `color="{$item.status === 'overdue' ? '$color-danger' : ''}"` can drive any visual change based on any data field.

**Apply the same condition across all columns for a row-wide effect**: To make an entire row look highlighted, repeat the conditional style on each Column's template. This is more verbose than a single `rowStyle` prop, but it gives you full control over which columns participate.

**`Badge` with `colorMap` is the simplest per-value color mapping**: For a status or category column, `colorMap` maps each value to a color in a single declarative object — no ternary chain needed.

**Theme tokens work in conditional expressions**: Values like `'$color-danger'`, `'$color-warn'`, and `'$color-success'` resolve at render time. They adapt automatically when the user switches between light and dark tones.

---

## See also

- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — add Badge, Icon, or Button inside cell templates
- [Sort a table by a computed value](/docs/howto/sort-a-table-by-a-computed-value) — combine computed fields with conditional styling
- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — use selection state to highlight active rows
