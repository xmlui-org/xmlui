import type { Dispatch, MutableRefObject, ReactNode, RefObject, SetStateAction } from "react";
import React, {
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cloneDeep, isArray } from "lodash-es";
import { composeRefs } from "@radix-ui/react-compose-refs";
import memoizeOne from "memoize-one";

import type {
  LookupActionOptions,
} from "../../abstractions/ActionDefs";
import type { LookupAsyncFnInner, LookupSyncFnInner } from "../container/action-lookup";
import type { ComponentDef, ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext, RenderChildFn } from "../../abstractions/RendererDefs";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type {
  ArrowExpression,
  ArrowExpressionStatement,
  Statement,
} from "../script-runner/ScriptingSourceTree";
import {
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
} from "../script-runner/ScriptingSourceTree";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "./containers";
import { useAppContext } from "../AppContext";
import { buildProxy } from "../rendering/buildProxy";
import type { StatePartChangedFn } from "./ContainerWrapper";
import type {
  ComponentCleanupFn,
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
} from "../rendering/ContainerWrapper";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import { processStatementQueueAsync } from "../script-runner/process-statement-async";
import { processStatementQueue } from "../script-runner/process-statement-sync";
import { extractParam, shouldKeep } from "../utils/extractParam";
import { useIsomorphicLayoutEffect } from "../utils/hooks";
import { capitalizeFirstLetter, delay, generatedId, useEvent } from "../utils/misc";
import { parseHandlerCode, prepareHandlerStatements } from "../utils/statementUtils";
import { renderChild } from "./renderChild";
import { useTheme } from "../theming/ThemeContext";
import { LoaderComponent } from "../LoaderComponent";
import { isParsedEventValue, isArrowExpression } from "./ContainerUtils";
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { EMPTY_ARRAY } from "../constants";
import type { ParsedEventValue } from "../../abstractions/scripting/Compilation";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";
import { mergeProps } from "../utils/mergeProps";
import {
  getCurrentTrace,
} from "../inspector/inspectorUtils";
import { createHandlerLogger } from "../inspector/handler-logging";
import { createEventHandlers } from "../container/event-handlers";
import { createEventHandlerCache } from "../container/event-handler-cache";
import { createActionLookup } from "../container/action-lookup";

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
    const navigate = useNavigate();
    const location = useLocation();

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

    // --- The container wraps the `renderChild` function to provide that to the child components
    const stableRenderChild: RenderChildFn = useCallback(
      (childNode, lc, pRenderContext, uidInfoRef, ref, rest) => {
        // TODO: Check if this is a valid use case
        if (typeof childNode === "string") {
          throw Error("should be resolved for now");
        }

        // --- Make children an array if it's not
        const children = isArray(childNode) ? childNode : [childNode];

        if (!children || !children.length) {
          // --- No child, nothing to render
          return null;
        }

        // --- If there are multiple children, we need to add a `key` to each of them
        const wrapWithFragment = children.length > 1;

        // --- Render each child
        const renderedChildren = children.map((child, childIndex) => {
          if (!child) {
            // --- No child, nothing to render: Should not happen
            return undefined;
          }

          // --- Invoke the jolly-joker `renderChild` function to render the child. Note that
          // --- in the context, we pass the `stableRenderChild` function, so the child can
          // --- render its children recursively.
          const renderedChild = renderChild({
            node: child,
            state: componentState,
            globalVars,
            dispatch,
            appContext,
            lookupAction,
            lookupSyncCallback,
            registerComponentApi,
            renderChild: stableRenderChild,
            statePartChanged: statePartChanged,
            layoutContext: lc,
            parentRenderContext: pRenderContext,
            memoedVarsRef,
            cleanup,
            uidInfoRef,
          });

          if (renderedChild === undefined) {
            // --- No displayable child, nothing to render
            return undefined;
          }

          // --- Let's process the rendered child
          let rendered = renderedChild;
          const key = `${childIndex}_${child.uid}`;

          if (wrapWithFragment) {
            // --- Add the `key` attribute to the child
            if (React.isValidElement(renderedChild)) {
              // --- React can display this element
              rendered = React.cloneElement(renderedChild, { key });
            } else {
              // --- A simple text node (or alike). We need to wrap it in a `Fragment`
              rendered = <Fragment key={key}>{renderedChild}</Fragment>;
            }
          }

          // --- Done.
          return rendered;
        });

        // --- At this point we have a React node for each child
        if (renderedChildren.length === 1) {
          // --- If we have a single (and valid React element) child, we compose its
          // --- `ref` with the parent's `ref`. This allows the parent to access the child's
          // --- DOM node. Otherwise, we use the child as is.
          return ref && renderedChildren[0] && isValidElement(renderedChildren[0])
            ? React.cloneElement(renderedChildren[0], {
                ref: composeRefs(ref, (renderedChildren[0] as any).ref),
                ...mergeProps(renderedChildren[0].props, rest),
              } as any)
            : renderedChildren[0];
        }

        // --- Done.
        return renderedChildren;
      },
      [
        componentState,
        dispatch,
        appContext,
        lookupAction,
        lookupSyncCallback,
        registerComponentApi,
        statePartChanged,
        memoedVarsRef,
        cleanup,
      ],
    );

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
// LOADER RENDERING
// ============================================================================

