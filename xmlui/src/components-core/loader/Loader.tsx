import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, type QueryFunction } from "@tanstack/react-query";
import { createDraft, finishDraft } from "immer";

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
import { executeWithPolicy } from "../errors/policy";
import { useRetryPolicy } from "../errors/RetryPolicyContext";
import { AppError } from "../errors/app-error";
import { useFallback } from "../../components/Fallback/FallbackReact";

// Shared state and callback contract for non-visual data loaders.
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

// Executes the underlying data request. React Query supplies the abort signal.
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
  structuralSharing = true,
}: LoaderProps) {
  const { uid } = loader;
  const appContext = useAppContext();
  const { initialized } = useApiInterceptorContext();
  // Plan #07 Step 3.1 — when an ancestor `<RetryPolicy>` is present, wrap the
  // fetcher in `executeWithPolicy` so failures are retried before reaching
  // the reducer / `$error` channel.
  const retryPolicy = useRetryPolicy();
  // Plan #07 Step 4.1 — when an ancestor `<Fallback>` is present, report
  // success / error so it can switch to its error template.
  const fallback = useFallback();

  // React Query owns cache reuse, background refetches, and request state.
  const { data, status, isFetching, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: useMemo(
      () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
      [appContext, loader.props, queryId, state, uid],
    ),
    structuralSharing,
    // Pause loaders until the optional API interceptor has finished initializing.
    enabled: initialized,
    queryFn: useCallback<QueryFunction>(
      async ({ signal }) => {
        try {
          const fetcher = (innerSignal: AbortSignal) => loaderFn(innerSignal);
          const loadedValue: any = retryPolicy
            ? await executeWithPolicy(fetcher, retryPolicy.spec, signal ?? new AbortController().signal, {
                circuitState: retryPolicy.circuitState,
              })
            : await loaderFn(signal);
          if (loadedValue === undefined) {
            return null;
          }
          return loadedValue;
        } catch (error) {
          throw error;
        }
      },
      [loaderFn, retryPolicy],
    ),
    select: useCallback(
      (data: any) => {
        let result = data;
        const resultSelector = loader.props.resultSelector;
        if (resultSelector) {
          result = extractParam(
            { $response: data },
            resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`,
          );
        }

        const transformedResult = transformResult ? transformResult(result) : result;
        return transformedResult;
      },
      [loader.props.resultSelector, transformResult],
    ),
    retry: false,
  });

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

  const prevData = usePrevious(data);
  const prevError = usePrevious(error);
  const prevIsFetching = usePrevious(isFetching);
  const prevIsLoading = usePrevious(isLoading);

  // Tracks whether at least one fetch has completed since this component mounted.
  // Prevents stale cached errors (e.g. a 401 from a prior session still in the
  // react-query cache) from being replayed as a fresh error on mount.
  const hasFetchCompletedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    loaderInProgressChanged(isFetching || isLoading);
    if (prevIsFetching && !isFetching) {
      hasFetchCompletedRef.current = true;
    }
  }, [isLoading, isFetching, loaderInProgressChanged, prevIsFetching]);

  // Clear stale loader data only when a new foreground load starts.
  useIsomorphicLayoutEffect(() => {
    const isForegroundLoadStarting = isLoading && !prevIsLoading;
    if (isForegroundLoadStarting) {
      loaderLoaded(undefined);
    }
  }, [isLoading, prevIsLoading, loaderLoaded]);

  useIsomorphicLayoutEffect(() => {
    loaderIsRefetchingChanged(isRefetching);
  }, [isRefetching, loaderIsRefetchingChanged]);

  useIsomorphicLayoutEffect(() => {
    const hasNewData = status === "success" && data !== prevData;
    const hasNewCompletedError =
      status === "error" && error !== prevError && hasFetchCompletedRef.current;

    if (hasNewData) {
      loaderLoaded(data);
      // Clear any previously reported error for this loader.
      fallback?.clearError(uid);

      // Run after layout effects so markup handlers can read the updated loader state.
      setTimeout(() => {
        onLoaded?.(data, isRefetching);
      }, 0);
    } else if (hasNewCompletedError) {
      loaderError(error);
      // Bubble the structured error to the nearest <Fallback>, if any.
      fallback?.reportError(uid, AppError.from(error));
    }
  }, [data, error, loaderError, loaderLoaded, onLoaded, prevData, prevError, status, isRefetching, fallback, uid]);

  useIsomorphicLayoutEffect(() => {
    return () => {
      loaderLoaded(undefined);
    };
  }, [loaderLoaded, uid]);

  useEffect(() => {
    registerComponentApi?.({
      refetch: (options) => {
        void refetch(options);
      },
      update: async (updater) => {
        const currentItems = appContext.queryClient?.getQueryData(queryId!) as any[];
        if (!currentItems) {
          // Skip cache updates until the loader has produced data.
          return;
        }
        const draft = createDraft(currentItems);
        const updatedItems = await updater(draft); // Truthy returns replace the draft result.
        const newItems = updatedItems || finishDraft(draft);

        if (currentItems.length !== newItems.length) {
          throw new Error(
            "Use this method for update only. If you want to add or delete, call the addItem/deleteItem method.",
          );
        }

        appContext.queryClient?.setQueryData(queryId!, newItems);
      },
      addItem: (element: any, indexToInsert?: number) => {
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
      getItems: () => {
        return data;
      },
      deleteItem: (element: any) => {
        throw new Error("not implemented");
      },
    });
  }, [appContext.queryClient, queryId, refetch, registerComponentApi, data]);

  return null;
}
