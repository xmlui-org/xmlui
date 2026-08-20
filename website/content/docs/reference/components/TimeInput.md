# TimeInput [#timeinput]

`TimeInput` provides time input with support for 12-hour and 24-hour formats and configurable precision for hours, minutes, and seconds.

**Key features:**
- **Time format support**: 12-hour and 24-hour formats with customizable display
- **Precision control**: Configure precision for hours, minutes, and seconds
- **Input validation**: Real-time validation with visual feedback for invalid times
- **Accessibility**: Full keyboard navigation and screen reader support
- **Localization**: Automatic AM/PM labels based on user locale

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Form Binding | `bindTo`, `initialValue`, `noSubmit` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `requiredInvalidMessage`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `matchValue`, `matchInvalidMessage`, `validationMode`, `customValidationsDebounce`, `validationDisplayDelay`, `verboseValidationFeedback`, `validate` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `clearable` [#clearable]

> [!DEF]  default: **false**

Whether to show a clear button that allows clearing the selected time

When enabled, it displays a clear button that allows users to clear the time input. Change the time value in this app and then click the clear button:

```xmlui-pg copy display name="Example: clearable" /clearable/
<App>
  <TimeInput initialValue="11:30" />
  <TimeInput clearable="true" initialValue="10:20" />
</App>
```

### `clearIcon` [#clearicon]

The icon to display in the clear button.

```xmlui-pg copy display name="Example: clearIcon" /clearIcon/
<App>
  <TimeInput initialValue="11:30" clearIcon="trash" />
</App>
```

### `clearToInitialValue` [#cleartoinitialvalue]

> [!DEF]  default: **false**

Whether the clear button resets the time input to its initial value

### `emptyCharacter` [#emptycharacter]

> [!DEF]  default: **"-"**

Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'

Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'.

```xmlui-pg copy display name="Example: emptyCharacter"
<App>
  <TimeInput emptyCharacter="." />
  <TimeInput emptyCharacter="*" />
  <TimeInput emptyCharacter="abc" />
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <TimeInput enabled="false" initialValue="14:30" />
</App>  
```

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

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <TimeInput initialValue="14:30:15" />
</App>  
```

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

Marks the time input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <TimeInput required="true" />
</App>
```

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
| `none` | No validation indicator (default state) **(default)** |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <TimeInput validationStatus="valid" initialValue="11:30" />
  <TimeInput validationStatus="warning" initialValue="11:30" />
  <TimeInput validationStatus="error" initialValue="11:30" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TimeInput has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Fired when the time value changes. Receives the new time value as a parameter.

> [!INFO] The time value changes when the edited input part (hour, minute, second) loses focus or the AM/PM selectro changes.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.selectedTime="No time selected">
  <Text value="{selectedTime}" />
  <TimeInput 
    format="h:m:s a"
    initialValue="07:30:05" 
    onDidChange="(time) => selectedTime = time" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the TimeInput has received the focus.

**Signature**: `gotFocus(): void`

Fired when the time picker receives focus.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App var.isFocused="{false}">
  <Text value="{isFocused 
    ? 'TimeInput focused' : 'TimeInput lost focus'}" 
  />
  <TimeInput
    format="HH:mm:ss a"
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
    initialValue="14:30"
  />
</App>
```

### `invalidTime` [#invalidtime]

Fired when the user enters an invalid time

**Signature**: `invalidTime(value: string): void`

- `value`: The invalid time value that was entered.

Fired when the user enters an invalid time value.

```xmlui-pg copy {2} display name="Example: invalidTime"
<App var.errorMessage="">
  <Text value="{errorMessage}" />
  <TimeInput 
    onInvalidTime="(error) => errorMessage = 'Invalid time entered'"
    onDidChange="errorMessage = ''" />
</App>
```

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

```xmlui-pg copy {3, 9, 12} display name="Example: setValue"
<App>
  <HStack>
    <Button
      label="Set Time to 14:30"
      onClick="picker.setValue('14:30')" />
    <Button
      label="Remove Time"
      onClick="picker.setValue('')" />
  </HStack>
  <TimeInput id="picker" />
</App>
```

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
| [backgroundColor-input-TimeInput-invalid](/docs/styles-and-themes/common-units/#color) | rgba(220, 53, 69, 0.15) | rgba(220, 53, 69, 0.15) |
| [backgroundColor-item-TimeInput--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-item-TimeInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-menu-TimeInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TimeInput--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-menu-TimeInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TimeInput--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRadius-button-TimeInput](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-input-TimeInput](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-menu-TimeInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TimeInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TimeInput--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TimeInput--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TimeInput--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-TimeInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TimeInput--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TimeInput--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TimeInput--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TimeInput--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TimeInput--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TimeInput--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-menu-TimeInput](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--error--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--success--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TimeInput--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [color-adornment-TimeInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-TimeInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-TimeInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-TimeInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-divider-TimeInput](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| disabledColor-button-TimeInput | $textColor-disabled | $textColor-disabled |
| [fontSize-ampm-TimeInput](/docs/styles-and-themes/common-units/#size-values) | inherit | inherit |
| [fontSize-input-TimeInput](/docs/styles-and-themes/common-units/#size-values) | inherit | inherit |
| [fontSize-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TimeInput--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TimeInput--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TimeInput--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [gap-adornment-TimeInput](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| hoverColor-button-TimeInput | $color-surface-800 | $color-surface-800 |
| [margin-icon-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [margin-input-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [maxHeight-menu-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [minHeight-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [minWidth-ampm-TimeInput](/docs/styles-and-themes/common-units/#size-values) | 2.2em | 2.2em |
| [minWidth-input-TimeInput](/docs/styles-and-themes/common-units/#size-values) | 0.54em | 0.54em |
| [opacity-item-TimeInput--disabled](/docs/styles-and-themes/common-units/#opacity) | *none* | *none* |
| [opacity-TimeInput--disabled](/docs/styles-and-themes/common-units/#opacity) | *none* | *none* |
| [outlineColor-ampm-TimeInput--focused](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-button-TimeInput--focused](/docs/styles-and-themes/common-units/#color) | $color-accent-500 | $color-accent-500 |
| [outlineColor-TimeInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-TimeInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-TimeInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-ampm-TimeInput--focused](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-button-TimeInput--focused](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [outlineOffset-TimeInput--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-TimeInput--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-TimeInput--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-TimeInput--error--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-TimeInput--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-TimeInput--success--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-ampm-TimeInput--focused](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-button-TimeInput--focused](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [outlineWidth-TimeInput--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-TimeInput--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-TimeInput--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-button-TimeInput](/docs/styles-and-themes/common-units/#size-values) | 4px 4px | 4px 4px |
| [padding-input-TimeInput](/docs/styles-and-themes/common-units/#size-values) | 0 2px | 0 2px |
| [padding-item-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TimeInput](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingLeft-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TimeInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TimeInput](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| spacing-divider-TimeInput | 1px 0 | 1px 0 |
| [textAlign-input-TimeInput](/docs/styles-and-themes/common-units/#text-align) | center | center |
| [textColor-TimeInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TimeInput--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [transition-background-TimeInput](/docs/styles-and-themes/common-units/#transition) | *none* | *none* |
| [width-input-TimeInput](/docs/styles-and-themes/common-units/#size-values) | 1.8em | 1.8em |
