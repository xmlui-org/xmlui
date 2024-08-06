import React, {
  forwardRef,
  Fragment,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
import memoizeOne from "memoize-one";
import produce from "immer";
import { composeRefs } from "@radix-ui/react-compose-refs";

import type { Dispatch, MutableRefObject, ReactNode, SetStateAction } from "react";
import type {
  ArrowExpression,
  ArrowExpressionStatement,
  CodeDeclaration,
  ModuleErrors,
  Statement,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { BindingTreeEvaluationContext } from "@components-core/script-runner/BindingTreeEvaluationContext";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { InnerRendererContext, ContainerDispatcher, MemoedVars } from "../abstractions/ComponentRenderer";
import type {
  ComponentApi,
  ComponentCleanupFn,
  ContainerComponentDef,
  ContainerState,
  RegisterComponentApiFnInner,
} from "./ContainerComponentDef";
import type { ProxyAction } from "./buildProxy";
import type { DynamicChildComponentDef } from "@abstractions/ComponentDefs";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import type { LookupActionOptions, LookupAsyncFnInner, LookupSyncFnInner } from "@abstractions/ActionDefs";
import type { LayoutContext } from "@abstractions/RendererDefs";
import type { ContainerAction } from "@components-core/abstractions/containers";

import { cloneDeep, isArray, isEmpty, isPlainObject, keyBy, merge, pick, setWith, unset } from "lodash-es";
import { ErrorBoundary } from "@components-core/ErrorBoundary";
import { extractParam, shouldKeep } from "@components-core/utils/extractParam";
import {
  capitalizeFirstLetter,
  delay,
  generatedId,
  pickFromObject,
  shallowCompare,
  useEvent,
} from "@components-core/utils/misc";
import { processStatementQueueAsync } from "@components-core/script-runner/process-statement-async";
import { processStatementQueue } from "@components-core/script-runner/process-statement-sync";
import Component from "@components-core/Component";
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from "@components-core/constants";
import { isContainerLike } from "./ContainerComponentDef";
import { compileLayout } from "../../parsers/style-parser/style-compiler";
import { layoutOptionKeys } from "@components-core/descriptorHelper";
import buildProxy from "./buildProxy";
import { parseHandlerCode, prepareHandlerStatements } from "@components-core/utils/statementUtils";
import { useLocation, useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { useAppContext } from "@components-core/AppContext";
import { collectVariableDependencies } from "@components-core/script-runner/visitors";
import { parseParameterString } from "@components-core/script-runner/ParameterParser";
import { useTheme } from "@components-core/theming/ThemeContext";
import { PARSED_MARK_PROP } from "../../parsers/scripting/code-behind-collect";
import { evalBinding } from "@components-core/script-runner/eval-tree-sync";
import { collectFnVarDeps } from "@components-core/container/collectFnVarDeps";
import {
  useIsomorphicLayoutEffect,
  useShallowCompareMemoize,
  useReferenceTrackedApi,
} from "@components-core/utils/hooks";
import { ContainerActionKind } from "@components-core/abstractions/containers";
import { LoaderComponent } from "@components-core/LoaderComponent";
import { AppContextObject } from "@abstractions/AppContextDefs";

/**
 * This function signature is used whenever the engine wants to sign that an object's field (property),
 * which is part of the container state, has changed.
 */
type StateFieldPartChangedFn = (path: string[], value: any, target: string, action: ProxyAction) => void;

// This function renders the entire component tree starting from the root component. As it works recursively,
// all child components will be rendered, including the wrapping containers
export function renderRoot(node: ComponentDef, memoedVarsRef: MutableRefObject<MemoedVars>) {
  return renderChild({
    node,
    state: EMPTY_OBJECT,
    dispatch: noop,
    appContext: undefined,
    lookupAction: noop,
    lookupSyncCallback: noop,
    registerComponentApi: noop,
    renderChild: noop,
    stateFieldPartChanged: noop,
    layoutCss: EMPTY_OBJECT,
    layoutNonCss: EMPTY_OBJECT,
    cleanup: noop,
    memoedVarsRef,
  });
}

type ContainerProps = {
  resolvedKey?: string;
  node: ContainerComponentDef;
  componentState: ContainerState;
  dispatch: ContainerDispatcher;
  setVersion: Dispatch<SetStateAction<number>>;
  version: number;
  stateFieldPartChanged: StateFieldPartChangedFn;
  registerComponentApi: RegisterComponentApiFnInner;
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  dynamicChildren?: Array<DynamicChildComponentDef>;
  memoedVarsRef: MutableRefObject<MemoedVars>;
  isImplicit?: boolean;
  parentDispatch: ContainerDispatcher;
};

// React component to display a view container and implement its behavior
const MemoizedContainer = memo(
  forwardRef(function Container(
    {
      node,
      componentState,
      dispatch: containerDispatch,
      parentDispatch,
      resolvedKey,
      version,
      setVersion,
      stateFieldPartChanged,
      registerComponentApi: containerRegisterComponentApi,
      parentRegisterComponentApi,
      layoutContextRef,
      dynamicChildren,
      memoedVarsRef,
      isImplicit,
    }: ContainerProps,
    ref
  ) {
    const { apiBoundContainer } = node;
    const dispatch = isImplicit ? parentDispatch : containerDispatch;
    const registerComponentApi = isImplicit ? parentRegisterComponentApi : containerRegisterComponentApi;

    const { themeVars } = useTheme();
    const appContext = useAppContext();
    const { getThemeVar } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const fnsRef = useRef<Record<symbol, any>>({});

    // console.log({ componentState });

    // const publicComponentState = useShallowCompareMemoize(useMemo(()=>{
    //   const ret = {};
    //   return ret;
    // }, []));

    const stateRef = useRef(componentState);
    const parsedStatementsRef = useRef<Record<string, Array<Statement> | null>>({});
    const statementPromises = useRef<Map<string, any>>(new Map());
    const [_, startTransition] = useTransition();
    const mountedRef = useRef(true);

    useIsomorphicLayoutEffect(() => {
      stateRef.current = componentState;
    }, [componentState]);

    useIsomorphicLayoutEffect(() => {
      for (const resolve of statementPromises.current.values()) {
        resolve();
      }
    }, [version]);

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

    const runCodeAsync = useEvent(
      async (
        source: string | ArrowExpression,
        componentUid: symbol,
        options: LookupActionOptions | undefined,
        ...eventArgs: any[]
      ) => {
        // console.log({
        //   source,
        //   componentUid,
        //   options,
        //   eventArgs,
        //   state: stateRef.current,
        //   "$this": stateRef.current[componentUid]
        // });
        let changes: Array<any> = [];
        const getComponentStateClone = () => {
          changes.length = 0;
          const poj = cloneDeep({ ...stateRef.current });
          poj["$this"] = stateRef.current[componentUid];
          return buildProxy(poj, (changeInfo) => {
            const idRoot = (changeInfo.pathArray as string[])?.[0];
            if (idRoot?.startsWith("$")) {
              throw new Error("Cannot update a read-only variable");
            }
            changes.push(changeInfo);
          });
        };

        const evalAppContext = {
          ...appContext,
          getThemeVar,
        };
        const evalContext: BindingTreeEvaluationContext = {
          appContext: evalAppContext,
          eventArgs,
          localContext: getComponentStateClone(),
          implicitContextGetter: () => {
            return {
              uid: componentUid,
              state: stateRef.current,
              dispatch,
              appContext: evalAppContext,
              navigate,
              location,
              lookupAction: (action, uid, actionOptions = {}) => {
                return lookupAction(action, uid, {
                  ...actionOptions,
                  ephemeral: true,
                });
              },
            };
          },
          options: {
            defaultToOptionalMemberAccess:
              typeof appContext.globals?.defaultToOptionalMemberAccess === "boolean"
                ? appContext.globals.defaultToOptionalMemberAccess
                : true,
          },
        };

        try {
          // --- Prepare the event handler to an arrow expression statement
          let statements;
          if (typeof source === "string") {
            if (!parsedStatementsRef.current[source]) {
              parsedStatementsRef.current[source] = prepareHandlerStatements(parseHandlerCode(source), evalContext);
            }
            statements = parsedStatementsRef.current[source];
          } else {
            statements = [
              {
                type: "ArrowS",
                expression: cloneDeep(source), //TODO illesg (talk it through why we need to deep clone, it it's omitted, it gets slower every time we run it)
              } as ArrowExpressionStatement,
            ];
          }

          if (!statements?.length) {
            return;
          }
          if (canSignEventLifecycle(componentUid.description, options?.eventName)) {
            dispatch(eventHandlerStarted(componentUid.description!, options?.eventName!));
          }
          let mainThreadBlockingRuns = 0;
          await processStatementQueueAsync(
            statements,
            evalContext,
            undefined,
            async (evalContext, completedStatement) => {
              if (changes.length) {
                mainThreadBlockingRuns = 0;
                changes.forEach((change) => {
                  stateFieldPartChanged(change.pathArray, cloneDeep(change.newValue), change.target, change.action);
                });
                let resolve = null;
                const stateUpdatedPromise = new Promise((res) => {
                  resolve = () => {
                    res(null);
                  };
                });
                const key = generatedId();
                statementPromises.current.set(key, resolve);
                // We use this to tell react that this update is not high-priority.
                //   If we don't put it to a transition, the whole app would be blocked if we run a long,
                //   update intensive queue (e.g. an infinite loop which
                //   increments a counter, see playground example learning/01_Experiments/01_Event_Framework/app ).
                //   Before this solution, we used a setTimeout(..., 0); hack, but some browsers (chrome especially)
                //   do some funky stuff with the background tabs (e.g. all the setTimeouts are
                //   maximized to run in 1 time / minute, doesn't matter if it's timeout is 0)
                //   As of 2023. June 20, this solution works with backgrounded tabs, too.
                startTransition(() => {
                  setVersion((prev) => prev + 1);
                });

                //TODO this could be a problem - if this container gets unmounted, we still have to wait for the update,
                //  but in that case this update probably happened in the parent (e.g. a button's event handler removes the whole container
                //  where the button lives, but it still has some statements to run).
                // with this solution the statement execution doesn't stop, and we fallback waiting with a setTimeout(0)
                if (mountedRef.current) {
                  await stateUpdatedPromise;
                } else {
                  await delay(0);
                }
                statementPromises.current.delete(key);
                changes = [];
              } else {
                //in this else branch normally we block the main thread (we don't wait for any state promise to be resolved),
                // so in a long-running (typically infinite loop) situation, where there aren't any changes in the state
                // we block the main thread indefinitely... this 'mainThreadBlockingRuns' var solution makes sure that
                // we pause in every 100 runs, and let the main thread breath a bit, so it's not frozen for the whole time
                // (we clear that counter above, too, where we use a startTransition call to de-prioritize this work)
                mainThreadBlockingRuns++;
                if (mainThreadBlockingRuns > 100) {
                  mainThreadBlockingRuns = 0;
                  await delay(0);
                }
              }
              evalContext.localContext = getComponentStateClone();
            }
          );

          if (canSignEventLifecycle(componentUid.description, options?.eventName)) {
            dispatch(eventHandlerCompleted(componentUid.description!, options?.eventName!));
          }

          if (evalContext.mainThread?.blocks?.length) {
            return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue;
          }
        } catch (e) {
          //if we pass down an event handler to a component, we should sign the error once, not in every step of the component chain
          //  (we use it in the compoundComponent, resolving it's event handlers)
          if (options?.signError !== false) {
            appContext.signError(e as Error);
          }
          if (canSignEventLifecycle(componentUid.description, options?.eventName)) {
            dispatch(eventHandlerError(componentUid.description!, options?.eventName!, e));
          }
          throw e;
        }
      }
    );

    const runCodeSync = useEvent((arrowExpression: ArrowExpression, ...eventArgs: any[]) => {
      const evalContext: BindingTreeEvaluationContext = {
        localContext: cloneDeep(stateRef.current),
        appContext,
        eventArgs,
      };
      try {
        const arrowStmt = {
          type: "ArrowS",
          expression: arrowExpression,
        } as ArrowExpressionStatement;

        processStatementQueue([arrowStmt], evalContext);

        if (evalContext.mainThread?.blocks?.length) {
          return evalContext.mainThread.blocks[evalContext.mainThread.blocks.length - 1].returnValue;
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    });

    const getOrCreateEventHandlerFn = useEvent(
      (src: string | ArrowExpression, uid: symbol, options?: LookupActionOptions) => {
        const stringSrc = typeof src === "string" ? src : src.statement.source;
        const fnCacheKey = `${options?.eventName};${stringSrc}`;
        const handler = (...eventArgs: any[]) => {
          return runCodeAsync(src, uid, options, ...cloneDeep(eventArgs));
        };
        if (options?.ephemeral) {
          return handler;
        }
        if (!fnsRef.current[uid]?.[fnCacheKey]) {
          fnsRef.current[uid] = fnsRef.current[uid] || {};
          fnsRef.current[uid][fnCacheKey] = handler;
        }
        return fnsRef.current[uid][fnCacheKey];
      }
    );

    const getOrCreateSyncCallbackFn = useEvent((arrowExpression: ArrowExpression, uid: symbol) => {
      const fnCacheKey = `sync-callback-${arrowExpression.source}`;
      if (!fnsRef.current[uid]?.[fnCacheKey]) {
        fnsRef.current[uid] = fnsRef.current[uid] || {};
        fnsRef.current[uid][fnCacheKey] = (...eventArgs: any[]) => {
          return runCodeSync(arrowExpression, ...eventArgs);
        };
      }
      return fnsRef.current[uid][fnCacheKey];
    });

    const lookupSyncCallback: LookupSyncFnInner = useEvent((action, uid) => {
      if (!action) {
        return undefined;
      }

      if (typeof action === "function") {
        return action;
      }

      const resolvedAction = extractParam(componentState, action, appContext, true);
      if (!resolvedAction) {
        return undefined;
      }

      if (typeof resolvedAction === "function") {
        return resolvedAction;
      }

      if (!resolvedAction._ARROW_EXPR_) {
        throw new Error("Only arrow expression allowed in sync callback");
      }
      return getOrCreateSyncCallbackFn(resolvedAction, uid);
    });

    const lookupAction: LookupAsyncFnInner = useCallback(
      (action: string | undefined | ArrowExpression, uid: symbol, options?: LookupActionOptions) => {
        let safeAction = action;
        if (!action && uid.description && options?.eventName) {
          const handlerFnName = `${uid.description}_on${capitalizeFirstLetter(options?.eventName)}`;
          if (componentState[handlerFnName] && componentState[handlerFnName]._ARROW_EXPR_) {
            safeAction = componentState[handlerFnName] as ArrowExpression;
          }
        }
        if (!safeAction) {
          return undefined;
        }
        if (typeof safeAction === "function") {
          return safeAction;
        }
        return getOrCreateEventHandlerFn(safeAction, uid, options);
      },
      [componentState, getOrCreateEventHandlerFn]
    );

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
        api[key] = lookupAction(value, self);
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

    const cleanup = useEvent((uid) => {
      // console.log("CLEANUP CALLED FOR", node);
      //TODO cleanup registered component api for that uid
      //TODO cleanup state for that uid
      delete fnsRef.current[uid];
    });

    const stableRenderChild: RenderChildFn = useCallback(
      (childNode, lc, rc) => {
        // let node: any = childNode;
        if (typeof childNode === "string") {
          throw Error("should be resolved for now");
        }
        // if(rc){
        //   console.log("hey, ", rc);
        //   // console.log(childNode);
        // }
        const children = isArray(childNode) ? childNode : [childNode];

        if (!children || !children.length) {
          return null;
        }
        const wrapWithFragment = children.length > 1;
        const dynamicChildren = children.map((child, childIndex) => {
          if (!child) {
            return undefined;
          }
          let renderedChild: any;
          if ("childToRender" in child) {
            //inside a compoundComponent, render it with the parent state context, but the actual CC layoutContext
            renderedChild = (child as any).renderChild(child.childToRender, lc);
          } else {
            const resolvedProps: Record<string, any> = {};
            layoutOptionKeys.forEach((key) => {
              if (child.props && key in child.props) {
                resolvedProps[key] = extractParam(componentState, child.props[key], appContext, true);
              }
            });
            // console.log("compile layout for child", { child, lc });
            const { cssProps, nonCssProps } = compileLayout(resolvedProps, themeVars, lc);
            renderedChild = renderChild({
              node: child,
              state: componentState,
              dispatch,
              appContext,
              lookupAction,
              lookupSyncCallback,
              registerComponentApi,
              renderChild: stableRenderChild,
              stateFieldPartChanged,
              layoutCss: cssProps,
              layoutNonCss: nonCssProps,
              layoutContext: lc,
              dynamicChildren: rc,
              memoedVarsRef,
              cleanup,
              childIndex,
            });
          }
          if (renderedChild === undefined) {
            return undefined;
          }
          let rendered = renderedChild;
          if (wrapWithFragment) {
            if (React.isValidElement(renderedChild)) {
              rendered = React.cloneElement(renderedChild, {
                key: `${childIndex}_${child.uid}`,
              });
            } else {
              //e.g. simple text nodes
              rendered = <Fragment key={`${childIndex}_${child.uid}`}>{renderedChild}</Fragment>;
            }
          }
          return rendered;
        });
        if (dynamicChildren.length === 1) {
          return ref && dynamicChildren[0] && isValidElement(dynamicChildren[0])
            ? React.cloneElement(dynamicChildren[0], {
                ref: composeRefs(ref, (dynamicChildren[0] as any).ref),
              } as any)
            : dynamicChildren[0];
        }
        return dynamicChildren;
      },
      [
        themeVars,
        componentState,
        dispatch,
        appContext,
        lookupAction,
        lookupSyncCallback,
        registerComponentApi,
        stateFieldPartChanged,
        memoedVarsRef,
        cleanup,
        ref,
      ]
    );

    // --- Log the component state if you need it for debugging
    if (node.props?.debug) {
      console.log(`Container: ${resolvedKey}`, {
        componentState,
        node,
      });
    }

    // --- Use this object to store information about already rendered UIDs.
    // --- We do not allow any action, loader, or transform to use the same UID; however (as of now) children
    // --- may use the same UID.
    const uidInfo: Record<string, string> = {};

    return (
      <Fragment
        key={node.uid ? `${resolvedKey}>${extractParam(componentState, node.uid, appContext, true)}` : undefined}
      >
        {renderLoaders({
          uidInfo,
          loaders: node.loaders,
          componentState,
          //if it's an api bound container, we always use this container, otherwise use the parent if it's an implicit one
          dispatch: apiBoundContainer ? containerDispatch : dispatch,
          registerComponentApi: apiBoundContainer ? containerRegisterComponentApi : registerComponentApi,
          appContext,
          lookupAction,
          cleanup,
        })}
        {stableRenderChild(node.children, layoutContextRef?.current, dynamicChildren)}
      </Fragment>
    );
  })
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

type ErrorProneContainerProps = {
  node: ContainerComponentDef;
  parentState: ContainerState;
  parentStateFieldPartChanged: StateFieldPartChangedFn;
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  resolvedKey?: string;
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  dynamicChildren?: Array<DynamicChildComponentDef>;
  isImplicit?: boolean;
  parentDispatch: ContainerDispatcher;
};

// A React component that wraps a view container into an error boundary
// (it's a named function inside the memo, this way it will be visible with that name in the react devtools)
const MemoizedErrorProneContainer = memo(
  forwardRef(function ErrorProneContainer(
    {
      node,
      parentState,
      resolvedKey,
      parentStateFieldPartChanged,
      parentRegisterComponentApi,
      layoutContextRef,
      dynamicChildren: dynamicChildren,
      isImplicit,
      parentDispatch,
    }: ErrorProneContainerProps,
    ref
  ) {
    const [version, setVersion] = useState(0);
    const routingParams = useRoutingParams();
    const memoedVars = useRef<MemoedVars>(new Map());

    const stateFromOutside = useShallowCompareMemoize(
      useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState])
    );

    const [componentState, dispatch] = useReducer(containerReducer, EMPTY_OBJECT);
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
      }, [componentState, componentApis])
    );

    const localVarsStateContext = useCombinedState(stateFromOutside, componentStateWithApis, node.contextVars);
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
        if (isParsedValue(value) && value.tree.type === "ArrowE") {
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
      useRef<MemoedVars>(new Map())
    );
    const localVarsStateContextWithPreResolvedLocalVars = useShallowCompareMemoize({
      ...preResolvedLocalVars,
      ...localVarsStateContext,
    });

    const resolvedLocalVars = useVars(
      varDefinitions,
      functionDeps,
      localVarsStateContextWithPreResolvedLocalVars,
      memoedVars
    );
    const mergedWithVars = useMergedState(resolvedLocalVars, componentStateWithApis);
    const combinedState = useCombinedState(stateFromOutside, node.contextVars, mergedWithVars, routingParams);

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
        })
      );
    }, []);

    const componentStateRef = useRef(componentStateWithApis);
    const stateFieldPartChanged: StateFieldPartChangedFn = useCallback(
      (pathArray, newValue, target, action) => {
        const key = pathArray[0];
        if (key in componentStateRef.current || key in resolvedLocalVars) {
          dispatch(statePartChanged(pathArray, newValue, target, action));
        } else {
          if (!node.uses || node.uses.includes(key)) {
            parentStateFieldPartChanged(pathArray, newValue, target, action);
          }
        }
      },
      [resolvedLocalVars, node.uses, parentStateFieldPartChanged]
    );

    return (
      <ErrorBoundary node={node} location={"container"}>
        <MemoizedContainer
          resolvedKey={resolvedKey}
          node={node}
          componentState={combinedState}
          dispatch={dispatch}
          parentDispatch={parentDispatch}
          setVersion={setVersion}
          version={version}
          stateFieldPartChanged={stateFieldPartChanged}
          registerComponentApi={registerComponentApi}
          parentRegisterComponentApi={parentRegisterComponentApi}
          layoutContextRef={layoutContextRef}
          dynamicChildren={dynamicChildren}
          memoedVarsRef={memoedVars}
          isImplicit={isImplicit}
          ref={ref}
        />
      </ErrorBoundary>
    );
  })
);

