# Redirect [#redirect]

`Redirect` immediately redirects the browser to the URL in its `to` property when it gets visible (its `when` property gets `true`). It works only within [App](/components/App), not externally.

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

### `replace` [#replace]

> [!DEF]  default: **false**

This boolean property indicates whether the redirect should replace the current history entry or create a new one.

### `to` [#to]

> [!DEF]  default: **""**

This property defines the URL to which this component is about to redirect requests.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
