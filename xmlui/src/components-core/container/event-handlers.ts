/**
 * Event Handler Execution Module
 * 
 * Handles asynchronous and synchronous event handler execution with:
 * - State tracking and lifecycle management
 * - Inspector logging integration  
 * - React transition management for non-blocking updates
 * - Statement queue processing
 * - Error handling and cleanup
 * 
 * Part of Container.tsx refactoring - Step 2
 */

import { useCallback } from "react";
import { cloneDeep } from "lodash-es";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { IApiInterceptor } from "../interception/abstractions";
import type { 
  ArrowExpression, 
  ArrowExpressionStatement,
  Statement,
} from "../script-runner/ScriptingSourceTree";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import type { LookupActionOptions } from "../../abstractions/ActionDefs";
import { buildProxy, type ProxyAction } from "../rendering/buildProxy";
import { 
  parseHandlerCode,
  prepareHandlerStatements,
} from "../utils/statementUtils";
import { processStatementQueueAsync } from "../script-runner/process-statement-async";
import { processStatementQueue } from "../script-runner/process-statement-sync";
import { isParsedEventValue } from "../rendering/ContainerUtils";
import { T_ARROW_EXPRESSION_STATEMENT } from "../script-runner/ScriptingSourceTree";
import { getCurrentTrace } from "../inspector/inspectorUtils";
import type { HandlerLoggerContext } from "../inspector/handler-logging";
import { ContainerActionKind } from "../rendering/containers";
import { delay, generatedId, useEvent } from "../utils/misc";

// Type for the parsed statements cache
type ParsedStatementsCache = Record<string, Statement[]>;

// Type for state dispatch function
type DispatchFn = (action: any) => void;

// Type for state part changed callback
type StatePartChangedFn = (
  pathArray: string[],
  newValue: any,
  target: any,
  action: ProxyAction,
) => void;

// Type for statement promise resolver
type StatementPromiseResolver = () => void;

/**
 * Configuration for creating event handler executors
 */
export interface EventHandlerConfig {
  // App context with globals and utilities
  appContext: AppContextObject;
  // Handler logger for inspector integration
  handlerLogger: HandlerLoggerContext;
  // Current state reference
  stateRef: React.MutableRefObject<Record<string | symbol, any>>;
  // Theme variable getter
  getThemeVar: (varName: string) => any;
  // State dispatch function
  dispatch: DispatchFn;
  // API interceptor instance
  apiInstance: IApiInterceptor | null;
  // Navigation function
  navigate: (to: string, options?: any) => void;
  // Location object
  location: any;
  // Action lookup function (for nested calls)
  lookupAction: (action: any, uid: symbol, options?: LookupActionOptions) => any;
  // Callback when state part changes
  statePartChanged: StatePartChangedFn;
  // React transition start function
  startTransition: (callback: () => void) => void;
  // Version setter for forcing re-renders
  setVersion: React.Dispatch<React.SetStateAction<number>>;
  // Mounted ref to check if component is still mounted
  mountedRef: React.MutableRefObject<boolean>;
  // Statement promises for coordinating async updates
  statementPromises: React.MutableRefObject<Map<string, StatementPromiseResolver>>;
  // Parsed statements cache
  parsedStatementsRef: React.MutableRefObject<ParsedStatementsCache>;
}

/**
 * Creates event handler executors with the given configuration
 */
