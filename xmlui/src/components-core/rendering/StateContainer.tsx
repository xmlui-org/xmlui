import type { MutableRefObject, ReactNode, RefObject } from "react";
import { forwardRef, memo, useCallback, useMemo, useReducer, useRef, useState } from "react";
import produce from "immer";
import { cloneDeep, isEmpty, isPlainObject, merge, pick } from "lodash-es";
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
import { isParsedCodeDeclaration } from "../../abstractions/InternalMarkers";
import { useAppContext } from "../AppContext";
import { parseParameterString } from "../script-runner/ParameterParser";
import { evalBinding } from "../script-runner/eval-tree-sync";
import { extractParam } from "../utils/extractParam";
import { pickFromObject, shallowCompare } from "../utils/misc";
import type {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  StatePartChangedFn,
} from "./ContainerWrapper";
import type { ComponentApi } from "../../abstractions/ApiDefs";

import { useLinkInfoContext } from "../../components/App/LinkInfoContext";

// --- Properties of the MemoizedErrorProneContainer component
type Props = {
  node: ContainerWrapperDef;
  resolvedKey?: string;
  parentState: ContainerState;
  parentStatePartChanged: StatePartChangedFn;
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  parentDispatch: ContainerDispatcher;
  parentRenderContext?: ParentRenderContext;
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  uidInfoRef?: RefObject<Record<string, any>>;
  isImplicit?: boolean;
  children?: ReactNode;
};

