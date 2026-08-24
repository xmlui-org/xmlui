# Cancel an upload

Use a cancellable `APICall` for uploads that should have a visible Cancel button.

`FileInput` gives you a browser `File` object. Send that file with an `APICall` using `payloadType="multipart-form"`, then call `upload.cancel()` while the request is in progress. The same pattern works for real endpoints and for mocked examples.

```xmlui-pg copy display name="Cancel a receipt upload" height="440px"
---app display {6-33}
<App
  var.message="'Choose a receipt to upload'"
  var.isUploading="{false}"
  var.showCancellation="{false}"
>
  <VStack gap="$space-4" padding="$space-4">
    <APICall
      id="upload"
      method="post"
      url="/api/receipts"
      payloadType="multipart-form"
      body="{{ file: receipt.value[0], category: category.value }}"
      onMockExecute="() => {
        delay(3000);
        return {
          fileName: $requestBody.file?.name ?? 'receipt.pdf',
          category: $requestBody.category
        };
      }"
      onSuccess="(result) => {
        isUploading = false;
        message = 'Uploaded ' + result.fileName;
      }"
      onCancel="(reason) => {
        isUploading = false;
        showCancellation = true;
        message = 'Upload cancelled: ' + reason;
      }"
      onError="() => {
        isUploading = false;
        message = 'Upload failed';
      }"
    />

    <Text variant="title">Receipt Upload</Text>
    <Text>{isUploading ? 'Uploading receipt...' : message}</Text>

    <FileInput
      id="receipt"
      label="Receipt"
      multiple="false"
      acceptsFileType="{['.pdf', '.png', '.jpg']}"
    />
    <Select id="category" label="Category" initialValue="travel">
      <Option value="travel" label="Travel" />
      <Option value="meals" label="Meals" />
      <Option value="supplies" label="Supplies" />
    </Select>

    <HStack gap="$space-2">
      <Button
        label="Upload"
        icon="upload"
        onClick="
          isUploading = true; 
          showCancellation = false; 
          message = 'Uploading receipt...'; 
          upload.execute()
        "
        enabled="{receipt.value?.length > 0 && !isUploading}"
        themeColor="primary"
      />
      <Button
        label="Cancel upload"
        icon="close"
        onClick="upload.cancel('user')"
        enabled="{isUploading}"
        variant="outlined"
      />
    </HStack>

    <Text 
      when="{showCancellation && upload.cancelled && !isUploading}" 
      color="$color-warning"
    >
      Last cancellation reason: {upload.lastCancelReason}
    </Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {}
}
```

## Key points

**Use `payloadType="multipart-form"` for file payloads**: XMLUI converts the `body` object into form data. `File` values are appended as file fields.

**Keep the upload operation addressable**: Give the `APICall` an `id` so buttons can call `upload.execute()` and `upload.cancel()`.

**Cancellation is not a failed upload**: `onCancel` runs instead of `onError`, and `lastError` remains empty for user-initiated cancellation.

**`Actions.upload()` can also receive an `abortSignal`**: Use it when you are already inside a handler with a cancellation token. For visible user controls, an id-addressable `APICall` is usually simpler.

---

## See also

- [Submit a form with file uploads](/docs/howto/submit-a-form-with-file-uploads) - collect files with `FileInput`
- [Cancel an API call](/docs/howto/cancel-an-api-call) - the same cancellation API without file payloads
- [FileInput component](/docs/reference/components/FileInput) - file picker reference
