# Bookmark [#bookmark]

>[!WARNING]
> The Bookmark component is deprecated. We will remove it in a future release. Please use the `bookmark` property instead.

As its name suggests, this component places a bookmark into its parent component's view. The component has an `id` that you can use in links to navigate (scroll to) the bookmark's location.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

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