// --- A component definition with optional container properties
type ComponentDefWithContainerUid = ComponentDef & {
  // --- The unique identifier of the container that wraps this component
  containerUid?: symbol;

  // --- If true, the component is bound to an API container
  apiBoundContainer?: boolean;
};

/**
 * Wraps the specified component node with a container
 * @param node The component node to wrap
 * @returns A "Container" node
 */
const getWrappedWithContainer = (node: ComponentDefWithContainerUid) => {
  if (node.type === "Container") {
    // --- Already wrapped
    return node;
  }

  // --- Clone the node and remove the properties that will be moved to the container
  // --- Note: we need the "when" property in the ModalDialog component, so we don't remove it
  const wrappedNode = { ...node, props: { ...node.props } };
  delete wrappedNode.loaders;
  delete wrappedNode.vars;
  delete wrappedNode.functions;
  delete wrappedNode.script;
  delete wrappedNode.scriptCollected;
  delete wrappedNode.scriptError;
  delete wrappedNode.uses;
  delete wrappedNode.props?.uses;
  delete wrappedNode.api;

  // --- Do the wrapping
  return {
    type: "Container",
    uid: node.uid,
    when: node.when,
    loaders: node.loaders,
    vars: node.vars,
    functions: node.functions,
    scriptCollected: node.scriptCollected,
    scriptError: node.scriptError,
    // TODO: it seems so that we need only node.uses, but we have to check it
    uses: node.uses, // || node.props?.uses?.split(",").map((txt: string) => txt.trim()),
    api: node.api,
    containerUid: "containerUid" in node && node.containerUid,
    apiBoundContainer: "apiBoundContainer" in node && node.apiBoundContainer,
    props: {
      debug: node.props?.debug,
      // debug: true,
    },
    children: [wrappedNode],
  } as ContainerComponentDef;
};

