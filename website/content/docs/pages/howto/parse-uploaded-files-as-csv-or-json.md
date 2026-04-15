# Parse uploaded files as CSV or JSON

Use `FileInput` `parseAs` to auto-parse files, configure `csvOptions` (Papa Parse), and handle `parseError`.

When `parseAs` is set to `"csv"` or `"json"`, `FileInput` automatically parses each selected file and delivers the structured data through the `didChange` event. The event payload switches from a plain `File[]` to an object containing both the raw files and the parsed results, so you can display data immediately without writing any parsing logic.

```xmlui-pg copy display name="Parse CSV and JSON file uploads"
---app display
<App>
  <variable name="rows" value="{[]}" />
  <variable name="errorMsg" value="" />

  <FileInput
    label="Upload a CSV file"
    parseAs="csv"
    csvOptions="{{ header: true, skipEmptyLines: true, dynamicTyping: true }}"
    didChange="(payload) => {
      errorMsg = '';
      if (payload.parsedData && payload.parsedData[0]) {
        rows = payload.parsedData[0].data;
      }
    }"
    parseError="(err, file) => {
      errorMsg = 'Parse error in ' + file.name + ': ' + err.message;
    }"
  />

  <Text when="{errorMsg}" themeColor="attention">{errorMsg}</Text>
  <Text 
    when="{rows.length === 0}" 
    variant="caption">
    No data yet. Upload a CSV to see its contents.
  </Text>
  <Table when="{rows.length > 0}" data="{rows}" />
</App>
```

## Key points

**`parseAs` switches the `didChange` payload**: Without `parseAs`, `didChange` receives `File[]`. With `parseAs="csv"` or `parseAs="json"`, it receives `{ files: File[], parsedData: ParseResult[] }` where each `ParseResult` is `{ file, data, error? }`. Access parsed rows via `payload.parsedData[0].data`.

**`csvOptions` configures PapaParse**: Pass a `{{ }}` object literal with PapaParse options — `header: true` treats the first row as column names, `skipEmptyLines: true` removes blank rows, `dynamicTyping: true` converts numeric strings to numbers automatically. The default is `{ header: true, skipEmptyLines: true }`.

**`parseError` fires per file on failure**: The event receives `(error, file)` — use it to show the user which file failed and why. Both parse failures (malformed JSON, CSV encoding errors) and format mismatches trigger this event.

**`parseAs` infers `acceptsFileType` automatically**: Setting `parseAs="csv"` restricts the file picker to `.csv` files. Setting `parseAs="json"` restricts to `.json`. Override this by explicitly setting `acceptsFileType` if you need a different extension.

**Use `inProgress` to show a loading state**: While parsing is in progress, `fileInputId.inProgress` is `true`. Bind it to a spinner or disable form submission until parsing completes — especially important for large CSV files.

---

## See also

- [Submit a form with file uploads](/docs/howto/submit-a-form-with-file-uploads) — combining FileInput with a Form
- [Transform form data before submission](/docs/howto/transform-form-data-before-submission) — post-process parsed data before sending to an API
- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) — skeleton patterns for async data
