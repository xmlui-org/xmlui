import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createDraft, finishDraft } from "immer";
import type { QueryFunction } from "@tanstack/query-core/src/types";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
  TransformResultFn,
} from "../abstractions/LoaderRenderer";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import { extractParam } from "../utils/extractParam";
import { useAppContext } from "../AppContext";
import { useIsomorphicLayoutEffect, usePrevious } from "../utils/hooks";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";

/**
 * The properties of the Loader component
 */
type LoaderProps = {
  state: ContainerState;
  loader: ComponentDef;
  loaderFn: LoaderFunction;
  queryId?: readonly any[];
  pollIntervalInSeconds?: number;
  registerComponentApi?: RegisterComponentApiFn;
  onLoaded?: (...args: any[]) => void;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  transformResult?: TransformResultFn;
  structuralSharing?: boolean;
};

/**
 * This function represents the loader's job.
 */
type LoaderFunction = (abortSignal?: AbortSignal) => Promise<any>;

export function Loader({
  state,
  loader,
  loaderFn,
  queryId,
  pollIntervalInSeconds,
  registerComponentApi,
  onLoaded,
  loaderLoaded,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderError,
  transformResult,
  structuralSharing = true
}: LoaderProps) {
  const { uid } = loader;
  const appContext = useAppContext();
  const {initialized} = useApiInterceptorContext();

  // --- Rely on react-query to decide when data fetching should use the cache or when is should fetch the data from
  // --- its data source.
  // --- data: The data obtained by the query
  // --- status: Query execution status
  // --- error: Error information about the current query error (in "error" state)
  // --- refetch: The function that can be used to re-fetch the data (because of data/state changes)
  const { data, status, isFetching, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: useMemo(
      () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
      [appContext, loader.props, queryId, state, uid],
    ),
    structuralSharing,
    //we pause the loaders if the apiInterceptor is not initialized (true when the app is not using mockApi)
    enabled: initialized,
    queryFn: useCallback<QueryFunction>(
      async ({ signal }) => {
        // console.log("[Loader queryFn] Starting to fetch data...");
        try {
          const newVar: any = await loaderFn(signal);
          //console.log("[Loader queryFn] Data received:", newVar);
          if (newVar === undefined) {
            //console.log("[Loader queryFn] Data is undefined, returning null");
            return null;
          }
          return newVar;
        } catch (error) {
          //console.error("[Loader queryFn] Error fetching data:", error);
          throw error;
        }
      },
      [loaderFn],
    ),
    select: useCallback(
      (data: any) => {
        // console.log("[Loader select] Data before transform:", data);
        // console.log("[Loader select] resultSelector:", loader.props.resultSelector);
        // console.log("[Loader select] transformResult function:", !!transformResult);

        let result = data;
        const resultSelector = loader.props.resultSelector;
        if (resultSelector) {
          //console.log("[Loader select] Applying resultSelector");
          result = extractParam(
            { $response: data },
            resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`,
          );
          //console.log("[Loader select] Result after resultSelector:", result);
        }

        const finalResult = transformResult ? transformResult(result) : result;
        //console.log("[Loader select] Final result:", finalResult);
        return finalResult;
      },
      [loader.props.resultSelector, transformResult],
    ),
    retry: false,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (pollIntervalInSeconds) {
      intervalId = setInterval(() => {
        refetch();
      }, pollIntervalInSeconds * 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollIntervalInSeconds, refetch]);

  const prevData = usePrevious(data);
  const prevError = usePrevious(error);

  useIsomorphicLayoutEffect(() => {
    loaderInProgressChanged(isFetching || isLoading);
  }, [isLoading, isFetching, loaderInProgressChanged]);

  useIsomorphicLayoutEffect(() => {
    loaderIsRefetchingChanged(isRefetching);
  }, [isRefetching, loaderIsRefetchingChanged]);

  useIsomorphicLayoutEffect(() => {
    //console.log("isRefetching", isRefetching);
    //console.log("[Loader] useLayoutEffect status:", status);
    //console.log("[Loader] useLayoutEffect data:", data);
    //console.log("[Loader] useLayoutEffect prevData:", prevData);
    //console.log("[Loader] useLayoutEffect data !== prevData:", data !== prevData);

    if (status === "success" && data !== prevData) {
      //console.log("[Loader] Calling loaderLoaded with data:", data);
      loaderLoaded(data);
      //we do this to push the onLoaded callback to the next event loop.
      // It works, because useLayoutEffect will run synchronously after the render, and the onLoaded callback will have
      // access to the latest loader value
      setTimeout(() => {
        // console.log("[Loader] Calling onLoaded with data:", data);
        // console.log("[Loader] onLoaded function exists:", !!onLoaded);
        onLoaded?.(data, isRefetching);
      }, 0);
    } else if (status === "error" && error !== prevError) {
      // console.log("[Loader] Calling loaderError with error:", error);
      loaderError(error);
    }
  }, [data, error, loaderError, loaderLoaded, onLoaded, prevData, prevError, status, isRefetching]);

  useIsomorphicLayoutEffect(() => {
    return () => {
      loaderLoaded(undefined);
    };
  }, [loaderLoaded, uid]);

  useEffect(() => {
    registerComponentApi?.({
      refetch: async (options) => {
        refetch(options);
      },
      update: async (updater) => {
        const oldData = appContext.queryClient?.getQueryData(queryId!) as any[];
        if (!oldData) {
          //loader not loaded yet, we skip the update
          return;
        }
        const draft = createDraft(oldData);
        const ret = await updater(draft); //if it returns a value, we take it as the new data
        const newData = ret || finishDraft(draft);

        if (oldData.length !== newData.length) {
          throw new Error(
            "Use this method for update only. If you want to add or delete, call the addItem/deleteItem method.",
          );
        }

        appContext.queryClient?.setQueryData(queryId!, newData);
      },
      addItem: async (element: any, indexToInsert?: number) => {
        const oldData = appContext.queryClient?.getQueryData(queryId!) as any[];
        const draft = createDraft(oldData);
        if (indexToInsert === undefined) {
          draft.push(element);
        } else {
          draft.splice(indexToInsert, 0, element);
        }
        const newData = finishDraft(draft);
        appContext.queryClient?.setQueryData(queryId!, newData);
      },
      getItems: async () => {
        return data;
      },
      deleteItem: async (element: any) => {
        throw new Error("not implemented");
      },
    });
  }, [appContext.queryClient, queryId, refetch, registerComponentApi, data]);

  return null;
}
