import { useEffect, useRef } from "react";

import { managedFetchService } from "../../runtime/data";
import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import { executeWithRetryPolicy, useRetryPolicy } from "../../runtime/retryPolicy";
import { AppError } from "../../components-core/errors/app-error";
import { useFallback } from "../Fallback/FallbackReact";
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
  const optimisticValue = useEvaluatedProp(node, scope, "optimisticValue", undefined);
  const confirmTitle = useStringProp(node, scope, "confirmTitle", "");
  const confirmMessage = useStringProp(node, scope, "confirmMessage", "");
  const confirmButtonLabel = useStringProp(node, scope, "confirmButtonLabel", "");
  const cancelButtonLabel = useStringProp(node, scope, "cancelButtonLabel", "");
  const inProgressNotificationMessage = useStringProp(node, scope, "inProgressNotificationMessage", "");
  const completedNotificationMessage = useStringProp(node, scope, "completedNotificationMessage", "");
  const errorNotificationMessage = useStringProp(node, scope, "errorNotificationMessage", "");
  const deferredMode = Boolean(useEvaluatedProp(node, scope, "deferredMode", false));
  const statusUrl = useStringProp(node, scope, "statusUrl", "");
  const statusMethod = useStringProp(node, scope, "statusMethod", "get");
  const pollIntervalInMilliseconds = Number(useEvaluatedProp(node, scope, "pollIntervalInMilliseconds", 250) ?? 250);
  const cancelUrl = useStringProp(node, scope, "cancelUrl", "");
  const cancelMethod = useStringProp(node, scope, "cancelMethod", "post");
  const retryPolicy = useRetryPolicy();
  const fallback = useFallback();
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const fallbackIdRef = useRef<string | symbol>();
  const apiRef = useRef<Record<string, unknown>>();
  const latest = useRef({
    url,
    method,
    body,
    rawBody,
    queryParams,
    headers,
    credentials,
    invalidates,
    optimisticValue,
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    cancelButtonLabel,
    inProgressNotificationMessage,
    completedNotificationMessage,
    errorNotificationMessage,
    deferredMode,
    statusUrl,
    statusMethod,
    pollIntervalInMilliseconds,
    cancelUrl,
    cancelMethod,
  });
  latest.current = {
    url,
    method,
    body,
    rawBody,
    queryParams,
    headers,
    credentials,
    invalidates,
    optimisticValue,
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    cancelButtonLabel,
    inProgressNotificationMessage,
    completedNotificationMessage,
    errorNotificationMessage,
    deferredMode,
    statusUrl,
    statusMethod,
    pollIntervalInMilliseconds,
    cancelUrl,
    cancelMethod,
  };

  if (!apiRef.current) {
    apiRef.current = createApiCallApi(id, scope);
  }
  useEffect(
    () => registerReference(scope, id, apiRef.current!),
    [id, scope.references, scope.store],
  );

  useEffect(() => {
    if (!id) {
      return;
    }
    const fallbackId = fallbackIdRef.current ?? (fallbackIdRef.current = id || Symbol("APICall"));
    let cancelled = false;
    let pollTimer: number | undefined;
    const clearPollTimer = () => {
      if (pollTimer !== undefined) {
        window.clearTimeout(pollTimer);
        pollTimer = undefined;
      }
    };
    apiRef.current!.stopPolling = () => {
      clearPollTimer();
      updateApi(apiRef.current!, id, scopeRef.current, { isPolling: false });
    };
    apiRef.current!.cancel = async () => {
      cancelled = true;
      clearPollTimer();
      const currentScope = scopeRef.current;
      updateApi(apiRef.current!, id, currentScope, { isPolling: false, inProgress: false });
      const current = latest.current;
      if (current.cancelUrl) {
        const request = managedFetchService.buildRequest({
          url: interpolateTemplate(current.cancelUrl, { result: apiRef.current!.lastResult }),
          method: current.cancelMethod,
        });
        await runWithOptionalRetry(() => managedFetchService.execute(request), retryPolicy);
      }
    };
    apiRef.current!.execute = async (...args: unknown[]) => {
      cancelled = false;
      clearPollTimer();
      const currentScope = scopeRef.current;
      const current = latest.current;
      if (requiresConfirmation(current) && !await confirmExecution(current)) {
        return undefined;
      }
      const before = await runEvent(node.parsed?.events?.beforeRequest, currentScope, args);
      if (before === false) {
        return undefined;
      }
      updateApi(apiRef.current!, id, currentScope, {
        inProgress: true,
        lastError: undefined,
        isPolling: false,
      });
      applyOptimisticValue(currentScope, id, current.invalidates, current.optimisticValue);
      showToast(currentScope, "loading", current.inProgressNotificationMessage, {});
      try {
        const request = managedFetchService.buildRequest({
          url: current.url,
          method: current.method,
          body: current.body,
          rawBody: current.rawBody || undefined,
          queryParams: current.queryParams,
          headers: current.headers,
          credentials: current.credentials || undefined,
        });
        const executionScope = createRuntimeScope({
          store: currentScope.store,
          parent: currentScope,
          references: currentScope.references,
          contextValues: {
            $param: args[0],
            $params: args,
            $queryParams: request.queryParams,
            $requestBody: request.rawBody ?? request.body,
            $requestHeaders: request.headers,
          },
        });
        const response = await runWithOptionalRetry(async () => {
          if (node.parsed?.events?.mockExecute) {
            return { result: await runEvent(node.parsed.events.mockExecute, executionScope, args) };
          }
          const managedResponse = await managedFetchService.execute(request);
          return { result: managedResponse.data, responseHeaders: managedResponse.headers };
        }, retryPolicy);
        const { result, responseHeaders } = response;
        if (current.deferredMode && current.statusUrl) {
          updateApi(apiRef.current!, id, currentScope, {
            lastResult: result,
            lastResponseHeaders: responseHeaders,
            isPolling: true,
            pollAttempts: 0,
          });
          void runEvent(node.parsed?.events?.pollingStart, currentScope, [result]);
          const deferredResult = await pollDeferredStatus({
            api: apiRef.current!,
            id,
            scope: currentScope,
            node,
            retryPolicy,
            initialResult: result,
            current,
            clearPollTimer,
            setPollTimer: (timer) => {
              pollTimer = timer;
            },
            isCancelled: () => cancelled,
          });
          fallbackRef.current?.clearError(fallbackId);
          return deferredResult;
        }
        updateApi(apiRef.current!, id, currentScope, {
          inProgress: false,
          loaded: true,
          lastResult: result,
          lastError: undefined,
          lastResponseHeaders: responseHeaders,
        });
        fallbackRef.current?.clearError(fallbackId);
        const successResult = await runEvent(node.parsed?.events?.success, currentScope, [result]);
        if (successResult !== false) {
          invalidateDataSources(currentScope, current.invalidates);
        }
        showToast(currentScope, "success", current.completedNotificationMessage, { result });
        return result;
      } catch (error) {
        updateApi(apiRef.current!, id, currentScope, {
          inProgress: false,
          lastError: error,
          isPolling: false,
        });
        fallbackRef.current?.reportError(fallbackId, AppError.from(error));
        void runEvent(node.parsed?.events?.error, currentScope, [error]);
        showToast(currentScope, "error", latest.current.errorNotificationMessage, { error });
        throw error;
      }
    };
    scopeRef.current.store.invalidateReference(id);
    return () => {
      cancelled = true;
      clearPollTimer();
    };
  }, [
    id,
    node.parsed?.events?.beforeRequest,
    node.parsed?.events?.error,
    node.parsed?.events?.mockExecute,
    node.parsed?.events?.pollingComplete,
    node.parsed?.events?.pollingStart,
    node.parsed?.events?.statusUpdate,
    node.parsed?.events?.success,
    retryPolicy,
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
    isPolling: false,
    pollAttempts: 0,
    statusData: undefined,
    cancel: () => Promise.resolve(undefined),
    stopPolling: () => undefined,
  };
  if (id) {
    scope.references[id] = api;
  }
  return api;
}