type ComponentContainerProps = {
  resolvedKey?: string;
  node: ContainerComponentDef;
  parentState: ContainerState;
  parentStateFieldPartChanged: StateFieldPartChangedFn;
  parentRegisterComponentApi: RegisterComponentApiFnInner;
  layoutContextRef: MutableRefObject<LayoutContext | undefined>;
  dynamicChildren?: Array<DynamicChildComponentDef>;
  parentDispatch: ContainerDispatcher;
};

const ComponentContainer = memo(
  forwardRef(function ComponentContainer(
    {
      resolvedKey,
      node,
      parentState,
      parentStateFieldPartChanged,
      parentRegisterComponentApi,
      layoutContextRef,
      dynamicChildren,
      parentDispatch,
    }: ComponentContainerProps,
    ref
  ) {
    const enhancedNode = useMemo(() => getWrappedWithContainer(node), [node]);
    return (
      <ErrorBoundary node={node} location={"container"}>
        <MemoizedErrorProneContainer
          parentStateFieldPartChanged={parentStateFieldPartChanged}
          resolvedKey={resolvedKey}
          node={enhancedNode as any}
          parentState={parentState}
          layoutContextRef={layoutContextRef}
          dynamicChildren={dynamicChildren}
          isImplicit={node.type !== "Container" && enhancedNode.uses === undefined} //in this case it's an auto-wrapped component
          parentRegisterComponentApi={parentRegisterComponentApi}
          parentDispatch={parentDispatch}
          ref={ref}
        />
      </ErrorBoundary>
    );
  })
);

