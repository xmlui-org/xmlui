# Handle background operations

Use the Queue component to manage sequential processing of background tasks with user feedback, perfect for batch operations like file imports or bulk updates.

```xmlui-pg copy display name="Background file processing with progress feedback"
---comp display
<Component name="BackgroundProcessor" var.items="{[]}" var.processedCount="{0}" var.errorCount="{0}">
  <VStack gap="$space-4">
    <!-- Sample data to upload -->
    <Button
      label="Load Sample Data"
      onClick="items = [
        { id: 1, filename: 'document.pdf', size: 2048576, type: 'application/pdf' },
        { id: 2, filename: 'image.jpg', size: 1024000, type: 'image/jpeg' },
        { id: 3, filename: 'corrupted-file.txt', size: 512, type: 'text/plain' },
        { id: 4, filename: 'data.csv', size: 4096000, type: 'text/csv' },
        { id: 5, filename: 'presentation.pptx', size: 8192000, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
      ]"
      variant="outlined"
    />

    <!-- Display loaded items -->
    <Text when="{items.length > 0}">
      Found {items.length} files ready to process
    </Text>

    <!-- Control button -->
    <Button
      label="Process All Files"
      onClick="uploadQueue.enqueueItems(items)"
      enabled="{items.length > 0 && uploadQueue.getQueueLength() === 0}"
      themeColor="primary"
    />

    <!-- Background upload queue -->
    <Queue
      id="uploadQueue"
      clearAfterFinish="true"
      onProcess="processing => {
        // Update progress
        processing.reportProgress(processedCount + 1);

        // Make API call to upload objects (delay is handled server-side)
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
      }">

      <property name="progressFeedback">
        <HStack>
          <Spinner size="sm" />
          <Text>Processing item {processedCount + 1}...</Text>
        </HStack>
      </property>

      <property name="resultFeedback">
        <HStack>
          <Icon name="checkmark"/>
          <Text>
            All {processedCount} items processed successfully!
          </Text>
        </HStack>
      </property>
    </Queue>

    <!-- Status display -->
    <Card when="{uploadQueue.getQueueLength() > 0 || processedCount > 0}">
      <VStack>
        <Text>Processing Status</Text>
        <HStack>
          <Text>Queue length: {uploadQueue.getQueueLength()}</Text>
          <Text>Processed: {processedCount}</Text>
          <Text>Errors: {errorCount}</Text>
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
</Component>
---app display
<App>
  <BackgroundProcessor />
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
      "handler": "delay(3000); return { success: true, message: 'File processed successfully' };"
    }
  }
}
```