// A React component that wraps a view container into an error boundary
// (it's a named function inside the memo, this way it will be visible with that name in the react devtools)
export const StateContainer = memo(
  forwardRef(function StateContainer(
    {
      node,
      resolvedKey,
      parentState,
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

    /**
     * STATE COMPOSITION PIPELINE
     *
     * The container state is assembled from multiple sources in a specific order and priority.
     * Understanding this flow is critical for debugging state issues.
     *
     * FLOW DIAGRAM:
     * ┌─────────────────────────────────────────────────────────────┐
     * │ 1. Parent State (scoped by `uses` property)                │
     * │    - Inherited from parent container                       │
     * │    - Filtered by `uses` property if present (creates boundary)
     * │    - Lines 76-78: extractScopedState() filters parent     │
     * └──────────────────────┬──────────────────────────────────────┘
     *                        ↓
     * ┌─────────────────────────────────────────────────────────────┐
     * │ 2. Component Reducer State                                  │
     * │    - Managed by container's reducer                        │
     * │    - Contains loader states, event lifecycle flags         │
     * │    - Examples: { dataLoader: { loaded: true, data: [...] },
     * │               eventInProgress: true }                      │
     * │    - Lines 83-84: useReducer creates this state           │
     * └──────────────────────┬──────────────────────────────────────┘
     *                        ↓
     * ┌─────────────────────────────────────────────────────────────┐
     * │ 3. Component APIs (exposed methods)                        │
     * │    - Methods exposed by child components                   │
     * │    - Registered via registerComponentApi callback          │
     * │    - Examples: { getSelectedRows(), fetchData() }         │
     * │    - Lines 86-87: useState manages component APIs         │
     * └──────────────────────┬──────────────────────────────────────┘
     *                        ↓
     * ┌─────────────────────────────────────────────────────────────┐
     * │ 4. Context Variables (framework-injected)                 │
     * │    - Special variables like $item, $itemIndex             │
     * │    - Provided by parent components (e.g., DataTable row)   │
     * │    - Lines 108: localVarsStateContext combines these      │
     * └──────────────────────┬──────────────────────────────────────┘
     *                        ↓
     * ┌─────────────────────────────────────────────────────────────┐
     * │ 5. Local Variables (vars, functions, script)              │
     * │    - Declared in component definition                     │
     * │    - Resolved in two passes for forward references        │
     * │    - Highest priority (can shadow parent state)           │
     * │    - Two-pass resolution explained below                  │
     * │    - Lines 123-184: Complex variable resolution           │
     * └──────────────────────┬──────────────────────────────────────┘
     *                        ↓
     * ┌─────────────────────────────────────────────────────────────┐
     * │ 6. Routing Parameters (app-level context)                 │
     * │    - Added last, always available                         │
     * │    - Examples: $pathname, $routeParams, $hash             │
     * │    - Line 185-189: useCombinedState merges all sources   │
     * └──────────────────────┬──────────────────────────────────────┘
     *                        ↓
     *                  FINAL COMBINED STATE
     *
     * PRIORITY ORDER (later overrides earlier):
     * 1. Parent State (lowest priority)
     * 2. Component State + APIs
     * 3. Context Variables
     * 4. Local Variables (highest priority - can shadow parent state)
     * 5. Routing Parameters (additive, always available)
     *
     * EXAMPLE - Multi-level composition:
     *
     * Parent Container (parentState):
     * { user: { id: 1, name: "John" }, count: 0 }
     *
     * <Stack uses="['user']" var.count="{10}">
     *   - Parent State (after scoping): { user: { id: 1, name: "John" } }
     *   - Local vars: { count: 10 }
     *   - Result: { user: { id: 1, name: "John" }, count: 10 }
     *
     *   CONTRAST: Without 'uses':
     *   <Stack var.count="{10}">
     *   - Parent State (no scoping): { user: { id: 1, name: "John" }, count: 0 }
     *   - Local vars: { count: 10 }
     *   - Result: { user: { id: 1, name: "John" }, count: 10 } (local vars override)
     *
     * DEBUGGING TIPS:
     * - Enable debug mode on component: <Stack debug>
     * - Check debugView.stateTransitions for state changes
     * - Each level can be inspected in React DevTools
     * - Variable resolution errors logged to console
     */

    const stateFromOutside = useShallowCompareMemoize(
      useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState]),
    );

    // --- All state manipulation happens through the container reducer, which is created here.
    // --- This reducer allow collecting state changes for debugging purposes. The `debugView`
    // --- contains the debug configuration; it may enable (or disable) logging.
    const debugView = useDebugView();
    const containerReducer = createContainerReducer(debugView);
    const [componentState, dispatch] = useReducer(containerReducer, EMPTY_OBJECT);

    // --- The exposed APIs of components are also the part of the state.
    const [componentApis, setComponentApis] = useState<Record<symbol, ComponentApi>>(EMPTY_OBJECT);

    const componentStateWithApis = useShallowCompareMemoize(
      useMemo(() => {
        const ret = { ...componentState };
        for (const stateKey of Object.getOwnPropertySymbols(componentState)) {
          const value = componentState[stateKey];
          if (stateKey.description) {
            ret[stateKey.description] = value;
          }
        }
        if (Reflect.ownKeys(componentApis).length === 0) {
          //skip containers with no registered apis
          return ret;
        }
        for (const componentApiKey of Object.getOwnPropertySymbols(componentApis)) {
          const value = componentApis[componentApiKey];
          if (componentApiKey.description) {
            const key = componentApiKey.description;
            ret[key] = { ...(ret[key] || {}), ...value };
          }
          ret[componentApiKey] = { ...ret[componentApiKey], ...value };
        }
        return ret;
      }, [componentState, componentApis]),
    );

    const localVarsStateContext = useCombinedState(
      stateFromOutside,
      componentStateWithApis,
      node.contextVars,
    );
    const parsedScriptPart = node.scriptCollected;
    if (parsedScriptPart?.moduleErrors && !isEmpty(parsedScriptPart.moduleErrors)) {
      throw new CodeBehindParseError(parsedScriptPart.moduleErrors);
    }

    if (node.scriptError && !isEmpty(node.scriptError)) {
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

    const mergedWithVars = useMergedState(resolvedLocalVars, componentStateWithApis);
    const combinedState = useCombinedState(
      stateFromOutside,
      node.contextVars,
      mergedWithVars,
      routingParams,
    );

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

    const statePartChanged: StatePartChangedFn = useCallback(
      (pathArray, newValue, target, action) => {
        const key = pathArray[0];
        if (key in componentStateRef.current || key in resolvedLocalVars) {
          // --- Sign that a state field (or a part of it) has changed
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
          if (!node.uses || node.uses.includes(key)) {
            parentStatePartChanged(pathArray, newValue, target, action);
          }
        }
      },
      [resolvedLocalVars, node.uses, parentStatePartChanged],
    );

    return (
      <ErrorBoundary node={node} location={"container"}>
        <Container
          resolvedKey={resolvedKey}
          node={node}
          componentState={combinedState}
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

// Extracts the `state` property values defined in a component definition's `uses` property. It uses the specified
// `appContext` when resolving the state values.
function extractScopedState(
  parentState: ContainerState,
  uses?: string[],
): ContainerState | undefined {
  if (!uses) {
    return parentState;
  }
  if (uses.length === 0) {
    return EMPTY_OBJECT;
  }
  return pick(parentState, uses);
}

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

// This hook resolves variables to their current value (using binding expression evaluation)
function useVars(
  vars: ContainerState = EMPTY_OBJECT,
  fnDeps: Record<string, Array<string>> = EMPTY_OBJECT,
  componentState: ContainerState,
  memoedVars: MutableRefObject<MemoedVars>,
): ContainerState {
  const appContext = useAppContext();
  const referenceTrackedApi = useReferenceTrackedApi(componentState);

  const resolvedVars = useMemo(() => {
    const ret: any = {};

    Object.entries(vars).forEach(([key, value]) => {
      if (key === "$props") {
        // --- We already resolved props in a compound component
        ret[key] = value;
      } else {
        if (!isParsedValue(value) && typeof value !== "string") {
          ret[key] = value;
        } else {
          // --- Resolve each variable's value, without going into the details of arrays and objects
          if (!memoedVars.current.has(value)) {
            memoedVars.current.set(value, {
              getDependencies: memoizeOne((value, referenceTrackedApi) => {
                if (isParsedValue(value)) {
                  return collectVariableDependencies(value.tree, referenceTrackedApi);
                }
                // console.log(`GETTING DEPENDENCY FOR ${value} with:`, referenceTrackedApi);
                const params = parseParameterString(value);
                let ret = new Set<string>();
                params.forEach((param) => {
                  if (param.type === "expression") {
                    ret = new Set([
                      ...ret,
                      ...collectVariableDependencies(param.value, referenceTrackedApi),
                    ]);
                  }
                });
                return Array.from(ret);
              }),
              obtainValue: memoizeOne(
                (value, state, appContext, strict, deps, appContextDeps) => {
                  // console.log(
                  //   "VARS, BUST, obtain value called with",
                  //   value,
                  //   { state, appContext },
                  //   {
                  //     deps,
                  //     appContextDeps,
                  //   }
                  // );
                  try {
                    return isParsedValue(value)
                      ? evalBinding(value.tree, {
                          localContext: state,
                          appContext,
                          options: {
                            defaultToOptionalMemberAccess: true,
                          },
                        })
                      : extractParam(state, value, appContext, strict);
                  } catch (e) {
                    console.log(state);
                    throw new ParseVarError(value, e);
                  }
                },
                (
                  [
                    _newExpression,
                    _newState,
                    _newAppContext,
                    _newStrict,
                    newDeps,
                    newAppContextDeps,
                  ],
                  [
                    _lastExpression,
                    _lastState,
                    _lastAppContext,
                    _lastStrict,
                    lastDeps,
                    lastAppContextDeps,
                  ],
                ) => {
                  return (
                    shallowCompare(newDeps, lastDeps) &&
                    shallowCompare(newAppContextDeps, lastAppContextDeps)
                  );
                },
              ),
            });
          }
          const stateContext: ContainerState = { ...ret, ...componentState };

          let dependencies: Array<string> = [];
          if (fnDeps[key]) {
            dependencies = fnDeps[key];
          } else {
            memoedVars.current
              .get(value)!
              .getDependencies(value, referenceTrackedApi)
              .forEach((dep) => {
                if (fnDeps[dep]) {
                  dependencies.push(...fnDeps[dep]);
                } else {
                  dependencies.push(dep);
                }
              });
            dependencies = [...new Set(dependencies)];
          }
          const stateDepValues = pickFromObject(stateContext, dependencies);
          const appContextDepValues = pickFromObject(appContext, dependencies);
          // console.log("VARS, obtain value called with", stateDepValues, appContextDepValues);

          ret[key] = memoedVars.current
            .get(value)!
            .obtainValue(
              value,
              stateContext,
              appContext,
              true,
              stateDepValues,
              appContextDepValues,
            );
        }
      }
    });
    return ret;
  }, [appContext, componentState, fnDeps, memoedVars, referenceTrackedApi, vars]);

  return useShallowCompareMemoize(resolvedVars);
}

class CodeBehindParseError extends Error {
  constructor(errors: ModuleErrors) {
    const mainErrors = errors["Main"] || [];
    const messages = mainErrors.map((errorMessage) => {
      let ret = `${errorMessage.code} : ${errorMessage.text}`;
      const posInfo = [];
      if (errorMessage.line !== undefined) {
        posInfo.push(`line:${errorMessage.line}`);
      }
      if (errorMessage.column !== undefined) {
        posInfo.push(`column:${errorMessage.column}`);
      }
      if (posInfo.length) {
        ret = `${ret} (${posInfo.join(", ")})`;
      }
      return ret;
    });
    super(messages.join("\n"));
    Object.setPrototypeOf(this, CodeBehindParseError.prototype);
  }
}

class ParseVarError extends Error {
  constructor(varName: string, originalError: any) {
    super(`Error on var: ${varName} - ${originalError?.message || "unknown"}`);
  }
}

//true if it's coming from a code behind or a script tag
function isParsedValue(value: any): value is CodeDeclaration {
  return isParsedCodeDeclaration(value);
}
