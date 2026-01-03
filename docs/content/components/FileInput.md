# FileInput [#fileinput]

`FileInput` enables users to select files from their device's file system for upload or processing. It combines a text field displaying selected files with a customizable button that opens the system file browser. Use it for forms, media uploads, and document processing workflows.

**Key features:**
- **File type filtering**: Restrict selection to specific file types using `acceptsFileType`
- **Built-in parsing**: Automatically parse CSV and JSON files with `parseAs`
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
| `xs` | Extra small |
| `sm` | Small |
| `md` | Medium |
| `lg` | Large |
| `xl` | Extra large |

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

### `parseAs` [#parseas]

Automatically parse file contents as CSV or JSON. When set, the `onDidChange` event receives parsed data instead of raw File objects.

Available values: `"csv"`, `"json"`, `undefined` **(default)**

When `parseAs` is set, `acceptsFileType` is automatically inferred (`.csv` or `.json`) unless explicitly overridden.

```xmlui-pg copy display name="Example: parseAs CSV"
---app
<App var.products="{[]}">
  <FileInput
    parseAs="csv"
    onDidChange="data => products = data"
  />
  <List data="{products}" when="{products.length > 0}">
    <Text value="{$item.name}: ${$item.price}" />
  </List>
</App>
---desc
Right-click and save: [sample-products.csv](/resources/files/sample-products.csv). Then browse to sample-products.csv.
```

```xmlui-pg copy display name="Example: parseAs JSON"
---app
<App var.products="{[]}">
  <FileInput
    parseAs="json"
    onDidChange="data => products = data"
  />
  <List data="{products}" when="{products.length > 0}">
    <Text value="{$item.name}: ${$item.price} ({$item.category})" />
  </List>
</App>
---desc
Right-click and save: [sample-products.json](/resources/files/sample-products.json). Then browse to sample-products.json.
```

> **Note**: JSON parsing automatically converts single objects to arrays. If your JSON file contains a single object `{...}`, it will be wrapped as `[{...}]` for consistent handling.

```xmlui-pg copy display name="Example: JSON single object"
---app
<App var.config="{[]}">
  <FileInput
    parseAs="json"
    onDidChange="data => config = data"
  />
  <List data="{config}" when="{config.length > 0}">
    <Text value="App: {$item.appName} v{$item.version}" />
  </List>
</App>
---desc
Right-click and save: [sample-config.json](/resources/files/sample-config.json). Then browse to sample-config.json.
```

### `csvOptions` [#csvoptions]

