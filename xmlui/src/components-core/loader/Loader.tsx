import {useCallback, useEffect, useLayoutEffect, useMemo} from "react";
import { useQuery } from "@tanstack/react-query";

import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn, TransformResultFn,
} from "@components-core/abstractions/LoaderRenderer";
import type { ComponentDef } from "@abstractions/ComponentDefs";

import { extractParam } from "@components-core/utils/extractParam";
import { createDraft, finishDraft } from "immer";
import { useAppContext } from "@components-core/AppContext";
import { usePrevious } from "@components-core/utils/hooks";
import type {QueryFunction} from "@tanstack/query-core/src/types";
import { flushSync } from "react-dom";

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
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  transformResult?: TransformResultFn;
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
  loaderError,
  transformResult
}: LoaderProps) {
  const { uid } = loader;
  const appContext = useAppContext();

  // --- Rely on react-query to decide when data fetching should use the cache or when is should fetch the data from
  // --- its data source.
  // --- data: The data obtained by the query
  // --- status: Query execution status
  // --- error: Error information about the current query error (in "error" state)
  // --- refetch: The function that can be used to re-fetch the data (because of data/state changes)
  const { data, status, isFetching, error, refetch } = useQuery(
      {
        queryKey: useMemo(()=>queryId ? queryId : [uid, extractParam(state, loader.props, appContext)], [appContext, loader.props, queryId, state, uid]),
        queryFn: useCallback<QueryFunction>(async ({ signal }) => {
          const newVar: any = await loaderFn(signal);
          if (newVar === undefined) {
            return null;
          }
          return newVar;
        }, [loaderFn]),
        select: useCallback((data: any)=>{
          let result = data;
          const resultSelector = loader.props.resultSelector;
          if (resultSelector) {
            result = extractParam(
                { $response: data },
                resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`
            );
          }
          return transformResult ? transformResult(result) : result;
        }, [loader.props.resultSelector, transformResult]),
        retry: false
      }
  );

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

  useLayoutEffect(() => {
    loaderInProgressChanged(isFetching);
  }, [isFetching, loaderInProgressChanged]);


  useLayoutEffect(() => {
    if (status === "success" && data !== prevData) {
      loaderLoaded(data);
      //we do this to push the onLoaded callback to the next event loop.
      // It works, because useLayoutEffect will run synchronously after the render, and the onLoaded callback will have
      // access to the latest loader value
      setTimeout(()=>{
        onLoaded?.(data);
      }, 0);
    } else if (status === "error" && error !== prevError) {
      loaderError(error);
    }
  }, [data, error, loaderError, loaderLoaded, onLoaded, prevData, prevError, status]);

  useLayoutEffect(() => {
    return () => {
      loaderLoaded(undefined);
    };
  }, [loaderLoaded, uid]);

  useEffect(() => {
    registerComponentApi?.({
      refetch,
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
            "Use this method for update only. If you want to add or delete, call the addItem/deleteItem method."
          );
        }
        // console.log("BEFORE: ", appContext.queryClient?.getQueryData(queryId!));

        appContext.queryClient?.setQueryData(queryId!, newData);

        // console.log("AFTER: ", appContext.queryClient?.getQueryData(queryId!));
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
