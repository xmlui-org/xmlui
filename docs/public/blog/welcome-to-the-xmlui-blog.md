In this inaugural post we'll explore the development of the blog engine we're using on this site. Our tagline is *Practical User Interfaces Built Simply*  and creating this blog couldn't have been simpler. The whole site, of which the blog is now a part, is an XMLUI app built with components including [NavPanel](/components/NavPanel), [NavLink](/components/NavLink), [Pages](/components/Pages), [Page](/components/Page), and [Markdown](/components/Markdown).

Let's see how it evolved.

## The simplest possible thing

We started with the simplest possible approach: post metadata and data as literal strings.

```xmlui-pg name="XMLUI blog v1"
---app
<App layout="vertical">
  <NavPanel>
    <NavGroup label="Blog">
      <NavLink label="Newest post" to="/newest-post" />
      <NavLink label="Older post" to="/older-post" />
    </NavGroup>
  </NavPanel>
    <Pages>
      <Page url="/newest-post">
        <BlogPage
          content="This is the latest post"
          title="Newest post"
          author="Jon Udell"
          date="2025-09-01" />
      </Page>
      <Page url="/older-post">
        <BlogPage
          content="This is an older post"
          title="Older post"
          author="Istvan Novak"
          date="2025-08-30" />
      </Page>
    </Pages>
</App>
---comp
<Component name="BlogPage">
  <VStack width="{$props.width ? $props.width : '85%'}">
    <VStack>
      <H1>{$props.title}</H1>
      <HStack gap="$space-2">
        <Text>{$props.date}</Text>
        <Text>-</Text>
        <Text>{$props.author}</Text>
      </HStack>
    </VStack>
    <Markdown content="{$props.content}" />
  </VStack>
</Component>
```

You can use it right here or you can click the ![](/resources/pg-popout.svg) icon to open a playground where you can make live changes.

This is a pretty good start! We can write posts, arrange them in reverse chronological order, and hey, it's the essence of a blog. Since it's a blog about XMLUI the live playground is a nice bonus that any XMLUI app might put to good use. The user interfaces that you build with XMLUI will require some explaining, it's handy to explain with working examples as well as images, text, and video.

Let's unpack how this works, there isn't much to it. The `App` declared in `Main.xmlui` sets up navigation.

```xmlui
<App>
  <NavPanel>
    <NavGroup label="Blog">
      <NavLink label="Newest post" to="/newest-post" />
      <NavLink label="Older post" to="/older-post" />
    </NavGroup>
  </NavPanel>
  <!-- Pages section... -->
</App>
```

