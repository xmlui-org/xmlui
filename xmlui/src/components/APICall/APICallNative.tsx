import { useEffect, useRef } from "react";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { ActionExecutionContext } from "../../abstractions/ActionDefs";
import { useEvent } from "../../components-core/utils/misc";
import { callApi } from "../../components-core/action/APICall";
import type { ApiActionComponent } from "../../components/APICall/APICall";

interface Props {
  registerComponentApi: RegisterComponentApiFn;
  node: ApiActionComponent;
  uid: symbol;
  updateState?: (state: any) => void;
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

export function APICallNative({ registerComponentApi, node, uid, updateState }: Props) {
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
        ...(deferredMode && { deferredState: { ...deferredStateRef.current } })
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
            
            if (updateState) {
              updateState({ deferredState: { ...newState } });
            }
            
            // Async polling function
            const pollStatus = async () => {
              try {
                // Check if we've exceeded maxPollingDuration
                const elapsed = Date.now() - (deferredStateRef.current.startTime || 0);
                if (elapsed > maxPollingDuration) {
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
                  
                  if (updateState) {
                    updateState({ deferredState: { ...timeoutState } });
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
                
                // Update attempts and status data
                const updatedState = {
                  ...deferredStateRef.current,
                  statusData: statusData,
                  attempts: deferredStateRef.current.attempts + 1,
                };
                deferredStateRef.current = updatedState;
                
                if (updateState) {
                  updateState({ deferredState: { ...updatedState } });
                }
                
                // TODO: Step 5 - Check completion conditions here
                
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
              };
              deferredStateRef.current = newState;
              
              if (updateState) {
                updateState({ deferredState: { ...newState } });
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
    
    if (updateState) {
      updateState({ deferredState: { ...newState } });
    }
    return false;
  });

  const resumePolling = useEvent(() => {
    const newState = {
      ...deferredStateRef.current,
      isPolling: true,
    };
    deferredStateRef.current = newState;
    
    if (updateState) {
      updateState({ deferredState: { ...newState } });
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
    
    if (updateState) {
      updateState({ deferredState: { ...newState } });
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
