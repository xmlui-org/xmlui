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

// Helper to check if render was triggered by recent user interaction
const getInteractionContext = () => {
  if (typeof window === 'undefined') return null;

  const timeSinceInteraction = Date.now() - (window as any).lastInteractionTime;
  const isInteractionTriggered = timeSinceInteraction < 2000; // Within 2 seconds

  return isInteractionTriggered ? {
    interactionType: (window as any).lastInteractionType,
    timeSinceInteraction,
    target: (window as any).lastInteractionTarget
  } : null;
};

// Render frequency tracking for DataSources
const dataSourceRenderCounts = new Map<string, { count: number, lastReset: number }>();
const RENDER_COUNT_WINDOW = 5000; // 5 second window
const EXCESSIVE_RENDER_THRESHOLD = 10;

const trackDataSourceRenderFrequency = (dataSourceId: string): boolean => {
  const now = Date.now();
  const existing = dataSourceRenderCounts.get(dataSourceId);

  if (!existing || (now - existing.lastReset) > RENDER_COUNT_WINDOW) {
    dataSourceRenderCounts.set(dataSourceId, { count: 1, lastReset: now });
    return false;
  }

  existing.count++;
  const isExcessive = existing.count > EXCESSIVE_RENDER_THRESHOLD;

  if (isExcessive && existing.count === EXCESSIVE_RENDER_THRESHOLD + 1) {
    console.warn(`[🚨 DATASOURCE STORM] DataSource '${dataSourceId}' rendered ${existing.count} times in ${RENDER_COUNT_WINDOW/1000}s`);
  }

  return isExcessive;
};

/**
 * Reactivity logging configuration - gated by window.logReactivity
 * See StateContainer.tsx for full documentation of available options
 */
