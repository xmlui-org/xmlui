/**
 * Handler execution logging for XMLUI inspector.
 * 
 * This module encapsulates all event handler logging functionality including:
 * - Handler start/complete/error logging
 * - Source code extraction and tracking
 * - Trace ID management
 * - Duration tracking
 * - Handler code formatting
 */

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { LookupActionOptions } from "../../abstractions/ActionDefs";
import type { ArrowExpression } from "../script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import {
  pushTrace,
  popTrace,
  getCurrentTrace,
  safeStringify,
  xsConsoleLog,
  pushXsLog,
  formatChange,
} from "./inspectorUtils";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuration for handler logger.
 */
export interface HandlerLoggerConfig {
  /** Application context for accessing globals */
  appContext: AppContextObject;
  /** Node debug information for source mapping */
  nodeDebugSource?: { fileId?: number | string; start?: any; end?: any };
}

/**
 * Details for logging handler start.
 */
export interface HandlerStartDetails {
  /** Component UID */
  uid: string;
  /** Event name (e.g., "click", "change") */
  eventName?: string;
  /** Component type (e.g., "Button", "Input") */
  componentType?: string;
  /** Component label/ID for display */
  componentLabel?: string;
  /** Event arguments passed to handler */
  eventArgs?: any[];
  /** Source file ID */
  ownerFileId?: number | string;
  /** Source range (start/end positions) */
  ownerSource?: any;
  /** Handler source code */
  handlerCode?: string;
}

/**
 * Details for logging handler completion.
 */
export interface HandlerCompleteDetails extends HandlerStartDetails {
  /** Return value from handler */
  returnValue?: any;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Performance timestamp at start */
  startPerfTs?: number;
  /** Trace ID for this handler execution */
  traceId?: string;
}

/**
 * Details for logging handler error.
 */
export interface HandlerErrorDetails extends HandlerStartDetails {
  /** Error that occurred */
  error: any;
  /** Trace ID for this handler execution */
  traceId?: string;
}

/**
 * Details for logging state changes.
 */
export interface StateChangesDetails {
  /** Component UID */
  uid: string;
  /** Event name that triggered changes */
  eventName?: string;
  /** Component type */
  componentType?: string;
  /** Component label */
  componentLabel?: string;
  /** Array of state changes */
  changes: Array<{
    path: string;
    action?: string;
    previousValue: any;
    newValue: any;
  }>;
}

/**
 * Handler logger context with helper functions.
 */
export interface HandlerLoggerContext {
  /** Check if verbose logging is enabled */
  isVerbose: () => boolean;
  /** Create xsLog helper function */
  createXsLog: () => (...args: any[]) => void;
  /** Initialize trace for handler execution */
  initializeTrace: (preferredId?: string) => string | undefined;
  /** Clean up trace after handler execution */
  cleanupTrace: (traceId: string | undefined) => void;
  /** Extract component metadata from options */
  extractComponentMetadata: (
    componentUid: symbol,
    options?: LookupActionOptions,
  ) => {
    uidName: string;
    componentType?: string;
    componentLabel: string;
  };
  /** Extract handler code from source */
  extractHandlerCode: (
    source: string | ParsedEventValue | ArrowExpression,
  ) => string | undefined;
  /** Look up source info for handler */
  lookupSourceInfo: (
    options?: LookupActionOptions,
  ) => {
    handlerFileId?: number | string;
    handlerSourceRange?: any;
  };
  /** Store source info in global for error handling */
  storeSourceInfo: (
    sourceKey: string,
    sourceFileId?: number | string,
    sourceRange?: any,
  ) => void;
  /** Log handler start */
  logHandlerStart: (details: HandlerStartDetails) => void;
  /** Log handler completion */
  logHandlerComplete: (details: HandlerCompleteDetails) => void;
  /** Log handler error */
  logHandlerError: (details: HandlerErrorDetails) => void;
  /** Log state changes */
  logStateChanges: (details: StateChangesDetails) => void;
}

// ============================================================================
// HANDLER LOGGER CREATION
// ============================================================================

