import { useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
  TransformResultFn,
} from "../abstractions/LoaderRenderer";
import { ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
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

type LoaderProps = {
  loader: DataLoaderDef;
  state: ContainerState;
  registerComponentApi: RegisterComponentApiFn;
  onLoaded?: (...args: any[]) => void;
  onError?: (...args: any[]) => Promise<boolean>;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  transformResult?: TransformResultFn;
};

function DataLoader({
  loader,
  state,
  registerComponentApi,
  onLoaded,
  onError,
  loaderInProgressChanged,
  loaderLoaded,
  loaderError,
  transformResult,
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

  const api = useMemo(() => {
    return new RestApiProxy(appContext);
  }, [appContext]);

  const doLoad = useCallback(
    async (abortSignal?: AbortSignal, pageParams?: any) => {
      return await api.execute({
        abortSignal,
        operation: loader.props as any,
        params: {
          ...state,
          $pageParams: pageParams,
        },
        resolveBindingExpressions: true,
      });
    },
    [api, loader.props, state],
  );

  const queryId = useMemo(() => {
    return new DataLoaderQueryKeyGenerator(
      url,
      queryParams,
      appContext?.appGlobals.apiUrl,
      body,
      rawBody
    ).asKey();
  }, [appContext?.appGlobals.apiUrl, queryParams, url, body, rawBody]);

  const stateRef = useRef({ state, appContext });
  stateRef.current = { state, appContext };

  const loadingToastIdRef = useRef<string | undefined>(undefined);
  const inProgress: LoaderInProgressChangedFn = useCallback(
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

  const loaded: LoaderLoadedFn = useCallback(
    (data, pageInfo) => {
      loaderLoaded(data, pageInfo);
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

  const error: LoaderErrorFn = useCallback(
    async (error) => {
      loaderError(error);
      if (onError) {
        const result = await onError(error);
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
          $error: error,
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
      loaderLoaded={loaded}
      loaderError={error}
      loaderFn={doLoad}
      registerComponentApi={registerComponentApi}
      pollIntervalInSeconds={pollIntervalInSeconds}
      onLoaded={onLoaded}
      transformResult={transformResult}
    />
  ) : (
    <Loader
      queryId={queryId}
      key={queryId?.join("")}
      state={state}
      loader={loader}
      loaderInProgressChanged={inProgress}
      loaderLoaded={loaded}
      loaderError={error}
      loaderFn={doLoad}
      pollIntervalInSeconds={pollIntervalInSeconds}
      registerComponentApi={registerComponentApi}
      onLoaded={onLoaded}
      transformResult={transformResult}
    />
  );
}

export const DataLoaderMd = createMetadata({
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
  },
  events: {
    loaded: d("Event to trigger when the data is loaded"),
    error: d("This event fires when an error occurs while fetching data"),
  },
});

type DataLoaderDef = ComponentDef<typeof DataLoaderMd>;

export const dataLoaderRenderer = createLoaderRenderer(
  "DataLoader",
  ({
    loader,
    state,
    loaderLoaded,
    loaderInProgressChanged,
    loaderError,
    registerComponentApi,
    lookupAction,
    lookupSyncCallback,
  }) => {
    // --- Check for reuqired properties
    if (!loader.props?.url || !loader.props.url.trim()) {
      throw new Error("You must specify a non-empty (not whitespace-only) 'url' property for DataSource");
    }

    return (
      <DataLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
        registerComponentApi={registerComponentApi}
        transformResult={lookupSyncCallback(loader.props.transformResult)}
        onLoaded={lookupAction(loader.events?.loaded, { eventName: "loaded" })}
        onError={lookupAction(loader.events?.error, { eventName: "error" })}
      />
    );
  },
  DataLoaderMd,
);
