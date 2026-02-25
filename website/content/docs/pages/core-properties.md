# Core Properties

These properties and events are built into the XMLUI rendering engine.

For behavior-based features like tooltips, animations, and bookmarks, see the **Behaviors** section on each component's documentation page.

## id

The `id` property assigns a unique identifier to a component. Other components can reference this identifier to call methods or read state.

```xmlui
<Button id="submit-button" onClick="{handleSubmit}">Submit</Button>
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

IDs can include expressions for dynamic values:

```xmlui
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

## onInit and onCleanup

The `onInit` event fires when a component is first rendered. The paired `onCleanup` event fires when the component is removed. These events work on any component.

```xmlui
<App var.loaded="{false}">
  <Button onInit="loaded = true" label="I'm loaded" />
  <Text when="{loaded}">Button has initialized</Text>
</App>
```

`onInit` and `onCleanup` also respond to `when` transitions. When `when` changes from `false` to `true`, `onInit` fires. When `when` changes from `true` to `false`, `onCleanup` fires.

```xmlui
<App var.showPanel="{false}">
  <Button label="Toggle" onClick="showPanel = !showPanel" />
  <Stack
    when="{showPanel}"
    onInit="console.log('Panel appeared')"
    onCleanup="console.log('Panel hidden')"
  >
    <Text>Panel content</Text>
  </Stack>
</App>
```

A component with `onInit` and `when="{false}"` still renders once so the init handler can run. This lets `onInit` change the condition that controls rendering:

```xmlui
<App var.ready="{false}">
  <Text when="{ready}" onInit="ready = true">Now visible</Text>
</App>
```

## data

The `data` property makes external data available to a component and its children. It's most commonly used with [List](/docs/reference/components/List), [Items](/docs/reference/components/Items), and [Table](/docs/reference/components/Table), but any component can receive data this way.

When the value references a `DataSource`, the component receives the data returned from that source:

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

When the value is a string, it is interpreted as a URL that returns JSON:

```xmlui
<List data="https://api.tfl.gov.uk/line/mode/tube/status">
   <Text>{$item.name}: {$item.lineStatuses[0].statusSeverityDescription}</Text>
</List>
```
