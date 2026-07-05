%-DESC-START

> [!INFO]
> Pop out the examples in this article to view them on full screen.

## Using Bookmark

Use `Bookmark` as a standalone tag or wrap children with it.

> [!INFO]
> We suggest using a standalone bookmark, which does not increase the nesting depth of the source code, whenever possible. Note that a standalone bookmark will act as an additional child for its parent component, which can affect the layout (a `Stack` puts `gap`s between `Bookmark`s too).

### Standalone

Add an `id` property to `Bookmark` instances and use the same identifiers in links with hash tags, as the following example shows:

```xmlui-pg copy display height="320px" name="Example: standalone Bookmark"
---app display copy
<App layout="vertical-full-header" scrollWholePage="false">
  <NavPanel>
    <Link to="/#red">Jump to red</Link>
    <Link to="/#green">Jump to green</Link>
    <Link to="/#blue">Jump to blue</Link>
  </NavPanel>
  <Pages>
    <Page url="/">
      <Bookmark id="red">
        <VStack height="200px" backgroundColor="red" />
      </Bookmark>
      <Bookmark id="green">
        <VStack height="200px" backgroundColor="green" />
      </Bookmark>
      <Bookmark id="blue">
        <VStack height="200px" backgroundColor="blue" />
      </Bookmark>
    </Page>
  </Pages>
</App>
---desc
Clicking a link scrolls the bookmarked component adjacent to the corresponding `Bookmark` tag into the view:
```

### With nested children

Alternatively, you can nest components into `Bookmark`:

```xmlui-pg copy display height="320px" name="Example: Bookmark with nested children"
---app display copy
<App layout="vertical-full-header" scrollWholePage="false">
  <NavPanel>
    <Link to="/#red">Jump to red</Link>
    <Link to="/#green">Jump to green</Link>
    <Link to="/#blue">Jump to blue</Link>
  </NavPanel>
  <Pages>
    <Page url="/">
      <Bookmark id="red">
        <VStack height="200px" backgroundColor="red" />
      </Bookmark>
      <Bookmark id="green">
        <VStack height="200px" backgroundColor="green" />
      </Bookmark>
      <Bookmark id="blue">
        <VStack height="200px" backgroundColor="blue" />
      </Bookmark>
    </Page>
  </Pages>
</App>
---desc
You can try; this example works like the previous one:
```

%-DESC-END
