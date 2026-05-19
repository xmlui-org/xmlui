/**
 * Computes the minimal set of parent-scope state names that each implicit
 * container actually reads, storing the result in `node.computedUses`.
 *
 * Side effects: mutates `node.computedUses` in-place for every node that
 * acts as a container (has vars/loaders/functions/etc.) and does not already
 * carry an explicit `uses` list.
 *
 * When called: once at transform/boot time, after the full `ComponentDef`
 * tree has been built and before the reactive graph is wired up.
 *
 * UID scoping rule
 * ----------------
 * At runtime, a child component with `id="foo"` calls `registerComponentApi`
 * which stores the API object in the nearest ancestor StateContainer. This
 * means "foo" is *locally owned* by that container — it must NOT appear in
 * the container's `computedUses` (which lists names that must come from the
 * *parent* scope).
 *
 * To model this at parse-time we track "escaping UIDs": UIDs that will
 * register into the *parent* container when the current subtree is rendered.
 * For a non-container node its own UID (and all escaping UIDs from its
 * non-container children) bubble up. A container node captures everything —
 * only its own UID escapes further.
 *
 * `computeUsesInternal` returns a tuple [freeVars, escapingUIDs] so each
 * call can both (a) communicate free-variable deps upward and (b) tell the
 * parent which UIDs will register locally at runtime.
 */
import { collectVariableDependencies } from "../script-runner/visitors";
import { parseParameterString } from "../script-runner/ParameterParser";
import { Parser } from "../../parsers/scripting/Parser";
import { isParsedValue } from "../state/variable-resolution";

