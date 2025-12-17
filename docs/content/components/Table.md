# Table [#table]

`Table` presents structured data for viewing, sorting, selection, and interaction.

**Key features:**
- **Data integration**: Load data from APIs via [DataSource](/components/DataSource) or use static arrays
- **Virtualization**: Only renders visible rows for smooth performance with large datasets
- **Row selection**: Support single or multi-row selection for bulk operations
- **Pagination**: Built-in pagination controls for managing large datasets

Use `Column` to define headers, data binding, sorting behavior, and custom cell content.

In the following sections the examples use data with the structure outlined below:

| Id   | Name    | Quantity | Unit   | Category   |
| :--- | :------ | :------- | :----- | :--------- |
| 0    | Apples  | 5        | pieces | fruits     |
| 1    | Bananas | 6        | pieces | fruits     |
| 2    | Carrots | 100      | grams  | vegetables |
| 3    | Spinach | 1        | bunch  | vegetables |
| 4    | Milk    | 10       | liter  | diary      |
| 5    | Cheese  | 200      | grams  | diary      |

The data is provided as JSON. In the source code samples, the `data={[...]}` declaration represents the data above.

All samples use table columns with the following definition unless noted otherwise
(The `...` declaration nested into `<Table>` represents this column definition):

```xmlui copy 
<Table data='{[...]}'>
  <Column bindTo="name"/>
  <Column bindTo="quantity"/>
  <Column bindTo="unit"/>
</Table>
```

> **Note**: See [`Column`](../components/Column) to learn more about table columns.

## Properties [#properties]

### `alwaysShowPagination` [#alwaysshowpagination]

This property explicitly toggles pagination controls visibility. If set to `true`, controls are always shown even if there is only one page. If set to `false`, controls are hidden. If omitted, controls are hidden when there is only one page and shown otherwise. This property only has effect when pagination is enabled. It acts as an alias for showPaginationControls.

### `alwaysShowSelectionHeader` (default: false) [#alwaysshowselectionheader-default-false]

This property indicates when the row selection header is displayed. When the value is `true,` the selection header is always visible. Otherwise, it is displayed only when hovered.

### `alwaysShowSortingIndicator` (default: false) [#alwaysshowsortingindicator-default-false]

