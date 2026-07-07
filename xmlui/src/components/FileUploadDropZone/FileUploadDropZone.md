%-DESC-START

## Using `FileUploadDropZone`

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

%-DESC-END

%-PROP-START allowPaste

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

%-PROP-END

%-EVENT-START upload

Each item passed in the event argument is an instance of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).

%-EVENT-END
