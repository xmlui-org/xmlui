import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import toast from "react-hot-toast";
import produce from "immer";
import { isEqual } from "lodash-es";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { usePrevious } from "../../components-core/utils/hooks";
import { generatedId, useEvent } from "../../components-core/utils/misc";
import { useAppContext } from "../../components-core/AppContext";
import type { QueueAction } from "../Queue/queueActions";
import {
  actionItemCompleted,
  actionItemError,
  actionItemProgress,
  actionItemStarted,
  actionQueueInitialized,
  clearCompletedActionItems,
  QueueActionKind,
  removeActionItem,
} from "../Queue/queueActions";

// =====================================================================================================================
// React Queue component implementation

export const defaultProps = {
  clearAfterFinish: false,
};

type Props = {
  registerComponentApi: RegisterComponentApiFn;
  willProcessItem?: AsyncFunction;
  processItem?: AsyncFunction;
  didProcessItem?: AsyncFunction;
  processItemError?: AsyncFunction;
  onComplete?: AsyncFunction;
  //progressFeedback?: React.ReactNode;
  renderProgressFeedback?: (completedItems: any, queuedItems: any) => React.ReactNode;
  renderResultFeedback?: (completedItems: any, queuedItems: any) => React.ReactNode;
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

export function Queue({
  registerComponentApi,
  willProcessItem,
  processItem,
  didProcessItem,
  processItemError,
  onComplete,
  //progressFeedback,
  renderProgressFeedback,
  renderResultFeedback,
  clearAfterFinish = defaultProps.clearAfterFinish,
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
  }, [
    registerComponentApi,
    enqueueItem,
    enqueueItems,
    clearCompleted,
    remove,
    getQueueLength,
    getQueuedItems,
  ]);

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
    [
      appContext,
      didProcessItem,
      dispatch,
      processItem,
      processItemError,
      queueState.queueState,
      willProcessItem,
    ],
  );

  const toastId = useRef<string | undefined>();
  const queue = queueState.queue;
  const prevQueue = usePrevious(queue);

  const doComplete = useCallback(() => {
    onComplete?.();
    const queuedItems = getQueuedItems();
    const completedItems = getQueuedItems().filter((item) => item.status === "completed");
    const resultFeedback = renderResultFeedback?.(completedItems, queuedItems);
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
    if (renderProgressFeedback) {
      const queuedItems = getQueuedItems();
      const completedItems = getQueuedItems().filter((item) => item.status === "completed");
      const progressFeedback = renderProgressFeedback?.(completedItems, queuedItems);
      if (progressFeedback && toastId.current) {
        toast.loading(<>{progressFeedback}</>, {
          id: toastId.current,
        });
      } else {
        toastId.current = toast.loading(<>{progressFeedback}</>);
      }
    }
  }, [renderProgressFeedback, queue?.length]);

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
    void (async () => {
      await doSingle(queueItem);
    })();
  }, [doComplete, doSingle, prevQueue, queue]);

  return null;
}

type QueueItemState = "pending" | "started" | "in-progress" | "completed" | "error";

export type QueueItem = {
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
