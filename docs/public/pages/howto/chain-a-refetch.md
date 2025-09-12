# Chain a DataSource refetch from an APICall.execute

`APICall.execute` returns a Promise, you can call `.then` to do something else.

```xmlui-pg copy display {54} name="Click the Like button"
---app display
<App>
  <APICall
    id="favoritePost"
    method="post"
    url="/api/posts/{$param}/favorite" />
  <APICall
    id="unfavoritePost"
    method="post"
    url="/api/posts/{$param}/unfavorite" />
  <DataSource
    id="timelineData"
    url="/api/timeline"
    method="GET" />
  <VStack gap="$space-4" padding="$space-4">
    <Text variant="h3">Social Media Timeline</Text>
    <Items data="{timelineData}">
      <Card padding="$space-3" marginBottom="$space-2">
        <VStack gap="$space-2">
          <Text variant="h6">{$item.author}</Text>
          <Text>{$item.content}</Text>
          <HStack gap="$space-4" verticalAlignment="center">
            <HStack gap="$space-1" verticalAlignment="center">
              <CHStack
                border="1px solid $color-surface-300"
                borderRadius="50%"
                width="1.4rem"
                height="1.4rem"
                backgroundColor="transparent">
                <Icon name="reply" size="sm" color="$color-surface-500" />
              </CHStack>
              <Text variant="caption">{$item.replies_count}</Text>
            </HStack>
            <HStack gap="$space-1" verticalAlignment="center">
              <CHStack
                border="1px solid $color-surface-300"
                borderRadius="50%"
                width="1.4rem"
                height="1.4rem"
                backgroundColor="transparent">
                <Icon name="trending-up" size="sm" color="$color-surface-500" />
              </CHStack>
              <Text variant="caption">{$item.reblogs_count}</Text>
            </HStack>
            <HStack gap="$space-1" verticalAlignment="center">
              <CHStack
                border="1px solid $color-surface-300"
                borderRadius="50%"
                width="1.4rem"
                height="1.4rem"
                backgroundColor="transparent">
                <Icon
                  name="like"
                  size="sm"
                  color="{$item.favourited ? '$color-attention' : '$color-surface-500'}"
                  onClick="{
                    if ($item.favourited) {
                      // execute returns a Promise
                      unfavoritePost.execute($item.id).then(() => timelineData.refetch());
                    } else {
                      favoritePost.execute($item.id).then(() => timelineData.refetch());
                    }
                  }" />
              </CHStack>
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
      content: 'Learning how to chain API calls is so useful.',
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

