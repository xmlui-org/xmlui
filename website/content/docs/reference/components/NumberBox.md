# NumberBox [#numberbox]

`NumberBox` provides a specialized input field for numeric values with built-in validation, spinner buttons, and flexible formatting options. It supports both integer and floating-point numbers, handles empty states as null values, and integrates seamlessly with form validation.

**Key features:**
- **Flexible numeric input**: Accepts integers, floating-point numbers, or empty values (stored as null)
- **Input constraints**: Configure minimum/maximum values, integer-only mode, and positive-only restrictions
- **Spinner buttons**: Built-in increment/decrement buttons with customizable step values and icons
- **Visual adornments**: Add icons or text to the start and end of the input field
- **Validation**: Built-in validation status indicators and form compatibility
- **Smart paste handling**: Only accepts pasted content that results in valid numeric values

The `NumberBox` is often used in forms. See the [this guide](/docs/guides/forms) for details.

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

If this boolean prop is set to true, the `NumberBox` input will be focused when appearing on the UI.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

Controls whether the input field is enabled (`true`) or disabled (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <NumberBox enabled="false" />
</App>
```

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

This string prop enables the display of an icon on the right side (left-to-right display) of the input field by providing a valid [icon name](/docs/reference/components/Icon).

```xmlui-pg copy display name="Example: endIcon"
<App>
  <NumberBox endIcon="email" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

This string prop enables the display of a custom string on the right side (left-to-right display) of the input field.

```xmlui-pg copy display name="Example: endText"
<App>
  <NumberBox endText=".com" />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `gap` [#gap]

This property defines the gap between the adornments and the input area.

### `hasSpinBox` [#hasspinbox]

> [!DEF]  default: **true**

This boolean prop shows (`true`) or hides (`false`) the spinner buttons for the input field.

```xmlui-pg copy display name="Example: hasSpinBox"
<App>
  <NumberBox hasSpinBox="true" initialValue="3" />
  <NumberBox hasSpinBox="false" initialValue="34" />
</App>
```

### `initialValue` [#initialvalue]

This property sets the component's initial value.

The initial value displayed in the input field.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <NumberBox initialValue="123" />
</App>
```

### `integersOnly` [#integersonly]

> [!DEF]  default: **false**

This boolean property signs whether the input field accepts integers only (`true`) or not (`false`).

```xmlui-pg copy display name="Example: integersOnly"
<App>
  <NumberBox integersOnly="true" initialValue="42" />
  <NumberBox integersOnly="false" initialValue="{Math.PI}" />
</App>
```

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `maxValue` [#maxvalue]

> [!DEF]  default: **999999999999999**

The maximum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.If not set, no maximum value check is done.

The maximum value the input field allows.
Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`,
otherwise it can only be an integer.

Try to enter a bigger value into the input field below than the maximum allowed.

```xmlui-pg copy display name="Example: maxValue"
<App>
  <NumberBox maxValue="100" initialValue="99" />
</App>
```

### `minValue` [#minvalue]

> [!DEF]  default: **-999999999999999**

The minimum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.If not set, no minimum value check is done.

Try to enter a bigger value into the input field below than the minimum allowed.

```xmlui-pg copy display name="Example: minValue"
<App>
  <NumberBox minValue="-100" initialValue="-99" />
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

A placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder"
<App>
  <NumberBox placeholder="This is a placeholder" />
</App>
```

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

If true, the component's value cannot be modified with user interactions.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <NumberBox initialValue="123" readOnly="true" />
</App>
```

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `spinnerDownIcon` [#spinnerdownicon]

Allows setting an alternate icon displayed in the NumberBox spinner for decrementing values. You can change the default icon for all NumberBox instances with the "icon.spinnerDown:NumberBox" declaration in the app configuration file.

### `spinnerUpIcon` [#spinnerupicon]

Allows setting an alternate icon displayed in the NumberBox spinner for incrementing values. You can change the default icon for all NumberBox instances with the "icon.spinnerUp:NumberBox" declaration in the app configuration file.

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

This string prop enables the display of an icon on the left side (left-to-right display) of the input field by providing a valid [icon name](/docs/reference/components/Icon).

```xmlui-pg copy display name="Example: startIcon"
<App>
  <NumberBox startIcon="hyperlink" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

This string prop enables the display of a custom string on the left side (left-to-right display) of the input field.

```xmlui-pg copy display name="Example: startText"
<App>
  <NumberBox startText="www." />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`endText`](#endtext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <NumberBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `step` [#step]

> [!DEF]  default: **1**

This prop governs how big the step when clicking on the spinner of the field.

The default stepping value is **1**.

Note that only integers are allowed to be entered.

```xmlui-pg copy display name="Example: step"
<App>
  <NumberBox initialValue="10" step="10" />
</App>
```

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

This prop is used to visually indicate status changes reacting to form field validation.

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <NumberBox />
  <NumberBox validationStatus="valid" />
  <NumberBox validationStatus="warning" />
  <NumberBox validationStatus="error" />
</App>
```

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

### `zeroOrPositive` [#zeroorpositive]

> [!DEF]  default: **false**

This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).

This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).
By default, this property is set to `false`.

```xmlui-pg copy display name="Example: zeroOrPositive"
<App>
  <NumberBox initialValue="123" zeroOrPositive="true" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of NumberBox has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

This event is triggered after the user has changed the field value.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="0">
  <NumberBox initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the NumberBox has received the focus.

**Signature**: `gotFocus(): void`

This event is triggered when the `NumberBox` receives focus. The following sample demonstrates this event.

```xmlui-pg name="NumberBox"
---app copy {3-4} display name="Example: gotFocus"
<App var.focused="{false}">
  <NumberBox
    onGotFocus="focused = true"
    onLostFocus="focused = false" />
  <Text>The NumberBox is {focused ? '' : 'not'} focused</Text>
</App>
---desc
Click into the `NumberBox` (and then click the text below):
```

### `lostFocus` [#lostfocus]

This event is triggered when the NumberBox has lost the focus.

**Signature**: `lostFocus(): void`

This event is triggered when the `NumberBox` loses focus.

(See the example above)

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This API focuses the input field of the `NumberBox`. You can use it to programmatically focus the field.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This API sets the value of the `NumberBox`. You can use it to programmatically change the value.

**Signature**: `setValue(value: number | undefined): void`

You can use this method to set the component's current value programmatically.

```xmlui-pg copy {3, 9, 12} display name="Example: value and setValue"
<App>
  <NumberBox
    id="numberbox"
    readOnly="true"
  />
  <HStack>
    <Button
      label="Set to 100"
      onClick="numberbox.setValue(100)" />
    <Button
      label="Set to 0"
      onClick="numberbox.setValue(0)" />
  </HStack>
</App>
```

### `value` [#value]

This API retrieves the current value of the `NumberBox`. You can use it to get the value programmatically.

**Signature**: `get value(): number | undefined`

You can query this read-only API property to get the input component's current value.

See an example in the `setValue` API method.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`conciseValidationFeedback`**: The concise validation feedback indicator.
- **`endAdornment`**: The adornment displayed at the end of the text box.
- **`input`**: The text box input area.
- **`label`**: The label displayed for the text box.
- **`spinnerDown`**: The spinner button for decrementing the value.
- **`spinnerUp`**: The spinner button for incrementing the value.
- **`startAdornment`**: The adornment displayed at the start of the text box.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-NumberBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NumberBox--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NumberBox--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRadius-NumberBox](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-NumberBox--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-NumberBox--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-NumberBox--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-NumberBox](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-NumberBox--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-NumberBox--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-NumberBox--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-NumberBox--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-NumberBox--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-NumberBox--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-NumberBox](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--error--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--success--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NumberBox--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [color-adornment-NumberBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-NumberBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-NumberBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-NumberBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-NumberBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [fontSize-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-NumberBox--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-NumberBox--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-NumberBox--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-NumberBox--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-NumberBox--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-NumberBox--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-NumberBox--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [gap-adornment-NumberBox](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| [minHeight-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineColor-NumberBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-NumberBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-NumberBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-NumberBox--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-NumberBox--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-NumberBox--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-NumberBox--error--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-NumberBox--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-NumberBox--success--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-NumberBox--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-NumberBox--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-NumberBox--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-NumberBox](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingLeft-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-NumberBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-NumberBox](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [textColor-NumberBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NumberBox--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-NumberBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-NumberBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-NumberBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-NumberBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-NumberBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