export function invalidateDataSources(
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

type LatestApiCall = {
  invalidates: unknown;
  optimisticValue?: unknown;
  confirmTitle: string;
  confirmMessage: string;
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  inProgressNotificationMessage: string;
  completedNotificationMessage: string;
  errorNotificationMessage: string;
  deferredMode: boolean;
  statusUrl: string;
  statusMethod: string;
  pollIntervalInMilliseconds: number;
  cancelUrl: string;
  cancelMethod: string;
};

function applyOptimisticValue(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  sourceId: string,
  invalidates: unknown,
  optimisticValue: unknown,
): void {
  if (optimisticValue === undefined) {
    return;
  }
  const names = Array.isArray(invalidates)
    ? invalidates
    : typeof invalidates === "string"
      ? invalidates.split(",").map((name) => name.trim()).filter(Boolean)
      : [];
  for (const name of names) {
    const api = scope.references[String(name)] as Record<string, unknown> | undefined;
    if (api) {
      updateApi(api, String(name), scope, {
        value: optimisticValue,
        loaded: true,
        error: undefined,
      });
    }
  }
  if (sourceId) {
    scope.store.invalidateReference(sourceId);
  }
}

function requiresConfirmation(current: LatestApiCall): boolean {
  return Boolean(
    current.confirmTitle ||
    current.confirmMessage ||
    current.confirmButtonLabel ||
    current.cancelButtonLabel,
  );
}

async function confirmExecution(current: LatestApiCall): Promise<boolean> {
  const message = [current.confirmTitle, current.confirmMessage].filter(Boolean).join("\n");
  return window.confirm(message || "Confirm");
}

async function pollDeferredStatus({
  api,
  id,
  scope,
  node,
  retryPolicy,
  initialResult,
  current,
  clearPollTimer,
  setPollTimer,
  isCancelled,
}: {
  api: Record<string, unknown>;
  id: string;
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"];
  node: Parameters<XmluiBuiltInRenderer>[0]["node"];
  retryPolicy: ReturnType<typeof useRetryPolicy>;
  initialResult: unknown;
  current: LatestApiCall;
  clearPollTimer: () => void;
  setPollTimer: (timer: number) => void;
  isCancelled: () => boolean;
}): Promise<unknown> {
  const statusRequest = managedFetchService.buildRequest({
    url: interpolateTemplate(current.statusUrl, { result: initialResult }),
    method: current.statusMethod,
  });
  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (isCancelled()) {
        resolve(undefined);
        return;
      }
      try {
        const response = await runWithOptionalRetry(
          () => managedFetchService.execute(statusRequest),
          retryPolicy,
        );
        const statusData = response.data;
        const progress = readNumber(statusData, "progress", 0);
        const attempts = Number(api.pollAttempts ?? 0) + 1;
        updateApi(api, id, scope, {
          statusData,
          progress,
          pollAttempts: attempts,
          isPolling: true,
        });
        void runEvent(node.parsed?.events?.statusUpdate, scope, [statusData, progress]);
        if (isDeferredFailure(statusData)) {
          clearPollTimer();
          updateApi(api, id, scope, {
            inProgress: false,
            isPolling: false,
            lastError: statusData,
          });
          void runEvent(node.parsed?.events?.error, scope, [statusData]);
          void runEvent(node.parsed?.events?.pollingComplete, scope, [statusData, "failed"]);
          showToast(scope, "error", current.errorNotificationMessage, { statusData, progress });
          reject(statusData);
          return;
        }
        if (isDeferredComplete(statusData)) {
          clearPollTimer();
          updateApi(api, id, scope, {
            inProgress: false,
            loaded: true,
            isPolling: false,
            lastResult: statusData,
            lastError: undefined,
          });
          const successResult = await runEvent(node.parsed?.events?.success, scope, [statusData]);
          if (successResult !== false) {
            invalidateDataSources(scope, current.invalidates);
          }
          void runEvent(node.parsed?.events?.pollingComplete, scope, [statusData, "completed"]);
          showToast(scope, "success", current.completedNotificationMessage, { statusData, progress });
          resolve(statusData);
          return;
        }
        setPollTimer(window.setTimeout(poll, Math.max(1, current.pollIntervalInMilliseconds)));
      } catch (error) {
        clearPollTimer();
        updateApi(api, id, scope, {
          inProgress: false,
          isPolling: false,
          lastError: error,
        });
        void runEvent(node.parsed?.events?.error, scope, [error]);
        void runEvent(node.parsed?.events?.pollingComplete, scope, [error, "error"]);
        showToast(scope, "error", current.errorNotificationMessage, { error });
        reject(error);
      }
    };
    void poll();
  });
}

