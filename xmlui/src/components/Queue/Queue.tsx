import React, { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import toast from "react-hot-toast";
import { isEqual } from "lodash-es";
import { generatedId, useEvent } from "@components-core/utils/misc";
import { useAppContext } from "@components-core/AppContext";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import produce from "immer";
import {
  actionItemCompleted,
  actionItemError,
  actionItemProgress,
  actionItemStarted,
  actionQueueInitialized,
  clearCompletedActionItems,
  QueueAction,
  QueueActionKind,
  removeActionItem,
} from "@components/Queue/queueActions";
import { MemoizedItem } from "@components/container-helpers";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import { usePrevious } from "@components-core/utils/hooks";

// =====================================================================================================================
// React Queue component implementation

type Props = {
  registerComponentApi: RegisterComponentApiFn;
  willProcessItem?: AsyncFunction;
  processItem?: AsyncFunction;
  didProcessItem?: AsyncFunction;
  processItemError?: AsyncFunction;
  onComplete?: AsyncFunction;
  progressFeedback?: React.ReactNode;
  resultFeedback?: React.ReactNode;
  renderResultFeedback?: (args: any) => React.ReactNode;
  clearAfterFinish?: boolean;
};

const queueReducer = produce((state: QueueState, action: QueueAction) => {
  switch (action.type) {
    case QueueActionKind.ACTION_QUEUE_INITIALIZED: {
      const queueState: Record<string, QueueItem> = {};

      const itemsById: Record<string, any> = {};
      action.payload.queue.forEach((item: any, index: number) => {
        itemsById[action.payload.actionItemIds[index]] = item;
      });

      const queue = Object.keys(itemsById);
      Object.entries(itemsById).forEach(([actionItemId, item]) => {
        queueState[actionItemId] = {
          batchId: action.payload.batchId,
          actionItemId,
          status: "pending",
          item,
        };
      });
      return {
        queue: [...(state.queue || []), ...queue],
        queueState: { ...state.queueState, ...queueState },
      };
    }
    case QueueActionKind.ACTION_ITEM_STARTED: {
      if (state.queueState[action.payload.actionItemId]) {
        state.queueState[action.payload.actionItemId].status = "started";
      }
      break;
    }
    case QueueActionKind.ACTION_ITEM_PROGRESS: {
      if (state.queueState[action.payload.actionItemId]) {
        state.queueState[action.payload.actionItemId].status = "in-progress";
        state.queueState[action.payload.actionItemId].progress = action.payload.progressEvent;
      }
      break;
    }
    case QueueActionKind.ACTION_ITEM_COMPLETED: {
      state.queue = state.queue.filter((aiId: string) => aiId !== action.payload.actionItemId);
      if (state.queueState[action.payload.actionItemId]) {
        state.queueState[action.payload.actionItemId].status = "completed";
        state.queueState[action.payload.actionItemId].result = action.payload.result;
      }
      break;
    }
    case QueueActionKind.ACTION_ITEM_REMOVED: {
      state.queue = state.queue.filter((aiId: string) => aiId !== action.payload.actionItemId);
      delete state.queueState[action.payload.actionItemId];
      break;
    }
    case QueueActionKind.ACTION_ITEM_ERROR: {
      state.queue = state.queue.filter((aiId: string) => aiId !== action.payload.actionItemId);
      if (state.queueState[action.payload.actionItemId]) {
        state.queueState[action.payload.actionItemId].status = "error";
        state.queueState[action.payload.actionItemId].error = action.payload.error;
      }
      break;
    }
    case QueueActionKind.CLEAR_COMPLETED_ACTION_ITEMS: {
      if (state.queueState) {
        Object.entries(state.queueState).forEach(([key, value]) => {
          if ((value as any).status === "completed" || (value as any).status === "error") {
            delete state.queueState[key];
          }
        });
      }
      break;
    }
    default:
      throw new Error();
  }
  // console.log("queue action arrived", action);
  // console.log("queue state", cloneDeep(state));
});

const INITIAL_STATE: QueueState = {
  queue: [],
  queueState: {},
};

function Queue({
  registerComponentApi,
  willProcessItem,
  processItem,
  didProcessItem,
  processItemError,
  onComplete,
  progressFeedback,
  resultFeedback,
  renderResultFeedback,
  clearAfterFinish = true,
}: Props) {
  const runningActionItemRef = useRef<Set<string>>(new Set());
  const [queueState, dispatch] = useReducer(queueReducer, INITIAL_STATE);

  let appContext = useAppContext();

  // --- This Queue API adds a single item to the queue
  const enqueueItem = useEvent((item: any) => {
    const itemId = generatedId();
    dispatch(actionQueueInitialized([item], generatedId(), [itemId]));
    return itemId;
  });

  // --- This Queue API adds a list of items to the queue
  const enqueueItems = useEvent((items: any[]) => {
    const itemIds = items.map(() => generatedId());
    dispatch(actionQueueInitialized(items, generatedId(), itemIds));
    return itemIds;
  });

  const clearCompleted = useCallback(() => {
    dispatch(clearCompletedActionItems());
  }, []);

  const remove = useCallback((actionItemId: string) => {
    if (actionItemId) {
      dispatch(removeActionItem(actionItemId));
    }
  }, []);

  const getQueueLength = useCallback(() => {
    return queueState.queue.length;
  }, [queueState.queue.length]);

  const getQueuedItems = useCallback(() => {
    // console.log("GET QUEUED ITEMS", Object.values(queueState.queueState));
    return Object.values(queueState.queueState);
  }, [queueState.queueState]);

  useEffect(() => {
    registerComponentApi({
      enqueueItem,
      enqueueItems,
      clearCompleted,
      remove,
      getQueueLength,
      getQueuedItems,
    });
  }, [registerComponentApi, enqueueItem, enqueueItems, clearCompleted, remove, getQueueLength, getQueuedItems]);

  const doSingle = useCallback(
    async (actionItemId: string) => {
      const queueItem = queueState.queueState[actionItemId];
      if (queueItem?.status !== "pending") {
        return;
      }
      if (runningActionItemRef.current.has(actionItemId)) {
        return;
      }
      runningActionItemRef.current.add(actionItemId);
      const item = queueItem.item;
      let processItemContext = {};
      try {
        const willProcessResult = await willProcessItem?.({
          item,
          actionItemId,
          processItemContext,
        });
        processItemContext = { ...processItemContext, willProcessResult: willProcessResult };

        if (willProcessResult === false) {
          dispatch(removeActionItem(actionItemId));
          return;
        }
        dispatch(actionItemStarted(actionItemId));

        const result = await processItem?.({
          item: item,
          actionItemId,
          processItemContext,
          onProgress: (progressEvent: any) => {
            dispatch(actionItemProgress(actionItemId, progressEvent));
          },
        });

        processItemContext = { ...processItemContext, processResult: result };

        await didProcessItem?.({
          item,
          actionItemId,
          processItemContext,
        });

        dispatch(actionItemCompleted(actionItemId, result));
      } catch (error) {
        let result = await processItemError?.(error, {
          item,
          actionItemId,
          processItemContext,
        });
        dispatch(actionItemError(actionItemId, error));
        if (result !== false) {
          appContext.signError(error as Error);
        }
      } finally {
        runningActionItemRef.current.delete(actionItemId);
      }
    },
    [appContext, didProcessItem, dispatch, processItem, processItemError, queueState.queueState, willProcessItem]
  );

  const toastId = useRef<string | undefined>();
  const queue = queueState.queue;
  const prevQueue = usePrevious(queue);

  const doComplete = useCallback(() => {
    onComplete?.();
    const completedItems = getQueuedItems().filter((item) => item.status === "completed");
    const resultFeedback = renderResultFeedback?.(completedItems);
    if (resultFeedback && completedItems.length) {
      let currentToast = toastId.current;
      toast.success(<>{resultFeedback}</>, {
        id: currentToast,
      });
    } else {
      if (toastId.current) {
        let currentToast = toastId.current;
        toast.dismiss(currentToast);
      }
    }
    // toastId.current = undefined;
    if (clearAfterFinish) {
      clearCompleted();
    }
  }, [clearAfterFinish, clearCompleted, getQueuedItems, onComplete, renderResultFeedback]);

  //with useEffect, it's showing the previous state for some reason, review!
  useLayoutEffect(() => {
    if (!queue.length) {
      return;
    }
    if (progressFeedback) {
      if (toastId.current) {
        let anotherLoading = toast.loading(<>{progressFeedback}</>, {
          id: toastId.current,
        });
        // console.log("reusing toast, loading toast", toastId.current, anotherLoading);
      } else {
        toastId.current = toast.loading(<>{progressFeedback}</>);
      }
    }
  }, [progressFeedback, queue?.length]);

  useEffect(() => {
    if (!queue) {
      return;
    }
    if (prevQueue === queue) {
      return;
    }
    if (isEqual(prevQueue, queue)) {
      return;
    }
    if (prevQueue?.length && !queue.length) {
      doComplete();
      return;
    }
    let queueItem = queue[0];
    (async () => {
      await doSingle(queueItem);
    })();
  }, [doComplete, doSingle, prevQueue, queue]);

  return null;
}

type QueueItemState = "pending" | "started" | "in-progress" | "completed" | "error";

type QueueItem = {
  actionItemId: string;
  batchId?: string;
  status: QueueItemState;
  item: any;
  progress?: any;
  result?: any;
  error?: any;
};

type QueueState = {
  queue: string[];
  queueState: Record<string, QueueItem>;
};

// =====================================================================================================================
// XMLUI Queue component definition

/**
 * \`Queue\` is a functional component (it renders no UI). It provides an API to enqueue elements and
 * defines events to process queued elements in a FIFO order.
 */
export interface QueueComponentDef extends ComponentDef<"Queue"> {
  uid: string;
  props: {
    /**
     * This property defines the component template of the UI that displays progress information whenever
     * the queue's \`progressReport\` function in invoked.
     */
    progressFeedback?: ComponentDef;

    /**
     * This property defines the component template of the UI that displays result information when the
     * queue becomes empty after processing all queued items.
     */
    resultFeedback?: ComponentDef;

    /**
     * This property indicates the completed items (successful or error) should be removed from the queue
     * after completion.
     */
    clearAfterFinish?: boolean;
  };
  events: {
    /** @descriptionRef */
    willProcess: string;
    /** @descriptionRef */
    process: string;
    /** @descriptionRef */
    didProcess: string;
    /** @descriptionRef */
    processError: string;
    /** @descriptionRef */
    complete: string;
  };
  api: {
    /** @descriptionRef */
    enqueueItem: (item: any) => string;
    /**
     * This method enqueues the array of items passed in the method parameter. The new items will be
     * processed after the current queue items have been handled. The method retrieves an array of
     * unique IDs, one for each new item. An item ID can be used later in other methods, such as
     * \`remove\`.
     */
    enqueueItems: (items: any[]) => string[];
    /** @descriptionRef */
    getQueuedItems: () => QueueItem[];
    /**
     * This method retrieves the current queue length. The queue contains only those items that are
     * not fully processed yet.
     */
    getQueueLength: () => number;
    /** @descriptionRef */
    remove: (actionItemId: string) => void;
  };
  contextVars: {
    /**
     * A list containing the queue items that have been completed (fully processed).
     */
    $completedItems: any;
  };
}

export const QueueMd: ComponentDescriptor<QueueComponentDef> = {
  displayName: "Queue",
  description: "A queue managing tasks to process in a FIFO order",
  props: {
    progressFeedback: desc("The template of the component that provides progress feedback"),
    resultFeedback: desc("The template of the component that displays result feedback"),
    clearAfterFinish: desc("Should completed items be removed from the queue?"),
  },
  nonVisual: true,
  events: {
    willProcess: desc("This item is fired when an item is about to be processed"),
    process: desc("This event is triggered to process a particular item"),
    didProcess: desc("This event is fired when a particular item's processing has finished"),
    processError: desc("This event is raised when an item processed with an error"),
    complete: desc("This event is raised when an item's processing has been successfully completed"),
  },
};

export const queueComponentRenderer = createComponentRenderer<QueueComponentDef>(
  "Queue",
  ({ node, registerComponentApi, lookupEventHandler, renderChild, extractValue }) => {
    return (
      <Queue
        registerComponentApi={registerComponentApi}
        progressFeedback={renderChild(node.props.progressFeedback)}
        resultFeedback={renderChild(node.props.resultFeedback)}
        renderResultFeedback={
          node.props.resultFeedback
            ? (completedItems) => {
                return (
                  <MemoizedItem
                    node={node.props.resultFeedback!}
                    contextVars={{
                      $completedItems: completedItems,
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
  QueueMd
);
