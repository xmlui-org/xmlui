# Switch [#switch]

`Switch` enables users to toggle between two states: on and off.

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

> [!DEF]  default: **false**

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

### `click` [#click]

This event is triggered when the Switch is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

### `didChange` [#didchange]

This event is triggered when value of Switch has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the Switch has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the Switch has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `setValue` [#setvalue]

This API sets the value of the `Switch`. You can use it to programmatically change the value.

**Signature**: `setValue(value: boolean): void`

- `value`: The new value to set. Can be either true (on) or false (off).

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--error | $borderColor-Switch--error | $borderColor-Switch--error |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--error | $borderColor-Switch--error | $borderColor-Switch--error |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--success | $borderColor-Switch--success | $borderColor-Switch--success |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--success | $borderColor-Switch--success | $borderColor-Switch--success |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--warning | $borderColor-Switch--warning | $borderColor-Switch--warning |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--warning | $borderColor-Switch--warning | $borderColor-Switch--warning |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-checked-Switch | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-Switch | $color-surface-400 | $color-surface-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Switch | $color-surface-0 | $color-surface-0 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Switch | $color-surface-0 | $color-surface-0 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Switch--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Switch--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Switch-indicator--disabled | $backgroundColor-primary | $backgroundColor-primary |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--error | $borderColor-Switch--error | $borderColor-Switch--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--error | $borderColor-Switch--error | $borderColor-Switch--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--success | $borderColor-Switch--success | $borderColor-Switch--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--success | $borderColor-Switch--success | $borderColor-Switch--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--warning | $borderColor-Switch--warning | $borderColor-Switch--warning |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Switch--warning | $borderColor-Switch--warning | $borderColor-Switch--warning |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Switch--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Switch | 1px | 1px |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Switch | $outlineColor--focus | $outlineColor--focus |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Switch--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Switch | $outlineOffset--focus | $outlineOffset--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Switch--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Switch | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Switch--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Switch | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Switch--focus | *none* | *none* |
