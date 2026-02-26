%-DESC-START

**Key features:**
- **Flexible labeling**: Position labels on any side and support custom label templates
- **Validation support**: Built-in validation states for form error handling
- **Indeterminate state**: Special visual state for mixed selections (useful for "select all" scenarios)

To bind data to a `Checkbox`, use the XMLUI [Forms infrastructure](/docs/forms).

## Checkbox Values

The `initialValue` and `value` properties of the checkbox are transformed to a Boolean value to display the checked (`true`) or unchecked (`false`) state with this logic:
- `null` and `undefined` go to `false`.
- If the property is Boolean, the property value is used as is.
- If it is a number, `NaN` and `0` result in `false`; other values represent `true`.
- If the property is a string, the empty string and the literal "false" string result in `false`; others result in `true`.
- The empty array value goes to `false`; other array values result in `true`.
- Object values with no properties result in `false`; other values represent `true`.

%-DESC-END

%-PROP-START enabled

```xmlui-pg copy display {4-5, 9-10} name="Example: enabled"
<App>
  Enabled checkboxes:
  <HStack>
    <Checkbox initialValue="true" enabled="true" />
    <Checkbox initialValue="false" enabled="true" />
  </HStack>
  Disabled checkboxes:
  <HStack>
    <Checkbox initialValue="true" enabled="false" />
    <Checkbox initilaValue="false" enabled="false" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START indeterminate

This prop is commonly used if there are several other checkboxes linked to one checkbox and some items in that group of checkboxes are in a mixed state: at least one item has a different value compared to the rest.

The following sample binds the state of two checkboxes to one and updates the state of the top checkbox accordingly. When the states of the bound checkboxes are different, the top checkbox is set to indeterminate:

```xmlui-pg copy display name="Example: indeterminate"
---app copy display {4}
<App var.indeterminate="{false}">
  <Checkbox
    label="Indeterminate Checkbox"
    indeterminate="{indeterminate}"
    initialValue="{cb1.value}"
    readOnly="true" />
  <ChangeListener
    listenTo="{ { v1: cb1.value, v2: cb2.value } }"
    onDidChange="indeterminate = cb1.value !== cb2.value" />
  Group of checkboxes:
  <HStack>
    <Checkbox label="Checkbox #1" id="cb1" initialValue="true" />
    <Checkbox label="Checkbox #2" id="cb2" initialValue="false" />
  </HStack>
</App>
---desc
Try this sample by clicking the bottom group of checkboxes.
```

%-PROP-END

%-PROP-START label

```xmlui-pg copy display name="Example: label"
<App>
  <Checkbox label="Example label" initialValue="true" />
  <Checkbox label="Another label" intialValue="false" />
</App>
```

%-PROP-END

%-PROP-START labelPosition

```xmlui-pg copy display name="Example: labelPosition"
<App>
  <Checkbox label="Top label" labelPosition="top" initialValue="true" />
  <Checkbox label="End label" labelPosition="end" initialValue="true" />
  <Checkbox label="Bottom label" labelPosition="bottom" initialValue="true" />
  <Checkbox label="Start label" labelPosition="start" initialValue="true" />
</App>
```

%-PROP-END

%-PROP-START readOnly

```xmlui-pg copy {3} display name="Example: readOnly"
<App>
  <Checkbox readOnly="true" label="Checked" initialValue="true" />
  <Checkbox readOnly="true" label="Unchecked" intialValue="false" />
</App>
```

%-PROP-END

%-API-START value

You can query this read-only API property to query the checkbox's current value (`true`: checked, `false`: unchecked).

See an example in the `setValue` API method.

%-API-END

%-API-START setValue

You can use this method to set the checkbox's current value programmatically (`true`: checked, `false`: unchecked).

```xmlui-pg copy {10,13,15} display name="Example: value and setValue"
<App var.changes="">
  <Checkbox
    id="checkbox"
    readOnly="true"
    label="This checkbox can be set only programmatically"
    onDidChange="changes += '+'" />
  <HStack>
    <Button
      label="Check"
      onClick="checkbox.setValue(true)" />
    <Button
      label="Uncheck"
      onClick="checkbox.setValue(false)" />
  </HStack>
  <Text>The checkbox is {checkbox.value ? "checked" : "unchecked"}</Text>
  <Text value="Changes: {changes}" />
</App>
```

%-API-END

%-EVENT-START didChange

```xmlui-pg copy display name="Example: didChange"
<App verticalAlignment="center" var.changes="">
  <Checkbox label="Changeable" onDidChange="changes += '+'" />
  <Checkbox 
    label="Readonly" 
    readOnly="true" 
    onDidChange="changes += '-'" />
  <Text value="Changes: {changes}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

Click the `Checkbox` in the example demo to change the label text. Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy display name="Example: gotFocus/lostFocus"
<App var.focused="{false}" verticalAlignment="center">
  <Checkbox
    value="true"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
  />
  <Text value="{focused === true ? 'I am focused!' : 'I have lost the focus!'}" />
</App>
```

%-EVENT-END

%-EVENT-START lostFocus

(See the example above)

%-EVENT-END
