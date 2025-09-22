import {
  forwardRef,
  memo,
  MutableRefObject,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import produce from "immer";
import { cloneDeep, isEmpty, isPlainObject, merge, pick } from "lodash-es";
import memoizeOne from "memoize-one";
import { useLocation, useParams, useSearchParams } from "@remix-run/react";

import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "./containers";
import {
  CodeDeclaration,
  ModuleErrors,
  T_ARROW_EXPRESSION,
} from "../script-runner/ScriptingSourceTree";
import { EMPTY_OBJECT } from "../constants";
import { collectFnVarDeps } from "../rendering/collectFnVarDeps";
import { createContainerReducer } from "../rendering/reducer";
import { useDebugView } from "../DebugViewProvider";
import { ErrorBoundary } from "../rendering/ErrorBoundary";
import { collectVariableDependencies } from "../script-runner/visitors";
import { useReferenceTrackedApi, useShallowCompareMemoize, usePrevious } from "../utils/hooks";
import { Container } from "./Container";
import { PARSED_MARK_PROP } from "../../parsers/scripting/code-behind-collect";
import { useAppContext } from "../AppContext";
import { parseParameterString } from "../script-runner/ParameterParser";
import { evalBinding } from "../script-runner/eval-tree-sync";
import { extractParam } from "../utils/extractParam";
import { pickFromObject, shallowCompare } from "../utils/misc";
import {
  ComponentApi,
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  StatePartChangedFn,
} from "./ContainerWrapper";
import { useLinkInfoContext } from "../../components/App/LinkInfoContext";

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

// Render frequency tracking for detecting excessive re-renders
const renderCounts = new Map<string, { count: number; lastReset: number }>();
const RENDER_COUNT_WINDOW = 5000; // 5 second window
const EXCESSIVE_RENDER_THRESHOLD = 10;

const trackRenderFrequency = (componentId: string): boolean => {
  const now = Date.now();
  const existing = renderCounts.get(componentId);

  if (!existing || now - existing.lastReset > RENDER_COUNT_WINDOW) {
    renderCounts.set(componentId, { count: 1, lastReset: now });
    return false;
  }

  existing.count++;
  const isExcessive = existing.count > EXCESSIVE_RENDER_THRESHOLD;

  if (isExcessive && existing.count === EXCESSIVE_RENDER_THRESHOLD + 1) {
    console.warn(
      `[🚨 RENDER STORM] Component '${componentId}' rendered ${existing.count} times in ${RENDER_COUNT_WINDOW / 1000}s`,
    );
  }

  return isExcessive;
};

/**
 * Reactivity logging configuration - gated by window.logReactivity
 *
 * Usage:
 * window.logReactivity = {
 *   // Core tracking
 *   variables: true,        // Variable resolution and content analysis
 *   components: true,       // Component render tracking
 *   stateChanges: true,     // State change detection
 *   queryKeys: true,        // Query key calculation
 *
 *   // Advanced tracking
 *   dataFlow: true,         // Data flow and component interactions
 *   apiTracking: true,      // API requests and refetches
 *   userInteractions: true, // User clicks and form submissions
 *   cascade: true,          // Component cascade effects
 *   routing: true,          // Route changes
 *   causality: true,        // Trigger chain analysis
 *
 *   // Debugging modes
 *   verbose: true,          // Detailed logging (more noise)
 *   stackTraces: true       // Include stack traces in logs
 * }
 */
const getLogReactivity = (): boolean | { [key: string]: any } | null => {
  if (typeof window === "undefined") return false;
  const config = (window as any).logReactivity;
  if (typeof config === "boolean") return config;
  if (typeof config === "object" && config !== null) {
    // Check the master switch first
    if (config.enabled === false) return false;
    return config;
  }
  return false;
};

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

    const stateFromOutside = useShallowCompareMemoize(
      useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState]),
    );

    // Lightweight logging - only when explicitly enabled
    const logConfig = getLogReactivity();
    const prevParentState = logConfig ? usePrevious(parentState) : undefined;

    // Debug logging to see if StateContainer logging is working
    if (node.uid === 'root') {
      console.log('[🔍 DEBUG] StateContainer render check', {
        logConfig: logConfig,
        components: typeof logConfig === 'object' && logConfig !== null ? logConfig.components : false,
        nodeUid: node.uid
      });
    }

    // Enhanced component render logging with frequency tracking
    if (
      logConfig &&
      (logConfig === true || (typeof logConfig === "object" && logConfig !== null && logConfig.components)) &&
      node.uid
    ) {
      const renderStart = performance.now();
      const isExcessiveRendering = trackRenderFrequency(node.uid);

      // Use setTimeout to move logging off the render path
      setTimeout(() => {
        const renderDuration = performance.now() - renderStart;
        const interactionContext = getInteractionContext();

        // Build component hierarchy context
        const hierarchyInfo = {
          component: node.uid,
          hasChildren: node.children && node.children.length > 0,
          childCount: node.children?.length || 0,
          renderDuration: renderDuration.toFixed(2) + "ms",
          renderStorm: isExcessiveRendering,
          // Add interaction correlation
          ...(interactionContext ? {
            interactionTriggered: true,
            interactionType: interactionContext.interactionType,
            timeSinceInteraction: interactionContext.timeSinceInteraction + 'ms',
            targetElement: interactionContext.target?.tagName,
            targetId: interactionContext.target?.id
          } : { interactionTriggered: false })
        };

        console.log(`[StateContainer Render] Component '${node.uid}' rendering`, hierarchyInfo);

        // Cascade detection for component renders
        if (typeof logConfig === 'object' && logConfig !== null && logConfig.cascade) {
          // Check if this is part of a cascade by looking at recent renders
          const isExcessive = trackRenderFrequency(node.uid);
          if (isExcessive) {
            console.log(`[🔗 CASCADE DETECTED] Component '${node.uid}' is part of a render cascade`, {
              likelyCause: 'query_invalidation_or_state_cascade',
              interactionTriggered: interactionContext ? true : false,
              hasChildren: (node.children?.length || 0) > 0,
              childCount: node.children?.length || 0
            });
          }
        }

        if (typeof logConfig === 'object' && logConfig !== null && logConfig.stateChanges && prevParentState && prevParentState !== parentState) {
          // Analyze what changed in parent state
          const parentStateKeys = Object.keys(parentState || {});
          const prevParentStateKeys = Object.keys(prevParentState || {});
          const changedKeys = parentStateKeys.filter(
            (k) => (parentState as any)?.[k] !== (prevParentState as any)?.[k],
          );

          console.log(`[🔄 Parent State Changed] Component '${node.uid}':`, {
            changedKeys: changedKeys.length > 0 ? changedKeys : "reference_change",
            cascadeRisk: node.children?.length || 0,
          });

          if (typeof logConfig === 'object' && logConfig !== null && logConfig.cascade) {
            console.log(
              `[🔗 CASCADE TRIGGER] State change in '${node.uid}' may cascade to ${node.children?.length || 0} children`,
            );
          }

          // Track component interaction patterns
          if (typeof logConfig === 'object' && logConfig !== null && logConfig.dataFlow) {
            console.log(`[🌊 COMPONENT INTERACTION] '${node.uid}' state change`, {
              hasChildren: (node.children?.length || 0) > 0,
              childComponents:
                node.children?.map((child) => child.uid || "unnamed").slice(0, 3) || [],
              interactionType: "parent_to_child_state_flow",
            });
          }
        }

        // Flag slow renders
        if (renderDuration > 16) {
          console.warn(
            `[🐌 SLOW COMPONENT] '${node.uid}' took ${renderDuration.toFixed(2)}ms to render`,
          );
        }
      }, 0);
    }

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

    const localVarsStateContext = useStateMerge(
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
      ...parsedScriptPart?.functions,
      ...node.functions,
      ...parsedScriptPart?.vars,
      ...node.vars,
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

    // then resolve vars and replace function deps with the collected deps for that function
    //first resolve round (we do 2, to make sure that the order of the definitions doesn't cause problems)
    // e.g. 'testFn' uses $props, but $props is not resolved yet
    const preResolvedLocalVars = useVars(
      varDefinitions,
      functionDeps,
      localVarsStateContext,
      useRef<MemoedVars>(new Map()),
      node.uid,
    );
    const localVarsStateContextWithPreResolvedLocalVars = useShallowCompareMemoize({
      ...preResolvedLocalVars,
      ...localVarsStateContext,
    });

    const resolvedLocalVars = useVars(
      varDefinitions,
      functionDeps,
      localVarsStateContextWithPreResolvedLocalVars,
      memoedVars,
      node.uid,
    );

    const mergedWithVars = useMergedState(resolvedLocalVars, componentStateWithApis);
    const combinedState = useStateMerge(
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

  // Track individual routing dependencies
  const prevLocation = usePrevious(location);
  const prevQueryParams = usePrevious(queryParams);
  const prevRouteParams = usePrevious(routeParams);
  const prevLinkInfoContext = usePrevious(linkInfoContext);

  const routingLogConfig = getLogReactivity();
  if (
    routingLogConfig &&
    typeof routingLogConfig === "object" &&
    routingLogConfig !== null &&
    routingLogConfig.routing
  ) {
    // Use setTimeout to move logging off the render path
    setTimeout(() => {
      if (prevLocation && prevLocation !== location) {
        console.log("[🚸 LOCATION CHANGED]", location.pathname);
      }
      if (prevQueryParams && prevQueryParams !== queryParams) {
        console.log("[🚸 QUERY PARAMS CHANGED]");
      }
      if (prevRouteParams && prevRouteParams !== routeParams) {
        console.log("[🚸 ROUTE PARAMS CHANGED]");
      }
      if (prevLinkInfoContext && prevLinkInfoContext !== linkInfoContext) {
        console.log("[🚸 LINK INFO CONTEXT CHANGED]");
      }
    }, 0);
  }
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

  const routingState = useMemo(() => {
    return {
      $pathname: location.pathname,
      $routeParams: routeParams,
      $queryParams: queryParamsMap,
      $linkInfo: linkInfo,
    };
  }, [linkInfo, location.pathname, queryParamsMap, routeParams]);

  // Log routing changes with detailed analysis
  const prevRoutingState = usePrevious(routingState);
  const routingStateLogConfig = getLogReactivity();
  if (
    routingStateLogConfig &&
    typeof routingStateLogConfig === "object" &&
    routingStateLogConfig !== null &&
    routingStateLogConfig.routing &&
    prevRoutingState &&
    prevRoutingState !== routingState
  ) {
    console.log("[🚨 ROUTING CHANGED]", {
      timestamp: Date.now(),
      routingChanged: true,
      // Safe detailed comparison
      pathnameChanged: prevRoutingState.$pathname !== routingState.$pathname,
      queryParamsChanged: prevRoutingState.$queryParams !== routingState.$queryParams,
      routeParamsChanged: prevRoutingState.$routeParams !== routingState.$routeParams,
      linkInfoChanged: prevRoutingState.$linkInfo !== routingState.$linkInfo,
      // Log actual values for debugging
      currentPathname: routingState.$pathname,
      prevPathname: prevRoutingState.$pathname,
      currentQueryParamsKeys: Object.keys(routingState.$queryParams || {}),
      prevQueryParamsKeys: Object.keys(prevRoutingState.$queryParams || {}),
      currentRouteParamsKeys: Object.keys(routingState.$routeParams || {}),
      prevRouteParamsKeys: Object.keys(prevRoutingState.$routeParams || {}),
    });
  }

  return routingState;
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

// This hook merges multiple state objects with precedence: later arguments override earlier ones.
// Used to combine parent state, component state, context vars, and routing params into a single state object.
function useStateMerge(...states: (ContainerState | undefined)[]) {
  const merged: ContainerState = useMemo(() => {
    let ret: ContainerState = {};
    states.forEach((state = EMPTY_OBJECT, index) => {
      if (state !== EMPTY_OBJECT) {
        ret = { ...ret, ...state };
      }
    });
    return ret;
  }, [states]);
  return useShallowCompareMemoize(merged);
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
        if (
          (isPlainObject(ret[key]) && isPlainObject(value)) ||
          (Array.isArray(ret[key]) && Array.isArray(value))
        ) {
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
  componentUid?: string,
): ContainerState {
  const appContext = useAppContext();
  const referenceTrackedApi = useReferenceTrackedApi(componentState);

  const varsLogConfig = getLogReactivity();
  const resolvedVars = useMemo(() => {
    // Only log resolution triggers for slow variables or when explicitly enabled
    if (
      varsLogConfig &&
      typeof varsLogConfig === "object" &&
      varsLogConfig !== null &&
      varsLogConfig.variables &&
      varsLogConfig.verbose
    ) {
      setTimeout(() => {
        console.log(`[🚀 RESOLUTION TRIGGER] Variable resolution triggered by dependency change`);
      }, 0);
    }

    if (
      varsLogConfig &&
      typeof varsLogConfig === "object" &&
      varsLogConfig !== null &&
      varsLogConfig.variables
    ) {
      // Only log if there are non-standard variables (not just $props, emitEvent, etc.)
      const nonStandardVars = Object.keys(vars).filter(
        (key) => !["$props", "emitEvent", "hasEventHandler", "updateState"].includes(key),
      );
      if (nonStandardVars.length > 0) {
        const resolutionStart = performance.now();
        setTimeout(() => {
          const resolutionDuration = performance.now() - resolutionStart;

          // Analyze variable content and complexity
          const variableAnalysis = nonStandardVars.map((varName) => {
            const varValue = vars[varName];
            let analysis: any = { name: varName, type: typeof varValue };

            if (Array.isArray(varValue)) {
              analysis = { ...analysis, type: "array", length: varValue.length };
            } else if (varValue && typeof varValue === "object") {
              analysis = { ...analysis, type: "object", keys: Object.keys(varValue).length };
            } else if (typeof varValue === "string") {
              analysis = { ...analysis, length: varValue.length };
            }

            return analysis;
          });

          console.log("[useVars Resolution] Starting variable resolution for:", nonStandardVars, {
            variableCount: nonStandardVars.length,
            resolutionTime: resolutionDuration.toFixed(2) + "ms",
            dependencyChain: "vars → componentState → resolvedVars",
            variableAnalysis: variableAnalysis,
          });

          // Flag performance issues
          if (nonStandardVars.length > 10) {
            console.warn(
              `[⚠️ MANY VARIABLES] Resolving ${nonStandardVars.length} variables may impact performance`,
            );
          }
          if (resolutionDuration > 20) {
            console.warn(
              `[⚠️ SLOW VARIABLE RESOLUTION] Resolution took ${resolutionDuration.toFixed(2)}ms`,
              {
                slowVariables: variableAnalysis.filter(
                  (v: any) =>
                    (v.type === "array" && v.length > 100) || (v.type === "object" && v.keys > 50),
                ),
              },
            );
          }
        }, 0);
      }
    }
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
            // Only log cache misses for verbose mode
            if (
              varsLogConfig &&
              typeof varsLogConfig === "object" &&
              varsLogConfig !== null &&
              varsLogConfig.variables &&
              varsLogConfig.verbose
            ) {
              setTimeout(() => {
                console.log(`[🆕 CACHE MISS] Variable '${key}' not in memoization cache`);
              }, 0);
            }

            memoedVars.current.set(value, {
              getDependencies: memoizeOne((value, referenceTrackedApi) => {
                const depStart = performance.now();
                let dependencies;

                if (isParsedValue(value)) {
                  dependencies = collectVariableDependencies(value.tree, referenceTrackedApi);
                } else {
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
                  dependencies = Array.from(ret);
                }

                // Only log dependencies for slow calculations or verbose mode
                if (
                  varsLogConfig &&
                  typeof varsLogConfig === "object" &&
                  varsLogConfig !== null &&
                  varsLogConfig.variables
                ) {
                  const depDuration = performance.now() - depStart;
                  if (depDuration > 1 || varsLogConfig.verbose) {
                    setTimeout(() => {
                      console.log(`[🔗 DEPENDENCIES] Variable '${key}' depends on:`, {
                        dependencies: dependencies,
                        dependencyCount: dependencies.length,
                        calculationTime: depDuration.toFixed(2) + "ms",
                      });
                    }, 0);
                  }
                }

                return dependencies;
              }),
              obtainValue: memoizeOne(
                (value, state, appContext, strict, deps, appContextDeps) => {
                  const valueStart = performance.now();

                  // Only log value resolution in verbose mode
                  if (
                    varsLogConfig &&
                    typeof varsLogConfig === "object" &&
                    varsLogConfig !== null &&
                    varsLogConfig.variables &&
                    varsLogConfig.verbose
                  ) {
                    setTimeout(() => {
                      console.log(`[🔄 VALUE RESOLUTION] Variable '${key}' resolving value`);
                    }, 0);
                  }

                  try {
                    const result = isParsedValue(value)
                      ? evalBinding(value.tree, {
                          localContext: state,
                          appContext,
                          options: {
                            defaultToOptionalMemberAccess: true,
                          },
                        })
                      : extractParam(state, value, appContext, strict);

                    // Only log slow resolutions or verbose mode
                    if (
                      varsLogConfig &&
                      typeof varsLogConfig === "object" &&
                      varsLogConfig !== null &&
                      varsLogConfig.variables
                    ) {
                      const valueDuration = performance.now() - valueStart;
                      if (valueDuration > 5 || varsLogConfig.verbose) {
                        setTimeout(() => {
                          console.log(
                            `[✅ VALUE RESOLVED] Variable '${key}' resolved in ${valueDuration.toFixed(2)}ms`,
                            {
                              resultType: Array.isArray(result) ? "array" : typeof result,
                              resultSize: Array.isArray(result) ? result.length : undefined,
                            },
                          );
                        }, 0);
                      }
                    }

                    return result;
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
          const depResolutionStart = performance.now();

          if (fnDeps[key]) {
            dependencies = fnDeps[key];
            // Only log cache hits in verbose mode
            if (
              varsLogConfig &&
              typeof varsLogConfig === "object" &&
              varsLogConfig !== null &&
              varsLogConfig.variables &&
              varsLogConfig.verbose
            ) {
              setTimeout(() => {
                console.log(`[💾 CACHE HIT] Variable '${key}' using cached dependencies`);
              }, 0);
            }
          } else {
            // Calculate dependencies - this might be a cache hit or miss in getDependencies memoization
            const calculatedDeps = memoedVars.current
              .get(value)!
              .getDependencies(value, referenceTrackedApi);

            calculatedDeps.forEach((dep) => {
              if (fnDeps[dep]) {
                dependencies.push(...fnDeps[dep]);
              } else {
                dependencies.push(dep);
              }
            });
            dependencies = [...new Set(dependencies)];

            // Only log slow dependency resolution
            if (
              varsLogConfig &&
              typeof varsLogConfig === "object" &&
              varsLogConfig !== null &&
              varsLogConfig.variables
            ) {
              const depResolutionTime = performance.now() - depResolutionStart;
              if (depResolutionTime > 1 || varsLogConfig.verbose) {
                setTimeout(() => {
                  console.log(
                    `[🔍 DEPENDENCY RESOLUTION] Variable '${key}' resolved dependencies in ${depResolutionTime.toFixed(2)}ms`,
                    {
                      dependencies: dependencies,
                    },
                  );
                }, 0);
              }
            }
          }

          const stateDepValues = pickFromObject(stateContext, dependencies);
          const appContextDepValues = pickFromObject(appContext, dependencies);

          // Only log dependency values in verbose mode
          if (
            varsLogConfig &&
            typeof varsLogConfig === "object" &&
            varsLogConfig !== null &&
            varsLogConfig.variables &&
            varsLogConfig.verbose
          ) {
            setTimeout(() => {
              console.log(
                `[📊 DEPENDENCY VALUES] Variable '${key}' has ${dependencies.length} dependencies`,
              );
            }, 0);
          }

          const obtainStart = performance.now();
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

          // Only log slow obtainValue calls or cache misses
          if (
            varsLogConfig &&
            typeof varsLogConfig === "object" &&
            varsLogConfig !== null &&
            varsLogConfig.variables
          ) {
            const obtainTime = performance.now() - obtainStart;
            if (obtainTime > 5 || varsLogConfig.verbose) {
              setTimeout(() => {
                const cacheStatus = obtainTime < 1 ? "CACHE HIT" : "CACHE MISS";
                console.log(
                  `[${obtainTime < 1 ? "💾" : "🔄"} ${cacheStatus}] Variable '${key}' obtainValue: ${obtainTime.toFixed(2)}ms`,
                );
              }, 0);
            }
          }

          // Lightweight variable change tracking
          if (
            varsLogConfig &&
            typeof varsLogConfig === "object" &&
            varsLogConfig !== null &&
            varsLogConfig.variables
          ) {
            const prevValue = memoedVars.current.get(`${key}-prevValue`);
            const currentValue = ret[key];

            if (prevValue !== undefined && prevValue !== currentValue) {
              setTimeout(() => {
                // Analyze what kind of change occurred
                const changeType =
                  Array.isArray(currentValue) && Array.isArray(prevValue)
                    ? currentValue.length !== prevValue.length
                      ? "array_size_change"
                      : "array_content_change"
                    : typeof currentValue !== typeof prevValue
                      ? "type_change"
                      : "value_change";

                console.log(`[📊 DATA FLOW] Variable '${key}' changed`, {
                  changeType,
                  from: Array.isArray(prevValue) ? `array[${prevValue.length}]` : typeof prevValue,
                  to: Array.isArray(currentValue)
                    ? `array[${currentValue.length}]`
                    : typeof currentValue,
                  component: componentUid || "unknown",
                });
              }, 0);
            }
            memoedVars.current.set(`${key}-prevValue`, currentValue);
          }
        }
      }
    });

    // Log completion of variable resolution with results
    if (
      varsLogConfig &&
      typeof varsLogConfig === "object" &&
      varsLogConfig !== null &&
      varsLogConfig.variables
    ) {
      const nonStandardVars = Object.keys(vars).filter(
        (key) => !["$props", "emitEvent", "hasEventHandler", "updateState"].includes(key),
      );
      if (nonStandardVars.length > 0) {
        setTimeout(() => {
          const resolvedAnalysis = nonStandardVars.map((varName) => {
            const resolvedValue = ret[varName];
            let analysis: any = { name: varName, type: typeof resolvedValue };

            if (Array.isArray(resolvedValue)) {
              analysis = { ...analysis, type: "array", length: resolvedValue.length };
              // Sample first few items for arrays
              if (resolvedValue.length > 0) {
                analysis = { ...analysis, sample: resolvedValue.slice(0, 3) };
              }
            } else if (resolvedValue && typeof resolvedValue === "object") {
              analysis = { ...analysis, type: "object", keys: Object.keys(resolvedValue).length };
              // Sample first few keys for objects
              const keys = Object.keys(resolvedValue).slice(0, 3);
              if (keys.length > 0) {
                analysis = { ...analysis, sampleKeys: keys };
              }
            } else if (typeof resolvedValue === "string") {
              analysis = { ...analysis, length: resolvedValue.length };
              // Sample string content (truncated)
              analysis = {
                ...analysis,
                preview: resolvedValue.substring(0, 50) + (resolvedValue.length > 50 ? "..." : ""),
              };
            }

            return analysis;
          });

          console.log("[✅ useVars Resolution Complete]", {
            resolvedVariables: nonStandardVars,
            resolvedAnalysis: resolvedAnalysis,
          });
        }, 0);
      }
    }

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
  return value && typeof value === "object" && value[PARSED_MARK_PROP];
}
