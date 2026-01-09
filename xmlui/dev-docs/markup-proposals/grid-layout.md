### Grid-like Layout

**Where:** Invoices -> Invoices Dashboard
**Complexity:** Medium

Grid-like layout which we currently mimic by using VStacks in a HStack. Default is same-width columns, but user can select a specific "column" to adjust height, width, other aspects. OR define rows instead of columns.

- Should we use column or row description? Hybrid solution?
- Create syntax for actions on row or column items (bulk actions)? Do we need a special component/function for this or current toolset is enough?

Depending on the desired layout, either a column-first or row-first approach is better.
**Idea:** We could also support templating cells, which means a more data-driven solution without the complexity of the Table.

Grid should support implicit columns and rows, `columnWidths` and `rowHeights` properties set dimensions.
Grid should also support explicit columns and rows if the user wants a static layout:

**Implementation Note:** The component names are `Grid`, `GridRow`, and `GridColumn` to avoid conflicts with the existing `Column` component used by `Table`.

```xml
<!-- Number of rows is inferred by the number of GridRow components -->
<Grid columns="3">
  <GridRow>
    <Text>Total Outstanding Receivables</Text>
  </GridRow>
  <GridRow>
    <Text>Due Today</Text>
    <Text>Due Within 30 Days</Text>
    <Text>Overdue Invoice</Text>
  </GridRow>
</Grid>
```

If there are more GridRows or GridColumns are defined but the properties are also set, the explicit children definitions win.
If, for some reason, child GridRow or GridColumn components are removed from the layout, the fallback will be the `rows` and `columns` properties, if present.

Further examples:

```xml
<!-- Row-first grid, where columns can be specified in a property. -->
<!-- Implicitly all columns use star sizing, but here I used an explicit notation for Alketta's code as an example. -->
<Grid columnWidths="* * * * *">
  <GridRow>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Total Outstanding Receivables
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Due Today
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Due Within 30 Days
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Overdue Invoice
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Average No. of Days for Getting Paid
    </Text>
  </GridRow>
  <GridRow>
    <Text variant="strong" textColor="$color-primary-600">
      {dashboardData.value?.overdueFormatted || '€0,00'}
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueToday || '€0,00'}
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueWithin30Days || '€0,00'}
    </Text>
    <Text variant="strong" textColor="$color-error-600">
      {dashboardData.value?.overdue || '€0,00'}
    </Text>
    <Text variant="strong">
      {dashboardData.value?.averageDaysForFullPay || '0'} Days
    </Text>
  </GridRow>
</Grid>
<!-- OR -->
<!-- Column-first grid, where rows can be specified in a property. Star sizing does nothing on heights. -->
<Grid rowHeights="$space-10 10%">
  <GridColumn>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Total Outstanding Receivables
    </Text>
    <Text variant="strong" textColor="$color-primary-600">
      {dashboardData.value?.overdueFormatted || '€0,00'}
    </Text>
  </GridColumn>

  <GridColumn>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Due Today
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueToday || '€0,00'}
    </Text>
  </GridColumn>

  <GridColumn>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Due Within 30 Days
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueWithin30Days || '€0,00'}
    </Text>
  </GridColumn>

  <GridColumn>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Overdue Invoice
    </Text>
    <Text variant="strong" textColor="$color-error-600">
      {dashboardData.value?.overdue || '€0,00'}
    </Text>
  </GridColumn>

  <GridColumn>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Average No. of Days for Getting Paid
    </Text>
    <Text variant="strong">
      {dashboardData.value?.averageDaysForFullPay || '0'} Days
    </Text>
  </GridColumn>
</Grid>
```

In either case, you can define column and row widths and heights as necessary:

```xml
<Grid columnWidths="* *" rowHeights="$space-10 10%">
  <GridRow>
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Total Outstanding Receivables
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Due Today
    </Text>
  </GridRow>
  <GridRow>
    <Text variant="strong" textColor="$color-primary-600">
      {dashboardData.value?.overdueFormatted || '€0,00'}
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueToday || '€0,00'}
    </Text>
  </GridRow>
</Grid>
<!-- OR -->
<Grid columnWidths="* *">
  <GridRow height="$space-10">
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true">
      Total Outstanding Receivables
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Due Today
    </Text>
  </GridRow>
  <GridRow height="10%">
    <Text variant="strong" textColor="$color-primary-600">
      {dashboardData.value?.overdueFormatted || '€0,00'}
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueToday || '€0,00'}
    </Text>
  </GridRow>
</Grid>
```

Positioning in a grid cell could be done using vertical- and horizontalAlignment:

```xml
<Grid columnWidths="50% *">
  <GridRow height="$space-20">
    <Text variant="secondary" fontSize="$fontSize-sm" wordWrap="true" verticalAlignment="start" horizontalAlignment="end">
      Total Outstanding Receivables
    </Text>
    <Text variant="secondary" fontSize="$fontSize-sm">
      Due Today
    </Text>
  </GridRow>
  <GridRow>
    <Text variant="strong" textColor="$color-primary-600">
      {dashboardData.value?.overdueFormatted || '€0,00'}
    </Text>
    <Text variant="strong">
      {dashboardData.value?.dueToday || '€0,00'}
    </Text>
  </GridRow>
</Grid>
```

Using `Items` with Grid:

```xml
<Grid>
  <Items data="{[
    { idx: 1, value: 'One lion' },
    { idx: 2, value: 'Two monkeys' },
    { idx: 3, value: 'Three rabbits' },
  ]}">
    <GridRow>
      <Text>{$item.idx}</Text>
    </GridRow>
    <GridRow>
      <Text>{$item.value}</Text>
    </GridRow>
  </Items>
</Grid>
```

(TODO)
Support Template property?

```xml
<Grid columns="2" rows="2">
  <property name="template">
    <Text>{$item}</Text>
  </property>
</Grid>
```

Issues:
- How to infer row and column numbers
What if rowHeights are explicity set but we don't want to specify a height?

**Proposal:** Use `columns` and `rows` as a property to set number.
