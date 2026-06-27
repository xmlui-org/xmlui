# Pin columns in a wide table

Freeze key columns so they stay visible while the rest of the table scrolls horizontally.

When a table has more columns than fit on screen, the user must scroll to see the rest. Pinning a column with `pinTo="left"` or `pinTo="right"` locks it in place so it remains visible regardless of the horizontal scroll position. Pin identifier columns (like name or ID) to the left and action columns to the right.

```xmlui-pg copy display name="Pinned columns in a wide table"
---app display
<App>
  <Table data="{[
    { 
      id: 'EMP-001', name: 'Alice Johnson', department: 'Engineering', 
      role: 'Senior Developer', location: 'New York', 
      startDate: '2021-03-15', salary: 95000, status: 'Active' 
    },
    { 
      id: 'EMP-002', name: 'Bob Martinez', department: 'Marketing', 
      role: 'Campaign Lead', location: 'Chicago', 
      startDate: '2022-07-01', salary: 78000, status: 'Active' 
    },
    { 
      id: 'EMP-003', name: 'Carol Chen', department: 'Design', 
      role: 'UX Designer', location: 'San Francisco', 
      startDate: '2020-11-20', salary: 88000, status: 'On Leave' 
    },
    { 
      id: 'EMP-004', name: 'David Kim', department: 'Engineering', 
      role: 'Backend Developer', location: 'Seattle', 
      startDate: '2023-01-10', salary: 92000, status: 'Active' 
    },
    { 
      id: 'EMP-005', name: 'Eva Novak', department: 'Sales', role: 
      'Account Executive', location: 'Boston', 
      startDate: '2022-04-18', salary: 72000, status: 'Active' 
    }
  ]}"
  >
    <Column bindTo="id" header="ID" pinTo="left" width="100px" />
    <Column bindTo="name" header="Name" pinTo="left" width="140px" />
    <Column bindTo="department" header="Department" width="140px" />
    <Column bindTo="role" header="Role" width="180px" />
    <Column bindTo="location" header="Location" width="140px" />
    <Column bindTo="startDate" header="Start Date" width="120px" />
    <Column bindTo="salary" header="Salary" width="100px">
      ${$cell.toLocaleString()}
    </Column>
    <Column bindTo="status" header="Status" pinTo="right" width="100px">
      <Badge value="{$cell}" />
    </Column>
  </Table>
</App>
```

## Key points

**`pinTo="left"` and `pinTo="right"` on `Column`**: The pinned column stays fixed at its edge while the unpinned columns scroll beneath it. A subtle shadow separates the pinned area from the scrollable region.

**Multiple columns can be pinned to the same side**: Pinning both `id` and `name` to the left keeps both visible as a fixed group. The columns stack in their declared order against the edge.

**Give pinned columns an explicit `width`**: A pinned column without a fixed width can cause layout jumps as the table adjusts. Set `width="100px"` or similar to keep the pinned area predictable.

**Pinned columns do not affect sort or selection**: Pinning is purely visual. Sorting by clicking the header and row selection work identically on pinned and unpinned columns.

---

## See also

- [Auto-size column widths with star](/docs/howto/auto-size-column-widths-with-star) — distribute remaining width among unpinned columns
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — add Badge, Icon, or Button inside a pinned column
- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — combine row selection with pinned identifier columns
