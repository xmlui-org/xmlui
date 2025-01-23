// This value defines the reducer to manage the state of the view container using the current state of the container
// and an action. Note that the reducer function in this package handles immutability with the `produce` function of
// the immer package

import { ContainerState } from "@abstractions/ContainerDefs";
import { ContainerAction, ContainerActionKind } from "@components-core/abstractions/containers";
import { IDebugViewContext } from "@components-core/DebugViewProvider";
import produce from "immer";
import { isPlainObject, keyBy, setWith, unset } from "lodash-es";

export function createContainerReducer(debugView: IDebugViewContext) {
  const allowLogging = debugView.collectStateTransitions;

  // 
  return produce((state: ContainerState, action: ContainerAction) => {
    const { uid } = action.payload;
    if (uid === undefined && action.type !== ContainerActionKind.STATE_PART_CHANGED) {
      console.error("uid not provided for control component", {
        state,
        action,
      });
      return state;
    }
    switch (action.type) {
      case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED: {
        state[uid] = { ...state[uid], inProgress: action.payload.inProgress };
        break;
      }
      case ContainerActionKind.LOADER_LOADED: {
        const { data, pageInfo } = action.payload;
        state[uid] = {
          value: data,
          byId: Array.isArray(data) ? keyBy(data, (item) => item.$id) : undefined,
          inProgress: false,
          loaded: data !== undefined,
          pageInfo,
        };
        break;
      }
      case ContainerActionKind.LOADER_ERROR: {
        const { error } = action.payload;
        state[uid] = { ...state[uid], error, inProgress: false, loaded: true };
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_STARTED: {
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: true };
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_COMPLETED: {
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: false };
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_ERROR: {
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: false };
        break;
      }
      case ContainerActionKind.COMPONENT_STATE_CHANGED: {
        const { state: newState } = action.payload;
        state[uid] = {
          ...state[uid],
          ...newState,
        };
        break;
      }
      case ContainerActionKind.STATE_PART_CHANGED: {
        const { path, value, target, actionType } = action.payload;
        if (actionType === "unset") {
          unset(state, path);
        } else {
          setWith(state, path, value, (nsValue) => {
            if (nsValue === undefined && isPlainObject(target)) {
              // if we are setting a new object's key, lodash defaults it to an array, if the key is a number.
              // This way we can force it to be an object.
              // (example: we have an empty object in vars called usersTyped: {}, we set usersTyped[1] = Date.now().
              // During the first state setting, we don't have a previous value for usersTyped, because it was defined
              // in vars, and wasn't updated yet. In the first update, it's value is undefined, and because the key is
              // a number (an id in our case), lodash thinks it has to create an array after this 'set'. This way we
              // can force it, because in the target we have the target object value (given by the proxy change),so if
              // it's an object, it should be an object. Otherwise, we let lodash decide)
              return Object(nsValue);
            }
          });
        }
        break;
      }
      default:
        throw new Error();
    }
  });
  
}

