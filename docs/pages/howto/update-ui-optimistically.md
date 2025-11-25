# Update UI optimistically

For immediate user feedback, use reactive variables like `localFavorited` and `localFavoritesCount` to update UI state instantly while API calls run in the background.

```xmlui-pg copy display name="Click the Like button - immediate feedback"
---app display /localFavorited/ /localFavoritesCount/ {37-52}
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
  <VStack gap="$space-4" padding="$space-4">
    <Items data="{timelineData}">
      <Card var.localFavorited="{null}" var.localFavoritesCount="{null}">
        <VStack>
          <Text>{$item.author}</Text>
          <Text>{$item.content}</Text>
          <HStack gap="$space-4" verticalAlignment="center">
            <HStack gap="$space-1" verticalAlignment="center">
              <SocialButton icon="reply" />
              <Text variant="caption">{$item.replies_count}</Text>
            </HStack>
            <HStack gap="$space-1" verticalAlignment="center">
              <SocialButton icon="trending-up" />
              <Text variant="caption">{$item.reblogs_count}</Text>
            </HStack>
            <HStack gap="$space-1" verticalAlignment="center">
              <SocialButton
                icon="like"
                themeColor="{(localFavorited !== null ? localFavorited : $item.favourited) ? 'attention' : 'secondary'}">
                <event name="click">
                  // Get current state (local takes precedence)
                  const currentFavorited = localFavorited !== null ? localFavorited : $item.favourited;
                  const currentCount = localFavoritesCount !== null ? localFavoritesCount : ($item.favourites_count || 0);
                  // Update UI optimistically
                  localFavorited = !currentFavorited;
                  localFavoritesCount = currentFavorited ?
                    Math.max(0, currentCount - 1) :
                    currentCount + 1;
                  // Make API call
                  if (currentFavorited) {
                    unfavoritePost.execute($item.id).then(() => timelineData.refetch());
                  } else {
                    favoritePost.execute($item.id).then(() => timelineData.refetch());
                  }
                </event>
              </SocialButton>
              <Text variant="caption">
                {localFavoritesCount !== null ? localFavoritesCount : ($item.favourites_count || 0)}
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

The parent component catches the emitted click event and implements the optimistic UI update. This separation allows for:

- Component reuse. `SocialButton` can be used anywhere without knowing what action the click should perform.
- Flexible event handling. Different instances of `SocialButton` can handle clicks differently.
