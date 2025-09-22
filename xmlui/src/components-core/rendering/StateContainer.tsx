import React, {
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
import { useReferenceTrackedApi, useShallowCompareMemoize } from "../utils/hooks";
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
    );

    // Track component APIs for reactivity debugging
    const componentId = node.uid || `component_${Math.random().toString(36).substr(2, 6)}`;
    const componentName = node.type || 'Unknown';
    const previousApis = useRef<Record<symbol, ComponentApi>>({});

    React.useEffect(() => {
      // Monitor component state changes (which includes API changes)
      const currentState = componentState;
      const prevState = previousApis.current;

      // Check for component state changes
      Object.entries(currentState).forEach(([key, value]) => {
        if (typeof key === 'symbol' && key.description) {
          // This is a component API
          const prevApi = prevState[key];
          if (!prevApi) {
            // New API registered
            console.log(`[🔍 COMPONENT API] ${key.description} registered:`, Object.keys(value));
          } else {
            // Check for API property changes
            Object.entries(value).forEach(([apiKey, apiValue]) => {
              if (prevApi[apiKey] !== apiValue) {
                console.log(`[🔄 API CHANGE] ${key.description}.${apiKey}:`, {
                  old: prevApi[apiKey],
                  new: apiValue,
                  timestamp: new Date().toLocaleTimeString()
                });
              }
            });
          }
        }
      });

      // Update previous state for next comparison
      previousApis.current = { ...currentState };
    }, [componentState]);

    // Track variables for reactivity debugging
    const previousVars = useRef<ContainerState>({});
    React.useEffect(() => {
      // Simple console logging for reactivity debugging
      const currentVars = resolvedLocalVars;
      const prevVars = previousVars.current;


      // Only log user-defined variables (those defined in var. attributes)
      const userVars = Object.entries(currentVars).filter(([key]) =>
        !key.startsWith('$') &&
        !key.startsWith('_') &&
        typeof currentVars[key] !== 'function' &&
        // Only log variables that are actually defined in this component's var definitions
        varDefinitions.hasOwnProperty(key)
      );


      // Only log components that have user-defined variables OR component IDs
      const hasComponentId = node.props?.id;
      if (userVars.length === 0 && !hasComponentId) {
        return; // Skip logging for components with no user-defined variables or IDs
      }




      // Log component ID if it exists
      if (hasComponentId) {
        console.log(`[🔍 COMPONENT] ${componentName} with ID: ${hasComponentId}`);
        console.log(`[🔍 DEBUG] All variables in this component:`, Object.keys(currentVars));
        console.log(`[🔍 DEBUG] Var definitions:`, Object.keys(varDefinitions));
        console.log(`[🔍 DEBUG] Current state:`, currentVars);
      }

      if (userVars.length > 0) {
        userVars.forEach(([key, newValue]) => {
          const oldValue = prevVars[key];

          if (oldValue !== newValue) {
            // Determine change source and dependencies
            let changeSource: 'user' | 'computed' | 'external' = 'user';
            let dependencies = functionDeps[key] || [];

            // Check if this is a computed variable by looking at the variable definition
            const varDefinition = varDefinitions[key];
            if (varDefinition && typeof varDefinition === 'string' && varDefinition.includes('{')) {
              // This is a computed variable (has an expression)
              changeSource = 'computed';

              // Extract dependencies from the expression manually if functionDeps is empty
              if (dependencies.length === 0) {
                const expression = varDefinition.replace(/[{}]/g, '').trim();
                // Simple regex to find variable references in expressions
                const varMatches = expression.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
                // Filter out common keywords and functions
                dependencies = varMatches.filter(match =>
                  !['true', 'false', 'null', 'undefined', 'new', 'Date', 'Math', 'console', 'window', 'document'].includes(match)
                );
              }
            } else if (dependencies.length > 0) {
              // Has dependencies, so it's computed
              changeSource = 'computed';
            }

            // Console logging with actionable insights
            console.log(`[🔄 REACTIVE CHANGE] ${componentName}.${key}:`, {
              old: oldValue,
              new: newValue,
              source: changeSource,
              dependencies: dependencies.length > 0 ? dependencies : 'none',
              timestamp: new Date().toLocaleTimeString()
            });

            // Also log the values separately for better visibility
            console.log(`  └─ ${key}: ${oldValue} → ${newValue} (${changeSource})`);
          }
        });

        // Log dependency relationships for computed variables
        const computedVars = userVars.filter(([key]) => {
          const deps = functionDeps[key] || [];
          const varDef = varDefinitions[key];
          const isComputed = varDef && typeof varDef === 'string' && varDef.includes('{');
          return deps.length > 0 || isComputed;
        });

        if (computedVars.length > 0) {
          console.log(`[🔗 DEPENDENCIES] ${componentName} computed variables:`,
            computedVars.map(([key, value]) => {
              // Use manually extracted dependencies if functionDeps is empty
              let dependencies = functionDeps[key] || [];
              if (dependencies.length === 0) {
                const varDef = varDefinitions[key];
                if (varDef && typeof varDef === 'string' && varDef.includes('{')) {
                  // Extract dependencies from the variable definition
                  const matches = varDef.match(/\{([^}]+)\}/g);
                  if (matches) {
                    dependencies = matches.map(match => match.slice(1, -1).trim());
                  }
                }
              }
              return {
                variable: key,
                value,
                dependsOn: dependencies,
                definition: varDefinitions[key]
              };
            })
          );
        }
      }

      // Update previous values for next comparison
      previousVars.current = { ...currentVars };
    }, [resolvedLocalVars, componentId, functionDeps]);

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
  return value && typeof value === "object" && value[PARSED_MARK_PROP];
}