// Represents the context in which the React component belonging to a particular component definition
// is rendered
interface RenderChildContext extends InnerRendererContext {
  stateFieldPartChanged: StateFieldPartChangedFn;
  layoutContext?: LayoutContext;
  cleanup: ComponentCleanupFn;
}

function renderChild({
  node,
  state,
  dispatch,
  appContext,
  lookupAction,
  lookupSyncCallback,
  registerComponentApi,
  renderChild,
  layoutCss,
  layoutNonCss,
  stateFieldPartChanged,
  layoutContext,
  dynamicChildren,
  memoedVarsRef,
  cleanup,
  childIndex,
}: RenderChildContext): ReactNode {
  if (!node) {
    return null;
  }

  // --- Render only visible components
  if (!shouldKeep(node.when, state, appContext)) {
    return null;
  }

  // --- We do not parse text nodes specified with CDATA
  if (node.type === "TextNodeCData") {
    return node.props?.value ?? "";
  }

  if (node.type === "TextNode") {
    // --- Special conversion: "&nbsp;" is converted to a non-breaking space
    let nodeValue = extractParam(state, node.props?.value, appContext, true);
    return nodeValue;
  }

  const key = extractParam(state, node.uid, appContext, true);
  return (
    <Node
      key={key}
      resolvedKey={key}
      node={node}
      cleanup={cleanup}
      stateFieldPartChanged={stateFieldPartChanged}
      memoedVarsRef={memoedVarsRef}
      state={state}
      dispatch={dispatch}
      appContext={appContext}
      lookupAction={lookupAction}
      lookupSyncCallback={lookupSyncCallback}
      registerComponentApi={registerComponentApi}
      renderChild={renderChild}
      layoutCss={layoutCss}
      layoutNonCss={layoutNonCss}
      layoutContext={layoutContext}
      dynamicChildren={dynamicChildren}
      childIndex={childIndex}
    />
  );
}

