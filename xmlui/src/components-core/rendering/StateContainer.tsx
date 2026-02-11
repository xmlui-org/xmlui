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
import {
  getCurrentTrace,
  simpleStringify,
  xsConsoleLog,
  pushXsLog,
} from "../inspector/inspectorUtils";
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

    // Track declared variable changes for inspector
    const prevVarsRef = useRef<Record<string, any> | null>(null);
    const initLoggedWithFileRef = useRef<boolean>(false); // Track if we've logged init with file info
    const pendingInitRef = useRef<Record<string, any> | null>(null); // Store pending init values
    useEffect(() => {
      if (!xsVerbose || typeof window === "undefined") return;

      const w = window as any;
      w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];

      // Check both direct debug property and props.debug (the former is set by parser, latter by wrappers)
      const sourceInfo = (node as any).debug?.source || (node.props as any)?.debug?.source;

      // Try to find the source file from debug info or by matching component name
      let resolvedFileId = sourceInfo?.fileId;
      let resolvedFilePath: string | undefined;

      // If we have a numeric fileId, resolve it from _xsSourceFiles
      if (typeof resolvedFileId === "number" && w._xsSourceFiles) {
        resolvedFilePath = w._xsSourceFiles[resolvedFileId];
      } else if (typeof resolvedFileId === "string") {
        resolvedFilePath = resolvedFileId;
      }

      // If no file found yet, try to match based on component uid or containerUid
      if (!resolvedFilePath && w._xsSourceFiles && Array.isArray(w._xsSourceFiles)) {
        const containerUidStr = node.containerUid?.description;
        const searchName = node.uid || containerUidStr;
        // Also try the node type if it's not "Container"
        const typeName = node.type !== "Container" ? node.type : undefined;

        // Build search terms with variations
        const searchTerms: string[] = [];
        if (searchName) {
          searchTerms.push(searchName);
          // For containerUid like "fileCatalogContent", also try "fileCatalog" (remove common suffixes)
          const stripped = searchName.replace(/(Content|Modal|View|Container|Panel)$/i, "");
          if (stripped !== searchName) searchTerms.push(stripped);
        }
        if (typeName) searchTerms.push(typeName);

        for (const term of searchTerms) {
          if (!term) continue;
          const termLower = term.toLowerCase();
          // Look for a file that contains this component name (case-insensitive)
          resolvedFilePath = w._xsSourceFiles.find((f: string) => {
            const fLower = f.toLowerCase();
            // Extract just the filename without path and extension
            const fileName = fLower.split("/").pop()?.replace(".xmlui", "") || "";
            // Match if filename contains term, or term contains filename
            return fileName.includes(termLower) || termLower.includes(fileName);
          });
          if (resolvedFilePath) break;
        }
      }

      // Build a meaningful component identifier from available info
      const fileName = resolvedFilePath ? resolvedFilePath.split("/").pop()?.replace(".xmlui", "") : undefined;
      // Prefer meaningful identifiers: uid > filename > containerUid, avoid generic "Container"
      const componentId = node.uid || fileName || node.containerUid?.description ||
        (node.type !== "Container" ? node.type : undefined) || undefined;

      // Get only user-declared VARS (not functions), filtering out framework-injected ones
      const frameworkVars = new Set([
        "$props", "emitEvent", "hasEventHandler", "updateState",
        "$item", "$itemIndex", "$this", "$parent",
      ]);
      // Only track vars, not functions - combine inline vars and script-collected vars
      const varsOnly = { ...(node.vars || {}), ...(node.scriptCollected?.vars || {}) };
      const declaredVarKeys = Object.keys(varsOnly).filter(
        (key) => !frameworkVars.has(key) && !key.startsWith("$")
      );
      if (declaredVarKeys.length === 0) {
        prevVarsRef.current = {};
        return;
      }


      const currentVars: Record<string, any> = {};
      for (const key of declaredVarKeys) {
        currentVars[key] = resolvedLocalVars[key];
      }

      const prevVars = prevVarsRef.current;
      const isInitial = prevVars === null;
      const hasSourceFiles = w._xsSourceFiles && Array.isArray(w._xsSourceFiles) && w._xsSourceFiles.length > 0;

      const changes: Array<{ key: string; before: any; after: any; kind: "init" | "change" }> = [];

      if (isInitial) {
        // Initial mount - if source files aren't available yet, defer the init logging
        if (!hasSourceFiles) {
          // Store the init values to log later when source files become available
          pendingInitRef.current = cloneDeep(currentVars);
          prevVarsRef.current = cloneDeep(currentVars);
          return; // Don't log yet, wait for source files
        }
        // Source files available - capture all declared vars for init (skip undefined → undefined)
        for (const key of declaredVarKeys) {
          const afterVal = currentVars[key];
          if (afterVal !== undefined) {
            changes.push({
              key,
              before: undefined,
              after: afterVal,
              kind: "init",
            });
          }
        }
      } else {
        // Check if we have a pending init to log now that source files are available
        if (pendingInitRef.current && !initLoggedWithFileRef.current && hasSourceFiles) {
          // Log the deferred init event with file info (skip undefined → undefined)
          const initChanges: typeof changes = [];
          for (const key of declaredVarKeys) {
            const afterVal = pendingInitRef.current[key];
            if (afterVal !== undefined) {
              initChanges.push({
                key,
                before: undefined,
                after: afterVal,
                kind: "init",
              });
            }
          }
          if (initChanges.length > 0) {
            // Log the init event (will be handled below after we set up the logging logic)
            const initVarNames = initChanges.map((c) => c.key).join(", ");
            const initDisplayId = componentId || initChanges[0]?.key || "component";
            const initFormattedChanges = initChanges.map((c) => {
              return `${c.key}: ${simpleStringify(c.before)} → ${simpleStringify(c.after)}`;
            });
            const initLogEntry = {
              ts: Date.now(),
              perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
              traceId: getCurrentTrace() || `vars-${initDisplayId}`,
              kind: "component:vars:init",
              uid: initDisplayId,
              eventName: initVarNames,
              componentType: node.type,
              componentLabel: componentId || undefined,
              ownerFileId: resolvedFilePath || sourceInfo?.fileId,
              ownerSource: sourceInfo ? { start: sourceInfo.start, end: sourceInfo.end } : undefined,
              file: resolvedFilePath,
              changes: initChanges.map((c) => ({ key: c.key, before: c.before, after: c.after, changeKind: c.kind })),
              diff: initChanges.map((c) => ({
                path: c.key, type: "add", before: c.before, after: c.after,
                beforeJson: simpleStringify(c.before), afterJson: simpleStringify(c.after),
                diffPretty: `${c.key}: ${simpleStringify(c.before)} → ${simpleStringify(c.after)}`,
              })),
              diffPretty: (resolvedFilePath ? `file: ${resolvedFilePath}\n` : "") + initFormattedChanges.join("\n"),
            };
            pushXsLog(initLogEntry);
            xsConsoleLog(initLogEntry.kind, initLogEntry);
          }
          initLoggedWithFileRef.current = true;
          pendingInitRef.current = null;
        }

        // Check for changes
        for (const key of declaredVarKeys) {
          const prev = prevVars[key];
          const curr = currentVars[key];
          // Deep comparison for objects/arrays
          const prevJson = JSON.stringify(prev);
          const currJson = JSON.stringify(curr);
          if (prevJson !== currJson) {
            changes.push({
              key,
              before: prev,
              after: curr,
              kind: "change",
            });
          }
        }
      }

      if (changes.length > 0) {
        const varNames = changes.map((c) => c.key).join(", ");
        const displayId = componentId || changes[0]?.key || "component";
        const filePath = resolvedFilePath;

        const formattedChanges = changes.map((c) => {
          return `${c.key}: ${simpleStringify(c.before)} → ${simpleStringify(c.after)}`;
        });

        const logEntry = {
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: getCurrentTrace() || `vars-${displayId}`,
          kind: isInitial ? "component:vars:init" : "component:vars:change",
          uid: displayId,
          eventName: varNames,
          componentType: node.type,
          componentLabel: componentId || undefined,
          ownerFileId: resolvedFilePath || sourceInfo?.fileId,
          ownerSource: sourceInfo ? { start: sourceInfo.start, end: sourceInfo.end } : undefined,
          file: filePath,
          changes: changes.map((c) => ({
            key: c.key,
            before: c.before,
            after: c.after,
            changeKind: c.kind,
          })),
          diff: changes.map((c) => ({
            path: c.key,
            type: c.kind === "init" ? "add" : "update",
            before: c.before,
            after: c.after,
            beforeJson: simpleStringify(c.before),
            afterJson: simpleStringify(c.after),
            diffPretty: `${c.key}: ${simpleStringify(c.before)} → ${simpleStringify(c.after)}`,
          })),
          diffPretty: (filePath ? `file: ${filePath}\n` : "") + formattedChanges.join("\n"),
        };

        pushXsLog(logEntry);
        xsConsoleLog(logEntry.kind, logEntry);
      }

      prevVarsRef.current = cloneDeep(currentVars);
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
      
      // Merge with node globals taking precedence
      return {
        ...evaluatedParentGlobals,
        ...evaluatedNodeGlobals,
      };   
    }, [parentGlobalVars, node.globalVars, appContext, globalDepValueMap, globalDependencies, componentStateWithApis]);

    // ========================================================================
    // LAYER 6: FINAL STATE COMBINATION
    // ========================================================================

    const combinedState = useCombinedState(
      stateFromOutside,
      node.contextVars,
      currentGlobalVars,  // Add globalVars to combined state
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

    // ========================================================================
    // STATE CHANGE CALLBACK
    // ========================================================================

    const statePartChanged: StatePartChangedFn = useCallback(
      (pathArray, newValue, target, action) => {
        const key = pathArray[0];
        const isGlobalVar = key in currentGlobalVars;
        const isRoot = node.uid === 'root';
        
        if (isGlobalVar) {
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
        } else if (key in componentStateRef.current || key in resolvedLocalVars) {
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
          // Not global, not local - bubble up if allowed by uses
          if (!node.uses || node.uses.includes(key)) {
            parentStatePartChanged(pathArray, newValue, target, action);
          }
        }
      },
      [resolvedLocalVars, currentGlobalVars, node.uses, node.uid, parentStatePartChanged],
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
          globalVars={currentGlobalVars}
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

//true if it's coming from a code behind or a script tag
function isParsedValue(value: any): value is CodeDeclaration {
  return isParsedCodeDeclaration(value);
}
