# Make a Table responsive

Use `when-sm`, `when-md`, and `when-lg` on `Column` to progressively hide less important columns as the screen narrows.

A wide table with many columns becomes unreadable on a phone. Rather than building a separate mobile layout, apply `when-*` breakpoint attributes directly on each `Column`. Columns marked `when-sm` appear only on screens 576 px and wider; `when-md` requires 768 px; `when-lg` requires 992 px. Columns with no `when-*` attribute are always visible, making them the essential "anchor" columns for every breakpoint.

```xmlui-pg
---app
<App>
  <ResponsiveTable />
</App>
---comp display
<Component name="ResponsiveTable" var.people="{[
  { 
    name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', 
    status: 'active', salary: '95k' 
  },
  { 
    name: 'Bob Smith', email: 'bob@company.com', department: 'Marketing', 
    status: 'active', salary: '88k' 
  },
  { 
    name: 'Carol Davis', email: 'carol@company.com', department: 'Sales', 
    status: 'inactive', salary: '110k' 
  },
  { 
    name: 'David Wilson', email: 'david@company.com', department: 'Engineering', 
    status: 'active', salary: '105k' 
  },
  { 
    name: 'Eva Brown', email: 'eva@company.com', department: 'HR', status: 
    'active', salary: '75k' 
  }
]}">
  <VStack>
    <HStack>
      <Text size="lg">Responsive People Table</Text>
      <Badge value="Current: {mediaSize.size}" color="blue" />
    </HStack>
    <Text size="sm">
      Resize your browser window to see columns progressively hide
    </Text>

    <Table data="{people}">
      <!-- Essential: Avatar - always show -->
      <Column header="" width="50px">
        <Avatar name="{$item.name}" size="xs" />
      </Column>

      <!-- Essential: Name - always show -->
      <Column header="Name" bindTo="name" width="120px">
        <Text>{$item.name}</Text>
      </Column>

      <!-- Priority: Email - hide on xs screens -->
      <Column header="Email" bindTo="email" when-sm width="160px">
        <Text size="sm" color="gray">{$item.email}</Text>
      </Column>

      <!-- Secondary: Department - hide on xs/sm screens -->
      <Column header="Department" bindTo="department" when-md width="120px" />

      <!-- Tertiary: Status - only show on md+ screens -->
      <Column header="Status" bindTo="status" when-md width="80px">
        <Badge
          value="{$item.status}"
          color="{status === 'active' ? 'green' : 'gray'}"
          variant="pill"
        />
      </Column>

      <!-- Low Priority: Salary - only show on lg+ screens -->
      <Column header="Salary" bindTo="salary" when-lg width="100px">
        <Text size="sm" weight="medium">${$item.salary}</Text>
      </Column>
    </Table>

    <VStack gap="$gap-tight">
      <Text variant="strong">Column Visibility by Screen Size:</Text>
      <Text>xs: Avatar + Name only</Text>
      <Text>sm: + Email</Text>
      <Text>md: + Department + Status</Text>
      <Text>lg+: + Salary</Text>
    </VStack>
  </VStack>
</Component>
```

## Key points

**Columns without a `when-*` attribute are always visible**: Treat these as essential columns — name, ID, or a primary identifier — that must survive even on the smallest screen. Every other column should have a breakpoint attribute reflecting its relative importance.

**`when-sm`, `when-md`, `when-lg` are opt-in per tier**: Each attribute makes the column visible at that minimum width and all wider sizes. `when-md` on a column means it appears at ≥ 768 px (tablet and up) but is hidden below that threshold.

**`mediaSize.size` gives the current breakpoint name at runtime**: Reference `{mediaSize.size}` in any expression — in a `Badge`, a `Text`, or a conditional `when` — to display or react to the active breakpoint dynamically.

**Prioritise columns from essential to optional**: A practical order is: always-visible identifier → `when-sm` supporting detail (email) → `when-md` secondary context (department, status) → `when-lg` low-priority data (salary, notes). Users on small screens lose the least useful columns first.

**Column `width` still applies at every breakpoint where the column is shown**: Set explicit widths on always-visible columns to prevent them from stretching unnecessarily when wide columns disappear at smaller breakpoints.

---

## See also

- [Show different content per breakpoint](/docs/howto/show-different-content-per-breakpoint) — swap entire components (Table vs card List) rather than hiding columns
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — add Badge, Icon, or Avatar inside Column templates
- [Pin columns in a wide table](/docs/howto/pin-columns-in-a-wide-table) — keep key columns visible via pinning instead of breakpoints
