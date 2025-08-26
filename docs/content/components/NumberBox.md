# NumberBox [#numberbox]

`NumberBox` provides a specialized input field for numeric values with built-in validation, spinner buttons, and flexible formatting options. It supports both integer and floating-point numbers, handles empty states as null values, and integrates seamlessly with form validation.

**Key features:**
- **Flexible numeric input**: Accepts integers, floating-point numbers, or empty values (stored as null)
- **Input constraints**: Configure minimum/maximum values, integer-only mode, and positive-only restrictions
- **Spinner buttons**: Built-in increment/decrement buttons with customizable step values and icons
- **Visual adornments**: Add icons or text to the start and end of the input field
- **Validation**: Built-in validation status indicators and form compatibility
- **Smart paste handling**: Only accepts pasted content that results in valid numeric values

The `NumberBox` is often used in forms. See the [this guide](/forms) for details.

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

If this boolean prop is set to true, the `NumberBox` input will be focused when appearing on the UI.

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

Controls whether the input field is enabled (`true`) or disabled (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <NumberBox enabled="false" />
</App>
```

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

This string prop enables the display of an icon on the right side (left-to-right display) of the input field by providing a valid [icon name]().

```xmlui-pg copy display name="Example: endIcon"
<App>
  <NumberBox endIcon="email" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

This string prop enables the display of a custom string on the right side (left-to-right display) of the input field.

```xmlui-pg copy display name="Example: endText"
<App>
  <NumberBox endText=".com" />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `gap` [#gap]

This property defines the gap between the adornments and the input area.

### `hasSpinBox` (default: true) [#hasspinbox-default-true]

This boolean prop shows (`true`) or hides (`false`) the spinner buttons for the input field.

```xmlui-pg copy display name="Example: hasSpinBox"
<App>
  <NumberBox hasSpinBox="true" initialValue="3" />
  <NumberBox hasSpinBox="false" initialValue="34" />
</App>
```

### `initialValue` [#initialvalue]

This property sets the component's initial value.

The initial value displayed in the input field.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <NumberBox initialValue="123" />
</App>
```

### `integersOnly` (default: false) [#integersonly-default-false]

This boolean property signs whether the input field accepts integers only (`true`) or not (`false`).

```xmlui-pg copy display name="Example: integersOnly"
<App>
  <NumberBox integersOnly="true" initialValue="42" />
  <NumberBox integersOnly="false" initialValue="{Math.PI}" />
</App>
```

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `NumberBox` label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` (default: "top") [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `NumberBox` component's label. If not defined, the label's width will be determined by its content and the available space.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `maxValue` (default: 999999999999999) [#maxvalue-default-999999999999999]

The maximum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.If not set, no maximum value check is done.

The maximum value the input field allows.
Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`,
otherwise it can only be an integer.

Try to enter a bigger value into the input field below than the maximum allowed.

```xmlui-pg copy display name="Example: maxValue"
<App>
  <NumberBox maxValue="100" initialValue="99" />
</App>
```

### `minValue` (default: -999999999999999) [#minvalue-default-999999999999999]

The minimum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.If not set, no minimum value check is done.

Try to enter a bigger value into the input field below than the minimum allowed.

```xmlui-pg copy display name="Example: minValue"
<App>
  <NumberBox minValue="-100" initialValue="-99" />
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

A placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder"
<App>
  <NumberBox placeholder="This is a placeholder" />
</App>
```

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

If true, the component's value cannot be modified with user interactions.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <NumberBox initialValue="123" readOnly="true" />
</App>
```

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `spinnerDownIcon` [#spinnerdownicon]

Allows setting an alternate icon displayed in the NumberBox spinner for decrementing values. You can change the default icon for all NumberBox instances with the "icon.spinnerDown:NumberBox" declaration in the app configuration file.

### `spinnerUpIcon` [#spinnerupicon]

Allows setting an alternate icon displayed in the NumberBox spinner for incrementing values. You can change the default icon for all NumberBox instances with the "icon.spinnerUp:NumberBox" declaration in the app configuration file.

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

This string prop enables the display of an icon on the left side (left-to-right display) of the input field by providing a valid [icon name]().

```xmlui-pg copy display name="Example: startIcon"
<App>
  <NumberBox startIcon="hyperlink" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

This string prop enables the display of a custom string on the left side (left-to-right display) of the input field.

```xmlui-pg copy display name="Example: startText"
<App>
  <NumberBox startText="www." />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`endText`](#endtext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `step` (default: 1) [#step-default-1]

This prop governs how big the step when clicking on the spinner of the field.

The default stepping value is **1**.

Note that only integers are allowed to be entered.

```xmlui-pg copy display name="Example: step"
<App>
  <NumberBox initialValue="10" step="10" />
</App>
```

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

This prop is used to visually indicate status changes reacting to form field validation.

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <NumberBox />
  <NumberBox validationStatus="valid" />
  <NumberBox validationStatus="warning" />
  <NumberBox validationStatus="error" />
</App>
```

### `zeroOrPositive` (default: false) [#zeroorpositive-default-false]

This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).

