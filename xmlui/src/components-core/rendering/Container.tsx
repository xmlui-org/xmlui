import type { Dispatch, MutableRefObject, ReactNode, RefObject, SetStateAction } from "react";
import React, {
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cloneDeep, isArray } from "lodash-es";
import { composeRefs } from "@radix-ui/react-compose-refs";
import memoizeOne from "memoize-one";

import type {
  LookupActionOptions,
  LookupAsyncFnInner,
  LookupSyncFnInner,
} from "../../abstractions/ActionDefs";
import type { ComponentDef, ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type {
  ArrowExpression,
  ArrowExpressionStatement,
  Statement,
} from "../script-runner/ScriptingSourceTree";
import {
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
} from "../script-runner/ScriptingSourceTree";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "./containers";
import { useAppContext } from "../AppContext";
import { buildProxy } from "../rendering/buildProxy";
import type { StatePartChangedFn } from "./ContainerWrapper";
import type {
  ComponentCleanupFn,
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
} from "../rendering/ContainerWrapper";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../script-runner/process-statement-async";
import { processStatementQueue } from "../script-runner/process-statement-sync";
import { extractParam, shouldKeep } from "../utils/extractParam";
import { useIsomorphicLayoutEffect } from "../utils/hooks";
import { capitalizeFirstLetter, delay, generatedId, useEvent } from "../utils/misc";
import { parseHandlerCode, prepareHandlerStatements } from "../utils/statementUtils";
import { renderChild } from "./renderChild";
import { useTheme } from "../theming/ThemeContext";
import { LoaderComponent } from "../LoaderComponent";
import { isParsedEventValue, isArrowExpression } from "./ContainerUtils";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { EMPTY_ARRAY } from "../constants";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";
import { mergeProps } from "../utils/mergeProps";
import {
  pushTrace,
  popTrace,
  getCurrentTrace,
  formatChange,
  safeStringify,
  xsConsoleLog,
  pushXsLog,
} from "../inspector/inspectorUtils";

// Re-export for backward compatibility
export { getCurrentTrace } from "../inspector/inspectorUtils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the Container component.
 * Container manages component state, event handlers, and child rendering.
 */
type Props = {
  /** Container wrapper definition with children and loaders */
  node: ContainerWrapperDef;
  /** Resolved key for React reconciliation */
  resolvedKey?: string;
  /** Current component state */
  componentState: ContainerState;
  /** Global variables available to the container */
  globalVars?: Record<string, any>;
  /** Dispatcher for container state updates */
  dispatch: ContainerDispatcher;
  /** Function to set version number for re-rendering */
  setVersion: Dispatch<SetStateAction<number>>;
  /** Current version number for state updates */
  version: number;
  /** Callback when part of state changes */
  statePartChanged: StatePartChangedFn;
  /** Function to register component APIs */
  registerComponentApi: RegisterComponentApiFnInner;
  /** Parent's function to register component APIs */
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  /** Reference to layout context */
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  /** Reference to memoized variables */
  memoedVarsRef: MutableRefObject<MemoedVars>;
  /** Whether this is an implicit container */
  isImplicit?: boolean;
  /** Parent container's dispatcher */
  parentDispatch: ContainerDispatcher;
  /** Parent rendering context */
  parentRenderContext?: ParentRenderContext;
  /** Reference to UID information */
  uidInfoRef?: RefObject<Record<string, any>>;
  /** Child elements to render */
  children?: ReactNode;
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * Container component that manages component state, event handlers, and child rendering.
 * Provides:
 * - Event handler execution (async and sync)
 * - Event handler caching and lifecycle tracking
 * - Child component rendering
 * - Loader rendering
 * - API registration for compound components
 */
export const Container = memo(
  forwardRef(function Container(
    {
      node,
      componentState,
      globalVars,
      dispatch: containerDispatch,
      parentDispatch,
      resolvedKey,
      version,
      setVersion,
      statePartChanged,
      registerComponentApi: containerRegisterComponentApi,
      parentRegisterComponentApi,
      layoutContextRef,
      parentRenderContext,
      memoedVarsRef,
      isImplicit,
      uidInfoRef: parentUidInfoRef,
      children,
      ...rest
    }: Props,
    ref,
  ) {
    const { apiBoundContainer } = node;
    const dispatch = isImplicit ? parentDispatch : containerDispatch;
    const registerComponentApi = isImplicit
      ? parentRegisterComponentApi
      : containerRegisterComponentApi;

    const appContext = useAppContext();
    const xsVerbose = appContext.appGlobals?.xsVerbose === true;
    
    console.log('[Container]', node.type, node.uid, 'received globalVars:', globalVars ? Object.keys(globalVars) : undefined);
    if (node.uid === 'root' || globalVars) {
      console.log('[Container]', node.type, node.uid, 'globalVars values:', globalVars);
    }
    
    const { getThemeVar } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const fnsRef = useRef<Record<symbol, any>>({});

    const stateRef = useRef(componentState);

    // Sync ref in layout effect to ensure consistency before browser paint
    // This follows React best practices and avoids render-time ref mutations
    useIsomorphicLayoutEffect(() => {
      stateRef.current = componentState;
    }, [componentState]);

    const parsedStatementsRef = useRef<Record<string, Array<Statement> | null>>({});
    const [_, startTransition] = useTransition();
    const mountedRef = useRef(true);

    // ========================================================================
    // LIFECYCLE MANAGEMENT
    // ========================================================================

    // --- This ref holds a map of promises for each statement execution that cause any state change.
    const statementPromises = useRef<Map<string, any>>(new Map());

    // --- Ensure that re-rendering because of version change resolves all pending statement promises.
    useIsomorphicLayoutEffect(() => {
      for (const resolve of statementPromises.current.values()) {
        resolve();
      }
    }, [version]);

    // --- Ensure that component disposal resolves all pending statement promises.
    useEffect(() => {
      mountedRef.current = true;
      const leftPromises = statementPromises.current;
      return () => {
        mountedRef.current = false;
        for (const resolve of leftPromises.values()) {
          resolve();
        }
      };
    }, []);

    const { apiInstance } = useApiInterceptorContext();

    // ========================================================================
    // EVENT HANDLER EXECUTION - ASYNC
    // ========================================================================
    // runCodeAsync: Executes event handlers asynchronously with state tracking,
    // inspector logging, and React transition management.

    const runCodeAsync = useEvent(
      async (
        source: string | ParsedEventValue | ArrowExpression,
        componentUid: symbol,
        options: LookupActionOptions | undefined,
        ...eventArgs: any[]
      ) => {
        // --- Check if the event handler can sign its lifecycle state
        const canSignEventLifecycle = () => {
          return componentUid.description !== undefined && options?.eventName !== undefined;
        };

        let changes: Array<any> = [];
        const getComponentStateClone = () => {
          changes.length = 0;
          const poj = cloneDeep({ ...stateRef.current, ...(options?.context || {}) });
          poj["$this"] = stateRef.current[componentUid];
          return buildProxy(poj, (changeInfo) => {
            const idRoot = (changeInfo.pathArray as string[])?.[0];
            if (idRoot?.startsWith("$")) {
              throw new Error("Cannot update a read-only variable");
            }
            changes.push(changeInfo);
          });
        };
        const xsVerbose = appContext.appGlobals?.xsVerbose === true;
        const xsLogBucket = appContext.appGlobals?.xsVerboseLogBucket;
        const xsLogMax = Number(appContext.appGlobals?.xsVerboseLogMax ?? 200);
        const xsLog = (...args: any[]) => {
          if (!xsVerbose) return;
          xsConsoleLog(...args);
          const detail = args[1];
          pushXsLog({
            ts: Date.now(),
            perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
            traceId: detail?.traceId ?? getCurrentTrace(),
            text: safeStringify(args),
            kind: args[0] ?? undefined,
            eventName: detail?.eventName,
            componentType: detail?.componentType,
            componentLabel: detail?.componentLabel,
            uid: detail?.uid ? String(detail.uid) : undefined,
            diffPretty: detail?.diffPretty ||
              (Array.isArray(detail?.diff) && detail.diff.map((d: any) => d?.diffPretty).filter(Boolean).join("\n\n")) ||
              undefined,
            diffJson: Array.isArray(detail?.diff) ? detail.diff : undefined,
            error: detail?.error ? { message: detail.error.message || String(detail.error), stack: detail.error.stack } : undefined,
            ownerFileId: detail?.ownerFileId,
            ownerSource: detail?.ownerSource,
            duration: detail?.duration,
            startPerfTs: detail?.startPerfTs,
            handlerCode: detail?.handlerCode,
            eventArgs: detail?.args?.length ? detail.args : undefined,
          }, xsLogMax);
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
              uid: componentUid,
              state: stateRef.current,
              getCurrentState: () => stateRef.current,
              dispatch,
              appContext: evalAppContext,
              apiInstance,
              navigate,
              location,
              lookupAction: (action, uid, actionOptions = {}) => {
                return lookupAction(action, uid, {
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

        // Generate trace ID for this handler execution
        const preferredTraceId =
          xsVerbose && typeof window !== "undefined"
            ? (() => {
                const w = window as any;
                if (w._xsCurrentTrace) return w._xsCurrentTrace;
                const last = w._xsLastInteraction;
                return last && Date.now() - last.ts < 2000 ? last.id : undefined;
              })()
            : undefined;
        const traceId = xsVerbose ? pushTrace(preferredTraceId) : undefined;
        // Extract component context for logging
        const uidName = componentUid.description || "";
        const componentType = options?.componentType;
        const componentLabel = options?.componentLabel || options?.componentId || uidName;

        // Track handler start time for duration calculation
        const handlerStartPerfTs = typeof performance !== "undefined" ? performance.now() : undefined;

        // Look up source info for handler logging
        const keyPart = options?.componentId || `${componentType || "unknown"}:${componentLabel || ""}`;
        const sourceKey = `${keyPart};${options?.eventName || "unknown"}`;
        const storedSourceInfo = typeof window !== "undefined"
          ? (window as any)._xsHandlerSourceInfo?.[sourceKey]
          : undefined;
        const handlerFileId = options?.sourceFileId ?? storedSourceInfo?.fileId ?? (node as any)?.debug?.source?.fileId;
        const handlerSourceRange = options?.sourceRange ?? storedSourceInfo?.range ?? ((node as any)?.debug?.source
          ? { start: (node as any).debug.source.start, end: (node as any).debug.source.end }
          : undefined);

        // Extract handler code for logging (works with string, ParsedEventValue, or ArrowExpression)
        let handlerCode: string | undefined;
        if (typeof source === "string") {
          handlerCode = source;
        } else if ((source as any)?.source) {
          // ParsedEventValue has .source
          handlerCode = (source as any).source;
        } else if ((source as any)?.name) {
          // ArrowExpression has .name (function name)
          handlerCode = `${(source as any).name}()`;
        }

        // Capture traceId at handler start so handler:complete uses the same trace
        const handlerTraceId = getCurrentTrace();

        try {
          if (xsVerbose) {
            xsLog("handler:start", {
              uid: uidName,
              eventName: options?.eventName,
              componentType,
              componentLabel,
              args: eventArgs,
              ownerFileId: handlerFileId,
              ownerSource: handlerSourceRange,
              handlerCode,
            });
          }
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
                expr: source, //TODO illesg (talk it through why we need to deep clone, it it's omitted, it gets slower every time we run it)
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
                uid: componentUid,
                eventName: options.eventName,
              },
            });
          }
          let mainThreadBlockingRuns = 0;
          evalContext.onStatementCompleted = async (evalContext) => {
            if (changes.length) {
              if (xsVerbose) {
                const filteredChanges = changes.filter(
                  (change) => typeof change.path === "string" && !change.path.startsWith("__arg@@#__"),
                );
                if (filteredChanges.length === 0) {
                  // Only internal argument wiring happened; skip logging.
                } else {
                  xsLog("state:changes", {
                    uid: uidName,
                    eventName: options.eventName,
                    componentType,
                    componentLabel,
                    changes: filteredChanges.map((change) => ({
                      path: change.path,
                      action: change.action,
                      previousValue: change.previousValue,
                      newValue: change.newValue,
                    })),
                    diff: filteredChanges.map(formatChange),
                  });
                }
              }
              mainThreadBlockingRuns = 0;
              changes.forEach((change) => {
                statePartChanged(
                  change.pathArray,
                  cloneDeep(change.newValue),
                  change.target,
                  change.action,
                );
              });
              let resolve = null;
              const stateUpdatedPromise = new Promise((res) => {
                resolve = () => {
                  res(null);
                };
              });
              const key = generatedId();
              statementPromises.current.set(key, resolve);

              try {
                // We use this to tell react that this update is not high-priority.
                //   If we don't put it to a transition, the whole app would be blocked if we run a long,
                //   update intensive queue (e.g. an infinite loop which
                //   increments a counter, see playground example learning/01_Experiments/01_Event_Framework/app ).
                //   Before this solution, we used a setTimeout(..., 0); hack, but some browsers (chrome especially)
                //   do some funky stuff with the background tabs (e.g. all the setTimeouts are
                //   maximized to run in 1 time / minute, doesn't matter if it's timeout is 0)
                //   As of 2023. June 20, this solution works with backgrounded tabs, too.
                startTransition(() => {
                  setVersion((prev) => prev + 1);
                });

                //TODO this could be a problem - if this container gets unmounted, we still have to wait for the update,
                //  but in that case this update probably happened in the parent (e.g. a button's event handler removes the whole container
                //  where the button lives, but it still has some statements to run).
                // with this solution the statement execution doesn't stop, and we fallback waiting with a setTimeout(0)
                if (mountedRef.current) {
                  await stateUpdatedPromise;
                } else {
                  await delay(0);
                }
              } finally {
                // Always remove from map, even if an error occurred
                // This prevents memory leaks in long-running applications with frequent errors
                statementPromises.current.delete(key);

                // Development-only monitoring for potential memory leaks
                if (process.env.NODE_ENV === "development") {
                  const mapSize = statementPromises.current.size;
                  if (mapSize > 100) {
                    console.warn(
                      `[Container] Statement promises map is large (${mapSize} entries). ` +
                        `Possible memory leak or very complex event handler.`,
                      { containerUid: componentUid },
                    );
                  }
                }
              }

              changes = [];
            } else {
              //in this else branch normally we block the main thread (we don't wait for any state promise to be resolved),
              // so in a long-running (typically infinite loop) situation, where there aren't any changes in the state
              // we block the main thread indefinitely... this 'mainThreadBlockingRuns' var solution makes sure that
              // we pause in every 100 runs, and let the main thread breath a bit, so it's not frozen for the whole time
              // (we clear that counter above, too, where we use a startTransition call to de-prioritize this work)
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
                uid: componentUid,
                eventName: options.eventName,
              },
            });
          }

          // Log handler completion with duration (always, regardless of return value)
          if (xsVerbose) {
            const handlerEndPerfTs = typeof performance !== "undefined" ? performance.now() : undefined;
            const handlerDuration = handlerStartPerfTs !== undefined && handlerEndPerfTs !== undefined
              ? handlerEndPerfTs - handlerStartPerfTs
              : undefined;
            const returnValue = evalContext.mainThread?.blocks?.length
              ? evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue
              : undefined;
            xsLog("handler:complete", {
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
          }

          if (evalContext.mainThread?.blocks?.length) {
            return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue;
          }
        } catch (e) {
          if (xsVerbose) {
            // Look up source info from global storage (handles cached handlers across Container hierarchy)
            // Use componentId if available, else fall back to componentType+componentLabel
            const keyPart = options?.componentId || `${componentType || "unknown"}:${componentLabel || ""}`;
            const sourceKey = `${keyPart};${options?.eventName || "unknown"}`;
            const storedSourceInfo = typeof window !== "undefined"
              ? (window as any)._xsHandlerSourceInfo?.[sourceKey]
              : undefined;
            xsLog("handler:error", {
              uid: uidName,
              eventName: options?.eventName,
              componentType,
              componentLabel,
              error: e,
              ownerFileId: options?.sourceFileId ?? storedSourceInfo?.fileId ?? (node as any)?.debug?.source?.fileId,
              ownerSource: options?.sourceRange ?? storedSourceInfo?.range ?? ((node as any)?.debug?.source
                ? {
                    start: (node as any).debug.source.start,
                    end: (node as any).debug.source.end,
                  }
                : undefined),
              traceId: handlerTraceId,
            });
          }
          //if we pass down an event handler to a component, we should sign the error once, not in every step of the component chain
          //  (we use it in the compoundComponent, resolving it's event handlers)
          if (options?.signError !== false) {
            appContext.signError(e as Error);
          }
          if (canSignEventLifecycle()) {
            dispatch({
              type: ContainerActionKind.EVENT_HANDLER_ERROR,
              payload: {
                uid: componentUid,
                eventName: options.eventName,
                error: e,
              },
            });
          }
          throw e;
        } finally {
          // Always pop the trace when handler completes (success or error)
          if (traceId) {
            popTrace();
          }
        }
      },
    );

    // ========================================================================
    // EVENT HANDLER EXECUTION - SYNC
    // ========================================================================
    // runCodeSync: Executes arrow expressions synchronously without state tracking.

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

    // ========================================================================
    // EVENT HANDLER CACHING
    // ========================================================================
    // getOrCreateEventHandlerFn: Creates or retrieves cached event handler functions.
    // Handles string handlers, ParsedEventValues, and ArrowExpressions.

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
          // --- We have the syntax tree to execute, no need to cache
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
          // --- We have an arrow expression to execute
          fnCacheKey = `${options?.eventName};${JSON.stringify(src)}`;
          handler = (...eventArgs: any[]) => {
            return runCodeAsync(src, uid, options, ...cloneDeep(eventArgs));
          };
        } else {
          // --- We have an unknown event handler
          throw new Error("Invalid event handler");
        }

        //if we have a context or ephemeral event handler, we don't cache it (otherwise we would have stale reference for the context)
        if (options?.ephemeral || options?.context) {
          return handler;
        }
        if (!fnsRef.current[uid]?.[fnCacheKey]) {
          fnsRef.current[uid] = fnsRef.current[uid] || {};
          fnsRef.current[uid][fnCacheKey] = handler;
        }
        // Always update source info for inspector logging (even for cached handlers)
        // Use global storage since error may be caught in different Container
        if (typeof window !== "undefined" && options?.sourceFileId !== undefined) {
          const w = window as any;
          w._xsHandlerSourceInfo = w._xsHandlerSourceInfo || {};
          // Use componentId if available, else fall back to componentType+componentLabel
          const keyPart = options.componentId || `${options.componentType || "unknown"}:${options.componentLabel || ""}`;
          const sourceKey = `${keyPart};${options?.eventName || "unknown"}`;
          w._xsHandlerSourceInfo[sourceKey] = {
            fileId: options.sourceFileId,
            range: options.sourceRange,
          };
        }
        return fnsRef.current[uid][fnCacheKey];
      },
    );

    // ========================================================================
    // SYNC CALLBACK CACHING
    // ========================================================================
    // getOrCreateSyncCallbackFn: Creates or retrieves cached synchronous callback functions.

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
    // ACTION AND CALLBACK LOOKUP
    // ========================================================================
    // lookupSyncCallback: Resolves and returns synchronous callback functions.

    const lookupSyncCallback: LookupSyncFnInner = useCallback(
      (action, uid) => {
        if (!action) {
          return undefined;
        }

        if (typeof action === "function") {
          return action;
        }

        // const resolvedAction = extractParam(componentState, action, appContext, true);
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

    // lookupAction: Resolves and returns asynchronous action functions.

    const lookupAction: LookupAsyncFnInner = useCallback(
      (
        action: string | undefined | ArrowExpression,
        uid: symbol,
        options?: LookupActionOptions,
      ) => {
        let safeAction = action;
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

    // ========================================================================
    // API REGISTRATION
    // ========================================================================
    // Registers component APIs for compound components and parent access.

    const isApiRegisteredInnerRef = useRef(false);
    useEffect(() => {
      if (!node.api) {
        return;
      }
      if (!node.containerUid) {
        return;
      }
      if (isApiRegisteredInnerRef.current) {
        return;
      }
      isApiRegisteredInnerRef.current = true;
      const api: Record<string, any> = {};
      const self = Symbol("$self");
      Object.entries(node.api).forEach(([key, value]) => {
        api[key] = lookupAction(value as string, self, { eventName: key });
      });
      if (!isImplicit) {
        registerComponentApi(self, api); //we register the api as $self for the compound components,
      }
      parentRegisterComponentApi(node.containerUid, api); // and register it for the parent component instance
    }, [
      lookupAction,
      node.api,
      node.containerUid,
      node.uid,
      isImplicit,
      parentRegisterComponentApi,
      registerComponentApi,
    ]);

    // ========================================================================
    // CLEANUP
    // ========================================================================

    const cleanup = useEvent((uid) => {
      delete fnsRef.current[uid];
    });

    // ========================================================================
    // CHILD RENDERING
    // ========================================================================
    // stableRenderChild: Renders child components recursively with proper ref composition.

    // --- The container wraps the `renderChild` function to provide that to the child components
    const stableRenderChild: RenderChildFn = useCallback(
      (childNode, lc, pRenderContext, uidInfoRef, ref, rest) => {
        // TODO: Check if this is a valid use case
        if (typeof childNode === "string") {
          throw Error("should be resolved for now");
        }

        // --- Make children an array if it's not
        const children = isArray(childNode) ? childNode : [childNode];

        if (!children || !children.length) {
          // --- No child, nothing to render
          return null;
        }

        // --- If there are multiple children, we need to add a `key` to each of them
        const wrapWithFragment = children.length > 1;

        // --- Render each child
        const renderedChildren = children.map((child, childIndex) => {
          if (!child) {
            // --- No child, nothing to render: Should not happen
            return undefined;
          }

          // --- Invoke the jolly-joker `renderChild` function to render the child. Note that
          // --- in the context, we pass the `stableRenderChild` function, so the child can
          // --- render its children recursively.
          const renderedChild = renderChild({
            node: child,
            state: componentState,
            globalVars,
            dispatch,
            appContext,
            lookupAction,
            lookupSyncCallback,
            registerComponentApi,
            renderChild: stableRenderChild,
            statePartChanged: statePartChanged,
            layoutContext: lc,
            parentRenderContext: pRenderContext,
            memoedVarsRef,
            cleanup,
            uidInfoRef,
          });

          if (renderedChild === undefined) {
            // --- No displayable child, nothing to render
            return undefined;
          }

          // --- Let's process the rendered child
          let rendered = renderedChild;
          const key = `${childIndex}_${child.uid}`;

          if (wrapWithFragment) {
            // --- Add the `key` attribute to the child
            if (React.isValidElement(renderedChild)) {
              // --- React can display this element
              rendered = React.cloneElement(renderedChild, { key });
            } else {
              // --- A simple text node (or alike). We need to wrap it in a `Fragment`
              rendered = <Fragment key={key}>{renderedChild}</Fragment>;
            }
          }

          // --- Done.
          return rendered;
        });

        // --- At this point we have a React node for each child
        if (renderedChildren.length === 1) {
          // --- If we have a single (and valid React element) child, we compose its
          // --- `ref` with the parent's `ref`. This allows the parent to access the child's
          // --- DOM node. Otherwise, we use the child as is.
          return ref && renderedChildren[0] && isValidElement(renderedChildren[0])
            ? React.cloneElement(renderedChildren[0], {
                ref: composeRefs(ref, (renderedChildren[0] as any).ref),
                ...mergeProps(renderedChildren[0].props, rest),
              } as any)
            : renderedChildren[0];
        }

        // --- Done.
        return renderedChildren;
      },
      [
        componentState,
        dispatch,
        appContext,
        lookupAction,
        lookupSyncCallback,
        registerComponentApi,
        statePartChanged,
        memoedVarsRef,
        cleanup,
      ],
    );

    // ========================================================================
    // COMPONENT RENDERING
    // ========================================================================

    // --- Use this object to store information about already rendered UIDs.
    // --- We do not allow any action, loader, or transform to use the same UID; however (as of now) children
    // --- may use the same UID.
    const uidInfo: Record<string, string> = {};

    const thisUidInfoRef = useRef({});
    const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;

    const renderedChildren = stableRenderChild(
      node.children,
      layoutContextRef?.current,
      parentRenderContext,
      uidInfoRef,
      ref,
      rest,
    );

    const renderedLoaders = renderLoaders({
      uidInfo,
      uidInfoRef,
      loaders: node.loaders,
      componentState,
      memoedVarsRef,
      //if it's an api bound container, we always use this container, otherwise use the parent if it's an implicit one
      dispatch: apiBoundContainer ? containerDispatch : dispatch,
      registerComponentApi: apiBoundContainer
        ? containerRegisterComponentApi
        : registerComponentApi,
      appContext,
      lookupAction,
      lookupSyncCallback,
      cleanup,
    });
    //TODO illesg
    const containerContent = (
      <>
        {renderedLoaders}
        {!!children && isValidElement(renderedChildren)
          ? cloneElement(renderedChildren, null, children)
          : renderedChildren}
      </>
    );
    return (
      <Fragment
        key={
          node.uid
            ? `${resolvedKey}>${extractParam(componentState, node.uid, appContext, true)}`
            : undefined
        }
      >
        {containerContent}
      </Fragment>
    );
  }),
);

// ============================================================================
// LOADER RENDERING
// ============================================================================

/**
 * Context object passed to renderLoaders and renderLoader functions.
 * Contains all dependencies needed to render loader components.
 */
interface LoaderRenderContext {
  /** Map tracking UIDs already used in this container */
  uidInfo: Record<string, string>;
  /** Reference to UID information store */
  uidInfoRef: RefObject<Record<string, any>>;
  /** Array of loader component definitions to render */
  loaders?: ComponentDef[];
  /** Current container state */
  componentState: ContainerState;
  /** Container dispatcher for state updates */
  dispatch: ContainerDispatcher;
  /** Application context object */
  appContext: AppContextObject;
  /** Function to register component APIs */
  registerComponentApi: RegisterComponentApiFnInner;
  /** Function to lookup async action handlers */
  lookupAction: LookupAsyncFnInner;
  /** Function to lookup sync callback handlers */
  lookupSyncCallback: LookupSyncFnInner;
  /** Function to cleanup component resources */
  cleanup: ComponentCleanupFn;
  /** Reference to memoized variables */
  memoedVarsRef: MutableRefObject<MemoedVars>;
}

function renderLoaders({
  uidInfo,
  uidInfoRef,
  loaders = EMPTY_ARRAY,
  componentState,
  dispatch,
  appContext,
  registerComponentApi,
  lookupAction,
  lookupSyncCallback,
  cleanup,
  memoedVarsRef,
}: LoaderRenderContext) {
  return loaders.map((loader: ComponentDef) => {
    // --- Check for the uniqueness of UIDs
    if (loader?.uid) {
      if (uidInfo[loader.uid]) {
        // --- We have a duplicated ID (another loader)
        throw new Error(
          `Another ${uidInfo[loader.uid]} definition in this container already uses the uid '${loader.uid}'`,
        );
      }
      uidInfo[loader.uid] = "loader";
      uidInfoRef.current[loader.uid] = {
        type: "loader",
        value: "loaderValue",
        uid: loader.uid,
      };
    }

    // --- Render the current loader
    const renderedLoader = renderLoader({
      loader,
      componentState,
      dispatch,
      appContext,
      registerComponentApi,
      lookupAction,
      lookupSyncCallback,
      memoedVarsRef,
      cleanup,
    });

    // --- Skip loaders with rendering errors
    if (renderedLoader === undefined) {
      return undefined;
    }

    // --- Take care to use a key property for the loader
    return <Fragment key={loader.uid}>{renderedLoader}</Fragment>;
  });

  function renderLoader({
    loader,
    componentState,
    dispatch,
    appContext,
    registerComponentApi,
    lookupAction,
    lookupSyncCallback,
    cleanup,
    memoedVarsRef,
  }: {
    loader: ComponentDef;
    componentState: ContainerState;
    dispatch: ContainerDispatcher;
    appContext: AppContextObject;
    registerComponentApi: RegisterComponentApiFnInner;
    lookupAction: LookupAsyncFnInner;
    lookupSyncCallback: LookupSyncFnInner;
    cleanup: ComponentCleanupFn;
    memoedVarsRef: MutableRefObject<MemoedVars>;
  }) {
    // --- For the sake of avoiding further issues
    if (!loader) {
      return null;
    }

    // --- Evaluate "when" to decide if the loader should be rendered
    // --- Render only visible components
    if (!shouldKeep(loader.when, componentState, appContext)) {
      return null;
    }

    // --- Use the loader type's renderer function
    return (
      <LoaderComponent
        onUnmount={cleanup}
        node={loader}
        state={componentState}
        dispatch={dispatch}
        registerComponentApi={registerComponentApi}
        lookupAction={lookupAction}
        lookupSyncCallback={lookupSyncCallback}
        memoedVarsRef={memoedVarsRef}
        appContext={appContext}
      />
    );
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================
// Type guards are now imported from ContainerUtils.ts
// See: isParsedEventValue, isArrowExpression
