import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import produce, { createDraft, finishDraft } from "immer";
import type { QueryFunction } from "@tanstack/query-core/src/types";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../rendering/ContainerWrapper";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
  TransformResultFn,
} from "../abstractions/LoaderRenderer";
import { extractParam } from "../utils/extractParam";
import { useAppContext } from "../AppContext";
import { usePrevious } from "../utils/hooks";

export type LoaderDirections = "FORWARD" | "BACKWARD" | "BIDIRECTIONAL";

type LoaderProps = {
  state: ContainerState;
  loader: ComponentDef;
  loaderFn: (abortSignal: AbortSignal | undefined, pageParam: string) => Promise<any>;
  queryId?: readonly any[];
  registerComponentApi: RegisterComponentApiFn;
  pollIntervalInSeconds?: number;
  onLoaded?: (...args: any[]) => void;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderIsRefetchingChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
  transformResult?: TransformResultFn;
  structuralSharing?: boolean;
};

export function PageableLoader({
  state,
  loader,
  loaderFn,
  queryId,
  registerComponentApi,
  pollIntervalInSeconds,
  onLoaded,
  loaderInProgressChanged,
  loaderIsRefetchingChanged,
  loaderLoaded,
  loaderError,
  transformResult,
  structuralSharing = true,
}: LoaderProps) {
  const { uid } = loader;
  const appContext = useAppContext();
  const queryKey = useMemo(
    () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
    [appContext, loader.props, queryId, state, uid],
  );
  const thizRef = useRef(queryKey);

  const getPreviousPageParam = useCallback(
    (firstPage: any) => {
      let prevPageParam = undefined;
      const prevPageSelector = loader.props.prevPageSelector;
      if (prevPageSelector) {
        prevPageParam = extractParam(
          { $response: firstPage.filter((item) => !item._optimisticValue) },
          prevPageSelector.startsWith("{") ? prevPageSelector : `{$response.${prevPageSelector}}`,
        );
      }
      if (!prevPageParam) {
        return undefined;
      }
      return {
        prevPageParam: prevPageParam,
      };
    },
    [loader.props.prevPageSelector],
  );
  const getNextPageParam = useCallback(
    (lastPage: any) => {
      let nextPageParam = undefined;
      const nextPageSelector = loader.props.nextPageSelector;
      if (nextPageSelector) {
        nextPageParam = extractParam(
          { $response: lastPage },
          nextPageSelector.startsWith("{") ? nextPageSelector : `{$response.${nextPageSelector}}`,
        );
      }
      if (!nextPageParam) {
        return undefined;
      }
      return {
        nextPageParam: nextPageParam,
      };
    },
    [loader.props.nextPageSelector],
  );

  // useEffect(()=>{
  //   console.log("TRANSFORM RESULT CHANGED", transformResult);
  // }, [transformResult]);
  const {
    data,
    status,
    error,
    hasNextPage,
    isFetchingNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isFetching,
    refetch,
    fetchPreviousPage,
    fetchNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey,
    queryFn: useCallback<QueryFunction>(
      async ({ signal, pageParam }) => {
        return await loaderFn(signal, pageParam);
      },
      [loaderFn],
    ),
    structuralSharing,
    select: useCallback(
      (data: any) => {
        let result = [];
        if (data) {
          result = data.pages.flatMap((d) => d);
        }
        const resultSelector = loader.props.resultSelector;
        if (resultSelector) {
          result = extractParam(
            { $response: result },
            resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`,
          );
        }
        return transformResult ? transformResult(result) : result;
      },
      [loader.props.resultSelector, transformResult],
    ),
    getPreviousPageParam:
      loader.props.prevPageSelector === undefined ? undefined : getPreviousPageParam,
    getNextPageParam: loader.props.nextPageSelector === undefined ? undefined : getNextPageParam,
  });

  //TODO revisit
  // //we clear all the pages, except the last one (it's suitable for the chat app, but for the other direction we'll have to leave the first page)
  // // otherwise it'll keep it in the cache, and refetch all the pages when you come back
  // //  see more here: https://stackoverflow.com/questions/71286123/reactquery-useinfinitequery-refetching-issue
  // //  and here: https://tanstack.com/query/latest/docs/react/guides/infinite-queries?from=reactQueryV3&original=https%3A%2F%2Ftanstack.com%2Fquery%2Fv3%2Fdocs%2Fguides%2Finfinite-queries#what-happens-when-an-infinite-query-needs-to-be-refetched
  useEffect(() => {
    const queryKey = thizRef.current;
    return () => {
      appContext.queryClient?.cancelQueries(queryKey);
      appContext.queryClient?.setQueryData(queryKey, (old) => {
        if (!old) {
          return old;
        }
        return produce(old, (draft: any) => {
          draft.pages = draft.pages.length ? [draft.pages[draft.pages.length - 1]] : [];
          // draft.pageParams = draft.pageParams.length ? [draft.pageParams[draft.pageParams.length - 1]] : [];
          draft.pageParams = [];
        });
      });
      loaderLoaded(undefined, undefined);
    };
  }, [appContext.queryClient, loaderLoaded, uid]);

  const prevData = usePrevious(data);
  const prevError = usePrevious(error);

  useLayoutEffect(() => {
    loaderInProgressChanged(isFetching); //TODO isFetchingPrevPage / nextPage
  }, [isFetching, loaderInProgressChanged]);

  useLayoutEffect(() => {
    loaderIsRefetchingChanged(isRefetching); //TODO isFetchingPrevPage / nextPage
  }, [isRefetching, loaderIsRefetchingChanged]);

  const pageInfo = useMemo(() => {
    return {
      hasPrevPage: hasPreviousPage,
      isFetchingPrevPage: isFetchingPreviousPage,
      hasNextPage,
      isFetchingNextPage,
    };
  }, [hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage]);

  const prevPageInfo = usePrevious(pageInfo);

  useLayoutEffect(() => {
    // console.log("data changed", {
    //   status,
    //   data,
    //   pageInfo,
    // });
    if (status === "success" && (prevData !== data || prevPageInfo !== pageInfo)) {
      loaderLoaded(data, pageInfo);
      //we do this to push the onLoaded callback to the next event loop.
      // It works, because useLayoutEffect will run synchronously after the render, and the onLoaded callback will have
      // access to the latest loader value
      setTimeout(() => {
        onLoaded?.(data, isRefetching);
      }, 0);
    } else if (status === "error" && prevError !== error) {
      loaderError(error);
    }
  }, [
    data,
    error,
    loaderError,
    loaderLoaded,
    onLoaded,
    pageInfo,
    prevData,
    prevError,
    prevPageInfo,
    status,
  ]);

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

  const fetchPrevPage = useCallback(() => {
    return fetchPreviousPage();
  }, [fetchPreviousPage]);

  const stableFetchNextPage = useCallback(() => {
    return fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    registerComponentApi({
      fetchPrevPage,
      fetchNextPage: stableFetchNextPage,
      refetch: async (options) => {
        refetch(options);
      },
      update: async (updater) => {
        const oldData = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<any[]>;
        if (!oldData) {
          //loader not loaded yet, we skip the update
          return;
        }
        const originalFlatItems = oldData.pages.flatMap((d) => d);

        const draft = createDraft(oldData);
        const flatItems = [];
        for (let i = 0; i < draft.pages.length; i++) {
          const page = draft.pages[i];
          await updater(page);
          flatItems.push(...page);
        }

        if (flatItems.length !== originalFlatItems.length) {
          throw new Error(
            "Use this method for update only. If you want to add or delete, call the addItem/deleteItem method.",
          );
        }
        const newData = finishDraft(draft);

        // console.log("BEFORE: ", appContext.queryClient?.getQueryData(queryId!));

        appContext.queryClient?.setQueryData(queryId!, newData);

        // console.log("AFTER: ", appContext.queryClient?.getQueryData(queryId!));
      },
      addItem: async (element: any, indexToInsert?: number) => {
        const oldData = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<any[]>;
        const draft = createDraft(oldData);

        if (indexToInsert === undefined) {
          draft.pages[draft.pages.length - 1].push(element);
        } else {
          throw new Error("not implemented");
          // TODO is should be something like this
          // //find the pageIndex and itemIndex in that page
          // let pageIndex = -1;
          // let itemIndex = -1;
          // let i = 0;
          // oldData.pages.forEach((page, index)=>{
          //   i += page.result.length;
          //   if(i >= indexToInsert){
          //     pageIndex = index;
          //     itemIndex = i - indexToInsert;
          //     return;
          //   }
          // });
          // draft.pages[pageIndex].result.splice(itemIndex, 0, element);
        }

        const newData = finishDraft(draft);
        appContext.queryClient?.setQueryData(queryId!, newData);
      },
      getItems: () => {
        return data;
      },
      deleteItem: async (element: any) => {
        throw new Error("not implemented");
      },
    });
  }, [
    appContext.queryClient,
    fetchPrevPage,
    data,
    loader.uid,
    queryId,
    queryKey,
    refetch,
    registerComponentApi,
    stableFetchNextPage,
  ]);

  return null;
}
