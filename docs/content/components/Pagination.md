# Pagination [#pagination]

`Pagination` enables navigation through large datasets by dividing content into pages. It provides controls for page navigation and can display current page information.

## Standalone [#standalone]

If the `itemCount` property is provided, the component shows information about the number of entries shown per page, the total number of entries, as well as the current page index:

```xmlui-pg copy display
<App>
  <Pagination itemCount="100" pageSize="10" />
</App>
```

If not, the [`hasPrevPage`](#hasprevpage) and [`hasNextPage`](#hasnextpage) properties can be used to control the enabled/disabled state of the previous and next buttons, while only the previous and next buttons are displayed:

```xmlui-pg copy display
<App>
  <Pagination hasPrevPage="true" hasNextPage="true" />
</App>
```

## Integrations [#integrations]

### Table [#table]

`Pagination` has first-class support in the Table component. `Pagination` is controlled via the [`isPaginated`](./Table#ispaginated-default-false), [`pageSize`](./Table#pagesize), [`pageSizeOptions`](./Table#pagesizeoptions) and [`paginationControlsLocation`](./Table#paginationcontrolslocation-default-bottom) properties.

```xmlui
<Table data="/api" isPaginated pageSize="5" pageSizeOptions="{[5, 10, 20]}">
  <Column header="ID" bindTo="elem" width="80px">
    <!-- ... -->
  </Column>
  <!-- ... -->
</Table>
```

See the [Table reference](./Table#ispaginated-default-false) for a working example.

### List [#list]

The `List` is a perfect example of a component that does not implement its own pagination. Thus, use the Pagination with a Datasource component and connect them to the List:

```xmlui
<DataSource id="ds" url="/api" queryParams="{{ from: before, to: after }}" />
<Pagination
  itemCount="20"
  pageSize="{pageSize}"
  pageIndex="{currentPage}"
  onPageDidChange="(page, size, total) => {
    currentPage = page;
    before = page * size;
    after = before + size - 1;
  }"
/>
<List data="{ds}" />
```

For a comprehensive example, see [How to paginate a List](../howto/paginate-a-list).

## Properties [#properties]

### `buttonRowPosition` (default: "center") [#buttonrowposition-default-center]

Determines where to place the pagination button row in the layout.

Available values: `start`, `center` **(default)**, `end`

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `hasNextPage` [#hasnextpage]

Whether to disable the next page button. Only takes effect if itemCount is not provided.

### `hasPrevPage` [#hasprevpage]

Whether to disable the previous page button. Only takes effect if itemCount is not provided.

### `itemCount` [#itemcount]

Total number of items to paginate. If not provided, the component renders simplified pagination controls that are enabled/disabled using the `hasPrevPage` and `hasNextPage` props.

### `maxVisiblePages` (default: 1) [#maxvisiblepages-default-1]

Maximum number of page buttons to display

### `orientation` [#orientation]

Layout orientation of the pagination component

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally |
| `vertical` | The component will fill the available space vertically |

### `pageIndex` (default: 0) [#pageindex-default-0]

Current page index (0-based)

### `pageInfoPosition` [#pageinfoposition]

Determines where to place the page information in the layout.

### `pageSize` (default: 10) [#pagesize-default-10]

Number of items per page

### `pageSizeOptions` [#pagesizeoptions]

Array of page sizes the user can select from. If provided, shows a page size selector dropdown

### `pageSizeSelectorPosition` [#pagesizeselectorposition]

Determines where to place the page size selector in the layout.

### `showCurrentPage` (default: true) [#showcurrentpage-default-true]

Whether to show the current page indicator

### `showPageInfo` (default: true) [#showpageinfo-default-true]

Whether to show page information

### `showPageSizeSelector` (default: true) [#showpagesizeselector-default-true]

Whether to show the page size selector

## Events [#events]

### `pageDidChange` [#pagedidchange]

Fired when the current page changes

### `pageSizeDidChange` [#pagesizedidchange]

Fired when the page size changes

## Exposed Methods [#exposed-methods]

### `currentPage` [#currentpage]

Gets the current page number (1-based)

### `currentPageSize` [#currentpagesize]

Gets the current page size

### `moveFirst` [#movefirst]

Moves to the first page

**Signature**: `moveFirst(): void`

### `moveLast` [#movelast]

Moves to the last page

**Signature**: `moveLast(): void`

### `moveNext` [#movenext]

Moves to the next page

**Signature**: `moveNext(): void`

### `movePrev` [#moveprev]

Moves to the previous page

**Signature**: `movePrev(): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Pagination | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-selector-Pagination | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-Pagination | $color-gray-300 | $color-gray-300 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-selector-Pagination | $borderRadius | $borderRadius |
| [gap](../styles-and-themes/common-units/#size)-buttonRow-Pagination | $space-2 | $space-2 |
| [padding](../styles-and-themes/common-units/#size)-Pagination | $space-4 | $space-4 |
| [textColor](../styles-and-themes/common-units/#color)-Pagination | $color-gray-600 | $color-gray-600 |
| [textColor](../styles-and-themes/common-units/#color)-selector-Pagination | $color-gray-600 | $color-gray-600 |
