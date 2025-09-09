# DateInput [#dateinput]

`DateInput` provides a text-based date input interface for selecting single dates or date ranges, with direct keyboard input similar to TimeInput. It offers customizable formatting and validation options without dropdown calendars.

**Key features:**
- **Date format support**: Multiple date formats including MM/dd/yyyy, yyyy-MM-dd, and dd/MM/yyyy
- **Direct input**: Keyboard-only date entry with input fields for day, month, and year
- **Input validation**: Real-time validation with visual feedback for invalid dates
- **Range support**: Single date selection (default) or date range selection
- **Accessibility**: Full keyboard navigation and screen reader support

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `clearable` (default: false) [#clearable-default-false]

Whether to show a clear button to reset the input

When enabled, it displays a clear button that allows users to reset the date input back to its initial value. Enter a date in this app and then click the clear button:

```xmlui-pg copy display name="Example: clearable" /clearable/
<App>
  <DateInput initialValue="05/25/2024" />
  <DateInput clearable="true" initialValue="05/25/2024" />
</App>
```

### `clearIcon` [#clearicon]

Icon name for the clear button

```xmlui-pg copy display name="Example: clearIcon" /clearIcon/
<App>
  <DateInput initialValue="05/25/2024" clearable="true" clearIcon="trash" />
</App>
```

### `clearToInitialValue` (default: true) [#cleartoinitialvalue-default-true]

Whether clearing resets to initial value or null

When `true`, the clear button resets the input to its initial value. When `false`, it clears the input completely.

```xmlui-pg copy display name="Example: clearToInitialValue"
<App>
  <DateInput clearable="true" clearToInitialValue="true" initialValue="05/25/2024" />
  <DateInput clearable="true" clearToInitialValue="false" initialValue="05/25/2024" />
</App>
```

### `dateFormat` (default: "MM/dd/yyyy") [#dateformat-default-mm-dd-yyyy]

The format of the date displayed in the input field

Available values: `MM/dd/yyyy` **(default)**, `MM-dd-yyyy`, `yyyy/MM/dd`, `yyyy-MM-dd`, `dd/MM/yyyy`, `dd-MM-yyyy`, `yyyyMMdd`, `MMddyyyy`

The `dateFormat` prop controls how dates are displayed and entered. Different formats change the order and separators of day, month, and year fields.

> [!NOTE] Regardless of the dateFormat, the year input field always accepts and displays 4-digit years. When entering a 2-digit year, it will be automatically normalized to a 4-digit year.

| Format | Description | Example |
| :----- | :---------- | :------ |
| `MM/dd/yyyy` | US format with slashes | 05/25/2024 |
| `MM-dd-yyyy` | US format with dashes | 05-25-2024 |
| `yyyy/MM/dd` | ISO-like format with slashes | 2024/05/25 |
| `yyyy-MM-dd` | ISO format with dashes | 2024-05-25 |
| `dd/MM/yyyy` | European format with slashes | 25/05/2024 |
| `dd-MM-yyyy` | European format with dashes | 25-05-2024 |
| `yyyyMMdd` | Compact format without separators | 20240525 |
| `MMddyyyy` | US compact format | 05252024 |

```xmlui-pg copy display name="Example: dateFormat"
<App>
  <DateInput dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
  <DateInput dateFormat="yyyy-MM-dd" initialValue="2024-05-25" />
  <DateInput dateFormat="dd/MM/yyyy" initialValue="25/05/2024" />
  <DateInput dateFormat="yyyyMMdd" initialValue="20240525" />
</App>
```

### `disabledDates` [#disableddates]

An optional array of dates that are disabled (compatibility with DatePicker, not used in DateInput)

### `emptyCharacter` (default: "-") [#emptycharacter-default-]

Character used to create placeholder text for empty input fields

Character to use as placeholder for empty date values. If longer than 1 character, uses the first character. Defaults to '-'.

```xmlui-pg copy display name="Example: emptyCharacter"
<App>
  <DateInput emptyCharacter="." />
  <DateInput emptyCharacter="*" />
  <DateInput emptyCharacter="abc" />
</App>
```

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <DateInput enabled="false" initialValue="05/25/2024" />
</App>  
```

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `gap` [#gap]

The gap between input elements

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <DateInput initialValue="05/25/2024" />
</App>  
```

### `inline` (default: true) [#inline-default-true]

Whether to display the date input inline (compatibility with DatePicker, always true for DateInput)

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `DateInput` label can be split into multiple lines if it would overflow the available label width.

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

This property sets the width of the `DateInput` component's label. If not defined, the label's width will be determined by its content and the available space.

### `maxValue` [#maxvalue]

The optional end date of the selectable date range. If not defined, the range allows any future dates.

### `minValue` [#minvalue]

The optional start date of the selectable date range. If not defined, the range allows any dates in the past.

### `mode` (default: "single") [#mode-default-single]

The mode of the date input (single or range)

Available values: `single` **(default)**, `range`

Available values:

| Value | Description |
| --- | --- |
| `single` | Single date selection **(default)** |
| `range` | Date range selection |

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

Makes the date input read-only. Users can see the value but cannot modify it.

```xmlui-pg copy display name="Example: readOnly" height="120px"
<App>
  <DateInput readOnly="true" initialValue="05/25/2024" />
</App>
```

### `required` (default: false) [#required-default-false]

Whether the input is required

Marks the date input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <DateInput required="true" />
</App>
```

### `showWeekNumber` (default: false) [#showweeknumber-default-false]

Whether to show the week number (compatibility with DatePicker, not used in DateInput)

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
  <DateInput validationStatus="valid" initialValue="05/25/2024" />
  <DateInput validationStatus="warning" initialValue="05/25/2024" />
  <DateInput validationStatus="error" initialValue="05/25/2024" />
</App>
```

### `weekStartsOn` (default: 0) [#weekstartson-default-0]

The first day of the week. 0 is Sunday, 1 is Monday, etc. (compatibility with DatePicker, not used in DateInput)

Available values:

| Value | Description |
| --- | --- |
| `0` | Sunday **(default)** |
| `1` | Monday |
| `2` | Tuesday |
| `3` | Wednesday |
| `4` | Thursday |
| `5` | Friday |
| `6` | Saturday |

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of DateInput has changed.

Fired when the date value changes. Receives the new date value as a parameter.

> [!INFO] The date value changes when the edited input part (day, month, year) loses focus and contains a valid value.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.selectedDate="No date selected">
  <Text value="{selectedDate}" />
  <DateInput 
    dateFormat="yyyy-MM-dd"
    initialValue="2024-05-25" 
    onDidChange="(date) => selectedDate = date" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the DateInput has received the focus.

Fired when the date input receives focus.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App var.isFocused="{false}">
  <Text value="{isFocused 
    ? 'DateInput focused' : 'DateInput lost focus'}" 
  />
  <DateInput
    dateFormat="MM/dd/yyyy"
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
    initialValue="05/25/2024"
  />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the DateInput has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the DateInput component.

