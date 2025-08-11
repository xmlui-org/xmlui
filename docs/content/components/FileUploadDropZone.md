# FileUploadDropZone [#fileuploaddropzone]

`FileUploadDropZone` enables users to upload files by dragging and dropping files from their local file system onto a designated area within the UI.

## Using `FileUploadDropZone` [#using-fileuploaddropzone]

The component provides a surface on which you can drag files or paste files from the clipboard. The following example demonstrates how to use the component.

```xmlui-pg copy display name="Example: using FileUploadDropZone" height="200px"
---app copy display
<App>
  <H3>The cyan area below is a FileUploadDropZone</H3>
  <FileUploadDropZone backgroundColor="cyan" height="100px"
    onUpload="
      (files) => {
        console.log(files); 
        files.map(file => toast('file ' + file.path + ' uploaded'))}" />
</App>
---desc
You can try it by dragging one or more files to the cyan surface. When you drop the file(s), the app triggers the `upload` event and displays a dialog for each file.

You can also paste files from the clipboard: click the drop zone (cyan area) and then use the keyboard shortcut set on your OS.
```

## Properties [#properties]

### `allowPaste` (default: true) [#allowpaste-default-true]

This property indicates if the drop zone accepts files pasted from the clipboard (`true`) or only dragged files (`false`).

This property indicates if the drop zone accepts files pasted from the clipboard (`true`) or only dragged files (`false`).

The following example sets this property to `false` and, thus, it turns off pasting files:

```xmlui-pg copy display name="Example: allowPaste" height="200px"
---app copy display
<App>
  <H3>You cannot paste files from the clipboard</H3>
  <FileUploadDropZone backgroundColor="cyan" height="100px"
    allowPaste="false"
    onUpload="(files) => files.map(file => toast('file ' + file.path + ' uploaded'))" />
</App>
---desc
Try it! When you copy a file to a clipboard, you cannot paste it with the keyboard shortcut of your OS.
```

### `enabled` (default: true) [#enabled-default-true]

If set to `false`, the drop zone will be disabled and users will not be able to upload files.

### `text` (default: "Drop files here") [#text-default-drop-files-here]

With this property, you can change the default text to display when files are dragged over the drop zone.

## Events [#events]

### `upload` [#upload]

This component accepts files for upload but does not perform the actual operation. It fires the `upload` event and passes the list files to upload in the method's argument. You can use the passed file information to implement the upload (according to the protocol your backend supports).

Each item passed in the event argument is an instance of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-dropping-FileUploadDropZone | $backgroundColor--selected | $backgroundColor--selected |
| [backgroundColor](../styles-and-themes/common-units/#color)-FileUploadDropZone | $backgroundColor | $backgroundColor |
| [opacity](../styles-and-themes/common-units/#opacity)-dropping-FileUploadDropZone | 0.5 | 0.5 |
| [textColor](../styles-and-themes/common-units/#color)-FileUploadDropZone | $textColor | $textColor |