/**
 * Create a handler logger context with all logging functions.
 * 
 * @param config - Configuration for the logger
 * @returns Handler logger context with helper functions
 * 
 * @example
 * ```typescript
 * const logger = createHandlerLogger({ appContext, nodeDebugSource });
 * 
 * if (logger.isVerbose()) {
 *   const traceId = logger.initializeTrace();
 *   const { uidName, componentType, componentLabel } = 
 *     logger.extractComponentMetadata(componentUid, options);
 *   
 *   logger.logHandlerStart({
 *     uid: uidName,
 *     eventName: options.eventName,
 *     componentType,
 *     componentLabel,
 *     eventArgs,
 *     ...logger.lookupSourceInfo(options),
 *     handlerCode: logger.extractHandlerCode(source),
 *   });
 *   
 *   try {
 *     // Execute handler...
 *     logger.logHandlerComplete({ ... });
 *   } catch (e) {
 *     logger.logHandlerError({ ..., error: e });
 *   } finally {
 *     logger.cleanupTrace(traceId);
 *   }
 * }
 * ```
 */
export function createHandlerLogger(config: HandlerLoggerConfig): HandlerLoggerContext {
  const { appContext, nodeDebugSource } = config;

  // Check if verbose logging is enabled
  const isVerbose = () => appContext.appGlobals?.xsVerbose === true;

  // Create the xsLog helper function
  const createXsLog = () => {
    const xsLogBucket = appContext.appGlobals?.xsVerboseLogBucket;
    const xsLogMax = Number(appContext.appGlobals?.xsVerboseLogMax ?? 200);

    return (...args: any[]) => {
      if (!isVerbose()) return;

      xsConsoleLog(...args);
      const detail = args[1];
      pushXsLog(
        {
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: detail?.traceId ?? getCurrentTrace(),
          text: safeStringify(args),
          kind: args[0] ?? undefined,
          eventName: detail?.eventName,
          componentType: detail?.componentType,
          componentLabel: detail?.componentLabel,
          uid: detail?.uid ? String(detail.uid) : undefined,
          diffPretty:
            detail?.diffPretty ||
            (Array.isArray(detail?.diff) &&
              detail.diff
                .map((d: any) => d?.diffPretty)
                .filter(Boolean)
                .join("\n\n")) ||
            undefined,
          diffJson: Array.isArray(detail?.diff) ? detail.diff : undefined,
          error: detail?.error
            ? { message: detail.error.message || String(detail.error), stack: detail.error.stack }
            : undefined,
          ownerFileId: detail?.ownerFileId,
          ownerSource: detail?.ownerSource,
          duration: detail?.duration,
          startPerfTs: detail?.startPerfTs,
          handlerCode: detail?.handlerCode,
          eventArgs: detail?.args?.length ? detail.args : undefined,
        },
        xsLogMax,
      );

      // Optionally log to AppState bucket
      if (xsLogBucket && appContext.AppState) {
        try {
          const current = appContext.AppState.get(xsLogBucket) || [];
          const next = Array.isArray(current) ? current.slice() : [];
          next.push({ ts: Date.now(), args });
          if (Number.isFinite(xsLogMax) && xsLogMax > 0 && next.length > xsLogMax) {
            next.splice(0, next.length - xsLogMax);
          }
          appContext.AppState.set(xsLogBucket, next);
        } catch (e) {
          console.warn("[xs] Failed to write to AppState log bucket", e);
        }
      }
    };
  };

  // Initialize trace for handler execution
  const initializeTrace = (preferredId?: string): string | undefined => {
    if (!isVerbose()) return undefined;

    // Try to reuse trace from recent user interaction
    const resolvedPreferredId =
      preferredId ||
      (typeof window !== "undefined"
        ? (() => {
            const w = window as any;
            if (w._xsCurrentTrace) return w._xsCurrentTrace;
            const last = w._xsLastInteraction;
            return last && Date.now() - last.ts < 2000 ? last.id : undefined;
          })()
        : undefined);

    return pushTrace(resolvedPreferredId);
  };

  // Clean up trace after handler execution
  const cleanupTrace = (traceId: string | undefined) => {
    if (traceId) {
      popTrace();
    }
  };

  // Extract component metadata from options
  const extractComponentMetadata = (
    componentUid: symbol,
    options?: LookupActionOptions,
  ) => {
    const uidName = componentUid.description || "";
    const componentType = options?.componentType;
    const componentLabel = options?.componentLabel || options?.componentId || uidName;

    return { uidName, componentType, componentLabel };
  };

  // Extract handler code from source
  const extractHandlerCode = (
    source: string | ParsedEventValue | ArrowExpression,
  ): string | undefined => {
    if (typeof source === "string") {
      return source;
    } else if ((source as any)?.source) {
      // ParsedEventValue has .source
      return (source as any).source;
    } else if ((source as any)?.name) {
      // ArrowExpression has .name (function name)
      return `${(source as any).name}()`;
    }
    return undefined;
  };

  // Look up source info for handler
  const lookupSourceInfo = (options?: LookupActionOptions) => {
    const keyPart =
      options?.componentId || `${options?.componentType || "unknown"}:${options?.componentLabel || ""}`;
    const sourceKey = `${keyPart};${options?.eventName || "unknown"}`;
    const storedSourceInfo =
      typeof window !== "undefined" ? (window as any)._xsHandlerSourceInfo?.[sourceKey] : undefined;

    const handlerFileId =
      options?.sourceFileId ?? storedSourceInfo?.fileId ?? nodeDebugSource?.fileId;
    const handlerSourceRange =
      options?.sourceRange ??
      storedSourceInfo?.range ??
      (nodeDebugSource ? { start: nodeDebugSource.start, end: nodeDebugSource.end } : undefined);

    return { handlerFileId, handlerSourceRange };
  };

  // Store source info in global for error handling
  const storeSourceInfo = (
    sourceKey: string,
    sourceFileId?: number | string,
    sourceRange?: any,
  ) => {
    if (typeof window !== "undefined" && sourceFileId !== undefined) {
      const w = window as any;
      w._xsHandlerSourceInfo = w._xsHandlerSourceInfo || {};
      w._xsHandlerSourceInfo[sourceKey] = {
        fileId: sourceFileId,
        range: sourceRange,
      };
    }
  };

  // Log handler start
  const logHandlerStart = (details: HandlerStartDetails) => {
    if (!isVerbose()) return;

    const xsLog = createXsLog();
    xsLog("handler:start", {
      uid: details.uid,
      eventName: details.eventName,
      componentType: details.componentType,
      componentLabel: details.componentLabel,
      args: details.eventArgs,
      ownerFileId: details.ownerFileId,
      ownerSource: details.ownerSource,
      handlerCode: details.handlerCode,
    });
  };

  // Log handler completion
  const logHandlerComplete = (details: HandlerCompleteDetails) => {
    if (!isVerbose()) return;

    const xsLog = createXsLog();
    xsLog("handler:complete", {
      uid: details.uid,
      eventName: details.eventName,
      componentType: details.componentType,
      componentLabel: details.componentLabel,
      returnValue: details.returnValue,
      duration: details.duration,
      startPerfTs: details.startPerfTs,
      ownerFileId: details.ownerFileId,
      ownerSource: details.ownerSource,
      handlerCode: details.handlerCode,
      traceId: details.traceId,
    });
  };

  // Log handler error
  const logHandlerError = (details: HandlerErrorDetails) => {
    if (!isVerbose()) return;

    const xsLog = createXsLog();
    xsLog("handler:error", {
      uid: details.uid,
      eventName: details.eventName,
      componentType: details.componentType,
      componentLabel: details.componentLabel,
      error: details.error,
      ownerFileId: details.ownerFileId,
      ownerSource: details.ownerSource,
      traceId: details.traceId,
    });
  };

  // Log state changes
  const logStateChanges = (details: StateChangesDetails) => {
    if (!isVerbose()) return;

    // Filter out internal argument wiring
    const filteredChanges = details.changes.filter(
      (change) =>
        typeof change.path === "string" && !change.path.startsWith("__arg@@#__"),
    );

    if (filteredChanges.length === 0) {
      // Only internal argument wiring happened; skip logging
      return;
    }

    const xsLog = createXsLog();
    xsLog("state:changes", {
      uid: details.uid,
      eventName: details.eventName,
      componentType: details.componentType,
      componentLabel: details.componentLabel,
      changes: filteredChanges.map((change) => ({
        path: change.path,
        action: change.action,
        previousValue: change.previousValue,
        newValue: change.newValue,
      })),
      diff: filteredChanges.map(formatChange),
    });
  };

  return {
    isVerbose,
    createXsLog,
    initializeTrace,
    cleanupTrace,
    extractComponentMetadata,
    extractHandlerCode,
    lookupSourceInfo,
    storeSourceInfo,
    logHandlerStart,
    logHandlerComplete,
    logHandlerError,
    logStateChanges,
  };
}