function parse(source: string) {
  const parser = new Parser(source);
  return parser.parseStatements();
}
import type { CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { ROUTING_STATE_KEYS } from "../state/routing-state";
import { isContainerLike } from "../rendering/ContainerUtils";

/**
 * Set to false to disable the computedUses narrowing optimisation entirely.
 * When false, no node receives a `computedUses` assignment and every
 * parent-state update re-renders all children unconditionally — identical
 * to behaviour before this feature was introduced.
 *
 * Intended for running E2E tests with the optimisation switched off.
 */
export const COMPUTED_USES_ENABLED = true;

export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", "Table", "DataGrid"]);

/**
 * ECMAScript standard globals and universally-available platform globals
 * that will NEVER be stored in XMLUI app state.
 *
 * We deliberately use a curated set rather than a bare `name in globalThis`
 * check.  The reason: `globalThis` (= `window` in browsers) contains hundreds
 * of legacy / browser-specific properties such as `external`, `screen`,
 * `history`, `status`, `frames`, etc.  An XMLUI developer may legitimately
 * name a component state variable any of those names, so filtering them would
 * silently suppress valid dependency tracking.
 *
 * The set below covers:
 *  – ECMAScript value properties  (undefined, NaN, Infinity, globalThis)
 *  – ECMAScript function properties (eval, parseInt, encodeURI, …)
 *  – ECMAScript intrinsic constructors/namespaces (Array, JSON, Math, …)
 *  – Universally available globals present in both browsers and Node.js
 *    (console, setTimeout, fetch, URL, crypto, structuredClone, …)
 *
 * It does NOT include browser-only legacy properties (window.external,
 * window.status, window.frames, …) or Node.js–only properties (process,
 * require, __dirname, …) that could plausibly be XMLUI variable names.
 */
const JS_STDLIB_GLOBALS = new Set([
  // ECMAScript value properties
  "undefined", "NaN", "Infinity", "globalThis",
  // ECMAScript function properties
  "eval", "isFinite", "isNaN", "parseFloat", "parseInt",
  "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent",
  "escape", "unescape",
  // ECMAScript intrinsic objects / namespaces
  "Array", "ArrayBuffer", "Atomics", "BigInt", "BigInt64Array", "BigUint64Array",
  "Boolean", "DataView", "Date", "Error", "EvalError", "FinalizationRegistry",
  "Float32Array", "Float64Array", "Function",
  "Int8Array", "Int16Array", "Int32Array",
  "JSON", "Map", "Math", "Number", "Object", "Promise", "Proxy", "RangeError",
  "ReferenceError", "Reflect", "RegExp", "Set", "SharedArrayBuffer", "String",
  "Symbol", "SyntaxError", "TypeError", "URIError",
  "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array",
  "WeakMap", "WeakRef", "WeakSet",
  // Upcoming ECMAScript (stage 3+ / shipping)
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
  // Browser dialog APIs — browser-only (not Node.js), but XMLUI always runs in a browser.
  // XMLUI overrides `confirm` with its own dialog; `alert` and `prompt` are also
  // never XMLUI state variable names.  Filter them so they don't pollute computedUses.
  "alert", "confirm", "prompt",
]);

const isBuiltinGlobal = (name: string): boolean => JS_STDLIB_GLOBALS.has(name);

/**
 * `$`-prefixed names that ARE stored in parent state and must not be filtered.
 *
 * These are injected at runtime via component state dispatch (not via the
 * per-render contextVars mechanism), so they genuinely live in the parent
 * StateContainer's state map and need to appear in `computedUses` so that
 * containers re-render when they change.
 *
 * - `$context`: set by `ContextMenu.openAt()` via implicit dispatch to the
 *   parent container.  Without it in `computedUses`, the container is memo-
 *   blocked when `$context` changes, and `customRender` never picks up the
 *   new value — all menu items see `$context = undefined`.
 */
const PARENT_STATE_DYNAMIC_VARS = new Set(["$context"]);

/**
 * Identifiers injected at runtime into DataSource/DataLoader `fetch` handlers only.
 * They must NOT be treated as parent-scope dependencies: especially `$queryParams`
 * collides with {@link ROUTING_STATE_KEYS} router state, which would narrow ancestors
 * to URL query params and break handler context merge (DataSource onFetch tests).
 */
const DATA_FETCH_HANDLER_INJECTED_KEYS = new Set([
  "$url",
  "$method",
  "$queryParams",
  "$requestBody",
  "$requestHeaders",
  "$pageParams",
]);

/**
 * Returns true for framework-injected context variables that are NOT stored
 * in parent state.  All XMLUI runtime-injected names start with `$`; the
 * exceptions are the router state keys (routing-state.ts) and the dynamic
 * vars listed in PARENT_STATE_DYNAMIC_VARS above.
 */
const isRuntimeContextVar = (name: string): boolean =>
  name.startsWith("$") &&
  !ROUTING_STATE_KEYS.has(name) &&
  !PARENT_STATE_DYNAMIC_VARS.has(name);

/**
 * Walk a plain-object AST tree collecting Identifier node names.
 *
 * This fallback is needed for event handler ASTs that arrive with string-typed
 * `type` discriminators (e.g. `"Identifier"`, `"ExpressionStatement"`) rather
 * than the numeric constants the real scripting parser emits. This format
 * appears when event handler objects are constructed directly (e.g. in tests
 * or via JSON-serialised ASTs) instead of being produced by the scripting
 * parser. `collectVariableDependencies` only handles the numeric-discriminator
 * format, so we fall back to a structural walk for the string-discriminator
 * case.
 */
function gatherIdentifiers(node: unknown, acc: Set<string> = new Set()): Set<string> {
  if (node === null || node === undefined || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const item of node) gatherIdentifiers(item, acc);
    return acc;
  }
  const obj = node as Record<string, unknown>;
  if (obj.type === "Identifier" && typeof obj.name === "string") {
    acc.add(obj.name);
  } else {
    for (const val of Object.values(obj)) gatherIdentifiers(val, acc);
  }
  return acc;
}

function rootIdentifier(dep: string): string {
  const dot = dep.indexOf(".");
  const bracket = dep.indexOf("[");
  if (dot === -1 && bracket === -1) return dep;
  if (dot === -1) return dep.slice(0, bracket);
  if (bracket === -1) return dep.slice(0, dot);
  return dep.slice(0, Math.min(dot, bracket));
}

/**
 * Returns dependencies for a value. The `all` set includes every identifier
 * that must be present in scope at runtime — reads AND assignment targets.
 * The `reads` set only includes identifiers whose VALUES are actually consumed
 * (RHS reads, member-access roots, etc.). The difference between the two is
 * the "write-only targets" — identifiers that appear only as the LHS of an
 * assignment and whose value is never read by this expression.
 *
 * Why two sets?
 *   • `all` decides what `computedUses` lists, because the script engine
 *     throws "Left value variable not found in the scope" if an assignment
 *     target is missing from scope.
 *   • `reads` decides whether to promote a component to an implicit container
 *     (Select/List/Table/DataGrid). An implicit container exists to enable
 *     re-renders when its parent state changes — and write-only targets do
 *     not need to trigger re-renders (the handler writes them, it does not
 *     read them). Promoting a component to a container based on write-only
 *     deps adds an unnecessary StateContainer wrapper that can break the
 *     component's internal lifecycle (e.g. Select's clearable state).
 */
