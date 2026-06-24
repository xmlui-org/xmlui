`Pagination` renders controls for moving through pages of data.

```xmlui-pg copy display name="Example: using Pagination"
<App var.page="{0}" var.size="{10}">
  <Pagination
    itemCount="{95}"
    pageIndex="{page}"
    pageSize="{size}"
    pageSizeOptions="{[10, 25, 50]}"
    onPageDidChange="pageIndex => page = pageIndex"
    onPageSizeDidChange="pageSize => size = pageSize" />
  <Text>Page: {page + 1}, size: {size}</Text>
</App>
```

This rewrite slice provides the component-owned pagination foundation. Full old-suite closure is still pending.
