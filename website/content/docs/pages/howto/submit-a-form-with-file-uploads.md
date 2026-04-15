# Submit a form with file uploads

Use FileInput to include a file picker in a form, or use FileUploadDropZone for a drag-and-drop experience.

A support ticket form has standard text fields plus an optional attachment. Adding `<FileInput>` as a direct child of the form places a file picker inline with the other fields. The file is included in the form data under its `bindTo` name when the form submits.

```xmlui-pg copy display name="Support ticket form with file attachment"
---app display
<App>
  <Form
    data="{{ subject: '', description: '' }}"
    onSubmit="(data) => toast.success('Ticket submitted. Attachment: ' + 
      (data.attachment ? data.attachment[0]?.name : 'none'))"
    saveLabel="Submit ticket"
  >
    <TextBox label="Subject" bindTo="subject" required="true" />
    <TextArea label="Description" bindTo="description" required="true" />
    <FileInput
      label="Attachment (optional)"
      bindTo="attachment"
      multiple="false"
      acceptsFileType="{['.pdf', '.png', '.jpg']}"
    />
  </Form>
</App>
```

## Key points

**`FileInput` binds directly to the form**: Place `<FileInput>` inside a `<Form>` with a `bindTo` prop to include a file picker as a regular form field. The selected file (or files) is stored in the form data under the `bindTo` name and arrives in `onSubmit`'s `data` object:

```xmlui
<FileInput
  label="Resume"
  bindTo="resume"
  acceptsFileType="{['.pdf', '.docx']}"
/>
```

**`multiple="true"` allows selecting several files at once**: The value becomes an array of `File` objects instead of a single file. Accessing individual files in `onSubmit` uses standard array indexing:

```xmlui
<FileInput bindTo="screenshots" multiple="true" />
<!-- onSubmit: data.screenshots is File[] -->
```

**`acceptsFileType` restricts the file picker**: Pass a binding-expression array of extension strings. The browser’s file dialog filters to those types, and XMLUI validates the selection before running other validators:

```xmlui
<FileInput
  bindTo="image"
  acceptsFileType="{['.png', '.jpg', '.webp']}"
/>
```

**`parseAs="csv"` or `parseAs="json"` auto-parses file contents**: When you need the file’s contents rather than the raw `File` object, set `parseAs`. XMLUI reads the file and parses it; `onSubmit` receives the parsed value:

```xmlui
<FileInput
  bindTo="importData"
  acceptsFileType="{['.csv']}"
  parseAs="csv"
/>
<!-- onSubmit: data.importData is an array of row objects -->
```

**`FileUploadDropZone` for drag-and-drop uploads**: For a richer drop-zone UI outside a regular form submit flow, use `FileUploadDropZone` independently. Its `onUpload` event fires with the dropped files; you handle the upload manually:

```xmlui
<FileUploadDropZone
  acceptedFileTypes="{['.pdf']}"
  maxFiles="{3}"
  onUpload="(files) => uploadFiles(files)"
  text="Drop PDFs here or click to browse"
/>
```

---

**See also**
- [FileInput component](/docs/reference/components/FileInput) — `bindTo`, `multiple`, `acceptsFileType`, `parseAs`, and `noSubmit`
- [FileUploadDropZone component](/docs/reference/components/FileUploadDropZone) — drag-and-drop upload area
- [Form component](/docs/reference/components/Form) — `onWillSubmit`, `submitUrl`
