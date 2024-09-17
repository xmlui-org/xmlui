import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import produce, { createDraft, finishDraft } from "immer";

import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type { ContainerState } from "@components-core/container/ContainerComponentDef";
import type {
  LoaderErrorFn,
  LoaderInProgressChangedFn,
  LoaderLoadedFn,
} from "@components-core/abstractions/LoaderRenderer";
import type { ComponentDefNew } from "@abstractions/ComponentDefs";

import { extractParam } from "@components-core/utils/extractParam";
import { useAppContext } from "@components-core/AppContext";
import { usePrevious } from "@components-core/utils/hooks";

export type LoaderDirections = "FORWARD" | "BACKWARD" | "BIDIRECTIONAL";

type LoaderProps = {
  state: ContainerState;
  loader: ComponentDefNew;
  loaderFn: (abortSignal: AbortSignal | undefined, pageParam: string) => Promise<any>;
  queryId?: readonly any[];
  direction?: LoaderDirections;
  registerComponentApi: RegisterComponentApiFn;
  pollIntervalInSeconds?: number;
  onLoaded?: (...args: any[]) => void;
  loaderInProgressChanged: LoaderInProgressChangedFn;
  loaderLoaded: LoaderLoadedFn;
  loaderError: LoaderErrorFn;
};

export function PageableLoader({
  state,
  loader,
  loaderFn,
  queryId,
  direction = "BACKWARD",
  registerComponentApi,
  pollIntervalInSeconds,
  onLoaded,
  loaderInProgressChanged,
  loaderLoaded,
  loaderError,
}: LoaderProps) {
  const { uid } = loader;
  const appContext = useAppContext();
  const queryKey = useMemo(
    () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
    [appContext, loader.props, queryId, state, uid]
  );
  const thizRef = useRef(queryKey);

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
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      // console.log("FETCHING PAGE: ", pageParam);
      const { result, prevPageParam, nextPageParam } = await loaderFn(signal, pageParam);
      // console.log("fetched PAGE: ", { result, prevPageParam, nextPageParam });
      return { result, prevPageParam, nextPageParam };
    },
    getPreviousPageParam:
      direction === "BACKWARD" || direction === "BIDIRECTIONAL"
        ? (firstPage, a) => {
            if (!firstPage.prevPageParam) {
              return undefined;
            }
            // console.log("getting previous page param", { firstPage, a });
            return {
              prevPageParam: firstPage.prevPageParam,
            };
          }
        : undefined,
    getNextPageParam:
      direction === "FORWARD" || direction === "BIDIRECTIONAL"
        ? (lastPage) => {
            if (!lastPage.nextPageParam) {
              return undefined;
            }
            return {
              nextPageParam: lastPage.nextPageParam,
            };
          }
        : undefined,
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

  const flatData = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.pages.flatMap((d) => d.result);
  }, [data]);

  const prevData = usePrevious(data);
  const prevError = usePrevious(error);

  useLayoutEffect(() => {
    loaderInProgressChanged(isFetching); //TODO isFetchingPrevPage / nextPage
  }, [isFetching, loaderInProgressChanged]);

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
    //   flatData,
    //   pageInfo,
    // });
    if (status === "success" && (prevData !== data || prevPageInfo !== pageInfo)) {
      loaderLoaded(flatData, pageInfo);
      onLoaded?.(flatData);
    } else if (status === "error" && prevError !== error) {
      loaderError(error);
    }
  }, [
    appContext,
    data,
    error,
    flatData,
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
      refetch,
      update: async (updater) => {
        const oldData = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<{
          result: any[];
          prevPageParam: any;
          nextPageParam: any;
        }>;
        if (!oldData) {
          //loader not loaded yet, we skip the update
          return;
        }
        const originalFlatItems = oldData.pages.flatMap((d) => d.result);

        const draft = createDraft(oldData);
        const flatItems = [];
        for (let i = 0; i < draft.pages.length; i++) {
          const page = draft.pages[i];
          await updater(page.result);
          flatItems.push(...page.result);
        }

        if (flatItems.length !== originalFlatItems.length) {
          throw new Error(
            "Use this method for update only. If you want to add or delete, call the addItem/deleteItem method."
          );
        }
        const newData = finishDraft(draft);

        // console.log("BEFORE: ", appContext.queryClient?.getQueryData(queryId!));

        appContext.queryClient?.setQueryData(queryId!, newData);

        // console.log("AFTER: ", appContext.queryClient?.getQueryData(queryId!));
      },
      addItem: async (element: any, indexToInsert?: number) => {
        const oldData = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<{
          result: any[];
          prevPageParam: any;
          nextPageParam: any;
        }>;
        const draft = createDraft(oldData);

        if (indexToInsert === undefined) {
          draft.pages[draft.pages.length - 1].result.push(element);
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
        return flatData;
      },
      deleteItem: async (element: any) => {
        throw new Error("not implemented");
      },
    });
  }, [
    appContext.queryClient,
    fetchPrevPage,
    flatData,
    loader.uid,
    queryId,
    queryKey,
    refetch,
    registerComponentApi,
    stableFetchNextPage,
  ]);

  return null;
}
