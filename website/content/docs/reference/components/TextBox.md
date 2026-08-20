# TextBox [#textbox]

`TextBox` captures user text input for forms, search fields, and data entry with support for validation, icons, and formatting hints.

**Key features:**
- **Visual enhancements**: Add icons and text at start/end positions for context and branding
- **Validation states**: Built-in visual indicators for valid, warning, and error states
- **Input control**: Support for initial values, programmatic focus, and value setting

Often used in forms, see [this guide](/docs/guide/forms) for details.

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

### `autoCapitalize` [#autocapitalize]

Sets the HTML `autocapitalize` attribute on the underlying input.

Available values: `off`, `none`, `sentences`, `words`, `characters`

### `autoComplete` [#autocomplete]

> [!DEF]  default: **"off"**

Sets the HTML `autocomplete` attribute on the underlying input. Boolean values are passed as `"on"` or `"off"`; string values are passed through.

### `autoCorrect` [#autocorrect]

Sets the HTML `autocorrect` attribute on the underlying input. When set, `true` is passed as `"on"` and `false` as `"off"`.

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <TextBox enabled="false" />
</App>
```

### `endIcon` [#endicon]

This property sets an optional icon to appear on the end (right side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: endIcon"
<App>
  <TextBox endIcon="email" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `endText` [#endtext]

This property sets an optional text to appear on the end (right side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: endText"
<App>
  <TextBox endText=".com" />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `gap` [#gap]

This property defines the gap between the adornments and the input area. If not set, the gap declared by the current theme is used.

### `initialValue` [#initialvalue]

> [!DEF]  default: **""**

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <TextBox initialValue="Example text" />
</App>
```

### `invalidMessages` [#invalidmessages]

The invalid messages to display for the input component.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

Try to enter a longer value into the input field below.

```xmlui-pg copy display name="Example: maxLength"
<App>
  <TextBox maxLength="16" />
</App>
```

### `passwordHiddenIcon` [#passwordhiddenicon]

> [!DEF]  default: **"eye-off"**

The icon to display when the password is hidden (when showPasswordToggle is true).

### `passwordVisibleIcon` [#passwordvisibleicon]

> [!DEF]  default: **"eye"**

The icon to display when the password is visible (when showPasswordToggle is true).

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder"
<App>
  <TextBox placeholder="This is a placeholder" />