Configuration options for CSV parsing (used when `parseAs="csv"`). Supports all [Papa Parse configuration options](https://www.papaparse.com/docs#config).

**Default options**: `{ header: true, skipEmptyLines: true }`

Common options:
- `delimiter`: Column separator (default: `","`)
- `header`: First row contains column names (default: `true`)
- `dynamicTyping`: Auto-convert numbers and booleans (default: `false`)
- `skipEmptyLines`: Ignore empty rows (default: `true`)
- `transform`: Function to transform values during parsing

```xmlui-pg copy display name="Example: CSV with semicolon delimiter"
 ---app
<App var.data="{[]}">
  <FileInput
    parseAs="csv"
    csvOptions="{{ delimiter: ';' }}"
    onDidChange="rows => data = rows"
  />
  <List data="{data}" when="{data.length > 0}">
    <Text value="{$item.name}: ${$item.price} ({$item.category})" />
  </List>
</App>
---desc
Right-click and save: [sample-products-semicolon.csv](/resources/files/sample-products-semicolon.csv). Then browse to sample-products-semicolon.csv.
```

```xmlui-pg copy display name="Example: CSV with type conversion"
---app
<App var.products="{[]}">
  <FileInput
    parseAs="csv"
    csvOptions="{{ dynamicTyping: true }}"
    onDidChange="data => products = data"
  />
  <List data="{products}" when="{products.length > 0}">
    <Text value="{$item.name}: ${$item.price} (inStock: {$item.inStock})" />
  </List>
</App>
---desc
Right-click and save: [sample-products-typed.csv](/resources/files/sample-products-typed.csv). Then browse to sample-products-typed.csv.
```

> **Note**: `dynamicTyping: true` is not a default. It converts string values to numbers and booleans during parsing.

```xmlui-pg copy display name="Example: TSV (tab-delimited) files"
---app
<App var.products="{[]}">
  <FileInput
    parseAs="csv"
    acceptsFileType=".tsv"
    csvOptions="{{ delimiter: '\t' }}"
    onDidChange="data => products = data"
  />
  <List data="{products}" when="{products.length > 0}">
    <Text value="{$item.name}: ${$item.price} - {$item.category}" />
  </List>
</App>
---desc
Right-click and save: [sample-products-tsv.tsv](/resources/files/sample-products-tsv.tsv). Then browse to sample-products-tsv.tsv.
```

```xmlui-pg copy display name="Example: Large file with loading spinner"
---app
<App var.inventory="{[]}">
  <FileInput
    id="fileInput"
    parseAs="csv"
    csvOptions="{{ dynamicTyping: true }}"
    onDidChange="data => inventory = data"
  />
  <HStack>
    <Spinner when="{fileInput.inProgress}" delay="{200}" />
    <Text value="Parsing..." when="{fileInput.inProgress}" />
    <Text value="{inventory.length} items loaded" when="{!fileInput.inProgress && inventory.length > 0}" />
  </HStack>
  <List data="{inventory.slice(0, 10)}" when="{!fileInput.inProgress && inventory.length > 0}">
    <Text value="{$item.sku}: {$item.name} - ${$item.price}" />
  </List>
  <Text value="Showing first 10 of {inventory.length} items" when="{inventory.length > 10}" />
</App>
---desc
Right-click and save: [sample-inventory.csv](/resources/files/sample-inventory.csv) (5000 rows). Then browse to sample-inventory.csv.
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of FileInput has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

Write in the input field and see how the `Text` underneath it is updated in accordingly.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="">
  <FileInput onDidChange="(file) => field = file[0]?.name" />
  <Text value="{field}" />
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the FileInput has received the focus.

**Signature**: `gotFocus(): void`

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

**Signature**: `lostFocus(): void`

(See the example above)

### `parseError` [#parseerror]

This event is triggered when file parsing fails (when using `parseAs`). If not provided, parse errors are logged to the console.

**Signature**: `parseError(error: Error, file: File): void`

- `error`: The parsing error that occurred
- `file`: The file that failed to parse

```xmlui-pg copy display name="Example: parseError"
 ---app
<App var.errorMessage="" var.items="{[]}">
  <FileInput
    parseAs="csv"
    onDidChange="data => items = data"
    onParseError="(err, file) => errorMessage = file.name + ': ' + err.message"
  />
  <Text value="{errorMessage}" color="$color-danger-500" when="{errorMessage}" />
  <List data="{items}" when="{items.length > 0}">
    <Text value="{$item.name}: ${$item.price}" />
  </List>
</App>
---desc
Right-click and save: [sample-broken.csv](/resources/files/sample-broken.csv). Then browse to sample-broken.csv.
```

```xmlui-pg copy display name="Example: JSON parseError"
---app
<App var.errorMessage="" var.data="{[]}">
  <FileInput
    parseAs="json"
    onDidChange="data => data = data"
    onParseError="(err, file) => errorMessage = file.name + ': ' + err.message"
  />
  <Text value="{errorMessage}" color="$color-danger-500" when="{errorMessage}" />
  <List data="{data}" when="{data.length > 0}">
    <Text value="{$item.name}: ${$item.price}" />
  </List>
</App>
---desc
Right-click and save: [sample-broken.json](/resources/files/sample-broken.json). Then browse to sample-broken.json.
```

## Parsing Multiple Files [#parsing-multiple-files]

When using `parseAs` with `multiple="true"`, the `onDidChange` event receives an array of parse results. Each result contains the original file, parsed data, and any error that occurred.

**Type signature**:
```typescript
type ParseResult = {
  file: File;      // Original file reference
  data: any[];     // Parsed data (empty array if error)
  error?: Error;   // Parse error, if any
};
```

```xmlui-pg copy display name="Example: Multiple CSV files"
<App var.results="{[]}">
  <FileInput
    parseAs="csv"
    multiple="true"
    onDidChange="data => results = data"
  />
  <List data="{results}" when="{results.length > 0}">
    <Text value="{$item.file.name}: {$item.data.length} rows" when="{!$item.error}" />
    <Text value="{$item.file.name}: {$item.error.message}" color="$color-danger-500" when="{$item.error}" />
  </List>
</App>
```

```xmlui-pg copy display name="Example: Multiple CSV with success/fail counts"
<App var.successCount="{0}" var.failCount="{0}">
  <FileInput
    parseAs="csv"
    multiple="true"
    csvOptions="{{ dynamicTyping: true }}"
    onDidChange="{results => {
      successCount = results.filter(r => !r.error).length;
      failCount = results.filter(r => r.error).length;
    }}"
  />
  <HStack when="{successCount + failCount > 0}">
    <Text value="Success: {successCount}" color="$color-success-500" />
    <Text value="Failed: {failCount}" color="$color-danger-500" />
  </HStack>
