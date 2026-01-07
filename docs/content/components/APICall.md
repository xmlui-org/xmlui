# APICall [#apicall]

`APICall` creates, updates or deletes data on the backend, versus [`DataSource`](/components/DataSource) which fetches data. Unlike DataSource, APICall doesn't automatically execute - you must trigger it manually with the `execute()` method, typically from form submissions or button clicks. See also [Actions.callAPI](globals#actionscallapi).

**Key characteristics:**
- **Manual execution**: Call `execute()` method to trigger the API request
- **Form integration**: Commonly used in `<event name="submit">` handlers for forms
- **Parameter passing**: Pass data to the API call via `execute()` parameters
- **Built-in notifications**: Supports automatic progress, success, and error messages

**Context variables available during execution:**

- `$error`: Error details (available in `errorNotificationMessage`)
- `$param`: The first parameter passed to `execute()` method
- `$params`: Array of all parameters passed to `execute()` method (access with `$params[0]`, `$params[1]`, etc.)
- `$result`: Response data (available in `completedNotificationMessage`)

## Properties [#properties]

### `body` [#body]

This optional property sets the request body. Use to pass an object that will be serialized as a JSON string. If you have an object that is already serialized as a JSON string, use `rawBody` instead.

### `completedNotificationMessage` [#completednotificationmessage]

This property defines the message to display automatically when the operation has been completed. When this property is not defined, the completion does not display any message.

This property customizes the success message displayed in a toast after the finished API invocation. The `$result` context variable can refer to the response body. For example, you can use the following code snippet to display the first 100 characters in the completed operation's response body:

```xmlui copy
 <APICall
  id="api"
  method="post"
  url="/api/shopping-list" 
  completedNotificationMessage="Result: {JSON.stringify($result).substring(0, 100)}" />
```

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

**Important**: When using `credentials="include"` for cross-origin requests, the server must respond with the `Access-Control-Allow-Credentials: true` header, and the `Access-Control-Allow-Origin` header cannot be `*` (it must be a specific origin).

**Example**: Submitting a form with authentication

```xmlui copy
<Form>
  <TextBox id="message" label="Message" />
  <event name="submit">
    <APICall 
      url="https://api.example.com/messages"
      method="post"
      body='{{"message": message.value}}'
      credentials="include"
    />
  </event>
</Form>
```

### `errorNotificationMessage` [#errornotificationmessage]

This property customizes the message displayed in a toast when the API invocation results in an error. Use the `$error` context object to get the error code (`$error.statusCode`) optional message (`$error.message`), or details coming from the response body (`$error.details`). For example, you can use the following code snippet to display the status code and the details:

```xmlui copy
 <APICall
  id="api"
  method="post"
  url="/api/shopping-list"
  errorNotificationMessage="${error.statusCode}, ${error.message} {JSON.stringify($error.details)}" />
```

**NOTE:** While we support Microsoft/Google-style and RFC 7807 errors, not all response shapes can be accounted for.
Because of this, there is an attribute available in the `configuration` file called `errorResponseTransform` under `appGlobals`. This exposes the error response using the `$response` context variable.
Here is an example on how to use it (note that this is evaluated as a `binding expression`):

Error looks the following coming from the backend:

```js
{
  code: number,
  error: string
}
```

This is how to transform it in config:

```json
{
  "appGlobals": {
    "errorResponseTransform": "{{ statusCode: $response.code, message: $response.error }}"
  }
}
```

### `headers` [#headers]

You can optionally define request header values as key-value pairs, where the key is the ID of the particular header and the value is that header's corresponding value.

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

This property customizes the message that is displayed in a toast while the API operation is in progress. If not defined, no progress message is displayed.

### `method` (default: "get") [#method-default-get]

The method of data manipulation can be done via setting this property.

Available values: `get` **(default)**, `post`, `put`, `delete`, `patch`, `head`, `options`, `trace`, `connect`

### `queryParams` [#queryparams]

This optional property sets the query parameters for the request. The object you pass here will be serialized to a query string and appended to the request URL. You can specify key and value pairs where the key is the name of a particular query parameter and the value is that parameter's value.

### `rawBody` [#rawbody]

This optional property sets the request body to the value provided here without any conversion. Use the * `body` property if you want the object sent in JSON. When you define `body` and `rawBody`, the latest one prevails.

### `url` (required) [#url-required]

Use this property to set the URL to which data will be sent. If not provided, an empty URL is used.

## Events [#events]

### `beforeRequest` [#beforerequest]

This event fires before the request is sent. Returning an explicit boolean`false` value will prevent the request from being sent.

**Signature**: `() => boolean | void`

### `error` [#error]

This event fires when a request results in an error.

**Signature**: `(error: any) => void`

- `error`: The error object containing details about what went wrong with the API request.

### `success` [#success]

This event fires when a request results in a success.

**Signature**: `(result: any) => void`

- `result`: The response data returned from the successful API request.

## Exposed Methods [#exposed-methods]

### `execute` [#execute]

This method triggers the invocation of the API. You can pass an arbitrary number of parameters to the method. In the `APICall` instance, you can access those with the `$param` and `$params` context values.

**Signature**: `execute(...params: any[])`

- `params`: An arbitrary number of parameters that can be used in the API call.

### `inProgress` [#inprogress]

Boolean flag indicating whether the API call is currently in progress.

**Signature**: `inProgress: boolean`

### `lastError` [#lasterror]

The error from the most recent failed API call execution.

**Signature**: `lastError: any`

### `lastResult` [#lastresult]

The result from the most recent successful API call execution.

**Signature**: `lastResult: any`

### `loaded` [#loaded]

Boolean flag indicating whether at least one successful API call has completed.

**Signature**: `loaded: boolean`

## Styling [#styling]

This component does not have any styles.
