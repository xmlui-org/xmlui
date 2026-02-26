# TextArea [#textarea]

`TextArea` provides a multiline text input area.

It is often used in forms, see [this guide](/docs/guide/forms) for details.

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

### `autoSize` [#autosize]

> [!DEF]  default: **false**

If set to `true`, this boolean property enables the `TextArea` to resize automatically based on the number of lines inside it.

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

Write multiple lines in the `TextArea` in the demo below to see how it resizes automatically.

```xmlui-pg copy display name="Example: autoSize" height="240px"
<App>
  <TextArea autoSize="true" />
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <TextArea enabled="false" />
</App>
```

### `enterSubmits` [#entersubmits]

> [!DEF]  default: **true**

This optional boolean property indicates whether pressing the `Enter` key on the keyboard prompts the parent `Form` component to submit.

Press `Enter` after writing something in the `TextArea` in the demo below.
See [Using Forms](/docs/forms) for details.

```xmlui-pg copy display name="Example: enterSubmits"
<App>
  <Form onSubmit="toast.success(JSON.stringify(address.value))">
    <TextArea
      id="address"
      enterSubmits="true"
      initialValue="Suzy Queue, 4455 Landing Lange, APT 4, Louisville, KY 40018-1234" />
  </Form>
</App>
```

### `escResets` [#escresets]

> [!DEF]  default: **false**

This boolean property indicates whether the TextArea contents should be reset when pressing the ESC key.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

The initial value displayed in the input field.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <TextArea initialValue="Example text" />
</App>
```

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `maxRows` [#maxrows]

This optional property sets the maximum number of text rows the `TextArea` can grow. If not set, the number of rows is unlimited.

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

```xmlui-pg copy {3} display name="Example: maxRows" height="160px"
<App>
  <TextArea
    maxRows="3"
    initialValue="Lorem ipsum dolor sit amet,
    consectetur adipiscing elit,
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." />
</App>
```

### `minRows` [#minrows]

This optional property sets the minimum number of text rows the `TextArea` can shrink. If not set, the minimum number of rows is 1.

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

```xmlui-pg copy display name="Example: minRows" height="200px"
<App>
  <TextArea minRows="3" initialValue="Lorem ipsum dolor sit amet..." />
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder"
<App>
  <TextArea placeholder="This is a placeholder" />
</App>
```

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <TextArea initialValue="Example text" readOnly="{true}" />
</App>
```

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `resize` [#resize]

This optional property specifies in which dimensions can the `TextArea` be resized by the user.

Available values:

| Value | Description |
| --- | --- |
| `(undefined)` | No resizing |
| `horizontal` | Can only resize horizontally |
| `vertical` | Can only resize vertically |
| `both` | Can resize in both dimensions |

If you allow resizing, the `TextArea` turns off automatic sizing.

When you allow vertical resizing, you can limit the sizable range according to `minRows` and `maxRows`.

Drag the small resize indicators at the bottom right on each of the controls in the demo.

```xmlui-pg copy display name="Example: resize" height="300px"
<App>
  <TextArea resize="vertical" minRows="1" maxRows="8" />
  <TextArea resize="both" />
</App>
```

### `rows` [#rows]

> [!DEF]  default: **2**

Specifies the number of rows the component initially has.

> **Note**: If either `autoSize`, `maxRows` or `minRows` is set, the `rows` prop has no effect.

```xmlui-pg copy display name="Example: rows"
<App>
  <TextArea rows="10" />
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

This prop is used to visually indicate status changes reacting to form field validation.

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <TextArea />
  <TextArea validationStatus="valid" />
  <TextArea validationStatus="warning" />
  <TextArea validationStatus="error" />
</App>
```

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of TextArea has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Write in the input field and see how the `Text` underneath it is updated in parallel.

```xmlui-pg copy display name="Example: didChange"
<App var.field="">
  <TextArea 
    initialValue="{field}" 
    onDidChange="(val) => field = val" 
  />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the TextArea has received the focus.

**Signature**: `gotFocus(): void`

Clicking on the `TextArea` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy display name="Example: gotFocus/lostFocus"
<App>
  <TextArea
    initialValue="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}" />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the TextArea has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the `TextArea` component.

**Signature**: `focus(): void`

```xmlui-pg copy display name="Example: focus"
<App>
  <Button label="Trigger Focus" onClick="inputComponent.focus()" />
  <TextArea id="inputComponent" />
</App>
```

### `setValue` [#setvalue]

You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).

```xmlui-pg copy display name="Example: setValue"
<App var.changes="">
  <TextArea
    id="inputField"
    readOnly="true"
    onDidChange="changes++" />
  <HStack>
    <Button
      label="Check"
      onClick="inputField.setValue('example ')" />
    <Text value="Number of changes: {changes}" />
  </HStack>
</App>
```

### `value` [#value]

You can query the component's value. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): string | undefined`

In the example below, typing in the `TextArea` will also display the length of the text typed into it above the field:

```xmlui-pg copy display name="Example: value"
<App>
  <Text value="TextArea content length: {inputComponent.value.length}" />
  <TextArea id="inputComponent" />
</App>
```

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`endAdornment`**: The adornment displayed at the end of the text area.
- **`input`**: The text area input.
- **`label`**: The label displayed for the text area.
- **`startAdornment`**: The adornment displayed at the start of the text area.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--default--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TextArea--warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TextArea--warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextArea--default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextArea--error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextArea--success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-TextArea--warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextArea--default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextArea--error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextArea--success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TextArea--warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextArea--default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextArea--error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextArea--success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TextArea--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-TextArea--warning--hover | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextArea--default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextArea--error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextArea--success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-TextArea--warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextArea--default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextArea--error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextArea--success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TextArea--warning | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextArea--default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextArea--default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextArea--error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextArea--success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-TextArea--warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextArea--default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextArea--error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextArea--success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-TextArea--warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextArea--default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextArea--error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextArea--success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-TextArea--warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TextArea | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TextArea | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TextArea | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TextArea | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TextArea | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TextArea | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TextArea | $space-2 | $space-2 |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextArea--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextArea--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextArea--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-TextArea--warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--default--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--error--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--success--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--warning--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TextArea--warning--hover | *none* | *none* |
