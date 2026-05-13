import { useCallback, useEffect, useMemo, useRef } from "react";
import type { InfiniteData, QueryFunction } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import produce, { createDraft, finishDraft } from "immer";

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
import { useIsomorphicLayoutEffect, usePrevious } from "../utils/hooks";

export type LoaderDirections = "FORWARD" | "BACKWARD" | "BIDIRECTIONAL";

// Shared state and callback contract for infinite, page-aware loaders.
type PageableLoaderProps = {
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
}: PageableLoaderProps) {
  const { uid } = loader;
  const appContext = useAppContext();
  const queryKey = useMemo(
    () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
    [appContext, loader.props, queryId, state, uid],
  );
  const queryKeyRef = useRef(queryKey);

  const getPreviousPageParam = useCallback(
    (firstPage: any) => {
      const prevPageSelector = loader.props.prevPageSelector;
      const committedItems = firstPage.filter((item) => !item._optimisticValue);
      const prevPageParam = extractPageParam(committedItems, prevPageSelector);

      if (!prevPageParam) {
        return undefined;
      }
      return {
        prevPageParam,
      };
    },
    [loader.props.prevPageSelector],
  );

  const getNextPageParam = useCallback(
    (lastPage: any) => {
      const nextPageSelector = loader.props.nextPageSelector;
      const nextPageParam = extractPageParam(lastPage, nextPageSelector);

      if (!nextPageParam) {
        return undefined;
      }
      return {
        nextPageParam,
      };
    },
    [loader.props.nextPageSelector],
  );

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

  // Keep only the most recent cached page on unmount to avoid refetching the full page history.
  useEffect(() => {
    const queryKey = queryKeyRef.current;
    return () => {
      void appContext.queryClient?.cancelQueries(queryKey);
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

  useIsomorphicLayoutEffect(() => {
    loaderInProgressChanged(isFetching);
  }, [isFetching, loaderInProgressChanged]);

  useIsomorphicLayoutEffect(() => {
    loaderIsRefetchingChanged(isRefetching);
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

  useIsomorphicLayoutEffect(() => {
    const hasNewDataOrPageState =
      status === "success" && (prevData !== data || prevPageInfo !== pageInfo);
    const hasNewError = status === "error" && prevError !== error;

    if (hasNewDataOrPageState) {
      loaderLoaded(data, pageInfo);

      // Run after layout effects so markup handlers can read the updated loader state.
      setTimeout(() => {
        onLoaded?.(data, isRefetching);
      }, 0);
    } else if (hasNewError) {
      loaderError(error);
    }
  }, [
    data,
    error,
    isRefetching,
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
        void refetch();
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

  const fetchNextPageFromApi = useCallback(() => {
    return fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    registerComponentApi({
      fetchPrevPage,
      fetchNextPage: fetchNextPageFromApi,
      refetch: (options) => {
        void refetch(options);
      },
      update: async (updater) => {
        const currentPages = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<any[]>;
        if (!currentPages) {
          // Skip cache updates until the loader has produced data.
          return;
        }
        const originalFlatItems = currentPages.pages.flatMap((d) => d);

        const draft = createDraft(currentPages);
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
      addItem: (element: any, indexToInsert?: number) => {
        const currentPages = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<any[]>;
        const draft = createDraft(currentPages);

        if (indexToInsert === undefined) {
          draft.pages[draft.pages.length - 1].push(element);
        } else {
          throw new Error("not implemented");
          // TODO: find the pageIndex and itemIndex in that page.
          // let pageIndex = -1;
          // let itemIndex = -1;
          // let i = 0;
          // currentPages.pages.forEach((page, index)=>{
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
      deleteItem: (element: any) => {
        throw new Error("not implemented");
      },
    });
  }, [
    appContext.queryClient,
    fetchPrevPage,
    data,
    fetchNextPageFromApi,
    loader.uid,
    queryId,
    queryKey,
    refetch,
    registerComponentApi,
  ]);

  return null;
}

function extractPageParam(response: any, selector: string | undefined) {
  if (!selector) {
    return undefined;
  }

  const selectorExpression = selector.startsWith("{") ? selector : `{$response.${selector}}`;
  return extractParam({ $response: response }, selectorExpression);
}