</App>
```

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <TextBox initialValue="Example text" readOnly="true" />
</App>
```

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `showPasswordToggle` [#showpasswordtoggle]

> [!DEF]  default: **false**

If `true`, a toggle button is displayed to switch between showing and hiding the password input.

### `spellCheck` [#spellcheck]

Sets the HTML `spellcheck` attribute on the underlying input.

### `startIcon` [#starticon]

This property sets an optional icon to appear at the start (left side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: startIcon"
<App>
  <TextBox startIcon="hyperlink" />
</App>
```

It is possible to set the other adornments as well: [`endText`](#endtext), [`startIcon`](#starticon) and [`startText`](#starttext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `startText` [#starttext]

This property sets an optional text to appear at the start (left side when the left-to-right direction is set) of the input.

```xmlui-pg copy display name="Example: startText"
<App>
  <TextBox startText="www." />
</App>
```

It is possible to set the other adornments as well: [`endIcon`](#endicon), [`startIcon`](#starticon) and [`endText`](#endtext).

```xmlui-pg copy display name="Example: all adornments"
<App>
  <TextBox startIcon="hyperlink" startText="www." endIcon="email" endText=".com" />
</App>
```

### `type` [#type]

> [!DEF]  default: **"text"**

Sets the HTML input type. Use `"password"` to hide the entered text and classify the value as a secret in the audit pipeline; `"email"` to classify the value as sensitive (PII).

Available values: `text` **(default)**, `password`, `search`, `email`

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

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <TextBox />
  <TextBox validationStatus="valid" />
  <TextBox validationStatus="warning" />
  <TextBox validationStatus="error" />
</App>
```

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TextBox has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy {3} display name="Example: didChange"
<App var.field="">
  <TextBox initialValue="{field}" onDidChange="(val) => field = val" />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the TextBox has received the focus.

**Signature**: `gotFocus(): void`

Clicking on the `TextBox` in the example demo changes the label text.
Note how clicking elsewhere resets the text to its original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App>
  <TextBox
    initialValue="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}"
  />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the TextBox has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the `TextBox` component.

**Signature**: `focus(): void`

```xmlui-pg copy {2-3} display name="Example: focus"
<App>
  <Button label="Trigger Focus" onClick="inputComponent.focus()" />
  <TextBox id="inputComponent" />
</App>
```

### `setValue` [#setvalue]

This API sets the value of the `TextBox`. You can use it to programmatically change the value.

**Signature**: `setValue(value: string): void`

- `value`: The new value to set. If the value is empty, it will clear the input.

```xmlui-pg copy {10} display name="Example: setValue"
<App var.changes="">
  <TextBox
    id="inputField"
    readOnly="true"
    onDidChange="changes++"
  />
  <HStack>
    <Button
      label="Check"
      onClick="inputField.setValue('example ')"
    />
    <Text value="Number of changes: {changes}" />
  </HStack>
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): string | undefined`

In the example below, typing in the `TextBox` will also display the length of the text typed into it above the field:

```xmlui-pg copy {2-3} display name="Example: value"
<App>
  <Text value="TextBox content length: {inputComponent.value.length}" />
  <TextBox id="inputComponent" />
</App>
```

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`endAdornment`**: The adornment displayed at the end of the text box.
- **`input`**: The text box input area.
- **`label`**: The label displayed for the text box.
- **`startAdornment`**: The adornment displayed at the start of the text box.

**Default part**: `input`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Input](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-Input--disabled](/docs/styles-and-themes/common-units/#color) | $backgroundColor--disabled | $backgroundColor--disabled |
| [backgroundColor-TextBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TextBox--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Checkbox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Checkbox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Checkbox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Checkbox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Input](/docs/styles-and-themes/common-units/#color) | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor-Input--disabled](/docs/styles-and-themes/common-units/#color) | $borderColor--disabled | $borderColor--disabled |
| [borderColor-Input--error](/docs/styles-and-themes/common-units/#color) | $borderColor-Input-default--error | $borderColor-Input-default--error |
| [borderColor-Input--hover](/docs/styles-and-themes/common-units/#color) | $borderColor-Input-default--hover | $borderColor-Input-default--hover |
| [borderColor-Input--success](/docs/styles-and-themes/common-units/#color) | $borderColor-Input-default--success | $borderColor-Input-default--success |
| [borderColor-Input--warning](/docs/styles-and-themes/common-units/#color) | $borderColor-Input-default--warning | $borderColor-Input-default--warning |
| [borderColor-TextBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TextBox--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRadius-Checkbox](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Checkbox--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Checkbox--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Checkbox--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Input](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-TextBox](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TextBox--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TextBox--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-TextBox--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Input](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderStyle-TextBox](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TextBox--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TextBox--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TextBox--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-Input](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [borderWidth-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TextBox--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TextBox--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TextBox--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-TextBox](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--error--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--success--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--warning--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-TextBox--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [color-adornment-Input](/docs/styles-and-themes/common-units/#color) | $textColor-subtitle | $textColor-subtitle |
| [color-adornment-TextBox](/docs/styles-and-themes/common-units/#color) | $textColor-subtitle | $textColor-subtitle |
| [color-adornment-TextBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-TextBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-adornment-TextBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-passwordToggle-Input](/docs/styles-and-themes/common-units/#color) | $textColor-subtitle | $textColor-subtitle |
| [color-passwordToggle-TextBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-passwordToggle-TextBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-passwordToggle-TextBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [fontSize-placeholder-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-TextBox--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-TextBox--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-TextBox--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TextBox--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TextBox--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TextBox--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [gap-adornment-Input](/docs/styles-and-themes/common-units/#size) | $space-2 | $space-2 |
| [gap-adornment-TextBox](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| [minHeight-Input](/docs/styles-and-themes/common-units/#size-values) | 2.5rem | 2.5rem |
| [minHeight-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineColor-Input--focus](/docs/styles-and-themes/common-units/#color) | $outlineColor--focus | $outlineColor--focus |
| [outlineColor-TextBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-TextBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-TextBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-TextBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-Input--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineOffset--focus | $outlineOffset--focus |
| [outlineOffset-TextBox--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-TextBox--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-TextBox--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-TextBox--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-Input--focus](/docs/styles-and-themes/common-units/#border) | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle-TextBox--error--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-TextBox--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-TextBox--success--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-TextBox--warning--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-Input--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth-TextBox--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-TextBox--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-TextBox--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-TextBox--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TextBox](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingLeft-passwordToggle-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-passwordToggle-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TextBox](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TextBox](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [textColor-Input](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-Input--disabled](/docs/styles-and-themes/common-units/#color) | $textColor--disabled | $textColor--disabled |
| [textColor-placeholder-Input](/docs/styles-and-themes/common-units/#color) | $textColor-subtitle | $textColor-subtitle |
| [textColor-placeholder-TextBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-TextBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-TextBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-TextBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TextBox--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
