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
}

export function APICallNative({ registerComponentApi, node, uid }: Props) {
  const execute = useEvent(
    async (executionContext: ActionExecutionContext, ...eventArgs: any[]) => {
      const options = eventArgs[1];
      return await callApi(
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
