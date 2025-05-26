import { useCallback, useEffect, useMemo, useState } from "react";
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

// Reactivity logging check
const logReactivity = typeof window !== 'undefined' && (window as any).logReactivity;

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
  // Log every render of Loader
  if (logReactivity) {
    console.log(`[Loader Render] DataSource '${loader.props.id || loader.uid}' status:`, loader);
  }
  const { uid } = loader;
  const appContext = useAppContext();

  // Extract and log the resolved URL for each render
  const resolvedUrl = useMemo(() => {
    try {
      const url = extractParam(state, loader.props.url, appContext);
      if (logReactivity) {
        console.log(`[URL Resolution] DataSource '${loader.props.id || loader.uid}' resolved URL:`, url);
      }
      return url;
    } catch (error) {
      if (logReactivity) {
        console.warn(`[URL Resolution] DataSource '${loader.props.id || loader.uid}' URL resolution failed:`, error);
      }
      return loader.props.url;
    }
  }, [state, loader.props.url, appContext, loader.props.id, loader.uid]);

  const queryKey = useMemo(
    () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
    [appContext, loader.props, queryId, state, uid],
  );
  if (logReactivity) {
    console.log(`[Loader QueryKey] DataSource '${loader.props.id || loader.uid}' queryKey:`, queryKey);
  }
  
  // Track query key changes to detect what triggers API calls
  const prevQueryKey = usePrevious(queryKey);
  useEffect(() => {
    if (prevQueryKey && JSON.stringify(prevQueryKey) !== JSON.stringify(queryKey)) {
      if (logReactivity) {
        console.log(`[Reactivity Trigger] DataSource '${loader.props.id || loader.uid}' queryKey changed:`);
        console.log(`  Previous:`, prevQueryKey);
        console.log(`  Current:`, queryKey);
        console.log(`  This will trigger a new API call to:`, resolvedUrl);
      }
    }
  }, [queryKey, prevQueryKey, loader.props.id, loader.uid, resolvedUrl]);

  // --- Rely on react-query to decide when data fetching should use the cache or when is should fetch the data from
  // --- its data source.
  // --- data: The data obtained by the query
  // --- status: Query execution status
  // --- error: Error information about the current query error (in "error" state)
  // --- refetch: The function that can be used to re-fetch the data (because of data/state changes)
  const { data, status, isFetching, error, refetch, isRefetching } = useQuery({
    queryKey,
    structuralSharing,
    queryFn: useCallback<QueryFunction>(
      async ({ signal }) => {
        // Enhanced API call instrumentation
        const requestId = `${loader.props.id || loader.uid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now();
        
        if (logReactivity) {
          console.log(`[API Call Start] DataSource '${loader.props.id || loader.uid}' (${requestId})`);
          console.log(`  URL: ${resolvedUrl}`);
          console.log(`  Method: ${loader.props.method || 'GET'}`);
          console.log(`  Triggered by queryKey:`, queryKey);
          console.log(`  Timestamp: ${new Date().toISOString()}`);
        }
        
        try {
          const newVar: any = await loaderFn(signal);
          const duration = performance.now() - startTime;
          
          if (logReactivity) {
            console.log(`[API Call Success] DataSource '${loader.props.id || loader.uid}' (${requestId})`);
            console.log(`  Duration: ${duration.toFixed(2)}ms`);
            console.log(`  Response size: ${JSON.stringify(newVar).length} chars`);
            console.log(`  Data:`, newVar);
          }
          
          if (newVar === undefined) {
            if (logReactivity) {
              console.log(`[API Call] DataSource '${loader.props.id || loader.uid}' returned undefined, converting to null`);
            }
            return null;
          }
          return newVar;
        } catch (error) {
          const duration = performance.now() - startTime;
          
          if (logReactivity) {
            console.error(`[API Call Error] DataSource '${loader.props.id || loader.uid}' (${requestId})`);
            console.error(`  Duration: ${duration.toFixed(2)}ms`);
            console.error(`  Error:`, error);
          }
          throw error;
        }
      },
      [loaderFn, loader.props.id, loader.uid, resolvedUrl, queryKey],
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

  // Log status and data for each DataSource on every render
  if (logReactivity) {
    console.log(`[Loader Query] DataSource '${loader.props.id || loader.uid}' status: ${status}, data:`, data);
  }

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
    loaderInProgressChanged(isFetching);
  }, [isFetching, loaderInProgressChanged]);

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
      // Instrumentation for DataSource reactivity
      if (logReactivity) {
        console.log(
          `[DataSource Reactivity Debug] DataSource '${loader.props.id || loader.uid}' loaded new data:`,
          data
        );
        // New: log every call to loaderLoaded
        console.log(
          `[DataSource Reactivity Debug] DataSource '${loader.props.id || loader.uid}' loaderLoaded called with:`,
          data
        );
      }
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
