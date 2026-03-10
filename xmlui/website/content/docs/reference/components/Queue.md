# Queue [#queue]

`Queue` manages sequential processing of items in FIFO (first-in, first-out) order. It is a non-visual component but provides UI progress reporting and result display.

**Context variables available during execution:**

- `$completedItems`: A list containing the queue items that have been completed (fully processed).
- `$queuedItems`: A list containing the items waiting in the queue, icluding the completed items.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `clearAfterFinish` [#clearafterfinish]

> [!DEF]  default: **false**

This property indicates the completed items (successful or error) should be removed from the queue after completion.

### `progressFeedback` [#progressfeedback]

This property defines the component template of the UI that displays progress information whenever, the queue's `progressReport` function in invoked. If not set, no progress feedback is displayed.

### `resultFeedback` [#resultfeedback]

This property defines the component template of the UI that displays result information when the queue becomes empty after processing all queued items. If not set, no result feedback is displayed.

## Events [#events]

### `complete` [#complete]

The queue fires this event when the queue gets empty after processing all items. The event handler has no arguments.

**Signature**: `complete(): void`

### `didProcess` [#didprocess]

This event is fired when the processing of a queued item has been successfully processed.

**Signature**: `didProcess(item: any, result: any): void`

- `item`: The item that was processed.
- `result`: The result of the processing operation.

### `process` [#process]

This event is fired to process the next item in the queue. If the processing cannot proceed because of some error, raise an exception, and the queue will handle that.

**Signature**: `process(item: any): any`

- `item`: The item to process.

### `processError` [#processerror]

This event is fired when processing an item raises an error. The event handler method receives two parameters. The first is the error raised during the processing of the item; the second is an object with these properties:

**Signature**: `processError(error: Error, context: { item: any, itemId: string }): void`

- `error`: The error that occurred during processing.
- `context`: An object containing the item and itemId that failed processing.

### `willProcess` [#willprocess]

This event is triggered to process a particular item.

**Signature**: `willProcess(item: any): void | boolean`

- `item`: The item about to be processed.

## Exposed Methods [#exposed-methods]

### `enqueueItem` [#enqueueitem]

This method enqueues the item passed in the method parameter. The new item will be processed after the current queue items have been handled. The method retrieves the unique ID of the newly added item; this ID can be used later in other methods, such as `remove`.

**Signature**: `enqueueItem(item: any): string`

- `item`: The item to enqueue.

### `enqueueItems` [#enqueueitems]

This method enqueues the array of items passed in the method parameter. The new items will be processed after the current queue items have been handled. The method retrieves an array of unique IDs, one for each new item. An item ID can be used later in other methods, such as `remove`.

**Signature**: `enqueueItems(items: any[]): string[]`

- `items`: The array of items to enqueue.

### `getQueuedItems` [#getqueueditems]

You can use this method to return the items in the queue. These items contain all entries not removed from the queue yet, including pending, in-progress, and completed items.

**Signature**: `getQueuedItems(): any[]`

### `getQueueLength` [#getqueuelength]

This method retrieves the current queue length. The queue contains only those items that are not fully processed yet.

**Signature**: `getQueueLength(): number`

### `remove` [#remove]

This method removes an item from the queue using its unique ID.

**Signature**: `remove(itemId: string): void`

- `itemId`: The unique ID of the item to remove.

## Styling [#styling]

This component does not have any styles.
