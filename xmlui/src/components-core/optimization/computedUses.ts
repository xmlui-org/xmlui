/**
 * This module computes the minimal set of parent-scope state names that each
 * implicit container actually reads, storing the result in `node.computedUses`.
 *
 * This happens once at transform/boot time, after the full `ComponentDef`
 * tree is built but before the reactive graph is wired up.
 *
 * UID scoping rule:
 * - A child component with `id="foo"` registers its API in the nearest ancestor
 *   `StateContainer`. This means "foo" is *locally owned* by that container.
 * - Locally owned IDs must NOT appear in the container's `computedUses`.
 * - To model this, we track "escaping UIDs": IDs that will register into the
 *   *parent* container when the current subtree is rendered.
 * - Non-container nodes bubble up their own UID and all escaping UIDs from children.
 * - Container nodes capture everything—only their own UID escapes further.
 *
 * `computeUsesInternal` returns `[freeVars, escapingUIDs, freeReads]` to communicate
 * dependencies and registration targets upward.
 */
import { depsOfValueWithReads } from "../script-runner/visitors";
import { Parser } from "../../parsers/scripting/Parser";
import type { Statement, CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import type { ComponentDef, OptimizerMetadataView } from "../../abstractions/ComponentDefs";
import { isContainerLike } from "../rendering/ContainerUtils";
import { XMLUI_GLOBAL_NAMES } from "../state/appContextFactory";
import { PARSED_MARK_PROP } from "../../abstractions/InternalMarkers";

// LRU cache for parsed raw strings to avoid unbounded memory growth.
// AST_CACHE_MAX_SIZE covers typical apps while guarding against generated code.
const AST_CACHE_MAX_SIZE = 1_000;
const astCache = new Map<string, Statement[]>();

function parse(source: string): Statement[] {
  const cached = astCache.get(source);
  if (cached !== undefined) {
    // LRU: re-insert to promote this entry to most-recently-used position.
    astCache.delete(source);
    astCache.set(source, cached);
    return cached;
  }
  const parser = new Parser(source);
  const statements = parser.parseStatements();
  // Evict the oldest entry when at capacity (Map iteration order = insertion order).
  if (astCache.size >= AST_CACHE_MAX_SIZE) {
    const oldestKey = astCache.keys().next().value!;
    astCache.delete(oldestKey);
  }
  astCache.set(source, statements);
  return statements;
}

/**
 * Set to false to disable the computedUses narrowing optimisation entirely.
 * When false, no node receives a `computedUses` assignment and every
 * parent-state update re-renders all children unconditionally — identical
 * to behaviour before this feature was introduced.
 *
 * Intended for running E2E tests with the optimisation switched off.
 */
export const COMPUTED_USES_ENABLED = true;

/**
 * ECMAScript and platform globals that are NEVER stored in XMLUI app state.
 *
 * Filtering these avoids unnecessary dependency tracking for built-ins.
 * We use a curated list to avoid filtering browser-specific legacy properties
 * that a developer might legitimately use as a state variable name.
 *
 * MAINTENANCE: Review this list when new ECMAScript versions are finalized (June).
 * 1. Check TC39 "Finished Proposals" for new stage-4 names.
 * 2. Ensure the name is not a plausible XMLUI variable name.
 * 3. Add to the appropriate section and run tests.
 */
const JS_STDLIB_GLOBALS = new Set([
  // ECMAScript value properties
  "undefined", "NaN", "Infinity", "globalThis",
  // ECMAScript function properties
  "eval", "isFinite", "isNaN", "parseFloat", "parseInt",
  "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent",
  "escape", "unescape",
  // ECMAScript intrinsic objects / namespaces (ES2024 and earlier)
  "Array", "ArrayBuffer", "Atomics", "BigInt", "BigInt64Array", "BigUint64Array",
  "Boolean", "DataView", "Date", "Error", "EvalError", "FinalizationRegistry",
  "Float32Array", "Float64Array", "Function",
  "Int8Array", "Int16Array", "Int32Array",
  "JSON", "Map", "Math", "Number", "Object", "Promise", "Proxy", "RangeError",
  "ReferenceError", "Reflect", "RegExp", "Set", "SharedArrayBuffer", "String",
  "Symbol", "SyntaxError", "TypeError", "URIError",
  "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array",
  "WeakMap", "WeakRef", "WeakSet",
  // ES2025: Float16Array — 16-bit floating-point typed array (V8 ≥ 12.7, FF ≥ 129, Safari ≥ 18.2)
  "Float16Array",
  // Shipping stage-3/4 proposals (Temporal: TC39 stage 3; Iterator: ES2025 stage 4)
  "Temporal", "Iterator",
  // Universally available (browser + Node.js 18+)
  "console", "structuredClone", "queueMicrotask",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval",
  "fetch", "URL", "URLSearchParams", "FormData", "Headers", "Request", "Response",
  "ReadableStream", "WritableStream", "TransformStream",
  "Blob", "File", "FileReader",
  "crypto", "performance",
  "TextEncoder", "TextDecoder",
  "AbortController", "AbortSignal",
  "CustomEvent", "Event", "EventTarget",
  "WebSocket",
  // Browser dialog APIs — never XMLUI state variable names.
  "alert", "confirm", "prompt",
]);

const isBuiltinGlobal = (name: string): boolean => JS_STDLIB_GLOBALS.has(name);

/**
 * XMLUI framework globals (Actions, navigate, toast, App, Log, theme helpers,
 * date/math/storage utilities, ...). These are wired into every expression
 * scope by AppContent's `appContextValue` and are NEVER stored in parent UI
 * state, so they must not contribute to `parentDependencies`.
 *
 * Without this filter, any component reading e.g. `Actions.foo()` ends up
 * with a non-empty `nonDynamicReadDeps`, which falsely promotes
 * `isImplicitContainerByDefault` components (Select, List, Table) to a full
 * StateContainer — adding tree depth and isolating their state lifecycle.
 *
 * See proposal: `optimization/specs/TODO - framework-globals-leak-proposal.md`.
 */
const isXmluiFrameworkGlobal = (name: string): boolean => XMLUI_GLOBAL_NAMES.has(name);

function depsOfRecord(
  record: Record<string, unknown> | undefined,
): { all: Set<string>; reads: Set<string> } {
  const all = new Set<string>();
  const reads = new Set<string>();
  if (!record) return { all, reads };
  for (const value of Object.values(record)) {
    const { all: a, reads: r } = depsOfValueWithReads(value);
    for (const dep of a) all.add(dep);
    for (const dep of r) reads.add(dep);
  }
  return { all, reads };
}

/**
 * Collects the union of parent-scope identifiers referenced by all code-behind
 * functions. Each function is an ArrowExpression (identified by ARROW_EXPR_MARK).
 *
 * To use depsOfValueWithReads on ArrowExpressions, they are wrapped in a fake
 * CodeDeclaration { [PARSED_MARK_PROP]: true, tree: arrowExpr }. The
 * isParsedValue branch of depsOfValueWithReads then calls
 * collectVariableDependencies(arrowExpr), which handles T_ARROW_EXPRESSION
 * correctly: parameters become the local block scope, body free vars are returned.
 *
 * Transitive calls between functions in the same block are followed with DFS
 * and a visited-set to avoid infinite recursion on mutually recursive functions.
 */
function collectScriptFunctionDeps(
  functions: Record<string, CodeDeclaration>,
  localNames: ReadonlySet<string>,
): { all: Set<string>; reads: Set<string> } {
  const allDeps = new Set<string>();
  const readDeps = new Set<string>();
  const fnCache = new Map<string, { all: Set<string>; reads: Set<string> }>();

  function analyzeOne(
    name: string,
    visiting: ReadonlySet<string>,
  ): { all: Set<string>; reads: Set<string> } {
    if (fnCache.has(name)) return fnCache.get(name)!;
    if (visiting.has(name)) return { all: new Set(), reads: new Set() };

    const fn = functions[name];
    if (!fn) return { all: new Set(), reads: new Set() };

    const nextVisiting = new Set([...visiting, name]);
    // Wrap the ArrowExpression as a fake CodeDeclaration so that the
    // isParsedValue branch in depsOfValueWithReads routes it through
    // collectVariableDependencies, which handles T_ARROW_EXPRESSION:
    // parameters become the local block scope, body free vars are returned.
    const wrapped = { [PARSED_MARK_PROP]: true, tree: fn } as unknown as CodeDeclaration;
    const { all: rawAll, reads: rawReads } = depsOfValueWithReads(wrapped);

    const fnAll = new Set<string>();
    const fnReads = new Set<string>();

    for (const d of rawAll) {
      if (localNames.has(d) && d in functions) {
        // Transitive call to another local code-behind function — recurse.
        const transitive = analyzeOne(d, nextVisiting);
        for (const td of transitive.all) fnAll.add(td);
        for (const td of transitive.reads) fnReads.add(td);
      } else {
        fnAll.add(d);
      }
    }
    for (const d of rawReads) {
      if (!(localNames.has(d) && d in functions)) {
        fnReads.add(d);
      }
    }

    fnCache.set(name, { all: fnAll, reads: fnReads });
    return { all: fnAll, reads: fnReads };
  }

  for (const name of Object.keys(functions)) {
    const { all, reads } = analyzeOne(name, new Set());
    for (const d of all) allDeps.add(d);
    for (const d of reads) readDeps.add(d);
  }

  return { all: allDeps, reads: readDeps };
}

/**
 * Core recursive worker.
 * Returns a tuple:
 * - [0] freeVars: Identifiers referenced in this subtree that must come from the parent scope.
 * - [1] escapingUIDs: UIDs that will register into the parent container at runtime.
 * - [2] freeReads: Subset of freeVars containing only read references.
 */
const EMPTY_SET: ReadonlySet<string> = Object.freeze(new Set<string>());

function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false,
  injectedVarsScope: ReadonlySet<string> = EMPTY_SET,
  metadataLookup?: (type: string) => OptimizerMetadataView | undefined,
): [Set<string>, Set<string>, Set<string>] {
  // Clear stale `computedUses` from prior traversals.
  // Re-running analysis is routine (e.g., after merging code-behind functions).
  node.computedUses = undefined;

  const isKnownContainer = isContainerLike(node, { strict: true, ignoreComputedUses: true });

  // Explicit containers (Container type or explicit `uses`) OWN their child APIs.
  // Implicit containers (vars/loaders/etc. but no `uses`) delegate registration to the parent.
  // CONTEXT: Escaping UIDs bubble up through implicit containers.
  const isExplicitOwner = node.type === "Container" || node.uses !== undefined;

  const localDeclared = new Set<string>();
  // Any node that creates a runtime container (vars/loaders/functions/uses/etc.)
  // declares those names locally so they don't bubble to the parent's deps.
  // This is the original architecture: regular containers + implicit containers
  // both run inside a StateContainer at runtime; their `vars` and `functions`
  // are the StateContainer's local state, NOT the parent's.
  if (node.vars) for (const k of Object.keys(node.vars)) localDeclared.add(k);
  if (node.functions) for (const k of Object.keys(node.functions)) localDeclared.add(k);
  if (node.scriptCollected) {
    for (const k of Object.keys(node.scriptCollected.functions ?? {})) localDeclared.add(k);
    for (const k of Object.keys(node.scriptCollected.vars ?? {})) localDeclared.add(k);
  }
  // node.uid NEVER registers in itself; it always registers in the parent container.
  // So it must never be in localDeclared.

  // Context variables ($item, $itemIndex, etc.) are injected by the framework
  // at runtime into the children of this node — they are locally provided, not
  // external dependencies, so they must be in localDeclared.
  if (node.contextVars) {
    for (const k of Object.keys(node.contextVars)) localDeclared.add(k);
  }
  // Note: loader UIDs are NOT pre-seeded here. processChildList(node.loaders)
  // below will receive their escapingUIDs and add them to localDeclared then.
  // Pre-seeding would create a dual-authority situation and would incorrectly
  // treat a container-loader's UID as locally owned even if it should escape.

  // Function names declared by THIS node — passed to children as parentFunctionNames
  // if this node is (or becomes) a container that creates a new scope.
  // Functions are non-reactive: including extra ones in computedUses never causes
  // unnecessary rerenders, but excluding them breaks transitive calls at runtime.
  const nodeFunctionNames = new Set<string>([
    ...Object.keys(node.functions ?? {}),
    ...Object.keys(node.scriptCollected?.functions ?? {}),
  ]);

  // Children of a container see THIS node's functions; children of a non-container
  // see the same parentFunctionNames inherited from above (scope doesn't change).
  const childFunctionNames = isKnownContainer ? nodeFunctionNames : parentFunctionNames;

  const usedHere = new Set<string>();
  const usedHereReads = new Set<string>();

  const addRecord = (rec: Record<string, unknown> | undefined) => {
    const { all, reads } = depsOfRecord(rec);
    for (const d of all) usedHere.add(d);
    for (const d of reads) usedHereReads.add(d);
  };
  const addValue = (v: unknown) => {
    const { all, reads } = depsOfValueWithReads(v);
    for (const d of all) usedHere.add(d);
    for (const d of reads) usedHereReads.add(d);
  };

  addRecord(node.props as Record<string, unknown> | undefined);
  addRecord(node.vars);
  // Analyze code-behind variable declarations for parent-scope initial-value deps.
  // Their names are already in localDeclared; here we collect what their
  // initializer expressions reference from the parent scope.
  if (node.scriptCollected?.vars) {
    addRecord(node.scriptCollected.vars as Record<string, unknown>);
  }

  const events = node.events as Record<string, unknown> | undefined;
  const metadata = metadataLookup?.(node.type);

  const addEvent = (raw: unknown, eventScope: ReadonlySet<string>) => {
    if (typeof raw === "string" && !raw.includes("{")) {
      try {
        const statements = parse(raw);
        const { all, reads } = depsOfValueWithReads({ statements });
        for (const d of all) {
          if (!eventScope.has(d)) usedHere.add(d);
        }
        for (const d of reads) {
          if (!eventScope.has(d)) usedHereReads.add(d);
        }
        return;
      } catch {
        // Fall back to regular processing if not a valid script
      }
    }
    const { all, reads } = depsOfValueWithReads(raw);
    for (const d of all) {
      if (!eventScope.has(d)) usedHere.add(d);
    }
    for (const d of reads) {
      if (!eventScope.has(d)) usedHereReads.add(d);
    }
  };

  if (events) {
    for (const [eventName, raw] of Object.entries(events)) {
      const eventMeta = metadata?.events?.[eventName];
      const eventInjected = eventMeta?.injectedVars ?? [];
      const eventScope = eventInjected.length > 0
        ? new Set([...injectedVarsScope, ...eventInjected])
        : injectedVarsScope;

      addEvent(raw, eventScope);
    }
  }

  addRecord(node.api as Record<string, unknown> | undefined);

  if (node.when !== undefined && node.when !== null && typeof node.when !== "boolean") {
    addValue(node.when);
  }
  if (node.responsiveWhen) {
    for (const v of Object.values(node.responsiveWhen)) {
      if (v !== undefined && v !== null && typeof v !== "boolean") {
        addValue(v);
      }
    }
  }

  // Propagate narrowing-disable to children whenever this node has code-behind
  // (scriptCollected or .xs functions). Children that call these functions still
  // need the conservative "disable narrowing" signal; the node ITSELF can now
  // be narrowed based on analyzed function deps (see ownHasScript below).
  const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
  const disablesChildNarrowing = !!node.scriptCollected || hasCodeBehind;
  const nextDisableNarrowing = disableNarrowing || disablesChildNarrowing;

  // Collect all code-behind functions from both sources and analyze their deps.
  // This replaces the old blanket "disable narrowing for script nodes" approach:
  // if all functions are analyzable, we add their parent-scope refs to usedHere
  // and allow the node itself to be narrowed based on actual dependencies.
  const scriptFunctions = {
    ...(node.scriptCollected?.functions ?? {}),
    ...(node.functions ?? {}),
  } as Record<string, CodeDeclaration>;
  if (Object.keys(scriptFunctions).length > 0) {
    const { all: fnAll, reads: fnReads } = collectScriptFunctionDeps(
      scriptFunctions,
      localDeclared,
    );
    for (const d of fnAll) usedHere.add(d);
    for (const d of fnReads) usedHereReads.add(d);
  }

  // Narrowing is blocked for this node only when its script contains statements
  // that failed to parse (hasInvalidStatements). In that case the dep set is
  // incomplete and conservative treatment is required.
  // With analyzable functions and vars, the dep set is now complete.
  const ownHasScript = !!(node.scriptCollected?.hasInvalidStatements);
  const childDeps = new Set<string>();
  const childDepsReads = new Set<string>();
  // UIDs from the subtree that will register into THIS node's StateContainer
  // at runtime (because they pass through non-container intermediaries).
  const childEscapingUIDs = new Set<string>();

  const childInjected = [
    ...(metadata?.childInjectedVars ?? []),
    ...(metadata?.unstableChildInjectedVars ?? []),
    // metadata.contextVars keys ($item, $itemIndex, etc.) document what this
    // component type injects into children (Language Server + runtime metadata).
    // For core components this is typically redundant with childInjectedVars
    // declared in the `optimization: {}` block of createMetadata. For
    // extension-package components (Masonry, ReactFlow, etc.) that may not have
    // an `optimization.childInjectedVars` entry, this is the ONLY optimizer hint
    // available in Standalone mode — without it, $item/$itemIndex inside their
    // templates would incorrectly count as parent-scope dependencies.
    ...Object.keys(metadata?.contextVars ?? {}),
  ];
  const childScope = childInjected.length > 0
    ? new Set([...injectedVarsScope, ...childInjected])
    : injectedVarsScope;

  const processChildList = (children: ComponentDef[]) => {
    for (const child of children) {
      const [deps, escapingUIDs, depsReads] = computeUsesInternal(child, childFunctionNames, nextDisableNarrowing, childScope, metadataLookup);
      for (const d of deps) childDeps.add(d);
      for (const d of depsReads) childDepsReads.add(d);
      for (const uid of escapingUIDs) {
        childEscapingUIDs.add(uid);
        // These UIDs will register in this container at runtime — treat them
        // as locally declared so they don't appear in computedUses.
        localDeclared.add(uid);
      }
    }
  };

  if (node.children) processChildList(node.children);
  if (node.loaders) processChildList(node.loaders);
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      processChildList(slotChildren);
    }
  }

  const keepDep = (d: string) =>
    !localDeclared.has(d) && !isBuiltinGlobal(d) && !isXmluiFrameworkGlobal(d) && !injectedVarsScope.has(d);
  const parentDependencies = new Set<string>();
  const parentDependenciesReads = new Set<string>();
  for (const d of usedHere) if (keepDep(d)) parentDependencies.add(d);
  for (const d of childDeps) if (keepDep(d)) parentDependencies.add(d);
  for (const d of usedHereReads) if (keepDep(d)) parentDependenciesReads.add(d);
  for (const d of childDepsReads) if (keepDep(d)) parentDependenciesReads.add(d);

  // If this node is an implicit stateful component (Select, List, Table, etc.)
  // with a UID, include its own UID in parentDependencies so the narrowed state
  // from the parent still contains its bubbled state (e.g. {mySelect.value} from a
  // sibling reads against App.state["mySelect"]).
  if (!isKnownContainer && metadata?.isImplicitContainerByDefault && node.uid) {
    parentDependencies.add(node.uid);
    parentDependenciesReads.add(node.uid);
  }

  // Deps that are "real" parent-state keys (not locally injected vars).
  // Used for the isImplicitDefault promotion check.
  const nonDynamicParentDeps = parentDependencies;
  // Reads-only variant: drives the implicit-container promotion check below.
  const nonDynamicReadDeps = parentDependenciesReads;

  // Use nonDynamicReadDeps so that implicit containers are not promoted purely
  // because of a write-only assignment target in an event handler (which
  // the handler resolves through the existing scope pass-through; no
  // narrowing/re-render tracking is needed for them).
  const isImplicitDefault = !!metadata?.isImplicitContainerByDefault && nonDynamicReadDeps.size > 0;
  const isContainer = isKnownContainer || isImplicitDefault;

  if (isContainer) {
    // Narrowing safety rules:
    // 1. Nodes whose script has unparseable statements (hasInvalidStatements) are NOT narrowed.
    // 2. Nodes calling parent-scope functions while narrowing is disabled are NOT narrowed.
    const dependsOnParentFunction = parentFunctionNames.size > 0 &&
      [...parentDependencies].some(d => parentFunctionNames.has(d));
    const safeToNarrow = !nextDisableNarrowing || (!ownHasScript && !dependsOnParentFunction);

    // Narrow only if there are real READ deps (writes don't need re-render tracking).
    // Dynamic vars ($context) are excluded from the initial check to avoid isolation bugs
    // where empty computedUses={} cuts off the container from sibling APIs.
    if (node.uses === undefined && nonDynamicReadDeps.size > 0 && safeToNarrow) {
      const computedUsesSet = dependsOnParentFunction
        ? new Set([...parentDependencies, ...parentFunctionNames])
        : new Set([...parentDependencies]);

      // Implicit containers delegate API registration to the parent.
      // We must include escaping UIDs in computedUses to avoid isolating children from sibling APIs.
      if (!isExplicitOwner) {
        for (const uid of childEscapingUIDs) computedUsesSet.add(uid);
      }
      node.computedUses = Array.from(computedUsesSet)
        .filter((d): d is string => typeof d === "string")
        .sort();
    }

    // Capture child APIs for explicit owners; bubble them up for implicit containers.
    const myEscapingUID: Set<string> = new Set();
    if (node.uid) myEscapingUID.add(node.uid);
    if (!isExplicitOwner) {
      for (const uid of childEscapingUIDs) myEscapingUID.add(uid);
    }

    // Dynamic vars ($context) belong to this container's computedUses but don't cascade up.
    const propagatedDeps = nonDynamicParentDeps;
    const propagatedReadDeps = nonDynamicReadDeps;
    return [propagatedDeps, myEscapingUID, propagatedReadDeps];
  }

  // Non-container: this node's own UID + all child escaping UIDs propagate
  // upward to the next ancestor container.
  const escapingUIDs = new Set<string>();
  if (node.uid) escapingUIDs.add(node.uid);
  for (const uid of childEscapingUIDs) escapingUIDs.add(uid);

  return [parentDependencies, escapingUIDs, parentDependenciesReads];
}

