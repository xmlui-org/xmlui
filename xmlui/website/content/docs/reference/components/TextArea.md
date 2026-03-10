# TextArea [#textarea]

`TextArea` provides a multiline text input area.

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

### `autoSize` [#autosize]

> [!DEF]  default: **false**

If set to `true`, this boolean property enables the `TextArea` to resize automatically based on the number of lines inside it.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `enterSubmits` [#entersubmits]

> [!DEF]  default: **true**

This optional boolean property indicates whether pressing the `Enter` key on the keyboard prompts the parent `Form` component to submit.

### `escResets` [#escresets]

> [!DEF]  default: **false**

This boolean property indicates whether the TextArea contents should be reset when pressing the ESC key.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `maxRows` [#maxrows]

This optional property sets the maximum number of text rows the `TextArea` can grow. If not set, the number of rows is unlimited.

### `minRows` [#minrows]

This optional property sets the minimum number of text rows the `TextArea` can shrink. If not set, the minimum number of rows is 1.

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `resize` [#resize]

This optional property specifies in which dimensions can the `TextArea` be resized by the user.

Available values:

| Value | Description |
| --- | --- |
| `(undefined)` | No resizing |
| `horizontal` | Can only resize horizontally |
| `vertical` | Can only resize vertically |
| `both` | Can resize in both dimensions |

### `rows` [#rows]

> [!DEF]  default: **2**

Specifies the number of rows the component initially has.

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

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TextArea has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the TextArea has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the TextArea has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the `TextArea` component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): string | undefined`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`endAdornment`**: The adornment displayed at the end of the text area.
- **`input`**: The text area input.
- **`label`**: The label displayed for the text area.
- **`startAdornment`**: The adornment displayed at the start of the text area.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--hover | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextArea | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextArea--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextArea--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextArea--warning | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextArea | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextArea--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextArea--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextArea--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--error--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--success--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--warning--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextArea--warning--hover | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextArea | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextArea--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextArea--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextArea--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextArea--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextArea--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextArea--warning | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextArea--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextArea--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextArea--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextArea--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextArea--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextArea--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextArea--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextArea--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextArea--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextArea--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TextArea | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TextArea | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TextArea | $space-2 | $space-2 |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextArea | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextArea--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextArea--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextArea--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--disabled | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextArea--warning--hover | *none* | *none* |
