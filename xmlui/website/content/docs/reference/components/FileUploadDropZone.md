# FileUploadDropZone [#fileuploaddropzone]

`FileUploadDropZone` enables users to upload files by dragging and dropping files from their local file system onto a designated area within the UI.

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

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-dropping-FileUploadDropZone | $backgroundColor--selected | $color-primary-300 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-FileUploadDropZone | $backgroundColor | $backgroundColor |
| [borderColor](/docs/styles-and-themes/common-units/#color)-FileUploadDropZone | $color-secondary-200 | $color-secondary-200 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-FileUploadDropZone | $borderRadius | $borderRadius |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-FileUploadDropZone | dashed | dashed |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-FileUploadDropZone | 2px | 2px |
| [opacity](/docs/styles-and-themes/common-units/#opacity)-dropping-FileUploadDropZone | 0.3 | 0.3 |
| [textColor](/docs/styles-and-themes/common-units/#color)-dropping-FileUploadDropZone | $color-primary-700 | $color-primary-700 |
| [textColor](/docs/styles-and-themes/common-units/#color)-FileUploadDropZone | $textColor-secondary | $textColor-secondary |
