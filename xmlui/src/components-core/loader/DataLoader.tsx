import { useCallback, useEffect, useMemo, useRef } from "react";
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

type LoaderProps = {
  loader: DataLoaderDef;
  state: ContainerState;
  registerComponentApi: RegisterComponentApiFn;
  onLoaded?: (...args: any[]) => void;
  onError?: (...args: any[]) => Promise<boolean>;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  transformResult?: TransformResultFn;
  structuralSharing?: boolean;
};

function DataLoader({
  loader,
  state,
  registerComponentApi,
  onLoaded,
  onError,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderLoaded,
  loaderError,
  transformResult,
  structuralSharing = true,
}: LoaderProps) {
  const appContext = useAppContext();
  const url = extractParam(state, loader.props.url, appContext);
  const queryParamsInner = useMemo(() => {
    return extractParam(state, loader.props.queryParams, appContext);
  }, [appContext, loader.props.queryParams, state]);
  const queryParams = useShallowCompareMemoize(queryParamsInner);

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

  const doLoad = useCallback(
    async (abortSignal?: AbortSignal, pageParams?: any) => {
      // For CSV data type, handle directly rather than using RestApiProxy
      if (loader.props.dataType === "csv") {
        try {
          const method = extractParam(state, loader.props.method, appContext) || "GET";
          const headers = extractParam(state, loader.props.headers, appContext) || {};

          const fetchOptions: RequestInit = {
            method,
            headers,
          };

          if (abortSignal) {
            fetchOptions.signal = abortSignal;
          }

          if (rawBody) {
            fetchOptions.body = rawBody;
          }

          const response = await fetch(url, fetchOptions);

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
      } else if (loader.props.dataType === "sql") {
        try {
          //console.log("[SQL DataLoader] Starting SQL data load");
          // Extract SQL query from the body or rawBody
          let sqlQuery: string = "";
          let sqlParams: any[] = [];

          // Try to extract SQL query and parameters from body or rawBody
          if (body && typeof body === "object") {
            //console.log("[SQL DataLoader] Using body object:", body);
            sqlQuery = body.sql || "";
            sqlParams = body.params || [];
          } else if (rawBody) {
            //console.log("[SQL DataLoader] Using rawBody:", rawBody);
            try {
              const parsedBody = JSON.parse(rawBody);
              sqlQuery = parsedBody.sql || "";
              sqlParams = parsedBody.params || [];
            } catch (e) {
              // If rawBody is not valid JSON, use it as the SQL query
              //console.log("[SQL DataLoader] rawBody is not valid JSON, using as SQL query");
              sqlQuery = rawBody;
            }
          }

          //console.log("[SQL DataLoader] SQL Query:", sqlQuery);
          //console.log("[SQL DataLoader] SQL Params:", sqlParams);

          // If SQL query is empty, throw an error
          if (!sqlQuery) {
            //console.error("[SQL DataLoader] SQL query is empty");
            throw new Error("SQL query is required for SQL data type");
          }

          // Prepare request to /query endpoint
          const queryUrl = url || "/query";
          const method = extractParam(state, loader.props.method, appContext) || "POST";
          const headers = extractParam(state, loader.props.headers, appContext) || {
            "Content-Type": "application/json",
          };

          //console.log("[SQL DataLoader] Request URL:", queryUrl);
          //console.log("[SQL DataLoader] Request Method:", method);
          //console.log("[SQL DataLoader] Request Headers:", headers);

          const requestBody = JSON.stringify({
            sql: sqlQuery,
            params: sqlParams,
          });

          //console.log("[SQL DataLoader] Request Body:", requestBody);

          const fetchOptions: RequestInit = {
            method,
            headers,
            body: requestBody,
          };

          if (abortSignal) {
            fetchOptions.signal = abortSignal;
          }

          //console.log("[SQL DataLoader] Sending fetch request...");
          const response = await fetch(queryUrl, fetchOptions);
          //console.log("[SQL DataLoader] Response status:", response.status, response.statusText);

          if (!response.ok) {
            console.error(
              "[SQL DataLoader] Failed response:",
              response.status,
              response.statusText,
            );
            throw new Error(
              `Failed to execute SQL query: ${response.status} ${response.statusText}`,
            );
          }

          // Parse response as JSON
          const jsonResult = await response.json();
          //console.log("[SQL DataLoader] Response data:", jsonResult);

          // Check the structure of the response
          if (jsonResult && typeof jsonResult === "object") {
            //console.log("[SQL DataLoader] Response keys:", Object.keys(jsonResult));

            // If response has rows property, check if it's in expected format
            if (jsonResult.rows) {
              //console.log("[SQL DataLoader] Response has 'rows' property:", jsonResult.rows);
              //console.log("[SQL DataLoader] rows is array:", Array.isArray(jsonResult.rows));
              // if (Array.isArray(jsonResult.rows) && jsonResult.rows.length > 0) {
              //   console.log("[SQL DataLoader] First row:", jsonResult.rows[0]);
              // }

              // Return rows directly for easier table rendering
              return jsonResult.rows;
            }

            // Check for other common SQL result formats
            if (jsonResult.results) {
              //console.log("[SQL DataLoader] Response has 'results' property");
              return jsonResult.results;
            }
          }

          return jsonResult;
        } catch (error) {
          console.error("Error executing SQL query:", error);
          throw error;
        }
      } else {
        return await api.execute({
          abortSignal,
          operation: loader.props as any,
          params: {
            ...state,
            $pageParams: pageParams,
          },
          resolveBindingExpressions: true,
        });
      }
    },
    [api, loader.props, state, url, body, rawBody, appContext],
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

  const loadingToastIdRef = useRef<string | undefined>(undefined);
  const inProgress: LoaderInProgressChangedFn = useCallback(
    (isInProgress) => {
      //console.log("[DataLoader] inProgress() called with isInProgress:", isInProgress);
      //console.log("[DataLoader] dataType:", loader.props.dataType);

      loaderInProgressChanged(isInProgress);
      //console.log("[DataLoader] After loaderInProgressChanged() call");

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
      //console.log("[DataLoader] inProgress() completed");
    },
    [loader.props.inProgressNotificationMessage, loaderInProgressChanged],
  );

  const loaded: LoaderLoadedFn = useCallback(
    (data, pageInfo) => {
      // console.log("[DataLoader] loaded() called with data:", data);
      // console.log("[DataLoader] loaded() pageInfo:", pageInfo);
      // console.log("[DataLoader] loader.props.dataType:", loader.props.dataType);

      // if (loader.props.dataType === "sql") {
      //   console.log("[SQL DataLoader] Processing SQL result data in loaded()");
      //   console.log("[SQL DataLoader] Data type:", typeof data);
      //   console.log("[SQL DataLoader] Is array:", Array.isArray(data));
      //   if (data && typeof data === 'object') {
      //     console.log("[SQL DataLoader] Data keys:", Object.keys(data));
      //   }
      // }

      loaderLoaded(data, pageInfo);
      // console.log("[DataLoader] After loaderLoaded() call");

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
      //console.log("[DataLoader] loaded() completed");
    },
    [loader.props.completedNotificationMessage, loaderLoaded],
  );

  const error: LoaderErrorFn = useCallback(
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

  const pollIntervalInSeconds = extractParam(state, loader.props.pollIntervalInSeconds, appContext);
  return hasPaging ? (
    <PageableLoader
      queryId={queryId}
      key={queryId?.join("")}
      state={state}
      loader={loader}
      loaderInProgressChanged={inProgress}
      loaderIsRefetchingChanged={loaderIsRefetchingChanged}
      loaderLoaded={loaded}
      loaderError={error}
      loaderFn={doLoad}
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
      loaderInProgressChanged={inProgress}
      loaderIsRefetchingChanged={loaderIsRefetchingChanged}
      loaderLoaded={loaded}
      loaderError={error}
      loaderFn={doLoad}
      pollIntervalInSeconds={pollIntervalInSeconds}
      registerComponentApi={registerComponentApi}
      onLoaded={onLoaded}
      transformResult={transformResult}
      structuralSharing={structuralSharing}
    />
  );
}

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
    pollIntervalInSeconds: d("The interval in seconds to poll the API for refreshing data"),
    resultSelector: d("An expression to extract the result from the response"),
    prevPageSelector: d("An expression to extract the previous page parameter from the response"),
    nextPageSelector: d("An expression to extract the next page parameter from the response"),
    inProgressNotificationMessage: d("The message to show when the loader is in progress"),
    completedNotificationMessage: d("The message to show when the loader completes"),
    errorNotificationMessage: d("The message to show when an error occurs"),
    transformResult: d("Function for transforming the datasource result"),
    dataType: d("Type of data to fetch (default: json, or csv, or sql)"),
    structuralSharing: d("Whether to use structural sharing for the data"),
  },
  events: {
    loaded: d("Event to trigger when the data is loaded"),
    error: d("This event fires when an error occurs while fetching data"),
  },
});

type DataLoaderDef = ComponentDef<typeof DataLoaderMd>;

function IndexAwareDataLoader(props) {
  const { indexing } = useIndexerContext();
  if (indexing) {
    return null;
  }
  return <DataLoader {...props} />;
}

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
    // --- Check for required properties
    if (!loader.props?.url || !loader.props.url.trim()) {
      throw new Error(
        "You must specify a non-empty (not whitespace-only) 'url' property for DataSource",
      );
    }

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
        structuralSharing={extractValue.asOptionalBoolean(loader.props.structuralSharing)}
      />
    );
  },
  DataLoaderMd,
);
