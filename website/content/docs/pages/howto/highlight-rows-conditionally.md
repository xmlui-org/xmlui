# Highlight rows conditionally

Make rows stand out in a `Table`, either one row that your app picks from code, or every row whose data matches a condition.

| You want to highlight | Use |
| --- | --- |
| One row chosen by the app: the current step, the playing item, the record open in a side panel | [The table's selection](#highlight-one-row-from-code), set with `selectId()` |
| Every row whose data matches a condition, such as all overdue tasks | [Conditional styles in the cell templates](#style-rows-by-their-data) |
| One row, in a table whose selection is already used for selecting | Conditional styles in the cell templates, comparing `$item` with the app's state |

## Highlight one row from code

The `Table` component has no per-row style prop, but a selected row is styled as a whole. When the row to highlight is decided by the app, drive the table's selection from code:

- `rowsSelectable="true"` turns selection on, and `enableMultiRowSelection="false"` keeps it to one row;
- `hideSelectionCheckboxes="true"` hides the checkboxes; selection still works through the API, clicks and the keyboard;
- `selectId(id)` highlights the row with that ID (by default the `id` field), replacing any previous selection, and `clearSelection()` removes the highlight.

```xmlui-pg copy display name="Highlight one row from code" id="highlight-one-row-from-code" height="360px"
<App
  var.tasks="{[
    { id: 1, title: 'Fix login bug' },
    { id: 2, title: 'Update docs' },
    { id: 3, title: 'Redesign dashboard' },
    { id: 4, title: 'Add dark mode' }
  ]}"
  var.current="{-1}">
  <script>
    function show(index) {
      current = index;
      taskTable.selectId(tasks[index].id);
    }

    function clear() {
      current = -1;
      taskTable.clearSelection();
    }

    function syncFromSelection(items) {
      current = items.length ? tasks.findIndex((t) => t.id === items[0].id) : -1;
    }
  </script>
  <HStack verticalAlignment="center">
    <Button label="Previous" enabled="{current > 0}" onClick="show(current - 1)" />
    <Button label="Next" enabled="{current < tasks.length - 1}" onClick="show(current + 1)" />
    <Button label="Clear" variant="outlined" onClick="clear()" />
    <Text value="{current < 0 ? 'No current task' : 'Current: ' + tasks[current].title}" />
  </HStack>
  <Table
    id="taskTable"
    data="{tasks}"
    rowsSelectable="true"
    enableMultiRowSelection="false"
    hideSelectionCheckboxes="true"
    onSelectionDidChange="(items) => syncFromSelection(items)">
    <Column bindTo="id" header="#" width="3rem" />
    <Column bindTo="title" header="Task" />
  </Table>
</App>
```

Click **Next** to step through the tasks: the whole row of the current task is highlighted, and no column template styles anything. Clicking a row, or moving with the arrow keys once the table has focus, also changes the selection. `selectionDidChange` reports every change, whether it came from code, a click or a key, so `syncFromSelection` keeps `current` and the highlight in agreement.

Use `rowClick` instead when a click should *do* something, such as open or play the item, as in [Stitch together a sequence of clips](/docs/howto/log-a-media-players-playhead-path#stitch-together-a-sequence-of-clips). It reports the click without replacing or suppressing the selection. It does not fire for keyboard moves, so handle `selectionDidChange` too if keyboard users can move the selection.

The highlight color comes from the `backgroundColor-selected-Table` theme variable, which defaults to `$color-primary-100`. Hovering a selected row uses `backgroundColor-selected-Table--hover`.

## Style rows by their data

Every Column's cell template has access to `$item`, the full row object. Use conditional expressions on `backgroundColor`, `fontWeight`, `color`, or any visual prop within the cell template to highlight the row's content based on its data. Wrapping the cell content in a styled container makes the effect consistent across all columns.

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

**Use selection to highlight one row chosen from code**: `rowsSelectable` with `enableMultiRowSelection="false"` and `hideSelectionCheckboxes` turns the selection into a row highlight. `selectId()` sets it and `clearSelection()` removes it, and the whole row is styled, so no cell template changes.

**Keep the app's state in step with `selectionDidChange`**: clicks and arrow keys also move the selection. `selectionDidChange` reports every change; `rowClick` reports only clicks.

**Use `$item` in conditional expressions on visual props**: Since `$item` exposes the full row object inside every Column template, expressions like `color="{$item.status === 'overdue' ? '$color-danger' : ''}"` can drive any visual change based on any data field.

**Apply the same condition across all columns for a row-wide effect**: To make an entire row look highlighted, repeat the conditional style on each Column's template. This is more verbose than a single `rowStyle` prop, but it gives you full control over which columns participate.

**`Badge` with `colorMap` is the simplest per-value color mapping**: For a status or category column, `colorMap` maps each value to a color in a single declarative object — no ternary chain needed.

**Theme tokens work in conditional expressions**: Values like `'$color-danger'`, `'$color-warn'`, and `'$color-success'` resolve at render time. They adapt automatically when the user switches between light and dark tones.

---

## See also

- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — add Badge, Icon, or Button inside cell templates
- [Sort a table by a computed value](/docs/howto/sort-a-table-by-a-computed-value) — combine computed fields with conditional styling
- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — use selection state to highlight active rows
- [Log a media player's playhead path](/docs/howto/log-a-media-players-playhead-path) — highlight the playing clip's row with `selectId()`
- [Table](/docs/reference/components/Table) — `selectId`, `clearSelection`, `selectionDidChange`, `rowClick` and the `backgroundColor-selected-Table` theme variable