/**
 * Context object passed to renderLoaders and renderLoader functions.
 * Contains all dependencies needed to render loader components.
 */
interface LoaderRenderContext {
  /** Map tracking UIDs already used in this container */
  uidInfo: Record<string, string>;
  /** Reference to UID information store */
  uidInfoRef: RefObject<Record<string, any>>;
  /** Array of loader component definitions to render */
  loaders?: ComponentDef[];
  /** Current container state */
  componentState: ContainerState;
  /** Container dispatcher for state updates */
  dispatch: ContainerDispatcher;
  /** Application context object */
  appContext: AppContextObject;
  /** Function to register component APIs */
  registerComponentApi: RegisterComponentApiFnInner;
  /** Function to lookup async action handlers */
  lookupAction: LookupAsyncFnInner;
  /** Function to lookup sync callback handlers */
  lookupSyncCallback: LookupSyncFnInner;
  /** Function to cleanup component resources */
  cleanup: ComponentCleanupFn;
  /** Reference to memoized variables */
  memoedVarsRef: MutableRefObject<MemoedVars>;
}

function renderLoaders({
  uidInfo,
  uidInfoRef,
  loaders = EMPTY_ARRAY,
  componentState,
  dispatch,
  appContext,
  registerComponentApi,
  lookupAction,
  lookupSyncCallback,
  cleanup,
  memoedVarsRef,
}: LoaderRenderContext) {
  return loaders.map((loader: ComponentDef) => {
    // --- Check for the uniqueness of UIDs
    if (loader?.uid) {
      if (uidInfo[loader.uid]) {
        // --- We have a duplicated ID (another loader)
        throw new Error(
          `Another ${uidInfo[loader.uid]} definition in this container already uses the uid '${loader.uid}'`,
        );
      }
      uidInfo[loader.uid] = "loader";
      uidInfoRef.current[loader.uid] = {
        type: "loader",
        value: "loaderValue",
        uid: loader.uid,
      };
    }

    // --- Render the current loader
    const renderedLoader = renderLoader({
      loader,
      componentState,
      dispatch,
      appContext,
      registerComponentApi,
      lookupAction,
      lookupSyncCallback,
      memoedVarsRef,
      cleanup,
    });

    // --- Skip loaders with rendering errors
    if (renderedLoader === undefined) {
      return undefined;
    }

    // --- Take care to use a key property for the loader
    return <Fragment key={loader.uid}>{renderedLoader}</Fragment>;
  });

  function renderLoader({
    loader,
    componentState,
    dispatch,
    appContext,
    registerComponentApi,
    lookupAction,
    lookupSyncCallback,
    cleanup,
    memoedVarsRef,
  }: {
    loader: ComponentDef;
    componentState: ContainerState;
    dispatch: ContainerDispatcher;
    appContext: AppContextObject;
    registerComponentApi: RegisterComponentApiFnInner;
    lookupAction: LookupAsyncFnInner;
    lookupSyncCallback: LookupSyncFnInner;
    cleanup: ComponentCleanupFn;
    memoedVarsRef: MutableRefObject<MemoedVars>;
  }) {
    // --- For the sake of avoiding further issues
    if (!loader) {
      return null;
    }

    // --- Evaluate "when" to decide if the loader should be rendered
    // --- Render only visible components
    if (!shouldKeep(loader.when, componentState, appContext)) {
      return null;
    }

    // --- Use the loader type's renderer function
    return (
      <LoaderComponent
        onUnmount={cleanup}
        node={loader}
        state={componentState}
        dispatch={dispatch}
        registerComponentApi={registerComponentApi}
        lookupAction={lookupAction}
        lookupSyncCallback={lookupSyncCallback}
        memoedVarsRef={memoedVarsRef}
        appContext={appContext}
      />
    );
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================
// Type guards are now imported from ContainerUtils.ts
// See: isParsedEventValue, isArrowExpression
