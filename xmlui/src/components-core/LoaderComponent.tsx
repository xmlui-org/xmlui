import { type MutableRefObject, useCallback, useEffect, useMemo } from "react";

import type {
  ContainerDispatcher,
  MemoedVars,
} from "@components-core/abstractions/ComponentRenderer";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type {
  ContainerState,
  RegisterComponentApiFnInner,
} from "@components-core/container/ContainerComponentDef";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type {
  LookupAsyncFn,
  LookupAsyncFnInner,
  LookupSyncFn,
  LookupSyncFnInner,
} from "@abstractions/ActionDefs";

import { useComponentRegistry } from "@components/ViewComponentRegistryContext";
import { ContainerActionKind } from "./abstractions/containers";
import { createValueExtractor } from "@components-core/container/valueExtractor";
import { useReferenceTrackedApi } from "@components-core/utils/hooks";
import { AppContextObject } from "@abstractions/AppContextDefs";

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