function depsOfValue(value: unknown): { all: string[]; reads: string[] } {
  try {
    if (value === null || value === undefined) return { all: [], reads: [] };
    if (isParsedValue(value)) {
      const tree = (value as CodeDeclaration).tree;
      const all = (
        collectVariableDependencies(tree, {}, { includeAssignmentTargets: true }) ?? []
      ).map(rootIdentifier);
      const reads = (collectVariableDependencies(tree) ?? []).map(rootIdentifier);
      return { all, reads };
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (obj.statements && Array.isArray(obj.statements)) {
        const hasStringDiscriminators =
          obj.statements.length > 0 &&
          typeof (obj.statements[0] as any)?.type === "string";
        if (hasStringDiscriminators) {
          // gatherIdentifiers collects every Identifier node regardless of position
          // (RHS, LHS, member-access root) — string-discriminator ASTs use it for
          // both sets, because we lack the structured visitor for that format.
          const ids = Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
          return { all: ids, reads: ids };
        }
        try {
          const all = (
            collectVariableDependencies(obj.statements, {}, { includeAssignmentTargets: true }) ?? []
          ).map(rootIdentifier);
          const reads = (collectVariableDependencies(obj.statements) ?? []).map(rootIdentifier);
          return { all, reads };
        } catch {
          const ids = Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
          return { all: ids, reads: ids };
        }
      }
      return { all: [], reads: [] };
    }
    if (typeof value === "string") {
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        for (const id of collectVariableDependencies(part.value) ?? []) {
          acc.add(rootIdentifier(id));
        }
      }
      // String-templated values can only contain reactive expressions
      // (no statements/assignments) — reads == all.
      const ids = Array.from(acc);
      return { all: ids, reads: ids };
    }
    return { all: [], reads: [] };
  } catch {
    return { all: [], reads: [] };
  }
}

function depsOfRecord(
  record: Record<string, unknown> | undefined,
): { all: Set<string>; reads: Set<string> } {
  const all = new Set<string>();
  const reads = new Set<string>();
  if (!record) return { all, reads };
  for (const value of Object.values(record)) {
    const { all: a, reads: r } = depsOfValue(value);
    for (const dep of a) all.add(dep);
    for (const dep of r) reads.add(dep);
  }
  return { all, reads };
}

/**
 * Core recursive worker.
 *
 * Returns a tuple:
 *   [0] freeVars     – identifiers referenced in this subtree that must come
 *                      from the *parent* container's scope (reads + assignment
 *                      targets).
 *   [1] escapingUIDs – UIDs that will call `registerComponentApi` into the
 *                      *parent* container at runtime (i.e. they are not
 *                      captured by any intermediate container inside this
 *                      subtree). The caller adds these to its own
 *                      `localDeclared` so they don't pollute `computedUses`.
 *   [2] freeReads    – subset of [0] that contains only read references
 *                      (no assignment-only targets). Used to decide whether
 *                      a parent should be promoted to an implicit container:
 *                      write-only targets do not need re-render tracking, so
 *                      they should not by themselves trigger promotion.
 */
