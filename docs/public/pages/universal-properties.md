# Universal Properties

These properties can be used with any XMLUI component.

## id

The `id` property assigns a unique identifier to a component.

```xmlui
<Button id="submit-button" onClick="{handleSubmit}">Submit</Button>
```

```xmlui
<TextBox id="email-input" placeholder="Enter your email" />
```


```xmlui /detailsDialog/
<!-- Modal with ID used by table action -->
<Table data="/api/clients">
  <Column bindTo="name" />
  <Column header="Details">
    <Icon name="doc-outline" onClick="detailsDialog.open($item)" />
  </Column>
</Table>

<ModalDialog id="detailsDialog" maxWidth="800px">
  <ClientDetails client="{$param}" />
</ModalDialog>
```

```xmlui
<!-- Dynamic IDs with data -->
<Items data="{posts}">
  <DataSource id="replyAccount-{$item.id}" url="/api/accounts/{$item.author_id}">
    <Text>Post by {$item.title}</Text>
  </DataSource>
</Items>
```

## when

Set `when` to `false` to prevent rendering of a component.

```xmlui
<Text when="{user.isLoggedIn}">Welcome back!</Text>
```

```xmlui
<Spinner when="{isLoading}">Loading...</Spinner>
```

## data

The `data` property makes external data available to a component. It's typically used with [List](/components/List), [Items](/components/Items), and [Table](/components/Table), but any component can receive data this way.

When the property is a reference to a `DataSource`, its value is the data returned from that `DataSource`.

```xmlui
<List data="{users}">
  <Text>{$item.name}</Text>
</List>
```

```xmlui
<Items data="{products}">
  <Card>
    <Text>{$item.title}</Text>
    <Text>{$item.price}</Text>
  </Card>
</Items>
```

When the property is a string, the value is interpreted as an URL that returns JSON.

```xmlui
<List data="https://api.tfl.gov.uk/line/mode/tube/status">
   <Text>{$item.name}: {$item.lineStatuses[0].statusSeverityDescription}</Text>
</List>
```

