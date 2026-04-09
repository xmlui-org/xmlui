# Build a batch-processing queue

Use `Queue` to enqueue items, process them sequentially with progress feedback, and handle errors.

The `Queue` component accepts items via `enqueueItem()` or `enqueueItems()`, then processes each one sequentially through the `onProcess` handler. It exposes `$queuedItems` and `$completedItems` context variables for progress tracking and supports `progressFeedback` and `resultFeedback` templates for custom UI.

```xmlui-pg copy display name="Process a batch of tasks" height="360px"
---app display
<App var.tasks="{[
    { id: 1, name: 'Compress images' },
    { id: 2, name: 'Generate thumbnails' },
    { id: 3, name: 'Update metadata' },
    { id: 4, name: 'Sync to CDN' }
  ]}" 
  var.log=""
>

  <Queue
    id="taskQueue"
    onProcess="(processing) => {
      processing.reportProgress(50);
      delay(800);
      processing.reportProgress(100);
    }"
    onDidProcess="(arg) => log = log + arg.item.name + ' ✓\n';"
    onComplete="toast.success('All tasks processed!')"
  />

  <HStack verticalAlignment="center" marginBottom="$space-2">
    <Button
      label="Enqueue all"
      variant="solid"
      onClick="taskQueue.enqueueItems(tasks)" />
    <Text variant="caption">
      Queue length: {taskQueue.getQueueLength()}
    </Text>
  </HStack>

  <Text preserveLinebreaks="true" when="{log}">{log}</Text>
</App>
```

## Key points

**`enqueueItem()` and `enqueueItems()` add work**: Call `queueId.enqueueItem(item)` for a single item or `queueId.enqueueItems(array)` for a batch. Items are processed in the order they were enqueued, one at a time.

**`onProcess` is the main work handler**: The handler receives a `processing` object with `{ item, reportProgress }`. Call `reportProgress(percent)` at intermediate values to indicate progress, and at `100` when done. Use `delay()` to simulate or pace async work between steps.

**`onDidProcess` receives an arg object, not the item directly**: `onDidProcess` fires after each item finishes. Its argument has an `item` property (`arg.item`) holding the original enqueued value — access fields like `arg.item.name` to log or display per-item results.

**`onComplete` fires when the entire queue is drained**: Use it to show a summary toast, reset UI state, or trigger a follow-up action after all items have been processed.

**`getQueueLength()` reports how many items remain**: Call `queueId.getQueueLength()` in a binding expression to display live queue depth in the UI. It updates reactively as items are processed and new ones are enqueued.

---

## See also

- [Show toast notifications from code](/docs/howto/show-toast-notifications-from-code) — display a completion toast when the queue finishes
- [Track a long-running server task](/docs/howto/handle-background-operations) — poll a server-side job instead of client-side queuing
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handle transient errors with retry logic
