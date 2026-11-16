import type { MutableRefObject, ReactNode, RefObject } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import {
  Container,
  ApiOnlyFieldContext,
  LiveStateContext,
  LoaderNamesContext,
  WriteStampContext,
} from "./Container";
import { createVariableLogger } from "../inspector/variable-logging";
import { mergeComponentApis, useCombinedState, useMergedState } from "../state/state-layers";
import { useVars, isParsedValue } from "../state/variable-resolution";
import { useGlobalVariables } from "../state/global-variables";
import { useRoutingParams } from "../state/routing-state";
import { useAppContext } from "../AppContext";
import { pushXsLog, getCurrentTrace } from "../inspector/inspectorUtils";
import { RenderPassContext, RenderPassTracker } from "../inspector/render-logging";
import { bindingReadPathsOf } from "../optimization/bindingReads";
import {
  type HeldState,
  holdsState,
  loaderNamesOf,
  definitionUidsOf,
  expandFunctionReads,
  readRootsOf,
  writeStampsOf,
} from "../optimization/readScopedRender";

const LOADER_ACTIONS = new Set<string>([
  ContainerActionKind.LOADER_LOADED,
  ContainerActionKind.LOADER_IN_PROGRESS_CHANGED,
  ContainerActionKind.LOADER_IS_REFETCHING_CHANGED,
  ContainerActionKind.LOADER_ERROR,
  ContainerActionKind.LOADER_CANCELLED,
]);
const EMPTY_SET: ReadonlySet<string> = new Set();
import {
  filterCyclicLocalDefinitions,
  getCyclicLocalDefinitionNames,
} from "../reactive-graph/cyclicLocalDefinitions";
import type {
  ContainerWrapperDef,
  RegisterComponentApiFnInner,
  StatePartChangedFn,
} from "./ContainerWrapper";
import type { ComponentApi } from "../../abstractions/ApiDefs";
import { CodeBehindParseError } from "./ContainerUtils";
import { FnDepsProvider, useFnDeps } from "../FnDepsContext";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type { EvalTreeOptions } from "../script-runner/BindingTreeEvaluationContext";
import { createBindingEvalOptions } from "../script-runner/eval-options";

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
    const xsVerbose = appContext.xmluiConfig?.xsVerbose === true;

    // --- Inspector: one `render:pass` entry per pass of App, a UDC or an explicit
    // --- container, with its cause and duration (see inspector/render-logging.ts)
    const parentPass = useContext(RenderPassContext);
    const passTrackerRef = useRef<RenderPassTracker | null>(null);
    if (xsVerbose) {
      const innerType = (node as any).children?.[0]?.type;
      const passInfo = {
        component:
          node.udcName ?? (node.uid === "root" ? "App" : (innerType ?? node.type ?? "anon")),
        uid: node.uid ?? node.containerUid?.description,
        isUdc: !!node.udcName,
        // --- Implicit (`var.`) containers and per-item template containers (Items,
        // --- List rows: they carry contextVars) fold into their owner's pass.
        isImplicit:
          node.uid !== "root" && !node.udcName && (!!isImplicit || !!node.contextVars),
        source: (node as any).children?.[0]?.debug?.source,
        // --- What this container's bindings read, to say whether each cause
        // --- changed any of it (cached per definition node)
        readPaths: bindingReadPathsOf(node),
      };
      if (!passTrackerRef.current) passTrackerRef.current = new RenderPassTracker(passInfo);
      else passTrackerRef.current.setInfo(passInfo);
      passTrackerRef.current.beginRender(parentPass);
    } else {
      // --- Inert when the inspector is off: the dispatch and API hooks below
      // --- reach the tracker only through this ref.
      passTrackerRef.current = null;
    }
    const passTracker = xsVerbose ? passTrackerRef.current : null;
    useLayoutEffect(() => {
      passTracker?.commit();
    });

    const udcEvalOptions = useMemo<EvalTreeOptions>(() => {
      if (!node.udcContract) return EMPTY_OBJECT;
      return {
        udcContract: node.udcContract,
        strictUdcSandbox:
          appContext.xmluiConfig?.strictUdcSandbox !== false ||
          (node.udcContract.trust === "untrusted" && appContext.xmluiConfig?.udcTrust === "strict"),
        udcDiagnosticLogger: (diagnostic) => {
          pushXsLog({
            ts: Date.now(),
            perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
            traceId: getCurrentTrace(),
            kind: "udc",
            trust: node.udcContract?.trust,
            ...diagnostic,
          });
        },
      };
    }, [
      appContext.xmluiConfig?.strictUdcSandbox,
      appContext.xmluiConfig?.udcTrust,
      node.udcContract,
    ]);
    const bindingEvalOptions = useMemo(
      () => createBindingEvalOptions(appContext, udcEvalOptions),
      [appContext, udcEvalOptions],
    );

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

    const stateFromOutside = useShallowCompareMemoize(parentState);

    const renderCountRef = useRef(0);
    // Render counter for dev profiling. The useLayoutEffect must be called unconditionally
    // (Rules of Hooks). The process.env check is placed INSIDE the callback so the bundler
    // can dead-code-eliminate the body in production while the hook call site stays stable.
    useLayoutEffect(() => {
      if (process.env.NODE_ENV !== "development") return;
      renderCountRef.current += 1;
      // Use the wrapped component's type (first child) for containers — avoids all containers
      // colliding on the "Container" label when they have no uid.
      const innerType = (node as any).children?.[0]?.type;
      const baseLabel = innerType ?? node.type ?? "anon";
      const label = node.uid ? `${baseLabel}#${node.uid}` : baseLabel;
      // accumulate per-label counts silently; read window.__renderCounts in DevTools to inspect
      (globalThis as any).__renderCounts ??= {};
      (globalThis as any).__renderCounts[label] = renderCountRef.current;
    });

    // ========================================================================
    // LAYER 2: COMPONENT REDUCER STATE
    // ========================================================================

    // --- All state manipulation happens through the container reducer, which is created here.
    // --- This reducer allow collecting state changes for debugging purposes. The `debugView`
    // --- contains the debug configuration; it may enable (or disable) logging.
    const debugView = useDebugView();
    const containerReducer = createContainerReducer(debugView);
    const [componentState, reducerDispatch] = useReducer(containerReducer, EMPTY_OBJECT);
    // --- Every action reaching this reducer passes here, so the inspector can note
    // --- the trace id and the kind of each uid at dispatch time.
    // --- Loader uids, as the step 1 trace classifies them: those receiving a
    // --- loader action. Read-scoped rendering doesn't count their entries as
    // --- a component's own state.
    const loaderUidsRef = useRef<Set<symbol>>(new Set());
    const dispatch: ContainerDispatcher = useCallback(
      (action) => {
        passTrackerRef.current?.noteDispatch(action);
        const uid = (action as any)?.payload?.uid;
        if (typeof uid === "symbol" && LOADER_ACTIONS.has(action.type)) loaderUidsRef.current.add(uid);
        reducerDispatch(action);
      },
      [reducerDispatch],
    );

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

    passTracker?.observe({
      props: {
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
        ...rest,
      },
      componentState,
      componentApis,
      version,
      propSources: node.udcPropSources?.current,
    });

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

    const cyclicLocalDefinitionNames = useMemo(
      () => getCyclicLocalDefinitionNames(node),
      [node],
    );
    const resolvableVarDefinitions = useShallowCompareMemoize(
      filterCyclicLocalDefinitions(varDefinitions, cyclicLocalDefinitionNames),
    );

    //first: collection function (arrowExpressions) dependencies
    //    -> do it until there's no function dep, only var deps
    const parentFnDeps = useFnDeps();
    const functionDeps = useMemo(() => {
      const fnDeps: Record<string, Array<string>> = {};
      Object.entries(resolvableVarDefinitions).forEach(([key, value]) => {
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
    }, [parentFnDeps, referenceTrackedApi, resolvableVarDefinitions]);

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
      resolvableVarDefinitions,
      functionDeps,
      localVarsStateContext,
      useRef<MemoedVars>(new Map()), // Temporary cache, discarded after this pass
      bindingEvalOptions,
    );

    // Merge pre-resolved variables into context for second pass
    const localVarsStateContextWithPreResolvedLocalVars = useShallowCompareMemoize({
      ...preResolvedLocalVars,
      ...localVarsStateContext,
    });

    // Pass 2: Final resolution with complete context
    const resolvedLocalVars = useVars(
      resolvableVarDefinitions,
      functionDeps,
      localVarsStateContextWithPreResolvedLocalVars,
      memoedVars, // Persistent cache for performance
      bindingEvalOptions,
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
    // READ-SCOPED RENDERING (#3941, xmluiConfig.readScopedRendering)
    // ========================================================================

    // When nothing this container's bindings read has changed, and no
    // component's own state has, hand Container the state it got last time:
    // its memo then skips the subtree. Writes still land in state.
    const readScopedEnabled = appContext.xmluiConfig?.readScopedRendering === true;
    const readScoped = readScopedEnabled;
    const scopedReadPaths = useMemo(
      () =>
        readScoped ? expandFunctionReads(bindingReadPathsOf(node), functionDeps) : ("all" as const),
      [readScoped, node, functionDeps],
    );
    const parentLoaderNames = useContext(LoaderNamesContext);
    const scopedLoaderNames = useMemo(() => {
      if (!readScoped) return EMPTY_SET;
      const own = loaderNamesOf(node);
      if (!parentLoaderNames?.size) return own;
      if (!own.size) return parentLoaderNames;
      return new Set([...parentLoaderNames, ...own]) as ReadonlySet<string>;
    }, [readScoped, node, parentLoaderNames]);
    // --- Handler writes per variable, counted in statePartChanged. A write in
    // --- place keeps the value's identity, so identity alone can't see it.
    const writeStampsRef = useRef<Map<string, number>>(new Map());
    const parentStampOf = useContext(WriteStampContext);
    const parentStampOfRef = useRef(parentStampOf);
    parentStampOfRef.current = parentStampOf;
    const stampOf = useCallback(
      (key: string): number =>
        (writeStampsRef.current.get(key) ?? 0) + (parentStampOfRef.current?.(key) ?? 0),
      [],
    );
    // --- A component's registered API vs its reducer state, asked of the
    // --- container that holds the uid (an implicit container's components
    // --- register with an ancestor)
    const ownApisRef = useRef(componentApis);
    ownApisRef.current = componentApis;
    const ownReducerStateRef = useRef(componentState);
    ownReducerStateRef.current = componentState;
    const parentIsApiOnlyField = useContext(ApiOnlyFieldContext);
    const parentIsApiOnlyFieldRef = useRef(parentIsApiOnlyField);
    parentIsApiOnlyFieldRef.current = parentIsApiOnlyField;
    // --- The uids this container's definition names: an API-only field of one
    // --- of them is read only by bindings the read set already sees
    const definitionUidsRef = useRef<ReadonlySet<string>>(EMPTY_SET);
    definitionUidsRef.current = readScoped ? definitionUidsOf(node) : EMPTY_SET;
    const isApiOnlyField = useCallback((uid: symbol, field: string): boolean => {
      if (loaderUidsRef.current.has(uid)) return true;
      const api = (ownApisRef.current as any)?.[uid];
      if (api) {
        if (!(field in api)) return false;
        const state = (ownReducerStateRef.current as any)?.[uid];
        if (state && typeof state === "object" && field in state) return false;
        // --- A uid made at render time may have readers made at render time too
        return !!uid.description && definitionUidsRef.current.has(uid.description);
      }
      if (uid in ((ownReducerStateRef.current as any) ?? {})) return false;
      return parentIsApiOnlyFieldRef.current?.(uid, field) ?? false;
    }, []);
    const heldStateRef = useRef<HeldState | null>(null);
    const latestStateRef = useRef<Record<string, any>>(resolvedCombinedState);
    latestStateRef.current = resolvedCombinedState;
    let containerState = resolvedCombinedState;
    let containerVersion = version;
    let stateHeld = false;
    if (readScoped) {
      // --- An implicit container forwards its components' state to the parent's
      // --- reducer, so their own state reaches it only through the combined
      // --- state. Either way the source includes registered APIs: an API value
      // --- counts unless `isApiOnlyField` says only visible bindings read it.
      const ownStateSource = isImplicit ? resolvedCombinedState : componentStateWithApis;
      const next: HeldState = {
        state: resolvedCombinedState,
        raw: ownStateSource,
        version,
        stamps: writeStampsOf(readRootsOf(scopedReadPaths), stampOf),
      };
      if (holdsState(heldStateRef.current, next, scopedReadPaths, scopedLoaderNames, isApiOnlyField)) {
        containerState = heldStateRef.current!.state;
        containerVersion = heldStateRef.current!.version;
        stateHeld = true;
      } else {
        heldStateRef.current = next;
      }
    }
    passTracker?.setStateHeld(stateHeld);

    // --- A handler waits after each statement that writes state until the
    // --- version change renders. Container resolves that wait when it renders;
    // --- with the version held, it may not, so resolve it here as well.
    const statementCommitRef = useRef<(() => void) | null>(null);
    useLayoutEffect(() => {
      if (readScopedEnabled) statementCommitRef.current?.();
    }, [version, readScopedEnabled]);

    // --- Handlers see live state. A container under a held subtree doesn't
    // --- re-render, so the parent state it holds goes stale. Its live state is
    // --- its own latest state, with every value it inherited unchanged from its
    // --- parent's state (as of its last render) replaced by the parent's live
    // --- value. Every container gets this while the switch is on, implicit
    // --- ones included, since any of them can sit under a held subtree.
    const parentLiveState = useContext(LiveStateContext);
    const parentLiveStateRef = useRef(parentLiveState);
    parentLiveStateRef.current = parentLiveState;
    const parentStateAtRenderRef = useRef(parentState);
    parentStateAtRenderRef.current = parentState;
    const liveState = useCallback((): Record<string | symbol, any> => {
      const own = latestStateRef.current;
      const parentLive = parentLiveStateRef.current;
      if (!parentLive) return own;
      const parentNow = parentLive();
      const parentThen = (parentStateAtRenderRef.current ?? EMPTY_OBJECT) as Record<
        string | symbol,
        any
      >;
      let live: Record<string | symbol, any> | null = null;
      for (const key of Reflect.ownKeys(parentNow)) {
        const mine = (own as any)[key];
        // --- The container's own value (a var shadowing the parent's) wins
        if (key in own && !Object.is(mine, parentThen[key])) continue;
        if (Object.is(mine, parentNow[key])) continue;
        live ??= { ...own };
        live[key] = parentNow[key];
      }
      return live ?? own;
    }, []);
    const liveStateRef = useMemo(
      () => ({
        get current() {
          return liveState();
        },
      }),
      [liveState],
    ) as MutableRefObject<Record<string, any>>;

    // ========================================================================
    // COMPONENT API REGISTRATION
    // ========================================================================

    const registerComponentApi: RegisterComponentApiFnInner = useCallback((uid, api) => {
      passTrackerRef.current?.noteApi(uid);
      setComponentApis(
        produce((draft) => {
          if (!draft[uid]) {
            draft[uid] = {};
          }
          Object.entries(api).forEach(([key, value]) => {
            if (draft[uid][key] !== value) {
              draft[uid][key] = value;
              passTrackerRef.current?.noteField(uid, key);
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
        const countWrite = () => {
          if (typeof key !== "string") return;
          const stamps = writeStampsRef.current;
          stamps.set(key, (stamps.get(key) ?? 0) + 1);
        };

        // Check local variables FIRST - they shadow globals
        if (isLocalVar) {
          // Local variable - handle locally (even if same name as global)
          countWrite();
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
            countWrite();
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
          countWrite();
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
          // Systemic Fix №7: Always allow framework-level context variables (starting with $)
          // to bubble up to the app state, even if they are not in the 'uses' list.
          // This ensures that components like ContextMenu can update $context successfully.
          const isFrameworkVar = typeof key === 'string' && key.startsWith("$");
          if (isFrameworkVar || !uses || uses.includes(key)) {
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

    const rendered = (
      <ErrorBoundary node={node} location={"container"}>
        <FnDepsProvider value={functionDeps}>
          <Container
            resolvedKey={resolvedKey}
            node={node}
            componentState={containerState}
            latestStateRef={readScopedEnabled ? liveStateRef : undefined}
            globalVars={stableCurrentGlobalVars}
            dispatch={dispatch}
            parentDispatch={parentDispatch}
            setVersion={setVersion}
            version={containerVersion}
            statementCommitRef={readScopedEnabled ? statementCommitRef : undefined}
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
    const withLiveState = readScopedEnabled ? (
      <LiveStateContext.Provider value={liveState}>
        <WriteStampContext.Provider value={stampOf}>
          <LoaderNamesContext.Provider value={scopedLoaderNames}>
            <ApiOnlyFieldContext.Provider value={isApiOnlyField}>{rendered}</ApiOnlyFieldContext.Provider>
          </LoaderNamesContext.Provider>
        </WriteStampContext.Provider>
      </LiveStateContext.Provider>
    ) : (
      rendered
    );
    return passTracker ? (
      <RenderPassContext.Provider value={passTracker.handle}>{withLiveState}</RenderPassContext.Provider>
    ) : (
      withLiveState
    );
  }),
);
