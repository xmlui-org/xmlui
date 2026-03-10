# RadioGroup [#radiogroup]

`RadioGroup` creates a mutually exclusive selection interface where users can choose only one option from a group of radio buttons. It manages the selection state and ensures that selecting one option automatically deselects all others in the group.Radio options store their values as strings. Numbers and booleans are converted to strings when assigned, while objects, functions and arrays default to an empty string unless resolved via binding expressions.

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

### `initialValue` [#initialvalue]

> [!DEF]  default: **""**

This property sets the component's initial value.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

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

This event is triggered when value of RadioGroup has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the RadioGroup has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the RadioGroup has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `setValue` [#setvalue]

This API sets the value of the `RadioGroup`. You can use it to programmatically change the value.

**Signature**: `setValue(value: string): void`

- `value`: The new value to set.

### `value` [#value]

This API retrieves the current value of the `RadioGroup`. You can use it to get the value programmatically.

**Signature**: `get value(): string | undefined`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`label`**: The label displayed for the radio group.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-RadioGroup | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--disabled | $backgroundColor--disabled | $backgroundColor--disabled |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--active | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--default | $color-surface-500 | $color-surface-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--default--active | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--default--hover | $color-surface-700 | $color-surface-700 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--error | $borderColor-Input--error | $borderColor-Input--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--error | $borderColor-Input--error | $borderColor-Input--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--success | $borderColor-Input--success | $borderColor-Input--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--success | $borderColor-Input--success | $borderColor-Input--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--warning | $borderColor-Input--warning | $borderColor-Input--warning |
| [borderColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--warning | $borderColor-Input--warning | $borderColor-Input--warning |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-RadioGroupOption | 1px | 1px |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-RadioGroupOption-validation | 2px | 2px |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-RadioGroupOption | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-RadioGroupOption | $fontSize-sm | $fontSize-sm |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-RadioGroupOption | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-RadioGroupOption | $fontWeight-bold | $fontWeight-bold |
| [gap](/docs/styles-and-themes/common-units/#size)-RadioGroupOption | 0.25em | 0.25em |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-RadioGroupOption--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-RadioGroupOption--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-RadioGroupOption--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-RadioGroupOption--warning | *none* | *none* |
