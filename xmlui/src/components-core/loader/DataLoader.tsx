import {useCallback, useMemo, useRef} from "react";
import toast from "react-hot-toast";

import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "@components-core/abstractions/LoaderRenderer";
import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type { ApiOperationDef } from "@components-core/RestApiProxy";
import type { LoaderDirections } from "@components-core/loader/PageableLoader";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import { createLoaderRenderer } from "@components-core/renderers";
import RestApiProxy from "@components-core/RestApiProxy";
import { extractParam } from "@components-core/utils/extractParam";
import { DataLoaderQueryKeyGenerator } from "@components-core/utils/DataLoaderQueryKeyGenerator";
import { PageableLoader } from "@components-core/loader/PageableLoader";
import { Loader } from "@components-core/loader/Loader";
import { useAppContext } from "@components-core/AppContext";
import { desc } from "@components-core/descriptorHelper";
import { useShallowCompareMemoize } from "@components-core/utils/hooks";

type LoaderProps = {
  loader: DataLoaderDef;
  state: ContainerState;
  registerComponentApi: RegisterComponentApiFn;
  onLoaded?: (...args: any[]) => void;
  onError?: (...args: any[]) => Promise<boolean>;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
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
}: LoaderProps) {
  const appContext = useAppContext();
  const url = extractParam(state, loader.props.url, appContext);
  const debounceTimeInMs = extractParam(state, loader.props.debounceTimeInMs, appContext);
  const queryParamsInner = useMemo(() => {
    return extractParam(state, loader.props.queryParams, appContext);
  }, [appContext, loader.props.queryParams, state]);
  const queryParams = useShallowCompareMemoize(queryParamsInner);

  const pagingDirection: LoaderDirections | null = useMemo(() => {
    if (loader.props.prevPageParamSelector && loader.props.nextPageParamSelector) {
      return "BIDIRECTIONAL";
    }
    if (loader.props.prevPageParamSelector) {
      return "BACKWARD";
    }
    if (loader.props.nextPageParamSelector) {
      return "FORWARD";
    }
    return null;
  }, [loader.props.nextPageParamSelector, loader.props.prevPageParamSelector]);

  const hasPaging = pagingDirection !== null;

  const api = useMemo(() => {
    return new RestApiProxy(appContext);
  }, [appContext]);

  const doLoad = async (abortSignal?: AbortSignal, pageParams?: any) => {
    const response = await api.execute({
      abortSignal,
      operation: loader.props,
      params: {
        ...state,
        $pageParams: pageParams,
      },
      resolveBindingExpressions: true,
    });
    let result = response;
    const resultSelector = loader.props.resultSelector;
    if (resultSelector) {
      result = extractParam(
        { $response: response },
        resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`
      );
    }
    let prevPageParam = undefined;
    const prevPageParamSelector = loader.props.prevPageParamSelector;
    if (prevPageParamSelector) {
      prevPageParam = extractParam(
        { $response: response },
        prevPageParamSelector.startsWith("{") ? prevPageParamSelector : `{$response.${prevPageParamSelector}}`
      );
    }
    let nextPageParam = undefined;
    const nextPageParamSelector = loader.props.nextPageParamSelector;
    if (nextPageParamSelector) {
      nextPageParam = extractParam(
        { $response: response },
        nextPageParamSelector.startsWith("{") ? nextPageParamSelector : `{$response.${nextPageParamSelector}}`
      );
    }
    if (hasPaging) {
      return {
        result,
        prevPageParam,
        nextPageParam,
      };
    }
    return result;
  };

  const queryId = useMemo(() => {
    return new DataLoaderQueryKeyGenerator(url, queryParams).asKey();
  }, [queryParams, url]);

  const stateRef = useRef({ state, appContext });
  stateRef.current = { state, appContext };

  const loadingToastIdRef = useRef<string | undefined>(undefined);
  const inProgress: LoaderInProgressChangedFn = useCallback(
    (isInProgress) => {
      loaderInProgressChanged(isInProgress);
      const inProgressMessage = extractParam(
        stateRef.current.state,
        loader.props.inProgressNotificationMessage,
        stateRef.current.appContext
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
    [loader.props.inProgressNotificationMessage, loaderInProgressChanged]
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
        stateRef.current.appContext
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
    [loader.props.completedNotificationMessage, loaderLoaded]
  );

  const error: LoaderErrorFn = useCallback(
    async (error) => {
      loaderError(error);
      if(onError){
        const result = await onError(error);
        if(result === false) {
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
        stateRef.current.appContext
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
    [appContext, loader.props.errorNotificationMessage, loaderError, onError]
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
      direction={pagingDirection}
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
    />
  );
}

interface DataLoaderDef extends ComponentDef<"DataLoader"> {
  props: ApiOperationDef & {
    pollIntervalInSeconds?: number;
    inProgressNotificationMessage?: string;
    completedNotificationMessage?: string;
    errorNotificationMessage?: string;
    resultSelector?: string;
    prevPageParamSelector?: string;
    nextPageParamSelector?: string;
    debounceTimeInMs?: string;
  };
  events: {
    loaded?: string;
    error?: string;
  };
}

const metadata: ComponentDescriptor<DataLoaderDef> = {
  displayName: "DataLoader",
  description: "This component manages data fetching from a web API",
  props: {
    method: desc("The HTTP method to use"),
    url: desc("The URL to fetch data from"),
    rawBody: desc("The raw body of the request"),
    body: desc("The body of the request to be sent as JSON"),
    queryParams: desc("Query parameters to send with the request"),
    headers: desc("Headers to send with the request"),
    pollIntervalInSeconds: desc("The interval in seconds to poll the API for refreshing data"),
    resultSelector: desc("An expression to extract the result from the response"),
    prevPageParamSelector: desc("An expression to extract the previous page parameter from the response"),
    nextPageParamSelector: desc("An expression to extract the next page parameter from the response"),
  },
  events: {
    loaded: desc("Event to trigger when the data is loaded"),
  },
};

export const dataLoaderRenderer = createLoaderRenderer<DataLoaderDef>(
  "DataLoader",
  ({ loader, state, loaderLoaded, loaderInProgressChanged, loaderError, registerComponentApi, lookupAction }) => {
    return (
      <DataLoader
        loader={loader}
        state={state}
        loaderInProgressChanged={loaderInProgressChanged}
        loaderLoaded={loaderLoaded}
        loaderError={loaderError}
        registerComponentApi={registerComponentApi}
        onLoaded={lookupAction(loader.events?.loaded, { eventName: "loaded" })}
        onError={lookupAction(loader.events?.error, { eventName: "error" })}
      />
    );
  },
  metadata
);
