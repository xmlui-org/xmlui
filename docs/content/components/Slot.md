# Slot [#slot]

Placeholder in a reusable component. Signs the slot where the component's injected children should be rendered.

## Using Slot [#using-slot]

You can add `Slot` to a user-defined component as a placeholder. When you refer to the particular component in the markup, the children are transposed to the `Slot`.

```xmlui-pg name="Using Slot"
---app copy display {3-5}
<App name="XMLUI Hello World">
  <ActionBar>
    <Button label="Create" onClick="window.alert('Create clicked')" />
    <Button label="Edit" onClick="window.alert('Edit clicked')" />
    <Button label="Delete" onClick="window.alert('Delete clicked')" />
  </ActionBar>
</App>
---desc
The app flows down three buttons to the `ActionBar` to render.
---comp copy display {5}
<Component name="ActionBar">
  <Card>
    <H3>Use these actions</H3>
    <HStack>
      <Slot />
    </HStack>
  </Card>
</Component>
---desc
`ActionBar` renders the passed children by replacing `Slot` with them.
```

## Default Slot content [#default-slot-content]

You can provide default content for the `Slot`. If the user-defined component does not have any children, XMLUI will render the default content.

```xmlui-pg
---app copy display name="Define default Slot content"
<App>
  <ActionBar />
</App>
---comp copy display {6}
<Component name="ActionBar">
  <Card>
    <H3>Use these actions</H3>
    <HStack>
      <Slot>
        <Button label="Default" onClick="window.alert('Default clicked')" />
      </Slot>
    </HStack>
  </Card>
</Component>
```

## Named Slots [#named-slots]

You can add multiple slots to a user-defined component; you can have a default slot and several *named* slots. Slot names should end with `template`, and you can use the `<property>` markup syntax to declare their values.

```xmlui-pg
---app copy display name="Using named Slots" {4, 7, 9-11}
<App>
  <ActionBar>
    <property name="headerTemplate">
      <H2>Click one of these actions</H2>
    </property>
    <property name="footerTemplate">
      <Text>Footer content goes here</Text>
    </property>
    <Button label="Create" onClick="window.alert('Create clicked')" />
    <Button label="Edit" onClick="window.alert('Edit clicked')" />
    <Button label="Delete" onClick="window.alert('Delete clicked')" />
  </ActionBar>
</App>
---desc
This app passes a header template and a footer template slot to the `ActionBar` component and also declares buttons to render.
---comp copy display {3-5, 7-9, 11}
<Component name="ActionBar">
  <Card>
    <Slot name="headerTemplate">
      <H3>Use these actions</H3>
    </Slot>
    <HStack>
      <Slot>
        <Button label="Default" onClick="window.alert('Default clicked')" />
      </Slot>
    </HStack>
    <Slot name="footerTemplate" />
  </Card>
</Component>
---desc
XMLUI finds the appropriate slots by their name and transposes their content received from the app. Just like the default slot, named slots can have default content.
```

> [!WARN] XMLUI will display an error message when the `Slot` name does not end with "Template".

## Template properties [#template-properties]

The user-defined component can provide properties for the actual template.

```xmlui-pg
---app copy display name="Using template properties" /header/ /name="headerTemplate"/ /$processedHeader/
<App>
  <ActionBar header="Action Bar Example">
    <property name="headerTemplate">
      <Text variant="title">{$processedHeader}</Text>
    </property>
    <Button label="Create" onClick="window.alert('Create clicked')" />
    <Button label="Edit" onClick="window.alert('Edit clicked')" />
    <Button label="Delete" onClick="window.alert('Delete clicked')" />
  </ActionBar>
</App>
---desc
The app passes a `header` property value to the `ActionBar` component. `Actionbar` utilizes this property, transforms it, and passes it back to the template in the `$processedHeader` context variable so that the app can use it. `$processHeader` is available only within the `headerTemplate` slot.
---comp copy display /transformedHeader/ /processedHeader="{transformedHeader}"/
<Component name="ActionBar">
  <Card var.transformedHeader="*** {$props.header.toUpperCase()} ***">
    <Slot name="headerTemplate" processedHeader="{transformedHeader}" >
      <H3>{transformedHeader}</H3>
    </Slot>
    <HStack>
      <Slot>
        <Button label="Default" onClick="window.alert('Default clicked')" />
      </Slot>
    </HStack>
  </Card>
</Component>
---desc
`Actionbar` transforms the `header` property and stores it internally in the `transformedHeader` variable. It utilizes the value in the default header definition and also passes it back to the actual template definition with the `processedHeader` name. XMLUI creates the `$processedHeader` context variable from this name.
```

## Properties [#properties]

### `name` [#name]

This optional property defines the name of the slot.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
