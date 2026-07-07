# FeaturedWithTabsLayout [#featuredwithtabslayout]

A featured layout with a highlighted post and tabbed grid, suitable for blogs or documentation hubs.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `gridCols`

Number of columns to use in supporting layouts; typically derived from media size.

### `latestPost`

The most recent or featured post object.

### `postsByTag`

Pre-grouped posts by tag in the shape { tag, posts[] }, used when tag tabs are shown.

### `showTags`

> [!DEF]  default: **true**

Whether to render tag-based tabs and tag labels.

### `sortedPosts`

Array of all posts, sorted by date or other criteria.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
