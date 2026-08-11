# Use interactive Column controls

Use `Column type` values `checkbox`, `switch`, and `color` when a table cell should render a built-in control instead of text. These types are useful for lightweight row edits such as toggling flags or choosing a color.

Interactive typed columns use smart default widths. The cell width is large enough for the control and the table's default padding, and it grows when the column header needs more room, including the resize handle area. The controls are horizontally centered in their cells by default.

## Render controls in cells

Set the column `type` to render the matching control. `color` renders a color picker control.

```xmlui-pg copy display name="Render interactive Column controls"
<App>
  <Table
    data="{[
      {
        task: 'Review copy',
        approved: true,
        live: false,
        accent: '#3b82f6'
      },
      {
        task: 'Publish page',
        approved: false,
        live: true,
        accent: '#f59e0b'
      }
    ]}"
  >
    <Column bindTo="task" header="Task" />
    <Column bindTo="approved" header="Approved" type="checkbox" />
    <Column bindTo="live" header="Live" type="switch" />
    <Column bindTo="accent" header="Accent" type="color" />
  </Table>
</App>
```

## Save accepted changes

Use `onDidChange` when the user changes an interactive cell. The handler receives the new value, row object, zero-based visible row index, and column id.

```xmlui-pg copy display name="Handle accepted Column changes"
<App var.rows="{[
    { feature: 'Search', enabled: false, reviewed: true, accent: '#10b981' },
    { feature: 'Billing', enabled: true, reviewed: false, accent: '#6366f1' }
  ]}"
  var.lastChange=""
>
  <VStack>
    <Table data="{rows}">
      <Column bindTo="feature" header="Feature" />
      <Column
        bindTo="enabled"
        header="Enabled"
        type="switch"
        onDidChange="(newValue, row, rowIndex, columnId) => {
          row.enabled = newValue;
          lastChange = columnId + ' changed in row ' + (rowIndex + 1) + ': ' + newValue;
        }"
      />
      <Column
        bindTo="reviewed"
        header="Reviewed"
        type="checkbox"
        onDidChange="(newValue, row, rowIndex, columnId) => {
          row.reviewed = newValue;
          lastChange = columnId + ' changed in row ' + (rowIndex + 1) + ': ' + newValue;
        }"
      />
      <Column
        bindTo="accent"
        header="Accent"
        type="color"
        onDidChange="(newValue, row, rowIndex, columnId) => {
          row.accent = newValue;
          lastChange = columnId + ' changed in row ' + (rowIndex + 1) + ': ' + newValue;
        }"
      />
    </Table>
    <Text when="{lastChange}">Last change: {lastChange}</Text>
  </VStack>
</App>
```

## Cancel a change before it commits

Use `onWillChange` when a change must be approved before the underlying control accepts it. Return explicit `false` to cancel. Returning `undefined`, or not returning a value, allows the change.

```xmlui-pg copy display name="Cancel interactive Column changes"
<App var.rows="{[
    { feature: 'Billing', locked: true, enabled: false },
    { feature: 'Search', locked: false, enabled: false }
  ]}"
  var.lastChange=""
>
  <VStack>
    <Table data="{rows}">
      <Column bindTo="feature" header="Feature" />
      <Column bindTo="locked" header="Locked" type="checkbox" readOnly />
      <Column
        bindTo="enabled"
        header="Enabled"
        type="switch"
        onWillChange="(newValue, row) => row.locked ? false : undefined"
        onDidChange="(newValue, row) => {
          row.enabled = newValue;
          lastChange = row.feature + ' enabled: ' + newValue;
        }"
      />
    </Table>
    <Text when="{lastChange}">Last change: {lastChange}</Text>
  </VStack>
</App>
```

## Disable or make controls read-only

Set `enabled="false"` to disable the underlying control. Set `readOnly` to show the value without allowing user changes.

```xmlui-pg copy display name="Disable and read-only interactive Columns"
<App>
  <Table
    data="{[
      {
        row: 'Current release',
        reviewed: true,
        live: false,
        accent: '#336699'
      }
    ]}"
  >
    <Column bindTo="row" header="Row" />
    <Column bindTo="reviewed" header="Read-only checkbox" type="checkbox" readOnly />
    <Column bindTo="live" header="Disabled switch" type="switch" enabled="false" />
    <Column bindTo="accent" header="Read-only color" type="color" readOnly />
  </Table>
</App>
```

## Key points

**Use typed controls for simple row edits**: `checkbox`, `switch`, and `color` columns render controls without custom cell markup.

**Persist accepted changes in `onDidChange`**: The event tells you what changed, but your app still decides how to update row data or external state.

**Cancel only with explicit `false`**: `onWillChange` aborts the underlying control change only when it returns `false`.

**Control editing with `enabled` and `readOnly`**: Both properties are applied to the underlying checkbox, switch, or color picker.

---

## See also

- [Column](/docs/reference/components/Column) - all supported column properties and events
- [Format table columns by type](/docs/howto/format-table-columns-by-type) - display typed table values
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) - use nested markup when a cell needs a custom layout
