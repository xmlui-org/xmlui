%-DESC-START

## Standalone

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

## Integrations

### Table

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

### List

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

For a comprehensive example, see [How to paginate a List](./paginate-a-list).

%-DESC-END
