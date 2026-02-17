/**
 * Action Lookup Module
 * 
 * Provides functions for looking up and resolving:
 * - Asynchronous action handlers (event handlers)
 * - Synchronous callback functions
 * - Convention-based handlers (e.g., componentName_onEventName)
 * 
 * Part of Container.tsx refactoring - Step 2
 */

import { useCallback } from "react";
import type { ArrowExpression } from "../script-runner/ScriptingSourceTree";
import type { LookupActionOptions } from "../../abstractions/ActionDefs";

/**
 * Lookup function type for async actions
 */
export type LookupAsyncFnInner = (
  action: string | undefined | ArrowExpression,
  uid: symbol,
  options?: LookupActionOptions,
) => ((...args: any[]) => Promise<any>) | undefined;

/**
 * Lookup function type for sync callbacks
 */
export type LookupSyncFnInner = (
  action: any,
  uid: symbol,
) => ((...args: any[]) => any) | undefined;

/**
 * Configuration for action lookup
 */
export interface ActionLookupConfig {
  // Current component state
  componentState: Record<string | symbol, any>;
  // Event handler function getter
  getOrCreateEventHandlerFn: (
    src: string | any,
    uid: symbol,
    options?: LookupActionOptions,
  ) => (...args: any[]) => Promise<any>;
  // Sync callback function getter
  getOrCreateSyncCallbackFn: (
    arrowExpression: ArrowExpression,
    uid: symbol,
  ) => (...args: any[]) => any;
}

/**
 * Checks if an object is an arrow expression
 */
function isArrowExpressionObject(obj: any): obj is ArrowExpression {
  return obj && typeof obj === "object" && "statement" in obj;
}

/**
 * Capitalizes the first letter of a string
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Creates action lookup functions
 */
export function createActionLookup(config: ActionLookupConfig) {
  const { componentState, getOrCreateEventHandlerFn, getOrCreateSyncCallbackFn } = config;

  // ========================================================================
  // SYNC CALLBACK LOOKUP
  // ========================================================================

  const lookupSyncCallback: LookupSyncFnInner = useCallback(
    (action, uid) => {
      if (!action) {
        return undefined;
      }

      if (typeof action === "function") {
        return action;
      }

      if (!isArrowExpressionObject(action)) {
        throw new Error("Only arrow expression allowed in sync callback");
      }

      return getOrCreateSyncCallbackFn(action, uid);
    },
    [getOrCreateSyncCallbackFn],
  );

  // ========================================================================
  // ASYNC ACTION LOOKUP
  // ========================================================================

  const lookupAction: LookupAsyncFnInner = useCallback(
    (
      action: string | undefined | ArrowExpression,
      uid: symbol,
      options?: LookupActionOptions,
    ) => {
      let safeAction = action;

      // Check for convention-based handler (e.g., componentName_onEventName)
      if (!action && uid.description && options?.eventName) {
        const handlerFnName = `${uid.description}_on${capitalizeFirstLetter(options?.eventName)}`;
        if (
          componentState[handlerFnName] &&
          isArrowExpressionObject(componentState[handlerFnName])
        ) {
          safeAction = componentState[handlerFnName] as ArrowExpression;
        }
      }

      if (!safeAction) {
        return undefined;
      }

      if (typeof safeAction === "function") {
        return safeAction;
      }

      return getOrCreateEventHandlerFn(safeAction, uid, options);
    },
    [componentState, getOrCreateEventHandlerFn],
  );

  return {
    lookupAction,
    lookupSyncCallback,
  };
}
