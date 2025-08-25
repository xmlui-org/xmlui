# TimePicker [#timepicker]

`TimePicker` provides time input with support for 12-hour and 24-hour formats and configurable precision for hours, minutes, and seconds.

**Key features:**
- **Time format support**: 12-hour and 24-hour formats with customizable display
- **Precision control**: Configure precision for hours, minutes, and seconds
- **Input validation**: Real-time validation with visual feedback for invalid times
- **Accessibility**: Full keyboard navigation and screen reader support
- **Localization**: Automatic AM/PM labels based on user locale

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `clearable` (default: true) [#clearable-default-true]

Whether to show a clear button that allows clearing the selected time

When enabled, it displays a clear button that allows users to reset the time picker back to its initial value. Change the time value in this app and then click the clear button:

```xmlui-pg copy display name="Example: clearable" /clearable/
<App>
  <TimePicker initialValue="11:30" />
  <TimePicker clearable="false" initialValue="10:20" />
</App>
```

### `clearIcon` [#clearicon]

The icon to display in the clear button.

```xmlui-pg copy display name="Example: clearIcon" /clearIcon/
<App>
  <TimePicker initialValue="11:30" clearIcon="trash" />
</App>
```

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <TimePicker enabled="false" initialValue="14:30" />
</App>  
```

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `format` (default: "HH:mm") [#format-default-hh-mm]

Time format based on Unicode Technical Standard #35. Supported values include H, HH, h, hh, m, mm, s, ss, a

Available values: `h:m:s a`, `h:m a`, `HH:mm:ss`, `HH:mm` **(default)**, `H:m:s`, `H:m`

The `format` prop controls how time is displayed and which parts are editable. Based on Unicode Technical Standard #35.

| Format | Description | Example |
| :----- | :---------- | :------ |
| `H:mm` | 24-hour format with hours and minutes | 14:30 |
| `HH:mm:ss` | 24-hour format with hours, minutes, seconds | 14:30:15 |
| `h:mm a` | 12-hour format with AM/PM | 2:30 PM |
| `hh:mm:ss a` | 12-hour format with seconds and AM/PM | 02:30:15 PM |

```xmlui-pg copy display name="Example: format"
<App>
  <TimePicker format="H:mm" initialValue="14:30" />
  <TimePicker format="h:mm a" initialValue="14:30" />
  <TimePicker format="HH:mm:ss" initialValue="14:30:15" />
  <TimePicker format="HH:mm:ss a" initialValue="14:30:15" />
</App>
```

### `gap` [#gap]

This property defines the gap between the adornments and the input area. If not set, the gap declared by the current theme is used.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <TimePicker initialValue="14:30:15" />
</App>  
```

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `TimePicker` label can be split into multiple lines if it would overflow the available label width.

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

This property sets the width of the `TimePicker` component's label. If not defined, the label's width will be determined by its content and the available space.

### `maxTime` [#maxtime]

Maximum time that the user can select

Sets the maximum selectable time. Times after this value will be invalid.

```xmlui-pg copy display name="Example: maxTime" height="120px"
<App>
  <TimePicker maxTime="17:00" initialValue="18:30" />
</App>
```

### `minTime` [#mintime]

Minimum time that the user can select

Sets the minimum selectable time. Times before this value will be invalid.

```xmlui-pg copy display name="Example: minTime" height="120px"
<App>
  <TimePicker minTime="09:00" initialValue="08:30" />
</App>
```

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

Makes the time picker read-only. Users can see the value but cannot modify it.

```xmlui-pg copy display name="Example: readOnly" height="120px"
<App>
  <TimePicker readOnly="true" initialValue="14:30" />
</App>
```

### `required` (default: false) [#required-default-false]

Whether the time input should be required

Marks the time input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <TimePicker required="true" />
</App>
```

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
  <TimePicker validationStatus="valid" initialValue="11:30" />
  <TimePicker validationStatus="warning" initialValue="11:30" />
  <TimePicker validationStatus="error" initialValue="11:30" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TimePicker has changed.

Fired when the time value changes. Receives the new time value as a parameter.

> [!INFO] The time value changes when the edited input part (hour, minute, second) loses focus or the AM/PM selectro changes.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.selectedTime="No time selected">
  <Text value="{selectedTime}" />
  <TimePicker 
    format="h:m:s a"
    initialValue="07:30:05" 
    onDidChange="(time) => selectedTime = time" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the TimePicker has received the focus.

Fired when the time picker receives focus.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App var.isFocused="{false}">
  <Text value="{isFocused 
    ? 'TimePicker focused' : 'TimePicker lost focus'}" 
  />
  <TimePicker
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
  <TimePicker 
    onInvalidTime="(error) => errorMessage = 'Invalid time entered'"
    onDidChange="errorMessage = ''" />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the TimePicker has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the TimePicker component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This method sets the current value of the TimePicker.

**Signature**: `set value(value: any): void`

- `value`: The new time value to set for the time picker.

```xmlui-pg copy {3, 9, 12} display name="Example: setValue" height="500px"
<App>
  <HStack>
    <Button
      label="Set Time to 14:30"
      onClick="picker.setValue('14:30')" />
    <Button
      label="Remove Time"
      onClick="picker.setValue('')" />
  </HStack>
  <TimePicker id="picker" />
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-input-TimePicker-invalid | rgba(220, 53, 69, 0.15) | rgba(220, 53, 69, 0.15) |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-TimePicker--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-TimePicker--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-TimePicker | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TimePicker-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-menu-TimePicker | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TimePicker-warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-button-TimePicker | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-input-TimePicker | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-TimePicker | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimePicker-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimePicker-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimePicker-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TimePicker-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimePicker-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimePicker-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimePicker-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TimePicker-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimePicker-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimePicker-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimePicker-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TimePicker-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-TimePicker | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TimePicker-warning--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimePicker-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimePicker-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimePicker-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-TimePicker-warning | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-divider-TimePicker | $textColor-secondary | $textColor-secondary |
| disabledColor-button-TimePicker | $textColor-disabled | $textColor-disabled |
| [fontSize](../styles-and-themes/common-units/#size)-ampm-TimePicker | inherit | inherit |
| [fontSize](../styles-and-themes/common-units/#size)-input-TimePicker | inherit | inherit |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TimePicker-default | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-adornment-TimePicker | *none* | *none* |
| hoverColor-button-TimePicker | $color-surface-800 | $color-surface-800 |
| [margin](../styles-and-themes/common-units/#size)-icon-TimePicker | *none* | *none* |
| [margin](../styles-and-themes/common-units/#size)-input-TimePicker | *none* | *none* |
| [maxHeight](../styles-and-themes/common-units/#size)-menu-TimePicker | *none* | *none* |
| [minWidth](../styles-and-themes/common-units/#size)-ampm-TimePicker | 2em | 2em |
| [minWidth](../styles-and-themes/common-units/#size)-input-TimePicker | 0.54em | 0.54em |
| [opacity](../styles-and-themes/common-units/#opacity)-item-TimePicker--disabled | *none* | *none* |
| [opacity](../styles-and-themes/common-units/#opacity)-TimePicker--disabled | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-ampm-TimePicker--focused | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-button-TimePicker--focused | $color-accent-500 | $color-accent-500 |
| [outlineColor](../styles-and-themes/common-units/#color)-TimePicker-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TimePicker-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TimePicker-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TimePicker-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-ampm-TimePicker--focused | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-button-TimePicker--focused | 2px | 2px |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimePicker-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimePicker-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimePicker-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TimePicker-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimePicker-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimePicker-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimePicker-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TimePicker-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-ampm-TimePicker--focused | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-button-TimePicker--focused | 2px | 2px |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimePicker-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimePicker-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimePicker-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TimePicker-warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-button-TimePicker | 4px 6px | 4px 6px |
| [padding](../styles-and-themes/common-units/#size)-input-TimePicker | 0 2px | 0 2px |
| [padding](../styles-and-themes/common-units/#size)-item-TimePicker | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TimePicker-default | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TimePicker-error | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TimePicker-success | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TimePicker-warning | *none* | *none* |
| spacing-divider-TimePicker | 1px 0 | 1px 0 |
| [textAlign](../styles-and-themes/common-units/#text-align)-input-TimePicker | center | center |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TimePicker-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TimePicker-warning--hover | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-background-TimePicker | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-input-TimePicker | 1.8em | 1.8em |
