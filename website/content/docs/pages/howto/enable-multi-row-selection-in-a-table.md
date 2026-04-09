# Enable multi-row selection in a table

Turn on row selection checkboxes and read the selected items to perform bulk actions like delete or export.

Setting `rowsSelectable` on `Table` adds a selection checkbox to each row. By default multi-selection is enabled — users hold Ctrl or Shift to select several rows. Listen to `onSelectionDidChange` to receive the current selection array, or call `table.getSelectedItems()` at any time. Combine this with a bulk-action toolbar that enables only when rows are selected.

```xmlui-pg copy display name="Multi-row selection with bulk actions"
---app display /selectedCount/ /lastAction/
<App var.selectedCount="{0}" var.lastAction="">
  <HStack gap="$space-2" padding="$space-2">
    <Text variant="strong">{selectedCount} selected</Text>
    <SpaceFiller />
    <Button
      label="Export Selected"
      size="sm"
      enabled="{selectedCount > 0}"
      onClick="lastAction = 'Exported ' + 
        empTable.getSelectedItems().map(i => i.name).join(', ')"
    />
    <Button
      label="Delete Selected"
      size="sm"
      variant="outlined"
      enabled="{selectedCount > 0}"
      onClick="lastAction = 'Deleted ' + selectedCount + 
        ' item(s)'; empTable.clearSelection()"
    />
  </HStack>

  <Table
    id="empTable"
    rowsSelectable
    alwaysShowSelectionCheckboxes
    data="{[
      { id: 1, name: 'Alice Johnson', department: 'Engineering', status: 'Active' },
      { id: 2, name: 'Bob Martinez', department: 'Marketing', status: 'Active' },
      { id: 3, name: 'Carol Chen', department: 'Design', status: 'On Leave' },
      { id: 4, name: 'David Kim', department: 'Engineering', status: 'Active' },
      { id: 5, name: 'Eva Novak', department: 'Sales', status: 'Active' }
    ]}"
    width="100%"
    onSelectionDidChange="(items) => selectedCount = items.length"
  >
    <Column bindTo="name" header="Name" />
    <Column bindTo="department" header="Department" />
    <Column bindTo="status" header="Status">
      <Badge value="{$cell}" />
    </Column>
  </Table>

  <Text when="{lastAction}">{lastAction}</Text>
</App>
```

## Key points

**`rowsSelectable` enables selection**: Adding this boolean prop shows a checkbox column. Multi-selection is on by default — users can Ctrl-click or Shift-click to select ranges.

**`enableMultiRowSelection="{false}"` limits to single selection**: Set it to `false` when only one row should be active at a time, for example in a master–detail layout.

**`alwaysShowSelectionCheckboxes` prevents hover-only reveal**: By default checkboxes appear only on hover. This prop makes them permanently visible, which is clearer for users who need to select rows.

**`onSelectionDidChange` fires with the full selection array**: The handler receives the array of selected item objects. Use it to update a count variable, enable/disable bulk-action buttons, or sync with external state.

**`clearSelection()` and `getSelectedItems()` on the Table API**: Call `empTable.clearSelection()` after a bulk action completes. Call `empTable.getSelectedItems()` to read the current selection at action time rather than caching it.

---

## See also

- [Build a master–detail layout](/docs/howto/build-a-master-detail-layout) — use single-row selection to drive a detail panel
- [Add row actions with a context menu](/docs/howto/add-row-actions-with-a-context-menu) — per-row actions via right-click instead of bulk selection
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — add inline action buttons alongside selection checkboxes
