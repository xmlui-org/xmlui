%-DESC-START

**Key characteristics:**
- **Conditional loading**: Use `when` property to prevent fetching until dependent data is ready
- **Built-in caching**: Prevents unnecessary requests and provides instant data access
- **Polling support**: Automatically refetch data at specified intervals
- **Data transformation**: Process and filter responses before components use the data

## Preventing the `DataSource` from Executing

Prevent the `DataSource` from executing until the specified condition in the `when` attribute is true.

```xmlui
<DataSource
  id="userProfile"
  url="/api/users/{selectedUserId}/profile"
  when="{selectedUserId}" />
```


## Structural Sharing

`DataSource` uses a technique called "structural sharing" to ensure that as many data references as possible will be kept intact and not cause extra UI refresh. If data is fetched from an API endpoint, you'll usually get a completely new reference by json parsing the response. However, `DataSource` will keep the original reference if *nothing* has changed in the data. If a subset has changed, `DataSource` will keep the unchanged parts and only replace the changed parts.

When you initiate the refetching of data (e.g., with the `refetch` method or setting the `pollIntervalInSeconds` property) and you retrieve data structurally equal with the cached data instance, `DataSource` will not fire the `loaded` event.

By default, structural sharing is turned on. If you do not need this behavior, set the `structuralSharing` property to `false`.

%-DESC-END

%-PROP-START completedNotificationMessage

This property customizes the success message displayed in a toast after the finished API invocation. The `$result` context variable can refer to the response body. For example, you can use the following code snippet to display the first 100 characters in the completed operation's response body:

```xmlui copy
 <DataSource
  id="ds"
  url="/api/shopping-list"
  completedNotificationMessage="Result: {JSON.stringify($result).substring(0, 100)}" />
```

%-PROP-END

%-PROP-START errorNotificationMessage

This property customizes the message displayed in a toast when the API invocation results in an error. The `$error.statusCode` context variable can refer to the response's status code, while `$error. details` to the response body. For example, you can use the following code snippet to display the status code and the details:

```xmlui copy
 <DataSource
  id="ds"
  method="post"
  url="/api/shopping-list"
  errorNotificationMessage="${error.statusCode}, {JSON.stringify($error.details)}" />
```

%-PROP-END

%-PROP-START resultSelector

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


%-PROP-END