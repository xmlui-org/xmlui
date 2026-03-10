# RealTimeAdapter [#realtimeadapter]

`RealTimeAdapter` is a non-visual component that listens to real-time events.

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

### `url` [#url]

> [!DEF]  default: **""**

This property specifies the URL to use for long-polling.

## Events [#events]

### `eventArrived` [#eventarrived]

This event is raised when data arrives from the backend using long-polling.

**Signature**: `eventArrived(data: any): void`

- `data`: The data received from the backend.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
