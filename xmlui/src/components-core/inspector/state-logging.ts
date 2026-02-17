/**
 * State change logging for XMLUI inspector.
 * 
 * This module provides utilities for logging state changes outside of event handlers,
 * such as external state updates, loader state changes, and component lifecycle events.
 * 
 * Note: Most state change logging during event handler execution is handled by
 * handler-logging.ts via the logStateChanges function.
 */

import type { ProxyAction } from "../rendering/buildProxy";
import {
  getCurrentTrace,
  simpleStringify,
  xsConsoleLog,
  pushXsLog,
  formatChange,
} from "./inspectorUtils";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuration for state logger.
 */
export interface StateLoggerConfig {
  /** Enable verbose logging */
  xsVerbose: boolean;
  /** Component UID for attribution */
  componentUid?: symbol;
  /** Component type for attribution */
  componentType?: string;
}

/**
 * Details for logging a state part change.
 */
export interface StatePartChangeDetails {
  /** Path array to the changed property */
  path: string[];
  /** New value */
  value: any;
  /** Target that was changed */
  target: string;
  /** Type of action */
  action: ProxyAction;
  /** Optional previous value */
  previousValue?: any;
}

/**
 * State logger context with logging functions.
 */
export interface StateLoggerContext {
  /** Check if verbose logging is enabled */
  isVerbose: () => boolean;
  /** Log a state part change */
  logStatePartChange: (details: StatePartChangeDetails) => void;
  /** Log a batch of state changes */
  logStateBatch: (changes: StatePartChangeDetails[]) => void;
}

// ============================================================================
// STATE LOGGER CREATION
// ============================================================================

/**
 * Create a state logger context for logging state changes.
 * 
 * @param config - Configuration for the logger
 * @returns State logger context with logging functions
 * 
 * @example
 * ```typescript
 * const logger = createStateLogger({
 *   xsVerbose: true,
 *   componentUid,
 *   componentType: "Button"
 * });
 * 
 * // Log a single state change:
 * logger.logStatePartChange({
 *   path: ["count"],
 *   value: 5,
 *   target: "container",
 *   action: "set",
 *   previousValue: 4
 * });
 * 
 * // Log multiple changes:
 * logger.logStateBatch([
 *   { path: ["user", "name"], value: "John", target: "user", action: "set" },
 *   { path: ["user", "age"], value: 30, target: "user", action: "set" }
 * ]);
 * ```
 */
export function createStateLogger(config: StateLoggerConfig): StateLoggerContext {
  const { xsVerbose, componentUid, componentType } = config;

  // Check if verbose logging is enabled
  const isVerbose = () => xsVerbose === true;

  /**
   * Log a single state part change.
   */
  const logStatePartChange = (details: StatePartChangeDetails) => {
    if (!isVerbose()) return;

    const pathStr = details.path.join(".");
    const uidName = componentUid?.description || "unknown";

    const logEntry = {
      ts: Date.now(),
      perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
      traceId: getCurrentTrace(),
      kind: "state:part:changed",
      uid: uidName,
      componentType,
      path: pathStr,
      action: details.action,
      value: details.value,
      previousValue: details.previousValue,
      target: details.target,
      diff: [
        {
          path: pathStr,
          type: details.action === "set" ? "update" : "remove",
          before: details.previousValue,
          after: details.value,
          beforeJson: simpleStringify(details.previousValue),
          afterJson: simpleStringify(details.value),
          diffPretty: `${pathStr}: ${simpleStringify(details.previousValue)} → ${simpleStringify(details.value)}`,
        },
      ],
    };

    pushXsLog(logEntry);
    xsConsoleLog(logEntry.kind, logEntry);
  };

  /**
   * Log a batch of state changes.
   */
  const logStateBatch = (changes: StatePartChangeDetails[]) => {
    if (!isVerbose() || changes.length === 0) return;

    const uidName = componentUid?.description || "unknown";

    const logEntry = {
      ts: Date.now(),
      perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
      traceId: getCurrentTrace(),
      kind: "state:batch:changed",
      uid: uidName,
      componentType,
      changes: changes.map((change) => ({
        path: change.path.join("."),
        action: change.action,
        value: change.value,
        previousValue: change.previousValue,
        target: change.target,
      })),
      diff: changes.map((change) => {
        const pathStr = change.path.join(".");
        return {
          path: pathStr,
          type: change.action === "set" ? "update" : "remove",
          before: change.previousValue,
          after: change.value,
          beforeJson: simpleStringify(change.previousValue),
          afterJson: simpleStringify(change.value),
          diffPretty: `${pathStr}: ${simpleStringify(change.previousValue)} → ${simpleStringify(change.value)}`,
        };
      }),
      diffPretty: changes
        .map((change) => {
          const pathStr = change.path.join(".");
          return `${pathStr}: ${simpleStringify(change.previousValue)} → ${simpleStringify(change.value)}`;
        })
        .join("\n"),
    };

    pushXsLog(logEntry);
    xsConsoleLog(logEntry.kind, logEntry);
  };

  return {
    isVerbose,
    logStatePartChange,
    logStateBatch,
  };
}