**Signature**: `focus(): void`

### `isoValue` [#isovalue]

Get the current date value formatted in ISO standard (YYYY-MM-DD) format, suitable for JSON serialization.

**Signature**: `isoValue(): string | null`

### `setValue` [#setvalue]

This method sets the current value of the DateInput.

**Signature**: `set value(value: any): void`

- `value`: The new value to set for the date input.

```xmlui-pg copy {3, 9, 12} display name="Example: setValue"
<App>
  <HStack>
    <Button
      label="Set Date to 05/25/2024"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Clear Date"
      onClick="picker.setValue('')" />
  </HStack>
  <DateInput id="picker" />
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`clearButton`**: The button to clear the date input.
- **`day`**: The day input field.
- **`month`**: The month input field.
- **`year`**: The year input field.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DateInput-warning--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-input-DateInput-invalid | rgba(220, 53, 69, 0.15) | rgba(220, 53, 69, 0.15) |
| [border](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DateInput-warning--hover | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-DateInput | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-DateInput | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-button-DateInput | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DateInput-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DateInput-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DateInput-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DateInput-warning | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-input-DateInput | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-DateInput | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-DateInput | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DateInput-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DateInput-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DateInput-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DateInput-warning | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-DateInput | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-DateInput | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-DateInput | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DateInput-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DateInput-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DateInput-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DateInput-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DateInput-warning--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DateInput-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DateInput-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DateInput-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DateInput-warning | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-divider-DateInput | $textColor-secondary | $textColor-secondary |
| disabledColor-button-DateInput | $textColor-disabled | $textColor-disabled |
| [fontSize](../styles-and-themes/common-units/#size)-ampm-DateInput | inherit | inherit |
| [fontSize](../styles-and-themes/common-units/#size)-input-DateInput | inherit | inherit |
| [gap](../styles-and-themes/common-units/#size)-adornment-DateInput | *none* | *none* |
| hoverColor-button-DateInput | $color-surface-800 | $color-surface-800 |
| [margin](../styles-and-themes/common-units/#size)-input-DateInput | *none* | *none* |
| [minWidth](../styles-and-themes/common-units/#size)-ampm-DateInput | 2em | 2em |
| [minWidth](../styles-and-themes/common-units/#size)-input-DateInput | 0.54em | 0.54em |
| [opacity](../styles-and-themes/common-units/#opacity)-DateInput--disabled | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-button-DateInput--focused | $color-accent-500 | $color-accent-500 |
| [outlineColor](../styles-and-themes/common-units/#color)-DateInput-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DateInput-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DateInput-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DateInput-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-button-DateInput--focused | 2px | 2px |
| [outlineOffset](../styles-and-themes/common-units/#size)-DateInput-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DateInput-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DateInput-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DateInput-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DateInput-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DateInput-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DateInput-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DateInput-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-button-DateInput--focused | 2px | 2px |
| [outlineWidth](../styles-and-themes/common-units/#size)-DateInput-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DateInput-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DateInput-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DateInput-warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-button-DateInput | 4px 6px | 4px 6px |
| [padding](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-input-DateInput | 0 2px | 0 2px |
| [paddingBottom](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-DateInput | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-DateInput | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-DateInput | $space-2 | $space-2 |
| spacing-divider-DateInput | 1px 0 | 1px 0 |
| [textAlign](../styles-and-themes/common-units/#text-align)-input-DateInput | center | center |
| [textColor](../styles-and-themes/common-units/#color)-DateInput--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DateInput-warning--hover | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-background-DateInput | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-input-DateInput | 1.8em | 1.8em |
