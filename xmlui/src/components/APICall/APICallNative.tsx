import { useEffect, useRef } from "react";

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

/**
 * Step 7: Interpolates notification messages with context variables
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
 * Step 9: Calculate next polling interval based on backoff strategy
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

  // Step 4: Track polling interval for cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Step 7: Track toast notification ID for updates
  const toastIdRef = useRef<string | null>(null);
  
  // Step 11: Track last result and execution context for cancel() method
  const lastResultRef = useRef<any>(null);
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
        // Step 6: Expose context variables for deferred mode
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

    // Step 4: Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // TODO pause until the apiInterceptorContext is initialized (to make sure the API calls are intercepted)
  const execute = useEvent(
    async (executionContext: ActionExecutionContext, ...eventArgs: any[]) => {
      const options = eventArgs[1];
      
      // Step 11: Store execution context for cancel() method
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
        
        // Step 11: Store result in ref for cancel() method
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
        
        // Step 3-4: Single poll or polling loop for deferred operations
        const deferredMode = (node.props as any)?.deferredMode === "true" || (node.props as any)?.deferredMode === true;
        const statusUrl = (node.props as any)?.statusUrl;
        const pollingIntervalProp = (node.props as any)?.pollingInterval;
        
        if (deferredMode && statusUrl) {
          // Interpolate statusUrl with result context
          let interpolatedStatusUrl = statusUrl as string;
          if (result && typeof result === 'object') {
            interpolatedStatusUrl = interpolatedStatusUrl.replace(/\{\$result\.([^}]+)\}/g, (match, key) => {
              return result[key] ?? match;
            });
          }
          
          const statusMethod = ((node.props as any)?.statusMethod as string) || "get";
          
          // Step 4: Check if pollingInterval is provided
          if (pollingIntervalProp) {
            // Polling loop mode
            const pollingInterval = parseInt(pollingIntervalProp as string) || 2000;
            const maxPollingDuration = parseInt((node.props as any)?.maxPollingDuration as string) || 300000;
            
            // Step 9: Get backoff configuration
            const pollingBackoff = (node.props as any)?.pollingBackoff || 'none';
            const maxPollingInterval = parseInt((node.props as any)?.maxPollingInterval as string) || 30000;
            
            // Initialize polling state
            const newState = {
              ...deferredStateRef.current,
              isPolling: true,
              startTime: Date.now(),
              attempts: 0,
            };
            deferredStateRef.current = newState;
            
            // Step 6: Update state with context variables
            if (updateState) {
              updateState({ 
                $statusData: newState.statusData,
                $progress: newState.progress,
                $polling: newState.isPolling,
                $attempts: newState.attempts,
                $elapsed: 0,
                deferredState: { ...newState }
              });
            }
            
            // Step 7: Show initial progress notification
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
                // Check if we've exceeded maxPollingDuration
                const elapsedTime = Date.now() - (deferredStateRef.current.startTime || 0);
                if (elapsedTime > maxPollingDuration) {
                  // Stop polling due to timeout
                  const timeoutState = {
                    ...deferredStateRef.current,
                    isPolling: false,
                  };
                  deferredStateRef.current = timeoutState;
                  
                  if (pollingIntervalRef.current) {
                    clearTimeout(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                  }
                  
                  // Step 6: Update state with context variables on timeout
                  if (updateState) {
                    updateState({ 
                      $statusData: timeoutState.statusData,
                      $progress: timeoutState.progress,
                      $polling: timeoutState.isPolling,
                      $attempts: timeoutState.attempts,
                      $elapsed: elapsedTime,
                      deferredState: { ...timeoutState }
                    });
                  }
                  
                  // Step 8: Fire onTimeout event
                  if (onTimeout) {
                    try {
                      await onTimeout();
                    } catch (eventError) {
                      console.error("onTimeout event handler error:", eventError);
                    }
                  }
                  return;
                }
                
                // Make status request
                const statusData = await callApi(
                  executionContext,
                  {
                    url: interpolatedStatusUrl,
                    method: statusMethod as "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "connect",
                    uid: uid,
                    params: { $result: result },
                  },
                  {
                    resolveBindingExpressions: false,
                  },
                );
                
                // Step 6: Extract progress using progressExtractor expression
                let progress = 0;
                const progressExtractor = (node.props as any)?.progressExtractor;
                if (progressExtractor && statusData) {
                  try {
                    // Parse the progress extractor expression
                    const parser = new Parser(progressExtractor);
                    const expr = parser.parseExpr();
                    
                    // Evaluate the expression with statusData as context
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
                    // Ensure progress is a number between 0 and 100
                    if (extractedValue !== undefined && extractedValue !== null) {
                      progress = Math.max(0, Math.min(100, Number(extractedValue)));
                    }
                  } catch (error) {
                    console.error("Error evaluating progressExtractor:", error);
                  }
                }
                
                // Update attempts, status data, and progress
                const updatedState = {
                  ...deferredStateRef.current,
                  statusData: statusData,
                  progress: progress,
                  attempts: deferredStateRef.current.attempts + 1,
                };
                deferredStateRef.current = updatedState;
                
                // Step 6: Calculate elapsed time and update state with all context variables
                const elapsedMs = Date.now() - (updatedState.startTime || Date.now());
                if (updateState) {
                  updateState({ 
                    $statusData: updatedState.statusData,
                    $progress: updatedState.progress,
                    $polling: updatedState.isPolling,
                    $attempts: updatedState.attempts,
                    $elapsed: elapsedMs,
                    deferredState: { ...updatedState }
                  });
                }
                
                // Step 5: Fire onStatusUpdate event with progress from Step 6
                if (onStatusUpdate) {
                  try {
                    await onStatusUpdate(statusData, progress);
                  } catch (eventError) {
                    console.error("onStatusUpdate event handler error:", eventError);
                  }
                }
                
                // Step 7: Update progress notification
                const inProgressMessage = (node.props as any)?.inProgressNotificationMessage;
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
                
                // Step 7: Check for completion (simple check for now - progress === 100)
                if (updatedState.progress >= 100) {
                  // Stop polling
                  if (pollingIntervalRef.current) {
                    clearTimeout(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                  }
                  
                  const completionState = {
                    ...updatedState,
                    isPolling: false,
                  };
                  deferredStateRef.current = completionState;
                  
                  if (updateState) {
                    updateState({ 
                      $statusData: completionState.statusData,
                      $progress: completionState.progress,
                      $polling: completionState.isPolling,
                      $attempts: completionState.attempts,
                      $elapsed: Date.now() - (completionState.startTime || Date.now()),
                      deferredState: { ...completionState }
                    });
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
                  return; // Don't schedule next poll
                }
                
                // Step 9: Schedule next poll with backoff
                scheduleNextPoll();
                
              } catch (statusError) {
                console.error("Status request failed:", statusError);
                // Step 9: Schedule retry even on error
                scheduleNextPoll();
              }
            };
            
            // Step 9: Schedule next poll with backoff
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
            
            // Start polling loop - make first poll immediately, then schedule with backoff
            pollStatus().then(() => {
              scheduleNextPoll();
            });
          } else {
            // Step 3: Single poll mode (no pollingInterval)
            try {
              const statusData = await callApi(
                executionContext,
                {
                  url: interpolatedStatusUrl,
                  method: statusMethod as "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace" | "connect",
                  uid: uid,
                  params: { $result: result },
                },
                {
                  resolveBindingExpressions: false,
                },
              );
              
              // Store status data
              const newState = {
                ...deferredStateRef.current,
                statusData: statusData,
                attempts: 1,
                startTime: Date.now(),
                progress: 0, // Single poll mode doesn't extract progress
              };
              deferredStateRef.current = newState;
              
              // Step 6: Update state with context variables (single poll mode)
              if (updateState) {
                updateState({ 
                  $statusData: newState.statusData,
                  $progress: newState.progress,
                  $polling: newState.isPolling,
                  $attempts: newState.attempts,
                  $elapsed: 0,
                  deferredState: { ...newState }
                });
              }
            } catch (statusError) {
              console.error("Status request failed:", statusError);
            }
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

  // Deferred state API methods
  const stopPolling = useEvent(() => {
    const newState = {
      ...deferredStateRef.current,
      isPolling: false,
    };
    deferredStateRef.current = newState;
    
    // Step 4: Clear polling interval
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Step 6: Update state with context variables
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
    const newState = {
      ...deferredStateRef.current,
      isPolling: true,
    };
    deferredStateRef.current = newState;
    
    // Step 6: Update state with context variables
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
    // Step 11: Server-side cancellation support
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
