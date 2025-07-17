# FileInput [#fileinput]

`FileInput` enables users to select files from their device's file system for upload or processing. It combines a text field displaying selected files with a customizable button that opens the system file browser. Use it for forms, media uploads, and document processing workflows.

**Key features:**
- **File type filtering**: Restrict selection to specific file types using `acceptsFileType`
- **Multiple file selection**: Enable users to select multiple files simultaneously
- **Directory selection**: Allow folder selection instead of individual files
- **Customizable button**: Configure button text, icons, position, and styling to match your design

## Properties [#properties]

### `acceptsFileType` [#acceptsfiletype]

An optional list of file types the input controls accepts provided as a string array.

```xmlui-pg copy display name="Example: acceptsFileType"
<App>
  <FileInput acceptsFileType="{['.txt', '.jpg']}" />
</App>
```

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `buttonIcon` [#buttonicon]

The ID of the icon to display in the button. You can change the default icon for all FileInput instances with the "icon.browse:FileInput" declaration in the app configuration file.

```xmlui-pg copy display name="Example: buttonIcon"
<App>
  <FileInput buttonIcon="drive" buttonLabel="Let there be drive" />
  <FileInput buttonIcon="drive" />
</App>
```

### `buttonIconPosition` (default: "start") [#buttoniconposition-default-start]

This optional string determines the location of the button icon.

Available values: `start` **(default)**, `end`

```xmlui-pg copy display name="Example: buttonIconPosition"
<App>
  <FileInput buttonIcon="drive" buttonLabel="End" buttonIconPosition="end" />
</App>
```

### `buttonLabel` [#buttonlabel]

This property is an optional string to set a label for the button part.

This property is an optional string to set a label for the button part.

```xmlui-pg copy display name="Example: label"
<App >
  <FileInput />
  <FileInput buttonLabel="I am the button label" />
</App>
```

### `buttonPosition` (default: "end") [#buttonposition-default-end]

This property determines the position of the button relative to the input field.

Available values: `start`, `end` **(default)**

### `buttonSize` [#buttonsize]

The size of the button (small, medium, large)

Available values:

| Value | Description |
| --- | --- |
| `xs` | Extra small button |
| `sm` | Small button |
| `md` | Medium button |
| `lg` | Large button |

```xmlui-pg copy display name="Example: buttonSize"
<App>
  <FileInput buttonSize="lg" />
</App>
```

### `buttonThemeColor` (default: "primary") [#buttonthemecolor-default-primary]

The button color scheme (primary, secondary, attention)

Available values: `attention`, `primary` **(default)**, `secondary`

```xmlui-pg copy display name="Example: buttonThemeColor"
<App>
  <FileInput buttonThemeColor="secondary" />
</App>
```

### `buttonVariant` [#buttonvariant]

The button variant to use

Available values: `solid`, `outlined`, `ghost`

```xmlui-pg copy display name="Example: buttonVariant"
<App>
  <FileInput buttonLabel="outlined" buttonVariant="outlined" />
</App>
```

### `directory` (default: false) [#directory-default-false]

This boolean property indicates whether the component allows selecting directories (`true`) or files only (`false`).

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: false) [#labelbreak-default-false]

This boolean value indicates if the `FileInput` label can be split into multiple lines if it would overflow the available label width.

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

This property sets the width of the `FileInput` component's label. If not defined, the label's width will be determined by its content and the available space.

### `multiple` (default: false) [#multiple-default-false]

This boolean property enables to add not just one (`false`), but multiple files to the field (`true`). This is done either by dragging onto the field or by selecting multiple files in the browser menu after clicking the input field button.

```xmlui-pg copy display name="Example: multiple"
<App>
  <FileInput multiple="false" />
  <FileInput multiple="true" />
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of FileInput has changed.

Write in the input field and see how the `Text` underneath it is updated in accordingly.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="">
  <FileInput onDidChange="(file) => field = file[0]?.name" />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the FileInput has received the focus.

Clicking on the `FileInput` in the example demo changes the label text.
Note how clicking elsewhere resets the text to the original.

```xmlui-pg copy {4-5} display name="Example: gotFocus/lostFocus"
<App>
  <FileInput
    buttonLabel="{focused === true ? 'I got focused!' : 'I lost focus...'}"
    onGotFocus="focused = true"
    onLostFocus="focused = false"
    var.focused="{false}"
  />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the FileInput has lost the focus.

(See the example above)

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the FileInput.

```xmlui-pg copy {2-3} display name="Example: focus"
<App>
  <HStack>
    <Button label="Focus FileInput" onClick="fileInputComponent.focus()" />
    <FileInput id="fileInputComponent" />
  </HStack>
</App>
```

### `open` [#open]

This API command triggers the file browsing dialog to open.

```xmlui-pg copy {3-4} display name="Example: open"
<App>
  <HStack>
    <Button label="Open FileInput" onClick="fileInputComponent.open()" />
    <FileInput id="fileInputComponent" />
  </HStack>
</App>
```

### `setValue` [#setvalue]

(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically.

(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically.

### `value` [#value]

By setting an ID for the component, you can refer to the value of the field if set. If no value is set, the value will be undefined.

In the example below, select a file using the file browser of the `FileInput` component
and note how the `Text` component displays the selected file's name:

```xmlui-pg copy {2-3} display name="Example: value"
<App>
  <HStack>
    <Text value="Selected file name: {fileInputComponent.value}" />
    <FileInput id="fileInputComponent" />
  </HStack>
</App>
```

## Styling [#styling]

The `FileInput` component does not theme variables directly.
However, it uses the [`Button`](/components/Button) and [`TextBox`](/components/TextBox) components under the hood.
Thus, modifying the styles of both of these components affects the `FileInput`.

See [Button styling](/components/Button#styling) and [TextBox styling](/components/TextBox#styling).
