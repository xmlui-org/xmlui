```xmlui-pg
---app
<App>
  <CascadeDemo />
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
      "handler": "console.log('Timeline DataSource API called at:', Date.now()); return $state.posts"
    },
    "get_post_1": {
      "url": "/posts/1",
      "method": "get",
      "handler": "console.log('DataSource 1 API called at:', Date.now()); return { id: 1, title: 'Post 1', body: 'Content for post 1' }"
    },
    "get_post_2": {
      "url": "/posts/2",
      "method": "get",
      "handler": "console.log('DataSource 2 API called at:', Date.now()); return { id: 2, title: 'Post 2', body: 'Content for post 2' }"
    },
    "get_post_3": {
      "url": "/posts/3",
      "method": "get",
      "handler": "console.log('DataSource 3 API called at:', Date.now()); return { id: 3, title: 'Post 3', body: 'Content for post 3' }"
    },
    "favorite-post": {
      "url": "/posts/:id/favorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "
        console.log('Favorite API called for post:', $pathParams.id);
        const post = $state.posts.find(p => p.id === $pathParams.id);
        if (post) {
          post.favourited = true;
          post.favourites_count += 1;
        }
        return { success: true };
      "
    },
    "unfavorite-post": {
      "url": "/posts/:id/unfavorite",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "
        console.log('Unfavorite API called for post:', $pathParams.id);
        const post = $state.posts.find(p => p.id === $pathParams.id);
        if (post) {
          post.favourited = false;
          post.favourites_count -= 1;
        }
        return { success: true };
      "
    }
  }
}
---comp display
<Component name="CascadeDemo" var.localState="{null}">

  <!-- Timeline DataSource that loads posts (like mastodon) -->
  <DataSource id="timelineData" url="/api/timeline">
    <event name="loaded">
      console.log('Timeline DataSource loaded/reloaded at:', Date.now());
    </event>
  </DataSource>

  <!-- APICalls for favoriting/unfavoriting posts -->
  <APICall id="favoritePost" method="post" url="/api/posts/{$param}/favorite" />
  <APICall id="unfavoritePost" method="post" url="/api/posts/{$param}/unfavorite" />

  <!-- Three independent DataSources that should NOT re-render when localState changes -->
  <DataSource id="dataSource1" url="/api/posts/1">
    <event name="loaded">
      console.log('DataSource 1 loaded/reloaded at:', Date.now());
    </event>
  </DataSource>
  <DataSource id="dataSource2" url="/api/posts/2">
    <event name="loaded">
      console.log('DataSource 2 loaded/reloaded at:', Date.now());
    </event>
  </DataSource>
  <DataSource id="dataSource3" url="/api/posts/3">
    <event name="loaded">
      console.log('DataSource 3 loaded/reloaded at:', Date.now());
    </event>
  </DataSource>

  <VStack gap="1rem" padding="2rem">
    <Text variant="h1">XMLUI Mastodon-like Reactivity Cascade Bug Demo</Text>

    <Text>
      This demonstrates the reactivity cascade issue where favoriting a post causes ALL DataSources to re-render and trigger fresh API calls, even when they have no dependency on the changed data.
    </Text>

    <!-- Timeline Display (like mastodon) -->
    <VStack>
      <Items data="{timelineData}">
        <Card>
            <Text>{$item.author}</Text>
            <Text>{$item.content}</Text>
            <Button
                  variant="outlined"
                  size="xs"
                  themeColor="{$item.favourited ? 'attention' : 'secondary'}">
                  <event name="click">
                    console.log('About to favorite/unfavorite post', $item.id, '- watch for DataSource re-renders...');

                    // Optimistic update - this should NOT cause unrelated DataSources to re-render
                    localState = 'favoriting_' + $item.id + '_' + Date.now();

                    if ($item.favourited) {
                      unfavoritePost.execute($item.id).then(() => {
                        console.log('Unfavorite completed - refetching timeline');
                        timelineData.refetch();
                      });
                    } else {
                      favoritePost.execute($item.id).then(() => {
                        console.log('Favorite completed - refetching timeline');
                        timelineData.refetch();
                      });
                    }
                  </event>
                  {($item.favourited ? 'Liked' : 'Like') + ' (' + $item.favourites_count + ')'}
                </Button>
        </Card>
      </Items>
    </VStack>

      <Text>
      <strong>Expected:</strong> Only timeline should refetch when favoriting, other DataSources should remain unchanged.<br/>
      <strong>Actual:</strong> All DataSources re-render and make fresh API calls when favoriting.<br/>
      <strong>Evidence:</strong> Check console for "DataSource API called" logs after favoriting a post.
    </Text>
  </VStack>
</Component>
```