This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).
By default, this property is set to `false`.

```xmlui-pg copy display name="Example: zeroOrPositive"
<App>
  <NumberBox initialValue="123" zeroOrPositive="true" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of NumberBox has changed.

This event is triggered after the user has changed the field value.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="0">
  <NumberBox initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the NumberBox has received the focus.

This event is triggered when the `NumberBox` receives focus. The following sample demonstrates this event.

```xmlui-pg
---app copy {3-4} display name="Example: gotFocus"
<App var.focused="{false}">
  <NumberBox
    onGotFocus="focused = true"
    onLostFocus="focused = false" />
  <Text>The NumberBox is {focused ? '' : 'not'} focused</Text>
</App>
---desc
Click into the `NumberBox` (and then click the text below):
```

### `lostFocus` [#lostfocus]

This event is triggered when the NumberBox has lost the focus.

This event is triggered when the `NumberBox` loses focus.

(See the example above)

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This API focuses the input field of the `NumberBox`. You can use it to programmatically focus the field.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This API sets the value of the `NumberBox`. You can use it to programmatically change the value.

**Signature**: `setValue(value: number | undefined): void`

You can use this method to set the component's current value programmatically.

```xmlui-pg copy {3, 9, 12} display name="Example: value and setValue"
<App>
  <NumberBox
    id="numberbox"
    readOnly="true"
  />
  <HStack>
    <Button
      label="Set to 100"
      onClick="numberbox.setValue(100)" />
    <Button
      label="Set to 0"
      onClick="numberbox.setValue(0)" />
  </HStack>
</App>
```

### `value` [#value]

This API retrieves the current value of the `NumberBox`. You can use it to get the value programmatically.

**Signature**: `get value(): number | undefined`

You can query this read-only API property to get the input component's current value.

See an example in the `setValue` API method.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NumberBox-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NumberBox-warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-NumberBox-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-NumberBox-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-NumberBox-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-NumberBox-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NumberBox-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NumberBox-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NumberBox-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NumberBox-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NumberBox-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NumberBox-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NumberBox-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NumberBox-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NumberBox-warning--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-NumberBox-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-NumberBox-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-NumberBox-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-NumberBox-warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-NumberBox-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-NumberBox-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-NumberBox-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-NumberBox-warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-NumberBox-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-NumberBox-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-NumberBox-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-NumberBox-warning | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-adornment-NumberBox | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-NumberBox-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-NumberBox-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-NumberBox-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-NumberBox-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-NumberBox-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-NumberBox-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-NumberBox-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-NumberBox-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-NumberBox-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-NumberBox-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-NumberBox-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-NumberBox-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-NumberBox-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-NumberBox-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-NumberBox-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-NumberBox-warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-NumberBox | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-NumberBox | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-NumberBox | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-NumberBox | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-NumberBox | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-NumberBox | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-NumberBox | $space-2 | $space-2 |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NumberBox-warning--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-NumberBox-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-NumberBox-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-NumberBox-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-NumberBox-warning | *none* | *none* |
