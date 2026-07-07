# Track a long-running server task

Use the `Queue` component to process items one-by-one in the background while keeping the UI responsive.

When a user triggers a batch operation — uploading files, sending emails, processing records — you don't want the UI to freeze. The `Queue` component accepts items via `enqueueItems()`, calls your `onProcess` handler for each one sequentially, and provides built-in progress and result feedback slots. The rest of the page remains fully interactive while the queue drains.

```xmlui-pg copy display name="Background file processing with progress feedback"
---app display {42-51} /uploadQueue/
<App 
  var.items="{[]}" 
  var.processedCount="{0}" 
  var.errorCount="{0}" 
  var.completed="{false}"
>
  <VStack gap="$space-4">
    <!-- Single action button -->
    <Button
      label="Upload 5 Files"
      onClick="items = [
        { 
          id: 1, filename: 'document.pdf', size: 2048576, 
          type: 'application/pdf' 
        },
        { 
          id: 2, filename: 'image.jpg', size: 1024000, 
          type: 'image/jpeg'
        },
        { 
          id: 3, filename: 'corrupted-file.txt', size: 512, 
          type: 'text/plain'
        },
        { 
          id: 4, filename: 'data.csv', size: 4096000, 
          type: 'text/csv' 
        },
        { 
          id: 5, filename: 'presentation.pptx', size: 8192000, 
          type: 'application/vnd.openxmlformats-officedocument' 
        }
      ]; uploadQueue.enqueueItems(items)"
      enabled="{!completed}"
      themeColor="primary"
    />

    <!-- Background upload queue -->
    <Queue
      id="uploadQueue"
      clearAfterFinish="true"
      onProcess="processing => {
        // Update progress
        processing.reportProgress(processedCount + 1);
        // Make API call to upload objects (delay happens server-side)
        const result = Actions.callApi({
          url: '/api/objects',
          method: 'POST',
          body: processing.item
        });
        processedCount++;
        return result;
      }"
      onProcessError="(error, processing) => {
        errorCount++;
        console.error('Processing failed:', error.message, processing.item);
        // Return true to show default error display
        return true;
      }"
      onComplete="() => {
        console.log('All files processed');
        completed = true;
      }">

      <property name="progressFeedback">
        <HStack>
          <Text>Processing item {processedCount + 1}...</Text>
        </HStack>
      </property>

      <property name="resultFeedback">
        <HStack>
          <Text>
            All {processedCount} items processed successfully!
          </Text>
        </HStack>
      </property>
    </Queue>

    <!-- Status display -->
    <Card when="{uploadQueue.getQueueLength() > 0 || processedCount > 0}">
      <VStack>
          <HStack>
          <Text>Queue length: {uploadQueue.getQueueLength()}</Text>
          <Text>Processed: {processedCount}</Text>
          </HStack>
      </VStack>
    </Card>

    <!-- Interactive element while processing -->
    <Card when="{uploadQueue.getQueueLength() > 0}">
      <VStack>
        <Slider
          label="Adjust slider while uploads are running"
          minValue="1"
          maxValue="10"
          initialValue="5"
          step="1"
        />
      </VStack>
    </Card>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.files = []",
  "operations": {
    "process-file": {
      "url": "/objects",
      "method": "post",
      "bodyParamTypes": {
        "filename": "string",
        "size": "number",
        "type": "string"
      },
      "handler": "delay(1500); return { success: true, message: 'File processed successfully' };"
    }
  }
}
```

## Key points

**`enqueueItems()` starts the queue**: Pass an array of items and the Queue begins processing immediately. Each item is passed to `onProcess` one at a time.

**`onProcess` handles one item at a time**: The handler receives a `processing` object with `.item` (the current item) and `.reportProgress()` (to update the progress display). Return the API call result to signal completion.

**`onProcessError` handles failures without stopping the queue**: If an item fails, this handler fires with the error and the `processing` context. Return `true` to show the default error display, or handle it silently.

**`progressFeedback` and `resultFeedback` are named slots**: Use `<property name="progressFeedback">` to render a custom progress indicator during processing, and `<property name="resultFeedback">` for the completion message.

**The UI stays interactive during processing**: The Queue runs in React's event loop without blocking renders. In the example, the slider remains usable while files upload in the background.

---

## See also

- [Cancel a deferred API operation](/docs/howto/cancel-a-deferred-api-operation) — abort a long-running server task
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handle failures and retry
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — refresh caches after background processing completes