# Update UI optimistically

Use local reactive variables to reflect state changes instantly, then reconcile with the server when the API call finishes.

Users expect immediate feedback when they tap a like button or toggle a setting. Instead of waiting for the server round-trip, update local variables right away. Then refetch from the APICall's `onSuccess` event so the refresh cannot race ahead of the write. If the call fails, restore the previous local values.

```xmlui-pg copy display name="Click the Like button - immediate feedback"
---app display /favoriteOverrides/ /favoritesCountOverrides/ {6-58}
<App
  var.favoriteOverrides="{{}}"
  var.favoritesCountOverrides="{{}}"
  var.pendingFavorite="{null}"
>
  <APICall
    id="favoritePost"
    method="post"
    url="/api/posts/{$param}/favorite"
    invalidates="{[]}"
    onSuccess="finishFavorite()"
    onError="rollbackFavorite()"
    inProgressNotificationMessage="Favoriting post..."
    completedNotificationMessage="Post favorited!" />
  <APICall
    id="unfavoritePost"
    method="post"
    url="/api/posts/{$param}/unfavorite"
    invalidates="{[]}"
    onSuccess="finishFavorite()"
    onError="rollbackFavorite()"
    inProgressNotificationMessage="Unfavoriting post..."
    completedNotificationMessage="Post unfavorited!" />
  <DataSource
    id="timelineData"
    url="/api/timeline"
    method="GET" />
  <script>
    function getFavorited(post) {
      return favoriteOverrides[post.id] !== undefined
        ? favoriteOverrides[post.id]
        : post.favourited;
    }

    function getFavoritesCount(post) {
      return favoritesCountOverrides[post.id] !== undefined
        ? favoritesCountOverrides[post.id]
        : (post.favourites_count || 0);
    }

    function toggleFavorite(post) {
      const previousFavorited = getFavorited(post);
      const previousCount = getFavoritesCount(post);
      const nextFavorited = !previousFavorited;

      pendingFavorite = {
        id: post.id,
        favorited: previousFavorited,
        count: previousCount
      };
      favoriteOverrides = {
        ...favoriteOverrides,
        [post.id]: nextFavorited
      };
      favoritesCountOverrides = {
        ...favoritesCountOverrides,
        [post.id]: nextFavorited
          ? previousCount + 1
          : Math.max(0, previousCount - 1)
      };

      if (previousFavorited) {
        unfavoritePost.execute(post.id);
      } else {
        favoritePost.execute(post.id);
      }
    }

    function finishFavorite() {
      pendingFavorite = null;
      timelineData.refetch();
    }

    function rollbackFavorite() {
      if (!pendingFavorite) return;
      favoriteOverrides = {
        ...favoriteOverrides,
        [pendingFavorite.id]: pendingFavorite.favorited
      };
      favoritesCountOverrides = {
        ...favoritesCountOverrides,
        [pendingFavorite.id]: pendingFavorite.count
      };
      pendingFavorite = null;
      toast.error('Could not save that change.');
    }
  </script>
  <VStack>
    <Items data="{timelineData}">
      <Card>
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
                themeColor="{getFavorited($item) ? 'attention' : 'secondary'}"
                onClick="toggleFavorite($item)" />
              <Text variant="caption">{getFavoritesCount($item)}</Text>
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
  "initialize": "$state.posts = [{ id: '1', content: 'This is a great post about XMLUI!', author: 'John Developer', favourited: false, favourites_count: 5, replies_count: 2, reblogs_count: 1 }, { id: '2', content: 'Learning optimistic UI updates!', author: 'Jane Designer', favourited: true, favourites_count: 12, replies_count: 4, reblogs_count: 3 }, { id: '3', content: 'This write is set up to fail so you can see rollback.', author: 'Taylor QA', favourited: false, favourites_count: 7, replies_count: 0, reblogs_count: 0 }]",
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
      "handler": "delay(2000); if ($pathParams.id === '3') { throw 'Simulated write failure'; } const post = $state.posts.find(p => p.id === $pathParams.id); if (post) { post.favourited = true; post.favourites_count += 1; }"
    },
    "unfavorite-post": {
      "url": "/posts/:id/unfavorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "delay(2000); if ($pathParams.id === '3') { throw 'Simulated write failure'; } const post = $state.posts.find(p => p.id === $pathParams.id); if (post) { post.favourited = false; post.favourites_count -= 1; }"
    }
  }
}
```

The relationship between `onClick="{emitEvent('click')}"` in the `SocialButton` component and `onClick="toggleFavorite($item)"` in the main app demonstrates event propagation in XMLUI.

## Key points

**Local override maps provide instant feedback**: Declare `var.favoriteOverrides` and `var.favoritesCountOverrides` on the App. The helper updates the entries for the clicked post before waiting for the API call, so the UI re-renders immediately.

**Keep complex logic in a script helper**: The button's `onClick` only calls `toggleFavorite($item)`. The helper captures the previous values, applies the optimistic update, chooses the correct APICall, and handles success or failure without crowding the XMLUI markup.

**Refetch only after the write succeeds**: Use `onSuccess="finishFavorite()"` on the APICalls so `timelineData.refetch()` runs after the server mutation completes. Calling `execute()` and `refetch()` back-to-back can fetch stale data when the write is still in progress.

**Rollback restores the previous local values**: The APICall `onError` event runs `rollbackFavorite()`, which writes the saved values back into the override maps and shows an error toast. In the sample, Taylor QA's post deliberately fails after the two-second mock delay so you can see the rollback.

**Disable automatic invalidation when manually refetching**: Set `invalidates="{[]}"` on the APICalls. The sample performs one explicit `timelineData.refetch()` after success, so the APICall should not also trigger a broad cache invalidation.

**Component reuse through `emitEvent`**: `SocialButton` doesn't know what a click should do. It calls `emitEvent('click')` and the parent handles the business logic in an `onClick` event handler. Different instances of `SocialButton` can handle clicks differently.

---

## See also

- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) - the non-optimistic version of the same pattern
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) - declarative cache refresh
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) - handling failures when the optimistic assumption was wrong
