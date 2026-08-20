# DateInput [#dateinput]

`DateInput` provides a text-based date input interface for selecting single dates or date ranges, with direct keyboard input similar to TimeInput. It offers customizable formatting and validation options without dropdown calendars.

**Key features:**
- **Date format support**: Multiple date formats including MM/dd/yyyy, yyyy-MM-dd, and dd/MM/yyyy
- **Direct input**: Keyboard-only date entry with input fields for day, month, and year
- **Input validation**: Real-time validation with visual feedback for invalid dates
- **Range support**: Single date selection (default) or date range selection
- **Accessibility**: Full keyboard navigation and screen reader support

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

Whether to show a clear button to reset the input

When enabled, it displays a clear button that allows users to clear the date input. Enter a date in this app and then click the clear button:

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

### `clearToInitialValue` [#cleartoinitialvalue]

> [!DEF]  default: **false**

Whether clearing resets to initial value or null

When `true`, the clear button resets the input to its initial value. When `false`, it clears the input completely.

```xmlui-pg copy display name="Example: clearToInitialValue"
<App>
  <DateInput 
    clearable="true" 
    clearToInitialValue="true" 
    initialValue="05/25/2024" />
  <DateInput 
    clearable="true" 
    clearToInitialValue="false" 
    initialValue="05/25/2024" />
</App>
```

### `dateFormat` [#dateformat]

> [!DEF]  default: **"MM/dd/yyyy"**

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

### `emptyCharacter` [#emptycharacter]

> [!DEF]  default: **"-"**

Character used to create placeholder text for empty input fields

Character to use as placeholder for empty date values. If longer than 1 character, uses the first character. Defaults to '-'.

```xmlui-pg copy display name="Example: emptyCharacter"
<App>
  <DateInput emptyCharacter="." />
  <DateInput emptyCharacter="*" />
  <DateInput emptyCharacter="abc" />
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

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

> [!DEF]  default: **null**

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <DateInput initialValue="05/25/2024" />
</App>  
```

### `inline` [#inline]

> [!DEF]  default: **true**

Whether to display the date input inline (compatibility with DatePicker, always true for DateInput)

### `invalidMessages` [#invalidmessages]

The invalid messages to display for the input component.

### `maxValue` [#maxvalue]

The optional end date of the selectable date range. If not defined, the range allows any future dates.

### `minValue` [#minvalue]

The optional start date of the selectable date range. If not defined, the range allows any dates in the past.

### `mode` [#mode]

> [!DEF]  default: **"single"**

The mode of the date input (single or range)

Available values: `single` **(default)**, `range`

Available values:

| Value | Description |
| --- | --- |
| `single` | Single date selection **(default)** |
| `range` | Date range selection |

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

Makes the date input read-only. Users can see the value but cannot modify it.

```xmlui-pg copy display name="Example: readOnly" height="120px"
<App>
  <DateInput readOnly="true" initialValue="05/25/2024" />
</App>
```

### `required` [#required]

> [!DEF]  default: **false**

Whether the input is required

Marks the date input as required for form validation.

```xmlui-pg copy display name="Example: required" height="120px"
<App>
  <DateInput required="true" />
</App>
```

### `showWeekNumber` [#showweeknumber]

> [!DEF]  default: **false**

Whether to show the week number (compatibility with DatePicker, not used in DateInput)

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

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
  <DateInput validationStatus="valid" initialValue="05/25/2024" />
  <DateInput validationStatus="warning" initialValue="05/25/2024" />
  <DateInput validationStatus="error" initialValue="05/25/2024" />
</App>
```

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

### `weekStartsOn` [#weekstartson]

> [!DEF]  default: **0**

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

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Fired when the date value changes. Receives the new date value as a parameter.

> [!INFO] The date value changes when the edited input part (day, month, year) loses focus and contains a valid value.

```xmlui-pg copy {6} display name="Example: didChange" height="180px"
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

**Signature**: `gotFocus(): void`

Fired when the date input receives focus.

```xmlui-pg copy {7-8} display name="Example: gotFocus/lostFocus"
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

**Signature**: `lostFocus(): void`

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

```xmlui-pg copy /setValue/ display name="Example: setValue"
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
- **`conciseValidationFeedback`**: The concise validation feedback indicator shown when verboseValidationFeedback is false.
- **`day`**: The day input field.
- **`month`**: The month input field.
- **`year`**: The year input field.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-DateInput](/docs/styles-and-themes/common-units/#color) | $backgroundColor | $backgroundColor |
| [backgroundColor-DateInput--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DateInput--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-input-DateInput-invalid](/docs/styles-and-themes/common-units/#color) | rgba(220, 53, 69, 0.15) | rgba(220, 53, 69, 0.15) |
| [border-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DateInput--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-button-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-DateInput--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-DateInput--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-DateInput--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-input-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-DateInput](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-DateInput--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-DateInput--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-DateInput--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-DateInput](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-DateInput](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-DateInput--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-DateInput--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-DateInput--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-DateInput](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--error--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--success--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--warning--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-DateInput--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [color-adornment-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-DateInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-DateInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-DateInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-divider-DateInput](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| disabledColor-button-DateInput | $textColor-disabled | $textColor-disabled |
| [fontSize-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-DateInput--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-DateInput--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-DateInput--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-input-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-input-DateInput--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-input-DateInput--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-input-DateInput--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [gap-adornment-DateInput](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| hoverColor-button-DateInput | $color-surface-800 | $color-surface-800 |
| [margin-input-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [minHeight-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [minWidth-input-DateInput](/docs/styles-and-themes/common-units/#size-values) | 0.54em | 0.54em |
| [opacity-DateInput--disabled](/docs/styles-and-themes/common-units/#opacity) | *none* | *none* |
| [outlineColor-button-DateInput--focused](/docs/styles-and-themes/common-units/#color) | $color-accent-500 | $color-accent-500 |
| [outlineColor-DateInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-DateInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-DateInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-DateInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-button-DateInput--focused](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [outlineOffset-DateInput--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-DateInput--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-DateInput--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-DateInput--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-DateInput--error--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-DateInput--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-DateInput--success--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-DateInput--warning--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-button-DateInput--focused](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [outlineWidth-DateInput--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-DateInput--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-DateInput--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-DateInput--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-button-DateInput](/docs/styles-and-themes/common-units/#size-values) | 4px 6px | 4px 6px |
| [padding-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-input-DateInput](/docs/styles-and-themes/common-units/#size-values) | 0 2px | 0 2px |
| [paddingBottom-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-DateInput](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingLeft-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-DateInput](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-DateInput](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| spacing-divider-DateInput | 1px 0 | 1px 0 |
| [textAlign-input-DateInput](/docs/styles-and-themes/common-units/#text-align) | center | center |
| [textColor-DateInput](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DateInput--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [transition-background-DateInput](/docs/styles-and-themes/common-units/#transition) | *none* | *none* |
| [width-input-DateInput](/docs/styles-and-themes/common-units/#size-values) | 1.8em | 1.8em |
