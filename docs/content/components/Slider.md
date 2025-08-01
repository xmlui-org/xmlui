# Slider [#slider]

`Slider` provides an interactive control for selecting numeric values within a defined range, supporting both single value selection and range selection with multiple thumbs. It offers precise control through customizable steps and visual feedback with formatted value display.

**Key features:**
- **Range selection**: Single value or dual-thumb range selection with configurable minimum separation
- **Step control**: Precise incremental selection with customizable step values
- **Value formatting**: Custom display formatting for current values and visual feedback

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `Slider` label can be split into multiple lines if it would overflow the available label width.

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

This property sets the width of the `Slider` component's label. If not defined, the label's width will be determined by its content and the available space.

### `maxValue` (default: 10) [#maxvalue-default-10]

This property specifies the maximum value of the allowed input range.

### `minStepsBetweenThumbs` (default: 1) [#minstepsbetweenthumbs-default-1]

This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.

### `minValue` (default: 0) [#minvalue-default-0]

This property specifies the minimum value of the allowed input range.

### `rangeStyle` [#rangestyle]

This optional property allows you to apply custom styles to the range element of the slider.

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `showValues` (default: true) [#showvalues-default-true]

This property controls whether the slider shows the current values of the thumbs.

### `step` (default: 1) [#step-default-1]

This property defines the increment value for the slider, determining the allowed intervals between selectable values.

### `thumbStyle` [#thumbstyle]

This optional property allows you to apply custom styles to the thumb elements of the slider.

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

### `valueFormat` (default: "(value) => value.toString()") [#valueformat-default-value-value-tostring]

This property allows you to customize how the values are displayed.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of Slider has changed.

### `gotFocus` [#gotfocus]

This event is triggered when the Slider has received the focus.

### `lostFocus` [#lostfocus]

This event is triggered when the Slider has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the slider component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This API sets the value of the `Slider`. You can use it to programmatically change the value.

**Signature**: `setValue(value: number | [number, number] | undefined): void`
- `value`: The new value to set. Can be a single value or an array of values for range sliders.

### `value` [#value]

This API retrieves the current value of the `Slider`. You can use it to get the value programmatically.

**Signature**: `get value(): number | [number, number] | undefined`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-range-Slider | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-range-Slider | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-range-Slider--disabled | $color-surface-400 | $color-surface-800 |
| [backgroundColor](../styles-and-themes/common-units/#color)-range-Slider--disabled | $color-surface-400 | $color-surface-800 |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider | $color-primary-500 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider | $color-primary-500 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider--disabled | $color-surface-300 | $color-surface-600 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider--disabled | $color-surface-300 | $color-surface-600 |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-default | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-default | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-thumb-Slider | $color-surface-50 | $color-surface-950 |
| [borderColor](../styles-and-themes/common-units/#color)-thumb-Slider | $color-surface-50 | $color-surface-950 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider-default | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider-default | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider-default | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider-default | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-thumb-Slider | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-thumb-Slider | solid | solid |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider-default | 0 | 0 |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider-default | 0 | 0 |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-thumb-Slider | 2px | 2px |
| [borderWidth](../styles-and-themes/common-units/#size)-thumb-Slider | 2px | 2px |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-default | none | none |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-default | none | none |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider-warning--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--focus | $boxShadow-xl | $boxShadow-xl |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--hover | $boxShadow-lg | $boxShadow-lg |
