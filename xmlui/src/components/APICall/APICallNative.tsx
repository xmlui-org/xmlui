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
        
        // Step 3: Single poll for deferred operations
        const deferredMode = (node.props as any)?.deferredMode === "true" || (node.props as any)?.deferredMode === true;
        if (deferredMode && (node.props as any)?.statusUrl) {
          // Extract statusUrl with result context
          let statusUrl = (node.props as any).statusUrl as string;
          
          // Replace {$result.xxx} placeholders with actual values from result
          if (result && typeof result === 'object') {
            statusUrl = statusUrl.replace(/\{\$result\.([^}]+)\}/g, (match, key) => {
              return result[key] ?? match;
            });
          }
          
          // Make single status request using callApi
          try {
            const statusMethod = ((node.props as any)?.statusMethod as string) || "get";
            const statusData = await callApi(
              executionContext,
              {
                url: statusUrl,
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