</App>
```

## Migration from window.parseCsv [#migration]

If you're using the `window.parseCsv()` pattern from earlier tutorials, you can simplify your code with built-in parsing:

**Before**:
```xmlui
<FileInput
  acceptsFileType="{['.csv']}"
  onDidChange="{ (val) => {
    parsedCsv = window.parseCsv(val[0]).map((item, idx) => {
      return {...item, id: idx};
    });
  }}"
/>
```

**After**:
```xmlui
<FileInput
  parseAs="csv"
  onDidChange="data => parsedCsv = data"
/>
<Table data="{parsedCsv}" idKey="name" />
```

**Note**: Manual ID mapping is no longer needed since Table now supports the `idKey` property.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This API command focuses the input field of the component.

**Signature**: `focus(): void`

```xmlui-pg copy /fileInputComponent.focus()/ display name="Example: focus"
<App>
  <Button label="Focus FileInput" onClick="fileInputComponent.focus()" />
  <FileInput id="fileInputComponent" />
</App>
```

### `open` [#open]

This API command triggers the file browsing dialog to open.

**Signature**: `open(): void`

```xmlui-pg copy /fileInputComponent.open()/ display name="Example: open"
<App>
  <Button label="Open FileInput" onClick="fileInputComponent.open()" />
  <FileInput id="fileInputComponent" />
</App>
```

### `inProgress` [#inprogress]

This property indicates whether file parsing is currently in progress (when using `parseAs`).

**Signature**: `get inProgress(): boolean`

Use this property to show loading indicators while files are being parsed. See the "Large file with loading spinner" example above for usage.

```xmlui-pg copy display name="Example: inProgress"
<App var.data="{[]}">
  <FileInput
    id="csvInput"
    parseAs="csv"
    onDidChange="rows => data = rows"
  />
  <Text value="Parsing file..." when="{csvInput.inProgress}" />
  <Text value="{data.length} rows loaded" when="{!csvInput.inProgress && data.length > 0}" />
</App>
```

### `value` [#value]

This property holds the current value of the component, which is an array of files.

**Signature**: `get value(): File[]`

In the example below, select a file using the file browser of the `FileInput` component
and note how the `Text` component displays the selected file's name:

```xmlui-pg copy {3-4} display name="Example: value"
<App>
  <Text value="Selected file name: {fileInputComponent.value}" />
  <FileInput id="fileInputComponent" />
</App>
```

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`input`**: The file input area displaying selected file names.
- **`label`**: The label displayed for the file input.

## Styling [#styling]

The `FileInput` component does not theme variables directly.
However, it uses the [`Button`](/components/Button) and [`TextBox`](/components/TextBox) components under the hood.
Thus, modifying the styles of both of these components affects the `FileInput`.

See [Button styling](/components/Button#styling) and [TextBox styling](/components/TextBox#styling).

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-FileInput--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-FileInput--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-FileInput--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-FileInput--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-FileInput--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-FileInput--focus | *none* | *none* |
