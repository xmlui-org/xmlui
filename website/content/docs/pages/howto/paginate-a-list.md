# Paginate a List

XMLUI provides a `Pagination` component that can be used to display visual controls for the pagination feature, no matter whether it is handled inside or outside of a layout component requiring that feature.

The [`Table`](/docs/reference/components/Table) component provides out-of-the-box support for pagination,
so you can access pagination options via the following properties: `isPaginated`, `pageSize`, `pageSizeOptions`, `paginationControlsLocation`.

```xmlui noHeader copy
<Table
  data="/api/endpoint"
  isPaginated
  pageSize="10"
  pageSizeOptions="{[5, 10, 20, 30]}"
  paginationControlsLocation="both"
>
    ...
</Table>
```

Other components, such as the `List`, can be hooked up with pagination using a `DataSource` combined with the `Pagination` component. This pattern works as a more generic solution where either the component does not have pagination implemented in the component itself, or you wish to use custom pagination logic.

In this case the `DataSource` component does the heavy lifting by querying the page index, the previous and next page IDs. This can be done using variables and query parameters.

```xmlui-pg name="Paginate a list" height="560px"
---app display
<App 
  var.pageSize="{5}" 
  var.currentPage="{0}" 
  var.before="{0}" 
  var.after="{pageSize-1}"
>
  <DataSource 
    id="pagination_ds" 
    url="/api/pagination_items" 
    queryParams="{{ from: before, to: after }}" 
  />
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
  <List data="{pagination_ds}" />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.pagination_items = [{ id: 1, name: 'Laptop Pro', price: 1299 },{ id: 2, name: 'Wireless Mouse', price: 29 },{ id: 3, name: 'Mechanical Keyboard', price: 149 },{ id: 4, name: '4K Monitor', price: 399 },{ id: 5, name: 'USB-C Hub', price: 79 },{ id: 6, name: 'Bluetooth Headphones', price: 199 },{ id: 7, name: 'Webcam HD', price: 89 },{ id: 8, name: 'Standing Desk', price: 299 },{ id: 9, name: 'Ergonomic Chair', price: 249 },{ id: 10, name: 'Desk Lamp', price: 45 },{ id: 11, name: 'Cable Organizer', price: 15 },{ id: 12, name: 'Mouse Pad', price: 12 },{ id: 13, name: 'Laptop Stand', price: 35 },{ id: 14, name: 'External SSD', price: 129 },{ id: 15, name: 'Wireless Charger', price: 59 },{ id: 16, name: 'Smart Speaker', price: 99 },{ id: 17, name: 'Fitness Tracker', price: 199 },{ id: 18, name: 'Tablet Pro', price: 799 },{ id: 19, name: 'Gaming Mouse', price: 89 },{ id: 20, name: 'Noise Cancelling Headphones', price: 349 }]",
  "operations": {
    "get-pagination-items": {
      "url": "/pagination_items",
      "method": "get",
      "queryParams": {
        "from": "integer",
        "to": "integer"
      },
      "handler": "$state.pagination_items.slice(Number($queryParams.from), Number($queryParams.to) + 1);"
    }
  }
}
```

## Key points

**`Table` has pagination built in — `List` needs it wired manually**: Set `isPaginated` on `Table` and it handles page state internally. For `List` (or any component without built-in pagination), combine a `DataSource` with a `Pagination` component and wire them together through reactive variables.

**`Pagination` tells you the new page; you update the variables**: The `onPageDidChange` handler receives `(page, size, total)`. Assign the new page index to `currentPage` and recalculate `before` and `after` offsets — both reactive variables are read by `DataSource`'s `queryParams`, so the data refetch happens automatically.

**`queryParams` on `DataSource` drives the API slice**: Pass the offset or cursor values as query parameters using `queryParams="{{ from: before, to: after }}"`. The server-side handler uses these to return only the requested page of data. The API shape (offset/limit, cursor, page number) depends on your backend — adjust the variable names and arithmetic accordingly.

**`itemCount` on `Pagination` must match the total record count from your API**: The component uses this number to calculate how many page buttons to show. If your API returns the total count in the response, read it with `resultSelector` or a separate `DataSource` and bind it to `itemCount`.

**`pageSize` controls both the visual controls and the slice math**: Declare it as a reactive variable (`var.pageSize="{5}"`) so that if the user changes the page size through `Pagination`'s size selector, the same value flows into the offset recalculation in `onPageDidChange` and into the `DataSource` query automatically.

---

## See also

- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — customize how each row in the paginated list is displayed
- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) — combine grouping with a paginated data source
- [Poll an API at regular intervals](/docs/howto/poll-an-api-at-regular-intervals) — keep the current page fresh with periodic refetches
