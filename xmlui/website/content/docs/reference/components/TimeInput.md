# TimeInput [#timeinput]

`TimeInput` provides time input with support for 12-hour and 24-hour formats and configurable precision for hours, minutes, and seconds.

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

### `clearable` [#clearable]

> [!DEF]  default: **false**

Whether to show a clear button that allows clearing the selected time

### `clearIcon` [#clearicon]

The icon to display in the clear button.

### `clearToInitialValue` [#cleartoinitialvalue]

> [!DEF]  default: **false**

Whether the clear button resets the time input to its initial value

### `emptyCharacter` [#emptycharacter]

> [!DEF]  default: **"-"**

Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `gap` [#gap]

This property defines the gap between the adornments and the input area. If not set, the gap declared by the current theme is used.

### `hour24` [#hour24]

> [!DEF]  default: **true**

Whether to use 24-hour format (true) or 12-hour format with AM/PM (false)

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `maxTime` [#maxtime]

Maximum time that the user can select

### `minTime` [#mintime]

Minimum time that the user can select

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Whether the time input should be required

### `seconds` [#seconds]

> [!DEF]  default: **false**

Whether to show and allow input of seconds

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

### `validationStatus` [#validationstatus]

> [!DEF]  default: **"none"**

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TimeInput has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the TimeInput has received the focus.

**Signature**: `gotFocus(): void`

### `invalidTime` [#invalidtime]

Fired when the user enters an invalid time

**Signature**: `invalidTime(value: string): void`

- `value`: The invalid time value that was entered.

### `lostFocus` [#lostfocus]

This event is triggered when the TimeInput has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the TimeInput component.

**Signature**: `focus(): void`

### `isoValue` [#isovalue]

Get the current time value formatted in ISO standard (HH:MM:SS) using 24-hour format, suitable for JSON serialization.

**Signature**: `isoValue(): string | null`

### `setValue` [#setvalue]

This method sets the current value of the TimeInput.

**Signature**: `set value(value: any): void`

- `value`: The new time value to set for the time picker.

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`ampm`**: The AM/PM indicator.
- **`clearButton`**: The button to clear the time input.
- **`hour`**: The hour input field.
- **`minute`**: The minute input field.
- **`second`**: The second input field.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-input-TimeInput-invalid | rgba(220, 53, 69, 0.15) | rgba(220, 53, 69, 0.15) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-TimeInput--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-TimeInput--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-TimeInput | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-menu-TimeInput | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--hover | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-button-TimeInput | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-input-TimeInput | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-TimeInput | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TimeInput | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TimeInput--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TimeInput--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TimeInput--warning | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TimeInput | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TimeInput--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TimeInput--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TimeInput--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-TimeInput | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--error--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--success--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--warning--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TimeInput--warning--hover | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TimeInput | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TimeInput--error | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TimeInput--success | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TimeInput--warning | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-divider-TimeInput | $textColor-secondary | $textColor-secondary |
| disabledColor-button-TimeInput | $textColor-disabled | $textColor-disabled |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-ampm-TimeInput | inherit | inherit |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-input-TimeInput | inherit | inherit |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TimeInput--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TimeInput--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TimeInput--warning | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-adornment-TimeInput | *none* | *none* |
| hoverColor-button-TimeInput | $color-surface-800 | $color-surface-800 |
| [margin](/docs/styles-and-themes/common-units/#size-values)-icon-TimeInput | *none* | *none* |
| [margin](/docs/styles-and-themes/common-units/#size-values)-input-TimeInput | *none* | *none* |
| [maxHeight](/docs/styles-and-themes/common-units/#size-values)-menu-TimeInput | *none* | *none* |
| [minWidth](/docs/styles-and-themes/common-units/#size-values)-ampm-TimeInput | 2.2em | 2.2em |
| [minWidth](/docs/styles-and-themes/common-units/#size-values)-input-TimeInput | 0.54em | 0.54em |
| [opacity](/docs/styles-and-themes/common-units/#opacity)-item-TimeInput--disabled | *none* | *none* |
| [opacity](/docs/styles-and-themes/common-units/#opacity)-TimeInput--disabled | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-ampm-TimeInput--focused | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-button-TimeInput--focused | $color-accent-500 | $color-accent-500 |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TimeInput--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-ampm-TimeInput--focused | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-button-TimeInput--focused | 0 | 0 |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TimeInput--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TimeInput--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TimeInput--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TimeInput--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TimeInput--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TimeInput--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TimeInput--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TimeInput--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-ampm-TimeInput--focused | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-button-TimeInput--focused | 2px | 2px |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TimeInput--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-button-TimeInput | 4px 4px | 4px 4px |
| [padding](/docs/styles-and-themes/common-units/#size-values)-input-TimeInput | 0 2px | 0 2px |
| [padding](/docs/styles-and-themes/common-units/#size-values)-item-TimeInput | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TimeInput | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TimeInput | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TimeInput | $space-2 | $space-2 |
| spacing-divider-TimeInput | 1px 0 | 1px 0 |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-input-TimeInput | center | center |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--disabled | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TimeInput--warning--hover | *none* | *none* |
| [transition](/docs/styles-and-themes/common-units/#transition)-background-TimeInput | *none* | *none* |
| [width](/docs/styles-and-themes/common-units/#size-values)-input-TimeInput | 1.8em | 1.8em |