function transformNodeWithChildDatasource(node: ComponentDef<any>) {
  let didResolve = false;
  let loaders = node.loaders;
  let children: Array<ComponentDef> | undefined = undefined;
  node.children?.forEach((child) => {
    if (child.type === "Datasource") {
      didResolve = true;
      if (!loaders) {
        loaders = [];
      }
      loaders.push({
        uid: child.uid!,
        type: "DataLoader",
        props: child.props,
        events: child.events,
        when: child.when,
      });
    } else {
      if (!children) {
        children = [];
      }
      children.push(child);
    }
  });
  if (didResolve) {
    return {
      ...node,
      children,
      loaders,
    };
  }
  return node;
}

function transformNodeWithDatasourceProp(node: ComponentDef) {
  if (node.props && "datasource" in node.props && typeof node.props.datasource === "string") {
    return {
      ...node,
      props: {
        ...node.props,
        datasource: {
          type: "Datasource",
          props: {
            url: node.props.datasource,
          },
        },
      },
    };
  }
  return node;
}

const Node = memo(
  forwardRef(function Node(
    {
      node,
      state,
      dispatch,
      appContext,
      lookupAction,
      lookupSyncCallback,
      registerComponentApi,
      renderChild,
      layoutCss,
      layoutNonCss,
      stateFieldPartChanged,
      layoutContext,
      dynamicChildren,
      memoedVarsRef,
      resolvedKey,
      cleanup,
      childIndex,
      ...rest
    }: RenderChildContext & { resolvedKey: string },
    ref
  ) {
    //pref, this way
    const stableLayoutContext = useRef(layoutContext);
    stableLayoutContext.current = layoutContext;

    const stableLayoutCss = useShallowCompareMemoize(layoutCss);
    const stableLayoutNonCss = useShallowCompareMemoize(layoutNonCss);

    const nodeWithTransformedLoaders = useMemo(() => {
      let transformed = transformNodeWithChildDatasource(node); //if we have an Datasource child, we transform it to a loader on the node
      transformed = transformNodeWithDatasourceProp(transformed);
      // console.log(transformNodeWithDatasourceProp(transformed));

      return transformed;
    }, [node]);

    let renderedChild = null;
    if (isContainerLike(nodeWithTransformedLoaders)) {
      renderedChild = (
        <ComponentContainer
          resolvedKey={resolvedKey}
          node={nodeWithTransformedLoaders}
          parentState={state}
          parentDispatch={dispatch}
          layoutContextRef={stableLayoutContext}
          dynamicChildren={dynamicChildren}
          parentStateFieldPartChanged={stateFieldPartChanged}
          parentRegisterComponentApi={registerComponentApi}
          ref={ref}
        />
      );
    } else {
      renderedChild = (
        <Component
          onUnmount={cleanup}
          memoedVarsRef={memoedVarsRef}
          node={nodeWithTransformedLoaders}
          state={state}
          dispatch={dispatch}
          appContext={appContext}
          lookupAction={lookupAction}
          lookupSyncCallback={lookupSyncCallback}
          registerComponentApi={registerComponentApi}
          renderChild={renderChild}
          layoutCss={stableLayoutCss}
          layoutNonCss={stableLayoutNonCss}
          dynamicChildren={dynamicChildren}
          layoutContextRef={stableLayoutContext}
          childIndex={childIndex}
          ref={ref}
          {...rest}
        />
      );
    }

    return renderedChild;
  })
);
// Extracts the `state` property values defined in a component definition's `uses` property. It uses the specified
// `appContext` when resolving the state values.
function extractScopedState(parentState: ContainerState, uses?: string[]): ContainerState | undefined {
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

class ParseVarError extends Error {
  constructor(varName: string, originalError: any) {
    super(`Error on var: ${varName} - ${originalError?.message || "unknown"}`);
  }
}

//true if it's coming from a code behind or a script tag
function isParsedValue(value: any): value is CodeDeclaration {
  return value && typeof value === "object" && value[PARSED_MARK_PROP];
}

// This hook resolves variables to their current value (using binding expression evaluation)
function useVars(
  vars: ContainerState = EMPTY_OBJECT,
  fnDeps: Record<string, Array<string>> = EMPTY_OBJECT,
  componentState: ContainerState,
  memoedVars: MutableRefObject<MemoedVars>
): ContainerState {
  const appContext = useAppContext();
  const referenceTrackedApi = useReferenceTrackedApi(componentState);

  const resolvedVars = useMemo(() => {
    const ret: any = {};

    Object.entries(vars).forEach(([key, value]) => {
      if (key === "$events" || key === "$props") {
        // --- We already resolved props and events in a compound component
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
                    ret = new Set([...ret, ...collectVariableDependencies(param.value, referenceTrackedApi)]);
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
                  [_newExpression, _newState, _newAppContext, _newStrict, newDeps, newAppContextDeps],
                  [_lastExpression, _lastState, _lastAppContext, _lastStrict, lastDeps, lastAppContextDeps]
                ) => {
                  return shallowCompare(newDeps, lastDeps) && shallowCompare(newAppContextDeps, lastAppContextDeps);
                }
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
            .obtainValue(value, stateContext, appContext, true, stateDepValues, appContextDepValues);
        }
      }
    });
    return ret;
  }, [appContext, componentState, fnDeps, memoedVars, referenceTrackedApi, vars]);

  return useShallowCompareMemoize(resolvedVars);
}

