# StickySection [#stickysection]

`StickySection` is a container that keeps itself visible at the edge of the scrollable area while the user scrolls. When multiple `StickySection` components share the same `stickTo` direction and would all have scrolled out of view, only the last one (the one closest to the current scroll position) remains visible — earlier ones are hidden beneath it. This makes `StickySection` ideal for implementing scrollable content with persistent section headers or footers.

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

### `stickTo` [#stickto]

> [!DEF]  default: **"top"**

Determines the edge of the visible area the section sticks to while scrolling. Use `"top"` to keep the section anchored to the top of the scrollable area and `"bottom"` to keep it anchored to the bottom.

Available values: `top` **(default)**, `bottom`

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| zIndex-StickySection | 1 | 1 |
