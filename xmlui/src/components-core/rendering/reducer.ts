import produce, { original } from "immer";
import { cloneDeep, isPlainObject, keyBy, setWith, unset } from "lodash-es";

import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { ContainerAction } from "./containers";
import { ContainerActionKind } from "./containers";
import type { IDebugViewContext } from "../DebugViewProvider";
import { pushXsLog } from "../inspector/inspectorUtils";
import { isRenderInProgress } from "../scheduler";
import { evalTrace } from "../script-runner/eval-trace";

const MAX_STATE_TRANSITION_LENGTH = 100;

/**
 * Loader entry keys compared by content rather than identity: a loader may send a fresh but
 * equal object for them on every load.
 */
const CONTENT_COMPARED_LOADER_KEYS = new Set(["pageInfo", "responseHeaders"]);

/** Whether two values are identical, or plain objects with the same keys and identical values */
function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) => Object.is((a as any)[key], (b as any)[key]))
  );
}

/**
 * Whether writing `patch` onto a loader's current state entry would change anything.
 *
 * A loader action that sets only values already in place must leave the entry untouched: an
 * entry replaced by an equal copy is still a new container state, and redraws the component
 * that owns the loader for nothing (#3941; the render trace reports it as `identityOnly`).
 * A missing entry always counts as a change, so the entry is still created.
 * @param current The loader's entry as stored before this action (not an immer draft)
 * @param patch The fields the action sets
 */
export function loaderPatchChanges(
  current: Record<string, any> | undefined,
  patch: Record<string, any>,
): boolean {
  if (current === undefined || current === null) return true;
  return Object.keys(patch).some((key) =>
    CONTENT_COMPARED_LOADER_KEYS.has(key)
      ? !shallowEqual(current[key], patch[key])
      : !Object.is(current[key], patch[key]),
  );
}

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
    // --- Evaluation trace (see eval-trace.ts): names each container
    // --- action while the host-armed window is open. No-op otherwise.
    evalTrace("action", () => String(action.type ?? "") + " uid:" + String(action.payload?.uid ?? ""));
    if (isRenderInProgress()) {
      pushXsLog({
        kind: "scheduler",
        ts: Date.now(),
        code: "determinism-state-write-after-render",
        severity: "warn",
        message: "State was written while a render phase was in progress.",
        data: { action: action.type, uid: action.payload?.uid },
      });
    }
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

    // --- Applies a loader action's fields to the loader's entry, unless they are all in place
    // --- already. The comparison reads the stored entry, not the draft: a nested object read
    // --- through an immer draft is a proxy, never identical to the incoming value.
    function writeLoaderPatch(patch: Record<string, any>) {
      if (!loaderPatchChanges(loaderEntryBeforeAction(), patch)) return;
      state[uid] = { ...state[uid], ...patch };
      storeNextValue(state[uid]);
    }

    function loaderEntryBeforeAction(): Record<string, any> | undefined {
      return (original(state) as ContainerState | undefined)?.[uid];
    }

    // --- Apply the action
    switch (action.type) {
      case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED: {
        writeLoaderPatch({
          inProgress: action.payload.inProgress,
          // --- A refetch starts both flags in one write: one redraw of the owner, not two (#3941)
          ...(action.payload.isRefetching !== undefined && {
            isRefetching: action.payload.isRefetching,
          }),
          ...(action.payload.resetCancellation && {
            cancelled: false,
            lastCancelReason: undefined,
          }),
        });
        break;
      }
      case ContainerActionKind.LOADER_IS_REFETCHING_CHANGED: {
        writeLoaderPatch({ isRefetching: action.payload.isRefetching });
        break;
      }
      case ContainerActionKind.LOADER_LOADED: {
        const { data, pageInfo, responseHeaders } = action.payload;
        const current = loaderEntryBeforeAction();
        // Preserve any existing state properties (e.g., custom component state).
        // Only clear inProgress when actual data arrives; when data is undefined
        // (reset/cleanup call), preserve inProgress so an in-flight fetch stays visible.
        // byId derives from the value: keep it while the value is the same reference.
        writeLoaderPatch({
          value: data,
          byId:
            current && Object.is(current.value, data)
              ? current.byId
              : Array.isArray(data)
                ? keyBy(data, (item) => item.$id)
                : undefined,
          ...(data !== undefined && { inProgress: false }),
          loaded: data !== undefined,
          pageInfo,
          responseHeaders,
        });
        break;
      }
      case ContainerActionKind.LOADER_ERROR: {
        const { error } = action.payload;
        writeLoaderPatch({
          error,
          inProgress: false,
          loaded: true,
          cancelled: false,
          lastCancelReason: undefined,
        });
        break;
      }
      case ContainerActionKind.LOADER_CANCELLED: {
        const currentPageInfo = loaderEntryBeforeAction()?.pageInfo;
        writeLoaderPatch({
          inProgress: false,
          isRefetching: false,
          ...(currentPageInfo && {
            pageInfo: {
              ...currentPageInfo,
              isFetchingPrevPage: false,
              isFetchingNextPage: false,
            },
          }),
          cancelled: true,
          lastCancelReason: action.payload.cancelReason,
        });
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_STARTED: {
        // Skip if this reducer doesn't own this component's state
        if (!(uid in state)) break;
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: true };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_COMPLETED: {
        // Skip if this reducer doesn't own this component's state
        if (!(uid in state)) break;
        const { eventName } = action.payload;
        const inProgressFlagName = `${eventName}InProgress`;
        state[uid] = { ...state[uid], [inProgressFlagName]: false };
        storeNextValue(state[uid]);
        break;
      }
      case ContainerActionKind.EVENT_HANDLER_ERROR: {
        // Skip if this reducer doesn't own this component's state
        if (!(uid in state)) break;
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
          setWith(state, path, value, (nsValue, key) => {
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
              return Object(nsValue);
            } else if (
              nsValue === undefined &&
              Array.isArray(tempValueInLocalVars) &&
              Array.isArray(target)
            ) {
              return target;
            } else if (nsValue === undefined) {
              return tempValueInLocalVars;
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
