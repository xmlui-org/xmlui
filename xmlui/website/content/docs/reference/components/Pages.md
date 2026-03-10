# Pages [#pages]

`Pages` serves as the routing coordinator within an [App](/components/App), managing which [Page](/components/Page)  displays based on the current URL.

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

### `defaultScrollRestoration` [#defaultscrollrestoration]

> [!DEF]  default: **false**

When set to true, the page scroll position is restored when navigating back via browser history.

### `fallbackPath` [#fallbackpath]

> [!DEF]  default: **"/"**

The fallback path when the current URL does not match any of the paths of the pages.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [gap](/docs/styles-and-themes/common-units/#size)-Pages | $space-5 | $space-5 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Pages | $space-4 | $space-4 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Pages | $space-5 | $space-5 |
