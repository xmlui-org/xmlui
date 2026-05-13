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
import { isParsedValue } from "../state/variable-resolution";
import type { CodeDeclaration } from "../script-runner/ScriptingSourceTree";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

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
]);

const isBuiltinGlobal = (name: string): boolean => JS_STDLIB_GLOBALS.has(name);

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

function depsOfValue(value: unknown): string[] {
  try {
    if (value === null || value === undefined) return [];
    if (isParsedValue(value)) {
      return (collectVariableDependencies((value as CodeDeclaration).tree) ?? []).map(rootIdentifier);
    }
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      // Raw event handler AST: has a `statements` array.
      // Try the fast path first; fall back to structural walk for string-discriminator ASTs.
      if (obj.statements && Array.isArray(obj.statements)) {
        // Detect string-discriminator ASTs (e.g. from tests or JSON-serialised event handlers).
        // collectVariableDependencies only handles numeric-discriminator ASTs; for string-
        // discriminator ASTs it silently returns [] without throwing, so we must check the
        // format explicitly before deciding which path to take.
        const hasStringDiscriminators =
          obj.statements.length > 0 &&
          typeof (obj.statements[0] as any)?.type === "string";
        if (hasStringDiscriminators) {
          return Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
        }
        try {
          return (collectVariableDependencies(obj.statements) ?? []).map(rootIdentifier);
        } catch {
          return Array.from(gatherIdentifiers(obj.statements)).map(rootIdentifier);
        }
      }
      return [];
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
      return Array.from(acc);
    }
    return [];
  } catch {
    return [];
  }
}

function depsOfRecord(record: Record<string, unknown> | undefined): Set<string> {
  const result = new Set<string>();
  if (!record) return result;
  for (const value of Object.values(record)) {
    for (const dep of depsOfValue(value)) {
      result.add(dep);
    }
  }
  return result;
}

/**
 * Core recursive worker.
 *
 * Returns a tuple:
 *   [0] freeVars    – identifiers referenced in this subtree that must come
 *                     from the *parent* container's scope.
 *   [1] escapingUIDs – UIDs that will call `registerComponentApi` into the
 *                     *parent* container at runtime (i.e. they are not
 *                     captured by any intermediate container inside this
 *                     subtree). The caller adds these to its own
 *                     `localDeclared` so they don't pollute `computedUses`.
 */
function computeUsesInternal(node: ComponentDef): [Set<string>, Set<string>] {
  const localDeclared = new Set<string>();
  if (node.vars) for (const k of Object.keys(node.vars)) localDeclared.add(k);
  if (node.functions) for (const k of Object.keys(node.functions)) localDeclared.add(k);
  if (node.scriptCollected) {
    const sc = node.scriptCollected;
    for (const k of Object.keys(sc)) localDeclared.add(k);
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

  const usedHere = new Set<string>();

  for (const d of depsOfRecord(node.props as Record<string, unknown> | undefined)) usedHere.add(d);
  for (const d of depsOfRecord(node.vars)) usedHere.add(d);
  for (const d of depsOfRecord(node.events as Record<string, unknown> | undefined)) usedHere.add(d);
  for (const d of depsOfRecord(node.api as Record<string, unknown> | undefined)) usedHere.add(d);

  if (node.when !== undefined && node.when !== null && typeof node.when !== "boolean") {
    for (const d of depsOfValue(node.when)) usedHere.add(d);
  }
  if (node.responsiveWhen) {
    for (const v of Object.values(node.responsiveWhen)) {
      if (v !== undefined && v !== null && typeof v !== "boolean") {
        for (const d of depsOfValue(v)) usedHere.add(d);
      }
    }
  }

  const childDeps = new Set<string>();
  // UIDs from the subtree that will register into THIS node's StateContainer
  // at runtime (because they pass through non-container intermediaries).
  const childEscapingUIDs = new Set<string>();

  const processChildList = (children: ComponentDef[]) => {
    for (const child of children) {
      const [deps, escapingUIDs] = computeUsesInternal(child);
      for (const d of deps) childDeps.add(d);
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

  const totalFree = new Set<string>();
  for (const d of usedHere) if (!localDeclared.has(d) && !isBuiltinGlobal(d)) totalFree.add(d);
  for (const d of childDeps) if (!localDeclared.has(d) && !isBuiltinGlobal(d)) totalFree.add(d);

  const isRegularContainer = !!(
    node.vars ||
    (node.loaders && node.loaders.length > 0) ||
    node.functions ||
    node.uses !== undefined ||
    node.contextVars ||
    node.scriptCollected
  );
  const isImplicitDefault = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && totalFree.size > 0;
  const isContainer = isRegularContainer || isImplicitDefault;

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
    if (node.uses === undefined && totalFree.size > 0) {
      node.computedUses = Array.from(totalFree);
    }
    const myEscapingUID: Set<string> = node.uid ? new Set([node.uid]) : new Set();
    return [totalFree, myEscapingUID];
  }

  // Non-container: this node's own UID + all child escaping UIDs propagate
  // upward to the next ancestor container.
  const escapingUIDs = new Set<string>();
  if (node.uid) escapingUIDs.add(node.uid);
  for (const uid of childEscapingUIDs) escapingUIDs.add(uid);

  return [totalFree, escapingUIDs];
}

/**
 * Public API — same contract as before (returns free vars set).
 * Prefer `computeUsesForTree` for whole-tree traversal.
 */
export function computeUsesForSubtree(node: ComponentDef): Set<string> {
  const [freeVars] = computeUsesInternal(node);
  return freeVars;
}

export function computeUsesForTree(root: ComponentDef): void {
  computeUsesInternal(root);
}
