import { type MutableRefObject, useCallback, useEffect, useMemo } from "react";

import type { ContainerDispatcher, MemoedVars } from "./abstractions/ComponentRenderer";
import type { RegisterComponentApiFn } from "../abstractions/RendererDefs";
import type { ContainerState, RegisterComponentApiFnInner } from "./rendering/ContainerWrapper";
import type { ComponentDef } from "../abstractions/ComponentDefs";
import type {
  LookupAsyncFn,
  LookupAsyncFnInner,
  LookupSyncFn,
  LookupSyncFnInner,
} from "../abstractions/ActionDefs";

import { useComponentRegistry } from "../components/ComponentRegistryContext";
import { ContainerActionKind } from "./rendering/containers";
import { createValueExtractor } from "./rendering/valueExtractor";
import { useReferenceTrackedApi } from "./utils/hooks";
import { AppContextObject } from "../abstractions/AppContextDefs";

interface LoaderRendererContext {
  node: ComponentDef;
  state: ContainerState;
  dispatch: ContainerDispatcher;
  registerComponentApi: RegisterComponentApiFnInner;
  lookupAction: LookupAsyncFnInner;
  lookupSyncCallback: LookupSyncFnInner;
  memoedVarsRef: MutableRefObject<MemoedVars>;
  appContext: AppContextObject;
  onUnmount: (uid: symbol) => void;
}

export function LoaderComponent({
  node,
  state,
  dispatch,
  lookupAction,
  lookupSyncCallback,
  registerComponentApi,
  onUnmount,
  appContext,
  memoedVarsRef,
}: LoaderRendererContext) {
  const componentRegistry = useComponentRegistry();
  const uid = useMemo(() => Symbol(node.uid), [node.uid]);

  useEffect(() => {
    return () => {
      onUnmount(uid);
    };
  }, [onUnmount, uid]);

  // --- Memoizes component API registration
  const memoedRegisterComponentApi: RegisterComponentApiFn = useCallback(
    (api) => {
      registerComponentApi(uid, api);
    },
    [registerComponentApi, uid],
  );

  // --- Memoizes the action resolution by action definition value
  const memoedLookupAction: LookupAsyncFn = useCallback(
    (action, actionOptions) => {
      return lookupAction(action, uid, actionOptions);
    },
    [lookupAction, uid],
  );

  // --- Get the tracked APIs of the compomnent
  const referenceTrackedApi = useReferenceTrackedApi(state);

  // --- Memoizes the value extractor object
  const valueExtractor = useMemo(() => {
    return createValueExtractor(state, appContext, referenceTrackedApi, memoedVarsRef);
  }, [appContext, memoedVarsRef, referenceTrackedApi, state]);

  // --- Memoizes the action resolution by action definition value
  const memoedLookupSyncCallback: LookupSyncFn = useCallback(
    (action) => {
      if (!action) {
        return undefined;
      }
      return lookupSyncCallback(valueExtractor(action), uid);
    },
    [lookupSyncCallback, uid, valueExtractor],
  );

  const memoedLoaderInProgressChanged = useCallback(
    (isInProgress: boolean) => {
      dispatch(loaderInProgressChanged(uid, isInProgress));
    },
    [dispatch, uid],
  );

  const memoedLoaderIsRefetchingChanged = useCallback(
    (isRefetching: boolean) => {
      dispatch(loaderIsRefetchingChanged(uid, isRefetching));
    },
    [dispatch, uid],
  );

  const memoedLoaderLoaded = useCallback(
    (data: any, pageInfo: any) => {
      dispatch(loaderLoaded(uid, data, pageInfo));
    },
    [dispatch, uid],
  );

  const memoedLoaderError = useCallback(
    (error: any) => {
      dispatch(loaderError(uid, error));
    },
    [dispatch, uid],
  );

  const renderer = componentRegistry.lookupLoaderRenderer(node.type);
  if (!renderer) {
    console.error(
      `Loader ${node.type} is not available. Did you forget to register it in the loaderRegistry?`,
    );
    return null;
  }

  return renderer({
    loader: node,
    state,
    dispatch,
    loaderInProgressChanged: memoedLoaderInProgressChanged,
    loaderIsRefetchingChanged: memoedLoaderIsRefetchingChanged,
    loaderLoaded: memoedLoaderLoaded,
    loaderError: memoedLoaderError,
    extractValue: valueExtractor,
    registerComponentApi: memoedRegisterComponentApi,
    lookupAction: memoedLookupAction,
    lookupSyncCallback: memoedLookupSyncCallback,
  });
}

// Signs that a particular loader (`uid`) has just started fetching its data (or executing its operation).
function loaderInProgressChanged(uid: symbol, isInProgress: boolean) {
  return {
    type: ContainerActionKind.LOADER_IN_PROGRESS_CHANGED,
    payload: {
      uid,
      inProgress: isInProgress,
    },
  };
}

// Signs that a particular loader (`uid`) has just started refetching its data (or executing its operation).
function loaderIsRefetchingChanged(uid: symbol, isRefetching: boolean) {
  return {
    type: ContainerActionKind.LOADER_IS_REFETCHING_CHANGED,
    payload: {
      uid,
      isRefetching,
    },
  };
}

// Signs that a particular loader (`uid`) has just fetched its data (`pageInfo`) successfully.
function loaderLoaded(uid: symbol, data: any, pageInfo?: any) {
  return {
    type: ContainerActionKind.LOADER_LOADED,
    payload: {
      uid,
      data,
      pageInfo,
    },
  };
}

// Signs that a particular loader (`uid`) has has an `error` during its operation.
function loaderError(uid: symbol, error: any) {
  return {
    type: ContainerActionKind.LOADER_ERROR,
    payload: {
      uid,
      error,
    },
  };
}
