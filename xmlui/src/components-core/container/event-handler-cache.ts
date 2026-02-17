/**
 * Event Handler Caching Module
 * 
 * Creates and caches event handler functions to avoid re-creating them on every render.
 * Handles:
 * - String handlers (raw code)
 * - ParsedEventValue (pre-parsed syntax trees)
 * - ArrowExpression objects
 * - Source info tracking for inspector logging
 * 
 * Part of Container.tsx refactoring - Step 2
 */

import { useCallback } from "react";
import { cloneDeep } from "lodash-es";
import memoizeOne from "memoize-one";
import type {
  ArrowExpression,
} from "../script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import type { LookupActionOptions } from "../../abstractions/ActionDefs";
import { isParsedEventValue, isArrowExpression } from "../rendering/ContainerUtils";
import type { HandlerLoggerContext } from "../inspector/handler-logging";
import { useEvent } from "../utils/misc";

// Type for the function cache - keyed by UID, then by cache key
type FunctionCache = Record<symbol, Record<string, (...args: any[]) => any>>;

/**
 * Configuration for event handler cache
 */
export interface EventHandlerCacheConfig {
  // Reference to the function cache
  fnsRef: React.MutableRefObject<FunctionCache>;
  // Handler for executing async code
  runCodeAsync: (
    source: string | ParsedEventValue | ArrowExpression,
    uid: symbol,
    options: LookupActionOptions | undefined,
    ...eventArgs: any[]
  ) => Promise<any>;
  // Handler for executing sync code
  runCodeSync: (arrowExpression: ArrowExpression, ...eventArgs: any[]) => any;
  // Handler logger for source info tracking
  handlerLogger: HandlerLoggerContext;
}

/**
 * Checks if an object is an arrow expression-like object
 */
function isArrowExpressionObject(obj: any): obj is ArrowExpression {
  return obj && typeof obj === "object" && "statement" in obj;
}

/**
 * Creates event handler cache functions
 */
export function createEventHandlerCache(config: EventHandlerCacheConfig) {
  const { fnsRef, runCodeAsync, runCodeSync, handlerLogger } = config;

  // ========================================================================
  // ASYNC EVENT HANDLER CACHING
  // ========================================================================

  const getOrCreateEventHandlerFn = useEvent(
    (
      src: string | ParsedEventValue | ArrowExpression,
      uid: symbol,
      options?: LookupActionOptions,
    ) => {
      if (Array.isArray(src)) {
        throw new Error("Multiple event handlers are not supported");
      }

      let fnCacheKey: string;
      let handler: (...eventArgs: any[]) => Promise<any>;

      if (typeof src === "string") {
        // --- We have a string event handler
        fnCacheKey = `${options?.eventName};${src}`;
        handler = (...eventArgs: any[]) => {
          return runCodeAsync(src, uid, options, ...cloneDeep(eventArgs));
        };
      } else if (isParsedEventValue(src)) {
        // --- We have the syntax tree to execute
        fnCacheKey = `${options?.eventName};${src.parseId}`;
        handler = (...eventArgs: any[]) => {
          return runCodeAsync(src, uid, options, ...cloneDeep(eventArgs));
        };
      } else if (isArrowExpression(src)) {
        // --- We have an arrow expression to execute
        fnCacheKey = `${options?.eventName};${src.statement.nodeId}`;
        handler = (...eventArgs: any[]) => {
          return runCodeAsync(src, uid, options, ...cloneDeep(eventArgs));
        };
      } else if ((src as any).type) {
        // --- We have an arrow expression-like object
        fnCacheKey = `${options?.eventName};${JSON.stringify(src)}`;
        handler = (...eventArgs: any[]) => {
          return runCodeAsync(src, uid, options, ...cloneDeep(eventArgs));
        };
      } else {
        // --- We have an unknown event handler
        throw new Error("Invalid event handler");
      }

      // If we have a context or ephemeral event handler, we don't cache it
      if (options?.ephemeral || options?.context) {
        return handler;
      }

      // Cache the handler function
      if (!fnsRef.current[uid]?.[fnCacheKey]) {
        fnsRef.current[uid] = fnsRef.current[uid] || {};
        fnsRef.current[uid][fnCacheKey] = handler;
      }

      // Store source info for inspector logging (even for cached handlers)
      if (options?.sourceFileId !== undefined) {
        const keyPart =
          options.componentId ||
          `${options.componentType || "unknown"}:${options.componentLabel || ""}`;
        const sourceKey = `${keyPart};${options?.eventName || "unknown"}`;
        handlerLogger.storeSourceInfo(sourceKey, options.sourceFileId, options.sourceRange);
      }

      return fnsRef.current[uid][fnCacheKey];
    },
  );

  // ========================================================================
  // SYNC CALLBACK CACHING
  // ========================================================================

  const getOrCreateSyncCallbackFn = useCallback(
    (arrowExpression: ArrowExpression, uid: symbol) => {
      const fnCacheKey = `sync-callback-${arrowExpression.nodeId}`;
      if (!fnsRef.current[uid]?.[fnCacheKey]) {
        fnsRef.current[uid] = fnsRef.current[uid] || {};
        fnsRef.current[uid][fnCacheKey] = memoizeOne((arrowExpression) => {
          return (...eventArgs: any[]) => {
            return runCodeSync(arrowExpression, ...eventArgs);
          };
        });
      }
      return fnsRef.current[uid][fnCacheKey](arrowExpression);
    },
    [runCodeSync],
  );

  // ========================================================================
  // CLEANUP
  // ========================================================================

  const cleanup = useEvent((uid: symbol) => {
    delete fnsRef.current[uid];
  });

  return {
    getOrCreateEventHandlerFn,
    getOrCreateSyncCallbackFn,
    cleanup,
  };
}
