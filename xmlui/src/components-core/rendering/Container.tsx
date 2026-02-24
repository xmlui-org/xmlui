import type { Dispatch, MutableRefObject, ReactNode, RefObject, SetStateAction } from "react";
import {
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  memo,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useLocation } from "react-router-dom";
import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { Statement } from "../script-runner/ScriptingSourceTree";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { useAppContext } from "../AppContext";
import type { StatePartChangedFn } from "./ContainerWrapper";
import type {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
} from "../rendering/ContainerWrapper";
import { extractParam } from "../utils/extractParam";
import { useIsomorphicLayoutEffect } from "../utils/hooks";
import { useTheme } from "../theming/ThemeContext";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";
import { createHandlerLogger } from "../inspector/handler-logging";
import { createEventHandlers } from "../container/event-handlers";
import { createEventHandlerCache } from "../container/event-handler-cache";
import { createActionLookup } from "../container/action-lookup";
import { createChildRenderer } from "../container/child-rendering";
import { renderLoaders } from "../container/loader-rendering";

// Re-export for backward compatibility
export { getCurrentTrace } from "../inspector/inspectorUtils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the Container component.
 * Container manages component state, event handlers, and child rendering.
 */
type Props = {
  /** Container wrapper definition with children and loaders */
  node: ContainerWrapperDef;
  /** Resolved key for React reconciliation */
  resolvedKey?: string;
  /** Current component state */
  componentState: ContainerState;
  /** Global variables available to the container */
  globalVars?: Record<string, any>;
  /** Dispatcher for container state updates */
  dispatch: ContainerDispatcher;
  /** Function to set version number for re-rendering */
  setVersion: Dispatch<SetStateAction<number>>;
  /** Current version number for state updates */
  version: number;
  /** Callback when part of state changes */
  statePartChanged: StatePartChangedFn;
  /** Function to register component APIs */
  registerComponentApi: RegisterComponentApiFnInner;
  /** Parent's function to register component APIs */
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  /** Reference to layout context */
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  /** Reference to memoized variables */
  memoedVarsRef: MutableRefObject<MemoedVars>;
  /** Whether this is an implicit container */
  isImplicit?: boolean;
  /** Parent container's dispatcher */
  parentDispatch: ContainerDispatcher;
  /** Parent rendering context */
  parentRenderContext?: ParentRenderContext;
  /** Reference to UID information */
  uidInfoRef?: RefObject<Record<string, any>>;
  /** Child elements to render */
  children?: ReactNode;
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * Container component that manages component state, event handlers, and child rendering.
 * Provides:
 * - Event handler execution (async and sync)
 * - Event handler caching and lifecycle tracking
 * - Child component rendering
 * - Loader rendering
 * - API registration for compound components
 */
export const Container = memo(
  forwardRef(function Container(
    {
      node,
      componentState,
      globalVars,
      dispatch: containerDispatch,
      parentDispatch,
      resolvedKey,
      version,
      setVersion,
      statePartChanged,
      registerComponentApi: containerRegisterComponentApi,
      parentRegisterComponentApi,
      layoutContextRef,
      parentRenderContext,
      memoedVarsRef,
      isImplicit,
      uidInfoRef: parentUidInfoRef,
      children,
      ...rest
    }: Props,
    ref,
  ) {
    const { apiBoundContainer } = node;
    const dispatch = isImplicit ? parentDispatch : containerDispatch;
    const registerComponentApi = isImplicit
      ? parentRegisterComponentApi
      : containerRegisterComponentApi;

    const appContext = useAppContext();
    const { getThemeVar } = useTheme();
    const location = useLocation();
    // Use navigate from appContext to respect willNavigate/didNavigate events
    const navigate = appContext.navigate;

    const fnsRef = useRef<Record<symbol, any>>({});

    const stateRef = useRef(componentState);

    // Sync ref in layout effect to ensure consistency before browser paint
    // This follows React best practices and avoids render-time ref mutations
    useIsomorphicLayoutEffect(() => {
      stateRef.current = componentState;
    }, [componentState]);

    const parsedStatementsRef = useRef<Record<string, Array<Statement> | null>>({});
    const [_, startTransition] = useTransition();
    const mountedRef = useRef(true);

    // ========================================================================
    // LIFECYCLE MANAGEMENT
    // ========================================================================

    // --- This ref holds a map of promises for each statement execution that cause any state change.
    const statementPromises = useRef<Map<string, any>>(new Map());

    // --- Ensure that re-rendering because of version change resolves all pending statement promises.
    useIsomorphicLayoutEffect(() => {
      for (const resolve of statementPromises.current.values()) {
        resolve();
      }
    }, [version]);

    // --- Ensure that component disposal resolves all pending statement promises.
    useEffect(() => {
      mountedRef.current = true;
      const leftPromises = statementPromises.current;
      return () => {
        mountedRef.current = false;
        for (const resolve of leftPromises.values()) {
          resolve();
        }
      };
    }, []);

    const { apiInstance } = useApiInterceptorContext();

    // ========================================================================
    // INSPECTOR LOGGING SETUP
    // ========================================================================

    const handlerLogger = createHandlerLogger({
      appContext,
      nodeDebugSource: (node as any)?.debug?.source,
    });

    // ========================================================================
    // EVENT HANDLER EXECUTION
    // ========================================================================
    // Create event handler executors (async and sync)

    const { runCodeAsync, runCodeSync } = createEventHandlers({
      appContext,
      handlerLogger,
      stateRef,
      getThemeVar,
      dispatch,
      apiInstance,
      navigate,
      location,
      lookupAction: (action, uid, options) => {
        // This will be resolved after lookupAction is defined below
        return lookupAction(action, uid, options);
      },
      statePartChanged,
      startTransition,
      setVersion,
      mountedRef,
      statementPromises,
      parsedStatementsRef,
    });

    // ========================================================================
    // EVENT HANDLER CACHING
    // ========================================================================
    // Create event handler cache functions

    const { getOrCreateEventHandlerFn, getOrCreateSyncCallbackFn, cleanup } =
      createEventHandlerCache({
        fnsRef,
        runCodeAsync,
        runCodeSync,
        handlerLogger,
      });

    // ========================================================================
    // ACTION AND CALLBACK LOOKUP
    // ========================================================================
    // Create action lookup functions

    const { lookupAction, lookupSyncCallback } = createActionLookup({
      componentState,
      getOrCreateEventHandlerFn,
      getOrCreateSyncCallbackFn,
    });

    // ========================================================================
    // API REGISTRATION
    // ========================================================================
    // Registers component APIs for compound components and parent access.

    const isApiRegisteredInnerRef = useRef(false);
    useEffect(() => {
      if (!node.api) {
        return;
      }
      if (!node.containerUid) {
        return;
      }
      if (isApiRegisteredInnerRef.current) {
        return;
      }
      isApiRegisteredInnerRef.current = true;
      const api: Record<string, any> = {};
      const self = Symbol("$self");
      Object.entries(node.api).forEach(([key, value]) => {
        api[key] = lookupAction(value as string, self, { eventName: key });
      });
      if (!isImplicit) {
        registerComponentApi(self, api); //we register the api as $self for the compound components,
      }
      parentRegisterComponentApi(node.containerUid, api); // and register it for the parent component instance
    }, [
      lookupAction,
      node.api,
      node.containerUid,
      node.uid,
      isImplicit,
      parentRegisterComponentApi,
      registerComponentApi,
    ]);

    // ========================================================================
    // CHILD RENDERING
    // ========================================================================
    // stableRenderChild: Renders child components recursively with proper ref composition.

    const { stableRenderChild } = createChildRenderer({
      componentState,
      globalVars,
      dispatch,
      appContext,
      lookupAction,
      lookupSyncCallback,
      registerComponentApi,
      statePartChanged,
      memoedVarsRef,
      cleanup,
    });

    // ========================================================================
    // COMPONENT RENDERING
    // ========================================================================

    // --- Use this object to store information about already rendered UIDs.
    // --- We do not allow any action, loader, or transform to use the same UID; however (as of now) children
    // --- may use the same UID.
    const uidInfo: Record<string, string> = {};

    const thisUidInfoRef = useRef({});
    const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;

    const renderedChildren = stableRenderChild(
      node.children,
      layoutContextRef?.current,
      parentRenderContext,
      uidInfoRef,
      ref,
      rest,
    );

    const renderedLoaders = renderLoaders({
      uidInfo,
      uidInfoRef,
      loaders: node.loaders,
      componentState,
      memoedVarsRef,
      //if it's an api bound container, we always use this container, otherwise use the parent if it's an implicit one
      dispatch: apiBoundContainer ? containerDispatch : dispatch,
      registerComponentApi: apiBoundContainer
        ? containerRegisterComponentApi
        : registerComponentApi,
      appContext,
      lookupAction,
      lookupSyncCallback,
      cleanup,
    });
    //TODO illesg
    const containerContent = (
      <>
        {renderedLoaders}
        {!!children && isValidElement(renderedChildren)
          ? cloneElement(renderedChildren, null, children)
          : renderedChildren}
      </>
    );
    return (
      <Fragment
        key={
          node.uid
            ? `${resolvedKey}>${extractParam(componentState, node.uid, appContext, true)}`
            : undefined
        }
      >
        {containerContent}
      </Fragment>
    );
  }),
);

// ============================================================================
// TYPE GUARDS
// ============================================================================
// Type guards are now imported from ContainerUtils.ts
// See: isParsedEventValue, isArrowExpression
