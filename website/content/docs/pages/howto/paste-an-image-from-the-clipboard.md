# Paste an image from the clipboard

Let users paste an image from the clipboard with `FileUploadDropZone allowPaste="true"`; the pasted image arrives in the `upload` event as a `File` object.

Screenshots are the common case: a user captures one, and instead of saving it to disk and browsing for it, they paste it straight into the app. `FileUploadDropZone` handles the clipboard wiring — your app receives the same `File` objects a drag-and-drop would produce — and `Image`'s `data` prop displays a `File` directly.

```xmlui-pg copy display name="Paste an image from the clipboard" height="420px"
<App var.images="{[]}">
  <VStack gap="$space-4" padding="$space-4">
    <FileUploadDropZone
      height="120px"
      allowPaste="true"
      acceptedFileTypes="image/*"
      text="Click here, then paste an image from the clipboard"
      onUpload="(files) => {
        images = [...images, ...files];
        toast('Pasted ' + files.length + ' image(s)');
      }"
    />
    <Text when="{images.length === 0}">
      Copy an image (or take a screenshot), click the drop zone,
      then press Ctrl+V (Cmd+V on Mac).
    </Text>
    <Items data="{images}">
      <VStack gap="$space-1">
        <Image data="{$item}" maxHeight="160px" fit="contain" />
        <Text>{$item.name} · {$item.type} · {Math.round($item.size / 1024)} KB</Text>
      </VStack>
    </Items>
  </VStack>
</App>
```

## Key points

**`allowPaste="true"` turns pasting on**: pasting is disabled by default so that pasting text into inputs inside the drop zone doesn't trigger unexpected uploads. Even with it enabled, paste events that originate from text inputs and editable elements are still ignored — only pasting into the zone itself counts.

**Focus the drop zone first**: the paste target is the zone, so the user clicks it (or tabs to it) and then presses the OS paste shortcut. A screenshot pasted from the clipboard typically arrives as a file named `image.png`.

**`acceptedFileTypes` restricts input to images**: it takes MIME types separated by commas, so `image/*` accepts any image format while rejecting other clipboard or dropped content.

**`Image data` displays the pasted file**: `Image`'s `data` prop takes the binary data of an image — the `File` object from the `upload` event works as-is, with no object URL or base64 conversion. The script engine has no access to browser APIs like `FileReader`, so `data` is the way to preview a pasted or dropped image.

**Your app performs the actual upload**: the component accepts the pasted file but does not transmit it anywhere. The `upload` event passes the `File` objects, and the handler is where you send them to your backend — for example with an `APICall` — according to whatever protocol your API expects. This example keeps them in a component variable and previews them.

---

## See also

- [FileUploadDropZone component reference](/docs/reference/components/FileUploadDropZone) - `allowPaste`, `acceptedFileTypes`, `maxFiles`, and the `upload` event
- [Image component reference](/docs/reference/components/Image) - the `data` prop for binary image data
- [Submit a form with file uploads](/docs/howto/submit-a-form-with-file-uploads) - file pickers as form fields with `FileInput`
