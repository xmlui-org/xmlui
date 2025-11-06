%-DESC-START

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

%-DESC-END

%-PROP-START data

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

%-PROP-END

%-PROP-START enableMultiRowSelection

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

%-PROP-END

%-PROP-START headerHeight

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

%-PROP-END

%-PROP-START hideHeader

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

%-PROP-END

%-PROP-START isPaginated

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

%-PROP-END

%-PROP-START loading

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

%-PROP-END

%-PROP-START noDataTemplate

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

%-PROP-END

%-PROP-START pageSizeOptions

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

%-PROP-END

%-PROP-START rowDisabledPredicate

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

%-PROP-END

%-PROP-START rowsSelectable

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

%-PROP-END

%-PROP-START checkboxTolerance

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

%-PROP-END

%-PROP-START singleSelectOnRowClick

The following sample turns on this property. Try how it works when you click on a row or directly to the selection checkbox.

```xmlui copy /singleSelectOnRowClick="true"/
<App>
  <Table 
    data='{[...]}' 
    rowsSelectable="true"
    singleSelectOnRowClick="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: singleSelectOnRowClick"
<App>
  <SelectionStore>
  <Table 
    data='{[
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
    singleSelectOnRowClick="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
  </SelectionStore>
</App>
```

%-PROP-END


%-PROP-START sortBy

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

%-PROP-END

%-PROP-START sortDirection

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

%-PROP-END

%-PROP-START iconSortAsc

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

%-PROP-END

%-PROP-START iconSortDesc

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

%-PROP-END

%-PROP-START iconNoSort

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

%-PROP-END

%-EVENT-START sortingDidChange

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

%-EVENT-END

%-EVENT-START willSort

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

%-EVENT-END

%-EVENT-START selectionDidChange

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

%-EVENT-END

%-API-START clearSelection

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

%-API-END

%-API-START getSelectedIds

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START getSelectedItems

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START selectAll

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START selectId

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-PROP-START idKey

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

%-PROP-END
