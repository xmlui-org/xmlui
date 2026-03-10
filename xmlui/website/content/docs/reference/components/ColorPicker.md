# ColorPicker [#colorpicker]

`ColorPicker` enables users to choose colors by specifying RGB, HSL, or HEX values.

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

This event is triggered when value of ColorPicker has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the ColorPicker has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the ColorPicker has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the ColorPicker component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This method sets the current value of the ColorPicker.

**Signature**: `set value(value: string): void`

- `value`: The new value to set for the color picker.

### `value` [#value]

This method returns the current value of the ColorPicker.

**Signature**: `get value(): string`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ColorPicker | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--error--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--success--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--warning--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ColorPicker--warning--hover | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ColorPicker | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ColorPicker--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ColorPicker--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ColorPicker--warning | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-ColorPicker | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-ColorPicker--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-ColorPicker--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-ColorPicker--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-ColorPicker | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-ColorPicker--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-ColorPicker--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-ColorPicker--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--error--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--success--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--warning--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-ColorPicker--warning--hover | *none* | *none* |
| [height](/docs/styles-and-themes/common-units/#size-values)-ColorPicker | 1.5em | 1.5em |
| [height](/docs/styles-and-themes/common-units/#size-values)-ColorPicker | 1.5em | 1.5em |
| [width](/docs/styles-and-themes/common-units/#size-values)-ColorPicker | 3em | 3em |
| [width](/docs/styles-and-themes/common-units/#size-values)-ColorPicker | 3em | 3em |
