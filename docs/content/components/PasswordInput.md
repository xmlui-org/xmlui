# PasswordInput [#passwordinput]

`Password` is a specialized [TextBox](/components/TextBox) that enables users to input and edit passwords.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **formBinding**: Binds input components directly to a Form when they have a 'bindTo' prop, without requiring a FormItem wrapper. This behavior adds form binding logic such as validation and state management to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **validation**: Adds validation functionality to input components with validation-related props (e.g., 'required', 'minLength', 'maxLength', etc.) by wrapping them with a ValidationWrapper component that handles validation logic and error display.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `autoFocus` [#autofocus]

-  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` [#enabled]

-  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `gap` [#gap]

This property defines the gap between the adornments and the input area. If not set, the gap declared by the current theme is used.

### `initialValue` [#initialvalue]

-  default: **""**

This property sets the component's initial value.

### `invalidMessages` [#invalidmessages]

The invalid messages to display for the input component.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `passwordHiddenIcon` [#passwordhiddenicon]

-  default: **"eye-off"**

The icon to display when the password is hidden (when showPasswordToggle is true).

### `passwordVisibleIcon` [#passwordvisibleicon]

-  default: **"eye"**

The icon to display when the password is visible (when showPasswordToggle is true).

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` [#readonly]

-  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

-  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `showPasswordToggle` [#showpasswordtoggle]

-  default: **false**

If `true`, a toggle button is displayed to switch between showing and hiding the password input.

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

### `validationIconError` [#validationiconerror]

Icon to display for error state when concise validation summary is enabled.

### `validationIconSuccess` [#validationiconsuccess]

Icon to display for valid state when concise validation summary is enabled.

### `validationStatus` [#validationstatus]

-  default: **"none"**

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TextBox has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the TextBox has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the TextBox has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the `TextBox` component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This API sets the value of the `TextBox`. You can use it to programmatically change the value.

**Signature**: `setValue(value: string): void`

- `value`: The new value to set. If the value is empty, it will clear the input.

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): string | undefined`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`endAdornment`**: The adornment displayed at the end of the text box.
- **`input`**: The text box input area.
- **`label`**: The label displayed for the text box.
- **`startAdornment`**: The adornment displayed at the start of the text box.

**Default part**: `input`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Input | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-Input--disabled | $backgroundColor--disabled | $backgroundColor--disabled |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextBox--warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Input--default | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor](../styles-and-themes/common-units/#color)-Input--default--hover | $borderColor-Input-default--hover | $borderColor-Input-default--hover |
| [borderColor](../styles-and-themes/common-units/#color)-Input--disabled | $borderColor--disabled | $borderColor--disabled |
| [borderColor](../styles-and-themes/common-units/#color)-Input--error | $borderColor-Input-default--error | $borderColor-Input-default--error |
| [borderColor](../styles-and-themes/common-units/#color)-Input--success | $borderColor-Input-default--success | $borderColor-Input-default--success |
| [borderColor](../styles-and-themes/common-units/#color)-Input--warning | $borderColor-Input-default--warning | $borderColor-Input-default--warning |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextBox--warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Input | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox--default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox--error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox--success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextBox--warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Input | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox--default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox--error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox--success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextBox--warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Input | 1px | 1px |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox--default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox--error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox--success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextBox--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextBox--warning--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-Input | $textColor-subtitle | $textColor-subtitle |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox--default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox--error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox--success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TextBox--warning | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-passwordToggle-Input | $textColor-subtitle | $textColor-subtitle |
| [color](../styles-and-themes/common-units/#color)-passwordToggle-TextBox | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-passwordToggle-TextBox--focus | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-passwordToggle-TextBox--hover | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextBox--default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextBox--error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextBox--success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextBox--warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox--default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox--error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox--success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextBox--warning | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-adornment-Input | $space-2 | $space-2 |
| [gap](../styles-and-themes/common-units/#size)-adornment-TextBox | *none* | *none* |
| [minHeight](../styles-and-themes/common-units/#size)-Input | 39px | 39px |
| [outlineColor](../styles-and-themes/common-units/#color)-Input--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Input--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox--default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox--error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox--success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextBox--warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Input--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox--default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox--error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox--success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextBox--warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Input--focus | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox--default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox--error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox--success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextBox--warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TextBox | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TextBox | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TextBox | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-passwordToggle-TextBox | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-TextBox | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-passwordToggle-TextBox | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TextBox | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TextBox | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TextBox | $space-2 | $space-2 |
| [textColor](../styles-and-themes/common-units/#color)-Input | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-Input--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-Input | $textColor-subtitle | $textColor-subtitle |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextBox--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextBox--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextBox--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextBox--warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextBox--warning--hover | *none* | *none* |
