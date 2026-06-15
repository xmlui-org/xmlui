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

## Lifecycle: onMount and onUnmount

The `onMount` event fires when a component enters the displayed XMLUI tree. The paired `onUnmount` event fires when the component leaves it. These events work on any component.

The older `onInit` and `onCleanup` names still work as compatibility aliases for `onMount` and `onUnmount`. Prefer the canonical names in new code.

```xmlui
<App var.loaded="{false}">
  <Button onMount="loaded = true" label="I'm loaded" />
  <Text when="{loaded}">Button has mounted</Text>
</App>
```

Lifecycle events also respond to `when` transitions. When `when` changes from `false` to `true`, `onMount` fires. When `when` changes from `true` to `false`, `onUnmount` fires.

```xmlui
<App var.showPanel="{false}">
  <Button label="Toggle" onClick="showPanel = !showPanel" />
  <Stack
    when="{showPanel}"
    onMount="console.log('Panel appeared')"
    onUnmount="console.log('Panel hidden')"
  >
    <Text>Panel content</Text>
  </Stack>
</App>
```

Lifecycle handlers run once per visibility cycle, not once for the lifetime of the markup node:

| Situation | Lifecycle behavior |
| --- | --- |
| `when` is omitted or initially truthy | `onMount` fires once after the component mounts |
| `when` is initially falsy | No lifecycle handler fires yet |
| `when` changes from falsy to truthy | `onMount` fires |
| `when` changes from truthy to falsy | `onUnmount` fires |
| A visible parent unmounts, such as during navigation | `onUnmount` fires once |
| The component re-renders while remaining visible | Lifecycle handlers do not fire again |

One subtle implementation detail: when a component has `onMount` or legacy `onInit` and its `when` value is false, XMLUI may keep a lightweight internal lifecycle wrapper alive so it can detect a later `false` -> `true` transition. The component itself is not rendered, its children are not rendered, and `onMount` does not fire until the effective `when` value becomes true.

```xmlui
<App var.ready="{false}">
  <!-- This handler does not run while ready is false. -->
  <Text when="{ready}" onMount="console.log('Now visible')">Now visible</Text>
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
