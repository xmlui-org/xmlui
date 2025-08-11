import type { AppContextObject } from "../abstractions/AppContextDefs";
import type { AsyncFunction, SyncFunction } from "./FunctionDefs";
import type { ContainerState } from "./ContainerDefs";
import type { ArrowExpression } from "../components-core/script-runner/ScriptingSourceTree";
import type { ApiInterceptor } from "../components-core/interception/ApiInterceptor";

// This type represents the options to use for looking up actions.
export type LookupActionOptions = {
  // This property (by default, true) indicates that any error should be signed 
  // while executing an event handler. Set it to `false` to suppress error 
  // indication.
  signError?: boolean;

  // We can use the event's name to get info about a particular event's progress.
  // Note: Multiple events can run simultaneously.
  eventName?: string;

  // By default, we cache resolved action functions. This property signs that we
  // don't want to cache this function. Use true on one-off handlers, like the 
  // ones in Actions (e.g., `MutateAction`).
  ephemeral?: boolean;

  // This property declares the script code to use as a default for a particular
  // event handler.
  defaultHandler?: string;

  // extra context to pass to the action
  context?: any;
};

// This function resolves an action by its name (within the component node that
// runs the action) with the specified options and returns the action function if
// found. Otherwise, return undefined.
export type LookupAsyncFnInner = (
  action: string | undefined,
  // The unique identifier of the container that the action is executed in.
  uid: symbol,
  actionOptions?: LookupActionOptions
) => AsyncFunction | undefined;

// This function resolves an action by its name with the specified options and
// returns the action function if found. Otherwise, return undefined.
export type LookupAsyncFn = (
  action: string | undefined,
  actionOptions?: LookupActionOptions
) => AsyncFunction | undefined;

// This function resolves a sync action by its name (within the component node
// running it) and returns the action function if found. Otherwise, it returns
// undefined.
export type LookupSyncFnInner = (action: ArrowExpression | undefined, uid: symbol) => SyncFunction | undefined;

// This function resolves a sync action by its name and returns the action 
// function if it is found. Otherwise, it returns undefined.
export type LookupSyncFn = (action: string | undefined) => SyncFunction | undefined;

// XMLUI keeps a registry of available actions to store information about
// out-of-the-box and custom actions (contributions implemented in external
// packages or files). This type describes the information the registry needs
// about the action to be able to render it.
export interface ActionRendererDef {
  // The name of the action that will be used to reference it in XMLUI.
  actionName: string;
  
  // The function that executes the action.
  actionFn: ActionFunction;
}

// This type represents the context in which an action is executed.
export interface ActionExecutionContext {
  // A unique identifier for the container that the action is executed in.
  uid: symbol;

  // The state of the container that the action is executed in.
  state: ContainerState;

  getCurrentState: ()=>ContainerState;

  // The appContext object passed to the current app
  appContext: AppContextObject;
  apiInstance?: ApiInterceptor;

  // The lookup function to resolve a sync action by its name.
  lookupAction: LookupAsyncFnInner;
  navigate: any; // TEMPORARY stuff, we could use the one in the appContext, but until
                 // https://github.com/remix-run/react-router/issues/7634 fixed we can't
  location: any; // TEMPORARY stuff, we could use the one in the appContext, but until
                 // https://github.com/remix-run/react-router/issues/7634 fixed we can't
}

// This type represents a function that executes a particular action within the
// specified context using the given arguments.
export type ActionFunction = (executionContext: ActionExecutionContext, ...args: any[]) => any;
