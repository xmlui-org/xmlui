import { useEffect, useMemo, useRef } from "react";

import { applyResultSelector, managedFetchService } from "../../runtime/data";
import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import { executeWithRetryPolicy, useRetryPolicy } from "../../runtime/retryPolicy";

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
  const dataType = useStringProp(node, scope, "dataType", "json") as "json" | "text" | "csv" | "sql";
  const resultSelector = useStringProp(node, scope, "resultSelector", "");
  const prevPageSelector = useStringProp(node, scope, "prevPageSelector", "");
  const nextPageSelector = useStringProp(node, scope, "nextPageSelector", "");
  const transformResult = useEvaluatedProp(node, scope, "transformResult", undefined);
  const structuralSharing = useEvaluatedProp(node, scope, "structuralSharing", true) !== false;
  const pollIntervalInSeconds = Number(useEvaluatedProp(node, scope, "pollIntervalInSeconds", 0) ?? 0);
  const retryPolicy = useRetryPolicy();
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
  const latest = useRef({ mockData, request, resultSelector, prevPageSelector, nextPageSelector, transformResult, structuralSharing });
  latest.current = { mockData, request, resultSelector, prevPageSelector, nextPageSelector, transformResult, structuralSharing };

  if (!apiRef.current) {
    apiRef.current = createDataSourceApi(id, scope);
  }
  useEffect(() => registerReference(scope, id, apiRef.current!), [id, scope]);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    let loadSequence = 0;
    const load = async (force = false) => {
      const sequence = ++loadSequence;
      updateApi(apiRef.current!, id, scope, {
        inProgress: true,
        isRefetching: Boolean(apiRef.current!.loaded),
        error: undefined,
      });
      try {
        const current = latest.current;
        const loaded = await runWithOptionalRetry(() => loadDataSourceValue({
          current,
          force,
          node,
          scope,
        }), retryPolicy);
        let value = loaded.value;
        const responseHeaders = loaded.responseHeaders;
        const prevPage = applyResultSelector(value, current.prevPageSelector || undefined);
        const nextPage = applyResultSelector(value, current.nextPageSelector || undefined);
        value = applyDataTransforms(value, current.resultSelector, current.transformResult);
        if (current.structuralSharing && deepEqual(apiRef.current!.value, value)) {
          value = apiRef.current!.value;
        }
        if (cancelled || sequence !== loadSequence) {
          return;
        }
        updateApi(apiRef.current!, id, scope, {
          value,
          loaded: true,
          inProgress: false,
          isRefetching: false,
          error: undefined,
          responseHeaders,
          prevPage,
          nextPage,
          hasPrevPage: prevPage != null && prevPage !== false,
          hasNextPage: nextPage != null && nextPage !== false,
        });
        void runEvent(node.parsed?.events?.loaded, scope, [value, force]);
      } catch (error) {
        if (cancelled || sequence !== loadSequence) {
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
    retryPolicy,
    requestKey,
    nextPageSelector,
    prevPageSelector,
    resultSelector,
    structuralSharing,
    scope,
    transformResultKey,
  ]);

  return null;
};

async function runWithOptionalRetry<T>(
  operation: () => Promise<T>,
  retryPolicy: ReturnType<typeof useRetryPolicy>,
): Promise<T> {
  return retryPolicy
    ? executeWithRetryPolicy(operation, retryPolicy.spec, retryPolicy.circuitState)
    : operation();
}

async function loadDataSourceValue({
  current,
  force,
  node,
  scope,
}: {
  current: {
    mockData: unknown;
    request: ReturnType<typeof managedFetchService.buildRequest>;
    resultSelector: string;
    prevPageSelector: string;
    nextPageSelector: string;
    transformResult: unknown;
    structuralSharing: boolean;
  };
  force: boolean;
  node: Parameters<XmluiBuiltInRenderer>[0]["node"];
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"];
}): Promise<{ value: unknown; responseHeaders?: Record<string, string> }> {
  if (current.mockData !== undefined) {
    return { value: current.mockData };
  }
  if (node.parsed?.events?.fetch) {
    const value = await runEvent(
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
    return { value };
  }
  const entry = await managedFetchService.load(current.request, { force });
  return { value: entry.value, responseHeaders: entry.responseHeaders };
}

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
    prevPage: undefined,
    nextPage: undefined,
    hasPrevPage: false,
    hasNextPage: false,
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

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}
