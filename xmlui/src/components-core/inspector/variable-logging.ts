/**
 * Variable change logging for XMLUI inspector.
 * 
 * This module encapsulates variable tracking and logging functionality including:
 * - Variable initialization logging
 * - Variable change detection and logging
 * - Source file resolution
 * - Deferred init logging (when source files load after component mount)
 * - Framework variable filtering
 */

import { cloneDeep } from "lodash-es";
import type { ContainerWrapperDef } from "../rendering/ContainerWrapper";
import {
  getCurrentTrace,
  simpleStringify,
  xsConsoleLog,
  pushXsLog,
} from "./inspectorUtils";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuration for variable logger.
 */
export interface VariableLoggerConfig {
  /** Container node with metadata */
  node: ContainerWrapperDef;
  /** Variable definitions (user-declared vars) */
  varDefinitions: Record<string, any>;
  /** Resolved local variables (current values) */
  resolvedLocalVars: Record<string, any>;
  /** Enable verbose logging */
  xsVerbose: boolean;
}

/**
 * Variable change entry for logging.
 */
export interface VariableChange {
  /** Variable name */
  key: string;
  /** Previous value */
  before: any;
  /** New value */
  after: any;
  /** Type of change */
  kind: "init" | "change";
}

/**
 * Variable logger context with state tracking.
 */
export interface VariableLoggerContext {
  /** Track variable changes and log them */
  trackAndLogChanges: () => void;
  /** Reset tracking state (for cleanup) */
  reset: () => void;
}

// ============================================================================
// FRAMEWORK VARIABLES TO FILTER
// ============================================================================

/**
 * Framework-injected variables that should not be logged.
 * These are internal state management variables.
 */
const FRAMEWORK_VARS = new Set([
  "$props",
  "emitEvent",
  "hasEventHandler",
  "updateState",
  "$item",
  "$itemIndex",
  "$this",
  "$parent",
]);

// ============================================================================
// VARIABLE LOGGER CREATION
// ============================================================================

/**
 * Create a variable logger context for tracking and logging variable changes.
 * 
 * The logger:
 * 1. Tracks declared variable changes across renders
 * 2. Logs initialization events on first render
 * 3. Logs change events when variables are updated
 * 4. Handles deferred init logging when source files load after mount
 * 5. Filters out framework-injected variables
 * 6. Resolves source file information for attribution
 * 
 * @param config - Configuration for the logger
 * @returns Variable logger context
 * 
 * @example
 * ```typescript
 * const logger = createVariableLogger({
 *   node,
 *   varDefinitions,
 *   resolvedLocalVars,
 *   xsVerbose: true
 * });
 * 
 * // In useEffect:
 * useEffect(() => {
 *   logger.trackAndLogChanges();
 * }, [resolvedLocalVars]);
 * ```
 */
