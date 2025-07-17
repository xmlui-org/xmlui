%-DESC-START

**Key characteristics:**
- **Manual execution**: Call `execute()` method to trigger the API request
- **Form integration**: Commonly used in `<event name="submit">` handlers for forms
- **Parameter passing**: Pass data to the API call via `execute()` parameters
- **Built-in notifications**: Supports automatic progress, success, and error messages

%-DESC-END

%-PROP-START completedNotificationMessage

This property customizes the success message displayed in a toast after the finished API invocation. The `$result` context variable can refer to the response body. For example, you can use the following code snippet to display the first 100 characters in the completed operation's response body:

```xmlui copy
 <APICall
  id="ds"
  method="post"
  url="/api/shopping-list" 
  completedNotificationMessage="Result: {JSON.stringify($result).substring(0, 100)}" />
```

%-PROP-END

%-PROP-START errorNotificationMessage

This property customizes the message displayed in a toast when the API invocation results in an error. The `$error.statusCode` context variable can refer to the response's status code, while `$error. details` to the response body. For example, you can use the following code snippet to display the status code and the details:

```xmlui copy
 <APICall
  id="ds"
  method="post"
  url="/api/shopping-list" 
  errorNotificationMessage="${error.statusCode}, {JSON.stringify($error.details)}" />
```
%-PROP-END

%-PROP-START invalidates

This property takes either a string or a list of strings representing URL endpoints to invalidate the local data cache based on the given URL routes.

For a short overview on client side caching, see the [DataSource component](/components/DataSource).

%-PROP-END

%-PROP-START updates

This property takes either a string or a list of strings representing URL endpoints to indicate which data should be updated in the cache.

%-PROP-END
