# Switch [#switch]

`Switch` enables users to toggle between two states: on and off.

## Switch Values [#switch-values]

The `initialValue` and `value` properties of the switch are transformed to a Boolean value to display the on (`true`) or off (`false`) state with this logic:
- `null` and `undefined` go to `false`.
- If the property is Boolean, the property value is used as is.
- If it is a number, `NaN` and `0` result in `false`; other values represent `true`.
- If the property is a string, the empty string and the literal "false" string result in `false`; others result in `true`.
- The empty array value goes to `false`; other array values result in `true`.
- Object values with no properties result in `false`; other values represent `true`.

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

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

### `initialValue` (default: false) [#initialvalue-default-false]

This property sets the component's initial value.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

This property sets the label of the component.

```xmlui-pg copy display name="Example: label"
<App>
  <Switch label="Example label" initialValue="true" />
  <Switch label="Another label" intialValue="false" />
</App>
```

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `Switch` label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` (default: "end") [#labelposition-default-end]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) **(default)** |
| `top` | The top of the input |
| `bottom` | The bottom of the input |

```xmlui-pg copy display name="Example: labelPosition"
<App>
  <Switch label="Top label" labelPosition="top" initialValue="true" />
  <Switch label="End label" labelPosition="end" initialValue="true" />
  <Switch label="Bottom label" labelPosition="bottom" initialValue="true" />
  <Switch label="Start label" labelPosition="start" initialValue="true" />
</App>
```

### `labelWidth` [#labelwidth]

This property sets the width of the `Switch` component's label. If not defined, the label's width will be determined by its content and the available space.

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

If true, the value of the component cannot be modified.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <Switch readOnly="true" label="Checked" initialValue="true" />
  <Switch readOnly="true" label="Unchecked" intialValue="false" />
</App>
```

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

## Events [#events]

### `click` [#click]

This event is triggered when the Switch is clicked.

### `didChange` [#didchange]

This event is triggered when value of Switch has changed.

This event is triggered when the `Switch` is toggled due to user interaction.
A read-only switch never fires this event, and it won't fire if the switch's value is set programmatically.

```xmlui-pg copy display name="Example: didChange"
<App verticalAlignment="center" var.changes="">
  <Switch label="Changeable" onDidChange="changes += '+'" />
  <Switch label="Readonly" readOnly="true" onDidChange="changes += '-'" />
  <Text value="Changes: {changes}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the Switch has received the focus.

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

### `lostFocus` [#lostfocus]

This event is triggered when the Switch has lost the focus.

## Exposed Methods [#exposed-methods]

### `setValue` [#setvalue]

This API sets the value of the `Switch`. You can use it to programmatically change the value.

**Signature**: `setValue(value: boolean): void`

- `value`: The new value to set. Can be either true (on) or false (off).

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

### `value` [#value]

This property holds the current value of the Switch, which can be either "true" (on) or "false" (off).

**Signature**: `get value():boolean`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`input`**: The switch input area.
- **`label`**: The label displayed for the switch.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch-error | $borderColor-Switch-error | $borderColor-Switch-error |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch-error | $borderColor-Switch-error | $borderColor-Switch-error |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch-success | $borderColor-Switch-success | $borderColor-Switch-success |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch-success | $borderColor-Switch-success | $borderColor-Switch-success |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch-warning | $borderColor-Switch-warning | $borderColor-Switch-warning |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Switch-warning | $borderColor-Switch-warning | $borderColor-Switch-warning |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-checked-Switch | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-Switch | $color-surface-400 | $color-surface-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Switch | $color-surface-0 | $color-surface-0 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Switch | $color-surface-0 | $color-surface-0 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Switch--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Switch--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Switch-indicator--disabled | $backgroundColor-primary | $backgroundColor-primary |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch-error | $borderColor-Switch-error | $borderColor-Switch-error |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch-error | $borderColor-Switch-error | $borderColor-Switch-error |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch-success | $borderColor-Switch-success | $borderColor-Switch-success |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch-success | $borderColor-Switch-success | $borderColor-Switch-success |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch-warning | $borderColor-Switch-warning | $borderColor-Switch-warning |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Switch-warning | $borderColor-Switch-warning | $borderColor-Switch-warning |
| [borderColor](../styles-and-themes/common-units/#color)-Switch | $color-surface-200 | $color-surface-200 |
| [borderColor](../styles-and-themes/common-units/#color)-Switch | $color-surface-200 | $color-surface-200 |
| [borderColor](../styles-and-themes/common-units/#color)-Switch--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Switch-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Switch-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Switch-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Switch-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Switch | 1px | 1px |
| [outlineColor](../styles-and-themes/common-units/#color)-Switch--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Switch--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Switch--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Switch--focus | *none* | *none* |
