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
import type { Statement } from "../script-runner/ScriptingSourceTree";

// Cache for parsed raw strings (like event handlers) to avoid redundant AST
// generation during boot-time traversal.
const astCache = new Map<string, Statement[]>();

function parse(source: string): Statement[] {
  if (astCache.has(source)) {
    return astCache.get(source)!;
  }
  const parser = new Parser(source);
  const statements = parser.parseStatements();
  astCache.set(source, statements);
  return statements;
}
import type { CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
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

// TODO: Framework globals (Actions, toast, Auth, App, etc.) are currently NOT filtered out.
// If a component like <Select onChange="Actions.callApi()" /> reads them, it gets falsely
// identified as having an external read dependency (`nonDynamicReadDeps.size > 0`).
// This causes unnecessary promotion to an implicit StateContainer, which adds React tree overhead
// and isolates internal component state (breaking features like Select's clearable interaction).
// Fix: Export `XMLUI_GLOBAL_NAMES` from the AppContext module and add it to the exclusion check
// below (where `keepDep` is defined).

/**
 * Walk a plain-object AST tree collecting Identifier node names.
 *
 * It avoids collecting property names of member access expressions
 * (e.g. in `foo.bar`, `foo` is collected but `bar` is not).
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
  }
  if (obj.type === "MemberAccessExpression") {
    // Only collect the object, not the member
    gatherIdentifiers(obj.obj, acc);
    return acc;
  }
  for (const val of Object.values(obj)) gatherIdentifiers(val, acc);
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
          // String-discriminator ASTs (e.g. "Identifier", "ExpressionStatement")
          // are not handled by the structured visitor. Fall back to a flat name
          // gather; this loses scope tracking but is conservative — it never
          // misses a reference, at worst it includes locals that runtime
          // narrowing will simply not find in the parent state.
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
      // String props in XMLUI carry templated expressions through `{...}`
      // interpolation. `parseParameterString` splits the string on top-level
      // `{...}` segments and yields each interpolated expression separately.
      // Plain text segments are ignored — so label="Run", classnames, testIds,
      // etc. yield NO deps (they have no `{...}` segments). Event handlers and
      // other rich values arrive here as pre-parsed CodeDeclaration / object
      // trees and are handled by the branches above; strings that fall through
      // are template strings only.
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        for (const id of collectVariableDependencies(part.value) ?? []) {
          acc.add(rootIdentifier(id));
        }
      }
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
const EMPTY_SET: ReadonlySet<string> = Object.freeze(new Set<string>());

function computeUsesInternal(
  node: ComponentDef,
  parentFunctionNames: Set<string> = new Set(),
  disableNarrowing: boolean = false,
  injectedVarsScope: ReadonlySet<string> = EMPTY_SET,
  metadataLookup?: (type: string) => ComponentMetadata | undefined,
): [Set<string>, Set<string>, Set<string>] {
  const isKnownContainer = isContainerLike(node, { strict: true, ignoreComputedUses: true });

  // An "explicit owner" container OWNS its child component APIs at runtime
  // (registerComponentApi writes into ITS componentState). The runtime predicate is
  // `isImplicitContainer(node, wrapped) = node.type !== "Container" && wrapped.uses === undefined`.
  // Implicit containers (vars/loaders/functions/etc. but no explicit `uses`) delegate
  // registerComponentApi to the parent — so child component APIs actually end up in
  // the PARENT container's state, not this one's. Two consequences for static analysis:
  //   1. Escaping UIDs must continue bubbling upward through implicit containers
  //      (until they reach an explicit owner that truly captures them).
  //   2. When this implicit container's `computedUses` IS set (because of other parent
  //      deps), the escaping UIDs must be included — otherwise narrowed parent state
  //      excludes the very APIs that descendants need to read.
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
    const { all, reads } = depsOfValue(v);
    for (const d of all) usedHere.add(d);
    for (const d of reads) usedHereReads.add(d);
  };

  addRecord(node.props as Record<string, unknown> | undefined);
  addRecord(node.vars);

  const events = node.events as Record<string, unknown> | undefined;
  const metadata = metadataLookup?.(node.type);

  const addEvent = (raw: unknown, eventScope: ReadonlySet<string>) => {
    if (typeof raw === "string" && !raw.includes("{")) {
      try {
        const statements = parse(raw);
        const { all, reads } = depsOfValue({ statements });
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
    const { all, reads } = depsOfValue(raw);
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

  const childInjected = [
    ...(metadata?.childInjectedVars ?? []),
    ...(metadata?.unstableChildInjectedVars ?? []),
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
    !localDeclared.has(d) && !isBuiltinGlobal(d) && !injectedVarsScope.has(d);
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
    //
    // Narrow only when there are real READ deps. Write-only targets still
    // appear in `parentDependencies` (and therefore in the value we set for
    // `computedUses` below), but they cannot by themselves require narrowing —
    // re-renders are triggered by reads, not writes.
    if (node.uses === undefined && nonDynamicReadDeps.size > 0 && safeToNarrow) {
      const computedUsesSet = dependsOnParentFunction
        ? new Set([...parentDependencies, ...parentFunctionNames])
        : new Set([...parentDependencies]);
      // For IMPLICIT containers (type !== "Container" and no `uses` defined),
      // registerComponentApi is delegated to the parent at runtime: child component
      // identifiers escaping from descendants actually live in the PARENT's state,
      // not in this container's. They were added to `localDeclared` above only so
      // they wouldn't pollute the dependency set when no narrowing happens — but
      // once narrowing IS triggered by other deps, omitting them isolates this
      // container from sibling APIs (e.g. <Fragment var.testState> wrapping an
      // APICall + Buttons reading `apiCall.inProgress`: computedUses=["toast"]
      // would strip apiCall from stateFromOutside). Add them back so children
      // can still see those APIs through the narrowed parent state.
      if (!isExplicitOwner) {
        for (const uid of childEscapingUIDs) computedUsesSet.add(uid);
      }
      // Bug 23 fix: filter out Symbols before sorting to avoid TypeError
      node.computedUses = Array.from(computedUsesSet)
        .filter((d): d is string => typeof d === "string")
        .sort();
    }

    // else: node has own script/code-behind, or calls a parent function while narrowing
    // is disabled — intentionally not narrowed.
    // Explicit-owner containers (type=Container or `uses` defined) actually capture
    // child component APIs at runtime: only THIS node's own UID escapes upward.
    // Implicit containers (vars/loaders/etc. but no explicit uses) delegate
    // registerComponentApi to the parent, so child escaping UIDs continue bubbling
    // upward until they reach an explicit owner. Without this propagation, an
    // ancestor implicit container that ALSO narrows would lose visibility of
    // these UIDs (see the matching `childEscapingUIDs` add when setting computedUses).
    const myEscapingUID: Set<string> = new Set();
    if (node.uid) myEscapingUID.add(node.uid);
    if (!isExplicitOwner) {
      for (const uid of childEscapingUIDs) myEscapingUID.add(uid);
    }
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
export function computeUsesForSubtree(node: ComponentDef, metadataLookup?: (type: string) => ComponentMetadata | undefined): Set<string> {
  if (!COMPUTED_USES_ENABLED) return new Set();
  const [freeVars] = computeUsesInternal(node, new Set(), false, EMPTY_SET, metadataLookup);
  return freeVars;
}

export function computeUsesForTree(root: ComponentDef, metadataLookup?: (type: string) => ComponentMetadata | undefined): void {
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
  computeUsesInternal(actualRoot, new Set(), false, EMPTY_SET, metadataLookup);
}
