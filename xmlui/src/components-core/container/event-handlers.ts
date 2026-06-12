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
import { createCoWStateProxy } from "./cow-state-proxy";
import { parseHandlerCode, prepareHandlerStatements } from "../utils/statementUtils";
import { processStatementQueueAsync } from "../script-runner/process-statement-async";
import { processStatementQueue } from "../script-runner/process-statement-sync";
import { isParsedEventValue } from "../rendering/ContainerUtils";
import { T_ARROW_EXPRESSION_STATEMENT } from "../script-runner/ScriptingSourceTree";
import { getCurrentTrace, pushXsLog } from "../inspector/inspectorUtils";
import {
  createCancellationToken,
  getDefaultHandlerCoordinator,
  runWithTimeout,
  createTransactionalBuffer,
  setDefaultCoordinatorSink,
  type HandlerInvocation,
  type HandlerPolicy,
  type BufferedWrite,
} from "../concurrency";
import { HandlerCancelledError } from "../concurrency/token";
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
  // Stable ref tracking the latest componentState (updated every render).
  // Used to refresh stateRef before handler execution when the Container is
  // memo-blocked by computedUses and the layout effect hasn't re-fired.
  componentStateRef?: React.MutableRefObject<Record<string, any>>;
  // Stable ref to the full (un-narrowed) parent state set by ComponentWrapper.
  // Updated every time the parent renders, even when Container is memo-blocked.
  fullParentStateRef?: React.MutableRefObject<Record<string, any> | undefined>;
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

// --- Install the default coordinator diagnostic sink exactly once so
// --- `single-flight` supersessions and `drop-while-running` refusals
// --- surface as `kind:"concurrency"` Inspector traces. The sink is
// --- replaced on every module load, which is harmless because the
// --- replacement is idempotent (same logic).
setDefaultCoordinatorSink({
  onSuperseded: (inv) => {
    pushXsLog({
      kind: "concurrency",
      ts: Date.now(),
      code: "concurrency-handler-superseded",
      severity: "info",
      componentUid: inv.componentUid,
      eventName: inv.eventName,
      message: `Handler superseded (policy=${inv.policy})`,
    } as any);
  },
  onDropped: (inv) => {
    pushXsLog({
      kind: "concurrency",
      ts: Date.now(),
      code: "concurrency-handler-dropped",
      severity: "info",
      componentUid: inv.componentUid,
      eventName: inv.eventName,
      message: `Handler dropped (policy=${inv.policy})`,
    } as any);
  },
});

/**
 * Creates event handler executors with the given configuration
 */
