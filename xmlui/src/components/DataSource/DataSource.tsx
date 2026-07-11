import { useEffect, useMemo, useRef } from "react";
import { applyResultSelector, managedFetchService } from "../../runtime/data";
import { createRuntimeScope } from "../../runtime/state";
import { runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import { executeWithRetryPolicy, useRetryPolicy } from "../../runtime/retryPolicy";
import toast from "../../components-core/toast";
import { httpMethodNames } from "../abstractions";
import { createMetadata } from "../metadata-helpers";

// NOTE: Original component this is based on is the `Loader` component

const COMP = "DataSource";

export const DataSourceMd = createMetadata({
  status: "stable",
  description:
    "`DataSource` fetches and caches data from API endpoints, versus " +
    "[`APICall`](/docs/reference/components/APICall) which creates, updates or deletes data.",
  props: {
    method: {
      description: `Set the HTTP method.`,
      defaultValue: "get",
      availableValues: httpMethodNames,
      valueType: "string",
    },
    id: {
      description:
        `Set the ID used by other components to access the retrieved data in the \`value\`` +
        "property of a \`DataSource\`, or status info in the \`loaded\` and \`error\` properties." +
        "When no `id` is set, the component cannot be used programmatically.",
      isRequired: true,
      valueType: "string",
    },
    url: {
      description:
        `Set the URL. Required unless \`mockData\` is provided, in which case ` +
        `the component returns the mock data directly without making a network request.`,
      valueType: "string",
    },
    mockData: {
      description:
        "Provide data directly instead of fetching from a URL. When set, the component " +
        "resolves immediately with this value — no network request is made. Intended for " +
        "development and testing. Supports reactive expressions: when the bound value " +
        "changes, the DataSource re-resolves with the updated data.",
      valueType: "any",
    },
    body: {
      description: `Set the optional request body. The object you pass is serialized as a JSON string.`,
      valueType: "any",
    },
    rawBody: {
      description:
        `Set the request body with no serialization. Use it to send a payload  ` +
        `that has already been serialized to a JSON string.`,
      valueType: "string",
    },
    queryParams: {
      description: `Append optional key-value pairs to the URL.`,
      valueType: "any",
    },
    headers: {
      description: `Set request headers. Pass an object whose keys are header names and values are header values.`,
      valueType: "any",
    },
    credentials: {
      description:
        `Controls whether cookies and other credentials are sent with the request. ` +
        `Set to \`"include"\` to send credentials in cross-origin requests (requires ` +
        `\`Access-Control-Allow-Credentials: true\` header on the server).`,
      availableValues: [
        { value: "omit", description: "Never send credentials" },
        {
          value: "same-origin",
          description: "Send credentials only for same-origin requests (default browser behavior)",
        },
        {
          value: "include",
          description: "Always send credentials, even for cross-origin requests",
        },
      ],
      valueType: "string",
    },
    pollIntervalInSeconds: {
      description:
        "Set the interval for periodic data fetching. If the data changes on refresh, " +
        "XMLUI will re-render components that refer directly or indirectly to the \`DataSource\`. " +
        "If not set or set to zero, the component does not poll for data.",
      valueType: "number",
    },
    inProgressNotificationMessage: {
      description:
        "Set the message to display when the data fetch is in progress. " +
        "If the property value is not set, no progress message is displayed.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "Set the message to display when the data fetch completes." +
        "If the property value is not set, no completion message is displayed.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description: "",
      valueType: "string",
    },
    resultSelector: {
      description:
        "Set an optional object key to extract a subset of the response data. If this " +
        "value is not set, the entire response body is considered the result.",
      valueType: "string",
    },
    transformResult: {
      description:
        "Set an optional function to perform a final transformation of the " +
        "response data. If this value is not set, the result is not transformed.",
      valueType: "any",
    },
    prevPageSelector: {
      description:
        `When using \`${COMP}\` with paging, the response may contain information about the ` +
        `previous and next page. This property defines the selector that extracts the ` +
        `previous page information from the response deserialized to an object.`,
      valueType: "string",
    },
    nextPageSelector: {
      description:
        `When using \`${COMP}\` with paging, the response may contain information about ` +
        `the previous and next page. This property defines the selector that extracts ` +
        `the next page information from the response deserialized to an object.`,
      valueType: "string",
    },
    dataType: {
      description:
        'Type of data to fetch. When set to `"text"`, the response is returned as a raw string ' +
        'without JSON parsing. When set to `"csv"`, the response is parsed as CSV.',
      availableValues: [
        { value: "json", description: "Parse response as JSON (default)" },
        { value: "text", description: "Return response as raw text" },
        { value: "csv", description: "Parse response as CSV" },
        { value: "sql", description: "Execute SQL query" },
      ],
      valueType: "string",
    },
    structuralSharing: {
      description:
        "This property allows structural sharing. When turned on, `DataSource` will keep " +
        "the original reference if nothing has changed in the data. If a subset has " +
        "changed, `DataSource` will keep the unchanged parts and only replace the changed " +
        "parts. If you do not need this behavior, set this property to `false`.",
      valueType: "boolean",
      defaultValue: true,
    },
    omitTransactionId: {
      description:
        "When set to `true`, the `x-ue-client-tx-id` request header will not be added " +
        "to outgoing requests. Use this when the target API does not allow custom request " +
        "headers (e.g. third-party APIs with strict CORS `Access-Control-Allow-Headers`).",
      valueType: "boolean",
      defaultValue: "false",
    },
  },
  events: {
    loaded: {
      description:
        "The component triggers this event when the fetch operation has been completed " +
        "and the data is loaded. The event has two arguments. The first is the data " +
        "loaded; the second indicates if the event is a result of a refetch.",
      signature: "loaded(data: any, isRefetch: boolean): void",
      parameters: {
        data: "The data loaded from the fetch operation.",
        isRefetch: "Indicates whether this is a result of a refetch operation.",
      },
    },
    error: {
      description: `This event fires when a request results in an error.`,
      signature: "error(error: Error): void",
      parameters: {
        error: "The error object that occurred during the request.",
      },
    },

    fetch: {
      injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
      description:
        "When defined, this event handler replaces the default fetch logic. The handler " +
        "receives the resolved request properties as context variables: `$url`, `$method`, " +
        "`$queryParams`, `$requestBody`, `$requestHeaders`, and `$pageParams` (when paging). " +
        "The return value of the handler becomes the data result. Caching, polling, the " +
        "`loaded`/`error` events, `resultSelector`, `transformResult`, and the `refetch()` " +
        "method continue to work normally because the handler runs inside the same query " +
        "function that powers the default fetch.",
      signature: "fetch(): any",
      parameters: {},
    },
  },
  apis: {
    value: {
      description: `This property retrieves the data queried from the source after optional transformations.`,
      signature: "get value(): any",
    },
    inProgress: {
      description: "This property indicates if the data is being fetched.",
      signature: "get inProgress(): boolean",
    },
    isRefetching: {
      description: "This property indicates if the data is being re-fetched.",
      signature: "get isRefetching(): boolean",
    },
    loaded: {
      description: "This property indicates if the data has been loaded.",
      signature: "get loaded(): boolean",
    },
    refetch: {
      description: "This method requests the re-fetch of the data.",
      signature: "refetch(): void",
    },
    responseHeaders: {
      description:
        "This property retrieves the HTTP response headers from the last successful fetch. " +
        "Returns an object whose keys are header names and values are header values, or `undefined` " +
        "if no fetch has completed yet.",
      signature: "get responseHeaders(): Record<string, string> | undefined",
    },
  },
});


const fetchEventCache = new Map<string, { loaded: boolean; value?: unknown; promise?: Promise<unknown> }>();

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
  const errorNotificationMessage = useRawStringProp(node, scope, "errorNotificationMessage", "");
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
  const latest = useRef({ mockData, request, resultSelector, prevPageSelector, nextPageSelector, transformResult, structuralSharing, errorNotificationMessage });
  latest.current = { mockData, request, resultSelector, prevPageSelector, nextPageSelector, transformResult, structuralSharing, errorNotificationMessage };

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
        const dataSourceError = normalizeDataSourceError(error);
        updateApi(apiRef.current!, id, scope, {
          error: dataSourceError,
          inProgress: false,
          isRefetching: false,
        });
        void runEvent(node.parsed?.events?.error, scope, [dataSourceError]);
        showToast(scope, "error", latest.current.errorNotificationMessage, { error: dataSourceError });
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
    const key = managedFetchService.requestKey(current.request);
    if (force) {
      fetchEventCache.delete(key);
    }
    const cached = fetchEventCache.get(key);
    if (cached?.loaded) {
      return { value: cached.value };
    }
    if (cached?.promise) {
      return { value: await cached.promise };
    }
    const promise = runEvent(
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
    fetchEventCache.set(key, { loaded: false, promise });
    const value = await promise;
    fetchEventCache.set(key, { loaded: true, value });
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

export function clearDataSourceFetchEventCache(): void {
  fetchEventCache.clear();
}

function applyDataTransforms(value: unknown, selector: string, transform: unknown): unknown {
  const selected = applyResultSelector(value, selector || undefined);
  if (typeof transform === "function") {
    return transform(selected);
  }
  return selected;
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
  const text = interpolateTemplate(message, context);
  if (typeof fn === "function") {
    fn.call(reference, text);
    return;
  }
  toast[kind](text);
}

function interpolateTemplate(template: string, context: Record<string, unknown>): string {
  const withPaths = template.replace(/\{\$([a-zA-Z0-9_]+)(?:\.([^}]+))?\}/g, (_match, name: string, path: string) => {
    const root = context[name];
    const value = path ? readPath(root, path) : root;
    return value == null ? "" : String(value);
  });
  return withPaths.replace(/\{([^{}]*\$[a-zA-Z0-9_][^{}]*)\}/g, (_match, expression: string) => {
    try {
      const names = Object.keys(context).map((name) => `$${name}`);
      const value = Function(...names, `"use strict"; return (${expression});`)(...Object.values(context));
      return value == null ? "" : String(value);
    } catch {
      return "";
    }
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

function useRawStringProp(
  node: Parameters<XmluiBuiltInRenderer>[0]["node"],
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  name: string,
  fallback: string,
): string {
  const evaluated = useStringProp(node, scope, name, fallback);
  const raw = node.props[name];
  return typeof raw === "string" && raw.includes("{$") ? raw : evaluated ?? fallback;
}

function normalizeDataSourceError(error: unknown): Record<string, unknown> {
  const record = error as {
    code?: string;
    category?: string;
    retryable?: boolean;
    data?: Record<string, unknown>;
    message?: string;
    statusCode?: number;
    response?: unknown;
  };
  const response = record?.response && typeof record.response === "object"
    ? record.response as Record<string, unknown>
    : {};
  const normalized: Record<string, unknown> = {
    code: record?.code,
    category: record?.category,
    retryable: record?.retryable,
    statusCode: record?.statusCode ?? (response.statusCode as number | undefined) ?? 0,
    message: String(response.message ?? record?.message ?? ""),
    details: response.details ?? {},
    response,
  };
  if (record?.data && Object.keys(record.data).length > 0) {
    normalized.data = record.data;
  }
  return normalized;
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
