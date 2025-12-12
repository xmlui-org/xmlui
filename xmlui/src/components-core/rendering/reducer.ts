import produce from "immer";
import { cloneDeep, isPlainObject, keyBy, setWith, unset } from "lodash-es";

import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { ContainerAction} from "./containers";
import { ContainerActionKind } from "./containers";
import type { IDebugViewContext } from "../DebugViewProvider";

const MAX_STATE_TRANSITION_LENGTH = 100;

/**
 * This function creates a reducer for the container state. For diagnostics, it may
 * log the state transitions.
 * @param debugView This debug view determines if the state transitions should be logged.
 */
export function createContainerReducer(debugView: IDebugViewContext) {
  const allowLogging = debugView.collectStateTransitions;
  let prevState: any = undefined;
  let nextState: any = undefined;

  // --- The reducer function
  return produce((state: ContainerState, action: ContainerAction) => {
    // --- Check if the action has an appropriate uid
    const { uid } = action.payload;
    if (uid === undefined && action.type !== ContainerActionKind.STATE_PART_CHANGED) {
      console.error("uid not provided for control component", {
        state,
        action,
      });
      return state;
    }

    // --- Store the previous state for logging
    if (allowLogging) {
      try {
        prevState = cloneDeep(state[uid]);
      } catch (e) {
        console.error("Error while cloning previous value", e);
      }
    }

    // --- Apply the action
    switch (action.type) {
      case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED: {
        state[uid] = { ...state[uid], inProgress: action.payload.inProgress };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.LOADER_IS_REFETCHING_CHANGED: {
        state[uid] = { ...state[uid], isRefetching: action.payload.isRefetching };
        storeNextValue(state[uid]);
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
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.LOADER_ERROR: {
        const { error } = action.payload;
        state[uid] = { ...state[uid], error, inProgress: false, loaded: true };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_STARTED: {
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: true };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_COMPLETED: {
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: false };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_ERROR: {
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: false };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.COMPONENT_STATE_CHANGED: {
        const { state: newState } = action.payload;
        state[uid] = {
          ...state[uid],
          ...newState,
        };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.STATE_PART_CHANGED: {
        const { path, value, target, actionType, localVars } = action.payload;
        if (actionType === "unset") {
          unset(state, path);
        } else {
          let tempValueInLocalVars = localVars;
          setWith(state, path, value, (nsValue, key, nsObject) => {
            tempValueInLocalVars = tempValueInLocalVars?.[key];
            if (
              nsValue === undefined &&
              isPlainObject(tempValueInLocalVars) &&
              isPlainObject(target)
            ) {
              // if we are setting a new object's key, lodash defaults it to an array, if the key is a number.
              // This way we can force it to be an object.
              // (example: we have an empty object in vars called usersTyped: {}, we set usersTyped[1] = Date.now().
              // During the first state setting, we don't have a previous value for usersTyped, because it was defined
              // in vars, and wasn't updated yet. In the first update, it's value is undefined, and because the key is
              // a number (an id in our case), lodash thinks it has to create an array after this 'set'. This way we
              // can force it, because in the target we have the target object value (given by the proxy change),so if
              // it's an object, it should be an object. Otherwise, we let lodash decide)
              const next = Object(nsValue);
              return next;
            }
          });
          storeNextValue(state);
        }
        break;
      }
      default:
        throw new Error();
    }

    // --- Log the transition
    if (allowLogging) {
      const loggedTransition = {
        action: action.type,
        uid,
        prevState,
        nextState,
      };

      // TODO: Logging to the console is a temporary solution. We should use a proper
      // logging mechanism. Nonetheless, this works only with state transition logging
      // enabled (which is disabled by default).
      if (debugView.stateTransitions) {
        if (debugView.stateTransitions.length >= MAX_STATE_TRANSITION_LENGTH) {
          debugView.stateTransitions.shift();
        }
        debugView.stateTransitions.push(loggedTransition);
      }
    }

    function storeNextValue(nextValue: any) {
      if (allowLogging) {
        try {
          nextState = cloneDeep(nextValue);
        } catch (e) {
          console.error("Error while cloning next value", e);
        }
      }
    }
  });
}