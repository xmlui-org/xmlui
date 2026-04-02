# Update UI optimistically

Use local reactive variables to reflect state changes instantly while the API call runs in the background.

Users expect immediate feedback when they tap a like button or toggle a setting. Instead of waiting for the server round-trip, update a local variable right away and fire the API call in parallel. If the call fails, you can roll back — but in the common success case the UI feels instant.

```xmlui-pg copy display name="Click the Like button - immediate feedback"
---app display /localFavorited/ /localFavoritesCount/ {37-59}
<App>
  <APICall
    id="favoritePost"
    method="post"
    url="/api/posts/{$param}/favorite"
    inProgressNotificationMessage="Favoriting post..."
    completedNotificationMessage="Post favorited!" />
  <APICall
    id="unfavoritePost"
    method="post"
    url="/api/posts/{$param}/unfavorite"
    inProgressNotificationMessage="Unfavoriting post..."
    completedNotificationMessage="Post unfavorited!" />
  <DataSource
    id="timelineData"
    url="/api/timeline"
    method="GET" />
  <VStack>
    <Items data="{timelineData}">
      <Card var.localFavorited="{null}" var.localFavoritesCount="{null}">
        <VStack>
          <Text>{$item.author}</Text>
          <Text>{$item.content}</Text>
          <HStack verticalAlignment="center">
            <HStack verticalAlignment="center">
              <SocialButton icon="reply" />
              <Text variant="caption">{$item.replies_count}</Text>
            </HStack>
            <HStack verticalAlignment="center">
              <SocialButton icon="trending-up" />
              <Text variant="caption">{$item.reblogs_count}</Text>
            </HStack>
            <HStack verticalAlignment="center">
              <SocialButton
                icon="like"
                themeColor="{(localFavorited !== null 
                  ? localFavorited : $item.favourited) 
                    ? 'attention' : 'secondary'}"
                onClick="
                  // Get current state (local takes precedence)
                  const currentFavorited = localFavorited !== null 
                    ? localFavorited 
                    : $item.favourited;
                  const currentCount = localFavoritesCount !== null 
                    ? localFavoritesCount 
                    : ($item.favourites_count || 0);
                  // Update UI optimistically
                  localFavorited = !currentFavorited;
                  localFavoritesCount = currentFavorited ?
                    Math.max(0, currentCount - 1) :
                    currentCount + 1;
                  // Make API call
                  if (currentFavorited) {
                    unfavoritePost.execute($item.id);
                    timelineData.refetch();
                  } else {
                    favoritePost.execute($item.id);
                    timelineData.refetch();
                  }
                ">
              </SocialButton>
              <Text variant="caption">
                {localFavoritesCount !== null 
                  ? localFavoritesCount : ($item.favourites_count || 0)}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </Items>
  </VStack>
</App>
---comp display {8}
<Component name="SocialButton">
  <Button
    borderRadius="50%"
    icon="{$props.icon}"
    variant="outlined"
    themeColor="{$props.themeColor || 'secondary'}"
    size="xs"
    onClick="{emitEvent('click')}" />
</Component>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.posts = [
    {
      id: '1',
      content: 'This is a great post about XMLUI!',
      author: 'John Developer',
      favourited: false,
      favourites_count: 5,
      replies_count: 2,
      reblogs_count: 1
    },
    {
      id: '2',
      content: 'Learning optimistic UI updates!',
      author: 'Jane Designer',
      favourited: true,
      favourites_count: 12,
      replies_count: 4,
      reblogs_count: 3
    }
  ]",
  "operations": {
    "get-timeline": {
      "url": "/timeline",
      "method": "get",
      "handler": "return $state.posts"
    },
    "favorite-post": {
      "url": "/posts/:id/favorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "
        delay(2000);
        const post = $state.posts.find(p => p.id === $pathParams.id);
        if (post) {
          post.favourited = true;
          post.favourites_count += 1;
        }
      "
    },
    "unfavorite-post": {
      "url": "/posts/:id/unfavorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "
        delay(2000);
        const post = $state.posts.find(p => p.id === $pathParams.id);
        if (post) {
          post.favourited = false;
          post.favourites_count -= 1;
        }
      "
    }
  }
}
```

The relationship between `onClick="{emitEvent('click')}"` in the `SocialButton` component and the `<event name="click">` handler in the main app demonstrates event propagation in XMLUI.

## Key points

**Local variables provide instant feedback**: Declare `var.localFavorited` and `var.localFavoritesCount` on the Card. Update them synchronously before firing the API call. The UI re-renders immediately because these are reactive variables.

**`null` signals "use the server value"**: Initialize both locals to `null`. The ternary `localFavorited !== null ? localFavorited : $item.favourited` falls back to the data-source value until the user interacts. After the `timelineData.refetch()` completes, the server data catches up and the local override is no longer needed.

**The API call runs in the background**: `execute()` returns a Promise. The UI has already updated before the server responds. Chain `timelineData.refetch()` to pull the authoritative state back from the server.

**Component reuse through `emitEvent`**: `SocialButton` doesn't know what a click should do. It calls `emitEvent('click')` and the parent handles the business logic in an `onClick` event handler. Different instances of `SocialButton` can handle clicks differently.

---

## See also

- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — the non-optimistic version of the same pattern
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — declarative cache refresh
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handling failures when the optimistic assumption was wrong
