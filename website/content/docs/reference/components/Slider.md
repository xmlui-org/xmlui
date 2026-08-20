# Slider [#slider]

`Slider` provides an interactive control for selecting numeric values within a defined range, supporting both single value selection and range selection with multiple thumbs. It offers precise control through customizable steps and visual feedback with formatted value display.Hover over the component to see the tooltip with the current value. On mobile, tap the thumb to see the tooltip.

**Key features:**
- **Range selection**: Single value or dual-thumb range selection with configurable minimum separation
- **Step control**: Precise incremental selection with customizable step values
- **Value formatting**: Custom display formatting for current values and visual feedback

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

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the Slider's initial value. It is not read only at mount: changing `initialValue`, `minValue`, or `maxValue` re-seeds the thumbs into the current range. That re-seeding fires no events, which makes binding all three to a derived value the way to drive a slider whose domain changes at runtime.

```xmlui-pg name="Slider"
<Slider initialValue="5" />
```

### `maxValue` [#maxvalue]

> [!DEF]  default: **10**

This property specifies the maximum value of the allowed input range.

```xmlui-pg name="Slider 3"
<Slider maxValue="30" />
```

### `minStepsBetweenThumbs` [#minstepsbetweenthumbs]

> [!DEF]  default: **1**

This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.

### `minValue` [#minvalue]

> [!DEF]  default: **0**

This property specifies the minimum value of the allowed input range.

```xmlui-pg name="Slider 2"
<Slider minValue="10" />
```

### `rangeStyle` [#rangestyle]

This optional property allows you to apply custom styles to the range element of the slider.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `showValues` [#showvalues]

> [!DEF]  default: **true**

This property controls whether the slider shows the current values of the thumbs.

### `step` [#step]

> [!DEF]  default: **1**

This property defines the increment value for the slider, determining the allowed intervals between selectable values.

### `thumbStyle` [#thumbstyle]

This optional property allows you to apply custom styles to the thumb elements of the slider.

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

### `valueFormat` [#valueformat]

> [!DEF]  default: **"(value) => value.toString()"**

This property allows you to customize how the values are displayed.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of Slider has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `didCommit` [#didcommit]

This event is triggered when the user finishes an adjustment of `Slider`, rather than on every step crossed while dragging. Use it for expensive work (filtering a result set, fetching) and keep `didChange` for live display.

**Signature**: `didCommit(newValue: any): void`

- `newValue`: The committed value of the component.

This event fires once the user finishes an adjustment, while `didChange` fires on every step crossed during a drag. Use `didCommit` for work you do not want repeated mid-gesture — filtering a result set, fetching, recalculating — and keep `didChange` for the live readout.

```xmlui-pg name="Slider 4"
---app copy display name="Example: didCommit"
<App var.live="{[20, 60]}" var.committed="{[20, 60]}">
  <Slider
    initialValue="{[20, 60]}"
    minStepsBetweenThumbs="1"
    onDidChange="(val) => live = val"
    onDidCommit="(val) => committed = val" />
  <Text value="dragging: {live[0]} – {live[1]}" />
  <Text value="committed: {committed[0]} – {committed[1]}" />
</App>
---desc
Drag a thumb: the first line follows every step, the second updates only when you let go.
```

Three details worth knowing before you move expensive work here:

- **The two events are additive, not exclusive.** Adopting `didCommit` does not quiet `didChange` — it keeps firing per step, which is what lets a live readout follow the thumbs while the expensive work waits for the release. Move work *to* `didCommit`; do not drop `didChange`.
- Keyboard adjustments commit **per key-down, including auto-repeat** — holding an arrow key produces one commit per repeat, not one when the key is released. If a slider is realistically keyboard-driven, the commit handler may still need a debounce.
- The event follows values the app or the user asks for: a pointer release that actually moved the value, a keyboard adjustment, and the `setValue()` method. Re-seeding the component by changing `initialValue`, `minValue`, or `maxValue` fires neither `didCommit` nor `didChange`.

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

This API sets the value of the `Slider`. You can use it to programmatically change the value. The new value is clamped against the `minValue` and `maxValue` in effect **at the moment of the call**, so a deferred or debounced call made while those props are changing may clamp against the previous range. The call also fires `didChange` and `didCommit`, exactly as a user adjustment would. To reset a slider whose domain changes at runtime, rebind `initialValue` instead — that re-seeds without firing events.

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
| [backgroundColor-range-Slider](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-range-Slider--disabled](/docs/styles-and-themes/common-units/#color) | $color-surface-400 | $color-surface-800 |
| [backgroundColor-thumb-Slider](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-400 |
| [backgroundColor-thumb-Slider--active](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-400 |
| [backgroundColor-thumb-Slider--focus](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-thumb-Slider--hover](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-track-Slider](/docs/styles-and-themes/common-units/#color) | $color-surface-200 | $color-surface-200 |
| [backgroundColor-track-Slider--disabled](/docs/styles-and-themes/common-units/#color) | $color-surface-300 | $color-surface-600 |
| [borderColor-Slider](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [borderColor-Slider--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Slider--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-thumb-Slider](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-950 |
| [borderRadius-Slider](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-Slider--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Slider--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Slider--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Slider](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderStyle-Slider--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Slider--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Slider--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-thumb-Slider](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderWidth-Slider](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [borderWidth-Slider--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Slider--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Slider--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-thumb-Slider](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [boxShadow-Slider](/docs/styles-and-themes/common-units/#boxShadow) | none | none |
| [boxShadow-Slider--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--error--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--success--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--warning--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Slider--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-thumb-Slider](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-thumb-Slider--active](/docs/styles-and-themes/common-units/#boxShadow) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow-thumb-Slider--focus](/docs/styles-and-themes/common-units/#boxShadow) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
| [boxShadow-thumb-Slider--hover](/docs/styles-and-themes/common-units/#boxShadow) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) | 0 0 0 6px rgb(from $color-primary r g b / 0.4) |