This property indicates whether the sorting indicator is always visible in the column headers. When set to `true`, the sorting indicator is always visible. Otherwise, it is visible only when the user hovers over/focuses the column header or the column is sorted.

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `buttonRowPosition` (default: "center") [#buttonrowposition-default-center]

Determines where to place the pagination button row in the layout. It works the same as the [Pagination component property](./Pagination#buttonrowposition).

Available values: `start`, `center` **(default)**, `end`

### `cellVerticalAlign` (default: "center") [#cellverticalalign-default-center]

This property controls the vertical alignment of cell content. It can be set to `top`, `center`, or `bottom`.

Available values: `top`, `center` **(default)**, `bottom`

### `checkboxTolerance` (default: "compact") [#checkboxtolerance-default-compact]

This property controls the tolerance area around checkboxes for easier interaction. This property only has an effect when the rowsSelectable property is set to `true`. `none` provides no tolerance (0px), `compact` provides minimal tolerance (8px), `comfortable` provides medium tolerance (12px), and `spacious` provides generous tolerance (16px) for improved accessibility.

Available values: `none`, `compact` **(default)**, `comfortable`, `spacious`

The default value is `false`.

```xmlui copy /checkboxTolerance="comfortable"/
<App>
  <Table data='{[...]}' 
    rowsSelectable="true"
    checkboxTolerance="comfortable"
  >
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: checkboxTolerance"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    rowsSelectable="true"
    checkboxTolerance="comfortable">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `data` [#data]

The component receives data via this property. The `data` property is a list of items that the `Table` can display.

```xmlui copy /data='{[...]}'/
<App>
  <Table data='{[...]}'>
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: data"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'>
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

You can also provide the `Table` with data directly from an API via this property.
Here, the component displays rocket information coming from the official SpaceX API.

```xmlui-pg copy display name="Example: data API Call"
<App>
  <Table data='https://api.spacexdata.com/v3/rockets'>
    <Column header="Image" size="140px">
      <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
    </Column>
    <Column canSort="true" bindTo="country"/>
    <Column canSort="true" bindTo="company"/>
  </Table>
</App>
```

### `enableMultiRowSelection` (default: true) [#enablemultirowselection-default-true]

This boolean property indicates whether you can select multiple rows in the table. This property only has an effect when the rowsSelectable property is set. Setting it to `false` limits selection to a single row.

This boolean property indicates whether you can select multiple rows in the table.
This property only has an effect when the `rowsSelectable` property is set.
Setting it to `false` limits selection to a single row.

By default, the value of this property is `true`.

```xmlui copy /enableMultiRowSelection="false"/
<App>
  <Table data='{[...]}' 
    rowsSelectable="true" 
    enableMultiRowSelection="false">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: enableMultiRowSelection"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    rowsSelectable="true" 
    enableMultiRowSelection="false">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `headerHeight` [#headerheight]

This optional property is used to specify the height of the table header.

It accepts common [size values](/styles-and-themes/common-units#size-values).

```xmlui copy /headerHeight="60px"/
<App>
  <Table data='{[...]}' headerHeight="60px">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: headerHeight"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    headerHeight="60px">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `hideHeader` (default: false) [#hideheader-default-false]

Set the header visibility using this property. Set it to `true` to hide the header.

Set the header visibility using this property. Set it to `true` to hide the header.
The default value is `false`.

```xmlui copy /hideHeader="true"/
<App>
  <Table data='{[...]}' hideHeader="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: hideHeader" height="300px"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    hideHeader="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `iconNoSort` [#iconnosort]

Allows setting an alternate icon displayed in the Table column header when sorting is enabled, but the column remains unsorted. You can change the default icon for all Table instances with the "icon.nosort:Table" declaration in the app configuration file.

Allows the customization of the icon displayed in a Table column header when when sorting is enabled
and sorting is not done according to the column. Use the "-" (dash) value to sign that you do not want to display an icon when a table column is not sorted.

```xmlui copy /iconNoSort="close"/
<App>
  <Table data='{[...]}' sortBy="quantity" iconNoSort="close">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

```xmlui-pg name="Example: iconNoSort"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    sortBy="quantity" iconNoSort="close">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

### `iconSortAsc` [#iconsortasc]

Allows setting an alernate icon displayed in the Table column header when sorting is enabled, and the column is sorted in ascending order. You can change the default icon for all Table instances with the "icon.sortasc:Table" declaration in the app configuration file.

Allows the customization of the icon displayed in a Table column header when sorting is enabled,
sorting is done according to the column, and the column is sorted in ascending order.

```xmlui copy /iconSortAsc="chevronup"/
<App>
  <Table data='{[...]}' sortBy="quantity" iconSortAsc="chevronup">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

```xmlui-pg copy name="Example: iconSortAsc"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    sortBy="quantity" iconSortAsc="chevronup">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

### `iconSortDesc` [#iconsortdesc]

Allows setting an alternate icon displayed in the Table column header when sorting is enabled, and the column is sorted in descending order. You can change the default icon for all Table instances with the "icon.sortdesc:Table" declaration in the app configuration file.

Allows the customization of the icon displayed in a Table column header when sorting is enabled,
sorting is done according to the column, and the column is sorted in descending order.

```xmlui copy /iconSortDesc="chevrondown"/
<App>
  <Table data='{[...]}' sortBy="quantity" iconSortDesc="chevrondown">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

Select a column header and set it to descending ordering.

```xmlui-pg name="Example: iconSortDesc"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    sortBy="quantity" iconSortDesc="chevrondown">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

### `idKey` (default: "id") [#idkey-default-id]

This property is used to specify the unique ID property in the data array. If the idKey points to a property that does not exist in the data items, that will result in incorrect behavior when using selectable rows.

```xmlui copy /idKey="key"/
<App>
  <Table
    idKey="key"
    rowsSelectable="true"
    data="{[
      { 'key': 0, 'name': 'John' },
      { 'key': 1, 'name': 'Jane' },
      { 'key': 2, 'name': 'Bill' },
    ]}"
  > 
    <Column bindTo="name"/>
  </Table>
</App>
```

### `initiallySelected` [#initiallyselected]

An array of IDs that should be initially selected when the table is rendered. This property only has an effect when the rowsSelectable property is set to `true`.

### `isPaginated` (default: false) [#ispaginated-default-false]

This property adds pagination controls to the `Table`.

```xmlui copy /isPaginated="true"/
<App>
  <Table data='{[...]}' isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: isPaginated"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `loading` [#loading]

