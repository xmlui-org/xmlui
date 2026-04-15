# Sort a table by a computed value

Add a derived property to each row so the Table can sort by a value that does not exist directly in the raw data.

The Table sorts columns by the property named in `bindTo`. When you need to sort by something computed — a full name assembled from first and last, a score derived from multiple fields, or a formatted date — add the computed property to the data array with `.map()` before passing it to the Table. The column can then `bindTo` the computed field and sorting works automatically.

```xmlui-pg copy display name="Sort by computed score"
---app display
<App
  var.rawTasks="{[
    { id: 1, title: 'Fix login bug', urgency: 5, impact: 3, effort: 2 },
    { id: 2, title: 'Update docs', urgency: 2, impact: 4, effort: 1 },
    { id: 3, title: 'Redesign dashboard', urgency: 3, impact: 5, effort: 5 },
    { id: 4, title: 'Add dark mode', urgency: 1, impact: 3, effort: 3 },
    { id: 5, title: 'Migrate database', urgency: 4, impact: 5, effort: 4 }
  ]}"
  var.tasks="{rawTasks.map(t => ({
    ...t,
    priorityScore: (t.urgency * 2 + t.impact * 3) / t.effort
  }))}"
>
  <Table
    data="{tasks}"
    sortBy="priorityScore"
    sortDirection="descending"
    width="100%"
  >
    <Column bindTo="title" header="Task" />
    <Column bindTo="urgency" header="Urgency" width="90px" />
    <Column bindTo="impact" header="Impact" width="80px" />
    <Column bindTo="effort" header="Effort" width="80px" />
    <Column bindTo="priorityScore" header="Priority Score" width="130px">
      <Text fontWeight="bold">{$cell.toFixed(1)}</Text>
    </Column>
  </Table>
</App>
```

## Key points

**Compute the property before passing data to Table**: Use `.map()` on the data array to add a derived field — `priorityScore`, `fullName`, `daysUntilDue`, etc. The Table sorts the column by whatever property `bindTo` points to.

**`sortBy` and `sortDirection` set the initial sort**: `sortBy="priorityScore"` combined with `sortDirection="descending"` shows highest-priority tasks first when the page loads. The user can still click any column header to re-sort.

**The computed column can display a formatted value**: Even though the underlying data is a number, the cell template can render it with `.toFixed()`, add units, or show an icon — sorting still uses the raw numeric value from `bindTo`.

**Keep the computation in a `var.*` expression**: Declaring `var.tasks="{rawTasks.map(...)}"` keeps the mapping reactive. If `rawTasks` changes (e.g. after an API refetch), `tasks` re-evaluates and the Table re-renders with updated scores.

---

## See also

- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — format the computed value with Badge, Icon, or styled Text
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — reactive expression patterns for combining variables
- [Highlight rows conditionally](/docs/howto/highlight-rows-conditionally) — visually distinguish rows based on the computed value
