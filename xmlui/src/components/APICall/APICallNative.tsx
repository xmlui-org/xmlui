import { useEffect, useRef } from "react";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { useEvent } from "../../components-core/utils/misc";
import { callApi } from "../../components-core/action/APICall";
import type { ApiActionComponent } from "../../components/APICall/APICall";
import { evalBinding } from "../../components-core/script-runner/eval-tree-sync";
import { Parser } from "../../parsers/scripting/Parser";
import toast from "react-hot-toast";

// =============================================================================
// DEBUG LOGGING
// =============================================================================
const DEBUG_DEFERRED = true; // Set to false to disable debug logging

function debugLog(category: string, message: string, data?: any) {
  if (!DEBUG_DEFERRED) return;
  const timestamp = new Date().toISOString().split('T')[1];
  const prefix = `[APICall:${category}] ${timestamp}`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

interface Props {
  registerComponentApi: RegisterComponentApiFn;
  node: ApiActionComponent;
  uid: symbol;
  updateState?: (state: any) => void;
  onStatusUpdate?: (statusData: any, progress: number) => void | Promise<void>;
  onTimeout?: () => void | Promise<void>;
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
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Interpolates notification messages with context variables
 * Replaces {$progress}, {$statusData.property}, etc. with actual values
 */
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

/**
 * Calculate next polling interval based on backoff strategy
 */
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

/**
 * Interpolates URL templates with result context variables
 * Example: "/api/status/{$result.taskId}" -> "/api/status/task-123"
 */
function interpolateUrl(template: string, result: any): string {
  if (!result || typeof result !== 'object') return template;
  
  return template.replace(/\{\$result\.([^}]+)\}/g, (match, key) => {
    return result[key] ?? match;
  });
}

/**
 * Updates component state with deferred operation context variables
 */
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

/**
 * Extracts progress value from status data using progressExtractor expression
 * Returns a number between 0 and 100
 */
function extractProgress(
  statusData: any,
  progressExtractor: string | undefined,
  executionContext: ActionExecutionContext,
  result: any
): number {
  if (!progressExtractor || !statusData) return 0;
  
  try {
    const parser = new Parser(progressExtractor);
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

export function APICallNative({ registerComponentApi, node, uid, updateState, onStatusUpdate, onTimeout }: Props) {
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
  const executionContextRef = useRef<ActionExecutionContext | null>(null);

  // Initialize state with default values
  useEffect(() => {
    const deferredMode = (node.props as any)?.deferredMode === "true" || (node.props as any)?.deferredMode === true;

    debugLog("INIT", "Component initialized", {
      deferredMode,
      url: (node.props as any)?.url,
      statusUrl: (node.props as any)?.statusUrl,
      pollingInterval: (node.props as any)?.pollingInterval,
      pollingBackoff: (node.props as any)?.pollingBackoff,
      maxPollingDuration: (node.props as any)?.maxPollingDuration,
      maxPollingInterval: (node.props as any)?.maxPollingInterval,
      props: node.props,
    });
    
    if (updateState) {
      updateState({ 
        inProgress: false, 
        loaded: false,
        lastResult: undefined,
        lastError: undefined,
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
      debugLog("CLEANUP", "Component unmount: clearing polling timer");
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // =============================================================================
  // DEFERRED OPERATIONS HANDLERS
  // =============================================================================
  
  /**
   * Handles polling timeout - stops polling and fires onTimeout event
   */
  const handlePollingTimeout = useEvent(async (elapsedTime: number) => {
    debugLog("TIMEOUT", "Polling timed out", { elapsedTime });
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
        debugLog("EVENT", "onTimeout handler invoked");
        await onTimeout();
      } catch (eventError) {
        console.error("onTimeout event handler error:", eventError);
      }
    }
  });
  
  /**
   * Handles polling completion - stops polling and shows completion notification
   */
  const handlePollingCompletion = useEvent((updatedState: DeferredState, result: any) => {
    debugLog("COMPLETE", "Polling completed", {
      attempts: updatedState.attempts,
      progress: updatedState.progress,
      statusData: updatedState.statusData,
    });
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
    
    // Show completion notification
    const completedMessage = (node.props as any)?.completedNotificationMessage;
    if (completedMessage && toastIdRef.current) {
      const interpolated = interpolateNotificationMessage(completedMessage, {
        progress: completionState.progress,
        statusData: completionState.statusData,
        result: result,
      });
      if (interpolated) {
        debugLog("TOAST", "Completion toast shown", { message: interpolated });
        toast.success(interpolated, { id: toastIdRef.current });
      }
    }
  });
  
  /**
   * Executes a single status poll (no continuous polling)
   */
  const executeSinglePoll = useEvent(async (
    executionContext: ActionExecutionContext,
    statusUrl: string,
    statusMethod: string,
    result: any
  ) => {
    try {
      debugLog("POLL", "Single poll start", { statusUrl, statusMethod });
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

      debugLog("POLL", "Single poll response", { statusData });
      
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
      debugLog("ERROR", "Single poll failed", { statusError });
      console.error("Status request failed:", statusError);
    }
  });
  
  /**
   * Executes continuous polling with backoff strategy
   */
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
    debugLog("POLL", "Polling loop start", {
      statusUrl,
      statusMethod,
      pollingInterval,
      maxPollingDuration,
      pollingBackoff,
      maxPollingInterval,
    });
    // Initialize polling state
    const newState = {
      ...deferredStateRef.current,
      isPolling: true,
      startTime: Date.now(),
      attempts: 0,
    };
    deferredStateRef.current = newState;
    updateDeferredState(newState, updateState);
    
    // Show initial progress notification
    const inProgressMessage = (node.props as any)?.inProgressNotificationMessage;
    if (inProgressMessage) {
      const interpolated = interpolateNotificationMessage(inProgressMessage, {
        progress: newState.progress,
        statusData: newState.statusData,
        result: result,
      });
      if (interpolated) {
        debugLog("TOAST", "In-progress toast shown", { message: interpolated });
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
        
        debugLog("POLL", "Polling request", {
          attempt: deferredStateRef.current.attempts + 1,
          statusUrl,
          statusMethod,
        });
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

        debugLog("POLL", "Polling response", { statusData });
        
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
        debugLog("STATE", "Polling state updated", {
          attempts: updatedState.attempts,
          progress: updatedState.progress,
          statusData: updatedState.statusData,
        });
        deferredStateRef.current = updatedState;
        updateDeferredState(updatedState, updateState);
        
        // Fire onStatusUpdate event
        if (onStatusUpdate) {
          try {
            debugLog("EVENT", "onStatusUpdate handler invoked", { progress });
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
            debugLog("TOAST", "In-progress toast updated", { message: interpolated });
            toast.loading(interpolated, { id: toastIdRef.current });
          }
        }
        
        // Check for completion
        if (updatedState.progress >= 100) {
          handlePollingCompletion(updatedState, result);
          return;
        }
        
        // Schedule next poll
        scheduleNextPoll();
        
      } catch (statusError) {
        debugLog("ERROR", "Polling request failed", { statusError });
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
      debugLog("POLL", "Scheduling next poll", { nextInterval });
      
      pollingIntervalRef.current = setTimeout(pollStatus, nextInterval) as any;
    };
    
    // Start polling
    pollStatus().then(() => {
      scheduleNextPoll();
    });
  });
  
  // =============================================================================
  // MAIN API EXECUTION
  // =============================================================================
  
  // TODO pause until the apiInterceptorContext is initialized (to make sure the API calls are intercepted)
  const execute = useEvent(
    async (executionContext: ActionExecutionContext, ...eventArgs: any[]) => {
      const options = eventArgs[1];

      debugLog("EXEC", "APICall execute invoked", {
        url: (node.props as any)?.url,
        method: (node.props as any)?.method,
        deferredMode: (node.props as any)?.deferredMode,
        statusUrl: (node.props as any)?.statusUrl,
        pollingInterval: (node.props as any)?.pollingInterval,
      });
      
      // Store execution context for cancel() method
      executionContextRef.current = executionContext;
      
      // Set inProgress before starting
      if (updateState) {
        updateState({ inProgress: true });
      }
      
      try {
        const result = await callApi(
          executionContext,
          {
            ...node.props,
            body: node.props.body || (options?.passAsDefaultBody ? eventArgs[0] : undefined),
            uid: uid,
            params: { $param: eventArgs[0], $params: eventArgs },
            onError: node.events?.error,
            onProgress: node.events?.progress,
            onBeforeRequest: node.events?.beforeRequest,
            onSuccess: node.events?.success,
          },
          {
            resolveBindingExpressions: true,
          },
        );
        debugLog("EXEC", "APICall result", { result });
        
        // Store result in ref for cancel() method
        lastResultRef.current = result;
        
        // Store result and update state on success
        if (updateState) {
          updateState({ 
            inProgress: false, 
            loaded: true, 
            lastResult: result,
            lastError: undefined 
          });
        }
        
        // Handle deferred operations (polling)
        const deferredMode = (node.props as any)?.deferredMode === "true" || (node.props as any)?.deferredMode === true;
        const statusUrl = (node.props as any)?.statusUrl;
        const pollingIntervalProp = (node.props as any)?.pollingInterval;
        
        if (deferredMode && statusUrl) {
          // Interpolate statusUrl with result context
          const interpolatedStatusUrl = interpolateUrl(statusUrl as string, result);
          const statusMethod = ((node.props as any)?.statusMethod as string) || "get";
          debugLog("EXEC", "Deferred mode enabled", {
            statusUrl,
            interpolatedStatusUrl,
            statusMethod,
            pollingIntervalProp,
          });
          
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
            debugLog("EXEC", "Deferred mode single poll");
            await executeSinglePoll(executionContext, interpolatedStatusUrl, statusMethod, result);
          }
        }
        
        return result;
      } catch (error) {
        debugLog("ERROR", "APICall failed", { error });
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
    debugLog("API", "stopPolling called");
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
    debugLog("API", "resumePolling called");
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
    debugLog("API", "getStatus called");
    return deferredStateRef.current.statusData;
  });

  const isPolling = useEvent(() => {
    debugLog("API", "isPolling called");
    return deferredStateRef.current.isPolling;
  });

  const cancel = useEvent(async () => {
    debugLog("API", "cancel called");
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
        debugLog("API", "cancel request sent", {
          cancelUrl: interpolatedCancelUrl,
          cancelMethod,
        });
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
}
