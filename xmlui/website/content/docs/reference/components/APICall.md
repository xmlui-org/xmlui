# APICall [#apicall]

`APICall` creates, updates or deletes data on the backend, versus [`DataSource`](/docs/reference/components/DataSource) which fetches data. Unlike DataSource, APICall doesn't automatically execute - you must trigger it manually with the `execute()` method, typically from form submissions or button clicks. See also [Actions.callAPI](/docs/globals#actionscallapi).

**Context variables available during execution:**

- `$attempts`: Number of status polls made in deferred mode
- `$elapsed`: Time elapsed since polling started in milliseconds
- `$error`: Error details (available in `errorNotificationMessage`)
- `$param`: The first parameter passed to `execute()` method
- `$params`: Array of all parameters passed to `execute()` method (access with `$params[0]`, `$params[1]`, etc.)
- `$polling`: Boolean indicating if polling is currently active in deferred mode
- `$progress`: Current progress 0-100 when in deferred mode (extracted via progressExtractor expression)
- `$result`: Response data (available in `completedNotificationMessage`)
- `$statusData`: Latest status response data when in deferred mode (available in event handlers and notifications)

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `body` [#body]

This optional property sets the request body. Use to pass an object that will be serialized as a JSON string. If you have an object that is already serialized as a JSON string, use `rawBody` instead.

### `cancelBody` [#cancelbody]

Optional body to send with the cancel request. Can use $result context from initial response.

### `cancelMethod` [#cancelmethod]

> [!DEF]  default: **"post"**

HTTP method for cancel requests. Defaults to 'post'.

Available values: `get`, `post` **(default)**, `put`, `delete`, `patch`, `head`, `options`, `trace`, `connect`

### `cancelUrl` [#cancelurl]

URL to call when cancelling the deferred operation. Can use $result context from initial response (e.g., '/api/cancel/{$result.operationId}'). If not provided, cancel() will only stop polling without notifying the server.

### `completedNotificationMessage` [#completednotificationmessage]

Message to show in toast notification when deferred operation completes successfully. Can include {$statusData.property} and other context variables from the final status.

### `completionCondition` [#completioncondition]

Expression that returns true when the deferred operation is complete. Can access $statusData context variable containing the latest status response.

### `confirmButtonLabel` [#confirmbuttonlabel]

This optional string property enables the customization of the submit button in the confirmation dialog that is displayed before the `APICall` is executed.

### `confirmMessage` [#confirmmessage]

This optional string sets the message in the confirmation dialog that is displayed before the `APICall` is executed.

### `confirmTitle` [#confirmtitle]

This optional string sets the title in the confirmation dialog that is displayed before the `APICall` is executed.

### `credentials` [#credentials]

Controls whether cookies and other credentials are sent with the request. Set to `"include"` to send credentials in cross-origin requests (requires `Access-Control-Allow-Credentials: true` header on the server).

Available values:

| Value | Description |
| --- | --- |
| `omit` | Never send credentials |
| `same-origin` | Send credentials only for same-origin requests (default browser behavior) |
| `include` | Always send credentials, even for cross-origin requests |

### `deferredMode` [#deferredmode]

> [!DEF]  default: **false**

Enable deferred operation mode for long-running operations that return 202 Accepted. When enabled, the component will automatically poll a status endpoint to track operation progress. (Experimental feature)

### `errorCondition` [#errorcondition]

Expression that returns true when the deferred operation has failed. Can access $statusData context variable containing the latest status response.

### `errorNotificationMessage` [#errornotificationmessage]

Message to show in toast notification when deferred operation fails. Can include {$statusData.property} and other context variables from the error status.

### `headers` [#headers]

You can optionally define request header values as key-value pairs, where the key is the ID of the particular header and the value is that header's corresponding value.

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

Message to show in toast notification during deferred operation polling. Can include {$progress}, {$statusData.property}, and other context variables. Notification will update on each poll with current values.

### `maxPollingDuration` [#maxpollingduration]

> [!DEF]  default: **300000**

Maximum time to poll before timing out, in milliseconds. Defaults to 300000ms (5 minutes).

### `maxPollingInterval` [#maxpollinginterval]

> [!DEF]  default: **30000**

Maximum interval between polls when using backoff strategies, in milliseconds. Defaults to 30000ms (30 seconds).

### `method` [#method]

> [!DEF]  default: **"get"**

The method of data manipulation can be done via setting this property.

Available values: `get` **(default)**, `post`, `put`, `delete`, `patch`, `head`, `options`, `trace`, `connect`

### `pollingBackoff` [#pollingbackoff]

> [!DEF]  default: **"none"**

Strategy for increasing polling interval over time. Options: 'none' (fixed interval), 'linear' (adds 1 second per attempt), 'exponential' (doubles each time). Defaults to 'none'.

Available values: `none` **(default)**, `linear`, `exponential`

### `pollingInterval` [#pollinginterval]

> [!DEF]  default: **2000**

Milliseconds between status polls. Defaults to 2000ms.

### `progressExtractor` [#progressextractor]

Expression to extract progress value (0-100) from the status response. Can access $statusData context variable. If not specified, no progress tracking.

### `queryParams` [#queryparams]

This optional property sets the query parameters for the request. The object you pass here will be serialized to a query string and appended to the request URL. You can specify key and value pairs where the key is the name of a particular query parameter and the value is that parameter's value.

### `rawBody` [#rawbody]

This optional property sets the request body to the value provided here without any conversion. Use the * `body` property if you want the object sent in JSON. When you define `body` and `rawBody`, the latest one prevails.

### `statusMethod` [#statusmethod]

> [!DEF]  default: **"get"**

HTTP method for status requests. Defaults to 'get'.

Available values: `get` **(default)**, `post`, `put`, `delete`, `patch`, `head`, `options`, `trace`, `connect`

### `statusUrl` [#statusurl]

The URL to poll for status updates when deferredMode is enabled. Can use $result context from initial response (e.g., '/api/status/{$result.operationId}'). Required when deferredMode is true.

### `url` [#url]

> [!DEF]  This property is required.

Use this property to set the URL to which data will be sent. If not provided, an empty URL is used.

## Events [#events]

### `beforeRequest` [#beforerequest]

This event fires before the request is sent. Returning an explicit boolean`false` value will prevent the request from being sent.

**Signature**: `() => boolean | void`

### `error` [#error]

This event fires when a request results in an error.

**Signature**: `(error: any) => void`

- `error`: The error object containing details about what went wrong with the API request.

### `pollingComplete` [#pollingcomplete]

Fires when polling stops in deferred mode (success, failure, timeout, or manual stop).

**Signature**: `(finalStatus: any, reason: string) => void`

- `finalStatus`: The final status data.
- `reason`: Reason for completion: 'completed', 'failed', 'timeout', or 'manual'.

### `pollingStart` [#pollingstart]

Fires when polling begins in deferred mode.

**Signature**: `(initialResult: any) => void`

- `initialResult`: The result from the initial API call that returned 202.

### `statusUpdate` [#statusupdate]

Fires on each poll when in deferred mode. Passes the status data and current progress.

**Signature**: `(statusData: any, progress: number) => void`

- `statusData`: The latest status response data from polling.
- `progress`: Current progress value 0-100.

### `success` [#success]

This event fires when a request results in a success. Returning an explicit `false` value suppresses automatic query invalidation, giving you full control over which cached data gets refreshed after the call.

**Signature**: `(result: any) => false | void`

- `result`: The response data returned from the successful API request.

### `timeout` [#timeout]

Fires if max polling duration is exceeded in deferred mode.

**Signature**: `() => void`

## Exposed Methods [#exposed-methods]

### `cancel` [#cancel]

Cancel the deferred operation on the server and stop polling. Requires cancelUrl to be configured.

**Signature**: `cancel(): Promise<void>`

### `execute` [#execute]

This method triggers the invocation of the API. You can pass an arbitrary number of parameters to the method. In the `APICall` instance, you can access those with the `$param` and `$params` context values.

**Signature**: `execute(...params: any[])`

- `params`: An arbitrary number of parameters that can be used in the API call.

### `getStatus` [#getstatus]

Get the current status data in deferred mode.

**Signature**: `getStatus(): any`

### `inProgress` [#inprogress]

Boolean flag indicating whether the API call is currently in progress.

**Signature**: `inProgress: boolean`

### `isPolling` [#ispolling]

Check if polling is currently active in deferred mode.

**Signature**: `isPolling(): boolean`

### `lastError` [#lasterror]

The error from the most recent failed API call execution.

**Signature**: `lastError: any`

### `lastResult` [#lastresult]

The result from the most recent successful API call execution.

**Signature**: `lastResult: any`

### `loaded` [#loaded]

Boolean flag indicating whether at least one successful API call has completed.

**Signature**: `loaded: boolean`

### `resumePolling` [#resumepolling]

Resume polling in deferred mode after it was manually stopped.

**Signature**: `resumePolling(): void`

### `stopPolling` [#stoppolling]

Manually stop polling in deferred mode. The operation continues on the server.

**Signature**: `stopPolling(): void`

## Styling [#styling]

This component does not have any styles.