This boolean property indicates if the component is fetching (or processing) data. This property is useful when data is loaded conditionally or receiving it takes some time.

This boolean property indicates if the component is fetching (or processing) data.
This property is useful when data is loaded conditionally or receiving it takes some time.

```xmlui-pg copy display name="Example: loading"
<App>
  <Table loading="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

### `noBottomBorder` (default: false) [#nobottomborder-default-false]

This property indicates whether the table should have a bottom border. When set to `true`, the table does not have a bottom border. Otherwise, it has a bottom border.

### `noDataTemplate` [#nodatatemplate]

A property to customize what to display if the table does not contain any data.

```xmlui-pg copy {3-5} display name="Example: noDataTemplate"
<App>
  <Table>
    <property name="noDataTemplate">
      <Text value="No data loaded" variant="strong" />
    </property>
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

### `pageInfoPosition` [#pageinfoposition]

Determines where to place the page information in the layout. It works the same as the [Pagination component property](./Pagination#pageinfoposition).

### `pageSize` [#pagesize]

This property defines the number of rows to display per page when pagination is enabled.

Options

Page sizes are only accepted in an array, even if the array contains one item.

Note that this property only works if the [`isPaginated`](#ispaginated) property is set to `true`.

```xmlui copy /pageSizeOptions="{[3, 6, 12]}"/
<App>
  <Table data='{[...]}' isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: pageSizeOptions"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `pageSizeOptions` [#pagesizeoptions]

This property holds an array of page sizes (numbers) the user can select for pagination. If this property is not defined, the component allows only a page size of 10 items.

Page sizes are only accepted in an array, even if the array contains one item.

Note that this property only works if the [`isPaginated`](#ispaginated) property is set to `true`.

```xmlui copy /pageSizeOptions="{[3, 6, 12]}"/
<App>
  <Table data='{[...]}' isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: pageSizeOptions"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `pageSizeSelectorPosition` [#pagesizeselectorposition]

Determines where to place the page size selector in the layout. It works the same as the [Pagination component property](./Pagination#pagesizeselectorposition).

### `paginationControlsLocation` (default: "bottom") [#paginationcontrolslocation-default-bottom]

This property determines the location of the pagination controls. It can be set to `top`, `bottom`, or `both`.

Available values: `top`, `bottom` **(default)**, `both`

### `rowDisabledPredicate` [#rowdisabledpredicate]

This property defines a predicate function with a return value that determines if the row should be disabled. The function retrieves the item to display and should return a Boolean-like value.

The following example disables all table rows where the item's quantity exceeds 6:

```xmlui copy {3}
<App>
  <Table data='{[...]}'
    rowDisabledPredicate="{(item) => item.quantity > 6}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

>[!INFO]
> Disabled items are rendered with a different color.

```xmlui-pg name="Example: rowDisabledPredicate"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    rowDisabledPredicate="{(item) => item.quantity > 6}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `rowsSelectable` [#rowsselectable]

Indicates whether the rows are selectable (`true`) or not (`false`).

The default value is `false`.

```xmlui copy /rowsSelectable="true"/
<App>
  <Table data='{[...]}' rowsSelectable="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: rowsSelectable"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    rowsSelectable="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `rowUnselectablePredicate` [#rowunselectablepredicate]

This property defines a predicate function with a return value that determines if the row should be unselectable. The function retrieves the item to display and should return a Boolean-like value. This property only has an effect when the `rowsSelectable` property is set to `true`.

### `showCurrentPage` (default: true) [#showcurrentpage-default-true]

Whether to show the current page indicator. It works the same as the [Pagination component property](./Pagination#showcurrentpage).

### `showPageInfo` (default: true) [#showpageinfo-default-true]

Whether to show page information. It works the same as the [Pagination component property](./Pagination#showpageinfo).

### `showPageSizeSelector` (default: true) [#showpagesizeselector-default-true]

Whether to show the page size selector. It works the same as the [Pagination component property](./Pagination#showpagesizeselector).

### `sortBy` [#sortby]

This property is used to determine which data property to sort by. If not defined, the data is not sorted

```xmlui copy /sortBy="quantity"/
<App>
  <Table data='{[...]}' sortBy="quantity">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: sortBy"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    sortBy="quantity">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `sortDirection` [#sortdirection]

This property determines the sort order to be `ascending` or `descending`. This property only works if the [`sortBy`](#sortby) property is also set. By default ascending order is used.

```xmlui copy /sortDirection="descending"/
<App>
  <Table data='{[...]}' sortBy="quantity" sortDirection="descending">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: sortDirection"
<App>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}' 
    sortBy="quantity" sortDirection="descending">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

### `syncWithAppState` [#syncwithappstate]

An AppState instance to synchronize the table's selection state with. The table will read from and write to the 'selectedIds' property of the AppState object. When provided, this takes precedence over the initiallySelected property for initial selection. You can use the AppState's didUpdate event to receive notifications when the selection changes.

## Events [#events]

### `selectionDidChange` [#selectiondidchange]

This event is triggered when the table's current selection (the rows selected) changes. Its parameter is an array of the selected table row items. 

**Signature**: `selectionDidChange(selectedItems: any[]): void`

- `selectedItems`: An array of the selected table row items.

Of course, if multiple-row selection is not allowed (`enableMultipleRowSelection` is false), this array will contain zero or one item.

```xmlui copy {4}
<App var.selection="">
  <Text>Current selection (row IDs): [{selection}]</Text>
  <Table data='{[...]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(newSel) => selection = newSel.map(item => item.id).join()" >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

Click on any of the column headers to trigger a new sorting:

```xmlui-pg name="Example: selectionDidChange"
<App var.selection="">
  <Text>Current selection (row IDs): [{selection}]</Text>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(newSel) => selection = newSel.map(item => item.id).join()" >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

### `sortingDidChange` [#sortingdidchange]

This event is fired when the table data sorting has changed. It has two arguments: the column's name and the sort direction. When the column name is empty, the table displays the data list as it received it.

**Signature**: `sortingDidChange(columnName: string, sortDirection: 'asc' | 'desc' | null): void`

- `columnName`: The name of the column being sorted.
- `sortDirection`: The sort direction: 'asc' for ascending, 'desc' for descending, or null for unsorted.

Note the [`canSort`](/components/Column#cansort-default-true) properties on the `Column` components which enable custom ordering.

```xmlui copy {4}
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[...]}'
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

Click on any of the column headers to trigger a new sorting:

```xmlui-pg name="Example: sortingDidChange"
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

### `willSort` [#willsort]

This event is fired before the table data is sorted. It has two arguments: the column's name and the sort direction. When the method returns a literal `false` value (and not any other falsy one), the method indicates that the sorting should be aborted.

**Signature**: `willSort(columnName: string, sortDirection: 'asc' | 'desc'): boolean | void`

- `columnName`: The name of the column about to be sorted.
- `sortDirection`: The intended sort direction: 'asc' for ascending or 'desc' for descending.

The following example uses the `willSort` event to refuse sorting by name:

```xmlui copy {4}
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[...]}'
    onWillSort="(by, dir) => by !== 'name'"
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

Click on any of the column headers to trigger the event.
Though sorting is enabled in the `TableColumnnDef` component of the "name" column via `canSort`,
clicking that column header still does not sort because `willSort` prevents it:

```xmlui-pg name="Example: willSort"
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    onWillSort="(by, dir) => by !== 'name'"
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

## Exposed Methods [#exposed-methods]

### `clearSelection` [#clearselection]

This method clears the list of currently selected table rows.

**Signature**: `clearSelection(): void`

```xmlui copy /clearSelection()/ /selectId(1)/ /selectId([2, 4])/ /selectAll()/
<App>
  <HStack>
    <Button label="Select all" onClick="table.selectAll()" />
    <Button label="Clear all" onClick="table.clearSelection()" />
    <Button label="Select 1" onClick="table.selectId(1)" />
    <Button label="Select 2, 4" onClick="table.selectId([2, 4])" />
  </HStack>
  <Table id="table" data='{[...]}'
    rowsSelectable="true"
    enableMultiRowSelection="true">
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

```xmlui-pg name="Example: clearSelection"
<App>
  <HStack>
    <Button label="Select all" onClick="table.selectAll()" />
    <Button label="Clear all" onClick="table.clearSelection()" />
    <Button label="Select 1" onClick="table.selectId(1)" />
    <Button label="Select 2, 4" onClick="table.selectId([2, 4])" />
  </HStack>
  <Table id="table" data='{[
  {
    id: 0,
    name: "Apples",
    quantity: 5,
    unit: "pieces",
    category: "fruits",
    key: 5,
  },
  {
    id: 1,
    name: "Bananas",
    quantity: 6,
    unit: "pieces",
    category: "fruits",
    key: 4,
  },
  {
    id: 2,
    name: "Carrots",
    quantity: 100,
    unit: "grams",
    category: "vegetables",
    key: 3,
  },
  {
    id: 3,
    name: "Spinach",
    quantity: 1,
    unit: "bunch",
    category: "vegetables",
    key: 2,
  },
  {
    id: 4,
    name: "Milk",
    quantity: 10,
    unit: "liter",
    category: "dairy",
    key: 1,
  },
  {
    id: 5,
    name: "Cheese",
    quantity: 200,
    unit: "grams",
    category: "dairy",
    key: 0,
  },
]}'
    rowsSelectable="true"
    enableMultiRowSelection="true">
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

### `getSelectedIds` [#getselectedids]

This method returns the list of currently selected table rows IDs.

**Signature**: `getSelectedIds(): Array<string>`

(See the [example](#clearselection) at the `clearSelection` method)

### `getSelectedItems` [#getselecteditems]

This method returns the list of currently selected table rows items.

**Signature**: `getSelectedItems(): Array<TableRowItem>`

(See the [example](#clearselection) at the `clearSelection` method)

### `selectAll` [#selectall]

This method selects all the rows in the table. This method has no effect if the rowsSelectable property is set to `false`.

**Signature**: `selectAll(): void`

(See the [example](#clearselection) at the `clearSelection` method)

### `selectId` [#selectid]

This method selects the row with the specified ID. This method has no effect if the `rowsSelectable` property is set to `false`. The method argument can be a single id or an array of them.

**Signature**: `selectId(id: string | Array<string>): void`

- `id`: The ID of the row to select, or an array of IDs to select multiple rows.

(See the [example](#clearselection) at the `clearSelection` method)

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`pagination`**: The pagination controls container.
- **`table`**: The main table container.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-heading-Table | $color-surface-100 | $color-surface-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-heading-Table--active | $color-surface-300 | $color-surface-300 |
| [backgroundColor](../styles-and-themes/common-units/#color)-heading-Table--hover | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-pagination-Table | $backgroundColor-Table | $backgroundColor-Table |
| [backgroundColor](../styles-and-themes/common-units/#color)-row-Table | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-row-Table--hover | $color-primary-50 | $color-primary-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-selected-Table | $color-primary-100 | $color-primary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-selected-Table--hover | $backgroundColor-row-Table--hover | $backgroundColor-row-Table--hover |
| [backgroundColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-cell-Table | 1px solid $borderColor | 1px solid $borderColor |
| [border](../styles-and-themes/common-units/#border)-Table | 0px solid transparent | 0px solid transparent |
| [borderBottom](../styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-last-row-Table | $borderBottom-cell-Table | $borderBottom-cell-Table |
| [borderBottom](../styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Table | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Table | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-heading-Table | $fontSize-tiny | $fontSize-tiny |
| [fontSize](../styles-and-themes/common-units/#size)-row-Table | $fontSize-sm | $fontSize-sm |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-heading-Table | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-row-Table | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-heading-Table--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](../styles-and-themes/common-units/#size)-heading-Table--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle](../styles-and-themes/common-units/#border)-heading-Table--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](../styles-and-themes/common-units/#size)-heading-Table--focus | $outlineWidth--focus | $outlineWidth--focus |
| [padding](../styles-and-themes/common-units/#size)-cell-Table | $space-2 $space-1 $space-2 $space-2 | $space-2 $space-1 $space-2 $space-2 |
| [padding](../styles-and-themes/common-units/#size)-heading-Table | $space-2 $space-1 $space-2 $space-2 | $space-2 $space-1 $space-2 $space-2 |
| [paddingBottom](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-heading-Table | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-cell-first-Table | $space-5 | $space-5 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-cell-last-Table | $space-1 | $space-1 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-heading-Table | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-heading-Table | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-heading-Table | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-heading-Table | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-cell-Table | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-heading-Table | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-heading-Table | $color-surface-500 | $color-surface-500 |
| [textColor](../styles-and-themes/common-units/#color)-pagination-Table | $color-secondary | $color-secondary |
| [textColor](../styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-heading-Table | uppercase | uppercase |