/**
 * Public API — same contract as before (returns free vars set).
 * Prefer `computeUsesForTree` for whole-tree traversal.
 */
export function computeUsesForSubtree(node: ComponentDef, metadataLookup?: (type: string) => OptimizerMetadataView | undefined): Set<string> {
  if (!COMPUTED_USES_ENABLED) return new Set();
  const [freeVars] = computeUsesInternal(node, new Set(), false, EMPTY_SET, metadataLookup);
  return freeVars;
}

/**
 * Drills through CompoundComponentDef wrappers to reach the inner ComponentDef.
 * A CompoundComponentDef carries its template in a `.component` field.
 */
function unwrapToComponentDef(node: ComponentDef): ComponentDef {
  let current: unknown = node;
  while (current !== null && typeof current === "object") {
    const obj = current as Record<string, unknown>;
    // A real ComponentDef has `type` (string) or `children` (array).
    if (obj["type"] !== undefined || Array.isArray(obj["children"])) {
      return current as ComponentDef;
    }
    // CompoundComponentDef keeps its template in `.component`.
    if (obj["component"] !== undefined) {
      current = obj["component"];
      continue;
    }
    break;
  }
  return node;
}

export function computeUsesForTree(root: ComponentDef, metadataLookup?: (type: string) => OptimizerMetadataView | undefined): void {
  if (!COMPUTED_USES_ENABLED) return;
  // Unwrap potential CompoundComponentDef wrappers before analysis.
  const actualRoot = unwrapToComponentDef(root);
  computeUsesInternal(actualRoot, new Set(), false, EMPTY_SET, metadataLookup);
}
