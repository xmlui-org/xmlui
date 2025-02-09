import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { MemoizedItem } from "../container-helpers";
import { Queue } from "./QueueNative";

const COMP = "Queue";

export const QueueMd = createMetadata({
  description:
    `The \`Queue\` component provides an API to enqueue elements and defines events to process ` +
    `queued elements in a FIFO order.`,
  props: {
    progressFeedback: d(
      `This property defines the component template of the UI that displays ` +
        `progress information whenever, the queue's \`progressReport\` function in invoked.`,
    ),
    resultFeedback: d(
      `This property defines the component template of the UI that displays result ` +
        `information when the queue becomes empty after processing all queued items.`,
    ),
    clearAfterFinish: d(
      `This property indicates the completed items (successful or error) should ` +
        `be removed from the queue after completion.`,
    ),
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
    enqueueItem: d(
      `This method enqueues the item passed in the method parameter. The new item will be ` +
        `processed after the current queue items have been handled. The method retrieves the ` +
        `unique ID of the newly added item; this ID can be used later in other methods, ` +
        `such as \`remove\`.`,
    ),
    enqueueItems: d(
      `This method enqueues the array of items passed in the method parameter. The new items ` +
        `will be processed after the current queue items have been handled. The method ` +
        `retrieves an array of unique IDs, one for each new item. An item ID can be used later ` +
        `in other methods, such as \`remove\`.`,
    ),
    getQueuedItems: d(
      `You can use this method to return the items in the queue. These items contain all ` +
        `entries not removed from the queue yet, including pending, in-progress, and ` +
        `completed items.`,
    ),
    getQueueLength: d(
      `This method retrieves the current queue length. The queue contains only those items ` +
        `that are not fully processed yet.`,
    ),
    remove: d(
      `This method retrieves the current queue length. The queue contains only those items ` +
        `that are not fully processed yet.`,
    ),
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
