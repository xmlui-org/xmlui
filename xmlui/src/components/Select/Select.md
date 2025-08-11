%-DESC-START

**Key features:**
- **Flexible selection modes**: Single selection by default, with optional multi-select capability
- **Option containers**: Uses Option components to define selectable items with separate values and labels
- **Search functionality**: Optional filtering to quickly find options in large lists
- **Custom templates**: Configurable option display, value presentation, and empty state templates
- **Dynamic options**: Supports both static [Option](/components/Option) children and dynamic lists via [Items](/components/Items).

## Using `Select`

The component accepts `Option` components as children defining a particular option's label-value pair.
`Option` requires a `value` property and while also having a `label` that is displayed in the list.
If the `label` is not specified `value` is shown.

```xmlui-pg copy display name="Example: using Select" height="200px"
<App>
  <Select>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

You can use `Select` with dynamic options:

```xmlui-pg copy display name="Example: using Select with dynamic options" height="200px"
<App>
  <Select>
    <Items data="{['one', 'two', 'three']}" >
      <Option value="{$itemIndex}" label="{$item}" />
    </Items>
  </Select>
</App>
```

%-DESC-END

%-PROP-START initialValue

```xmlui-pg copy display name="Example: initialValue" height="200px"
<App>
  <Select initialValue="opt3">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-PROP-END

%-PROP-START optionTemplate

```xmlui-pg copy display name="Example: optionTemplate" height="200px"
<App>
  <Select>
    <property name="optionTemplate">
      <HStack verticalAlignment="center" gap="$space-0_5">
        <Icon name="info" />
        <Text value="{$item.label}" variant="strong" />
      </HStack>
    </property>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-PROP-END

%-PROP-START placeholder

```xmlui-pg copy display name="Example: placeholder" height="200px"
<App>
  <Select placeholder="Please select an item">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-PROP-END

%-PROP-START validationStatus

```xmlui-pg copy display name="Example: validationStatus" height="280px"
<App>
  <Select />
  <Select validationStatus="valid" />
  <Select validationStatus="warning" />
  <Select validationStatus="error" />
</App>
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled"
<App>
  <Select enabled="false" />
</App>
```

%-PROP-END

%-PROP-START emptyListTemplate

Click on the second field to see the custom empty list indicator.

```xmlui-pg copy {9-11} display name="Example: emptyListTemplate" height="260px"
<App>
  <VStack>
    <Text value="Default:" />
    <Select />
  </VStack>
  <VStack>
    <Text value="Custom:" />
    <Select>
      <property name="emptyListTemplate">
        <Text variant="strong" value="Nothing to see here!" />
      </property>
    </Select>
  </VStack>
</App>
```

%-PROP-END

%-PROP-START dropdownHeight

```xmlui-pg copy display name="Example: dropdownHeight" height="300px"
<App>
  <Select dropdownHeight="180px">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
    <Option value="opt4" label="fourth"/>
    <Option value="opt5" label="fifth"/>
    <Option value="opt6" label="sixth"/>
    <Option value="opt7" label="seventh"/>
    <Option value="opt8" label="eighth"/>
    <Option value="opt9" label="ninth"/>
    <Option value="opt10" label="tenth"/>
    <Option value="opt11" label="eleventh"/>
    <Option value="opt12" label="twelfth"/>
  </Select>
</App>
```

%-PROP-END

%-PROP-START multiSelect

```xmlui-pg copy display name="Example: multiSelect" height="300px"
<App>
  <Select multiSelect="true" dropdownHeight="180px" >
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
    <Option value="opt4" label="fourth"/>
    <Option value="opt5" label="fifth"/>
    <Option value="opt6" label="sixth"/>
    <Option value="opt7" label="seventh"/>
    <Option value="opt8" label="eighth"/>
    <Option value="opt9" label="ninth"/>
    <Option value="opt10" label="tenth"/>
    <Option value="opt11" label="eleventh"/>
    <Option value="opt12" label="twelfth"/>
  </Select>
</App>
```

%-PROP-END

%-PROP-START optionLabelTemplate

In the template definition, you can use the `$item` context property to access the particular item's `label` and `value`.

```xmlui-pg copy {3-9} display name="Example: optionLabelTemplate" height="300px"
<App>
  <Select initialValue="{0}" placeholder="Select..." searchable>
    <property name="optionLabelTemplate">
      <HStack
        paddingHorizontal="$padding-tight"
        border="2px dotted $color-primary-500">
        <Text>{$item.label}</Text>
      </HStack>
    </property>
    <Option value="{0}" label="zero"/>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-PROP-END

%-PROP-START valueTemplate

In the template definition, you can use the `$item` context property to access the particular item's `label` and `value`.  The `$itemContext` property provides a `removeItem` method to delete a value from the current selection.

```xmlui-pg copy {3-15} display name="Example: valueTemplate" height="300px"
<App>
  <Select initialValue="{0}" placeholder="Select..." multiSelect>
    <property name="valueTemplate">
      <HStack
        paddingLeft="$padding-tight"
        border="2px dotted $color-primary-500"
        verticalAlignment="center">
        <Text>{$item.label}</Text>
        <Button
          variant="ghost"
          icon="close"
          size="xs"
          onClick="$itemContext.removeItem()"/>
      </HStack>
    </property>
    <Option value="{0}" label="zero"/>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-PROP-END

%-EVENT-START didChange

```xmlui-pg copy display name="Example: didChange" height="260px"
<App>
  <variable name="newValue" value="(none)" />
  <Text value="{newValue}" />
  <Select onDidChange="(newItem) => newValue = newItem">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

```xmlui-pg copy {5-6} display name="Example: gotFocus/lostFocus" height="260px"
<App>
  <variable name="isFocused" value="{false}" />
  <Text value="Input control is focused: {isFocused}" />
  <Select
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-EVENT-END

%-API-START focus

```xmlui-pg copy display name="Example: focus()" height="260px"
<App>
  <Button label="Focus Input" onClick="inputControl.focus()" />
  <Select id="inputControl">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

%-API-END

%-API-START setValue

```xmlui-pg copy display name="Example: setValue()" height="260px"
<App>
  <Select id="inputControl">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
  <HStack>
    <Button
      label="Select 2nd Item"
      onClick="inputControl.setValue('opt2')" />
    <Button
      label="Remove Selection"
      onClick="inputControl.setValue('')" />
  </HStack>
</App>
```

%-API-END