Each Page contains a [user-defined component](https://docs.xmlui.org/user-defined-components) called `BlogPage`. In the prototype, the `BlogPage` component receives page content as `$props.content`.

```xmlui {4}
<Pages>
  <Page url="/newest-post">
    <BlogPage
      content="This is the latest post"
      title="Newest post"
      author="Jon Udell"
      date="2025-09-01" />
  </Page>
</Pages>
```

Here's how the prototype `BlogPage` assembles data and metadata to create a post.

```xmlui {4, 6, 8, 11}
<Component name="BlogPage">
  <VStack width="85%">
    <VStack>
      <H1>{$props.title}</H1>
      <HStack gap="$space-2">
        <Text>{$props.date}</Text>
        <Text> - </Text>
        <Text>{$props.author}</Text>
      </HStack>
    </VStack>
    <Markdown content="{$props.content}" />
  </VStack>
</Component>
```

## Use Markdown files

So far the post content exists only as the `content` property passed to the `BlogPage` component. For the real blog we'll want to manage it as a set of Markdown files. This version enables that.

```xmlui-pg name="XMLUI blog v2"
---app
<App
  layout="vertical"
  var.posts = `{[
    {
      title: "Welcome to the XMLUI blog!",
      slug: "welcome-to-the-xmlui-blog",
      author: "Jon Udell",
      date: "2025-09-01",
      image: "blog-page-component.png"
    },
    {
      title: "Lorem Ipsum!",
      slug: "lorem-ipsum",
      author: "H. Rackham",
      date: "1914-06-03",
      image: "lorem-ipsum.png"
    }
  ]}`
>
  <NavPanel>
    <NavGroup label="Blog">
      <NavLink label="Newest post" to="/blog/{posts[0].slug}" />
      <NavLink label="Older post" to="/blog/{posts[1].slug}" />
    </NavGroup>
  </NavPanel>
    <Pages>
      <Page url="/blog/{posts[0].slug}">
        <BlogPage post="{posts[0]}" />
      </Page>
      <Page url="/blog/{posts[1].slug}">
        <BlogPage post="{posts[1]}" />
      </Page>
    </Pages>
</App>
---comp
<Component name="BlogPage">
  <VStack width="{$props.width ? $props.width : '85%'}">
    <VStack>
      <H1>{$props.post.title}</H1>
      <HStack gap="$space-2">
        <Text>{$props.post.date}</Text>
        <Text> - </Text>
        <Text>{$props.post.author}</Text>
      </HStack>
    </VStack>
    <Markdown data="/blog/{$props.post.slug}.md" />
  </VStack>
</Component>
```

Now we write post metadata as an App-level variable, and create Markdown files corresponding to the slugs. In this case the files are `welcome-to-the-xmlui-blog.md` (this post) and `lorem-ipsum.png` (a dummy older post). We also add a hero image for each post.

```xmlui
<App
  layout="vertical"
  var.posts = `{[
    {
      title: "Welcome to the XMLUI blog!",
      slug: "welcome-to-the-xmlui-blog",
      author: "Jon Udell",
      date: "2025-09-01",
      image: "blog-page-component.png"
    },
    {
      title: "Lorem Ipsum!",
      slug: "lorem-ipsum",
      author: "H. Rackham",
      date: "1914-06-03",
      image: "lorem-ipsum.png"
    }
  ]}`
>
```

The blog's `NavGroup` now looks like this. We'll maintain reverse chronology by just writing the `NavLink`s in that order.

```xmlui
<NavGroup label="Blog">
  <NavLink label="{posts[0].title}" to="/blog/{posts[0].slug}" />
  <NavLink label="{posts[1].title}" to="/blog/{posts[1].slug}" />
</NavGroup>
```

The `NavLink` uses the post's slug to bind to its corresponding `Page`.

```xmlui
<Page url="/blog/{posts[0].slug}">
  <BlogPage post="{posts[0]}" />
</Page>
```

And the `Page` passes the complete post object to `BlogPage`. In v1 we used the `content` property of the `Markdown` component to pass a string. In v2 we use the `data` property to pass an URL constructed from the post slug.

```xmlui {11}
<Component name="BlogPage">
  <VStack width="{$props.width ? $props.width : '85%'}">
    <VStack>
      <H1>{$props.post.title}</H1>
      <HStack gap="$space-2">
        <Text>{$props.post.date}</Text>
        <Text> - </Text>
        <Text>{$props.post.author}</Text>
      </HStack>
    </VStack>
    <Markdown data="/blog/{$props.post.slug}.md" />
  </VStack>
</Component>
```

## Create the overview page

Although it's feasible to use a `NavGroup` to list the posts, a blog should really have an overview page. Let's add another user-defined component for that.

```xmlui
<Component name="BlogOverview">
  <Stack width="85%">
    <H1>XMLUI Blog</H1>
    <Text>Latest updates, tutorials, and insights for building with XMLUI</Text>
  </Stack>
    <List
      data="{$props.posts.sort((a, b) => new Date(b.date) - new Date(a.date))}">
      <VStack gap="$space-1" width="90%">
        <Link to="/blog/{$item.slug}">
          <Text>
            {$item.title}
          </Text>
        </Link>
        <Text>
          {$item.date} - {$item.author}
        </Text>
        <Link to="/blog/{$item.slug}">
          <Image src="/blog/images/{$item.image}" />
        </Link>
      </VStack>
    </List>
</Component>
```

The `NavGroup` now just becomes a `NavLink`.

```xmlui
<NavLink label="Blog" to="/blog" />
```

We refer to the overview in `Pages` along with the same `Page` used for the intro post.

```xmlui
<Page url="/blog">
    <BlogOverview posts="{posts}" />
</Page>
<Page url="/blog/{posts[0].slug}">
    <BlogPage post="{posts[0]}" />
</Page>
```

## Create an RSS feed

We can't call it a blog unless it provides an RSS feed. For that we've added a simple feed generator that reads the metadata and writes `/feed.rss` which is then served statically by the webserver that hosts the site. And we've added feed autodiscovery to the site's `index.html`.

```xmlui
<link rel="alternate" type="application/rss+xml" title="XMLUI Blog" href="/feed.rss" />
```

It would also be nice to have a blog overview page. Let's prototype
