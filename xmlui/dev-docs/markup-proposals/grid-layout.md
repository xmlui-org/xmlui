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

---

## Implementation Learnings

### Gap Properties

Grid supports three gap properties that follow CSS Grid conventions:
- `gap`: Shorthand for setting both column and row gaps
- `columnGap`: Specific gap between columns (overrides `gap` for columns)
- `rowGap`: Specific gap between rows (overrides `gap` for rows)

**Implementation detail**: `columnGap` and `rowGap` take precedence over `gap` when specified together. This allows setting a default gap with specific overrides.

```xml
<!-- Both column and row gaps set to 15px -->
<Grid gap="15px" columnWidths="* *">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Grid>

<!-- Different gaps for columns (30px) and rows (10px) -->
<Grid gap="10px" columnGap="30px" columnWidths="* *">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
  <Text>Item 4</Text>
</Grid>
```

### Star Sizing Implementation

Star sizing (`*`, `2*`, etc.) is converted to CSS `fr` units:
- `*` becomes `1fr`
- `2*` becomes `2fr`
- `3*` becomes `3fr`

This ensures proper proportional sizing using CSS Grid's fractional unit system.

### Spacing Theme Variables Support

Grid supports spacing theme variables in all sizing properties:
- `columnWidths`: Can use `$space-*` values (e.g., `$space-10 $space-20 *`)
- `rowHeights`: Can use `$space-*` values
- `gap`, `columnGap`, `rowGap`: Can use `$gap-*` named variables (e.g., `$gap-normal`, `$gap-tight`)

Example:
```xml
<Grid columnWidths="$space-10 $space-20 *" columnGap="$gap-normal">
  <Text>Fixed col 1 (40px)</Text>
  <Text>Fixed col 2 (80px)</Text>
  <Text>Flexible col 3</Text>
</Grid>
```

### Default Alignment Behavior

Grid provides default alignment for all items via `horizontalAlignment` and `verticalAlignment` props:
- **Default `horizontalAlignment`**: `"stretch"` (items fill their grid cell horizontally)
- **Default `verticalAlignment`**: `"stretch"` (items fill their grid cell vertically)
- Other values: `"start"`, `"center"`, `"end"`

Individual items can override these defaults using their own alignment props.

### Parsing and Validation

The Grid parser handles edge cases gracefully:
- Empty strings (`""`) for sizing properties are ignored
- Whitespace-only strings are treated as empty
- Supports mixed sizing: `"100px 2* 50%"` combines fixed, fractional, and percentage units
- Design tokens (e.g., `$space-10`) are resolved at render time
- `auto` keyword is supported for content-based sizing
