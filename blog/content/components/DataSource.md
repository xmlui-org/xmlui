# DataSource [#datasource]

`DataSource` fetches and caches data from API endpoints, versus [`APICall`](/components/APICall) which creates, updates or deletes data.

**Key characteristics:**
- **Conditional loading**: Use `when` property to prevent fetching until dependent data is ready
- **Built-in caching**: Prevents unnecessary requests and provides instant data access
- **Polling support**: Automatically refetch data at specified intervals
- **Data transformation**: Process and filter responses before components use the data

## Preventing the `DataSource` from Executing [#preventing-the-datasource-from-executing]

Prevent the `DataSource` from executing until the specified condition in the `when` attribute is true.

```xmlui
<DataSource
  id="userProfile"
  url="/api/users/{selectedUserId}/profile"
  when="{selectedUserId}" />
```

## Structural Sharing [#structural-sharing]

`DataSource` uses a technique called "structural sharing" to ensure that as many data references as possible will be kept intact and not cause extra UI refresh. If data is fetched from an API endpoint, you'll usually get a completely new reference by json parsing the response. However, `DataSource` will keep the original reference if *nothing* has changed in the data. If a subset has changed, `DataSource` will keep the unchanged parts and only replace the changed parts.

When you initiate the refetching of data (e.g., with the `refetch` method or setting the `pollIntervalInSeconds` property) and you retrieve data structurally equal with the cached data instance, `DataSource` will not fire the `loaded` event.

By default, structural sharing is turned on. If you do not need this behavior, set the `structuralSharing` property to `false`.

## Properties [#properties]

### `body` [#body]

Set the optional request body. The object you pass is serialized as a JSON string.

### `completedNotificationMessage` [#completednotificationmessage]

Set the message to display when the data fetch completes.If the property value is not set, no completion message is displayed.

This property customizes the success message displayed in a toast after the finished API invocation. The `$result` context variable can refer to the response body. For example, you can use the following code snippet to display the first 100 characters in the completed operation's response body:

```xmlui copy
 <DataSource
  id="ds"
  url="/api/shopping-list"
  completedNotificationMessage="Result: {JSON.stringify($result).substring(0, 100)}" />
```

### `errorNotificationMessage` [#errornotificationmessage]

Set the message to display when the there is an error. You can use the `$error` context value in an expression to refer to the original error message.

This property customizes the message displayed in a toast when the API invocation results in an error. The `$error.statusCode` context variable can refer to the response's status code, while `$error. details` to the response body. For example, you can use the following code snippet to display the status code and the details:

```xmlui copy
 <DataSource
  id="ds"
  method="post"
  url="/api/shopping-list"
  errorNotificationMessage="${error.statusCode}, {JSON.stringify($error.details)}" />
```

### `headers` [#headers]

Set request headers. Pass an object whose keys are header names and values are header values.

### `id` (required) [#id-required]

Set the ID used by other components to access the retrieved data in the `value`property of a `DataSource`, or status info in the `loaded` and `error` properties.When no `id` is set, the component cannot be used programmatically.

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

Set the message to display when the data fetch is in progress. If the property value is not set, no progress message is displayed.

### `method` (default: "get") [#method-default-get]

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

The selector can be a simple dot notation path (e.g., `value.results`) or a JavaScript expression that processes the data (e.g., `results.filter(item => item.type === 'active')`). The selector has access to standard JavaScript functions like `map` and `filter`, and operates on the full response body.

Here is a sample response from the HubSpot API.

```json
{
    "results": [
        {
            "id": "88903258744",
            "properties": {
                "company": "HubSpot",
                "createdate": "2025-01-03T23:38:47.449Z",
                "custom_notes": "Nice guy!",
                "email": "bh@hubspot.com",
                "firstname": "Brian",
                "hs_object_id": "88903258744",
                "lastmodifieddate": "2025-02-18T23:13:34.759Z",
                "lastname": "Halligan (Sample Contact)"
            },
            "createdAt": "2025-01-03T23:38:47.449Z",
            "updatedAt": "2025-02-18T23:13:34.759Z",
            "archived": false
        },
        {
            "id": "88918034480",
            "properties": {
                "company": "HubSpot",
                "createdate": "2025-01-03T23:38:47.008Z",
                "custom_notes": null,
                "email": "emailmaria@hubspot.com",
                "firstname": "Maria",
                "hs_object_id": "88918034480",
                "lastmodifieddate": "2025-01-03T23:38:59.001Z",
                "lastname": "Johnson (Sample Contact)"
            },
            "createdAt": "2025-01-03T23:38:47.008Z",
            "updatedAt": "2025-01-03T23:38:59.001Z",
            "archived": false
        }
    ]
}
```

This `resultSelector` builds an array of the `properties` objects.

```xmlui copy
<DataSource
  id="contacts"
  url="http://{DOMAIN}/{CORS_PROXY}/api.hubapi.com/crm/v3/objects/contacts?properties=firstname,lastname,email,company,custom_notes"
  resultSelector="results.map(item => item.properties )"
  headers='{{"Authorization":"Bearer not-a-real-token"}}'
```

This `List` uses the array.

```xmlui copy
<List data="{contacts}" title="Hubspot Contacts">
  <Card gap="0" width="20em">
    <Text fontWeight="bold">
      {$item.firstname} {$item.lastname}
    </Text>
    <Text>
      {$item.company}
    </Text>
    <Text>
      {$item.email}
    </Text>
    <Text>
      {$item.custom_notes}
    </Text>
  </Card>
</List>
```

This `resultSelector` filters the array of the `properties` objects to include only contacts with non-null `custom_notes`.

```xmlui copy
<DataSource
  id="contacts"
  resultSelector="results.filter(contact => contact.properties.custom_notes !== null).map(contact => contact.properties)"
  url="http://{DOMAIN}/{CORS_PROXY}/api.hubapi.com/crm/v3/objects/contacts?properties=firstname,lastname,email,company,custom_notes"
  headers='{{"Authorization":"Bearer not-a-real-token"}}'
  />
````

This `Table` uses the filtered array.

```xmlui copy
<Table title="HubSpot contacts" data="{contacts}">
  <Column bindTo="firstname" />
  <Column bindTo="lastname" />
  <Column bindTo="company" />
  <Column bindTo="email" />
  <Column bindTo="custom_notes" />
</Table>
```

### `structuralSharing` (default: "true") [#structuralsharing-default-true]

This property allows structural sharing. When turned on, `DataSource` will keep the original reference if nothing has changed in the data. If a subset has changed, `DataSource` will keep the unchanged parts and only replace the changed parts. If you do not need this behavior, set this property to `false`.

### `transformResult` [#transformresult]

Set an optional function to perform a final transformation of the response data. If this value is not set, the result is not transformed.

### `url` (required) [#url-required]

Set the URL.

## Events [#events]

### `error` [#error]

This event fires when a request results in an error.

### `loaded` [#loaded]

The component triggers this event when the fetch operation has been completed and the data is loaded. The event has two arguments. The first is the data loaded; the second indicates if the event is a result of a refetch.

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
