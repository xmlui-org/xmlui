# FileInput [#fileinput]

`FileInput` enables users to select files from their device's file system for upload or processing. It combines a text field displaying selected files with a customizable button that opens the system file browser. Use it for forms, media uploads, and document processing workflows.

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

### `acceptsFileType` [#acceptsfiletype]

An optional list of file types the input controls accepts provided as a string array.

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `buttonIcon` [#buttonicon]

The ID of the icon to display in the button. You can change the default icon for all FileInput instances with the "icon.browse:FileInput" declaration in the app configuration file.

### `buttonIconPosition` [#buttoniconposition]

> [!DEF]  default: **"start"**

This optional string determines the location of the button icon.

Available values: `start` **(default)**, `end`

### `buttonLabel` [#buttonlabel]

This property is an optional string to set a label for the button part.

### `buttonPosition` [#buttonposition]

> [!DEF]  default: **"end"**

This property determines the position of the button relative to the input field.

Available values: `start`, `end` **(default)**

### `buttonSize` [#buttonsize]

The size of the button (small, medium, large)

Available values:

| Value | Description |
| --- | --- |
| `xs` | Extra small |
| `sm` | Small |
| `md` | Medium |
| `lg` | Large |
| `xl` | Extra large |

### `buttonThemeColor` [#buttonthemecolor]

> [!DEF]  default: **"primary"**

The button color scheme (primary, secondary, attention)

Available values: `attention`, `primary` **(default)**, `secondary`

### `buttonVariant` [#buttonvariant]

The button variant to use

Available values: `solid`, `outlined`, `ghost`

### `csvOptions` [#csvoptions]

Configuration options for CSV parsing (used when `parseAs="csv"`). Supports all Papa Parse configuration options. Default options: `{ header: true, skipEmptyLines: true }`. Common options include `delimiter`, `header`, `dynamicTyping`, `skipEmptyLines`, and `transform`.

### `directory` [#directory]

> [!DEF]  default: **false**

This boolean property indicates whether the component allows selecting directories (`true`) or files only (`false`).

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `multiple` [#multiple]

> [!DEF]  default: **false**

This boolean property enables to add not just one (`false`), but multiple files to the field (`true`). This is done either by dragging onto the field or by selecting multiple files in the browser menu after clicking the input field button.

### `parseAs` [#parseas]

Automatically parse file contents as CSV or JSON. When set, the `onDidChange` event receives an object `{ files: File[], parsedData: ParseResult[] }` containing both the raw files and parsed data. Each `ParseResult` includes `file`, `data` (parsed rows), and optional `error`. When `parseAs` is set, `acceptsFileType` is automatically inferred (e.g., ".csv" or ".json") unless explicitly overridden. Empty files are handled gracefully, returning an empty data array.

Available values: `csv`, `json`

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus` [#validationstatus]

> [!DEF]  default: **"none"**

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

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the FileInput has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the FileInput has lost the focus.

**Signature**: `lostFocus(): void`

### `parseError` [#parseerror]

This event is triggered when file parsing fails. Receives the error and the file that failed to parse.

**Signature**: `parseError(error: Error, file: File): void`

- `error`: The parsing error that occurred
- `file`: The file that failed to parse

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This API command focuses the input field of the component.

**Signature**: `focus(): void`

### `getFields` [#getfields]

This method returns the column headers from the most recently parsed CSV file.

**Signature**: `getFields(): string[] | undefined`

### `inProgress` [#inprogress]

This property indicates whether file parsing is currently in progress (when using parseAs).

**Signature**: `get inProgress(): boolean`

### `open` [#open]

This API command triggers the file browsing dialog to open.

**Signature**: `open(): void`

### `setValue` [#setvalue]

This method sets the current value of the component.

**Signature**: `setValue(files: File[]): void`

- `files`: An array of File objects to set as the current value of the component.

### `value` [#value]

This property holds the current value of the component, which is an array of files.

**Signature**: `get value(): File[]`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`input`**: The file input area displaying selected file names.
- **`label`**: The label displayed for the file input.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-FileInput--focus | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-FileInput--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-FileInput--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-FileInput--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-FileInput--focus | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
