import type { MutableRefObject, ReactNode, RefObject } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import produce from "immer";
import { isEmpty } from "lodash-es";

import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "./containers";
import { T_ARROW_EXPRESSION } from "../script-runner/ScriptingSourceTree";
import { EMPTY_OBJECT } from "../constants";
import { collectFnVarDeps } from "../rendering/collectFnVarDeps";
import { createContainerReducer } from "../rendering/reducer";
import { useDebugView } from "../DebugViewProvider";
import { ErrorBoundary } from "../rendering/ErrorBoundary";
import { collectVariableDependencies } from "../script-runner/visitors";
import { useReferenceTrackedApi, useShallowCompareMemoize } from "../utils/hooks";
import { Container } from "./Container";
import { createVariableLogger } from "../inspector/variable-logging";
import { mergeComponentApis, useCombinedState, useMergedState } from "../state/state-layers";
import { useVars, isParsedValue } from "../state/variable-resolution";
import { useGlobalVariables } from "../state/global-variables";
import { useRoutingParams } from "../state/routing-state";
import { useAppContext } from "../AppContext";
import type {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  StatePartChangedFn,
} from "./ContainerWrapper";
import type { ComponentApi } from "../../abstractions/ApiDefs";
import { extractScopedState, CodeBehindParseError } from "./ContainerUtils";
import { FnDepsProvider, useFnDeps } from "../FnDepsContext";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the StateContainer component.
 * StateContainer manages the 6-layer state composition pipeline and variable resolution.
 */
type Props = {
  /** Container wrapper definition with component metadata */
  node: ContainerWrapperDef;
  /** Resolved key for React reconciliation */
  resolvedKey?: string;
  /** Parent container's state (will be scoped by `uses` property) */
  parentState: ContainerState;
  /** Global variables from parent container */
  parentGlobalVars?: Record<string, any>;
  /** Callback when part of parent state changes */
  parentStatePartChanged: StatePartChangedFn;
  /** Parent's function to register component APIs */
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  /** Parent container's dispatcher */
  parentDispatch: ContainerDispatcher;
  /** Parent rendering context */
  parentRenderContext?: ParentRenderContext;
  /** Reference to layout context */
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  /** Reference to UID information */
  uidInfoRef?: RefObject<Record<string, any>>;
  /** Whether this is an implicit container (follows parent's registration) */
  isImplicit?: boolean;
  /** Stable ref holding the full un-narrowed parent state for event handler scope.
   *  Using a ref (not a value) keeps StateContainer.memo stable when unrelated
   *  parent state changes, preserving the computedUses render optimization. */
  fullParentStateRef?: MutableRefObject<ContainerState | undefined>;
  /** Child elements to render */
  children?: ReactNode;
};

// ============================================================================
// DEV-ONLY RENDER-COUNT PROFILER HELPERS
// ============================================================================

if (process.env.NODE_ENV === "development") {
  (globalThis as any).__resetRenderCounts = () => {
    (globalThis as any).__renderCounts = {};
  };
  (globalThis as any).__topRenderCounts = (n = 10) => {
    const counts: Record<string, number> = (globalThis as any).__renderCounts ?? {};
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n);
  };
}

// ============================================================================
// STATE CONTAINER COMPONENT
// ============================================================================

/**
 * StateContainer component that orchestrates the 6-layer state composition pipeline.
 * Manages:
 * - Parent state scoping (via `uses` property)
 * - Component reducer state
 * - Component APIs
 * - Context variables
 * - Local variable resolution (two-pass for forward references)
 * - Routing parameters
 * - Inspector logging for debugging
 */
