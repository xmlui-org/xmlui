# FileUploadDropZone [#fileuploaddropzone]

`FileUploadDropZone` enables users to upload files by dragging and dropping files from their local file system onto a designated area within the UI.

## Using `FileUploadDropZone` [#using-fileuploaddropzone]

The component provides a surface on which you can drag files or paste files from the clipboard. The following example demonstrates how to use the component.

```xmlui-pg copy display name="Example: using FileUploadDropZone" height="200px"
---app copy display
<App>
  <FileUploadDropZone
    height="100px"
    onUpload="
      (files) => {
        console.log(files); 
        files.map(file => toast('file ' + file.path + ' uploaded'))}" />
</App>
---desc
You can try it by dragging one or more files to the cyan surface. When you drop the file(s), the app triggers the `upload` event and displays a dialog for each file.

You can also paste files from the clipboard: click the drop zone (cyan area) and then use the keyboard shortcut set on your OS.
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `acceptedFileTypes` [#acceptedfiletypes]

Accepted file MIME types, separated by commas. For example: 'image/*,application/pdf'.

### `allowPaste` [#allowpaste]

> [!DEF]  default: **false**

This property indicates if the drop zone accepts files pasted from the clipboard (`true`) or only dragged files (`false`). By default, paste-triggered uploads are disabled to prevent unexpected upload dialogs when users paste text into inputs within the drop zone. When enabled, paste events originating from text inputs and editable elements are still ignored.

This property indicates if the drop zone accepts files pasted from the clipboard (`true`) or only dragged files (`false`).

The following example sets this property to `false` and, thus, it turns off pasting files:

```xmlui-pg copy display name="Example: allowPaste" height="240px" /allowPaste="false"/
---app copy display
<App>
  <H3>You cannot paste files from the clipboard</H3>
  <FileUploadDropZone
    height="100px"
    allowPaste="false"
    onUpload="(files) => files.map(file => toast('file ' + file.path + ' uploaded'))" />
</App>
---desc
Try it! When you copy a file to a clipboard, you cannot paste it with the keyboard shortcut of your OS.
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

If set to `false`, the drop zone will be disabled and users will not be able to upload files.

### `icon` [#icon]

> [!DEF]  default: **"upload"**

Specifies an icon name. The framework will render an icon if XMLUI recognizes the icon by its name.

### `maxFiles` [#maxfiles]

The maximum number of files that can be selected.

### `text` [#text]

> [!DEF]  default: **"Drop files here"**

With this property, you can change the default text to display in the drop zone.

## Events [#events]

### `upload` [#upload]

This component accepts files for upload but does not perform the actual operation. It fires the `upload` event and passes the list files to upload in the method's argument. You can use the passed file information to implement the upload (according to the protocol your backend supports).

**Signature**: `upload(files: File[]): void`

- `files`: An array of File objects to be uploaded.

Each item passed in the event argument is an instance of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-dropping-FileUploadDropZone | $backgroundColor--selected | $color-primary-300 |
| [backgroundColor](../styles-and-themes/common-units/#color)-FileUploadDropZone | $backgroundColor | $backgroundColor |
| [borderColor](../styles-and-themes/common-units/#color)-FileUploadDropZone | $color-secondary-200 | $color-secondary-200 |
| [borderColor](../styles-and-themes/common-units/#color)-FileUploadDropZone--default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-FileUploadDropZone | $borderRadius | $borderRadius |
| [borderStyle](../styles-and-themes/common-units/#border-style)-FileUploadDropZone | dashed | dashed |
| [borderStyle](../styles-and-themes/common-units/#border-style)-FileUploadDropZone--default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-FileUploadDropZone | 2px | 2px |
| [borderWidth](../styles-and-themes/common-units/#size)-FileUploadDropZone--default | *none* | *none* |
| [opacity](../styles-and-themes/common-units/#opacity)-dropping-FileUploadDropZone | 0.3 | 0.3 |
| [textColor](../styles-and-themes/common-units/#color)-dropping-FileUploadDropZone | $color-primary-700 | $color-primary-700 |
| [textColor](../styles-and-themes/common-units/#color)-FileUploadDropZone | $textColor-secondary | $textColor-secondary |
