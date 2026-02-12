# Bookmark [#bookmark]

As its name suggests, this component places a bookmark into its parent component's view. The component has an `id` that you can use in links to navigate (scroll to) the bookmark's location.

> [!INFO]
> Pop out the examples in this article to view them on full screen.

## Using Bookmark [#using-bookmark]

Use `Bookmark` as a standalone tag or wrap children with it.

> [!INFO]
> We suggest using a standalone bookmark, which does not increase the nesting depth of the source code, whenever possible. Note that a standalone bookmark will act as an additional child for its parent component, which can affect the layout (a `Stack` puts `gap`s between `Bookmark`s too).

### Standalone [#standalone]

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

### With nested children [#with-nested-children]

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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties [#properties]

### `id` [#id]

The unique identifier of the bookmark. You can use this identifier in links to navigate to this component's location. If this identifier is not set, you cannot programmatically visit this bookmark.

### `level` [#level]

> [!DEF]  default: **1**

The level of the bookmark. The level is used to determine the bookmark's position in the table of contents.

### `omitFromToc` [#omitfromtoc]

> [!DEF]  default: **false**

If true, this bookmark will be excluded from the table of contents.

### `title` [#title]

Defines the text to display the bookmark in the table of contents. If this property is empty, the text falls back to the value of `id`.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `scrollIntoView` [#scrollintoview]

Scrolls the bookmark into view.

**Signature**: `scrollIntoView()`

## Styling [#styling]

This component does not have any styles.
