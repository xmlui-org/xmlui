# Checkbox [#checkbox]

`Checkbox` allows users to make binary choices with a clickable box that shows checked/unchecked states. It's essential for settings, preferences, multi-select lists, and accepting terms or conditions.

**Key features:**
- **Flexible labeling**: Position labels on any side and support custom label templates
- **Validation support**: Built-in validation states for form error handling
- **Indeterminate state**: Special visual state for mixed selections (useful for "select all" scenarios)

To bind data to a `Checkbox`, use the XMLUI [Forms infrastructure](/forms).

## Checkbox Values [#checkbox-values]

The `initialValue` and `value` properties of the checkbox are transformed to a Boolean value to display the checked (`true`) or unchecked (`false`) state with this logic:
- `null` and `undefined` go to `false`.
- If the property is Boolean, the property value is used as is.
- If it is a number, `NaN` and `0` result in `false`; other values represent `true`.
- If the property is a string, the empty string and the literal "false" string result in `false`; others result in `true`.
- The empty array value goes to `false`; other array values result in `true`.
- Object values with no properties result in `false`; other values represent `true`.

## Use children as Content Template [#use-children-as-content-template]

The [inputTemplate](#inputtemplate) property can be replaced by setting the item template component directly as the Checkbox's child.
In the following example, the two Checkbox are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <Checkbox>
    <property name="inputTemplate">
      <Text>Template</Text>
    </property>
  </Checkbox>
  <!-- As this -->
  <Checkbox>
    <Text>Template</Text>
  </Checkbox>
</App>
```

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

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

### `indeterminate` (default: false) [#indeterminate-default-false]

The `true` value of this property signals that the component is in an _intedeterminate state_.

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

### `initialValue` (default: false) [#initialvalue-default-false]

This property sets the component's initial value.

### `inputTemplate` [#inputtemplate]

This property is used to define a custom checkbox input template

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

```xmlui-pg copy display name="Example: label"
<App>
  <Checkbox label="Example label" initialValue="true" />
  <Checkbox label="Another label" intialValue="false" />
</App>
```

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `Checkbox` label can be split into multiple lines if it would overflow the available label width.

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
  <Checkbox label="Top label" labelPosition="top" initialValue="true" />
  <Checkbox label="End label" labelPosition="end" initialValue="true" />
  <Checkbox label="Bottom label" labelPosition="bottom" initialValue="true" />
  <Checkbox label="Start label" labelPosition="start" initialValue="true" />
</App>
```

### `labelWidth` [#labelwidth]

This property sets the width of the `Checkbox` component's label. If not defined, the label's width will be determined by its content and the available space.

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

```xmlui-pg copy {3} display name="Example: readOnly"
<App>
  <Checkbox readOnly="true" label="Checked" initialValue="true" />
  <Checkbox readOnly="true" label="Unchecked" intialValue="false" />
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

### `didChange` [#didchange]

This event is triggered when value of Checkbox has changed.

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

### `gotFocus` [#gotfocus]

This event is triggered when the Checkbox has received the focus.

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

### `lostFocus` [#lostfocus]

This event is triggered when the Checkbox has lost the focus.

(See the example above)

## Exposed Methods [#exposed-methods]

### `setValue` [#setvalue]

This method sets the current value of the Checkbox.

**Signature**: `set value(value: boolean): void`
- `value`: The new value to set for the checkbox.

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

### `value` [#value]

This method returns the current value of the Checkbox.

**Signature**: `get value(): boolean`
You can query this read-only API property to query the checkbox's current value (`true`: checked, `false`: unchecked).

See an example in the `setValue` API method.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Checkbox--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Checkbox--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Checkbox-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Checkbox-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Checkbox-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Checkbox-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox-error | $borderColor-Checkbox-error | $borderColor-Checkbox-error |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox-error | $borderColor-Checkbox-error | $borderColor-Checkbox-error |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox-success | $borderColor-Checkbox-success | $borderColor-Checkbox-success |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox-success | $borderColor-Checkbox-success | $borderColor-Checkbox-success |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox-warning | $borderColor-Checkbox-warning | $borderColor-Checkbox-warning |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-Checkbox-warning | $borderColor-Checkbox-warning | $borderColor-Checkbox-warning |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-Checkbox | $backgroundColor-primary | $backgroundColor-primary |
| [borderColor](../styles-and-themes/common-units/#color)-Checkbox--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Checkbox-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Checkbox-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Checkbox-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Checkbox-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Checkbox-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox-error | $borderColor-Checkbox-error | $borderColor-Checkbox-error |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox-error | $borderColor-Checkbox-error | $borderColor-Checkbox-error |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox-success | $borderColor-Checkbox-success | $borderColor-Checkbox-success |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox-success | $borderColor-Checkbox-success | $borderColor-Checkbox-success |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox-warning | $borderColor-Checkbox-warning | $borderColor-Checkbox-warning |
| [borderColor](../styles-and-themes/common-units/#color)-checked-Checkbox-warning | $borderColor-Checkbox-warning | $borderColor-Checkbox-warning |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Checkbox-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Checkbox-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Checkbox-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Checkbox-warning | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Checkbox-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Checkbox-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Checkbox-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Checkbox-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Checkbox-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Checkbox-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Checkbox-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Checkbox-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Checkbox-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Checkbox-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Checkbox-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Checkbox-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Checkbox-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Checkbox-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Checkbox-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Checkbox-warning--focus | *none* | *none* |
