# Auto-size column widths with star

Mix fixed-pixel, percentage, and star (`*`, `2*`) widths on Columns so the remaining space is divided proportionally.

When some columns need a fixed width (like a short ID or a status badge) and others should share the leftover space, use star sizing. A column with `width="*"` gets one share of the remaining width; `width="2*"` gets two shares. Fixed and star columns coexist naturally — fixed columns take their declared size first, then star columns divide what remains.

```xmlui-pg copy display name="Star-sized column widths"
---app display
<App>
  <Table
    data="{[
      { 
        id: 'PRJ-001', name: 'Landing Page Redesign', 
        description: 'Modernize the homepage with responsive layout.', 
        status: 'Active', progress: 65 
      },
      { 
        id: 'PRJ-002', name: 'API Documentation', 
        description: 'Complete reference docs for all public REST endpoints.', 
        status: 'Done', progress: 100 
      },
      { 
        id: 'PRJ-003', name: 'Mobile App Prototype', 
        description: 'Build interactive prototype covering core user flows.', 
        status: 'Planning', progress: 10 
      },
      { 
        id: 'PRJ-004', name: 'Database Migration', 
        description: 'Upgrade to PostgreSQL 16 with zero-downtime migration strategy.', 
        status: 'Active', progress: 40 
      }
    ]}"
  >
    <Column bindTo="id" header="ID" width="90px" />
    <Column bindTo="name" header="Project" width="*" />
    <Column bindTo="description" header="Description" width="2*" />
    <Column bindTo="status" header="Status" width="80px">
      <Badge value="{$cell}" />
    </Column>
    <Column bindTo="progress" header="Progress" width="100px">
      {$cell}%
    </Column>
  </Table>
</App>
```

## Key points

**Star columns divide the remaining space proportionally**: After all fixed-width and percentage-width columns are laid out, the leftover space is split among star columns. `width="*"` and `width="2*"` together give a 1:2 ratio — if 600px remains, the first gets 200px and the second gets 400px.

**Fixed and star widths combine naturally**: Use `width="90px"` for compact identifier columns and `width="*"` for content-heavy columns. The fixed columns keep their size regardless of the table's overall width.

**Star sizing makes the table responsive**: When the browser window widens or narrows, star columns absorb or shed the difference. Fixed-width columns stay stable, preventing ID or badge columns from stretching unnecessarily.

**`minWidth` and `maxWidth` constrain star columns**: Add `minWidth="120px"` to prevent a star column from shrinking below a readable size, or `maxWidth="400px"` to cap its growth.

**Omitting `width` defaults to auto-sizing**: A column without an explicit `width` auto-sizes to its content. This can cause inconsistent widths — prefer star sizing when you want predictable proportional distribution.

---

## See also

- [Pin columns in a wide table](/docs/howto/pin-columns-in-a-wide-table) — combine star sizing with pinned edge columns
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — fill star-sized columns with rich cell content
- [Build a master–detail layout](/docs/howto/build-a-master-detail-layout) — use star columns alongside a resizable detail panel
