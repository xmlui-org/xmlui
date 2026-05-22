import { useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
  TransformResultFn,
} from "../abstractions/LoaderRenderer";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import type { LoaderDirections } from "../loader/PageableLoader";
import { createLoaderRenderer } from "../renderers";
import RestApiProxy from "../RestApiProxy";
import { extractParam } from "../utils/extractParam";
import { DataLoaderQueryKeyGenerator } from "../utils/DataLoaderQueryKeyGenerator";
import { PageableLoader } from "../loader/PageableLoader";
import { Loader } from "../loader/Loader";
import { useAppContext } from "../AppContext";
import { useShallowCompareMemoize } from "../utils/hooks";
import { useIndexerContext } from "../../components/App/IndexerContext";
import { createMetadata, d } from "../../components/metadata-helpers";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";
import { createContextVariableError } from "../EngineError";
import {
  safeStringify,
  formatDiff,
  xsConsoleLog,
  pushXsLog,
  getCurrentTrace,
} from "../inspector/inspectorUtils";

// --- Component metadata (prop/event declarations used by the XMLUI language server and docs)
export const DataLoaderMd = createMetadata({
  status: "stable",
  description: "This component manages data fetching from a web API",
  props: {
    method: d("The HTTP method to use"),
    url: d("The URL to fetch data from"),
    rawBody: d("The raw body of the request"),
    body: d("The body of the request to be sent as JSON"),
    queryParams: d("Query parameters to send with the request"),
    headers: d("Headers to send with the request"),
    credentials: d("Controls whether cookies and credentials are sent with the request (omit, same-origin, or include)"),
    pollIntervalInSeconds: d("The interval in seconds to poll the API for refreshing data"),
    resultSelector: d("An expression to extract the result from the response"),
    prevPageSelector: d("An expression to extract the previous page parameter from the response"),
    nextPageSelector: d("An expression to extract the next page parameter from the response"),
    inProgressNotificationMessage: d("The message to show when the loader is in progress"),
    completedNotificationMessage: d("The message to show when the loader completes"),
    errorNotificationMessage: d("The message to show when an error occurs"),
    transformResult: d("Function for transforming the datasource result"),
    dataType: d("Type of data to fetch (default: json, or csv, sql, or text)"),
    structuralSharing: d("Whether to use structural sharing for the data"),
    mockData: d("Data to return directly without making a network request (for development and testing)"),
  },
  events: {
    loaded: d("Event to trigger when the data is loaded"),
    error: d("This event fires when an error occurs while fetching data"),
    fetch: d("When defined, this event handler replaces the default fetch logic"),
  },
});

type DataLoaderDef = ComponentDef<typeof DataLoaderMd>;

type LoaderProps = {
  loader: DataLoaderDef;
  state: ContainerState;
  registerComponentApi: RegisterComponentApiFn;
  onLoaded?: (...args: any[]) => void;
  onError?: (...args: any[]) => Promise<boolean>;
  onFetch?: (context: Record<string, any>) => Promise<any> | any;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  transformResult?: TransformResultFn;
  structuralSharing?: boolean;
};

/**
 * Resolves request parameters from component state, executes the fetch (REST, CSV,
 * text, SQL, or a user-supplied onFetch handler), then dispatches lifecycle callbacks
 * (loaderInProgressChanged, loaderLoaded, loaderError) and manages in-progress toasts.
 * Renders either a Loader (simple) or PageableLoader (paginated), or a mock Loader
 * when mockData is set.
 */
