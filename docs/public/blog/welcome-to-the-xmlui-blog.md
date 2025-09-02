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

This is a pretty good start! We can write posts, arrange them in reverse chronological order, and hey, it's the essence of a blog. Since it's a blog about XMLUI the live playground is a nice bonus that any XMLUI app might put to good use. The user interfaces that you build with XMLUI will require some explaining, it's handy to explain with working examples as well as images, text, and video.

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

Each Page contains a [user-defined component](https://docs.xmlui.org/user-defined-components) called `BlogPage`. In the prototype, the `BlogPage` component receives page content as `$props.content`.

```xmlui copy {4}
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

```xmlui copy {4, 6, 8, 11}
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

```xmlui copy
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

And the `Page` passes the complete post object to `BlogPage`. In v1 we used the `content` property of the `Markdown` component to pass a string. In v2 we use the `data` property to pass an URL constructed from the post slug.

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

Although it's feasible to use a `NavGroup` to list the posts, a blog should really have an overview page. Let's add another user-defined component for that.

```xmlui copy
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

We can't call it a blog unless it provides an RSS feed. For that we've added a simple feed generator that reads the metadata and writes `/feed.rss` which is then served statically by the webserver that hosts the site. And we've added feed autodiscovery to the site's `index.html`.

```xmlui copy
<link rel="alternate" type="application/rss+xml" title="XMLUI Blog" href="/feed.rss" />
```

## Add search

The XMLUI repo has a build process that makes documentation available to the search function on this site. We've updated the build to include blog posts.

![blog search](/blog/images/integrated-blog-search.png)

## Deploy standalone

The details of the search mechanism are specific to the XMLUI monorepo. Suppose you wanted to decouple the blog engine from the monorepo and use it standalone? Let's start with this footprint.


```
├── Main.xmlui
├── blog
│   ├── images
│   │   ├── blog-page-component.png
│   │   └── lorem-ipsum.png
│   ├── lorem-ipsum.md
│   └── welcome-to-the-xmlui-blog.md
├── components
│   ├── BlogOverview.xmlui
│   ├── BlogPage.xmlui
├── index.html
└── xmlui
    ├── xmlui-playground.js
    └── xmlui-standalone.umd.js
```

Here's the `index.html`.

```xmlui copy
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>XMLUI blog test</title>
  <script src="xmlui/xmlui-standalone.umd.js"></script>
  <script src="xmlui/xmlui-playground.js"></script>
<script>
</script>
</head>
<body>
</body>
</html>
```

And here's `Main.xmlui`.

```xmlui copy
<Fragment>
    <App
        when="{!window.location.hash.includes('/playground')}"
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
        <AppHeader>
            <property name="logoTemplate">
                <Link to="https://xmlui.org/">
                    <Logo height="$space-8" />
                </Link>
            </property>
        </AppHeader>
        <NavPanel>
          <NavLink label="Home" to="/" />
          <NavLink label="Blog" to="/blog" />
        </NavPanel>
        <Pages fallbackPath="/404">
           <Page url="/">
             <Text>Test of XMLUI blog</Text>
           </Page>
           <Page url="/blog">
             <BlogOverview posts="{posts}" />
           </Page>
           <Page url="/blog/{posts[0].slug}">
             <BlogPage post="{posts[0]}" />
            </Page>
           <Page url="/blog/{posts[1].slug}">
             <BlogPage post="{posts[1]}" />
            </Page>
        </Pages>
        <Footer>
            <ToneSwitch />
        </Footer>
    </App>
    <StandalonePlayground when="{window.location.hash.includes('/playground')}" />
</Fragment>
```

That's all you need to run the blog. Note that we include `xmlui-playground.js`. The live playgrounds you can use here are provided by an extension, and a standalone app can use that extension in the same way our main site does. So when you serve the blog from a static webserver, the playground examples work the same way.

You can host the standalone blog on any static webserver. We'll do that, but first let's create a search mechanism that's decoupled from the monorepo's build and works entirely client-side. We'll create two user-defined components: `SearchPrep` and `BlogSearch`.

```xmlui copy
<Page url="/search">
  <SearchPrep posts="{posts}" />
  <BlogSearch posts="{posts}" searchIndex="{window.getblogPosts()}" />
</Page>
```

Here is `SearchPrep`. It uses `DataSource` in a `List` to read posts, and calls global functions to process them.

```xmlui copy
<Component name="SearchPrep" var.count="{0}">

    <List when="{count <= $props.posts.length}" data="{$props.posts}">
        <DataSource
          url="/blog/{$item.slug}.md"
          onLoaded="(data) => {
            // Set indexing state on first load;
            if (window.blogIsIndexing === '') {
              window.setBlogIndexing();
            }

            window.setBlogSearchEntry('/blog/' + $item.slug, $item.title + '\n' + data);
            console.log('Added to blogPosts:', '/blog/' + $item.slug);
            count++;

            if (window.getBlogSearchCount() >= $props.posts.length) {
              window.stopBlogIndexing();
              console.log('Blog indexing complete!');

            }
          }" />

    </List>

</Component>
```

Here is `BlogSearch`. It provides a reactive search box so as you type, another global function finds fragments in posts that match your current query.

```xmlui copy
<Component name="BlogSearch">
  <VStack gap="$space-4">
    <TextBox
      id="searchQuery"
      placeholder="Search blog posts..."
      width="15rem"
    />
    <List data="{
      window.searchBlogPosts($props.posts, $props.searchIndex, searchQuery.value)
    }">
      <VStack gap="$space-2">
        <Link to="/blog/{$item.post.slug}">
          <H2 value="{$item.post.title}" />
        </Link>
        <List data="{$item.matches}">
          <Card>
            <Text backgroundColor="$color-warn-100" value="{$item.context}" />
          </Card>
        </List>
      </VStack>
    </List>
  </VStack>
</Component>
```

With these ingredients in place, I dragged the folder containing the standalone app onto Netlify's drop target. Check it out!

[https://test-xmlui-blog.netlify.app/](https://test-xmlui-blog.netlify.app/)

## Next steps

There's always more to do. For example, we should probably explore what's possible with XMLUI [Themes](/themes-intro). But this is plenty for now. The engine described here evolved during the course of writing this post, it's not yet merged into the site, once that's done and we've sanded off the rough edges we can think about enhancements.

And yeah, we know, blog engines are a dime a dozen. We made this one because XMLUI was already a strong publishing system  — we use it this site, the [demo site](https://demo.xmlui.org), and the [landing page](https//xmlui.org). The `Markdown` component, with its support for playgrounds, works really well and it made sense to leverage that for our blog. We're not saying that you *should* build a blog engine with XMLUI but it's clearly something you *could* do. We think it's pretty easy to create a competent engine that makes life easy for authors and readers. 



