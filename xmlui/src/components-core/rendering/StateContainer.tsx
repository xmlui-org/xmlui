import type { MutableRefObject, ReactNode, RefObject } from "react";
import { forwardRef, memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import produce from "immer";
import { cloneDeep, isEmpty, isPlainObject, merge } from "lodash-es";
import memoizeOne from "memoize-one";

import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "./containers";
import type { CodeDeclaration, ModuleErrors } from "../script-runner/ScriptingSourceTree";
import { T_ARROW_EXPRESSION } from "../script-runner/ScriptingSourceTree";
import { EMPTY_OBJECT } from "../constants";
import { collectFnVarDeps } from "../rendering/collectFnVarDeps";
import { createContainerReducer } from "../rendering/reducer";
import { useDebugView } from "../DebugViewProvider";
import { ErrorBoundary } from "../rendering/ErrorBoundary";
import { collectVariableDependencies } from "../script-runner/visitors";
import { useReferenceTrackedApi, useShallowCompareMemoize } from "../utils/hooks";
import { Container } from "./Container";
import { getCurrentTrace } from "../inspector/inspectorUtils";
import { createVariableLogger } from "../inspector/variable-logging";
import { mergeComponentApis, STATE_LAYER_DOCUMENTATION } from "../state/state-layers";
import { useVars, isParsedValue } from "../state/variable-resolution";
import { useGlobalVariables } from "../state/global-variables";
import { useRoutingParams } from "../state/routing-state";
import { useAppContext } from "../AppContext";
import { extractParam } from "../utils/extractParam";
import type {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  StatePartChangedFn,
} from "./ContainerWrapper";
import type { ComponentApi } from "../../abstractions/ApiDefs";
import {
  extractScopedState,
  CodeBehindParseError,
  ParseVarError,
} from "./ContainerUtils";

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
  /** Child elements to render */
  children?: ReactNode;
};

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
      useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState]),
    );

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
      useMemo(() => mergeComponentApis(componentState, componentApis), [componentState, componentApis]),
    );

    // ========================================================================
    // LAYER 4: CONTEXT VARIABLES
    // ========================================================================

    const localVarsStateContext = useCombinedState(
      stateFromOutside,
      componentStateWithApis,
      node.contextVars,
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
    const functionDeps = useMemo(() => {
      const fnDeps: Record<string, Array<string>> = {};
      Object.entries(varDefinitions).forEach(([key, value]) => {
        if (isParsedValue(value) && value.tree.type === T_ARROW_EXPRESSION) {
          fnDeps[key] = collectVariableDependencies(value.tree, referenceTrackedApi);
        }
      });
      return collectFnVarDeps(fnDeps);
    }, [referenceTrackedApi, varDefinitions]);

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
      stableCurrentGlobalVars,  // Use stable reference
      mergedWithVars,
      routingParams,
    );

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

    const statePartChanged: StatePartChangedFn = useCallback(
      (pathArray, newValue, target, action) => {
        const key = pathArray[0];
        const isLocalVar = key in resolvedLocalVars;
        const isGlobalVar = key in stableCurrentGlobalVars;
        const isRoot = node.uid === 'root';
        
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
              localVars: resolvedLocalVars,
            },
          });
        } else if (isGlobalVar) {
          // Global variable (not shadowed by local)
          if (isRoot) {
            // Root container should handle global var updates itself
            dispatch({
              type: ContainerActionKind.STATE_PART_CHANGED,
              payload: {
                path: pathArray,
                value: newValue,
                target,
                actionType: action,
                localVars: resolvedLocalVars,
              },
            });
          } else {
            // Non-root containers bubble globals to parent
            parentStatePartChanged(pathArray, newValue, target, action);
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
              localVars: resolvedLocalVars,
            },
          });
        } else {
          // Not global, not local - bubble up if allowed by uses
          if (!node.uses || node.uses.includes(key)) {
            parentStatePartChanged(pathArray, newValue, target, action);
          }
        }
      },
      [resolvedLocalVars, stableCurrentGlobalVars, node.uses, node.uid, parentStatePartChanged],
    );

    // ========================================================================
    // RENDERING
    // ========================================================================

    return (
      <ErrorBoundary node={node} location={"container"}>
        <Container
          resolvedKey={resolvedKey}
          node={node}
          componentState={combinedState}
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
          ref={ref}
          uidInfoRef={uidInfoRef}
          {...rest}
        >
          {children}
        </Container>
      </ErrorBoundary>
    );
  }),
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// This hook combines state properties in a list of states so that a particular state property in a higher
// argument index overrides the same-named state property in a lower argument index.
function useCombinedState(...states: (ContainerState | undefined)[]) {
  const combined: ContainerState = useMemo(() => {
    let ret: ContainerState = {};
    states.forEach((state = EMPTY_OBJECT) => {
      // console.log("st", state);
      if (state !== EMPTY_OBJECT) {
        ret = { ...ret, ...state };
      }
      // console.log("ret", ret);
    });
    return ret;
  }, [states]);
  return useShallowCompareMemoize(combined);
}

// This hook combines state properties in a list of states so that a particular state property in a higher
// argument index merges into the same-named state property in a lower argument index.

// This hook combines state properties in a list of states so that a particular state property in a higher
// argument index merges into the same-named state property in a lower argument index.
function useMergedState(localVars: ContainerState, componentState: ContainerState) {
  const merged = useMemo(() => {
    const ret = { ...localVars };
    Reflect.ownKeys(componentState).forEach((key) => {
      const value = componentState[key];
      if (ret[key] === undefined) {
        ret[key] = value;
      } else {
        if (isPlainObject(ret[key]) && isPlainObject(value)) {
          ret[key] = merge(cloneDeep(ret[key]), value);
        } else {
          ret[key] = value;
        }
      }
    });
    return ret;
  }, [localVars, componentState]);
  return useShallowCompareMemoize(merged);
}