export const StateContainer = memo(
  forwardRef(function StateContainer(
    {
      node,
      resolvedKey,
      parentState,
      parentGlobalVars,
      parentStatePartChanged,
      parentRegisterComponentApi,
      parentDispatch,
      parentRenderContext,
      layoutContextRef,
      uidInfoRef,
      isImplicit,
      fullParentStateRef,
      children,
      ...rest
    }: Props,
    ref,
  ) {
    const [version, setVersion] = useState(0);
    const routingParams = useRoutingParams();
    const memoedVars = useRef<MemoedVars>(new Map());
    const appContext = useAppContext();
    const xsVerbose = appContext.appGlobals?.xsVerbose === true;

    // ========================================================================
    // STATE COMPOSITION PIPELINE DOCUMENTATION
    // ========================================================================

    /**
     * STATE COMPOSITION PIPELINE
     *
     * The container state is assembled from multiple sources in a specific order and priority.
     * Understanding this flow is critical for debugging state issues.
     *
     * Full pipeline documentation available in: ../state/state-layers.ts
     *
     * Quick reference - see STATE_LAYER_DOCUMENTATION for details:
     * 1. Parent State (scoped by `uses`)
     * 2. Component Reducer State (loaders, events)
     * 3. Component APIs (exposed methods)
     * 4. Context Variables ($item, $itemIndex)
     * 5. Local Variables (vars, functions, script)
     * 6. Routing Parameters ($pathname, $routeParams)
     *
     * Priority: Parent < Component < Context < Local Vars
     * Routing parameters are additive.
     */

    // ========================================================================
    // LAYER 1: PARENT STATE SCOPING
    // ========================================================================

    const stateFromOutside = useShallowCompareMemoize(
      useMemo(
        () => extractScopedState(parentState, node.uses ?? node.computedUses),
        [node.uses, node.computedUses, parentState],
      ),
    );

    const renderCountRef = useRef(0);
    if (process.env.NODE_ENV === "development") {
      renderCountRef.current += 1;
      // Use the wrapped component's type (first child) for containers — avoids all containers
      // colliding on the "Container" label when they have no uid.
      const innerType = (node as any).children?.[0]?.type;
      const baseLabel = innerType ?? node.type ?? "anon";
      const label = node.uid ? `${baseLabel}#${node.uid}` : baseLabel;
      // accumulate per-label counts silently; read window.__renderCounts in DevTools to inspect
      (globalThis as any).__renderCounts ??= {};
      (globalThis as any).__renderCounts[label] = renderCountRef.current;
    }

    // ========================================================================
    // LAYER 2: COMPONENT REDUCER STATE
    // ========================================================================

    // --- All state manipulation happens through the container reducer, which is created here.
    // --- This reducer allow collecting state changes for debugging purposes. The `debugView`
    // --- contains the debug configuration; it may enable (or disable) logging.
    const debugView = useDebugView();
    const containerReducer = createContainerReducer(debugView);
    const [componentState, dispatch] = useReducer(containerReducer, EMPTY_OBJECT);

    // ========================================================================
    // LAYER 3: COMPONENT APIS
    // ========================================================================

    // --- The exposed APIs of components are also the part of the state.
    const [componentApis, setComponentApis] = useState<Record<symbol, ComponentApi>>(EMPTY_OBJECT);

    const componentStateWithApis = useShallowCompareMemoize(
      useMemo(
        () => mergeComponentApis(componentState, componentApis),
        [componentState, componentApis],
      ),
    );

    // ========================================================================
    // LAYER 4: CONTEXT VARIABLES
    // ========================================================================

    const localVarsStateContext = useCombinedState(
      stateFromOutside,
      componentStateWithApis,
      node.contextVars,
      routingParams,
    );

    // ========================================================================
    // LAYER 5: LOCAL VARIABLE RESOLUTION (TWO-PASS)
    // ========================================================================

    const parsedScriptPart = node.scriptCollected;
    if (parsedScriptPart?.moduleErrors && !isEmpty(parsedScriptPart.moduleErrors)) {
      console.error("Module errors in StateContainer:", parsedScriptPart.moduleErrors);
      throw new CodeBehindParseError(parsedScriptPart.moduleErrors);
    }

    if (node.scriptError && !isEmpty(node.scriptError)) {
      console.error("Script error in StateContainer:", node.scriptError);
      throw new CodeBehindParseError(node.scriptError);
    }
    const referenceTrackedApi = useReferenceTrackedApi(componentState);

    const varDefinitions = useShallowCompareMemoize({
      ...node.functions,
      ...parsedScriptPart?.functions,
      ...node.vars,
      ...parsedScriptPart?.vars,
    });

    //first: collection function (arrowExpressions) dependencies
    //    -> do it until there's no function dep, only var deps
    const parentFnDeps = useFnDeps();
    const functionDeps = useMemo(() => {
      const fnDeps: Record<string, Array<string>> = {};
      Object.entries(varDefinitions).forEach(([key, value]) => {
        if (isParsedValue(value) && value.tree.type === T_ARROW_EXPRESSION) {
          fnDeps[key] = collectVariableDependencies(value.tree, referenceTrackedApi);
        } else if (isArrowExpressionObject(value) && value.type === T_ARROW_EXPRESSION) {
          fnDeps[key] = collectVariableDependencies(value, referenceTrackedApi);
        }
      });
      const localFnDeps = collectFnVarDeps(fnDeps);
      // Merge parent function deps so child containers inherit dependency tracking
      // for functions defined in ancestor containers
      if (Object.keys(parentFnDeps).length === 0) return localFnDeps;
      if (Object.keys(localFnDeps).length === 0) return parentFnDeps;
      return { ...parentFnDeps, ...localFnDeps };
    }, [parentFnDeps, referenceTrackedApi, varDefinitions]);

    /**
     * Variable Resolution Strategy
     *
     * XMLUI variables can have dependencies on each other and on context variables.
     * Resolution happens in two passes to handle all dependency orderings correctly:
     *
     * Pass 1 (Pre-resolution):
     * - Resolves variables using current state context
     * - Handles forward references (e.g., function using $props defined later)
     * - Results are temporary and may be incomplete
     * - Uses a temporary memoization cache
     *
     * Pass 2 (Final resolution):
     * - Includes pre-resolved variables in the context
     * - Ensures all dependencies are available
     * - Results are memoized for performance
     * - Uses the persistent memoization cache
     *
     * Example: Given vars { fn: "$props.value", $props: "{x: 1}" }
     * - Pass 1: fn tries to use $props (not yet resolved, gets undefined or default)
     * - Pass 2: fn uses $props (now resolved to {x: 1}, works correctly)
     *
     * Future: Consider topological sort of dependencies to enable single-pass resolution
     */

    // Pass 1: Pre-resolve variables to handle forward references
    const preResolvedLocalVars = useVars(
      varDefinitions,
      functionDeps,
      localVarsStateContext,
      useRef<MemoedVars>(new Map()), // Temporary cache, discarded after this pass
    );

    // Merge pre-resolved variables into context for second pass
    const localVarsStateContextWithPreResolvedLocalVars = useShallowCompareMemoize({
      ...preResolvedLocalVars,
      ...localVarsStateContext,
    });

    // Pass 2: Final resolution with complete context
    const resolvedLocalVars = useVars(
      varDefinitions,
      functionDeps,
      localVarsStateContextWithPreResolvedLocalVars,
      memoedVars, // Persistent cache for performance
    );

    // ========================================================================
    // INSPECTOR LOGGING - VARIABLE CHANGES
    // ========================================================================

    // Create variable logger and track changes
    useEffect(() => {
      const variableLogger = createVariableLogger({
        node,
        varDefinitions,
        resolvedLocalVars,
        xsVerbose,
      });

      variableLogger.trackAndLogChanges();

      return () => {
        variableLogger.reset();
      };
    }, [xsVerbose, varDefinitions, resolvedLocalVars, node]);

    const mergedWithVars = useMergedState(resolvedLocalVars, componentStateWithApis);

    // ========================================================================
    // GLOBAL VARIABLES HANDLING
    // ========================================================================

    // Evaluate global variables with dependency tracking and runtime reactivity
    // See state/global-variables.ts for implementation details
    const stableCurrentGlobalVars = useGlobalVariables(
      parentGlobalVars,
      node.globalVars,
      node.functions,
      componentStateWithApis,
    );

    // ========================================================================
    // LAYER 6: FINAL STATE COMBINATION
    // ========================================================================

    const combinedState = useCombinedState(
      stateFromOutside,
      node.contextVars,
      stableCurrentGlobalVars, // Use stable reference
      mergedWithVars,
      routingParams,
    );

    // ========================================================================
    // LAYER 7: RESOLVE LIVE-REFERENCE SENTINELS
    // ========================================================================

    // When an event handler sets `myVar = someComponentApi` (e.g. `myData = ds`),
    // the event handler stores a sentinel `{ __liveApiRef__: "ds" }` as the variable
    // value so the binding stays live instead of capturing a stale snapshot.
    //
    // For **implicit containers** (those without an explicit `uses` boundary), the
    // loader state (e.g. DataSource's value/loaded) is dispatched to the *parent*
    // reducer via parentDispatch, not to this container's own useReducer. This means
    // `componentStateWithApis` does not contain the loader's string key ("ds"), so the
    // sentinel can't be resolved there. However, `combinedState` — which spreads in
    // `stateFromOutside` (the parent's combinedState) — *does* contain the loader's
    // data. We therefore resolve sentinels here, at the fully-combined state level,
    // where every layer is visible.
    const resolvedCombinedState = useMemo(() => {
      let modified = false;
      let result = combinedState;
      for (const key of Object.keys(combinedState)) {
        const val = (combinedState as any)[key];
        if (
          val !== null &&
          val !== undefined &&
          typeof val === "object" &&
          typeof val.__liveApiRef__ === "string"
        ) {
          const apiKey: string = val.__liveApiRef__;
          if (apiKey in combinedState) {
            if (!modified) {
              result = { ...combinedState };
              modified = true;
            }
            (result as any)[key] = (combinedState as any)[apiKey];
          }
        }
      }
      return result;
    }, [combinedState]);

    // ========================================================================
    // COMPONENT API REGISTRATION
    // ========================================================================

    const registerComponentApi: RegisterComponentApiFnInner = useCallback((uid, api) => {
      setComponentApis(
        produce((draft) => {
          // console.log("-----BUST----setComponentApis");
          if (!draft[uid]) {
            draft[uid] = {};
          }
          Object.entries(api).forEach(([key, value]) => {
            if (draft[uid][key] !== value) {
              // console.log(`-----BUST------new api for ${uid}`, draft[uid][key], value)
              draft[uid][key] = value;
            }
          });
        }),
      );
    }, []);

    const componentStateRef = useRef(componentStateWithApis);

    // Keep ref updated with latest componentStateWithApis
    useEffect(() => {
      componentStateRef.current = componentStateWithApis;
    }, [componentStateWithApis]);

    // ========================================================================
    // STATE CHANGE CALLBACK
    // ========================================================================

    // Keep mutable values in refs so statePartChanged stays a stable function
    // reference. statePartChanged is passed as a prop deep into the subtree; if
    // it changes on every render (e.g. because resolvedLocalVars changes when
    // oftenChanges++), every child Container re-renders despite memo — defeating
    // the computedUses optimisation. Refs let the callback always see the latest
    // values without creating a new function reference each render.
    const resolvedLocalVarsRef = useRef(resolvedLocalVars);
    resolvedLocalVarsRef.current = resolvedLocalVars;

    const stableCurrentGlobalVarsRef = useRef(stableCurrentGlobalVars);
    stableCurrentGlobalVarsRef.current = stableCurrentGlobalVars;

    const parentStatePartChangedRef = useRef(parentStatePartChanged);
    parentStatePartChangedRef.current = parentStatePartChanged;

    const nodeUsesRef = useRef(node.uses);
    nodeUsesRef.current = node.uses;

    const statePartChanged: StatePartChangedFn = useCallback(
      (pathArray, newValue, target, action) => {
        const key = pathArray[0];
        const localVars = resolvedLocalVarsRef.current;
        const globalVars = stableCurrentGlobalVarsRef.current;
        const isLocalVar = key in localVars;
        const isGlobalVar = key in globalVars;
        const isRoot = node.uid === "root";

        // Check local variables FIRST - they shadow globals
        if (isLocalVar) {
          // Local variable - handle locally (even if same name as global)
          dispatch({
            type: ContainerActionKind.STATE_PART_CHANGED,
            payload: {
              path: pathArray,
              value: newValue,
              target,
              actionType: action,
              localVars,
            },
          });
        } else if (isGlobalVar) {
          // Global variable (not shadowed by local)
          if (isRoot) {
            // Root container should handle global var updates itself
            // Use stableCurrentGlobalVars as localVars so the reducer can see
            // the original structure of the global variable (e.g., the full array)
            // when applying path-based updates like push operations.
            dispatch({
              type: ContainerActionKind.STATE_PART_CHANGED,
              payload: {
                path: pathArray,
                value: newValue,
                target,
                actionType: action,
                localVars: globalVars,
              },
            });
          } else {
            // Non-root containers bubble globals to parent
            parentStatePartChangedRef.current(pathArray, newValue, target, action);
          }
        } else if (key in componentStateRef.current) {
          // Component state - handle locally
          dispatch({
            type: ContainerActionKind.STATE_PART_CHANGED,
            payload: {
              path: pathArray,
              value: newValue,
              target,
              actionType: action,
              localVars,
            },
          });
        } else {
          // Not global, not local - bubble up if allowed by uses
          const uses = nodeUsesRef.current;
          if (!uses || uses.includes(key)) {
            parentStatePartChangedRef.current(pathArray, newValue, target, action);
          }
        }
      },
      // dispatch is stable (from useReducer); node.uid is part of a stable node object.
      // All other mutable values are accessed via refs above.
      [dispatch, node.uid],
    );

    // ========================================================================
    // RENDERING
    // ========================================================================

    return (
      <ErrorBoundary node={node} location={"container"}>
        <FnDepsProvider value={functionDeps}>
          <Container
            resolvedKey={resolvedKey}
            node={node}
            componentState={resolvedCombinedState}
            globalVars={stableCurrentGlobalVars}
            dispatch={dispatch}
            parentDispatch={parentDispatch}
            setVersion={setVersion}
            version={version}
            statePartChanged={statePartChanged}
            registerComponentApi={registerComponentApi}
            parentRegisterComponentApi={parentRegisterComponentApi}
            layoutContextRef={layoutContextRef}
            parentRenderContext={parentRenderContext}
            memoedVarsRef={memoedVars}
            isImplicit={isImplicit}
            fullParentStateRef={fullParentStateRef}
            ref={ref}
            uidInfoRef={uidInfoRef}
            {...rest}
          >
            {children}
          </Container>
        </FnDepsProvider>
      </ErrorBoundary>
    );
  }),
);