export function createVariableLogger(config: VariableLoggerConfig): VariableLoggerContext {
  const { node, varDefinitions, resolvedLocalVars, xsVerbose } = config;

  // State for tracking variable changes
  let prevVarsRef: Record<string, any> | null = null;
  let initLoggedWithFileRef = false;
  let pendingInitRef: Record<string, any> | null = null;

  /**
   * Get user-declared variable keys (excluding framework vars).
   */
  const getDeclaredVarKeys = (): string[] => {
    // Only track vars, not functions - combine inline vars and script-collected vars
    const varsOnly = { ...(node.vars || {}), ...(node.scriptCollected?.vars || {}) };
    return Object.keys(varsOnly).filter(
      (key) => !FRAMEWORK_VARS.has(key) && !key.startsWith("$"),
    );
  };

  /**
   * Resolve source file information from node debug data.
   */
  const resolveSourceInfo = (): {
    resolvedFileId?: number | string;
    resolvedFilePath?: string;
    sourceInfo?: any;
  } => {
    if (typeof window === "undefined") {
      return {};
    }

    const w = window as any;

    // Check both direct debug property and props.debug
    const sourceInfo = (node as any).debug?.source || (node.props as any)?.debug?.source;

    let resolvedFileId = sourceInfo?.fileId;
    let resolvedFilePath: string | undefined;

    // If we have a numeric fileId, resolve it from _xsSourceFiles
    if (typeof resolvedFileId === "number" && w._xsSourceFiles) {
      resolvedFilePath = w._xsSourceFiles[resolvedFileId];
    } else if (typeof resolvedFileId === "string") {
      resolvedFilePath = resolvedFileId;
    }

    // If no file found yet, try to match based on component uid or containerUid
    if (!resolvedFilePath && w._xsSourceFiles && Array.isArray(w._xsSourceFiles)) {
      const containerUidStr = node.containerUid?.description;
      const searchName = node.uid || containerUidStr;
      const typeName = node.type !== "Container" ? node.type : undefined;

      // Build search terms with variations
      const searchTerms: string[] = [];
      if (searchName) {
        searchTerms.push(searchName);
        // For containerUid like "fileCatalogContent", also try "fileCatalog"
        const stripped = searchName.replace(/(Content|Modal|View|Container|Panel)$/i, "");
        if (stripped !== searchName) searchTerms.push(stripped);
      }
      if (typeName) searchTerms.push(typeName);

      for (const term of searchTerms) {
        if (!term) continue;
        const termLower = term.toLowerCase();
        resolvedFilePath = w._xsSourceFiles.find((f: string) => {
          const fLower = f.toLowerCase();
          const fileName = fLower.split("/").pop()?.replace(".xmlui", "") || "";
          return fileName.includes(termLower) || termLower.includes(fileName);
        });
        if (resolvedFilePath) break;
      }
    }

    return { resolvedFileId, resolvedFilePath, sourceInfo };
  };

  /**
   * Build a meaningful component identifier from available info.
   */
  const getComponentId = (resolvedFilePath?: string): string | undefined => {
    const fileName = resolvedFilePath
      ? resolvedFilePath.split("/").pop()?.replace(".xmlui", "")
      : undefined;
    return (
      node.uid ||
      fileName ||
      node.containerUid?.description ||
      (node.type !== "Container" ? node.type : undefined) ||
      undefined
    );
  };

  /**
   * Log variable changes (init or update).
   */
  const logChanges = (
    changes: VariableChange[],
    isInitial: boolean,
    componentId: string | undefined,
    resolvedFilePath: string | undefined,
    sourceInfo: any,
  ) => {
    const varNames = changes.map((c) => c.key).join(", ");
    const displayId = componentId || changes[0]?.key || "component";

    const formattedChanges = changes.map((c) => {
      return `${c.key}: ${simpleStringify(c.before)} → ${simpleStringify(c.after)}`;
    });

    const logEntry = {
      ts: Date.now(),
      perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
      traceId: getCurrentTrace() || `vars-${displayId}`,
      kind: isInitial ? "component:vars:init" : "component:vars:change",
      uid: displayId,
      eventName: varNames,
      componentType: node.type,
      componentLabel: componentId || undefined,
      ownerFileId: resolvedFilePath || sourceInfo?.fileId,
      ownerSource: sourceInfo ? { start: sourceInfo.start, end: sourceInfo.end } : undefined,
      file: resolvedFilePath,
      changes: changes.map((c) => ({
        key: c.key,
        before: c.before,
        after: c.after,
        changeKind: c.kind,
      })),
      diff: changes.map((c) => ({
        path: c.key,
        type: c.kind === "init" ? "add" : "update",
        before: c.before,
        after: c.after,
        beforeJson: simpleStringify(c.before),
        afterJson: simpleStringify(c.after),
        diffPretty: `${c.key}: ${simpleStringify(c.before)} → ${simpleStringify(c.after)}`,
      })),
      diffPretty: (resolvedFilePath ? `file: ${resolvedFilePath}\n` : "") + formattedChanges.join("\n"),
    };

    pushXsLog(logEntry);
    xsConsoleLog(logEntry.kind, logEntry);
  };

  /**
   * Track variable changes and log them.
   * Should be called in useEffect watching resolvedLocalVars.
   */
  const trackAndLogChanges = () => {
    if (!xsVerbose || typeof window === "undefined") return;

    const declaredVarKeys = getDeclaredVarKeys();
    if (declaredVarKeys.length === 0) {
      prevVarsRef = {};
      return;
    }

    const { resolvedFilePath, sourceInfo } = resolveSourceInfo();
    const componentId = getComponentId(resolvedFilePath);

    // Get current variable values
    const currentVars: Record<string, any> = {};
    for (const key of declaredVarKeys) {
      currentVars[key] = resolvedLocalVars[key];
    }

    const prevVars = prevVarsRef;
    const isInitial = prevVars === null;
    const w = window as any;
    const hasSourceFiles = w._xsSourceFiles && Array.isArray(w._xsSourceFiles) && w._xsSourceFiles.length > 0;

    const changes: VariableChange[] = [];

    if (isInitial) {
      // Initial mount
      if (!hasSourceFiles) {
        // Defer init logging until source files are available
        pendingInitRef = cloneDeep(currentVars);
        prevVarsRef = cloneDeep(currentVars);
        return;
      }

      // Source files available - capture all declared vars for init
      for (const key of declaredVarKeys) {
        const afterVal = currentVars[key];
        if (afterVal !== undefined) {
          changes.push({
            key,
            before: undefined,
            after: afterVal,
            kind: "init",
          });
        }
      }
    } else {
      // Check if we have a pending init to log now that source files are available
      if (pendingInitRef && !initLoggedWithFileRef && hasSourceFiles) {
        const initChanges: VariableChange[] = [];
        for (const key of declaredVarKeys) {
          const afterVal = pendingInitRef[key];
          if (afterVal !== undefined) {
            initChanges.push({
              key,
              before: undefined,
              after: afterVal,
              kind: "init",
            });
          }
        }

        if (initChanges.length > 0) {
          logChanges(initChanges, true, componentId, resolvedFilePath, sourceInfo);
        }

        initLoggedWithFileRef = true;
        pendingInitRef = null;
      }

      // Check for changes
      for (const key of declaredVarKeys) {
        const prev = prevVars[key];
        const curr = currentVars[key];
        // Deep comparison for objects/arrays
        const prevJson = JSON.stringify(prev);
        const currJson = JSON.stringify(curr);
        if (prevJson !== currJson) {
          changes.push({
            key,
            before: prev,
            after: curr,
            kind: "change",
          });
        }
      }
    }

    if (changes.length > 0) {
      logChanges(changes, isInitial, componentId, resolvedFilePath, sourceInfo);
    }

    prevVarsRef = cloneDeep(currentVars);
  };

  /**
   * Reset tracking state (for cleanup).
   */
  const reset = () => {
    prevVarsRef = null;
    initLoggedWithFileRef = false;
    pendingInitRef = null;
  };

  return {
    trackAndLogChanges,
    reset,
  };
}
