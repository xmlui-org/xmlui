# Cancel an API call

Use `cancel()` on an `APICall` to abort a request started with `execute()`.

This is useful for long saves, previews, report requests, and any action where the user should be able to back out without seeing a failure state. A cancelled call fires `onCancel`, leaves `lastError` empty, and does not run `onSuccess`.

```xmlui-pg copy display name="Cancel a slow API call" height="300px"
---app display {6-29,35-45}
<App
  var.message="'Ready to generate preview'"
  var.isGenerating="{false}"
  var.showCancellation="{false}"
>
  <VStack gap="$space-4" padding="$space-4">
    <APICall
      id="preview"
      method="post"
      url="/api/previews"
      body="{{ title: 'Quarterly Review' }}"
      onMockExecute="() => {
        delay(3000);
        return { previewId: 'preview-42' };
      }"
      onSuccess="(result) => {
        isGenerating = false;
        message = 'Preview ready: ' + result.previewId;
      }"
      onCancel="(reason) => {
        isGenerating = false;
        showCancellation = true;
        message = 'Preview cancelled: ' + reason;
      }"
      onError="() => {
        isGenerating = false;
        message = 'Preview failed';
      }"
    />

    <Text variant="title">Preview Generator</Text>
    <Text>{isGenerating ? 'Generating preview...' : message}</Text>

    <HStack gap="$space-2">
      <Button
        label="Generate"
        icon="play"
        onClick="
          isGenerating = true; 
          showCancellation = false; 
          message = 'Generating preview...'; preview.execute()
        "
        enabled="{!isGenerating}"
        themeColor="primary"
      />
      <Button
        label="Cancel"
        icon="close"
        onClick="preview.cancel('user')"
        enabled="{isGenerating}"
        variant="outlined"
      />
    </HStack>

    <Text 
      when="{showCancellation && preview.cancelled && !isGenerating}" 
      color="$color-warning"
    >
      Last cancellation reason: {preview.lastCancelReason}
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

**`execute()` starts the operation**: `APICall` does not run automatically. Start it from a button, form event, or another handler.

**`cancel(reason)` stops the active request**: The method returns `true` when an active call was cancelled and `false` when the call was already idle.

**Cancellation has its own state**: Read `cancelled` and `lastCancelReason` when the UI needs to show that the user cancelled the operation.

**Deferred operations still support server cancellation**: In deferred mode, `cancel()` also stops polling and calls `cancelUrl` when one is configured.

---

## See also

- [APICall component](/docs/reference/components/APICall) - execute mutations and API actions
- [Cancel a deferred API operation](/docs/howto/cancel-a-deferred-api-operation) - cancel polling and notify the server
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) - handle true failures separately
