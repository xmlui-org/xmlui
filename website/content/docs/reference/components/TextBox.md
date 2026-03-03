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
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `validationMode`, `verboseValidationFeedback` |
| Styling Variant | `variant` |

## Properties [#properties]

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Input | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Input--disabled | $backgroundColor--disabled | $backgroundColor--disabled |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--default | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Input--default | $borderColor-Input-default | $borderColor-Input-default |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Input--default--hover | $borderColor-Input-default--hover | $borderColor-Input-default--hover |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Input--disabled | $borderColor--disabled | $borderColor--disabled |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Input--error | $borderColor-Input-default--error | $borderColor-Input-default--error |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Input--success | $borderColor-Input-default--success | $borderColor-Input-default--success |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Input--warning | $borderColor-Input-default--warning | $borderColor-Input-default--warning |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--default | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--hover | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Input | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextBox--default | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextBox--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextBox--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-TextBox--warning | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Input | solid | solid |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextBox--default | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextBox--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextBox--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TextBox--warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Input | 1px | 1px |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--default | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--default | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--default--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--default--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--error--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--success--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--warning--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-TextBox--warning--hover | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-Input | $textColor-subtitle | $textColor-subtitle |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TextBox--default | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TextBox--error | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TextBox--success | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-adornment-TextBox--warning | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-passwordToggle-Input | $textColor-subtitle | $textColor-subtitle |
| [color](/docs/styles-and-themes/common-units/#color)-passwordToggle-TextBox | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-passwordToggle-TextBox--focus | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-passwordToggle-TextBox--hover | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextBox--default | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextBox--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextBox--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-TextBox--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextBox--default | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextBox--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextBox--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TextBox--warning | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-adornment-Input | $space-2 | $space-2 |
| [gap](/docs/styles-and-themes/common-units/#size)-adornment-TextBox | *none* | *none* |
| [minHeight](/docs/styles-and-themes/common-units/#size-values)-Input | 39px | 39px |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Input--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Input--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextBox--default--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextBox--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextBox--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-TextBox--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Input--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextBox--default--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextBox--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextBox--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-TextBox--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Input--focus | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--default--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-TextBox--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TextBox | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TextBox | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TextBox | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-passwordToggle-TextBox | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TextBox | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-passwordToggle-TextBox | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TextBox | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TextBox | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TextBox | $space-2 | $space-2 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Input | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Input--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-Input | $textColor-subtitle | $textColor-subtitle |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextBox--default | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextBox--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextBox--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-TextBox--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--default | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--default--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--disabled | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TextBox--warning--hover | *none* | *none* |
