# Table [#table]

`Table` presents structured data for viewing, sorting, selection, and interaction.

**Key features:**
- **Data integration**: Load data from APIs via [DataSource](/docs/reference/components/DataSource) or use static arrays
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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `alwaysShowHeader` [#alwaysshowheader]

> [!DEF]  default: **false**

This property indicates whether the table header is always visible when scrolling and no height is specified. When set to `true`, the header is sticky and always visible on page scroll. Otherwise, it scrolls with the content and may not be visible when scrolled down.

### `alwaysShowPagination` [#alwaysshowpagination]

This property explicitly toggles pagination controls visibility. If set to `true`, controls are always shown even if there is only one page. If set to `false`, controls are hidden. If omitted, controls are hidden when there is only one page and shown otherwise. This property only has effect when pagination is enabled. It acts as an alias for showPaginationControls.

### `alwaysShowSelectionCheckboxes` [#alwaysshowselectioncheckboxes]

> [!DEF]  default: **false**

When set to `true`, selection checkboxes are always visible for all rows instead of appearing only on hover. Has no effect when `hideSelectionCheckboxes` is `true` or when row selection is disabled.

### `alwaysShowSelectionCheckboxesHeader` [#alwaysshowselectioncheckboxesheader]

> [!DEF]  default: **false**

This property indicates when the row selection header is displayed. When the value is `true,` the selection header is always visible. Otherwise, it is displayed only when hovered.

### `alwaysShowSortingIndicator` [#alwaysshowsortingindicator]

> [!DEF]  default: **false**

This property indicates whether the sorting indicator is always visible in the column headers. When set to `true`, the sorting indicator is always visible. Otherwise, it is visible only when the user hovers over/focuses the column header or the column is sorted.

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `buttonRowPosition` [#buttonrowposition]

> [!DEF]  default: **"center"**

Determines where to place the pagination button row in the layout. It works the same as the [Pagination component property](./Pagination#buttonrowposition).

Available values: `start`, `center` **(default)**, `end`

### `cellVerticalAlign` [#cellverticalalign]

> [!DEF]  default: **"center"**

This property controls the vertical alignment of cell content. It can be set to `top`, `center`, or `bottom`.

Available values: `top`, `center` **(default)**, `bottom`

### `checkboxTolerance` [#checkboxtolerance]

> [!DEF]  default: **"compact"**

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

### `enableMultiRowSelection` [#enablemultirowselection]

> [!DEF]  default: **true**

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

It accepts common [size values](/docs/styles-and-themes/common-units#size-values).

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

### `hideHeader` [#hideheader]

> [!DEF]  default: **false**

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

### `hideSelectionCheckboxes` [#hideselectioncheckboxes]

> [!DEF]  default: **false**

If true, hides selection checkboxes for both rows and header. Selection logic still works via API and keyboard.

Hides the selection checkboxes in both the header and rows while keeping the selection API and keyboard selection behavior intact. Useful when you want selection functionality without visible checkboxes.

The default value is `false`.

```xmlui copy /hideSelectionCheckboxes="true"/
<App>
  <Table data='{[...]}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxes="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: hideSelectionCheckboxes"
<App>
  <Table data='{[
    { id: 0, name: "Apples", quantity: 5, unit: "pieces" },
    { id: 1, name: "Bananas", quantity: 6, unit: "pieces" },
    { id: 2, name: "Carrots", quantity: 100, unit: "grams" },
    { id: 3, name: "Spinach", quantity: 1, unit: "bunch" }
  ]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    hideSelectionCheckboxes="true">
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

### `idKey` [#idkey]

> [!DEF]  default: **"id"**

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

### `isPaginated` [#ispaginated]

> [!DEF]  default: **false**

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

### `keyBindings` [#keybindings]

This property defines keyboard shortcuts for table actions. Provide an object with action names as keys and keyboard shortcut strings as values. The shortcut strings use Electron accelerator syntax (e.g., 'CmdOrCtrl+A', 'Delete'). Available actions: `selectAll`, `cut`, `copy`, `paste`, `delete`. If not provided, default shortcuts are used.

This property uses the following default key bindings:

```json
{ 
  "selectAll": "CmdOrCtrl+A", 
  "cut": "CmdOrCtrl+X", 
  "copy": "CmdOrCtrl+C", 
  "paste": "CmdOrCtrl+V", 
  "delete": "Delete"
}
```

You can use these accelerator key names:
- `CmdOrCtrl`: Command on macOS, Ctrl on Windows/Linux
- `Alt`: Alt/Options
- `Shift`: Shift
- `Super`: Command on macOS, Windows key on Windows/Linux
- `Ctrl`: Control key
- `Cmd`: Command key (macOS only)

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

### `noBottomBorder` [#nobottomborder]

> [!DEF]  default: **false**

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

### `paginationControlsLocation` [#paginationcontrolslocation]

> [!DEF]  default: **"bottom"**

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

### `showCurrentPage` [#showcurrentpage]

> [!DEF]  default: **true**

Whether to show the current page indicator. It works the same as the [Pagination component property](./Pagination#showcurrentpage).

### `showPageInfo` [#showpageinfo]

> [!DEF]  default: **true**

Whether to show page information. It works the same as the [Pagination component property](./Pagination#showpageinfo).

### `showPageSizeSelector` [#showpagesizeselector]

> [!DEF]  default: **true**

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

### `userSelectCell` [#userselectcell]

> [!DEF]  default: **"auto"**

This property controls whether users can select text within table cells. Use `text` to allow text selection, `none` to prevent selection, or `auto` for default behavior.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior **(default)** |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `userSelectHeading` [#userselectheading]

> [!DEF]  default: **"none"**

This property controls whether users can select text within table headings. Use `text` to allow text selection, `none` to prevent selection, or `auto` for default behavior.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected **(default)** |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `userSelectRow` [#userselectrow]

> [!DEF]  default: **"auto"**

This property controls whether users can select text within table rows. Use `text` to allow text selection, `none` to prevent selection, or `auto` for default behavior.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior **(default)** |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Table is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `copyAction` [#copyaction]

This event is triggered when the user presses the copy keyboard shortcut (default: Ctrl+C/Cmd+C) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. The handler should implement the copy logic (e.g., using the Clipboard API to copy selected data).

**Signature**: `copy(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `cutAction` [#cutaction]

This event is triggered when the user presses the cut keyboard shortcut (default: Ctrl+X/Cmd+X) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. Note: The component does not automatically modify data; the handler must implement the cut logic (e.g., copying data to clipboard and removing from the data source).

**Signature**: `cut(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `deleteAction` [#deleteaction]

This event is triggered when the user presses the delete keyboard shortcut (default: Delete key) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. Note: The component does not automatically remove data; the handler must implement the delete logic (e.g., removing selected items from the data source).

**Signature**: `delete(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `pasteAction` [#pasteaction]

This event is triggered when the user presses the paste keyboard shortcut (default: Ctrl+V/Cmd+V) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. The handler must implement the paste logic (e.g., reading from clipboard and inserting data into the table).

**Signature**: `paste(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `rowDoubleClick` [#rowdoubleclick]

This event is fired when the user double-clicks a table row. The handler receives the clicked row item as its only argument.

**Signature**: `rowDoubleClick(item: any): void`

- `item`: The clicked table row item.

This event is triggered when a table row is double-clicked. The handler receives the row's data item as its only argument.

```xmlui copy {4}
<App>
  <Table data='{[...]}' onRowDoubleClick="(item) => console.log(item)">
    <Column bindTo="name"/>

%-EVENT-START rowDoubleClick

This event is triggered when a table row is double-clicked. The handler receives the row's data item as its only argument.

```xmlui copy {4}
<App>
  <Table data='{[...]}' onRowDoubleClick="(item) => console.log(item)">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

### `selectAllAction` [#selectallaction]

This event is triggered when the user presses the select all keyboard shortcut (default: Ctrl+A/Cmd+A) and `rowsSelectable` is set to `true`. The component automatically selects all rows before invoking this handler. The handler receives three parameters: the currently focused row (if any), all selected items, and all selected IDs.

**Signature**: `selectAll(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused. Contains item data, row index, row ID, and selection state.
- `selectedItems`: Array of all selected row items. When selectAll is triggered, this contains all table rows.
- `selectedIds`: Array of all selected row IDs (as strings). When selectAll is triggered, this contains all row IDs.

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

Note the [`canSort`](/docs/reference/components/Column#cansort-default-true) properties on the `Column` components which enable custom ordering.

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-heading-Table | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-heading-Table--active | $color-surface-300 | $color-surface-300 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-heading-Table--hover | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-pagination-Table | $backgroundColor-Table | $backgroundColor-Table |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-row-Table | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-row-Table--hover | $color-primary-50 | $color-primary-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-selected-Table | $color-primary-100 | $color-primary-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-selected-Table--hover | $backgroundColor-row-Table--hover | $backgroundColor-row-Table--hover |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-cell-Table | 1px solid $borderColor | 1px solid $borderColor |
| [border](/docs/styles-and-themes/common-units/#border)-Table | 0px solid transparent | 0px solid transparent |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-last-row-Table | $borderBottom-cell-Table | $borderBottom-cell-Table |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table | $borderRadius | $borderRadius |
| [borderRight](/docs/styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-cell-Table | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-cell-Table | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Table | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-cell-Table | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-cell-Table | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Table | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Table | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-heading-Table | $fontSize-tiny | $fontSize-tiny |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-row-Table | $fontSize-sm | $fontSize-sm |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-heading-Table | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-row-Table | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-heading-Table--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-heading-Table--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-heading-Table--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-heading-Table--focus | $outlineWidth--focus | $outlineWidth--focus |
| [padding](/docs/styles-and-themes/common-units/#size-values)-cell-Table | $space-2 $space-1 $space-2 $space-2 | $space-2 $space-1 $space-2 $space-2 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-heading-Table | $space-2 $space-1 $space-2 $space-2 | $space-2 $space-1 $space-2 $space-2 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-heading-Table | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-cell-first-Table | $space-5 | $space-5 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-cell-last-Table | $space-1 | $space-1 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-heading-Table | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-heading-Table | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-heading-Table | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-heading-Table | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-cell-Table | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-heading-Table | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-heading-Table | $color-surface-500 | $color-surface-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-pagination-Table | $color-secondary | $color-secondary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Table | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-heading-Table | uppercase | uppercase |
| userSelect-cell-Table | none | none |
| userSelect-heading-Table | text | text |
| userSelect-row-Table | none | none |
