# User-defined components

You can define your own components, pass properties to them, and use them interchangeably with core components. When you find yourself writing a component with more than a few dozen lines of XMLUI markup, consider refactoring in order to name and package the key blocks of code. This strategy not only enables reuse but, just as importantly, ensures that the refactored component will be easy to read and maintain.

Such refactoring requires you to create and name new `.xmlui` files, identify inline elements that need to be passed as properties from a refactored component, and use those properties in newly-created subcomponents. Historically that kind of overhead has been a disincentive to refactoring in any programming environment. Now you can often outsource that gruntwork to AI assistants. It works particularly well with XMLUI, we use this strategy extensively, and we highly recommend it.

Here's a simple component to package a name/value pair.

```xmlui-pg display noHeader
---app display
<App>
  <NameValue name="Mary" value="123" />
</App>
---comp display
<Component name="NameValue">
  <Card width="20%">
    <Text>Name: { $props.name} </Text>
    <Text>Value: { $props.value} </Text>
  </Card>
</Component>
```

The component's name must start with an uppercase letter followed by letters, digits, the underscore (`_`), or the dollar sign (`$`) character. Components must be placed into separate files in the `components` folder within the app's root folder. The component's name must match its filename.

Here's how you can define default values for properties.

```xmlui
<Component name="NameValue">
  <Card width="20%">
    <Text>Name: { $props.name ?? '[no name]' } </Text>
    <Text>Value: { $props.value ?? '[no value]' } </Text>
  </Card>
</Component>
```

## Events

The `<IncButton>` component increments its value for every click, and notifies its environment by firing an event. The event's handler receives the current counter as an event parameter.

```xmlui-pg noHeader
---app display
<App>
  <Card width="30%">
    <variable name="text" value=""/>
    <IncButton onIncremented="(clickCount) => text += ' ' + clickCount" />
    <Text value="{text}" />
  </Card>
</App>
---comp display
<Component name="IncButton">
  <variable name="count" value="{0}" />
  <Button
    label="Click to increment: {count}"
    onClick="count++; emitEvent('incremented', count)"
  />
</Component>
```

## Methods

The `<UsingInternalModal>` component exports the `open` method of the `ModalDialog` that it defines.

```xmlui-pg noHeader
---app display
<App height="300px" >
  <UsingInternalModal id="component"/>
  <Button label="Open the internal dialog" onClick="component.openDialog()" />
</App>
---comp display
<Component name="UsingInternalModal">
  <ModalDialog id="dialog" title="Example Dialog">
    <Button label="Close Dialog" onClick="dialog.close()" />
  </ModalDialog>

  <H1>Using an Internal Modal Dialog</H1>

  <method name="openDialog">
    console.log('internal method called')
    dialog.open();
  </method>
</Component>
```

## Passing data into slot content

A component can pass data back to the slot content that the parent provides. This is how reusable container components expose per-item context to their callers.

Add extra attributes to the `<Slot>` tag. Each attribute becomes a context variable (prefixed with `$`) inside the parent's template content.

```xmlui-pg noHeader
---app display
<App>
  <StatusList
    items="{[
      { label: 'Build', ok: true },
      { label: 'Tests', ok: false },
      { label: 'Deploy', ok: true }
    ]}"
  >
    <property name="rowTemplate">
      <HStack>
        <Icon name="{$item.ok ? 'check' : 'close'}" />
        <Text>{$item.label}</Text>
      </HStack>
    </property>
  </StatusList>
</App>
---comp display
<Component name="StatusList">
  <Items data="{$props.items}">
    <Slot name="rowTemplate" item="{$item}">
      <Text>{$item.label}</Text>
    </Slot>
  </Items>
</Component>
```

Inside `StatusList`, `item="{$item}"` on the `<Slot>` passes each list item as a slot prop. The parent's `<property name="rowTemplate">` block receives it as `$item`.

> [!NOTE]
> Named slot names must end with **`Template`** (e.g. `rowTemplate`, `headerTemplate`). XMLUI shows an error if the name does not end with `Template`.
