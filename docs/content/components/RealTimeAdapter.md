# RealTimeAdapter [#realtimeadapter]

`RealTimeAdapter` is a non-visual component that listens to real-time events.

## Properties [#properties]

### `url` [#url]

-  default: **""**

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
