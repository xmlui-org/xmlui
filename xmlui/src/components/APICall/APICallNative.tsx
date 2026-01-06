import { useEffect } from "react";

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

export const defaultProps = {
  method: "get",
};

export function APICallNative({ registerComponentApi, node, uid, updateState }: Props) {
  // Initialize state with default values
  useEffect(() => {
    if (updateState) {
      updateState({ 
        inProgress: false, 
        loaded: false,
        lastResult: undefined,
        lastError: undefined
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

  useEffect(() => {
    registerComponentApi({
      execute: execute,
      _SUPPORT_IMPLICIT_CONTEXT: true,
    });
  }, [execute, registerComponentApi]);

  return null;
}
