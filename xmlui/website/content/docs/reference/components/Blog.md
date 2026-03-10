# Blog [#blog]

`Blog` renders blog list or a single post based on the current route and appGlobals.blog. appGlobals.blog must be an object with required `posts` (array of post objects). Layout behavior comes from theme vars queried with `getThemeVar`: `layout` ("basic" | "featuredWithTabs", default "basic"), `tableOfContents` (string "true"/"false", toggles TOC on post pages), and `tags` (string "true"/"false", hides/shows tags; default true). When the route has a slug (e.g. /blog/:slug), it shows the post; otherwise the list view.

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

This component does not have any properties.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
