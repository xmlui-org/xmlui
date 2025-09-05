# TimeInput [#timeinput]

`TimeInput` provides time input with support for 12-hour and 24-hour formats and configurable precision for hours, minutes, and seconds.

**Key features:**
- **Time format support**: 12-hour and 24-hour formats with customizable display
- **Precision control**: Configure precision for hours, minutes, and seconds
- **Input validation**: Real-time validation with visual feedback for invalid times
- **Accessibility**: Full keyboard navigation and screen reader support
- **Localization**: Automatic AM/PM labels based on user locale

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `clearable` (default: false) [#clearable-default-false]

Whether to show a clear button that allows clearing the selected time

When enabled, it displays a clear button that allows users to reset the time picker back to its initial value. Change the time value in this app and then click the clear button:

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

### `clearToInitialValue` (default: true) [#cleartoinitialvalue-default-true]

Whether the clear button resets the time input to its initial value

### `emptyCharacter` (default: "-") [#emptycharacter-default-]

Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'

Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'.

```xmlui-pg copy display name="Example: emptyCharacter"
<App>
  <TimeInput emptyCharacter="." />
  <TimeInput emptyCharacter="*" />
  <TimeInput emptyCharacter="abc" />
</App>
```

### `enabled` (default: true) [#enabled-default-true]

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

### `hour24` (default: true) [#hour24-default-true]

Whether to use 24-hour format (true) or 12-hour format with AM/PM (false)

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <TimeInput initialValue="14:30:15" />
</App>  
```

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `TimeInput` label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` (default: "top") [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `TimeInput` component's label. If not defined, the label's width will be determined by its content and the available space.

### `maxTime` [#maxtime]

Maximum time that the user can select

### `minTime` [#mintime]

Minimum time that the user can select

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` (default: false) [#required-default-false]

Whether the time input should be required

Marks the time input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <TimeInput required="true" />
</App>
```

### `seconds` (default: false) [#seconds-default-false]

Whether to show and allow input of seconds

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
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
| [backgroundColor](../styles-and-themes/common-units/#color)-input-TimeInput-invalid | rgba(220, 53, 69, 0.15) | rgba(220, 53, 69, 0.15) |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-TimeInput--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-TimeInput--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-TimeInput | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimeInput-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-menu-TimeInput | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimeInput-warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-button-TimeInput | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-input-TimeInput | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-TimeInput | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimeInput-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimeInput-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimeInput-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimeInput-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimeInput-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimeInput-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimeInput-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimeInput-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimeInput-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimeInput-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimeInput-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimeInput-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-TimeInput | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimeInput-warning--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimeInput-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimeInput-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimeInput-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimeInput-warning | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-divider-TimeInput | $textColor-secondary | $textColor-secondary |
| disabledColor-button-TimeInput | $textColor-disabled | $textColor-disabled |
| [fontSize](../styles-and-themes/common-units/#size)-ampm-TimeInput | inherit | inherit |
| [fontSize](../styles-and-themes/common-units/#size)-input-TimeInput | inherit | inherit |
| [gap](../styles-and-themes/common-units/#size)-adornment-TimeInput | *none* | *none* |
| hoverColor-button-TimeInput | $color-surface-800 | $color-surface-800 |
| [margin](../styles-and-themes/common-units/#size)-icon-TimeInput | *none* | *none* |
| [margin](../styles-and-themes/common-units/#size)-input-TimeInput | *none* | *none* |
| [maxHeight](../styles-and-themes/common-units/#size)-menu-TimeInput | *none* | *none* |
| [minWidth](../styles-and-themes/common-units/#size)-ampm-TimeInput | 2.2em | 2.2em |
| [minWidth](../styles-and-themes/common-units/#size)-input-TimeInput | 0.54em | 0.54em |
| [opacity](../styles-and-themes/common-units/#opacity)-item-TimeInput--disabled | *none* | *none* |
| [opacity](../styles-and-themes/common-units/#opacity)-TimeInput--disabled | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-ampm-TimeInput--focused | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-button-TimeInput--focused | $color-accent-500 | $color-accent-500 |
| [outlineColor](../styles-and-themes/common-units/#color)-TimeInput-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TimeInput-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TimeInput-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TimeInput-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-ampm-TimeInput--focused | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-button-TimeInput--focused | 0 | 0 |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimeInput-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimeInput-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimeInput-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimeInput-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimeInput-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimeInput-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimeInput-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimeInput-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-ampm-TimeInput--focused | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-button-TimeInput--focused | 2px | 2px |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimeInput-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimeInput-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimeInput-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimeInput-warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-button-TimeInput | 4px 4px | 4px 4px |
| [padding](../styles-and-themes/common-units/#size)-input-TimeInput | 0 2px | 0 2px |
| [padding](../styles-and-themes/common-units/#size)-item-TimeInput | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TimeInput | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TimeInput | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TimeInput | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TimeInput | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TimeInput | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TimeInput | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TimeInput | $space-2 | $space-2 |
| spacing-divider-TimeInput | 1px 0 | 1px 0 |
| [textAlign](../styles-and-themes/common-units/#text-align)-input-TimeInput | center | center |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimeInput-warning--hover | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-background-TimeInput | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-input-TimeInput | 1.8em | 1.8em |
