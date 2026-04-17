import { memo, useEffect, useRef } from "react";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { useEvent } from "../../components-core/utils/misc";
import { callApi } from "../../components-core/action/APICall";
import type { ApiActionComponent } from "../../components/APICall/APICall";
import { evalBinding } from "../../components-core/script-runner/eval-tree-sync";
import { Parser } from "../../parsers/scripting/Parser";
import toast from "react-hot-toast";

interface Props {
  registerComponentApi: RegisterComponentApiFn;
  node: ApiActionComponent;
  uid: symbol;
  updateState?: (state: any) => void;
  onSuccess?: (...args: any[]) => Promise<any>;
  onStatusUpdate?: (statusData: any, progress: number) => void | Promise<void>;
  onTimeout?: () => void | Promise<void>;
  onPollingStart?: (initialResult: any) => void | Promise<void>;
  onPollingComplete?: (finalStatus: any, reason: string) => void | Promise<void>;
  hasMockExecute?: boolean;
}

interface DeferredState {
  isPolling: boolean;
  statusData: any;
  progress: number;
  attempts: number;
  startTime?: number;
}

export const defaultProps = {
  method: "get",
  deferredMode: false,
  statusMethod: "get",
  pollingInterval: 2000,
  maxPollingDuration: 300000,
  pollingBackoff: "none",
  maxPollingInterval: 30000,
  cancelMethod: "post",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function interpolateNotificationMessage(
  template: string | undefined,
  context: { progress: number; statusData: any; result?: any }
): string | undefined {
  if (!template) return undefined;
  
  let message = template;
  
  // Replace {$progress}
  message = message.replace(/\{\$progress\}/g, String(context.progress));
  
  // Replace {$statusData.property} patterns
  if (context.statusData && typeof context.statusData === 'object') {
    message = message.replace(/\{\$statusData\.([^}]+)\}/g, (match, key) => {
      const value = context.statusData[key];
      return value !== undefined ? String(value) : match;
    });
  }
  
  // Replace {$result.property} patterns
  if (context.result && typeof context.result === 'object') {
    message = message.replace(/\{\$result\.([^}]+)\}/g, (match, key) => {
      const value = context.result[key];
      return value !== undefined ? String(value) : match;
    });
  }
  
  return message;
}

function calculateNextInterval(
  baseInterval: number,
  attempt: number,
  strategy: string,
  maxInterval: number
): number {
  switch (strategy) {
    case 'linear':
      // Add 1 second per attempt
      return Math.min(baseInterval + (attempt * 1000), maxInterval);
    case 'exponential':
      // Double each time: baseInterval * 2^attempt
      return Math.min(baseInterval * Math.pow(2, attempt), maxInterval);
    case 'none':
    default:
      return baseInterval;
  }
}

function interpolateUrl(template: string, result: any): string {
  if (!result || typeof result !== 'object') return template;
  
  return template.replace(/\{\$result\.([^}]+)\}/g, (match, key) => {
    return result[key] ?? match;
  });
}

function updateDeferredState(
  deferredState: DeferredState,
  updateState: ((state: any) => void) | undefined
): void {
  if (!updateState) return;
  
  const elapsed = Date.now() - (deferredState.startTime || Date.now());
  
  updateState({
    $statusData: deferredState.statusData,
    $progress: deferredState.progress,
    $polling: deferredState.isPolling,
    $attempts: deferredState.attempts,
    $elapsed: elapsed,
    deferredState: { ...deferredState }
  });
}

function extractProgress(
  statusData: any,
  progressExtractor: string | undefined,
  executionContext: ActionExecutionContext,
  result: any
): number {
  if (!progressExtractor || !statusData) return 0;
  
  try {
    // Strip outer { } if present (XMLUI binding expression syntax: "{expr}")
    const expression =
      progressExtractor.startsWith("{") && progressExtractor.endsWith("}")
        ? progressExtractor.slice(1, -1).trim()
        : progressExtractor;
    const parser = new Parser(expression);
    const expr = parser.parseExpr();
    
    const contextForProgress = {
      $statusData: statusData,
      $result: result,
    };
    
    const extractedValue = evalBinding(expr, {
      localContext: contextForProgress,
      appContext: executionContext.appContext,
      options: {
        defaultToOptionalMemberAccess: true,
      },
    });
    
    if (extractedValue !== undefined && extractedValue !== null) {
      return Math.max(0, Math.min(100, Number(extractedValue)));
    }
  } catch (error) {
    console.error("Error evaluating progressExtractor:", error);
  }
  
  return 0;
}