function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false
): [Set<string>, Set<string>, Set<string>] {
  const localDeclared = new Set<string>();
  if (node.vars) for (const k of Object.keys(node.vars)) localDeclared.add(k);
  if (node.functions) for (const k of Object.keys(node.functions)) localDeclared.add(k);
  if (node.scriptCollected) {
    for (const k of Object.keys(node.scriptCollected.functions ?? {})) localDeclared.add(k);
    for (const k of Object.keys(node.scriptCollected.vars ?? {})) localDeclared.add(k);
  }
  if (node.uid) localDeclared.add(node.uid);
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
  // A node is a "known" container regardless of parentDeps (excludes implicit-default).
  // Uses the shared `isContainerLike` predicate in strict mode so that:
  //   • truthy-but-empty `vars: {}` / `functions: {}` from the StandaloneApp merge
  //     do NOT count as containers (would otherwise falsely narrow children);
  //   • `computedUses` is ignored — it is being computed right now, so it would
  //     create a chicken-and-egg situation on re-runs.
  const isKnownContainer = isContainerLike(node, { strict: true, ignoreComputedUses: true });
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
    const { all, reads } = depsOfValue(v);
    for (const d of all) usedHere.add(d);
    for (const d of reads) usedHereReads.add(d);
  };

  addRecord(node.props as Record<string, unknown> | undefined);
  addRecord(node.vars);

  const isDataLoader = node.type === "DataLoader" || node.type === "DataSource";
  const events = node.events as Record<string, unknown> | undefined;

  const addEvent = (raw: unknown) => {
    if (typeof raw === "string" && !raw.includes("{")) {
      try {
        const statements = parse(raw);
        const { all, reads } = depsOfValue({ statements });
        for (const d of all) usedHere.add(d);
        for (const d of reads) usedHereReads.add(d);
        return;
      } catch {
        // Fall back to regular processing if not a valid script
      }
    }
    addValue(raw);
  };

  if (events) {
    for (const [key, raw] of Object.entries(events)) {
      if (isDataLoader && key === "fetch" && raw != null) {
        const { all: fetchAll, reads: fetchReads } = depsOfValue(raw);
        for (const r of fetchAll) {
          const d = rootIdentifier(r);
          if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d)) usedHere.add(d);
        }
        for (const r of fetchReads) {
          const d = rootIdentifier(r);
          if (!DATA_FETCH_HANDLER_INJECTED_KEYS.has(d)) usedHereReads.add(d);
        }
      } else {
        addEvent(raw);
      }
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

  // Disable narrowing propagation if this node has a <script> tag (scriptCollected) OR
  // a separate .xs code-behind file (functions populated by StandaloneApp merge).
  // Either means function bodies can reference any state var — template analysis is insufficient.
  const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
  const ownHasScript = !!node.scriptCollected || hasCodeBehind;
  const nextDisableNarrowing = disableNarrowing || ownHasScript;
  const childDeps = new Set<string>();
  const childDepsReads = new Set<string>();
  // UIDs from the subtree that will register into THIS node's StateContainer
  // at runtime (because they pass through non-container intermediaries).
  const childEscapingUIDs = new Set<string>();

  const processChildList = (children: ComponentDef[]) => {
    for (const child of children) {
      const [deps, escapingUIDs, depsReads] = computeUsesInternal(child, childFunctionNames, nextDisableNarrowing);
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
    !localDeclared.has(d) && !isBuiltinGlobal(d) && !isRuntimeContextVar(d);
  const parentDependencies = new Set<string>();
  const parentDependenciesReads = new Set<string>();
  for (const d of usedHere) if (keepDep(d)) parentDependencies.add(d);
  for (const d of childDeps) if (keepDep(d)) parentDependencies.add(d);
  for (const d of usedHereReads) if (keepDep(d)) parentDependenciesReads.add(d);
  for (const d of childDepsReads) if (keepDep(d)) parentDependenciesReads.add(d);

  // Deps that are "real" parent-state keys (not runtime-injected dynamic vars).
  // Used for the isImplicitDefault promotion check: a component should not be
  // promoted to a container solely because it reads a dynamic var like $context.
  // If the ONLY deps are dynamic vars, stateFromOutside would be {} initially
  // (before openAt), which breaks the component.
  const nonDynamicParentDeps = new Set(
    [...parentDependencies].filter((d) => !PARENT_STATE_DYNAMIC_VARS.has(d)),
  );
  // Reads-only variant: drives the implicit-container promotion check below.
  // Promotion based on reads avoids wrapping a component in an unnecessary
  // StateContainer when its only "deps" are write-only assignment targets in
  // event handlers (which the handler resolves through the existing scope
  // pass-through; no narrowing/re-render tracking is needed for them).
  const nonDynamicReadDeps = new Set(
    [...parentDependenciesReads].filter((d) => !PARENT_STATE_DYNAMIC_VARS.has(d)),
  );

  // Use nonDynamicReadDeps so that implicit containers are not promoted purely
  // because of a dynamic var dependency ($context etc.) — that would set
  // computedUses=["$context"], making stateFromOutside={} and isolating the
  // component from all other parent state — AND so that write-only assignment
  // targets in event handlers don't promote (write-only targets must be in
  // scope but do not need a re-render trigger).
  const isImplicitDefault = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && nonDynamicReadDeps.size > 0;
  const isContainer = isKnownContainer || isImplicitDefault;

  if (isContainer) {
    // Both regular containers (vars/loaders/etc.) and explicit-uses containers
    // create a StateContainer at runtime. Either way, child component APIs
    // register HERE via registerComponentApi — UIDs do not escape further.
    // Only this node's own UID (if any) is visible to the parent container.
    // Only set computedUses when there are actual free vars to scope.
    // Setting computedUses=[] (empty) is NOT equivalent to not setting it:
    // extractScopedState(state, []) returns {} (empty), which breaks implicit
    // containers that must receive full parent state to function correctly.
    // Example: <Fragment var.testState="{null}"> wrapping <Select id="x"> —
    // with computedUses=[] the Fragment isolates all parent state, making
    // {x.value} invisible to siblings even after updateState() dispatches.
    // Narrowing safety rules:
    // 1. A node with its OWN <script>/code-behind must NOT be narrowed — its function bodies
    //    may read parent state vars that are invisible to template-expression analysis.
    // 2. A child node that INHERITS nextDisableNarrowing=true from an ancestor is safe to
    //    narrow if it has no own script and does NOT call any parent-scope function.
    //    In that case function bodies are irrelevant — none are called by this container.
    const dependsOnParentFunction = parentFunctionNames.size > 0 &&
      [...parentDependencies].some(d => parentFunctionNames.has(d));
    const safeToNarrow = !nextDisableNarrowing || (!ownHasScript && !dependsOnParentFunction);
    // Guard narrowing on nonDynamicParentDeps (not parentDependencies) so that a container
    // whose ONLY parent-state dependencies are dynamic vars ($context etc.) does NOT get
    // computedUses set. Dynamic vars like $context live in the nearest ancestor container's
    // state (e.g. Theme#root), and component APIs (like ContextMenu's "projectMenu") also
    // land there. Setting computedUses=["$context"] on a container that has NO real parent
    // deps would make stateFromOutside={} initially (before openAt sets $context), cutting
    // the container off from sibling APIs registered in the ancestor. When both real deps
    // AND dynamic deps exist the dynamic vars are still included so the container re-renders
    // when $context changes (reactive correctness).
    // Narrow only when there are real READ deps. Write-only targets still
    // appear in `parentDependencies` (and therefore in the value we set for
    // `computedUses` below), but they cannot by themselves require narrowing —
    // re-renders are triggered by reads, not writes.
    if (node.uses === undefined && nonDynamicReadDeps.size > 0 && safeToNarrow) {
      // If any needed dep is a parent-provided function, include ALL parent
      // functions in computedUses so that functions called transitively within
      // those functions are also in scope. Functions are non-reactive, so
      // including extras never triggers unnecessary rerenders.
      const computedUsesSet = dependsOnParentFunction
        ? new Set([...parentDependencies, ...parentFunctionNames])
        : parentDependencies;
      node.computedUses = Array.from(computedUsesSet);
    }
    // else: node has own script/code-behind, or calls a parent function while narrowing
    // is disabled — intentionally not narrowed.
    const myEscapingUID: Set<string> = node.uid ? new Set([node.uid]) : new Set();
    // Do NOT propagate dynamic vars ($context etc.) to the parent container's deps.
    // They belong in THIS container's own computedUses (so it re-renders when they
    // change) but must not cascade further — the parent provides them through its
    // own state dispatch chain, and leaking them into the parent's parentDeps would
    // cause stateFromOutside={} for the parent.
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
export function computeUsesForSubtree(node: ComponentDef): Set<string> {
  if (!COMPUTED_USES_ENABLED) return new Set();
  const [freeVars] = computeUsesInternal(node);
  return freeVars;
}

export function computeUsesForTree(root: ComponentDef): void {
  if (!COMPUTED_USES_ENABLED) return;
  // StandaloneApp may call this with a CompoundComponentDef wrapper whose actual
  // ComponentDef (with type/children) lives one or two levels deeper.
  // Drill down until we find a node that has type or children.
  let actualRoot: ComponentDef = root;
  for (let i = 0; i < 3; i++) {
    const next = (actualRoot as any).component;
    if (!next) break;
    if ((next as any).type || Array.isArray((next as any).children)) {
      actualRoot = next;
      break;
    }
    actualRoot = next;
  }
  computeUsesInternal(actualRoot);
}
