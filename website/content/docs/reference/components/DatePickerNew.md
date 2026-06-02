# DatePickerNew [#datepicker]

`DatePickerNew` provides an interactive calendar interface for selecting single dates or date ranges, with customizable formatting and validation options. It displays a text input that opens a calendar popup when clicked, offering both keyboard and mouse interaction.

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
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `requiredInvalidMessage`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `matchValue`, `matchInvalidMessage`, `validationMode`, `customValidationsDebounce`, `validationDisplayDelay`, `verboseValidationFeedback`, `validate` |
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

```xmlui-pg copy display name="Example: dateFormat" height="120px"
<App>
  <DatePickerNew
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

```xmlui-pg copy display name="Example: Disable specific dates" height="120px"
<App>
  <DatePickerNew
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
  <DatePickerNew disabledDates="{{dayOfWeek: [0, 6]}}" />
</App>
```

```xmlui-pg copy display name="Example: Disable date range" height="120px"
<App>
  <DatePickerNew
    disabledDates="{{from: '05/20/2024', to: '05/25/2024'}}"
    initialValue="05/18/2024" />
</App>
```

```xmlui-pg copy display name="Example: Disable dates before today" height="120px"
<App>
  <DatePickerNew
    disabledDates="{{before: getDate()}}"
    initialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Disable dates today and after" height="120px"
<App>
  <DatePickerNew
    disabledDates="{[getDate(), {after: getDate()}]}"
    initialValue="{getDate()}"/>
</App>
```

```xmlui-pg copy display name="Example: Complex combination" height="120px"
<App>
  <DatePickerNew
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
  <DatePickerNew enabled="false" />
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

```xmlui-pg copy display name="Example: initialValue" height="120px"
<App>
  <DatePickerNew initialValue="05/25/2024" />
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

```xmlui-pg copy {2-3} display name="Example: mode" height="190px"
<App>
  <DatePickerNew mode="single" />
  <DatePickerNew mode="range" />
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder" height="120px"
<App>
  <DatePickerNew placeholder="This is a placeholder" />
</App>
```

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `showWeekNumber` [#showweeknumber]

> [!DEF]  default: **false**

Whether to show the week number in the calendar

```xmlui-pg copy display name="Example: showWeekNumber" height="120px"
<App>
  <DatePickerNew showWeekNumber="true" />
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

```xmlui-pg copy display name="Example: validationStatus" height="300px"
<App>
  <DatePickerNew />
  <DatePickerNew validationStatus="valid" />
  <DatePickerNew validationStatus="warning" />
  <DatePickerNew validationStatus="error" />
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

```xmlui-pg copy display name="Example: weekStartsOn" height="120px"
<App>
  <DatePickerNew weekStartsOn="1" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of DatePickerNew has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange" height="180px"
<App var.field="(none)">
  <Text value="{field}" />
  <DatePickerNew
    initialValue="{field}"
    onDidChange="(val) => field = val" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the DatePickerNew has received the focus.

**Signature**: `gotFocus(): void`

Clicking on the `DatePickerNew` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus" height="180px"
<App var.isFocused="false">
  <Text value="{isFocused === true
    ? 'DatePickerNew focused' : 'DatePickerNew lost focus'}"
  />
  <DatePickerNew
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false"
  />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the DatePickerNew has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the DatePickerNew component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This method sets the current value of the DatePickerNew.

**Signature**: `set value(value: any): void`

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
  <DatePickerNew id="picker" />
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--disabled | $color-danger-500 | $color-danger-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--disabled | $color-danger-500 | $color-danger-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--selected | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--selected | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--today | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--today | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePickerNew--active | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePickerNew--active | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePickerNew--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePickerNew--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-DatePickerNew | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-DatePickerNew | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-overlay-DatePickerNew | $backgroundColor-overlay | $backgroundColor-overlay |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-overlay-DatePickerNew | $backgroundColor-overlay | $backgroundColor-overlay |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-selectedItem-DatePickerNew | $color-primary-200 | $color-primary-200 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-selectedItem-DatePickerNew | $color-primary-200 | $color-primary-200 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePickerNew | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePickerNew--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePickerNew--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePickerNew--warning | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-DatePickerNew | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-DatePickerNew | $borderRadius | $borderRadius |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePickerNew | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePickerNew--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePickerNew--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePickerNew--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePickerNew--warning--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-DatePickerNew | $boxShadow-md | $boxShadow-md |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-DatePickerNew | $boxShadow-md | $boxShadow-md |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePickerNew | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePickerNew--error | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePickerNew--success | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePickerNew--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePickerNew | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePickerNew--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePickerNew--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePickerNew--warning | *none* | *none* |
| [minHeight](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePickerNew--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePickerNew--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePickerNew--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePickerNew--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-DatePickerNew | $space-2 | $space-2 |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--disabled | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePickerNew--warning--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--disabled | $color-surface-0 | $color-surface-0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--disabled | $color-surface-0 | $color-surface-0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--selected | $color-surface-0 | $color-surface-0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--selected | $color-surface-0 | $color-surface-0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--today | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-day-DatePickerNew--today | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePickerNew | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePickerNew--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePickerNew--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePickerNew--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-value-DatePickerNew | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-value-DatePickerNew | $textColor-primary | $textColor-primary |
