# Chain a DataSource refetch

Use `APICall`'s `onSuccess` event to trigger a DataSource refetch after a mutation completes.

When a user action changes server data — liking a post, adding a comment — the displayed list needs to reflect the change. Put `dataSource.refetch()` in the mutation's `onSuccess` handler so the refresh happens only after the write succeeds — without relying on blanket cache invalidation.

```xmlui-pg copy display name="Click the Like button"
---comp display
<Component name="SocialButton">
  <Button
    borderRadius="50%"
    icon="{$props.icon}"
    variant="outlined"
    themeColor="{$props.themeColor || 'secondary'}"
    size="xs"
    onClick="emitEvent('click')" />
</Component>
---app display {46}
<App>
  <APICall
    id="favoritePost"
    method="post"
    url="/api/posts/{$param}/favorite"
    invalidates="{[]}"
    onSuccess="timelineData.refetch()" />
  <APICall
    id="unfavoritePost"
    method="post"
    url="/api/posts/{$param}/unfavorite"
    invalidates="{[]}"
    onSuccess="timelineData.refetch()" />
  <DataSource
    id="timelineData"
    url="/api/timeline"
    method="GET" />
  <script>
    function toggleFavorite(post) {
      if (post.favourited) {
        unfavoritePost.execute(post.id);
      } else {
        favoritePost.execute(post.id);
      }
    }
  </script>
  <VStack>
    <H3>Social Media Timeline</H3>
    <Items data="{timelineData}">
      <Card>
        <VStack>
          <H4>{$item.author}</H4>
          <Text>{$item.content}</Text>
          <HStack verticalAlignment="center">
            <HStack verticalAlignment="center">
              <SocialButton icon="reply" />
              <Text>{$item.replies_count}</Text>
            </HStack>
            <HStack verticalAlignment="center">
              <SocialButton icon="trending-up" />
              <Text>{$item.reblogs_count}</Text>
            </HStack>
            <HStack verticalAlignment="center">
              <SocialButton
                icon='like'
                onClick="toggleFavorite($item)"
                themeColor="{$item.favourited ? 'attention' : 'secondary'}" />
              <Text variant="caption">{$item.favourites_count}</Text>
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </Items>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.posts = [{ id: '1', content: 'This is a great post about XMLUI!', author: 'John Developer', favourited: false, favourites_count: 5, replies_count: 2, reblogs_count: 1 }, { id: '2', content: 'Learning how to chain API calls is so useful.', author: 'Jane Designer', favourited: true, favourites_count: 12, replies_count: 4, reblogs_count: 3 }]",
  "operations": {
    "get-timeline": {
      "url": "/timeline",
      "method": "get",
      "handler": "return $state.posts.map(post => ({ ...post }))"
    },
    "favorite-post": {
      "url": "/posts/:id/favorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "const post = $state.posts.find(p => p.id === $pathParams.id); if (post) { post.favourited = true; post.favourites_count += 1; }"
    },
    "unfavorite-post": {
      "url": "/posts/:id/unfavorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "const post = $state.posts.find(p => p.id === $pathParams.id); if (post) { post.favourited = false; post.favourites_count -= 1; }"
    }
  }
}
```

## Key points

**`onSuccess` runs after the backend responds**: put follow-up work there when it must happen after a successful API call, such as refetching a DataSource, showing a toast, or navigating to another page.

**`refetch()` re-issues the DataSource's request**: Calling `timelineData.refetch()` re-sends the original query and updates every element bound to that DataSource when the fresh data arrives.

**This pattern gives you surgical control**: Unlike blanket cache invalidation (which refreshes every DataSource), `ds.refetch()` refreshes only the specific DataSource you choose.

**Combine with `invalidates="{[]}"` to prevent double-fetching**: By default a successful APICall invalidates all caches. If you manually refetch, set `invalidates="{[]}"` on the APICall to avoid a redundant second fetch.

---

## See also

- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — declarative cache control with the `invalidates` prop
- [Update UI optimistically](/docs/howto/update-ui-optimistically) — instant feedback before the server responds
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handling failures and retrying
