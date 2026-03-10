# NumberBox [#numberbox]

`NumberBox` provides a specialized input field for numeric values with built-in validation, spinner buttons, and flexible formatting options. It supports both integer and floating-point numbers, handles empty states as null values, and integrates seamlessly with form validation.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Form Binding | `bindTo`, `initialValue`, `noSubmit` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `validationMode`, `verboseValidationFeedback` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `gap` [#gap]

This property defines the gap between the adornments and the input area.

### `hasSpinBox` [#hasspinbox]

> [!DEF]  default: **true**

This boolean prop shows (`true`) or hides (`false`) the spinner buttons for the input field.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `integersOnly` [#integersonly]

> [!DEF]  default: **false**

This boolean property signs whether the input field accepts integers only (`true`) or not (`false`).

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `maxValue` [#maxvalue]

> [!DEF]  default: **999999999999999**

The maximum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.If not set, no maximum value check is done.

### `minValue` [#minvalue]

> [!DEF]  default: **-999999999999999**

The minimum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.If not set, no minimum value check is done.

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `spinnerDownIcon` [#spinnerdownicon]

Allows setting an alternate icon displayed in the NumberBox spinner for decrementing values. You can change the default icon for all NumberBox instances with the "icon.spinnerDown:NumberBox" declaration in the app configuration file.

### `spinnerUpIcon` [#spinnerupicon]

Allows setting an alternate icon displayed in the NumberBox spinner for incrementing values. You can change the default icon for all NumberBox instances with the "icon.spinnerUp:NumberBox" declaration in the app configuration file.

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

### `step` [#step]

> [!DEF]  default: **1**

This prop governs how big the step when clicking on the spinner of the field.

### `validationIconError` [#validationiconerror]

Icon to display for error state when concise validation summary is enabled.

### `validationIconSuccess` [#validationiconsuccess]

Icon to display for valid state when concise validation summary is enabled.

### `validationStatus` [#validationstatus]

> [!DEF]  default: **"none"**

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

### `zeroOrPositive` [#zeroorpositive]

> [!DEF]  default: **false**

This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of NumberBox has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the NumberBox has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the NumberBox has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This API focuses the input field of the `NumberBox`. You can use it to programmatically focus the field.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This API sets the value of the `NumberBox`. You can use it to programmatically change the value.

**Signature**: `setValue(value: number | undefined): void`

### `value` [#value]

This API retrieves the current value of the `NumberBox`. You can use it to get the value programmatically.

**Signature**: `get value(): number | undefined`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`endAdornment`**: The adornment displayed at the end of the text box.
- **`input`**: The text box input area.
- **`label`**: The label displayed for the text box.
- **`spinnerButtonDown`**: The spinner button for decrementing the value.
- **`spinnerButtonUp`**: The spinner button for incrementing the value.
- **`startAdornment`**: The adornment displayed at the start of the text box.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--hover | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-NumberBox | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-NumberBox--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-NumberBox--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-NumberBox--warning | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-NumberBox | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-NumberBox--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-NumberBox--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-NumberBox--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--error--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--success--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--warning--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-NumberBox--warning--hover | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-NumberBox | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-NumberBox--error | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-NumberBox--focus | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-NumberBox--success | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-NumberBox--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-NumberBox--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-NumberBox--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-NumberBox--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-NumberBox | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-NumberBox--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-NumberBox--focus | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-NumberBox--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-NumberBox--warning | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-adornment-NumberBox | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-NumberBox--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-NumberBox--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-NumberBox--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-NumberBox--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-NumberBox--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-NumberBox--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-NumberBox--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-NumberBox--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-NumberBox--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-NumberBox--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-NumberBox | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-NumberBox | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-NumberBox | $space-2 | $space-2 |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--disabled | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NumberBox--warning--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-NumberBox | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-NumberBox--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-NumberBox--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-NumberBox--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-NumberBox--warning | *none* | *none* |