function isDeferredComplete(statusData: unknown): boolean {
  const record = statusData as Record<string, unknown> | null | undefined;
  return Boolean(record?.done) || ["completed", "complete", "success", "succeeded"].includes(String(record?.status).toLowerCase());
}

function isDeferredFailure(statusData: unknown): boolean {
  const record = statusData as Record<string, unknown> | null | undefined;
  return Boolean(record?.failed) || ["failed", "error", "cancelled"].includes(String(record?.status).toLowerCase());
}

function readNumber(value: unknown, key: string, fallback: number): number {
  const record = value as Record<string, unknown> | null | undefined;
  const numeric = Number(record?.[key]);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function showToast(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  kind: "loading" | "success" | "error",
  message: string,
  context: Record<string, unknown>,
): void {
  if (!message) {
    return;
  }
  const reference = scope.toast?.reference as Record<string, unknown> | undefined;
  const fn = reference?.[kind];
  if (typeof fn === "function") {
    fn.call(reference, interpolateTemplate(message, context));
  }
}

function interpolateTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\$([a-zA-Z0-9_]+)(?:\.([^}]+))?\}/g, (_match, name: string, path: string) => {
    const root = context[name];
    const value = path ? readPath(root, path) : root;
    return value == null ? "" : String(value);
  });
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").reduce((current, part) => {
    if (current == null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, value);
}
