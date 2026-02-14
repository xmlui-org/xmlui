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

## tooltip, tooltipMarkdown, and tooltipOptions

All visual components support tooltip properties. Add `tooltip` for plain text or `tooltipMarkdown` for formatted text.

```xmlui
<Button label="Save" tooltip="Save your changes" />
```

```xmlui
<Icon name="info" tooltipMarkdown="**Important**: Check the [docs](/pages/behaviors) for details" />
```

Use `tooltipOptions` to control placement and behavior. It accepts an object or a shorthand string.

```xmlui
<Button
  label="Hover me"
  tooltip="Below with arrow"
  tooltipOptions="{{ side: 'bottom', showArrow: true }}"
/>
```

The string form uses semicolons to separate options. Enumeration values (like `side` or `align`) can be set by name. Boolean values use the property name for `true` or prefix with `!` for `false`. Numeric values use a colon separator.

```xmlui
<Card
  title="Settings"
  tooltip="Configuration options"
  tooltipOptions="left; delayDuration: 800; showArrow"
/>
```

For full details on tooltip options, see the [Tooltip](/components/Tooltip) component and the [Behaviors](/pages/behaviors) page.

