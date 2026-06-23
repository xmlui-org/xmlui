import { useEffect, useRef } from "react";

import { managedFetchService } from "../../runtime/data";
import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import { registerReference, updateApi } from "../DataSource/DataSource.renderer";

export const apiCallRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "");
  const url = useStringProp(node, scope, "url", "");
  const method = useStringProp(node, scope, "method", "get");
  const body = useEvaluatedProp(node, scope, "body", undefined);
  const rawBody = useStringProp(node, scope, "rawBody", "");
  const queryParams = useEvaluatedProp(node, scope, "queryParams", undefined);
  const headers = useEvaluatedProp(node, scope, "headers", undefined);
  const credentials = useStringProp(node, scope, "credentials", "") as RequestCredentials | "";
  const invalidates = useEvaluatedProp(node, scope, "invalidates", undefined);
  const apiRef = useRef<Record<string, unknown>>();
  const latest = useRef({ url, method, body, rawBody, queryParams, headers, credentials, invalidates });
  latest.current = { url, method, body, rawBody, queryParams, headers, credentials, invalidates };

  if (!apiRef.current) {
    apiRef.current = createApiCallApi(id, scope);
  }
  useEffect(() => registerReference(scope, id, apiRef.current!), [id, scope]);

  useEffect(() => {
    if (!id) {
      return;
    }
    apiRef.current!.execute = async (...args: unknown[]) => {
      const before = await runEvent(node.parsed?.events?.beforeRequest, scope, args);
      if (before === false) {
        return undefined;
      }
      updateApi(apiRef.current!, id, scope, {
        inProgress: true,
        lastError: undefined,
      });
      try {
        const request = managedFetchService.buildRequest({
          url: latest.current.url,
          method: latest.current.method,
          body: latest.current.body,
          rawBody: latest.current.rawBody || undefined,
          queryParams: latest.current.queryParams,
          headers: latest.current.headers,
          credentials: latest.current.credentials || undefined,
        });
        const executionScope = createRuntimeScope({
          store: scope.store,
          parent: scope,
          references: scope.references,
          contextValues: {
            $param: args[0],
            $params: args,
            $queryParams: request.queryParams,
            $requestBody: request.rawBody ?? request.body,
            $requestHeaders: request.headers,
          },
        });
        let responseHeaders: Record<string, string> | undefined;
        let result: unknown;
        if (node.parsed?.events?.mockExecute) {
          result = await runEvent(node.parsed.events.mockExecute, executionScope, args);
        } else {
          const response = await managedFetchService.execute(request);
          result = response.data;
          responseHeaders = response.headers;
        }
        updateApi(apiRef.current!, id, scope, {
          inProgress: false,
          loaded: true,
          lastResult: result,
          lastError: undefined,
          lastResponseHeaders: responseHeaders,
        });
        const successResult = await runEvent(node.parsed?.events?.success, scope, [result]);
        if (successResult !== false) {
          invalidateDataSources(scope, latest.current.invalidates);
        }
        return result;
      } catch (error) {
        updateApi(apiRef.current!, id, scope, {
          inProgress: false,
          lastError: error,
        });
        void runEvent(node.parsed?.events?.error, scope, [error]);
        throw error;
      }
    };
    scope.store.invalidateReference(id);
  }, [
    id,
    node.parsed?.events?.beforeRequest,
    node.parsed?.events?.error,
    node.parsed?.events?.mockExecute,
    node.parsed?.events?.success,
    scope,
  ]);

  return null;
};

function createApiCallApi(
  id: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Record<string, unknown> {
  const api: Record<string, unknown> = {
    execute: () => Promise.resolve(undefined),
    inProgress: false,
    loaded: false,
    lastResult: undefined,
    lastError: undefined,
    lastResponseHeaders: undefined,
  };
  if (id) {
    scope.references[id] = api;
  }
  return api;
}

function invalidateDataSources(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  invalidates: unknown,
): void {
  const names = Array.isArray(invalidates)
    ? invalidates
    : typeof invalidates === "string"
      ? invalidates.split(",").map((name) => name.trim()).filter(Boolean)
      : [];
  for (const name of names) {
    const api = scope.references[String(name)] as { refetch?: () => unknown } | undefined;
    void api?.refetch?.();
  }
}
