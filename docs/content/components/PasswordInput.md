# PasswordInput [#passwordinput]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `Password` component is a specialized version of the `TextBox` component that allows users to input and edit passwords.

## Properties [#properties]

### `autoFocus (default: false)` [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled (default: true)` [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `endIcon` [#endicon]

This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.

### `gap` [#gap]

This property defines the gap between the adornments and the input area.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

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

### `placeholder` [#placeholder]

A placeholder text that is visible in the input field when its empty.

### `readOnly (default: false)` [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` [#required]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `startIcon` [#starticon]

This property sets an icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets a text to appear at the start (left side when the left-to-right direction is set) of the input.

### `validationStatus (default: "none")` [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TextBox has changed.

### `gotFocus` [#gotfocus]

This event is triggered when the TextBox has received the focus.

### `lostFocus` [#lostfocus]

This event is triggered when the TextBox has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the TextBox.

### `setValue` [#setvalue]

You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

## Styling [#styling]

This component does not have any styles.
