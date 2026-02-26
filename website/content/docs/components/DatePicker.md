# DatePicker [#datepicker]

`DatePicker` provides an interactive calendar interface for selecting single dates or date ranges, with customizable formatting and validation options. It displays a text input that opens a calendar popup when clicked, offering both keyboard and mouse interaction.

**Key features:**
- **Flexible modes**: Single date selection (default) or date range selection
- **Format customization**: Support for various date formats (MM/dd/yyyy, yyyy-MM-dd, etc.)
- **Date restrictions**: Set minimum/maximum dates and disable specific dates
- **Localization options**: Configure first day of week and show week numbers

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

```xmlui-pg copy display name="Example: dateFormat" height="440px"
<App>
  <DatePicker
    inline
    dateFormat="dd-MM-yyyy"
    initialValue="01-01-2024"
    endDate="01-01-2027"
/>
</App>
```

### `disabledDates` [#disableddates]

An optional array of dates that are to be disabled.

The `disabledDates` prop supports multiple patterns for disabling specific dates in the calendar. You can use Date objects, strings (parsed using the `dateFormat`), or complex matcher objects.

**Basic patterns:**

| Pattern | Description | Example |
| :------ | :---------- | :------ |
| Single string | Disable one specific date | `"05/25/2024"` |
| Array of strings | Disable multiple specific dates | `["05/25/2024", "05/26/2024"]` |
| Boolean | Disable all dates | `true` |

> [!INFO] You can use the [getDate()](/docs/globals#getdate) function to query the current date.

```xmlui-pg copy display name="Example: Disable specific dates" height="440px"
<App>
  <DatePicker
    inline
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

```xmlui-pg copy display name="Example: Disable weekends" height="440px"
<App>
  <DatePicker inline disabledDates="{{dayOfWeek: [0, 6]}}" />
</App>
```

```xmlui-pg copy display name="Example: Disable date range" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{{from: '05/20/2024', to: '05/25/2024'}}"
    initialValue="05/18/2024" />
</App>
```

```xmlui-pg copy display name="Example: Disable dates before today" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{{before: getDate()}}"
    intialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Disable dates today and after" height="440px"
<App>
  <DatePicker
    inline
    disabledDates="{[getDate(), {after: getDate()}]}"
    intialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Complex combination" height="440px"
<App>
  <DatePicker
    inline
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

The latest month to start the month navigation from (inclusive). If not defined, the component allows any future dates. Accepts the same date format as the `initialValue`.Example: '2023-12-31' ensures the last month to select a date from is December 2023.

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="440px"
<App>
  <DatePicker inline initialValue="05/25/2024" />
</App>
```

### `inline` [#inline]

> [!DEF]  default: **false**

If set to true, the calendar is always visible and its panel is rendered as part of the layout. If false, the calendar is shown in a popup when the input is focused or clicked.

### `invalidMessages` [#invalidmessages]

The invalid messages to display for the input component.

### `mode` [#mode]

> [!DEF]  default: **"single"**

The mode of the datepicker (single or range)

Available values: `single` **(default)**, `range`

```xmlui-pg copy {2-3} display name="Example: mode" height="560px"
<App>
  <DatePicker mode="single" />
  <DatePicker mode="range" />
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder" height="500px"
<App>
  <DatePicker placeholder="This is a placeholder" />
</App>
```

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `showWeekNumber` [#showweeknumber]

> [!DEF]  default: **false**

Whether to show the week number in the calendar

```xmlui-pg copy display name="Example: showWeekNumber" height="500px"
<App>
  <DatePicker showWeekNumber="true" />
</App>
```

### `startDate` [#startdate]

The earliest month to start the month navigation from (inclusive). If not defined, the component allows any dates in the past. Accepts the same date format as the `initialValue`.Example: '2023-01-01' ensures the first month to select a date from is January 2023.

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
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus" height="500px"
<App>
  <DatePicker />
  <DatePicker validationStatus="valid" />
  <DatePicker validationStatus="warning" />
  <DatePicker validationStatus="error" />
</App>
```

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

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

```xmlui-pg copy display name="Example: weekStartsOn" height="440px"
<App>
  <DatePicker inline weekStartsOn="1" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of DatePicker has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange" height="520px"
<App var.field="(none)">
  <Text value="{field}" />
  <DatePicker
    inline
    initialValue="{field}"
    onDidChange="(val) => field = val" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the DatePicker has received the focus.

**Signature**: `gotFocus(): void`

Clicking on the `DatePicker` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus" height="540px"
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

### `setValue` [#setvalue]

This method sets the current value of the DatePicker.

**Signature**: `set value(value: any): void`

- `value`: The new value to set for the date picker.

```xmlui-pg copy {3, 9, 12} display name="Example: setValue" height="500px"
<App>
  <HStack>
    <Button
      label="Set Date to 05/25/2024"
      onClick="picker.setValue('05/25/2024')" />
    <Button
      label="Remove Date"
      onClick="picker.setValue('')" />
  </HStack>
  <DatePicker inline id="picker" />
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-DatePicker--warning--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-DatePicker--active | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-DatePicker--active | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-DatePicker--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-DatePicker--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-DatePicker | $color-surface-50 | $color-surface-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-DatePicker | $color-surface-50 | $color-surface-50 |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-DatePicker--warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-selectedItem-DatePicker | $color-primary-200 | $color-primary-200 |
| [borderColor](../styles-and-themes/common-units/#color)-selectedItem-DatePicker | $color-primary-200 | $color-primary-200 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DatePicker--default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DatePicker--error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DatePicker--success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DatePicker--warning | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-DatePicker | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-DatePicker | $borderRadius | $borderRadius |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DatePicker--default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DatePicker--error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DatePicker--success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DatePicker--warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DatePicker--default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DatePicker--error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DatePicker--success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-DatePicker--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DatePicker--warning--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-DatePicker | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-DatePicker | $boxShadow-md | $boxShadow-md |
| [color](../styles-and-themes/common-units/#color)-adornment-DatePicker--default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DatePicker--error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DatePicker--success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-adornment-DatePicker--warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-DatePicker--default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-DatePicker--error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-DatePicker--success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-DatePicker--warning | *none* | *none* |
| [minHeight](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DatePicker--default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DatePicker--error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DatePicker--success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-DatePicker--warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DatePicker--default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DatePicker--error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DatePicker--success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-DatePicker--warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DatePicker--default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DatePicker--error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DatePicker--success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-DatePicker--warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DatePicker--default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DatePicker--error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DatePicker--success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-DatePicker--warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-DatePicker | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-DatePicker | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-DatePicker | $space-2 | $space-2 |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-DatePicker--warning--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-DatePicker--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-DatePicker--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-DatePicker--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-DatePicker--warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-value-DatePicker | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-value-DatePicker | $textColor-primary | $textColor-primary |
