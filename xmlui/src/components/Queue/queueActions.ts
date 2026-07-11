export enum QueueActionKind {
  ACTION_ITEM_STARTED = "ACTION_ITEM_STARTED",
  ACTION_ITEM_PROGRESS = "ACTION_ITEM_PROGRESS",
  ACTION_ITEM_COMPLETED = "ACTION_ITEM_COMPLETED",
  CLEAR_COMPLETED_ACTION_ITEMS = "CLEAR_COMPLETED_ACTION_ITEMS",
  ACTION_ITEM_ERROR = "ACTION_ITEM_ERROR",
  ACTION_QUEUE_INITIALIZED = "ACTION_QUEUE_INITIALIZED",
  ACTION_ITEM_REMOVED = "ACTION_ITEM_REMOVED",
}

export interface QueueAction {
  type: QueueActionKind;
  // Potential improvement: Try to specify the type with more details
  payload:
    | {
        uid?: any;
        data?: any;
        error?: any;
        value?: any;
      }
    | any;
}

// Signs that a particular component (`uid`) has started running an action with `actionItemId`.
export function actionItemStarted(actionItemId: string) {
  return {
    type: QueueActionKind.ACTION_ITEM_STARTED,
    payload: {
      actionItemId,
    },
  };
}

// Signs that a particular component (`uid`) reports progress information (`progressEvent`)
// on an action with `actionItemId`.
export function actionItemProgress(actionItemId: string, progressEvent: any) {
  return {
    type: QueueActionKind.ACTION_ITEM_PROGRESS,
    payload: {
      actionItemId,
      progressEvent,
    },
  };
}

// Signs that a particular component (`uid`) has completed an action with `actionItemId` resulting in `result`.
export function actionItemCompleted(actionItemId: string, result: any) {
  return {
    type: QueueActionKind.ACTION_ITEM_COMPLETED,
    payload: {
      actionItemId,
      result,
    },
  };
}

// Signs that a particular component (`uid`) has removed an action with `actionItemId` from the execution queue.
export function removeActionItem(actionItemId: string) {
  return {
    type: QueueActionKind.ACTION_ITEM_REMOVED,
    payload: {
      actionItemId,
    },
  };
}

// Signs that a particular component (`uid`) has cleared completed action items from its execution queue.
export function clearCompletedActionItems() {
  return {
    type: QueueActionKind.CLEAR_COMPLETED_ACTION_ITEMS,
    payload: {},
  };
}

// Signs that a particular component (`uid`) received an `error` when running an action with `actionItemId`.
export function actionItemError(actionItemId: string, error: any) {
  return {
    type: QueueActionKind.ACTION_ITEM_ERROR,
    payload: {
      actionItemId,
      error,
    },
  };
}

// Signs that a particular component (`uid`) has initialized its execution `queue` with the specified `batchId`.
export function actionQueueInitialized(
  queue: Array<any>,
  batchId: string,
  actionItemIds: string[],
  traceId?: string,
) {
  return {
    type: QueueActionKind.ACTION_QUEUE_INITIALIZED,
    payload: {
      queue,
      actionItemIds,
      batchId,
      traceId,
    },
  };
}
