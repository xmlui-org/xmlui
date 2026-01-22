import { useEffect, useRef } from "react";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { useEvent } from "../../components-core/utils/misc";
import { callApi } from "../../components-core/action/APICall";
import type { ApiActionComponent } from "../../components/APICall/APICall";
import { extractParam } from "../../components-core/utils/extractParam";

interface Props {
  registerComponentApi: RegisterComponentApiFn;
  node: ApiActionComponent;
  uid: symbol;
  updateState?: (state: any) => void;
  onStatusUpdate?: (statusData: any, progress: number) => void | Promise<void>;
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

export function APICallNative({ registerComponentApi, node, uid, updateState, onStatusUpdate }: Props) {
  // Track deferred state using ref to avoid re-renders
  const deferredStateRef = useRef<DeferredState>({
    isPolling: false,
    statusData: null,
    progress: 0,
    attempts: 0,
  });

  // Step 4: Track polling interval for cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // TODO pause until the apiInterceptorContext is initialized (to make sure the API calls are intercepted)
  const execute = useEvent(
    async (executionContext: ActionExecutionContext, ...eventArgs: any[]) => {
      const options = eventArgs[1];
      
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
                    clearInterval(pollingIntervalRef.current);
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
                  return;
                }
                
                // Make status request
                const statusData = await callApi(
                  executionContext,
                  {
                    url: interpolatedStatusUrl,
                    method: statusMethod,
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
                    // Evaluate progress expression with statusData as context
                    const contextForProgress = {
                      $statusData: statusData,
                      $result: result,
                    };
                    const extractedValue = extractParam(
                      contextForProgress,
                      progressExtractor,
                      executionContext.appContext,
                    );
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
                
              } catch (statusError) {
                console.error("Status request failed:", statusError);
              }
            };
            
            // Start polling loop
            pollingIntervalRef.current = setInterval(pollStatus, pollingInterval);
            
            // Make first poll immediately
            pollStatus();
          } else {
            // Step 3: Single poll mode (no pollingInterval)
            try {
              const statusData = await callApi(
                executionContext,
                {
                  url: interpolatedStatusUrl,
                  method: statusMethod,
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
      clearInterval(pollingIntervalRef.current);
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
    // Placeholder for Step 11 implementation
    const newState = {
      ...deferredStateRef.current,
      isPolling: false,
    };
    deferredStateRef.current = newState;
    
    // Step 4: Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
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