function evaluateCondition(
  conditionExpr: string | undefined,
  statusData: any,
  progress: number,
  result: any,
  executionContext: ActionExecutionContext,
): boolean {
  if (!conditionExpr || !statusData) return false;
  try {
    const expression =
      conditionExpr.startsWith("{") && conditionExpr.endsWith("}")
        ? conditionExpr.slice(1, -1).trim()
        : conditionExpr;
    const parser = new Parser(expression);
    const ast = parser.parseExpr();
    const value = evalBinding(ast, {
      localContext: { $statusData: statusData, $result: result, $progress: progress },
      appContext: executionContext.appContext,
      options: { defaultToOptionalMemberAccess: true },
    });
    return Boolean(value);
  } catch (error) {
    console.error("Error evaluating condition:", error);
    return false;
  }
}

export const APICallReact = memo(function APICallReact({ registerComponentApi, node, uid, updateState, onSuccess, onStatusUpdate, onTimeout, onPollingStart, onPollingComplete, hasMockExecute }: Props) {
  // Track deferred state using ref to avoid re-renders
  const deferredStateRef = useRef<DeferredState>({
    isPolling: false,
    statusData: null,
    progress: 0,
    attempts: 0,
  });

  // Track polling interval for cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track toast notification ID for updates
  const toastIdRef = useRef<string | null>(null);
  
  // Track last result and execution context for cancel() method
  const lastResultRef = useRef<any>(null);
  const lastResponseHeadersRef = useRef<Record<string, string> | undefined>(undefined);
  const executionContextRef = useRef<ActionExecutionContext | null>(null);

  // Initialize state with default values
  useEffect(() => {
    const deferredMode = (node.props as any)?.deferredMode === "true" || (node.props as any)?.deferredMode === true;

    if (updateState) {
      updateState({ 
        inProgress: false, 
        loaded: false,
        lastResult: undefined,
        lastError: undefined,
        lastResponseHeaders: undefined,
        // Expose context variables for deferred mode
        ...(deferredMode && { 
          $statusData: deferredStateRef.current.statusData,
          $progress: deferredStateRef.current.progress,
          $polling: deferredStateRef.current.isPolling,
          $attempts: deferredStateRef.current.attempts,
          $elapsed: 0,
          deferredState: { ...deferredStateRef.current }
        })
      });
    }

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // =============================================================================
  // DEFERRED OPERATIONS HANDLERS
  // =============================================================================
  
  const handlePollingTimeout = useEvent(async (elapsedTime: number) => {
    const timeoutState = {
      ...deferredStateRef.current,
      isPolling: false,
    };
    deferredStateRef.current = timeoutState;
    
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    updateDeferredState(timeoutState, updateState);
    
    if (onTimeout) {
      try {
        await onTimeout();
      } catch (eventError) {
        console.error("onTimeout event handler error:", eventError);
      }
    }
    if (onPollingComplete) {
      void onPollingComplete(timeoutState.statusData, "timeout");
    }
  });
  
  const handlePollingError = useEvent((updatedState: DeferredState, result: any) => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const errorState = {
      ...updatedState,
      isPolling: false,
    };
    deferredStateRef.current = errorState;
    updateDeferredState(errorState, updateState);

    if (updateState) {
      updateState({ inProgress: false, lastError: new Error("Operation failed") });
    }

    const errorMessage = (node.props as any)?.errorNotificationMessage;
    if (errorMessage && toastIdRef.current) {
      const interpolated = interpolateNotificationMessage(errorMessage, {
        progress: errorState.progress,
        statusData: errorState.statusData,
        result,
      });
      if (interpolated) {
        toast.error(interpolated, { id: toastIdRef.current });
      }
    } else if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    if (onPollingComplete) {
      void onPollingComplete(errorState.statusData, "failed");
    }
  });

  const handlePollingCompletion = useEvent((updatedState: DeferredState, result: any) => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    const completionState = {
      ...updatedState,
      isPolling: false,
    };
    deferredStateRef.current = completionState;
    updateDeferredState(completionState, updateState);

    // Mark operation as finished
    if (updateState) {
      updateState({ inProgress: false, loaded: true });
    }
    
    // Show completion notification
    const completedMessage = (node.props as any)?.completedNotificationMessage;
    if (completedMessage && toastIdRef.current) {
      const interpolated = interpolateNotificationMessage(completedMessage, {
        progress: completionState.progress,
        statusData: completionState.statusData,
        result: result,
      });
      if (interpolated) {
        toast.success(interpolated, { id: toastIdRef.current });
      }
    }
    if (onPollingComplete) {
      void onPollingComplete(completionState.statusData, "completed");
    }
  });
  
  const executeSinglePoll = useEvent(async (
    executionContext: ActionExecutionContext,
    statusUrl: string,
    statusMethod: string,
    result: any
  ) => {
    try {
      const statusData = await callApi(
        executionContext,
        {
          url: statusUrl,
          method: statusMethod as "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "connect",
          uid: uid,
          params: { $result: result },
        },
        {
          resolveBindingExpressions: false,
        },
      );

      const newState = {
        ...deferredStateRef.current,
        statusData: statusData,
        attempts: 1,
        startTime: Date.now(),
        progress: 0,
      };
      deferredStateRef.current = newState;
      updateDeferredState(newState, updateState);
    } catch (statusError) {
      console.error("Status request failed:", statusError);
    }
  });
  
  const executePollingLoop = useEvent((
    executionContext: ActionExecutionContext,
    statusUrl: string,
    statusMethod: string,
    result: any,
    pollingInterval: number,
    maxPollingDuration: number,
    pollingBackoff: string,
    maxPollingInterval: number
  ) => {
    // Initialize polling state
    const newState = {
      ...deferredStateRef.current,
      isPolling: true,
      startTime: Date.now(),
      attempts: 0,
    };
    deferredStateRef.current = newState;
    updateDeferredState(newState, updateState);
    if (onPollingStart) {
      void onPollingStart(result);
    }
    
    // Show initial progress notification
    const inProgressMessage = (node.props as any)?.inProgressNotificationMessage;
    if (inProgressMessage) {
      const interpolated = interpolateNotificationMessage(inProgressMessage, {
        progress: newState.progress,
        statusData: newState.statusData,
        result: result,
      });
      if (interpolated) {
        toastIdRef.current = toast.loading(interpolated);
      }
    }
    
    // Async polling function
    const pollStatus = async () => {
      try {
        // Check timeout
        const elapsedTime = Date.now() - (deferredStateRef.current.startTime || 0);
        if (elapsedTime > maxPollingDuration) {
          await handlePollingTimeout(elapsedTime);
          return;
        }
        
        // Make status request
        const statusData = await callApi(
          executionContext,
          {
            url: statusUrl,
            method: statusMethod as "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "connect",
            uid: uid,
            params: { $result: result },
          },
          {
            resolveBindingExpressions: false,
          },
        );

        // Extract progress
        const progress = extractProgress(
          statusData,
          (node.props as any)?.progressExtractor,
          executionContext,
          result
        );
        
        // Update state
        const updatedState = {
          ...deferredStateRef.current,
          statusData: statusData,
          progress: progress,
          attempts: deferredStateRef.current.attempts + 1,
        };
        deferredStateRef.current = updatedState;
        updateDeferredState(updatedState, updateState);
        
        // Fire onStatusUpdate event
        if (onStatusUpdate) {
          try {
            await onStatusUpdate(statusData, progress);
          } catch (eventError) {
            console.error("onStatusUpdate event handler error:", eventError);
          }
        }
        
        // Update progress notification
        if (inProgressMessage && toastIdRef.current) {
          const interpolated = interpolateNotificationMessage(inProgressMessage, {
            progress: updatedState.progress,
            statusData: updatedState.statusData,
            result: result,
          });
          if (interpolated) {
            toast.loading(interpolated, { id: toastIdRef.current });
          }
        }
        
        // Evaluate completionCondition / errorCondition; fall back to progress >= 100
        const completionConditionExpr = (node.props as any)?.completionCondition;
        const errorConditionExpr = (node.props as any)?.errorCondition;

        const isComplete = completionConditionExpr
          ? evaluateCondition(completionConditionExpr, statusData, progress, result, executionContext)
          : updatedState.progress >= 100;
        const isError =
          errorConditionExpr &&
          evaluateCondition(errorConditionExpr, statusData, progress, result, executionContext);

        if (isError) {
          handlePollingError(updatedState, result);
          return;
        }
        if (isComplete) {
          handlePollingCompletion(updatedState, result);
          return;
        }
        
        // Schedule next poll
        scheduleNextPoll();

      } catch (statusError) {
        console.error("Status request failed:", statusError);
        scheduleNextPoll();
      }
    };
    
    // Schedule next poll with backoff
    const scheduleNextPoll = () => {
      if (!deferredStateRef.current.isPolling) return;
      
      const nextInterval = calculateNextInterval(
        pollingInterval,
        deferredStateRef.current.attempts,
        pollingBackoff,
        maxPollingInterval
      );

      pollingIntervalRef.current = setTimeout(pollStatus, nextInterval) as any;
    };
    
    // Start polling
    pollStatus();
  });
  
  // =============================================================================
  // MAIN API EXECUTION
  // =============================================================================
  
  // TODO pause until the apiInterceptorContext is initialized (to make sure the API calls are intercepted)
  const execute = useEvent(
    async (executionContext: ActionExecutionContext, ...eventArgs: any[]) => {
      const options = eventArgs[1];

      // Store execution context for cancel() method
      executionContextRef.current = executionContext;
      
      // Set inProgress before starting
      if (updateState) {
        updateState({ inProgress: true });
      }
      
      // Detect deferred mode early so we can adjust behaviour for the initial POST
      const deferredMode = (node.props as any)?.deferredMode === "true" || (node.props as any)?.deferredMode === true;

      try {
        let capturedResponseHeaders: Record<string, string> | undefined;

        // In deferred mode, strip notification props from the initial POST —
        // notifications are managed by the polling loop instead.
        const callProps = deferredMode
          ? {
              ...node.props,
              inProgressNotificationMessage: undefined,
              completedNotificationMessage: undefined,
              errorNotificationMessage: undefined,
            }
          : node.props;

        const result = await callApi(
          executionContext,
          {
            ...callProps,
            body: node.props.body || (options?.passAsDefaultBody ? eventArgs[0] : undefined),
            uid: uid,
            params: { $param: eventArgs[0], $params: eventArgs },
            onError: node.events?.error,
            onProgress: node.events?.progress,
            onBeforeRequest: node.events?.beforeRequest,
            onSuccess: onSuccess ?? node.events?.success,
            onMockExecute: node.events?.mockExecute,
            onResponseHeaders: (h) => { capturedResponseHeaders = h; lastResponseHeadersRef.current = h; },
          },
          {
            resolveBindingExpressions: true,
          },
        );

        // Store result in ref for cancel() method
        lastResultRef.current = result;
        
        // In deferred mode keep inProgress=true and loaded=false until polling finishes.
        if (updateState) {
          if (deferredMode) {
            updateState({
              lastResult: result,
              lastError: undefined,
              lastResponseHeaders: capturedResponseHeaders,
            });
          } else {
            updateState({ 
              inProgress: false, 
              loaded: true, 
              lastResult: result,
              lastError: undefined,
              lastResponseHeaders: capturedResponseHeaders,
            });
          }
        }
        
        // Handle deferred operations (polling)
        const statusUrl = (node.props as any)?.statusUrl;
        const pollingIntervalProp = (node.props as any)?.pollingInterval;
        
        if (deferredMode && statusUrl) {
          // Interpolate statusUrl with result context
          const interpolatedStatusUrl = interpolateUrl(statusUrl as string, result);
          const statusMethod = ((node.props as any)?.statusMethod as string) || "get";

          // Execute either single poll or polling loop based on pollingInterval
          if (pollingIntervalProp) {
            // Continuous polling with backoff
            const pollingInterval = parseInt(pollingIntervalProp as string) || 2000;
            const maxPollingDuration = parseInt((node.props as any)?.maxPollingDuration as string) || 300000;
            const pollingBackoff = (node.props as any)?.pollingBackoff || 'none';
            const maxPollingInterval = parseInt((node.props as any)?.maxPollingInterval as string) || 30000;
            
            executePollingLoop(
              executionContext,
              interpolatedStatusUrl,
              statusMethod,
              result,
              pollingInterval,
              maxPollingDuration,
              pollingBackoff,
              maxPollingInterval
            );
          } else {
            // Single status check (no continuous polling)
            await executeSinglePoll(executionContext, interpolatedStatusUrl, statusMethod, result);
          }
        }
        
        return result;
      } catch (error) {
        // Store error and update state on failure
        if (updateState) {
          updateState({ 
            inProgress: false,
            loaded: true,
            lastError: error,
          });
        }
        throw error;
      }
    },
  );

  // =============================================================================
  // DEFERRED STATE API METHODS
  // =============================================================================

  const stopPolling = useEvent(() => {
    const newState = {
      ...deferredStateRef.current,
      isPolling: false,
    };
    deferredStateRef.current = newState;
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Update state with context variables
    const elapsed = Date.now() - (newState.startTime || Date.now());
    if (updateState) {
      updateState({ 
        inProgress: false,
        $statusData: newState.statusData,
        $progress: newState.progress,
        $polling: newState.isPolling,
        $attempts: newState.attempts,
        $elapsed: elapsed,
        deferredState: { ...newState }
      });
    }
    return false;
  });

  const resumePolling = useEvent(() => {
    const newState = {
      ...deferredStateRef.current,
      isPolling: true,
    };
    deferredStateRef.current = newState;
    
    // Update state with context variables
    const elapsed = Date.now() - (newState.startTime || Date.now());
    if (updateState) {
      updateState({ 
        $statusData: newState.statusData,
        $progress: newState.progress,
        $polling: newState.isPolling,
        $attempts: newState.attempts,
        $elapsed: elapsed,
        deferredState: { ...newState }
      });
    }
    return true;
  });

  const getStatus = useEvent(() => {
    return deferredStateRef.current.statusData;
  });

  const isPolling = useEvent(() => {
    return deferredStateRef.current.isPolling;
  });

  const cancel = useEvent(async () => {
    // Server-side cancellation support
    const cancelUrl = (node.props as any)?.cancelUrl;
    
    // Stop polling first
    const newState = {
      ...deferredStateRef.current,
      isPolling: false,
    };
    deferredStateRef.current = newState;
    
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Update state with context variables
    const elapsed = Date.now() - (newState.startTime || Date.now());
    if (updateState) {
      updateState({ 
        inProgress: false,
        lastError: new Error("Operation cancelled"),
        $statusData: newState.statusData,
        $progress: newState.progress,
        $polling: newState.isPolling,
        $attempts: newState.attempts,
        $elapsed: elapsed,
        deferredState: { ...newState }
      });
    }
    
    // If cancelUrl is provided, call the cancel endpoint
    if (cancelUrl && executionContextRef.current) {
      try {
        const lastResult = lastResultRef.current;
        
        // Interpolate cancelUrl with result context
        let interpolatedCancelUrl = cancelUrl as string;
        if (lastResult && typeof lastResult === 'object') {
          interpolatedCancelUrl = interpolatedCancelUrl.replace(/\{\$result\.([^}]+)\}/g, (match, key) => {
            return lastResult[key] ?? match;
          });
        }
        
        const cancelMethod = ((node.props as any)?.cancelMethod as string) || "post";
        const cancelBody = (node.props as any)?.cancelBody;
        
        // Make cancel request
        await callApi(
          executionContextRef.current,
          {
            url: interpolatedCancelUrl,
            method: cancelMethod as "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "connect",
            body: cancelBody,
            uid: uid,
            params: { $result: lastResult },
          },
          {
            resolveBindingExpressions: true,
          },
        );
      } catch (cancelError) {
        console.error("Cancel request failed:", cancelError);
        // Don't throw - cancellation failure shouldn't break the UI
      }
    }
  });

  useEffect(() => {
    registerComponentApi({
      execute: execute,
      stopPolling: stopPolling,
      resumePolling: resumePolling,
      getStatus: getStatus,
      isPolling: isPolling,
      cancel: cancel,
      _SUPPORT_IMPLICIT_CONTEXT: true,
    });
  }, [execute, stopPolling, resumePolling, getStatus, isPolling, cancel, registerComponentApi]);

  return null;
});
