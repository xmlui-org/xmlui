# Gauge [#gauge]

`Gauge` wraps the Smart UI Gauge web component, providing a circular dial display for numeric values with full XMLUI theming integration.

## Behaviors

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

## Properties

### `analogDisplayType`

> [!DEF]  default: **"needle"**

Display type: 'needle', 'fill', or 'line'.

### `animation`

> [!DEF]  default: **"none"**

Animation type: 'none' or 'advanced'.

### `digitalDisplay`

> [!DEF]  default: **false**

Show digital value display.

### `enabled`

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `endAngle`

> [!DEF]  default: **210**

End angle in degrees.

### `initialValue`

This property sets the component's initial value.

### `maxValue`

> [!DEF]  default: **100**

Maximum value of the allowed range.

### `minValue`

> [!DEF]  default: **0**

Minimum value of the allowed range.

### `scalePosition`

> [!DEF]  default: **"inside"**

Scale position: 'inside', 'outside', or 'none'.

### `showUnit`

> [!DEF]  default: **false**

Whether to show the unit.

### `startAngle`

> [!DEF]  default: **-30**

Start angle in degrees.

### `unit`

> [!DEF]  default: **""**

Unit text appended to values.

## Events

### `didChange`

This event is triggered when value of Gauge has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

## Exposed Methods

### `focus`

Sets focus on the gauge.

**Signature**: `focus(): void`

### `setValue`

Sets the gauge value programmatically.

**Signature**: `setValue(value: number): void`

- `value`: The new numeric value.

### `value`

Gets the current gauge value.

**Signature**: `get value(): number | undefined`

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Gauge | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Gauge | $color-surface-50 | $color-surface-50 |
| primaryColor-Gauge | $color-primary | $color-primary |
| primaryColor-Gauge | $color-primary | $color-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Gauge | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Gauge | $textColor-primary | $textColor-primary |
