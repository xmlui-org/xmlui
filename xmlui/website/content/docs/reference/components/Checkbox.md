# Checkbox [#checkbox]

`Checkbox` allows users to make binary choices with a clickable box that shows checked/unchecked states. It's essential for settings, preferences, multi-select lists, and accepting terms or conditions.

## Use children as Content Template [#use-children-as-content-template]

The [inputTemplate](#inputtemplate) property can be replaced by setting the item template component directly as the Checkbox's child.
In the following example, the two Checkbox are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <Checkbox>
    <property name="inputTemplate">
      <Text>Template</Text>
    </property>
  </Checkbox>
  <!-- As this -->
  <Checkbox>
    <Text>Template</Text>
  </Checkbox>
</App>
```

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

### `indeterminate` [#indeterminate]

> [!DEF]  default: **false**

The `true` value of this property signals that the component is in an _intedeterminate state_.

### `initialValue` [#initialvalue]

> [!DEF]  default: **false**

This property sets the component's initial value.

### `inputTemplate` [#inputtemplate]

This property is used to define a custom checkbox input template

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

This event is triggered when the Checkbox is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

### `didChange` [#didchange]

This event is triggered when value of Checkbox has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the Checkbox has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the Checkbox has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `setValue` [#setvalue]

This method sets the current value of the Checkbox.

**Signature**: `set value(value: boolean): void`

- `value`: The new value to set for the checkbox.

### `value` [#value]

This method returns the current value of the Checkbox.

**Signature**: `get value(): boolean`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`input`**: The checkbox input area.
- **`label`**: The label displayed for the checkbox.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Checkbox | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Checkbox--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Checkbox--disabled | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Checkbox--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Checkbox--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Checkbox--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--error | $borderColor-Checkbox--error | $borderColor-Checkbox--error |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--error | $borderColor-Checkbox--error | $borderColor-Checkbox--error |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--success | $borderColor-Checkbox--success | $borderColor-Checkbox--success |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--success | $borderColor-Checkbox--success | $borderColor-Checkbox--success |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--warning | $borderColor-Checkbox--warning | $borderColor-Checkbox--warning |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--warning | $borderColor-Checkbox--warning | $borderColor-Checkbox--warning |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-Checkbox | $backgroundColor-primary | $backgroundColor-primary |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Checkbox--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox | $color-primary-500 | $color-primary-500 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--error | $borderColor-Checkbox--error | $borderColor-Checkbox--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--error | $borderColor-Checkbox--error | $borderColor-Checkbox--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--success | $borderColor-Checkbox--success | $borderColor-Checkbox--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--success | $borderColor-Checkbox--success | $borderColor-Checkbox--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--warning | $borderColor-Checkbox--warning | $borderColor-Checkbox--warning |
| [borderColor](/docs/styles-and-themes/common-units/#color)-checked-Checkbox--warning | $borderColor-Checkbox--warning | $borderColor-Checkbox--warning |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Checkbox | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Checkbox--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Checkbox--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Checkbox--warning | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Checkbox | $outlineColor--focus | $outlineColor--focus |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Checkbox--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Checkbox--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Checkbox--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Checkbox--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Checkbox | $outlineOffset--focus | $outlineOffset--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Checkbox--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Checkbox--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Checkbox--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Checkbox--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Checkbox | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Checkbox--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Checkbox--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Checkbox--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Checkbox--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Checkbox | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Checkbox--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Checkbox--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Checkbox--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Checkbox--warning--focus | *none* | *none* |
