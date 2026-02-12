# PageMetaTitle [#pagemetatitle]

`PageMetaTitle` dynamically sets or updates the browser tab title, enabling pages and components to override the default application name with context-specific titles.

**Key features:**
- **Dynamic title updates**: Change browser tab title based on current page or content
- **App name override**: Supersedes the `App`s name property when present
- **Flexible placement**: Can be positioned anywhere in the component tree
- **Binding support**: Accepts dynamic values and expressions for context-aware titles
- **SEO enhancement**: Improves search engine optimization with descriptive page titles

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

### `value` [#value]

> [!DEF]  default: **"XMLUI Application"**

This property sets the page's title to display in the browser tab.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
