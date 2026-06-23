%-DESC-START

## Using `FileUploadDropZone`

The component provides a surface on which users can drag files or paste files
from the clipboard. It accepts files and fires the `upload` event; the app owns
the actual upload operation.

```xmlui-pg copy display name="Example: using FileUploadDropZone" height="200px"
---app copy display
<App>
  <FileUploadDropZone
    height="100px"
    onUpload="files => files.map(file => toast('file ' + file.name + ' uploaded'))" />
</App>
```

%-DESC-END

%-PROP-START allowPaste

This property indicates if the drop zone accepts files pasted from the
clipboard (`true`) or only dragged files (`false`).

%-PROP-END

%-EVENT-START upload

Each item passed in the event argument is an instance of
[File](https://developer.mozilla.org/en-US/docs/Web/API/File).

%-EVENT-END