export function createEventHandlers(config: EventHandlerConfig) {
  const {
    appContext,
    handlerLogger,
    stateRef,
    componentStateRef,
    fullParentStateRef,
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

  let lastFp: Record<string, any> | undefined = undefined;
  let lastCompState: Record<string, any> | undefined = undefined;

  // Merge the latest fullParentStateRef.current with componentStateRef.current
  // into stateRef immediately before each handler execution.
  //
  // When computedUses narrows a Container's parentState (e.g. to ['lastAction']),
  // the Container is memo-blocked on unrelated parent state changes. The layout
  // effect that normally syncs stateRef doesn't re-fire while memo-blocked. This
  // means dynamic context vars like $context (stored in parent state via implicit
  // dispatch) are invisible to event handlers.
  //
  // fullParentStateRef.current is always up-to-date (mutated by ComponentWrapper
  // on every parent render), so refreshing here ensures handlers always see the
  // full current state regardless of memo-blocking.
  const refreshStateRef = () => {
    const fp = fullParentStateRef?.current;
    const compState = componentStateRef?.current;
    if (!componentStateRef) {
      return;
    }
    // Only update stateRef if one of the inputs changed identity.
    if (fp === lastFp && compState === lastCompState) {
      return;
    }
    lastFp = fp;
    lastCompState = compState;
    // Always mirror the latest componentState into stateRef. When fullParentStateRef
    // is absent (no uses/computedUses on this node), the previous guard skipped this
    // entirely, leaving stateRef stale across handler invocations — e.g. DataSource
    // onFetch with computedUses-enabled ancestors could run with an empty stateRef so
    // handler context merge lost injected $url / $method / $queryParams.
    stateRef.current = fp ? { ...fp, ...compState } : compState;
  };

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
      if (!options?.schedulerBypass && appContext.App?.scheduleHandler) {
        const eventName = options?.eventName?.toString() ?? "handler";
        const traceId = getCurrentTrace() ?? `h-${generatedId()}`;
        const spanId = generatedId();
        let returnValue: any;
        await appContext.App.scheduleHandler({
          traceId,
          spanId,
          label: `${uid.description ?? "anonymous"}.${eventName}`,
          handler: async () => {
            returnValue = await runCodeAsync(
              source,
              uid,
              { ...options, schedulerBypass: true },
              ...eventArgs,
            );
          },
        });
        return returnValue;
      }

      // --- Check if the event handler can sign its lifecycle state
      const canSignEventLifecycle = () => {
        return uid.description !== undefined && options?.eventName !== undefined;
      };

      // Ensure stateRef reflects the latest parent state before reading it.
      // Required when Container is memo-blocked by computedUses — the layout
      // effect that normally syncs stateRef may not have re-fired.
      refreshStateRef();

      // ---------------------------------------------------------------
      // Plan #06 W7-1 — HandlerCoordinator integration.
      //
      // For every async handler we ask the coordinator whether to
      // proceed under the requested policy. `parallel` (the default)
      // is a fast-path: the coordinator does not track running
      // invocations and behaviour is unchanged from W3-6. The other
      // three policies (`single-flight`, `queue`, `drop-while-running`)
      // use a per-`(componentUid, eventName)` running slot.
      //
      // The coordinator issues the `$cancel` token for this invocation;
      // a `single-flight` supersession will abort the *previous*
      // invocation's token with reason `"supersede"`, letting any
      // in-flight fetches tear down cleanly via `$cancel.onAbort`.
      // ---------------------------------------------------------------
      const handlerPolicy = (options?.handlerPolicy ?? "parallel") as HandlerPolicy;
      const eventNameForCoord = options?.eventName?.toString() ?? "handler";
      const componentUidForCoord = uid.description ?? "anonymous";
      const coordinator = getDefaultHandlerCoordinator();
      const invocation: HandlerInvocation = {
        componentUid: componentUidForCoord,
        eventName: eventNameForCoord,
        policy: handlerPolicy,
        timeoutMs: options?.handlerTimeoutMs,
      };

      const decision = await coordinator.enter(invocation);
      if (!decision.proceed) {
        // `drop-while-running` (or `abortRunning` cancelling a queued
        // waiter) — short-circuit silently. The coordinator already
        // emitted a `concurrency-handler-dropped` trace via the sink.
        return;
      }

      let changes: Array<any> = [];
      // --- W3-6 surface preserved: token from the coordinator. The
      // dispatcher still aborts it in the `finally` so `$cancel.onAbort`
      // callbacks fire on normal completion as well as supersession.
      const cancelToken = decision.token;
      const abortCancelToken = (reason: import("../concurrency").CancellationToken["reason"]) => {
        if (!cancelToken.aborted && decision.abort) {
          decision.abort(reason ?? "user");
        }
      };

      // Transactional state-write buffer (plan #6 Phase 4). When the
      // handler is declared `transactional`, every accumulated change
      // is replayed in a single dispatch after the handler resolves.
      // On cancellation / timeout / error the buffer is discarded.
      const isTransactional = options?.transactional === true;
      const txBuffer = isTransactional ? createTransactionalBuffer() : null;

      const getComponentStateClone = () => {
        changes.length = 0;
        const originalState = stateRef.current;
        // Shallow-copy the root so that $this, $cancel, and context overrides
        // are scoped to this invocation without touching stateRef.current.
        // Nested objects are isolated lazily by the CoW proxy on first write.
        const poj: Record<string, any> = { ...originalState };

        if (options?.context) {
          Object.assign(poj, options.context);
        }
        poj["$this"] = originalState[uid];
        poj["$cancel"] = cancelToken;

        // Tag component API objects with their key for reference tracking.
        // When a variable is later assigned one of these objects (e.g. myGlobal = ds),
        // the framework can detect the reference and keep the variable in sync with
        // the live component API value across subsequent renders.
        //
        // Component API objects are stored in Immer-managed state and may be frozen.
        // A frozen (non-extensible) object rejects Object.defineProperty. To avoid
        // the invariant error, shallow-copy the object into poj first — this also
        // matches the old cloneDeep behavior (getters are invoked, giving snapshot
        // values; method references are preserved).
        for (const sym of Object.getOwnPropertySymbols(originalState)) {
          const desc = sym.description;
          if (
            desc &&
            !desc.startsWith("$") &&
            !desc.startsWith("__") &&
            poj[desc] &&
            typeof poj[desc] === "object" &&
            !Array.isArray(poj[desc])
          ) {
            if (!Object.isExtensible(poj[desc])) {
              poj[desc] = { ...poj[desc] };
            }
            Object.defineProperty(poj[desc], "__componentApiKey__", {
              value: desc,
              enumerable: false,
              configurable: true,
            });
          }
        }

        return createCoWStateProxy(poj, (changeInfo) => {
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
            typeof appContext.xmluiConfig?.defaultToOptionalMemberAccess === "boolean"
              ? appContext.xmluiConfig.defaultToOptionalMemberAccess
              : true,
          strictDomSandbox: Array.isArray(appContext.xmluiConfig?.strictDomSandbox)
            ? appContext.xmluiConfig.strictDomSandbox
            : appContext.xmluiConfig?.strictDomSandbox === true,
          allowConsole: appContext.xmluiConfig?.allowConsole !== false,
          sandboxWarnLogger: (entry) =>
            pushXsLog({ kind: "sandbox:warn", ts: Date.now(), ...entry }),
          ...(appContext as any).__udcEvalOptions,
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
      const handlerStartPerfTs = typeof performance !== "undefined" ? performance.now() : undefined;

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
              // If this is a top-level assignment of a component API value
              // (e.g. myData = ds where ds is a DataSource), store a live-
              // reference sentinel { __liveApiRef__: "ds" } instead of a stale
              // deep-clone snapshot. The sentinel is resolved to the current
              // API value at render time, keeping the variable reactive.
              const isTopLevelSet =
                change.pathArray.length === 1 &&
                change.action === "set" &&
                change.newValue != null &&
                typeof change.newValue === "object";
              let apiKey: string | null = null;
              if (isTopLevelSet) {
                try {
                  apiKey = change.newValue.__componentApiKey__ ?? null;
                } catch {
                  apiKey = null;
                }
              }

              const finalValue = apiKey
                ? { __liveApiRef__: apiKey }
                : cloneDeep(change.newValue);
              if (txBuffer) {
                // --- Plan #6 W7-1 Phase 4: defer writes until the
                // --- transactional handler completes successfully.
                txBuffer.push({
                  pathArray: change.pathArray,
                  newValue: finalValue,
                  target: change.target,
                  action: change.action,
                });
              } else {
                statePartChanged(
                  change.pathArray,
                  finalValue,
                  change.target,
                  change.action,
                );
              }
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
              if (import.meta.env.DEV) {
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

        // --- Plan #6 W7-1: bound handler lifetime by `handlerTimeoutMs`
        // --- (per-invocation override) or the ambient
        // --- `defaultHandlerTimeoutMs` from `appGlobals`. `<= 0` disables
        // --- the timeout (long-poll opt-out).
        const ambientTimeout = Number(
          (appContext as any)?.xmluiConfig?.defaultHandlerTimeoutMs ?? 30000,
        );
        const effectiveTimeoutMs =
          options?.handlerTimeoutMs !== undefined ? options.handlerTimeoutMs : ambientTimeout;
        await runWithTimeout(processStatementQueueAsync(statements, evalContext), {
          timeoutMs: effectiveTimeoutMs,
          abort: (reason) => abortCancelToken(reason),
          onTimeout: () => {
            const strict = (appContext as any)?.xmluiConfig?.strictConcurrency === true;
            const severity = strict ? "error" : "warn";
            const message = `Handler timed out after ${effectiveTimeoutMs}ms`;
            pushXsLog({
              kind: "concurrency",
              ts: Date.now(),
              code: "concurrency-handler-timeout",
              severity,
              componentUid: componentUidForCoord,
              eventName: eventNameForCoord,
              message,
            } as any);
            if (strict) {
              // --- Plan #6 strict-mode enforcement: surface the timeout
              // --- through the console + global error channel so apps can
              // --- treat it like any other handler bug.
              if (typeof console !== "undefined" && console.error) {
                console.error(`[concurrency:strict] ${message}`, {
                  componentUid: componentUidForCoord,
                  eventName: eventNameForCoord,
                });
              }
              try {
                appContext.signError?.(new Error(message));
              } catch {
                /* swallow — signError is best-effort */
              }
            }
          },
        });

        // --- Plan #6 W7-1 Phase 4: transactional commit. If the
        // --- handler is marked transactional, replay all buffered
        // --- writes in a single batch now that the handler finished
        // --- successfully. The buffer was populated by
        // --- `onStatementCompleted` instead of dispatching writes live.
        if (txBuffer && txBuffer.size > 0) {
          const writes = txBuffer.drain();
          for (const w of writes) {
            statePartChanged(w.pathArray, w.newValue, w.target, w.action);
          }
        }

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
        const handlerEndPerfTs = typeof performance !== "undefined" ? performance.now() : undefined;
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
        // --- Plan #6 W7-1 Phase 4: discard any buffered transactional
        // --- writes on error / cancellation.
        if (txBuffer) txBuffer.discard();

        // --- Plan #6 W7-1: cancellation is the contract — a handler
        // --- aborted by supersession / timeout / unmount throws
        // --- `HandlerCancelledError`. Swallow it instead of treating
        // --- as a user-visible error: the cancellation itself is
        // --- traced via `concurrency-handler-superseded` /
        // --- `concurrency-handler-timeout` and the `onError` channel
        // --- is reserved for genuine handler bugs.
        if (e instanceof HandlerCancelledError) {
          handlerLogger.cleanupTrace(traceId);
          return;
        }
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
        // --- W3-6: best-effort token disposal. The handler is no longer
        // running, so any outstanding `$cancel.onAbort` callbacks (e.g.
        // user-side fetch teardown) must fire. Reason mirrors mount state:
        // `"unmount"` if the component was disposed mid-flight, otherwise
        // `"user"`. Only aborts when the token isn't already aborted.
        if (!cancelToken.aborted) {
          abortCancelToken(mountedRef.current ? "user" : "unmount");
        }
        // --- Plan #6 W7-1: release the coordinator slot so the next
        // --- queued invocation can proceed (or the slot becomes free
        // --- for a fresh `single-flight` / `drop-while-running` entry).
        coordinator.exit(invocation);
      }
    },
  );

  // ========================================================================
  // SYNC EVENT HANDLER EXECUTION
  // ========================================================================

  const runCodeSync = useCallback(
    (arrowExpression: ArrowExpression, ...eventArgs: any[]) => {
      // Ensure stateRef reflects the latest parent state before reading it.
      refreshStateRef();
      const evalContext: BindingTreeEvaluationContext = {
        localContext: createCoWStateProxy({ ...stateRef.current }, () => {}),
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
