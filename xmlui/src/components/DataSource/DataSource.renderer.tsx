import { useEffect, useMemo, useRef } from "react";

import { applyResultSelector, managedFetchService } from "../../runtime/data";
import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";

export const dataSourceRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "");
  const url = useStringProp(node, scope, "url", "");
  const method = useStringProp(node, scope, "method", "get");
  const mockData = useEvaluatedProp(node, scope, "mockData", undefined);
  const body = useEvaluatedProp(node, scope, "body", undefined);
  const rawBody = useStringProp(node, scope, "rawBody", "");
  const queryParams = useEvaluatedProp(node, scope, "queryParams", undefined);
  const headers = useEvaluatedProp(node, scope, "headers", undefined);
  const credentials = useStringProp(node, scope, "credentials", "") as RequestCredentials | "";
  const dataType = useStringProp(node, scope, "dataType", "json") as "json" | "text";
  const resultSelector = useStringProp(node, scope, "resultSelector", "");
  const transformResult = useEvaluatedProp(node, scope, "transformResult", undefined);
  const pollIntervalInSeconds = Number(useEvaluatedProp(node, scope, "pollIntervalInSeconds", 0) ?? 0);
  const apiRef = useRef<Record<string, unknown>>();
  const mockDataKey = stableDataKey(mockData);
  const transformResultKey = stableDataKey(transformResult);
  const request = useMemo(
    () => managedFetchService.buildRequest({
      url,
      method,
      body,
      rawBody: rawBody || undefined,
      queryParams,
      headers,
      credentials: credentials || undefined,
      dataType,
    }),
    [body, credentials, dataType, headers, method, queryParams, rawBody, url],
  );
  const requestKey = useMemo(() => managedFetchService.requestKey(request), [request]);
  const latest = useRef({ mockData, request, resultSelector, transformResult });
  latest.current = { mockData, request, resultSelector, transformResult };

  if (!apiRef.current) {
    apiRef.current = createDataSourceApi(id, scope);
  }
  useEffect(() => registerReference(scope, id, apiRef.current!), [id, scope]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    const load = async (force = false) => {
      updateApi(apiRef.current!, id, scope, {
        inProgress: true,
        isRefetching: Boolean(apiRef.current!.loaded),
        error: undefined,
      });
      try {
        let value: unknown;
        let responseHeaders: Record<string, string> | undefined;
        const current = latest.current;
        if (current.mockData !== undefined) {
          value = current.mockData;
        } else if (node.parsed?.events?.fetch) {
          value = await runEvent(
            node.parsed.events.fetch,
            createRuntimeScope({
              store: scope.store,
              parent: scope,
              references: scope.references,
              contextValues: {
                $url: current.request.url,
                $method: current.request.method,
                $queryParams: current.request.queryParams,
                $requestBody: current.request.rawBody ?? current.request.body,
                $requestHeaders: current.request.headers,
              },
            }),
          );
        } else {
          const entry = await managedFetchService.load(current.request, { force });
          value = entry.value;
          responseHeaders = entry.responseHeaders;
        }
        value = applyDataTransforms(value, current.resultSelector, current.transformResult);
        if (cancelled) {
          return;
        }
        updateApi(apiRef.current!, id, scope, {
          value,
          loaded: true,
          inProgress: false,
          isRefetching: false,
          error: undefined,
          responseHeaders,
        });
        void runEvent(node.parsed?.events?.loaded, scope, [value, force]);
      } catch (error) {
        if (cancelled) {
          return;
        }
        updateApi(apiRef.current!, id, scope, {
          error,
          inProgress: false,
          isRefetching: false,
        });
        void runEvent(node.parsed?.events?.error, scope, [error]);
      }
    };
    apiRef.current!.refetch = () => load(true);
    void load(false);
    const interval = pollIntervalInSeconds > 0
      ? window.setInterval(() => void load(true), pollIntervalInSeconds * 1000)
      : undefined;
    return () => {
      cancelled = true;
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [
    id,
    mockDataKey,
    node.parsed?.events?.error,
    node.parsed?.events?.fetch,
    node.parsed?.events?.loaded,
    pollIntervalInSeconds,
    requestKey,
    resultSelector,
    scope,
    transformResultKey,
  ]);

  return null;
};

export function createDataSourceApi(
  id: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Record<string, unknown> {
  const api: Record<string, unknown> = {
    value: undefined,
    error: undefined,
    inProgress: false,
    isRefetching: false,
    loaded: false,
    responseHeaders: undefined,
    refetch: () => undefined,
  };
  if (id) {
    scope.references[id] = api;
  }
  return api;
}

export function registerReference(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  id: string,
  api: Record<string, unknown>,
): () => void {
  if (!id) {
    return () => undefined;
  }
  scope.references[id] = api;
  scope.store.invalidateReference(id);
  return () => {
    if (scope.references[id] === api) {
      delete scope.references[id];
      scope.store.invalidateReference(id);
    }
  };
}

export function updateApi(
  api: Record<string, unknown>,
  id: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  patch: Record<string, unknown>,
): void {
  let changed = false;
  for (const [key, value] of Object.entries(patch)) {
    if (!Object.is(api[key], value)) {
      api[key] = value;
      changed = true;
    }
  }
  if (changed && id) {
    scope.store.invalidateReference(id);
  }
}

export function stableDataKey(value: unknown): string {
  if (typeof value === "function") {
    return "function";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function applyDataTransforms(value: unknown, selector: string, transform: unknown): unknown {
  const selected = applyResultSelector(value, selector || undefined);
  if (typeof transform === "function") {
    return transform(selected);
  }
  return selected;
}