export function createEventHandlers(config: EventHandlerConfig) {
  const {
    appContext,
    handlerLogger,
    stateRef,
    getThemeVar,
    dispatch,
    apiInstance,
    navigate,
    location,
    lookupAction,
    statePartChanged,
    startTransition,
    setVersion,
    mountedRef,
    statementPromises,
    parsedStatementsRef,
  } = config;

  // ========================================================================
  // ASYNC EVENT HANDLER EXECUTION
  // ========================================================================

  const runCodeAsync = useEvent(
    async (
      source: string | ParsedEventValue | ArrowExpression,
      uid: symbol,
      options: LookupActionOptions | undefined,
      ...eventArgs: any[]
    ) => {
      // --- Check if the event handler can sign its lifecycle state
      const canSignEventLifecycle = () => {
        return uid.description !== undefined && options?.eventName !== undefined;
      };

      let changes: Array<any> = [];
      const getComponentStateClone = () => {
        changes.length = 0;
        const poj = cloneDeep({ ...stateRef.current, ...(options?.context || {}) });
        poj["$this"] = stateRef.current[uid];
        return buildProxy(poj, (changeInfo) => {
          const idRoot = (changeInfo.pathArray as string[])?.[0];
          if (idRoot?.startsWith("$")) {
            throw new Error("Cannot update a read-only variable");
          }
          changes.push(changeInfo);
        });
      };

      // Create xsLog function for use in evalContext
      const xsLog = handlerLogger.createXsLog();

      const evalAppContext = {
        ...appContext,
        getThemeVar,
        xsLog,
      };
      const evalContext: BindingTreeEvaluationContext = {
        appContext: evalAppContext,
        eventArgs,
        localContext: getComponentStateClone(),
        implicitContextGetter: () => {
          return {
            uid,
            state: stateRef.current,
            getCurrentState: () => stateRef.current,
            dispatch,
            appContext: evalAppContext,
            apiInstance,
            navigate,
            location,
            lookupAction: (action, lookupUid, actionOptions = {}) => {
              return lookupAction(action, lookupUid, {
                ...actionOptions,
                ephemeral: true,
              });
            },
          };
        },
        options: {
          defaultToOptionalMemberAccess:
            typeof appContext.appGlobals?.defaultToOptionalMemberAccess === "boolean"
              ? appContext.appGlobals.defaultToOptionalMemberAccess
              : true,
        },
      };

      // Initialize trace and extract metadata for logging
      const traceId = handlerLogger.initializeTrace();
      const { uidName, componentType, componentLabel } = handlerLogger.extractComponentMetadata(
        uid,
        options,
      );
      const handlerCode = handlerLogger.extractHandlerCode(source);
      const { handlerFileId, handlerSourceRange } = handlerLogger.lookupSourceInfo(options);

      // Track handler start time for duration calculation
      const handlerStartPerfTs =
        typeof performance !== "undefined" ? performance.now() : undefined;

      // Capture traceId at handler start so handler:complete uses the same trace
      const handlerTraceId = getCurrentTrace();

      try {
        // Log handler start
        handlerLogger.logHandlerStart({
          uid: uidName,
          eventName: options?.eventName,
          componentType,
          componentLabel,
          eventArgs,
          ownerFileId: handlerFileId,
          ownerSource: handlerSourceRange,
          handlerCode,
        });

        // --- Prepare the event handler to an arrow expression statement
        let statements: Statement[];
        if (typeof source === "string") {
          if (!parsedStatementsRef.current[source]) {
            parsedStatementsRef.current[source] = prepareHandlerStatements(
              parseHandlerCode(source),
              evalContext,
            );
          }
          statements = parsedStatementsRef.current[source];
        } else if (isParsedEventValue(source)) {
          const parseId = source.parseId.toString();
          if (!parsedStatementsRef.current[parseId]) {
            parsedStatementsRef.current[parseId] = prepareHandlerStatements(
              source.statements,
              evalContext,
            );
          }
          statements = parsedStatementsRef.current[parseId];
        } else {
          statements = [
            {
              type: T_ARROW_EXPRESSION_STATEMENT,
              expr: source,
            } as ArrowExpressionStatement,
          ];
        }

        if (!statements?.length) {
          return;
        }

        if (canSignEventLifecycle()) {
          // --- Sign the event handler has been started
          dispatch({
            type: ContainerActionKind.EVENT_HANDLER_STARTED,
            payload: {
              uid,
              eventName: options.eventName,
            },
          });
        }

        let mainThreadBlockingRuns = 0;
        evalContext.onStatementCompleted = async (evalContext) => {
          if (changes.length) {
            // Log state changes
            handlerLogger.logStateChanges({
              uid: uidName,
              eventName: options.eventName,
              componentType,
              componentLabel,
              changes,
            });

            mainThreadBlockingRuns = 0;
            changes.forEach((change) => {
              statePartChanged(
                change.pathArray,
                cloneDeep(change.newValue),
                change.target,
                change.action,
              );
            });
            let resolve: StatementPromiseResolver | null = null;
            const stateUpdatedPromise = new Promise<void>((res) => {
              resolve = () => {
                res();
              };
            });
            const key = generatedId();
            statementPromises.current.set(key, resolve!);

            try {
              // We use this to tell react that this update is not high-priority.
              startTransition(() => {
                setVersion((prev) => prev + 1);
              });

              // Wait for state update to complete
              if (mountedRef.current) {
                await stateUpdatedPromise;
              } else {
                await delay(0);
              }
            } finally {
              // Always remove from map, even if an error occurred
              statementPromises.current.delete(key);

              // Development-only monitoring for potential memory leaks
              if (process.env.NODE_ENV === "development") {
                const mapSize = statementPromises.current.size;
                if (mapSize > 100) {
                  console.warn(
                    `[Container] Statement promises map is large (${mapSize} entries). ` +
                      `Possible memory leak or very complex event handler.`,
                    { componentUid: uid },
                  );
                }
              }
            }

            changes = [];
          } else {
            // Prevent main thread blocking in long-running loops
            mainThreadBlockingRuns++;
            if (mainThreadBlockingRuns > 100) {
              mainThreadBlockingRuns = 0;
              await delay(0);
            }
          }
          evalContext.localContext = getComponentStateClone();
        };

        await processStatementQueueAsync(statements, evalContext);

        if (canSignEventLifecycle()) {
          // --- Sign the event handler has successfully completed
          dispatch({
            type: ContainerActionKind.EVENT_HANDLER_COMPLETED,
            payload: {
              uid,
              eventName: options.eventName,
            },
          });
        }

        // Log handler completion with duration
        const handlerEndPerfTs =
          typeof performance !== "undefined" ? performance.now() : undefined;
        const handlerDuration =
          handlerStartPerfTs !== undefined && handlerEndPerfTs !== undefined
            ? handlerEndPerfTs - handlerStartPerfTs
            : undefined;
        const returnValue = evalContext.mainThread?.blocks?.length
          ? evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue
          : undefined;

        handlerLogger.logHandlerComplete({
          uid: uidName,
          eventName: options?.eventName,
          componentType,
          componentLabel,
          returnValue,
          duration: handlerDuration,
          startPerfTs: handlerStartPerfTs,
          ownerFileId: handlerFileId,
          ownerSource: handlerSourceRange,
          handlerCode,
          traceId: handlerTraceId,
        });

        if (evalContext.mainThread?.blocks?.length) {
          return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1]
            .returnValue;
        }
      } catch (e) {
        // Log handler error
        handlerLogger.logHandlerError({
          uid: uidName,
          eventName: options?.eventName,
          componentType,
          componentLabel,
          error: e,
          ownerFileId: options?.sourceFileId ?? handlerFileId,
          ownerSource: options?.sourceRange ?? handlerSourceRange,
          traceId: handlerTraceId,
        });

        // Sign error if not suppressed
        if (options?.signError !== false) {
          appContext.signError(e as Error);
        }

        if (canSignEventLifecycle()) {
          dispatch({
            type: ContainerActionKind.EVENT_HANDLER_ERROR,
            payload: {
              uid,
              eventName: options.eventName,
              error: e,
            },
          });
        }
        throw e;
      } finally {
        // Clean up trace
        handlerLogger.cleanupTrace(traceId);
      }
    },
  );

  // ========================================================================
  // SYNC EVENT HANDLER EXECUTION
  // ========================================================================

  const runCodeSync = useCallback(
    (arrowExpression: ArrowExpression, ...eventArgs: any[]) => {
      const evalContext: BindingTreeEvaluationContext = {
        localContext: cloneDeep(stateRef.current),
        appContext,
        eventArgs,
      };
      try {
        const arrowStmt = {
          type: T_ARROW_EXPRESSION_STATEMENT,
          expr: arrowExpression,
        } as ArrowExpressionStatement;

        processStatementQueue([arrowStmt], evalContext);

        if (evalContext.mainThread?.blocks?.length) {
          return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1]
            .returnValue;
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    [appContext],
  );

  return {
    runCodeAsync,
    runCodeSync,
  };
}
