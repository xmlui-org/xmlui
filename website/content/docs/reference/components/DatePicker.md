# DatePicker [#datepicker]

`DatePicker` provides an interactive calendar interface for selecting single dates or date ranges, with customizable formatting and validation options. It displays a text input that opens a calendar popup when clicked, offering both keyboard and mouse interaction.

**Key features:**
- **Flexible modes**: Single date selection (default) or date range selection
- **Format customization**: Support for various date formats (MM/dd/yyyy, yyyy-MM-dd, etc.)
- **Date restrictions**: Set minimum/maximum dates and disable specific dates
- **Localization options**: Configure first day of week and show week numbers

**Context variables available during execution:**

- `value`: Current value. Single mode returns a string; range mode returns `{ from, to }`.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Form Binding | `bindTo`, `initialValue`, `noSubmit` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `requiredInvalidMessage`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `matchValue`, `matchInvalidMessage`, `validationMode`, `customValidationsDebounce`, `validationDisplayDelay`, `verboseValidationFeedback`, `validate` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `clearable` [#clearable]

> [!DEF]  default: **false**

Set to `true` to show a clear button that resets the value. Hidden by default.

### `confirmRangeSelection` [#confirmrangeselection]

> [!DEF]  default: **false**

In `range` mode, show a Cancel/Proceed footer so the user must explicitly confirm the selected range before it is committed. When `false` (default), the range auto-commits on the second click and the popup closes.

### `dateFormat` [#dateformat]

> [!DEF]  default: **"MM/dd/yyyy"**

The format of the date displayed in the input field

Available values: `MM/dd/yyyy` **(default)**, `MM-dd-yyyy`, `yyyy/MM/dd`, `yyyy-MM-dd`, `dd/MM/yyyy`, `dd-MM-yyyy`, `yyyyMMdd`, `MMddyyyy`

Formats handle years (`y`), months (`m` or `M`), days of the month (`d`).
Providing multiple placeholder letters changes the display of the date.

The table below shows the available date formats:

| Format     | Example    |
| :--------- | :--------- |
| MM/dd/yyyy | 05/25/2024 |
| MM-dd-yyyy | 05-25-2024 |
| yyyy/MM/dd | 2024/05/25 |
| yyyy-MM-dd | 2024-05-25 |
| dd/MM/yyyy | 25/05/2024 |
| dd-MM-yyyy | 25-05-2024 |
| yyyyMMdd   | 20240525   |
| MMddyyyy   | 05252024   |

```xmlui-pg copy display name="Example: dateFormat" height="120px"
<App>
  <DatePicker
    dateFormat="dd-MM-yyyy"
    initialValue="01-01-2024"
    endDate="01-01-2027"
/>
</App>
```

### `disabledDates` [#disableddates]

An optional array of dates that are to be disabled. Accepts a date string, `{ from, to }`, `{ before }`, `{ after }`, `{ before, after }`, or `{ dayOfWeek }` matchers (parsed with `dateFormat`).

The `disabledDates` prop supports multiple patterns for disabling specific dates in the calendar. You can use Date objects, strings (parsed using the `dateFormat`), or complex matcher objects.

**Basic patterns:**

| Pattern | Description | Example |
| :------ | :---------- | :------ |
| Single string | Disable one specific date | `"05/25/2024"` |
| Array of strings | Disable multiple specific dates | `["05/25/2024", "05/26/2024"]` |
| Boolean | Disable all dates | `true` |

> [!INFO] You can use the [getDate()](/docs/globals#getdate) function to query the current date.

```xmlui-pg copy display name="Example: Disable specific dates" height="120px"
<App>
  <DatePicker
    disabledDates="{['05/26/2024', '05/27/2024']}"
    initialValue="05/25/2024" />
</App>
```

**Advanced patterns:**

| Pattern | Description | Example |
| :------ | :---------- | :------ |
| Date range | Disable a range of dates | `{from: "05/20/2024", to: "05/25/2024"}` |
| Day of week | Disable specific weekdays (0=Sunday, 6=Saturday) | `{dayOfWeek: [0, 6]}` |
| Before date | Disable all dates before a specific date | `{before: "05/25/2024"}` |
| After date | Disable all dates after a specific date | `{after: "05/25/2024"}` |
| Date interval | Disable dates between two dates (exclusive) | `{before: "05/30/2024", after: "05/20/2024"}` |

```xmlui-pg copy display name="Example: Disable weekends" height="120px"
<App>
  <DatePicker disabledDates="{{dayOfWeek: [0, 6]}}" />
</App>
```

```xmlui-pg copy display name="Example: Disable date range" height="120px"
<App>
  <DatePicker
    disabledDates="{{from: '05/20/2024', to: '05/25/2024'}}"
    initialValue="05/18/2024" />
</App>
```

```xmlui-pg copy display name="Example: Disable dates before today" height="120px"
<App>
  <DatePicker
    disabledDates="{{before: getDate()}}"
    initialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Disable dates today and after" height="120px"
<App>
  <DatePicker
    disabledDates="{[getDate(), {after: getDate()}]}"
    initialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Complex combination" height="120px"
<App>
  <DatePicker
    disabledDates="{[
    {dayOfWeek: [0, 6]},
    {from: '12/24/2024', to: '12/26/2024'},
    '01/01/2025']}"
    initialValue="12/20/2024"
/>
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled" height="120px"
<App>
  <DatePicker enabled="false" />
</App>
```

### `endDate` [#enddate]

The latest month to start the month navigation from (inclusive). If not defined, the component allows any future dates. Accepts the same date format as the `initialValue`. Example: '2023-12-31' ensures the last month to select a date from is December 2023.

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `initialValue` [#initialvalue]

> [!DEF]  default: **null**

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <DatePicker initialValue="05/25/2024" />
</App>
```

### `inline` [#inline]

> [!DEF]  default: **false**

If set to true, the calendar is always visible and its panel is rendered as part of the layout. If false, the calendar is shown in a popup when the input is focused or clicked.

### `invalidMessages` [#invalidmessages]

The invalid messages to display in the concise validation summary.

### `label` [#label]

Optional label rendered above the input.

### `locale` [#locale]

> [!DEF]  default: **"en-US"**

BCP 47 locale used for calendar labels.

### `mode` [#mode]

> [!DEF]  default: **"single"**

The mode of the datepicker (single or range)

Available values: `single` **(default)**, `range`

```xmlui-pg copy {2-3} display name="Example: mode" height="190px"
<App>
  <DatePicker mode="single" />
  <DatePicker mode="range" />
</App>
```

### `numOfMonths` [#numofmonths]

> [!DEF]  default: **1**

The number of months displayed at once.

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder" height="120px"
<App>
  <DatePicker placeholder="This is a placeholder" />
</App>
```

### `presets` [#presets]

Customizes the range presets (range mode only). Supplying a list also turns the presets on. Accepts a comma-separated string or array of built-in preset keys (e.g. `last7Days`, `thisMonth`), `{ value, label }` objects to relabel a built-in, or `{ label, from, to }` objects for fully custom date ranges (parsed with `dateFormat`).

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `showPresets` [#showpresets]

> [!DEF]  default: **false**

Range presets are hidden by default. Set to `true` to show the built-in presets (Last 7 days, Last 30 days, This month, Last month); set to `false` to force them off even when a `presets` list is supplied.

### `showWeekNumber` [#showweeknumber]

> [!DEF]  default: **false**

Show week number cells in the day table.

```xmlui-pg copy display name="Example: showWeekNumber" height="120px"
<App>
  <DatePicker showWeekNumber="true" />
</App>
```

### `showWeekNumbers` [#showweeknumbers]

> [!DEF]  default: **false**

Alias for `showWeekNumber`.

### `startDate` [#startdate]

The earliest month to start the month navigation from (inclusive). If not defined, the component allows any dates in the past. Accepts the same date format as the `initialValue`. Example: '2023-01-01' ensures the first month to select a date from is January 2023.

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

### `timeZone` [#timezone]

> [!DEF]  default: **"UTC"**

The time zone used for date calculations.

### `validationIconError` [#validationiconerror]

Icon to display for the error state when the concise summary is enabled.

### `validationIconSuccess` [#validationiconsuccess]

Icon to display for the valid state when the concise summary is enabled.

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

```xmlui-pg copy display name="Example: validationStatus" height="300px"
<App>
  <DatePicker />
  <DatePicker validationStatus="valid" />
  <DatePicker validationStatus="warning" />
  <DatePicker validationStatus="error" />
</App>
```

### `value` [#value]

Controlled value. In single mode, a date string; in range mode, a `{ from, to }` object.

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in the input.

### `weekStartsOn` [#weekstartson]

> [!DEF]  default: **0**

The first day of the week. 0 is Sunday, 1 is Monday, etc.

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

| Day       | Number |
| :-------- | :----- |
| Sunday    | 0      |
| Monday    | 1      |
| Tuesday   | 2      |
| Wednesday | 3      |
| Thursday  | 4      |
| Friday    | 5      |
| Saturday  | 6      |

```xmlui-pg copy display name="Example: weekStartsOn" height="120px"
<App>
  <DatePicker weekStartsOn="1" />
</App>
```

### `width` [#width]

CSS width for the picker root.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of DatePicker has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.field="(none)">
  <Text value="{field}" />
  <DatePicker
    initialValue="{field}"
    onDidChange="(val) => field = val" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the DatePicker has received the focus.

**Signature**: `gotFocus(): void`

Clicking on the `DatePicker` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus" height="180px"
<App var.isFocused="false">
  <Text value="{isFocused === true
    ? 'DatePicker focused' : 'DatePicker lost focus'}"
  />
  <DatePicker
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
  />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the DatePicker has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the DatePicker component.

**Signature**: `focus(): void`

### `getValue` [#getvalue]

Return the current value of the DatePicker.

**Signature**: `getValue(): string | { from?: string; to?: string } | undefined`

### `setValue` [#setvalue]

This method sets the current value of the DatePicker.

**Signature**: `setValue(value: string | { from?: string; to?: string }): void`

- `value`: The new value to set for the date picker.

```xmlui-pg copy {3, 9, 12} display name="Example: setValue" height="180px"
<App>
  <HStack>
    <Button
      label="Set Date to 05/25/2024"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Remove Date"
      onClick="picker.setValue('')" />
  </HStack>
  <DatePicker id="picker" />
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-DatePicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DatePicker--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-DatePicker--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-day-DatePicker--disabled](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-day-DatePicker--rangeMiddle](/docs/styles-and-themes/common-units/#color) | $color-primary-100 | $color-primary-100 |
| [backgroundColor-day-DatePicker--selected](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-day-DatePicker--today](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-item-DatePicker--active](/docs/styles-and-themes/common-units/#color) | $color-surface-200 | $color-surface-200 |
| [backgroundColor-item-DatePicker--hover](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [backgroundColor-menu-DatePicker](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [backgroundColor-overlay-DatePicker](/docs/styles-and-themes/common-units/#color) | $backgroundColor-overlay | $backgroundColor-overlay |
| [borderColor-DatePicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DatePicker--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DatePicker--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DatePicker--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DatePicker--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-DatePicker--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-day-DatePicker--today](/docs/styles-and-themes/common-units/#color) | $color-secondary-300 | $color-secondary-300 |
| [borderColor-menu-DatePicker](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderColor-selectedItem-DatePicker](/docs/styles-and-themes/common-units/#color) | $color-primary-300 | $color-primary-300 |
| [borderRadius-DatePicker](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-menu-DatePicker](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderStyle-DatePicker](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-day-DatePicker--today](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderWidth-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-day-DatePicker--today](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [boxShadow-DatePicker](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-menu-DatePicker](/docs/styles-and-themes/common-units/#boxShadow) | $boxShadow-md | $boxShadow-md |
| [color-adornment-DatePicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [fontSize-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [minHeight-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineColor-DatePicker--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-DatePicker--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-DatePicker--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-DatePicker--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-DatePicker](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingLeft-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-DatePicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-DatePicker](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [textColor-DatePicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-DatePicker--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-day-DatePicker--disabled](/docs/styles-and-themes/common-units/#color) | $color-secondary-300 | $color-secondary-300 |
| [textColor-day-DatePicker--rangeMiddle](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-day-DatePicker--selected](/docs/styles-and-themes/common-units/#color) | $color-surface-0 | $color-surface-0 |
| [textColor-day-DatePicker--today](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-placeholder-DatePicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-value-DatePicker](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-weekday-DatePicker](/docs/styles-and-themes/common-units/#color) | $color-secondary-300 | $color-secondary-300 |
