/**
 * This enumeration defines the available actions on a view container. We use these actions in the redux-style state
 * management of the component rendering engine.
 */
export const enum ContainerActionKind {
  LOADER_LOADED = "ContainerActionKind:LOADER_LOADED",
  LOADER_IN_PROGRESS_CHANGED = "ContainerActionKind:LOADER_IN_PROGRESS_CHANGED",
  LOADER_IS_REFETCHING_CHANGED = "ContainerActionKind:LOADER_IS_REFETCHING_CHANGED",
  LOADER_ERROR = "ContainerActionKind:LOADER_ERROR",
  EVENT_HANDLER_STARTED = "ContainerActionKind:EVENT_HANDLER_STARTED",
  EVENT_HANDLER_COMPLETED = "ContainerActionKind:EVENT_HANDLER_COMPLETED",
  EVENT_HANDLER_ERROR = "ContainerActionKind:EVENT_HANDLER_ERROR",
  COMPONENT_STATE_CHANGED = "ContainerActionKind:COMPONENT_STATE_CHANGED",
  STATE_PART_CHANGED = "ContainerActionKind:STATE_PART_CHANGED",
}

// Represents a reducer action dispatched in a view container
export interface ContainerAction {
  type: ContainerActionKind;
  // Potential improvement: Try to specify the type with more details
  payload: {
    uid?: any;
    data?: any;
    error?: any;
    value?: any;
    byId?: any;
    inProgress?: any;
    isRefetching?: any;
    loaded?: any;
    pageInfo?: any;
    path?: any;
    target?: any;
    actionType?: any;
    state?: any;
    eventName?: any;
    localVars?: any;
  };
}
