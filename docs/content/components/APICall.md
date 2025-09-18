# APICall [#apicall]

`APICall` creates, updates or deletes data on the backend, versus [`DataSource`](/components/DataSource) which fetches data. Unlike DataSource, APICall doesn't automatically execute - you must trigger it manually with the `execute()` method, typically from form submissions or button clicks.

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
  id="ds"
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

### `errorNotificationMessage` [#errornotificationmessage]

This property defines the message to display automatically when the operation results in an error. You can use the `$error` context value in an expression to refer to the original error message.

This property customizes the message displayed in a toast when the API invocation results in an error. The `$error.statusCode` context variable can refer to the response's status code, while `$error. details` to the response body. For example, you can use the following code snippet to display the status code and the details:

```xmlui copy
 <APICall
  id="ds"
  method="post"
  url="/api/shopping-list" 
  errorNotificationMessage="${error.statusCode}, {JSON.stringify($error.details)}" />
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

### `error` [#error]

This event fires when a request results in an error.

### `success` [#success]

This event fires when a request results in a success.

## Exposed Methods [#exposed-methods]

### `execute` [#execute]

This method triggers the invocation of the API. You can pass an arbitrary number of parameters to the method. In the `APICall` instance, you can access those with the `$param` and `$params` context values.

**Signature**: `execute(...params: any[])`

- `params`: An arbitrary number of parameters that can be used in the API call.

## Styling [#styling]

This component does not have any styles.
