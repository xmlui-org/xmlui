import { useCallback, useEffect, useMemo } from "react";

import type {
  ContainerDispatcher,
} from "@components-core/abstractions/ComponentRenderer";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type { ContainerState, RegisterComponentApiFnInner } from "@components-core/container/ContainerComponentDef";
import type { ComponentDefNew } from "@abstractions/ComponentDefs";
import type { LookupAsyncFn, LookupAsyncFnInner } from "@abstractions/ActionDefs";

import { useComponentRegistry } from "@components/ViewComponentRegistryContext";
import { ContainerActionKind } from "./abstractions/containers";

interface LoaderRendererContext {
  node: ComponentDefNew;
  state: ContainerState;
  dispatch: ContainerDispatcher;
  registerComponentApi: RegisterComponentApiFnInner;
  lookupAction: LookupAsyncFnInner;
  onUnmount: (uid: symbol) => void;
}

export function LoaderComponent({
  node,
  state,
  dispatch,
  lookupAction,
  registerComponentApi,
  onUnmount,
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
    [registerComponentApi, uid]
  );

  // --- Memoizes the action resolution by action definition value
  const memoedLookupAction: LookupAsyncFn = useCallback(
    (action, actionOptions) => {
      return lookupAction(action, uid, actionOptions);
    },
    [lookupAction, uid]
  );

  const memoedLoaderInProgressChanged = useCallback((isInProgress: boolean) => {
    dispatch(loaderInProgressChanged(uid, isInProgress));
  }, [dispatch, uid]);

  const memoedLoaderLoaded = useCallback(
    (data: any, pageInfo: any) => {
      dispatch(loaderLoaded(uid, data, pageInfo));
    },
    [dispatch, uid]
  );

  const memoedLoaderError = useCallback(
    (error: any) => {
      dispatch(loaderError(uid, error));
    },
    [dispatch, uid]
  );

  const renderer = componentRegistry.lookupLoaderRenderer(node.type);
  if (!renderer) {
    console.error(`Loader ${node.type} is not available. Did you forget to register it in the loaderRegistry?`);
    return null;
  }

  return renderer({
    loader: node,
    state,
    dispatch,
    loaderInProgressChanged: memoedLoaderInProgressChanged,
    loaderLoaded: memoedLoaderLoaded,
    loaderError: memoedLoaderError,
    registerComponentApi: memoedRegisterComponentApi,
    lookupAction: memoedLookupAction,
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

