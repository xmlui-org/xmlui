import { createMetadata } from "../../component-core/metadata/helpers";

export const QueueMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`Queue` is a non-visual component that processes enqueued items sequentially.",
  props: {
    id: { description: "The identifier used to expose the Queue API.", valueType: "string" },
    clearAfterFinish: {
      description: "Whether completed and errored items are cleared when the queue completes.",
      valueType: "boolean",
      defaultValue: true,
    },
    progressFeedback: {
      description: "Template for progress feedback.",
      valueType: "ComponentDef",
    },
    resultFeedback: {
      description: "Template for result feedback.",
      valueType: "ComponentDef",
    },
  },
  events: {
    willProcess: {
      description: "Runs before an item is processed. Returning false removes the item.",
      signature: "willProcess(item: any): boolean | void",
    },
    process: {
      description: "Processes an item.",
      signature: "process(item: any): any",
    },
    didProcess: {
      description: "Runs after an item is processed successfully.",
      signature: "didProcess(item: any, result: any): void",
    },
    processError: {
      description: "Runs when item processing fails.",
      signature: "processError(error: any, context: { item: any; itemId: string }): void",
    },
    complete: {
      description: "Runs when the queue becomes empty after processing.",
      signature: "complete(): void",
    },
  },
  contextVars: {
    $completedItems: { description: "Completed queue items." },
    $queuedItems: { description: "Current queue items." },
  },
  apis: {
    enqueueItem: { description: "Enqueues one item.", signature: "enqueueItem(item: any): string" },
    enqueueItems: { description: "Enqueues many items.", signature: "enqueueItems(items: any[]): string[]" },
    getQueuedItems: { description: "Returns all queue item records.", signature: "getQueuedItems(): any[]" },
    getQueueLength: { description: "Returns pending item count.", signature: "getQueueLength(): number" },
    remove: { description: "Removes an item by id.", signature: "remove(itemId: string): void" },
    clearCompleted: { description: "Clears completed and errored item records.", signature: "clearCompleted(): void" },
  },
});