function DataLoader({
  loader,
  state,
  registerComponentApi,
  onLoaded,
  onError,
  onFetch,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderLoaded,
  loaderError,
  transformResult,
  structuralSharing = true,
}: LoaderProps) {
  const appContext = useAppContext();
  const xsVerbose = appContext.appGlobals?.xsVerbose === true;
  const xsLogMax = Number(appContext.appGlobals?.xsVerboseLogMax ?? 200);
  const prevDataRef = useRef<any>(undefined);
  const instanceIdRef = useRef<string>(
    `ds-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
  );

  // Capture trace ID when fetch is triggered, not when it completes
  const pendingTraceIdRef = useRef<string | undefined>(undefined);

  // Inspector verbose logging — no-op when xsVerbose is off.
  // Emits a structured entry to the xs log ring buffer with full DataSource context.
  const xsLog = useCallback(
    (...args: any[]) => {
      if (!xsVerbose) return;
      xsConsoleLog(...args);
      const detail = args[1];
      const w = typeof window !== "undefined" ? (window as any) : {};
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: pendingTraceIdRef.current || getCurrentTrace(),
        instanceId: instanceIdRef.current,
        dataSourceId: (loader?.props as any)?.id,
        dataSourceUrl: loader?.props?.url,
        dataSourceBody: loader?.props?.body,
        ownerUid: loader?.uid,
        ownerFileId: loader?.debug?.source?.fileId,
        ownerSource: loader?.debug?.source
          ? { start: loader.debug.source.start, end: loader.debug.source.end }
          : undefined,
        text: safeStringify(args),
        kind: args[0] ?? undefined,
        eventName: detail?.eventName,
        uid: detail?.uid ? String(detail.uid) : undefined,
        componentType: "DataSource",
        diffPretty: detail?.diffPretty ||
          (Array.isArray(detail?.diff) && detail.diff.map((d: any) => d?.diffPretty).filter(Boolean).join("\n\n")) ||
          undefined,
        diffJson: Array.isArray(detail?.diff) ? detail.diff : undefined,
      }, xsLogMax);
    },
    [xsLogMax, xsVerbose, loader],
  );

  const rawUrl = extractParam(state, loader.props.url, appContext);
  // The *Inner / useShallowCompareMemoize two-step is used for all request params:
  // useMemo re-evaluates when state changes; useShallowCompareMemoize suppresses
  // React Query re-fetches when the value is referentially new but shallowly equal.
  const rawQueryParamsInner = useMemo(() => {
    return extractParam(state, loader.props.queryParams, appContext);
  }, [appContext, loader.props.queryParams, state]);
  const rawQueryParams = useShallowCompareMemoize(rawQueryParamsInner);

  // Normalize URL and query params to handle embedded query parameters
  // This ensures consistent behavior whether params are in URL or queryParams prop
  // Fixes issue #2672: https://github.com/xmlui-org/xmlui/issues/2672
  const { url, queryParams } = useMemo(() => {
    if (!rawUrl) {
      return { url: rawUrl, queryParams: rawQueryParams };
    }

    const queryIndex = rawUrl.indexOf('?');
    if (queryIndex === -1) {
      // No embedded query params
      return { url: rawUrl, queryParams: rawQueryParams };
    }

    // Extract embedded query params from URL
    const baseUrl = rawUrl.substring(0, queryIndex);
    const queryString = rawUrl.substring(queryIndex + 1);

    const embeddedParams: Record<string, any> = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        embeddedParams[key] = value;
      });
    }

    // Merge embedded params with explicit queryParams
    // Explicit queryParams take precedence
    const mergedParams = Object.keys(embeddedParams).length > 0
      ? { ...embeddedParams, ...rawQueryParams }
      : rawQueryParams;

    return { url: baseUrl, queryParams: mergedParams };
  }, [rawUrl, rawQueryParams]);

  const bodyInner = useMemo(() => {
    return extractParam(state, loader.props.body, appContext);
  }, [appContext, loader.props.body, state]);
  const body = useShallowCompareMemoize(bodyInner);

  const rawBodyInner = useMemo(() => {
    return extractParam(state, loader.props.rawBody, appContext);
  }, [appContext, loader.props.rawBody, state]);
  const rawBody = useShallowCompareMemoize(rawBodyInner);

  const pagingDirection: LoaderDirections | null = useMemo(() => {
    if (loader.props.prevPageSelector && loader.props.nextPageSelector) {
      return "BIDIRECTIONAL";
    }
    if (loader.props.prevPageSelector) {
      return "BACKWARD";
    }
    if (loader.props.nextPageSelector) {
      return "FORWARD";
    }
    return null;
  }, [loader.props.nextPageSelector, loader.props.prevPageSelector]);

  const hasPaging = pagingDirection !== null;

  const { apiInstance } = useApiInterceptorContext();
  const api = useMemo(() => {
    return new RestApiProxy(appContext, apiInstance);
  }, [apiInstance, appContext]);

  /**
   * Core fetch function passed to Loader/PageableLoader as its queryFn.
   * Dispatch order: onFetch override → csv → text → sql → default REST via RestApiProxy.
   * Each branch traces api:start / api:complete / api:error to the xs inspector log.
   */
  const fetchData = useCallback(
    async (abortSignal?: AbortSignal, pageParams?: any) => {
      // Capture the current trace ID when fetch is triggered
      // This way the trace is preserved even if the handler completes before fetch does.
      // After startup is complete, don't capture the startup trace — otherwise
      // DataSource re-fetches (e.g. after navigation) get incorrectly attributed to startup.
      if (typeof window !== "undefined") {
        const w = window as any;
        const current = w._xsCurrentTrace;
        if (current && w._xsStartupComplete && current === w._xsStartupTrace) {
          pendingTraceIdRef.current = undefined;
        } else {
          pendingTraceIdRef.current = current;
        }
      }

      // When an onFetch event handler is defined, it fully replaces the default
      // fetching logic. The handler receives the resolved request properties as
      // context variables and its return value becomes the data result. React
      // Query caching still applies because this runs inside the queryFn.
      if (onFetch) {
        const resolvedMethod = extractParam(state, loader.props.method, appContext) || "GET";
        const resolvedHeaders = extractParam(state, loader.props.headers, appContext) || {};
        const resolvedQueryParams =
          extractParam(state, loader.props.queryParams, appContext) || {};
        const resolvedBody = rawBody
          ? extractParam(state, loader.props.rawBody, appContext)
          : extractParam(state, loader.props.body, appContext);
        const resolvedUrl = extractParam(state, loader.props.url, appContext);
        const result = await onFetch({
          $url: resolvedUrl,
          $method: resolvedMethod,
          $queryParams: resolvedQueryParams,
          $requestBody: resolvedBody,
          $requestHeaders: resolvedHeaders,
          $pageParams: pageParams,
        });
        return result === undefined ? null : result;
      }

      // For CSV data type, handle directly rather than using RestApiProxy
      if (loader.props.dataType === "csv") {
        try {
          const method = extractParam(state, loader.props.method, appContext) || "GET";
          const headers = extractParam(state, loader.props.headers, appContext) || {};
          const fetchUrl = api.resolveUrl({ operation: { url, queryParams } as any });
          const response = await fetch(fetchUrl, buildSimpleFetchOptions(method, headers, abortSignal, rawBody));

          if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
          }

          const csvText = await response.text();

          return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                if (results.errors && results.errors.length) {
                  console.warn("CSV parsing warnings:", results.errors);
                  // TODO: filter(() => true) always passes — review whether this should
                  // filter by error severity (e.g. results.errors.filter(e => e.type === "FieldMismatch")).
                  const fatalErrors = results.errors.filter(() => true);
                  if (fatalErrors.length) {
                    reject(new Error(`CSV parsing error: ${fatalErrors[0].message}`));
                    return;
                  }
                }
                resolve(results.data);
              },
              error: (error) => {
                reject(error);
              },
            });
          });
        } catch (error) {
          console.error("Error loading CSV:", error);
          throw error;
        }
      } else if (loader.props.dataType === "text") {
        try {
          const method = extractParam(state, loader.props.method, appContext) || "GET";
          const headers = extractParam(state, loader.props.headers, appContext) || {};
          const fetchUrl = api.resolveUrl({ operation: { url, queryParams } as any });
          const response = await fetch(fetchUrl, buildSimpleFetchOptions(method, headers, abortSignal, rawBody));
          if (!response.ok) {
            throw new Error(`Failed to fetch text: ${response.status} ${response.statusText}`);
          }
          return await response.text();
        } catch (error) {
          console.error("Error loading text:", error);
          throw error;
        }
      } else if (loader.props.dataType === "sql") {
        // Extract SQL query from the body or rawBody
        let sqlQuery: string = "";
        let sqlParams: any[] = [];

        // Try to extract SQL query and parameters from body or rawBody
        if (body && typeof body === "object") {
          sqlQuery = body.sql || "";
          sqlParams = body.params || [];
        } else if (rawBody) {
          try {
            const parsedBody = JSON.parse(rawBody);
            sqlQuery = parsedBody.sql || "";
            sqlParams = parsedBody.params || [];
          } catch (e) {
            // If rawBody is not valid JSON, use it as the SQL query
            sqlQuery = rawBody;
          }
        }

        // If SQL query is empty, throw an error
        if (!sqlQuery) {
          throw new Error("SQL query is required for SQL data type");
        }

        // Prepare request to /query endpoint
        const queryUrl = url || "/query";
        const method = extractParam(state, loader.props.method, appContext) || "POST";
        const headers = extractParam(state, loader.props.headers, appContext) || {
          "Content-Type": "application/json",
        };

        const requestBody = JSON.stringify({
          sql: sqlQuery,
          params: sqlParams,
        });

        const fetchOptions: RequestInit = {
          method,
          headers,
          body: requestBody,
        };

        if (abortSignal) {
          fetchOptions.signal = abortSignal;
        }

        // Trace API call start
        if (xsVerbose) {
          pushXsLog({
            ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
            kind: "api:start",
            url: queryUrl,
            method,
            dataType: "sql",
            body: { sql: sqlQuery, params: sqlParams },
          }, xsLogMax);
        }

        try {
          const response = await fetch(queryUrl, fetchOptions);

          if (!response.ok) {
            const errorMsg = `Failed to execute SQL query: ${response.status} ${response.statusText}`;
            // Trace API call error
            if (xsVerbose) {
              pushXsLog({
                ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
                kind: "api:error",
                url: queryUrl,
                method,
                dataType: "sql",
                error: { message: errorMsg },
                status: response.status,
              }, xsLogMax);
            }
            throw new Error(errorMsg);
          }

          // Parse response as JSON
          const jsonResult = await response.json();

          // Determine the final result.
          // Some SQL backends wrap rows under a 'rows' or 'results' key; unwrap if present.
          let finalResult = jsonResult;
          if (jsonResult && typeof jsonResult === "object") {
            if (jsonResult.rows) {
              finalResult = jsonResult.rows;
            } else if (jsonResult.results) {
              finalResult = jsonResult.results;
            }
          }

          // Trace API call completion
          if (xsVerbose) {
            pushXsLog({
              ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
              kind: "api:complete",
              url: queryUrl,
              method,
              dataType: "sql",
              result: finalResult,
              status: response.status,
            }, xsLogMax);
          }

          return finalResult;
        } catch (error: any) {
          // Trace API call error (for network errors, etc.)
          if (xsVerbose && error?.message && !error.message.startsWith("Failed to execute SQL query:")) {
            pushXsLog({
              ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
              kind: "api:error",
              url: queryUrl,
              method,
              dataType: "sql",
              error: { message: error?.message || String(error), stack: error?.stack },
            }, xsLogMax);
          }
          console.error("Error executing SQL query:", error);
          throw error;
        }
      } else {
        // Trace API call start
        if (xsVerbose) {
          const method = (loader.props as any).method || "GET";
          pushXsLog({
            ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
            kind: "api:start",
            url,
            method,
            body: body || rawBody,
          }, xsLogMax);
        }

        try {
          const result = await api.execute({
            abortSignal,
            operation: loader.props as any,
            params: {
              ...state,
              $pageParams: pageParams,
            },
            resolveBindingExpressions: true,
            omitTransactionId: !!(loader.props as any).omitTransactionId,
            onResponseHeaders: (h) => {
              pendingResponseHeadersRef.current = h;
            },
          });

          // Trace API call completion
          if (xsVerbose) {
            const method = (loader.props as any).method || "GET";
            pushXsLog({
              ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
              kind: "api:complete",
              url,
              method,
              result,
            }, xsLogMax);
          }

          return result;
        } catch (e: any) {
          // Trace API call error
          if (xsVerbose) {
            const method = (loader.props as any).method || "GET";
            pushXsLog({
              ...traceBase(pendingTraceIdRef, instanceIdRef, loader, xsLogMax),
              kind: "api:error",
              url,
              method,
              error: { message: e?.message || String(e), stack: e?.stack },
            }, xsLogMax);
          }
          throw e;
        }
      }
    },
    [api, loader.props, state, url, queryParams, body, rawBody, appContext, xsVerbose, xsLogMax, onFetch],
  );

  const queryId = useMemo(() => {
    return new DataLoaderQueryKeyGenerator(
      url,
      queryParams,
      appContext?.appGlobals.apiUrl,
      body,
      rawBody,
    ).asKey();
  }, [appContext?.appGlobals.apiUrl, queryParams, url, body, rawBody]);

  const stateRef = useRef({ state, appContext });
  stateRef.current = { state, appContext };

  const pendingResponseHeadersRef = useRef<Record<string, string> | undefined>(undefined);

  const loadingToastIdRef = useRef<string | undefined>(undefined);
  // Manages the in-progress toast and delegates to loaderInProgressChanged.
  const handleInProgressChange: LoaderInProgressChangedFn = useCallback(
    (isInProgress) => {
      loaderInProgressChanged(isInProgress);

      const inProgressMessage = extractParam(
        stateRef.current.state,
        loader.props.inProgressNotificationMessage,
        stateRef.current.appContext,
      );
      if (isInProgress && inProgressMessage) {
        if (loadingToastIdRef.current) {
          toast.dismiss(loadingToastIdRef.current);
        }
        loadingToastIdRef.current = toast.loading(inProgressMessage);
      } else {
        if (loadingToastIdRef.current) {
          toast.dismiss(loadingToastIdRef.current);
        }
      }
    },
    [loader.props.inProgressNotificationMessage, loaderInProgressChanged],
  );

  // Logs data changes to the xs inspector and manages the completion toast.
  const handleLoaded: LoaderLoadedFn = useCallback(
    (data, pageInfo) => {
      if (xsVerbose) {
        const before = prevDataRef.current;
        const after = data;
        const dataSourceId = (loader.props as any).id || loader.uid || loader.props.url || "DataSource";
        const path = `DataSource:${dataSourceId}`;
        xsLog("state:changes", {
          uid: dataSourceId,
          eventName: `DataSource:${dataSourceId}`,
          instanceId: instanceIdRef.current,
          diff: [formatDiff(path, before, after)],
        });
        prevDataRef.current = data;
        // Clear the pending trace so it's not reused for subsequent automatic refreshes
        pendingTraceIdRef.current = undefined;
      }

      loaderLoaded(data, pageInfo, data !== undefined ? pendingResponseHeadersRef.current : undefined);

      const completedMessage = extractParam(
        {
          ...stateRef.current.state,
          $result: data,
        },
        loader.props.completedNotificationMessage,
        stateRef.current.appContext,
      );
      if (completedMessage) {
        toast.success(completedMessage, {
          id: loadingToastIdRef.current,
        });
      } else {
        if (loadingToastIdRef.current) {
          toast.dismiss(loadingToastIdRef.current);
        }
      }
    },
    [loader.props.completedNotificationMessage, loaderLoaded],
  );

  // Delegates to loaderError, runs the user's onError handler (if any), and manages the error toast.
  const handleError: LoaderErrorFn = useCallback(
    async (error) => {
      loaderError(error);
      if (onError) {
        const result = await onError(createContextVariableError(error));
        if (result === false) {
          if (loadingToastIdRef.current) {
            toast.dismiss(loadingToastIdRef.current);
          }
          return;
        }
      }
      const errorMessage = extractParam(
        {
          ...stateRef.current.state,
          $error: createContextVariableError(error),
        },
        loader.props.errorNotificationMessage,
        stateRef.current.appContext,
      );
      if (errorMessage) {
        toast.error(errorMessage, {
          id: loadingToastIdRef.current,
        });
      } else {
        if (loadingToastIdRef.current) {
          toast.dismiss(loadingToastIdRef.current);
        }
      }
      if (errorMessage === undefined) {
        appContext.signError(error as Error);
      }
    },
    [appContext, loader.props.errorNotificationMessage, loaderError, onError],
  );

  // --- Mock mode: when mockData prop is set, bypass all network logic and resolve directly
  const hasMockData = loader.props?.mockData !== undefined;
  const mockDataInner = useMemo(() => {
    if (!hasMockData) return undefined;
    return extractParam(state, loader.props.mockData, appContext);
  }, [hasMockData, appContext, loader.props.mockData, state]);
  const mockDataValue = useShallowCompareMemoize(mockDataInner);

  const returnMockData = useCallback(() => {
    return mockDataValue ?? null;
  }, [mockDataValue]);

  const mockQueryId = useMemo<readonly any[] | undefined>(() => {
    if (!hasMockData) return undefined;
    return ["mockData", loader.uid, mockDataValue];
  }, [hasMockData, loader.uid, mockDataValue]);

  const pollIntervalInSeconds = extractParam(state, loader.props.pollIntervalInSeconds, appContext);

  if (hasMockData) {
    return (
      <Loader
        queryId={mockQueryId}
        key={`mock-${loader.uid}`}
        state={state}
        loader={loader}
        loaderInProgressChanged={handleInProgressChange}
        loaderIsRefetchingChanged={loaderIsRefetchingChanged}
        loaderLoaded={handleLoaded}
        loaderError={handleError}
        loaderFn={returnMockData}
        pollIntervalInSeconds={pollIntervalInSeconds}
        registerComponentApi={registerComponentApi}
        onLoaded={onLoaded}
        transformResult={transformResult}
        structuralSharing={structuralSharing}
      />
    );
  }

  return hasPaging ? (
    <PageableLoader
      queryId={queryId}
      key={queryId?.join("")}
      state={state}
      loader={loader}
      loaderInProgressChanged={handleInProgressChange}
      loaderIsRefetchingChanged={loaderIsRefetchingChanged}
      loaderLoaded={handleLoaded}
      loaderError={handleError}
      loaderFn={fetchData}
      registerComponentApi={registerComponentApi}
      pollIntervalInSeconds={pollIntervalInSeconds}
      onLoaded={onLoaded}
      transformResult={transformResult}
      structuralSharing={structuralSharing}
    />
  ) : (
    <Loader
      queryId={queryId}
      key={queryId?.join("")}
      state={state}
      loader={loader}
      loaderInProgressChanged={handleInProgressChange}
      loaderIsRefetchingChanged={loaderIsRefetchingChanged}
      loaderLoaded={handleLoaded}
      loaderError={handleError}
      loaderFn={fetchData}
      pollIntervalInSeconds={pollIntervalInSeconds}
      registerComponentApi={registerComponentApi}
      onLoaded={onLoaded}
      transformResult={transformResult}
      structuralSharing={structuralSharing}
    />
  );
}

// --- IndexAwareDataLoader: suppresses rendering during search indexing
function IndexAwareDataLoader(props) {
  const { indexing } = useIndexerContext();
  if (indexing) {
    return null;
  }
  return <DataLoader {...props} />;
}

// Bridges the XMLUI renderer pipeline to IndexAwareDataLoader.
// Validates required props and wires the fetch/loaded/error event actions.
export const dataLoaderRenderer = createLoaderRenderer(
  "DataLoader",
  ({
    loader,
    state,
    loaderLoaded,
    loaderInProgressChanged,
    loaderIsRefetchingChanged,
    loaderError,
    registerComponentApi,
    lookupAction,
    lookupSyncCallback,
    extractValue,
  }) => {
    // --- Check for required properties — url is not required when mockData is provided
    if (!loader.props?.mockData && (!loader.props?.url || !loader.props.url.trim())) {
      throw new Error(
        "You must specify a non-empty (not whitespace-only) 'url' property for DataSource",
      );
    }

    const onFetchSource = loader.events?.fetch;
    const onFetch = onFetchSource
      ? async (context: Record<string, any>) => {
          const fn = lookupAction(onFetchSource, { eventName: "fetch", context });
          return await fn?.();
        }
      : undefined;

    return (
      <IndexAwareDataLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderIsRefetchingChanged={loaderIsRefetchingChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
        registerComponentApi={registerComponentApi}
        transformResult={lookupSyncCallback(loader.props.transformResult)}
        onLoaded={lookupAction(loader.events?.loaded, { eventName: "loaded" })}
        onError={lookupAction(loader.events?.error, { eventName: "error" })}
        onFetch={onFetch}
        structuralSharing={extractValue.asOptionalBoolean(loader.props.structuralSharing)}
      />
    );
  },
  DataLoaderMd,
);

// ---------------------------------------------------------------------------
// Private helpers (used only within this module)
// ---------------------------------------------------------------------------

/**
 * Returns the common base fields shared by every pushXsLog trace call in fetchData.
 * Avoids repeating ts/perfTs/traceId/instanceId/dataSourceId at each trace site.
 */
function traceBase(
  pendingTraceIdRef: React.MutableRefObject<string | undefined>,
  instanceIdRef: React.MutableRefObject<string>,
  loader: { props?: any; uid?: any },
  _xsLogMax: number,
) {
  return {
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: pendingTraceIdRef.current || getCurrentTrace(),
    instanceId: instanceIdRef.current,
    dataSourceId: (loader.props as any).id,
  };
}

/**
 * Builds a RequestInit for simple GET/POST fetches (csv, text data types).
 * Applies abortSignal and rawBody when provided.
 */
function buildSimpleFetchOptions(
  method: string,
  headers: Record<string, string>,
  abortSignal?: AbortSignal,
  rawBody?: string,
): RequestInit {
  const options: RequestInit = { method, headers };
  if (abortSignal) options.signal = abortSignal;
  if (rawBody) options.body = rawBody;
  return options;
}
