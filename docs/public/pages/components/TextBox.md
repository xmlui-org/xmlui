# TextBox [#textbox]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `TextBox` is an input component that allows users to input and edit textual data.

## Properties [#properties]

### `autoFocus (default: false)` [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled (default: true)` [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <TextBox enabled="false" />
</App>
```

### `endIcon` [#endicon]

This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: endIcon"
<App>
  <TextBox endIcon="email" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `endText` [#endtext]

This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: endText"
<App>
  <TextBox endText=".com" />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `gap` [#gap]

This property defines the gap between the adornments and the input area.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <TextBox initialValue="Example text" />
</App>
```

### `label` [#label]

This property sets the label of the component.

### `labelBreak (default: false)` [#labelbreak-default-false]

This boolean value indicates if the `TextBox` labels can be split into multiple lines if it would overflow the available label width.

### `labelPosition (default: "top")` [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `TextBox`.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

Try to enter a longer value into the input field below.

```xmlui-pg copy display name="Example: maxLength"
<App>
  <TextBox maxLength="16" />
</App>
```

### `placeholder` [#placeholder]

A placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder"
<App>
  <TextBox placeholder="This is a placeholder" />
</App>
```

### `readOnly (default: false)` [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <TextBox initialValue="Example text" readOnly="true" />
</App>
```

### `required` [#required]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `startIcon` [#starticon]

This property sets an icon to appear at the start (left side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: startIcon"
<App>
  <TextBox startIcon="hyperlink" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `startText` [#starttext]

This property sets a text to appear at the start (left side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: startText"
<App>
  <TextBox startText="www." />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`endText`](#endtext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `validationStatus (default: "none")` [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <TextBox />
  <TextBox validationStatus="valid" />
  <TextBox validationStatus="warning" />
  <TextBox validationStatus="error" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TextBox has changed.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {3} display name="Example: didChange"
<App var.field="">
  <TextBox initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the TextBox has received the focus.

Clicking on the `TextBox` in the example demo changes the label text.
Note how clicking elsewhere resets the text to its original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App>
  <TextBox
    initialValue="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}"
  />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the TextBox has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the TextBox.

```xmlui-pg copy {2-3} display name="Example: focus"
<App>
  <Button label="Trigger Focus" onClick="inputComponent.focus()" />
  <TextBox id="inputComponent" />
</App>
```

### `setValue` [#setvalue]

You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).

```xmlui-pg copy {10} display name="Example: setValue"
<App var.changes="">
  <TextBox
    id="inputField"
    readOnly="true"
    onDidChange="changes++"
  />
  <HStack>
    <Button
      label="Check"
      onClick="inputField.setValue('example ')"
    />
    <Text value="Number of changes: {changes}" />
  </HStack>
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

In the example below, typing in the `TextBox` will also display the length of the text typed into it above the field:

```xmlui-pg copy {2-3} display name="Example: value"
<App>
  <Text value="TextBox content length: {inputComponent.value.length}" />
  <TextBox id="inputComponent" />
</App>
```

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox-warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox-warning--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox-warning | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-placeholder-TextBox-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-placeholder-TextBox-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-placeholder-TextBox-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-placeholder-TextBox-warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox-warning | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-adornment-TextBox | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox-warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TextBox-default | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TextBox-error | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TextBox-success | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TextBox-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox-warning--hover | *none* | *none* |
