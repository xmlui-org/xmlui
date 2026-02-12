# Slider [#slider]

`Slider` provides an interactive control for selecting numeric values within a defined range, supporting both single value selection and range selection with multiple thumbs. It offers precise control through customizable steps and visual feedback with formatted value display.Hover over the component to see the tooltip with the current value. On mobile, tap the thumb to see the tooltip.

**Key features:**
- **Range selection**: Single value or dual-thumb range selection with configurable minimum separation
- **Step control**: Precise incremental selection with customizable step values
- **Value formatting**: Custom display formatting for current values and visual feedback

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **formBinding**: Binds input components directly to a Form when they have a 'bindTo' prop, without requiring a FormItem wrapper. This behavior adds form binding logic such as validation and state management to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **validation**: Adds validation functionality to input components with validation-related props (e.g., 'required', 'minLength', 'maxLength', etc.) by wrapping them with a ValidationWrapper component that handles validation logic and error display.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `autoFocus` [#autofocus]

-  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` [#enabled]

-  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg
<Slider initialValue="5" />
```

### `maxValue` [#maxvalue]

-  default: **10**

This property specifies the maximum value of the allowed input range.

```xmlui-pg
<Slider maxValue="30" />
```

### `minStepsBetweenThumbs` [#minstepsbetweenthumbs]

-  default: **1**

This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.

### `minValue` [#minvalue]

-  default: **0**

This property specifies the minimum value of the allowed input range.

```xmlui-pg
<Slider minValue="10" />
```

### `rangeStyle` [#rangestyle]

This optional property allows you to apply custom styles to the range element of the slider.

### `readOnly` [#readonly]

-  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

-  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `showValues` [#showvalues]

-  default: **true**

This property controls whether the slider shows the current values of the thumbs.

### `step` [#step]

-  default: **1**

This property defines the increment value for the slider, determining the allowed intervals between selectable values.

### `thumbStyle` [#thumbstyle]

This optional property allows you to apply custom styles to the thumb elements of the slider.

### `validationStatus` [#validationstatus]

-  default: **"none"**

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

### `valueFormat` [#valueformat]

-  default: **"(value) => value.toString()"**

This property allows you to customize how the values are displayed.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of Slider has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the Slider has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the Slider has lost the focus.

**Signature**: `lostFocus(): void`

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

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`label`**: The label displayed for the slider.
- **`thumb`**: The thumb elements of the slider.
- **`track`**: The track element of the slider.

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
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider--active | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider--active | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider--focus | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider--focus | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider--hover | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-thumb-Slider--hover | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider--disabled | $color-surface-300 | $color-surface-600 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Slider--disabled | $color-surface-300 | $color-surface-600 |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--default | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--default | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Slider--warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-thumb-Slider | $color-surface-50 | $color-surface-950 |
| [borderColor](../styles-and-themes/common-units/#color)-thumb-Slider | $color-surface-50 | $color-surface-950 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider--default | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider--default | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider--error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider--success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Slider--warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider--default | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider--default | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider--error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider--success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Slider--warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-thumb-Slider | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-thumb-Slider | solid | solid |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider--default | 0 | 0 |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider--default | 0 | 0 |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider--error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider--success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Slider--warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-thumb-Slider | 2px | 2px |
| [borderWidth](../styles-and-themes/common-units/#size)-thumb-Slider | 2px | 2px |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--default | none | none |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--default | none | none |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Slider--warning--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--active | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--active | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--focus | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--focus | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--hover | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-thumb-Slider--hover | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
