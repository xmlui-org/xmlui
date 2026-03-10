# DataSource [#datasource]

`DataSource` fetches and caches data from API endpoints, versus [`APICall`](/docs/reference/components/APICall) which creates, updates or deletes data.

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

### `body` [#body]

Set the optional request body. The object you pass is serialized as a JSON string.

### `completedNotificationMessage` [#completednotificationmessage]

Set the message to display when the data fetch completes.If the property value is not set, no completion message is displayed.

### `credentials` [#credentials]

Controls whether cookies and other credentials are sent with the request. Set to `"include"` to send credentials in cross-origin requests (requires `Access-Control-Allow-Credentials: true` header on the server).

Available values:

| Value | Description |
| --- | --- |
| `omit` | Never send credentials |
| `same-origin` | Send credentials only for same-origin requests (default browser behavior) |
| `include` | Always send credentials, even for cross-origin requests |

### `errorNotificationMessage` [#errornotificationmessage]

No description provided.

### `headers` [#headers]

Set request headers. Pass an object whose keys are header names and values are header values.

### `id` [#id]

> [!DEF]  This property is required.

Set the ID used by other components to access the retrieved data in the `value`property of a `DataSource`, or status info in the `loaded` and `error` properties.When no `id` is set, the component cannot be used programmatically.

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

Set the message to display when the data fetch is in progress. If the property value is not set, no progress message is displayed.

### `method` [#method]

> [!DEF]  default: **"get"**

Set the HTTP method.

Available values: `get` **(default)**, `post`, `put`, `delete`, `patch`, `head`, `options`, `trace`, `connect`

### `nextPageSelector` [#nextpageselector]

When using `DataSource` with paging, the response may contain information about the previous and next page. This property defines the selector that extracts the next page information from the response deserialized to an object.

### `pollIntervalInSeconds` [#pollintervalinseconds]

Set the interval for periodic data fetching. If the data changes on refresh, XMLUI will re-render components that refer directly or indirectly to the `DataSource`. If not set or set to zero, the component does not poll for data.

### `prevPageSelector` [#prevpageselector]

When using `DataSource` with paging, the response may contain information about the previous and next page. This property defines the selector that extracts the previous page information from the response deserialized to an object.

### `queryParams` [#queryparams]

Append optional key-value pairs to the URL.

### `rawBody` [#rawbody]

Set the request body with no serialization. Use it to send a payload  that has already been serialized to a JSON string.

### `resultSelector` [#resultselector]

Set an optional object key to extract a subset of the response data. If this value is not set, the entire response body is considered the result.

### `structuralSharing` [#structuralsharing]

> [!DEF]  default: **"true"**

This property allows structural sharing. When turned on, `DataSource` will keep the original reference if nothing has changed in the data. If a subset has changed, `DataSource` will keep the unchanged parts and only replace the changed parts. If you do not need this behavior, set this property to `false`.

### `transformResult` [#transformresult]

Set an optional function to perform a final transformation of the response data. If this value is not set, the result is not transformed.

### `url` [#url]

> [!DEF]  This property is required.

Set the URL.

## Events [#events]

### `error` [#error]

This event fires when a request results in an error.

**Signature**: `error(error: Error): void`

- `error`: The error object that occurred during the request.

### `loaded` [#loaded]

The component triggers this event when the fetch operation has been completed and the data is loaded. The event has two arguments. The first is the data loaded; the second indicates if the event is a result of a refetch.

**Signature**: `loaded(data: any, isRefetch: boolean): void`

- `data`: The data loaded from the fetch operation.
- `isRefetch`: Indicates whether this is a result of a refetch operation.

## Exposed Methods [#exposed-methods]

### `inProgress` [#inprogress]

This property indicates if the data is being fetched.

**Signature**: `get inProgress(): boolean`

### `isRefetching` [#isrefetching]

This property indicates if the data is being re-fetched.

**Signature**: `get isRefetching(): boolean`

### `loaded` [#loaded]

This property indicates if the data has been loaded.

**Signature**: `get loaded(): boolean`

### `refetch` [#refetch]

This method requests the re-fetch of the data.

**Signature**: `refetch(): void`

### `value` [#value]

This property retrieves the data queried from the source after optional transformations.

**Signature**: `get value(): any`

## Styling [#styling]

This component does not have any styles.
