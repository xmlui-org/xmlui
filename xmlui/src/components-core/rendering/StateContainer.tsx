import {
  MutableRefObject,
  RefObject,
  memo,
  forwardRef,
  useState,
  useRef,
  useMemo,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import produce from "immer";
import { cloneDeep, isEmpty, isPlainObject, merge, pick } from "lodash-es";
import memoizeOne from "memoize-one";
import { useParams, useSearchParams } from "@remix-run/react";

import type { ParentRenderContext } from "../../abstractions/ComponentDefs";
import type { ContainerState } from "../../abstractions/ContainerDefs";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import type { ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import { ContainerActionKind } from "../abstractions/containers";
import { ModuleErrors, T_ARROW_EXPRESSION } from "../../abstractions/scripting/ScriptingSourceTree";
import { EMPTY_OBJECT } from "../constants";
import { collectFnVarDeps } from "../rendering/collectFnVarDeps";
import { createContainerReducer } from "../rendering/reducer";
import { useDebugView } from "../DebugViewProvider";
import { ErrorBoundary } from "../rendering/ErrorBoundary";
import { collectVariableDependencies } from "../script-runner/visitors";
import { useShallowCompareMemoize, useReferenceTrackedApi } from "../utils/hooks";
import { Container } from "./Container";
import { useAppContext } from "../AppContext";
import { evalBinding } from "../script-runner/eval-tree-sync";
import { pickFromObject, shallowCompare } from "../utils/misc";
import {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  ComponentApi,
  StatePartChangedFn,
} from "./ContainerWrapper";
import {
  isExpression,
  isParsedAttributeValue,
  parseAttributeValue,
} from "../script-runner/AttributeValueParser";
import { extractParam } from "../utils/extractParam";

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
        if (isParsedAttributeValue(value)) {
          const deps: string[] = [];
          value.segments.forEach((segment) => {
            if (segment.expr !== undefined) {
              deps.push(...collectVariableDependencies(segment.expr, referenceTrackedApi));
            }
          });

          // --- Remove duplicates
          fnDeps[key] = [...new Set(deps)];
        } else if (value.type === T_ARROW_EXPRESSION) {
          fnDeps[key] = collectVariableDependencies(value, referenceTrackedApi);
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
          if (!draft[uid]) {
            draft[uid] = {};
          }
          Object.entries(api).forEach(([key, value]) => {
            if (draft[uid][key] !== value) {
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
  const queryParamsMap = useMemo(() => {
    const result: Record<string, any> = {};
    for (const [key, value] of Array.from(queryParams.entries())) {
      result[key] = value;
    }
    return result;
  }, [queryParams]);

  return useMemo(() => {
    return {
      $routeParams: routeParams,
      $queryParams: queryParamsMap,
    };
  }, [queryParamsMap, routeParams]);
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
      if (state !== EMPTY_OBJECT) {
        ret = { ...ret, ...state };
      }
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
        } else if (Array.isArray(ret[key]) && Array.isArray(value)) {
          ret[key] = Object.assign([], ret[key], value);
        } else {
          ret[key] = value;
        }
      }
    });
    return ret;
  }, [localVars, componentState]);
  return useShallowCompareMemoize(merged);
}


// --- This hook resolves variables to their current value (using binding expression evaluation)
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

    Object.keys(vars).forEach((key) => {
      const value = vars[key];
      if (key === "$props") {
        // --- We already resolved props in a compound component
        ret[key] = value;
      } else if (!isParsedAttributeValue(value) && !isExpression(value) && typeof value !== "string") {
        ret[key] = value;
      }

      // --- At this point we have parsed vales
      // --- Resolve each variable's value, without going into the details of arrays and objects
      if (!memoedVars.current.has(value)) {
        memoedVars.current.set(value, {
          getDependencies: memoizeOne((value, referenceTrackedApi) => {
            if (isParsedAttributeValue(value)) {
              // --- We parsed this variable from markup
              const deps: string[] = [];
              value.segments.forEach((segment) => {
                if (segment.expr !== undefined) {
                  deps.push(...collectVariableDependencies(segment.expr, referenceTrackedApi));
                }
              });

              // --- Remove duplicates
              return [...new Set(deps)];
            } else if (isExpression(value)) {
              // --- We parsed this variable from code-behind
              return collectVariableDependencies(value, referenceTrackedApi);
            } else {
              return [];
              //throw new Error("Unknown variable type");
            }
          }),
          obtainValue: memoizeOne(
            (value, state, appContext, _strict, _deps, _appContextDeps) => {
              try {
                if (isExpression(value)) {
                  return evalBinding(value, {
                    localContext: state,
                    appContext,
                    options: {
                      defaultToOptionalMemberAccess: true,
                    },
                  });
                } else if (isParsedAttributeValue(value)) {
                  // --- We parsed this variable from markup
                  return extractParam(state, value, appContext);
                } else {
                  return value;
                }
              } catch (e) {
                console.log(state);
                throw new ParseVarError(value, e);
              }
            },
            (
              [_newExpression, _newState, _newAppContext, _newStrict, newDeps, newAppContextDeps],
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

      ret[key] = memoedVars.current
        .get(value)
        .obtainValue(value, stateContext, appContext, true, stateDepValues, appContextDepValues);
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
