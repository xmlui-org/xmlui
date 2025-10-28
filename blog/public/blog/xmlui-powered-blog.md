In this post we'll explore the development of the blog engine we're using on this site. Our tagline is *Practical User Interfaces Built Simply*  and creating this blog couldn't have been simpler. It's an XMLUI app built with a handful of core components (including [NavPanel](https://docs.xmlui.org/components/NavPanel), [NavLink](https://docs.xmlui.org/components/NavLink), [Pages](https://docs.xmlui.org/components/Pages), [Page](https://docs.xmlui.org/components/Page), and [Markdown](https://docs.xmlui.org/components/Markdown)) and a couple of [user-defined components](https://docs.xmlui.org/user-defined-components).

## The simplest possible thing

We started with the simplest possible approach: post metadata and data as literal strings.

```xmlui-pg name="XMLUI blog v1" height="200px"
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
---comp copy
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

This is a pretty good start! We can write posts, arrange them in reverse chronological order, and hey, it's the essence of a blog. The live playground is a nice bonus that any XMLUI app might put to good use. When you build user interfaces with XMLUI you'll want to document them, it's useful to do that with working examples as well as images, text, and video.

Let's unpack how this works, there isn't much to it. The `App` declared in `Main.xmlui` sets up navigation.

```xmlui copy
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

Each Page contains a user-defined component called `BlogPage` that receives the properties `content`, `title`, `author`, and `date`.

```xmlui
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

Here's how `BlogPage` assembles data and metadata to create a post.

```xmlui /$props/
<Component name="BlogPage">
    <VStack gap="0">
      <H1>{$props.post.title}</H1>
      <Text>{$props.post.date} • {$props.post.author}</Text>
    </VStack>
    <Image src="/blog/images/{$props.post.image}" />
    <Markdown marginTop="$space-4" data="/blog/{$props.post.slug}.md" />
</Component>
```

## Use Markdown files

So far the post content exists only as the `content` property passed to the `BlogPage` component. For the real blog we'll want to manage it as a set of Markdown files. This version enables that.

```xmlui-pg name="XMLUI blog v2"  height="200px"
---app
<App
  layout="vertical"
  var.posts = `{[
    {
      title: "Welcome to the XMLUI blog!",
      slug: "xmlui-powered-blog",
      author: "Jon Udell",
      date: "2025-09-01",
      image: "blog-scrabble.png"
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
    <VStack gap="0">
      <H1>{$props.post.title}</H1>
      <Text>{$props.post.date} - {$props.post.author}</Text>
    </VStack>
    <Image src="/blog/images/{$props.post.image}" />
    <Markdown marginTop="$space-4" data="/blog/{$props.post.slug}.md" />
  </VStack>
</Component>
```

Now we write post metadata as an App-level variable, and create Markdown files corresponding to the slugs. In this case the files are `xmlui-powered-blog.md` (this post) and `lorem-ipsum.md` (a dummy older post). We also add a hero image for each post.

```xmlui copy
<App
  layout="vertical"
  var.posts = `{[
    {
      title: "Welcome to the XMLUI blog!",
      slug: "xmlui-powered-blog",
      author: "Jon Udell",
      date: "2025-09-01",
      image: "blog-scrabble.png"
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

```xmlui copy
<NavGroup label="Blog">
  <NavLink label="{posts[0].title}" to="/blog/{posts[0].slug}" />
  <NavLink label="{posts[1].title}" to="/blog/{posts[1].slug}" />
</NavGroup>
```

The `NavLink` uses the post's slug to bind to its corresponding `Page`.

```xmlui copy
<Page url="/blog/{posts[0].slug}">
  <BlogPage post="{posts[0]}" />
</Page>
```

And the `Page` passes the complete post object to `BlogPage`. In v1 we used the `content` property of the `Markdown` component to pass a string. In v2 we use the `data` property to pass a URL constructed from the post slug.

```xmlui copy {11}
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

Although we have a `NavGroup` to list the posts, a blog should really have an overview page. Let's add another user-defined component for that.

```xmlui copy
<Component name="BlogOverview">
  <CVStack>
    <VStack width="100%">
      <H1>XMLUI Blog</H1>
      <Text>Latest updates, tutorials, and insights for building with XMLUI</Text>
      <List  data="{
      $props.posts.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      })
    }">
        <VStack gap="$space-2">
          <Link to="/blog/{$item.slug}">
            <Text fontSize="larger">
              {$item.title}
            </Text>
          </Link>
          <Text>
            {$item.date} • {$item.author}
          </Text>
          <Link to="/blog/{$item.slug}">
            <Image src="/blog/images/{$item.image}" />
          </Link>
          <Stack height="$space-8" />
        </VStack>
      </List>
    </VStack>
  </CVStack>
</Component>
```

The `NavGroup` now just becomes a `NavLink`.

```xmlui copy
<NavLink label="Blog" to="/blog" />
```

We refer to the overview in `Pages` along with the same `Page` used for the intro post.

```xmlui copy
<Page url="/blog">
    <BlogOverview posts="{posts}" />
</Page>
<Page url="/blog/{posts[0].slug}">
    <BlogPage post="{posts[0]}" />
</Page>
```

## Create an RSS feed

We can't call it a blog unless it provides an RSS feed. For that we've added a simple feed generator that reads the metadata and writes `/feed.rss` which is then served statically by the webserver that hosts the site. So we've added a RSS icon to the template and feed autodiscovery to the site's `index.html`.

## Deploy standalone

Our blog lives in the XMLUI monorepo where it coordinates with the landing page and docs.
But it can exist standalone, you only need a folder with a handful of files.


```

├── Main.xmlui
├── blog
│   ├── images
│   │   ├── blog-scrabble.png
│   │   └── lorem-ipsum.png
│   ├── lorem-ipsum.md
│   └── xmlui-powered-blog.md
├── components
│   ├── BlogOverview.xmlui
│   ├── BlogPage.xmlui
├── index.html
└── xmlui
    └── 0.10.24.js
```

Here's the `index.html`.

```xmlui copy
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>XMLUI blog test</title>
  <script src="xmlui/0.10.24.js"></script>
</head>
<body>
</body>
</html>
```

I dragged the folder containing the standalone app onto Netlify's drop target. Check it out!

[https://test-xmlui-blog.netlify.app/](https://test-xmlui-blog.netlify.app/)

## XMLUI for publishing

We get it, blog engines are a dime a dozen. We made this one because XMLUI was already a strong publishing system that we use for the [docs](https://docs.xmlui.org), [demo](https://demo.xmlui.org), and [landing page](https://xmlui.org). The `Markdown` component, with its support for playgrounds, works really well and it made sense to leverage that for our blog. We're not saying that you *should* build a blog engine with XMLUI but it's clearly something you *could* do. We think it's pretty easy to create a competent engine that makes life easy for authors and readers.

