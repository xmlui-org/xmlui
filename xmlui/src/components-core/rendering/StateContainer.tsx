import type { MutableRefObject, ReactNode, RefObject } from "react";
import { forwardRef, memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import produce from "immer";
import { cloneDeep, isEmpty, isPlainObject, merge } from "lodash-es";
import memoizeOne from "memoize-one";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

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
import { useAppContext } from "../AppContext";
import { extractParam } from "../utils/extractParam";
import type {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  StatePartChangedFn,
} from "./ContainerWrapper";
import type { ComponentApi } from "../../abstractions/ApiDefs";

import { useLinkInfoContext } from "../../components/App/LinkInfoContext";
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

    // Collect dependencies of global variables from expression trees
    // This enables re-evaluation when dependencies change (reactivity)
    const globalDependencies = useMemo(() => {
      const deps: Record<string, string[]> = {};
      
      // Collect dependencies from parent global vars
      if (parentGlobalVars) {
        for (const [key, value] of Object.entries(parentGlobalVars)) {
          if (key.startsWith("__")) continue;
          const treeKey = `__tree_${key}`;
          const tree = parentGlobalVars[treeKey];
          
          if (tree && typeof tree === "object") {
            // Extract variable dependencies from expression tree
            deps[key] = collectVariableDependencies(tree);
          }
        }
      }
      
      // Collect dependencies from node global vars
      if (node.globalVars) {
        for (const [key, value] of Object.entries(node.globalVars)) {
          if (key.startsWith("__")) continue;
          const treeKey = `__tree_${key}`;
          const tree = node.globalVars[treeKey];
          
          if (tree && typeof tree === "object") {
            // Extract variable dependencies from expression tree
            deps[key] = collectVariableDependencies(tree);
          }
        }
      }
      
      return deps;
    }, [parentGlobalVars, node.globalVars]);

    // Build a dependency map for triggering re-evaluation when global dependencies change
    // This includes actual runtime values of globals that other globals depend on
    const globalDepValueMap = useMemo(() => {
      const depMap: Record<string, any> = {};
      const allCurrentGlobals = { ...parentGlobalVars, ...node.globalVars };
      
      // For each global, collect the actual values of its dependencies
      for (const [globalKey, depNames] of Object.entries(globalDependencies)) {
        if (!depNames) continue;
        
        // Include values of direct dependencies
        for (const depName of depNames) {
          // Check if this is another global (in parentGlobalVars or node.globalVars)
          if (depName in allCurrentGlobals && !depName.startsWith("__")) {
            // Use the original string expression as the key, not the value
            // This way we can track when the definition changes
            const depGlobalValue = allCurrentGlobals[depName];
            const depKey = `${globalKey}:${depName}`;
            depMap[depKey] = depGlobalValue;
          }
        }
      }
      
      // Also include current values of componentState globals to detect runtime changes
      // When a global is updated (e.g., count++), the new value is stored in componentState
      // We need to detect this change to trigger re-evaluation of dependent globals
      if (node.globalVars) {
        for (const globalKey of Object.keys(node.globalVars)) {
          if (!globalKey.startsWith("__") && globalKey in componentStateWithApis) {
            // Include the actual runtime value from componentState
            const componentValue = componentStateWithApis[globalKey];
            depMap[`runtime:${globalKey}`] = componentValue;
          }
        }
      }
      
      return depMap;
    }, [globalDependencies, parentGlobalVars, node.globalVars, componentStateWithApis]);

    // Merge parent's globalVars with current node's globalVars
    // Current node's globalVars take precedence (usually only root defines them)
    // Evaluate any string expressions (binding expressions) in globalVars
    // IMPORTANT: This memo includes globalDepValueMap to trigger re-evaluation
    // when globals that affect others change during component lifetime
    const currentGlobalVars = useMemo(() => {
      // Evaluate parentGlobalVars if they contain string expressions
      const evaluatedParentGlobals: Record<string, any> = {};
      if (parentGlobalVars) {
        // Process parent globals in order, accumulating evaluated values
        // Skip __tree_* keys as they're metadata for re-evaluation
        for (const [key, value] of Object.entries(parentGlobalVars)) {
          if (key.startsWith("__")) {
            // Skip internal metadata keys
            continue;
          }
          if (typeof value === "string") {
            // Create state with previously evaluated parent globals for dependency resolution
            evaluatedParentGlobals[key] = extractParam(
              evaluatedParentGlobals,  // Include previously evaluated globals
              value,
              appContext,
              false,
            );
          } else {
            evaluatedParentGlobals[key] = value;
          }
        }
      }
      
      // Evaluate node.globalVars if they contain string expressions
      // Include both parent globals and previously evaluated node globals
      const evaluatedNodeGlobals: Record<string, any> = {};
      if (node.globalVars) {
        // Merge parent globals with node globals for evaluation context
        // START with componentStateWithApis values for any globals that have been updated at runtime
        // This is KEY for reactivity: when count++ updates count, subsequent globals can see the new value
        let globalsForContext = { ...evaluatedParentGlobals, ...evaluatedNodeGlobals };
        
        for (const [key, value] of Object.entries(node.globalVars)) {
          if (key.startsWith("__")) {
            // Skip internal metadata keys
            continue;
          }
          
          // CRITICAL: If this global was updated at runtime, use the runtime value directly
          // Don't re-evaluate the original expression (which would give the old value)
          if (key in componentStateWithApis) {
            evaluatedNodeGlobals[key] = componentStateWithApis[key];
            globalsForContext[key] = componentStateWithApis[key];
            continue;
          }
          
          if (typeof value === "string") {
            // CRITICAL: For evaluation, use componentStateWithApis values if they exist
            // This ensures that when a global is updated (e.g., count++), we see the NEW value, not the old one
            const evalContext: Record<string, any> = {};
            
            // First, define all globals that might be dependencies from their current runtime values
            if (node.globalVars) {
              for (const [globalKey] of Object.entries(node.globalVars)) {
                if (!globalKey.startsWith("__")) {
                  // Prefer componentStateWithApis value (runtime updated) over initially evaluated value
                  if (globalKey in componentStateWithApis) {
                    evalContext[globalKey] = componentStateWithApis[globalKey];
                  } else if (globalKey in globalsForContext) {
                    evalContext[globalKey] = globalsForContext[globalKey];
                  }
                }
              }
            }
            
            // Also include parent globals
            for (const [pkey, pval] of Object.entries(evaluatedParentGlobals)) {
              if (!(pkey in evalContext)) {
                evalContext[pkey] = pval;
              }
            }
            
            // Create state with all available globals for dependency resolution
            evaluatedNodeGlobals[key] = extractParam(
              evalContext,
              value,
              appContext,
              false,
            );
            // Update the context for subsequent variables with the newly evaluated value
            globalsForContext[key] = evaluatedNodeGlobals[key];
          } else {
            evaluatedNodeGlobals[key] = value;
            globalsForContext[key] = value;
          }
        }
      }
      
      // Add functions from node.functions (these are already evaluated function objects,not strings)
      if (node.functions) {
        Object.entries(node.functions).forEach(([funcName, funcValue]) => {
          evaluatedNodeGlobals[funcName] = funcValue;
        });
      }
      
      // Merge with node globals taking precedence
      return {
        ...evaluatedParentGlobals,
        ...evaluatedNodeGlobals,
      };   
    }, [parentGlobalVars, node.globalVars, node.functions, appContext, globalDepValueMap, globalDependencies, componentStateWithApis]);

    // Stabilize currentGlobalVars reference to prevent unnecessary re-renders
    // Only create new reference when values actually change (shallow comparison)
    const stableCurrentGlobalVars = useShallowCompareMemoize(currentGlobalVars);
    
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

/**
 * Hook to get routing-related parameters from React Router.
 * Returns pathname, route params, query params, and link info.
 */
const useRoutingParams = () => {
  const [queryParams] = useSearchParams();
  const routeParams = useParams();
  const location = useLocation();
  const linkInfoContext = useLinkInfoContext();
  const linkInfo = useMemo(() => {
    return linkInfoContext?.linkMap?.get(location.pathname) || EMPTY_OBJECT;
  }, [linkInfoContext?.linkMap, location.pathname]);

  const queryParamsMap = useMemo(() => {
    const result: Record<string, any> = {};
    for (const [key, value] of Array.from(queryParams.entries())) {
      result[key] = value;
    }
    return result;
  }, [queryParams]);

  return useMemo(() => {
    return {
      $pathname: location.pathname,
      $routeParams: routeParams,
      $queryParams: queryParamsMap,
      $linkInfo: linkInfo,
    };
  }, [linkInfo, location.pathname, queryParamsMap, routeParams]);
};

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
