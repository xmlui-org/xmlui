import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { createMetadata, d } from "../metadata-helpers";
import { Queue, defaultProps } from "./QueueNative";

const COMP = "Queue";

export const QueueMd = createMetadata({
  status: "stable",
  description:
    "`Queue` manages sequential processing of items in FIFO (first-in, first-out) " +
    "order. It is a non-visual component but provides UI progress reporting and result display.",
  props: {
    progressFeedback: d(
      "This property defines the component template of the UI that displays " +
        "progress information whenever, the queue's \`progressReport\` function " +
        "in invoked. If not set, no progress feedback is displayed.",
    ),
    resultFeedback: d(
      "This property defines the component template of the UI that displays result " +
        "information when the queue becomes empty after processing all queued items. If not set, " +
        "no result feedback is displayed.",
    ),
    clearAfterFinish: {
      description:
        `This property indicates the completed items (successful or error) should ` +
        `be removed from the queue after completion.`,
      defaultValue: defaultProps.clearAfterFinish,
    },
  },
  nonVisual: true,
  events: {
    willProcess: d(`This event is triggered to process a particular item.`),
    process: d(
      `This event is fired to process the next item in the queue. If the processing cannot ` +
        `proceed because of some error, raise an exception, and the queue will handle that.`,
    ),
    didProcess: d(
      `This event is fired when the processing of a queued item has been successfully processed.`,
    ),
    processError: d(
      `This event is fired when processing an item raises an error. The event handler method ` +
        `receives two parameters. The first is the error raised during the processing of the ` +
        `item; the second is an object with these properties:`,
    ),
    complete: d(
      `The queue fires this event when the queue gets empty after processing all items. ` +
        `The event handler has no arguments.`,
    ),
  },
  apis: {
    enqueueItem: {
      description: `This method enqueues the item passed in the method parameter. The new item will be ` +
        `processed after the current queue items have been handled. The method retrieves the ` +
        `unique ID of the newly added item; this ID can be used later in other methods, ` +
        `such as \`remove\`.`,
      signature: "enqueueItem(item: any): string",
      parameters: {
        item: "The item to enqueue.",
      },
    },
    enqueueItems: {
      description: `This method enqueues the array of items passed in the method parameter. The new items ` +
        `will be processed after the current queue items have been handled. The method ` +
        `retrieves an array of unique IDs, one for each new item. An item ID can be used later ` +
        `in other methods, such as \`remove\`.`,
      signature: "enqueueItems(items: any[]): string[]",
      parameters: {
        items: "The array of items to enqueue.",
      },
    },
    getQueuedItems: {
      description: `You can use this method to return the items in the queue. These items contain all ` +
        `entries not removed from the queue yet, including pending, in-progress, and ` +
        `completed items.`,
      signature: "getQueuedItems(): any[]",
    },
    getQueueLength: {
      description: `This method retrieves the current queue length. The queue contains only those items ` +
        `that are not fully processed yet.`,
      signature: "getQueueLength(): number",
    },
    remove: {
      description: `This method removes an item from the queue using its unique ID.`,
      signature: "remove(itemId: string): void",
      parameters: {
        itemId: "The unique ID of the item to remove.",
      },
    },
  },
  contextVars: {
    $completedItems: d(
      `A list containing the queue items that have been completed (fully processed).`,
    ),
    $queuedItems: d(
      `A list containing the items waiting in the queue, icluding the completed items.`,
    ),
  },
});

export const queueComponentRenderer = createComponentRenderer(
  COMP,
  QueueMd,
  ({ node, registerComponentApi, lookupEventHandler, renderChild, extractValue }) => {
    return (
      <Queue
        registerComponentApi={registerComponentApi}
        renderResultFeedback={
          node.props.resultFeedback
            ? (completedItems, queuedItems) => {
                return (
                  <MemoizedItem
                    node={node.props.resultFeedback! as any}
                    contextVars={{
                      $completedItems: completedItems,
                      $queuedItems: queuedItems,
                    }}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
        renderProgressFeedback={
          node.props.progressFeedback
            ? (completedItems, queuedItems) => {
                return (
                  <MemoizedItem
                    node={node.props.progressFeedback! as any}
                    contextVars={{
                      $completedItems: completedItems,
                      $queuedItems: queuedItems,
                    }}
                    renderChild={renderChild}
                  />
                );
              }
            : undefined
        }
        willProcessItem={lookupEventHandler("willProcess")}
        processItem={lookupEventHandler("process", { signError: false })}
        didProcessItem={lookupEventHandler("didProcess")}
        processItemError={lookupEventHandler("processError")}
        onComplete={lookupEventHandler("complete")}
        clearAfterFinish={extractValue.asOptionalBoolean(node.props.clearAfterFinish)}
      />
    );
  },
);
