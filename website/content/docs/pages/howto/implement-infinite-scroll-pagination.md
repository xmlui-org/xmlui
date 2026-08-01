# Implement infinite scroll pagination

Combine a paged `DataSource` (`nextPageSelector`) with `List`'s `pageInfo` and `onRequestFetchNextPage` so scrolling near the end of the list fetches and appends the next page automatically.

Infinite scroll replaces visible page controls with "load more as you go": the list grows as the user approaches its end, until the data runs out. In XMLUI this is a composition of two documented pieces — `DataSource` becomes pageable when `nextPageSelector` is set, and `List` requests the next page when the user scrolls close to the last row.

```xmlui-pg copy display name="Infinite scroll pagination" height="480px"
---app display
<App>
  <DataSource
    id="feed"
    url="/api/feed"
    queryParams="{{ after: $pageParams ? $pageParams.nextPageParam : 0, limit: 15 }}"
    nextPageSelector="{$response.length === 15 ? $response[$response.length - 1].id : null}"
  />
  <VStack gap="$space-2" padding="$space-4">
    <H3>Message feed</H3>
    <List
      data="{feed}"
      pageInfo="{feed.pageInfo}"
      onRequestFetchNextPage="feed.fetchNextPage()"
      height="300px">
      <Card>
        <Text variant="strong">{$item.author}</Text>
        <Text>{$item.text}</Text>
      </Card>
    </List>
    <Text when="{feed.pageInfo && feed.pageInfo.isFetchingNextPage}">
      Loading more…
    </Text>
    <Text when="{feed.pageInfo && !feed.pageInfo.hasNextPage}">
      You're all caught up — 57 of 57 messages loaded.
    </Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.messages = Array.from({length: 57}, (_, i) => ({ id: i + 1, author: 'User ' + ((i % 7) + 1), text: 'Message #' + (i + 1) }))",
  "operations": {
    "get-feed": {
      "url": "/feed",
      "method": "get",
      "queryParams": { "after": "integer", "limit": "integer" },
      "handler": "const after = Number($queryParams.after || 0); const limit = Number($queryParams.limit || 15); return $state.messages.filter(m => m.id > after).slice(0, limit);"
    }
  }
}
```

## Key points

**`nextPageSelector` makes the `DataSource` pageable**: it runs against each response (`$response`) and extracts the cursor for the next page — here the last item's `id`, or `null` when a short page signals the end. A `null`/`undefined` cursor is what turns `pageInfo.hasNextPage` off. The selector can be a simple property path (`nextCursor`) or a full binding expression as in this example.

**`$pageParams` carries the cursor into the next request**: the first request runs with `$pageParams` undefined; each subsequent page request re-evaluates `url`/`queryParams` with `$pageParams.nextPageParam` set to what `nextPageSelector` extracted. Adapt the arithmetic to your API's shape — cursor, offset, or page number all work.

**`List` drives the fetching**: setting `pageInfo` switches `List` into paged mode. When the user scrolls to within a few rows of the end, `List` fires `requestFetchNextPage` — guarded internally by `pageInfo.hasNextPage` and `pageInfo.isFetchingNextPage`, so it never double-fetches or requests past the end. The handler just calls the DataSource's `fetchNextPage()` method; fetched pages append to the existing rows.

**`pageInfo` also powers the status line**: `isFetchingNextPage` shows a loading indicator during a fetch, and `!hasNextPage` shows the end-of-data message. No manual bookkeeping variables are needed.

**Infinite scroll vs. `Pagination`**: the [Paginate a list](/docs/howto/paginate-a-list) pattern replaces the visible rows page by page under explicit user control; this pattern appends pages invisibly as a side effect of scrolling. Prefer visible pagination when users need to jump around or cite "page N"; prefer infinite scroll for feeds consumed linearly.

---

## See also

- [Paginate a list](/docs/howto/paginate-a-list) - visible page controls with `Pagination`
- [DataSource component reference](/docs/reference/components/DataSource) - `nextPageSelector`, `prevPageSelector`, and `$pageParams`
- [List component reference](/docs/reference/components/List) - `pageInfo` and scrolling behavior
