%-DESC-START

**Key features:**
- **Drag and drop**: Drop files directly onto the input or use the file browser
- **File type filtering**: Restrict selection to specific file types using `acceptsFileType`
- **Multiple file selection**: Enable users to select multiple files simultaneously
- **Directory selection**: Allow folder selection instead of individual files
- **Customizable button**: Configure button text, icons, position, and styling to match your design

%-DESC-END


%-PROP-START acceptsFileType

```xmlui-pg copy display name="Example: acceptsFileType"
<App>
  <FileInput acceptsFileType="{['.txt', '.jpg']}" />
</App>
```

%-PROP-END

%-PROP-START buttonIcon

```xmlui-pg copy display name="Example: buttonIcon"
<App>
  <FileInput buttonIcon="drive" buttonLabel="Let there be drive" />
  <FileInput buttonIcon="drive" />
</App>
```

%-PROP-END

%-PROP-START buttonIconPosition

```xmlui-pg copy display name="Example: buttonIconPosition"
<App>
  <FileInput buttonIcon="drive" buttonLabel="End" buttonIconPosition="end" />
</App>
```

%-PROP-END

%-PROP-START buttonLabel

This property is an optional string to set a label for the button part.

```xmlui-pg copy display name="Example: label"
<App >
  <FileInput />
  <FileInput buttonLabel="I am the button label" />
</App>
```

%-PROP-END

%-PROP-START buttonSize

```xmlui-pg copy display name="Example: buttonSize"
<App>
  <FileInput buttonSize="lg" />
</App>
```

%-PROP-END

%-PROP-START buttonThemeColor

```xmlui-pg copy display name="Example: buttonThemeColor"
<App>
  <FileInput buttonThemeColor="secondary" />
</App>
```

%-PROP-END

%-PROP-START buttonVariant

```xmlui-pg copy display name="Example: buttonVariant"
<App>
  <FileInput buttonLabel="outlined" buttonVariant="outlined" />
</App>
```

%-PROP-END

%-PROP-STAR directory

```xmlui-pg copy display name="Example: directory"
<App>
  <FileInput directory="true" />
</App>
```

%-PROP-END

%-PROP-START multiple

```xmlui-pg copy display name="Example: multiple"
<App>
  <FileInput multiple="false" />
  <FileInput multiple="true" />
</App>
```

%-PROP-END

%-PROP-START parseAs

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
Right-click and save: [sample-products.csv](/resources/files/sample-products.csv). Then drag it onto the input, or click Browse to select it.
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

**Parsing Multiple Files**

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

%-PROP-END

%-PROP-START csvOptions

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

%-PROP-END

%-PROP-START validationStatus

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <FileInput />
  <FileInput validationStatus="valid" />
  <FileInput validationStatus="warning" />
  <FileInput validationStatus="error" />
</App>
```

%-EVENT-START didChange

Write in the input field and see how the `Text` underneath it is updated in accordingly.

```xmlui-pg copy {2} display name="Example: didChange"
<App var.field="">
  <FileInput onDidChange="(file) => field = file[0]?.name" />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

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

%-EVENT-END

%-EVENT-START lostFocus

(See the example above)

%-EVENT-END

%-EVENT-START parseError

This event is triggered when file parsing fails (when using `parseAs`). If not provided, parse errors are logged to the console.

**Signature**: `parseError(error: Error, file: File): void`

- `error`: The parsing error that occurred
- `file`: The file that failed to parse

```xmlui-pg copy display name="Example: parseError"
---app
<App var.items="{[]}">
  <FileInput
    parseAs="csv"
    onDidChange="data => items = data"
    onParseError="(err, file) => toast.error(file.name + ': ' + err.message)"
  />
  <List data="{items}" when="{items.length > 0}">
    <Text value="{$item.name}: ${$item.price}" />
  </List>
</App>
---desc
Right-click and save: [sample-broken.csv](/resources/files/sample-broken.csv). Then browse to sample-broken.csv.
```

```xmlui-pg copy display name="Example: JSON parseError"
---app
<App var.data="{[]}">
  <FileInput
    parseAs="json"
    onDidChange="rows => data = rows"
    onParseError="(err, file) => toast.error(file.name + ': ' + err.message)"
  />
  <List data="{data}" when="{data.length > 0}">
    <Text value="{$item.name}: ${$item.price}" />
  </List>
</App>
---desc
Right-click and save: [sample-broken.json](/resources/files/sample-broken.json). Then browse to sample-broken.json.
```

%-EVENT-END

%-API-START focus

```xmlui-pg copy /fileInputComponent.focus()/ display name="Example: focus"
<App>
  <Button label="Focus FileInput" onClick="fileInputComponent.focus()" />
  <FileInput id="fileInputComponent" />
</App>
```

%-API-END

%-API-START open

```xmlui-pg copy /fileInputComponent.open()/ display name="Example: open"
<App>
  <Button label="Open FileInput" onClick="fileInputComponent.open()" />
  <FileInput id="fileInputComponent" />
</App>
```

%-API-END

%-API-START value

In the example below, select a file using the file browser of the `FileInput` component
and note how the `Text` component displays the selected file's name:

```xmlui-pg copy {3-4} display name="Example: value"
<App>
  <Text value="Selected file name: {fileInputComponent.value}" />
  <FileInput id="fileInputComponent" />
</App>
```

%-API-END

%-API-START inProgress

This property indicates whether file parsing is currently in progress (when using `parseAs`).

**Signature**: `get inProgress(): boolean`

Use this property to show loading indicators while files are being parsed. See the "Large file with loading spinner" example in the `csvOptions` section for usage.

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

%-API-END

%-API-START getFields

Returns an array of column header names (available when `parseAs="csv"` and `header: true`, which is the default).

Right-click and save: [sample-products.csv](/resources/files/sample-products.csv). Then browse to sample-products.csv.

```xmlui-pg copy display name="Example: getFields"
<App var.products="{[]}">
  <FileInput
    id="csvInput"
    parseAs="csv"
    onDidChange="data => products = data"
  />
  <Text value="Columns: {csvInput.getFields()?.join(', ')}" when="{csvInput.getFields()}" />
  <List data="{products}" when="{products.length > 0}">
    <Text value="{$item.name}: ${$item.price}" />
  </List>
</App>
```

%-API-END

%-STYLE-START

The `FileInput` component does not theme variables directly.
However, it uses the [`Button`](/components/Button) and [`TextBox`](/components/TextBox) components under the hood.
Thus, modifying the styles of both of these components affects the `FileInput`.

See [Button styling](/components/Button#styling) and [TextBox styling](/components/TextBox#styling).

%-STYLE-END