// --- Tests if a particular component (`componentUid`) can sign event (with `eventName`)
// --- life cycle changes
function canSignEventLifecycle(componentUid: string | undefined, eventName: string | undefined) {
  return componentUid !== undefined && eventName !== undefined;
}

// Signs that a particular component (`uid`) has started running an event handler
// for the event with `eventName`.
export function eventHandlerStarted(uid: string, eventName: string) {
  return {
    type: ContainerActionKind.EVENT_HANDLER_STARTED,
    payload: {
      uid,
      eventName,
    },
  };
}

// Signs that a particular component (`uid`) has completed running an event handler
// for the event with `eventName`.
export function eventHandlerCompleted(uid: string, eventName: string) {
  return {
    type: ContainerActionKind.EVENT_HANDLER_COMPLETED,
    payload: {
      uid,
      eventName,
    },
  };
}

// Signs that a particular component (`uid`) has received an error while running an event handler
// for the event with `eventName`.
export function eventHandlerError(uid: string, eventName: string, error: any) {
  return {
    type: ContainerActionKind.EVENT_HANDLER_ERROR,
    payload: {
      uid,
      eventName,
      error,
    },
  };
}

// Signs that a particular state part (`path`) has been changed to a new `value` on a `target` object
// when executing an `action`.
export function statePartChanged(path: string[], value: any, target: any, action: ProxyAction) {
  return {
    type: ContainerActionKind.STATE_PART_CHANGED,
    payload: {
      path,
      value,
      target,
      actionType: action,
    },
  };
}

