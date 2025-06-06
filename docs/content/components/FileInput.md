# FileInput [#fileinput]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `FileInput` is a user interface component that allows users to select files from their device's file system for upload (or processing its content otherwise).

## Properties [#properties]

### `acceptsFileType` [#acceptsfiletype]

A list of file types the input controls accepts provided as a string array.

### `autoFocus (default: false)` [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `buttonIcon` [#buttonicon]

The ID of the icon to display in the button. You can change the default icon for all FileInput instances with the "icon.browse:FileInput" declaration in the app configuration file.

### `buttonIconPosition` [#buttoniconposition]

This optional string determines the location of the button icon.

Available values: `start`, `end`

### `buttonLabel` [#buttonlabel]

This property is an optional string to set a label for the button part.

### `buttonPosition` [#buttonposition]

This property determines the position of the button relative to the input field. The default is "end".

Available values: `start`, `end`

### `buttonSize` [#buttonsize]

The size of the button (small, medium, large)

Available values:

| Value | Description |
| --- | --- |
| `xs` | Extra small button |
| `sm` | Small button |
| `md` | Medium button |
| `lg` | Large button |

### `buttonThemeColor` [#buttonthemecolor]

The button color scheme (primary, secondary, attention)

Available values: `attention`, `primary`, `secondary`

### `buttonVariant` [#buttonvariant]

The button variant to use

Available values: `solid`, `outlined`, `ghost`

### `directory (default: false)` [#directory-default-false]

This boolean property indicates whether the component allows selecting directories (`true`) or files only (`false`).

### `enabled (default: true)` [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `label` [#label]

This property sets the label of the component.

### `labelBreak (default: false)` [#labelbreak-default-false]

This boolean value indicates if the `FileInput` labels can be split into multiple lines if it would overflow the available label width.

### `labelPosition (default: "top")` [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `FileInput`.

### `multiple (default: false)` [#multiple-default-false]

This boolean property enables to add not just one (`false`), but multiple files to the field (`true`). This is done either by dragging onto the field or by selecting multiple files in the browser menu after clicking the input field button.

### `placeholder` [#placeholder]

A placeholder text that is visible in the input field when its empty.

### `readOnly (default: false)` [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` [#required]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus (default: "none")` [#validationstatus-default-none]

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

### `gotFocus` [#gotfocus]

This event is triggered when the FileInput has received the focus.

### `lostFocus` [#lostfocus]

This event is triggered when the FileInput has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method sets the focus on the FileInput.

### `open` [#open]

This API command triggers the file browsing dialog to open.

### `setValue` [#setvalue]

(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically.

### `value` [#value]

By setting an ID for the component, you can refer to the value of the field if set. If no value is set, the value will be undefined.

## Styling [#styling]

This component does not have any styles.
