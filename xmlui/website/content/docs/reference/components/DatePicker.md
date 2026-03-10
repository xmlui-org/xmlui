# DatePicker [#datepicker]

`DatePicker` provides an interactive calendar interface for selecting single dates or date ranges, with customizable formatting and validation options. It displays a text input that opens a calendar popup when clicked, offering both keyboard and mouse interaction.

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

### `disabledDates` [#disableddates]

An optional array of dates that are to be disabled.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `endDate` [#enddate]

The latest month to start the month navigation from (inclusive). If not defined, the component allows any future dates. Accepts the same date format as the `initialValue`.Example: '2023-12-31' ensures the last month to select a date from is December 2023.

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `inline` [#inline]

> [!DEF]  default: **false**

If set to true, the calendar is always visible and its panel is rendered as part of the layout. If false, the calendar is shown in a popup when the input is focused or clicked.

### `invalidMessages` [#invalidmessages]

The invalid messages to display for the input component.

### `mode` [#mode]

> [!DEF]  default: **"single"**

The mode of the datepicker (single or range)

Available values: `single` **(default)**, `range`

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `showWeekNumber` [#showweeknumber]

> [!DEF]  default: **false**

Whether to show the week number in the calendar

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

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of DatePicker has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the DatePicker has received the focus.

**Signature**: `gotFocus(): void`

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

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePicker--active | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePicker--active | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePicker--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-DatePicker--hover | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-DatePicker | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-DatePicker | $color-surface-50 | $color-surface-50 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-selectedItem-DatePicker | $color-primary-200 | $color-primary-200 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-selectedItem-DatePicker | $color-primary-200 | $color-primary-200 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePicker | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePicker--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePicker--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DatePicker--warning | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-DatePicker | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-DatePicker | $borderRadius | $borderRadius |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePicker | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePicker--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePicker--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DatePicker--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DatePicker--warning--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-DatePicker | $boxShadow-md | $boxShadow-md |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-DatePicker | $boxShadow-md | $boxShadow-md |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePicker | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePicker--error | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePicker--success | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-DatePicker--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePicker | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePicker--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePicker--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-DatePicker--warning | *none* | *none* |
| [minHeight](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePicker--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePicker--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePicker--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePicker--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-DatePicker--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePicker--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePicker--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePicker--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-DatePicker--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-DatePicker--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-DatePicker | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-DatePicker | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-DatePicker | $space-2 | $space-2 |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--disabled | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-DatePicker--warning--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePicker | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePicker--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePicker--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-DatePicker--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-value-DatePicker | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-value-DatePicker | $textColor-primary | $textColor-primary |