// This value defines the reducer to manage the state of the view container using the current state of the container
// and an action. Note that the reducer function in this package handles immutability with the `produce` function of
// the `immer` package.
export const containerReducer = produce((state: ContainerState, action: ContainerAction) => {
  const { uid } = action.payload;
  if (uid === undefined && action.type !== ContainerActionKind.STATE_PART_CHANGED) {
    console.error("uid not provided for control component", {
      state,
      action,
    });
    return state;
  }
  switch (action.type) {
    case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED: {
      state[uid] = { ...state[uid], inProgress: action.payload.inProgress };
      break;
    }
    case ContainerActionKind.LOADER_LOADED: {
      const { data, pageInfo } = action.payload;
      state[uid] = {
        value: data,
        byId: Array.isArray(data) ? keyBy(data, (item) => item.$id) : undefined,
        inProgress: false,
        loaded: data !== undefined,
        pageInfo,
      };
      break;
    }
    case ContainerActionKind.LOADER_ERROR: {
      const { error } = action.payload;
      state[uid] = { ...state[uid], error, inProgress: false, loaded: true };
      break;
    }
    case ContainerActionKind.EVENT_HANDLER_STARTED: {
      const { eventName } = action.payload;
      const inProgressFlagName = `${eventName}InProgress`;
      state[uid] = { ...state[uid], [inProgressFlagName]: true };
      break;
    }
    case ContainerActionKind.EVENT_HANDLER_COMPLETED: {
      const { eventName } = action.payload;
      const inProgressFlagName = `${eventName}InProgress`;
      state[uid] = { ...state[uid], [inProgressFlagName]: false };
      break;
    }
    case ContainerActionKind.EVENT_HANDLER_ERROR: {
      const { eventName } = action.payload;
      const inProgressFlagName = `${eventName}InProgress`;
      state[uid] = { ...state[uid], [inProgressFlagName]: false };
      break;
    }
    case ContainerActionKind.COMPONENT_STATE_CHANGED: {
      const { state: newState } = action.payload;
      state[uid] = {
        ...state[uid],
        ...newState,
      };
      break;
    }
    case ContainerActionKind.STATE_PART_CHANGED: {
      const { path, value, target, actionType } = action.payload;
      if (actionType === "unset") {
        unset(state, path);
      } else {
        setWith(state, path, value, (nsValue) => {
          if (nsValue === undefined && isPlainObject(target)) {
            // if we are setting a new object's key, lodash defaults it to an array, if the key is a number.
            // This way we can force it to be an object.
            // (example: we have an empty object in vars called usersTyped: {}, we set usersTyped[1] = Date.now().
            // During the first state setting, we don't have a previous value for usersTyped, because it was defined
            // in vars, and wasn't updated yet. In the first update, it's value is undefined, and because the key is
            // a number (an id in our case), lodash thinks it has to create an array after this 'set'. This way we
            // can force it, because in the target we have the target object value (given by the proxy change),so if
            // it's an object, it should be an object. Otherwise we let lodash decide)
            return Object(nsValue);
          }
        });
      }
      break;
    }
    default:
      throw new Error();
  }
});

