%-DESC-START

## Switch Values

The `initialValue` and `value` properties of the switch are transformed to a Boolean value to display the on (`true`) or off (`false`) state with this logic:
- `null` and `undefined` go to `false`.
- If the property is Boolean, the property value is used as is.
- If it is a number, `NaN` and `0` result in `false`; other values represent `true`.
- If the property is a string, the empty string and the literal "false" string result in `false`; others result in `true`.
- The empty array value goes to `false`; other array values result in `true`.
- Object values with no properties result in `false`; other values represent `true`.

%-DESC-END

%-PROP-START enabled

This boolean property indicates whether the checkbox responds to user events (i.e. clicks);
it is `true` by default.

```xmlui-pg copy {4-5, 9-10} display name="Example: enabled"
<App>
  Enabled switches:
  <HStack>
    <Switch initialValue="true" enabled="true" />
    <Switch initialValue="false" enabled="true" />
  </HStack>
  Disabled switches:
  <HStack>
    <Switch initialValue="true" enabled="false" />
    <Switch initilaValue="false" enabled="false" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START label

This property sets the label of the component.

```xmlui-pg copy display name="Example: label"
<App>
  <Switch label="Example label" initialValue="true" />
  <Switch label="Another label" intialValue="false" />
</App>
```

%-PROP-END

%-PROP-START labelPosition

```xmlui-pg copy display name="Example: labelPosition"
<App>
  <Switch label="Top label" labelPosition="top" initialValue="true" />
  <Switch label="End label" labelPosition="end" initialValue="true" />
  <Switch label="Bottom label" labelPosition="bottom" initialValue="true" />
  <Switch label="Start label" labelPosition="start" initialValue="true" />
</App>
```

%-PROP-END

%-PROP-START readOnly

If true, the value of the component cannot be modified.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <Switch readOnly="true" label="Checked" initialValue="true" />
  <Switch readOnly="true" label="Unchecked" intialValue="false" />
</App>
```

%-PROP-END

%-API-START setValue

```xmlui-pg copy {10,13,15} display name="Example: value and setValue"
<App var.changes="">
  <Switch
    id="mySwitch"
    readOnly="true"
    label="This switch can be set only programmatically"
    onDidChange="changes += '+'" />
  <HStack>
    <Button
      label="Check"
      onClick="mySwitch.setValue(true)" />
    <Button
      label="Uncheck"
      onClick="mySwitch.setValue(false)" />
  </HStack>
  <Text>The switch is {checkbox.value ? "checked" : "unchecked"}</Text>
  <Text value="Changes: {changes}" />
</App>
```

%-API-END

%-EVENT-START didChange

This event is triggered when the `Switch` is toggled due to user interaction.
A read-only switch never fires this event, and it won't fire if the switch's value is set programmatically.

```xmlui-pg copy display name="Example: didChange"
<App verticalAlignment="center" var.changes="">
  <Switch label="Changeable" onDidChange="changes += '+'" />
  <Switch label="Readonly" readOnly="true" onDidChange="changes += '-'" />
  <Text value="Changes: {changes}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

This event is triggered when the `Switch` receives focus.

Click the `Switch` in the example demo to change the label text. Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4,5} display name="Example: gotFocus"
<App var.focused="{false}" verticalAlignment="center">
  <Switch
    value="true"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
  />
  <Text value="{focused === true ? 'I am focused!' : 'I have lost the focus!'}" />
</App>
```

%-EVENT-END

This event is triggered when the `Switch` loses focus.

(See the example above)