const getLogReactivity = (): boolean | { [key: string]: any } | null => {
  if (typeof window === 'undefined') return false;
  const config = (window as any).logReactivity;
  if (typeof config === 'boolean') return config;
  if (typeof config === 'object' && config !== null) {
    // Check the master switch first
    if (config.enabled === false) return false;
    return config;
  }
  return false;
};

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

  const logConfig = getLogReactivity();

  // Enhanced change tracking with diff analysis
  const prevAppContext = usePrevious(appContext);
  if (logConfig && typeof logConfig === 'object' && logConfig !== null && logConfig.stateChanges && prevAppContext && prevAppContext !== appContext) {
    const dataSourceId = loader.props.id || loader.uid || 'unnamed_datasource';

    // Analyze what changed in appContext
    const changedKeys = Object.keys(appContext || {}).filter(key =>
      (appContext as any)?.[key] !== (prevAppContext as any)?.[key]
    );

    console.log(`[🚨 APP CONTEXT CHANGED] DataSource '${dataSourceId}':`, {
      timestamp: Date.now(),
      contextChanged: true,
      changedKeys: changedKeys.length > 0 ? changedKeys : 'reference_change',
      triggerChain: logConfig.causality ? 'appContext → queryKey → refetch' : undefined
    });

    // Track data source behavior patterns
    if (logConfig.dataFlow) {
      console.log(`[🌐 DATA SOURCE BEHAVIOR] '${dataSourceId}' context change`, {
        url: loader.props.url,
        changeType: 'context_driven_refetch',
        dataFlow: 'external_api → component_state'
      });
    }
  }

  // Enhanced state change tracking
  const prevState = usePrevious(state);
  if (logConfig && typeof logConfig === 'object' && logConfig !== null && logConfig.stateChanges && prevState && prevState !== state) {
    const dataSourceId = loader.props.id || loader.uid || 'unnamed_datasource';

    // Analyze state changes
    const stateKeys = Object.keys(state || {});
    const prevStateKeys = Object.keys(prevState || {});
    const addedKeys = stateKeys.filter(k => !prevStateKeys.includes(k));
    const removedKeys = prevStateKeys.filter(k => !stateKeys.includes(k));
    const changedKeys = stateKeys.filter(k =>
      prevStateKeys.includes(k) && (state as any)?.[k] !== (prevState as any)?.[k]
    );

    console.log(`[🚨 STATE CHANGED] DataSource '${dataSourceId}':`, {
      timestamp: Date.now(),
      stateChanged: true,
      added: addedKeys.length > 0 ? addedKeys : undefined,
      removed: removedKeys.length > 0 ? removedKeys : undefined,
      changed: changedKeys.length > 0 ? changedKeys : 'reference_change'
    });
  }

  // Enhanced render logging with deduplication and performance tracking
  if (logConfig && (logConfig === true || (typeof logConfig === 'object' && logConfig !== null && logConfig.components))) {
    const renderStart = performance.now();
    const dataSourceId = loader.props.id || loader.uid || 'unnamed_datasource';
    const isExcessiveRendering = trackDataSourceRenderFrequency(dataSourceId);
    const interactionContext = getInteractionContext();

    // Detect malformed IDs
    if (dataSourceId.includes('undefined')) {
      console.warn(`[⚠️ MALFORMED ID] DataSource has undefined ID parts: '${dataSourceId}'`, {
        propsId: loader.props.id,
        uid: loader.uid,
        url: loader.props.url
      });
    }

    console.log(`[Loader Render] DataSource '${dataSourceId}' rendering`, {
      timestamp: Date.now(),
      renderStart,
      renderStorm: isExcessiveRendering,
      // Add interaction correlation
      ...(interactionContext ? {
        interactionTriggered: true,
        interactionType: interactionContext.interactionType,
        timeSinceInteraction: interactionContext.timeSinceInteraction + 'ms',
        targetElement: interactionContext.target?.tagName,
        targetId: interactionContext.target?.id
      } : { interactionTriggered: false }),
      stackTrace: logConfig.stackTraces ? new Error().stack?.split('\n').slice(1, 4).map(line => line.trim()) : undefined,
    });

    // Track render completion
    setTimeout(() => {
      const renderDuration = performance.now() - renderStart;
      if (renderDuration > 16) { // Flag slow renders (>1 frame)
        console.warn(`[🐌 SLOW RENDER] DataSource '${dataSourceId}' took ${renderDuration.toFixed(2)}ms`);
      }
    }, 0);
  }

  const queryKey = useMemo(() => {
    const extractedParam = extractParam(state, loader.props, appContext);
    const key = queryId ? queryId : [uid, extractedParam];

    if (logConfig && typeof logConfig === 'object' && logConfig !== null && logConfig.queryKeys) {
      const dataSourceId = loader.props.id || loader.uid || 'unnamed_datasource';

      // Analyze dependencies that affect this query key
      const dependencies = {
        fromState: extractedParam && typeof extractedParam === 'object' ? Object.keys(extractedParam) : [],
        fromProps: loader.props ? Object.keys(loader.props).filter(k => k !== 'children') : [],
        fromContext: appContext ? Object.keys(appContext).slice(0, 5) : [], // Limit to avoid spam
        hasCustomQueryId: !!queryId
      };

      console.log(`[🔍 QUERY KEY CALC] DataSource '${dataSourceId}':`, {
        uid,
        timestamp: Date.now(),
        queryKey: key,
        extractedParam: extractedParam,
        url: loader.props.url,
        dependencies,
        memoizedFrom: ['appContext', 'loader.props', 'queryId', 'state', 'uid']
      });

      // Track API request patterns
      if (logConfig.apiTracking && loader.props.url && typeof loader.props.url === 'string') {
        console.log(`[🌐 API REQUEST] DataSource '${dataSourceId}' will fetch:`, {
          url: loader.props.url,
          method: loader.props.method || 'GET',
          queryKeyChanged: true,
          requestType: loader.props.url.includes('{') ? 'templated_url' : 'static_url'
        });
      }
    }

    return key;
  }, [appContext, loader.props, queryId, state, uid]);

  // Track query key changes to detect what triggers API calls
  const prevQueryKey = usePrevious(queryKey);
  useEffect(() => {
    // Simple reference comparison to avoid circular reference issues
    if (prevQueryKey && prevQueryKey !== queryKey) {
      if (logConfig && typeof logConfig === 'object' && logConfig !== null && logConfig.queryKeys) {
        const dataSourceId = loader.props.id || loader.uid || 'unnamed_datasource';
        console.log(`[🚨 REACTIVITY TRIGGER] DataSource '${dataSourceId}' queryKey changed:`);
        console.log(`  Previous:`, prevQueryKey);
        console.log(`  Current:`, queryKey);
        console.log(`  URL:`, loader.props.url);
        console.log(`  This will trigger a new API call`);

        // Enhanced API call tracking
        if (logConfig.apiTracking) {
          console.log(`[🔄 API REFETCH] DataSource '${dataSourceId}' triggering new request`, {
            url: loader.props.url,
            reason: 'query_key_changed',
            previousKey: prevQueryKey,
            newKey: queryKey,
            timestamp: Date.now()
          });
        }
      }
    }
  }, [queryKey, prevQueryKey, loader.props.id, loader.uid]);

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