interface LoaderRenderContext {
  uidInfo: Record<string, string>;
  loaders?: ComponentDef[];
  componentState: ContainerState;
  dispatch: ContainerDispatcher;
  appContext: AppContextObject;
  registerComponentApi: RegisterComponentApiFnInner;
  lookupAction: LookupAsyncFnInner;
  cleanup: ComponentCleanupFn;
}

export function renderLoaders({
  uidInfo,
  loaders = EMPTY_ARRAY,
  componentState,
  dispatch,
  appContext,
  registerComponentApi,
  lookupAction,
  cleanup,
}: LoaderRenderContext) {
  return loaders.map((loader: ComponentDef) => {
    // --- Check for the uniqueness of UIDs
    if (loader?.uid) {
      if (uidInfo[loader.uid]) {
        // --- We have a duplicated ID (another loader)
        throw new Error(
          `Another ${uidInfo[loader.uid]} definition in this container already uses the uid '${loader.uid}'`
        );
      }
      uidInfo[loader.uid] = "loader";
    }

    // --- Render the current loader
    const renderedLoader = renderLoader({
      loader,
      componentState,
      dispatch,
      appContext,
      registerComponentApi,
      lookupAction,
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
    cleanup,
  }: {
    loader: ComponentDef;
    componentState: ContainerState;
    dispatch: ContainerDispatcher;
    appContext: AppContextObject;
    registerComponentApi: RegisterComponentApiFnInner;
    lookupAction: LookupAsyncFnInner;
    cleanup: ComponentCleanupFn;
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
      />
    );
  }
}
