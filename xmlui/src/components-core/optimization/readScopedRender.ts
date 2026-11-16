/**
 * Read-scoped rendering (#3941, step 2): a container re-renders its subtree only
 * when something its bindings read has changed.
 *
 * `StateContainer` asks `holdsState` on each render. When it says yes, the
 * container hands `Container` the state object it handed it last time. That is
 * the only prop an unread write changes, so `Container`'s memo bails out and
 * React skips the subtree. Every write still lands in state; event handlers see
 * the latest state through a ref (`latestStateRef` on `Container`).
 *
 * The decision is step 1's `necessary` verdict, computed without the tracer:
 *
 * - a **read path** (optimization/bindingReads.ts) whose value differs by
 *   `Object.is` from the state last handed over means the subtree must render;
 * - so does a change to a component's **own state**: a symbol-keyed entry of the
 *   container's raw (reducer) state that isn't a loader's. Components such as
 *   `Select` and `Slider` display it without a binding;
 * - every other input (`node`, children, layout context, `globalVars`) is still
 *   compared by `Container`'s memo, so a change there renders the subtree as
 *   before. `version` is held along with the state (see `holdsState`).
 *
 * Enabled by `xmluiConfig.readScopedRendering`, off by default.
 */
import { get } from "lodash-es";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { BindingReadPaths } from "./bindingReads";

/** Whether any read path's value differs between the two states */
export function readSliceChanged(
  readPaths: BindingReadPaths,
  prev: Record<string | symbol, any>,
  next: Record<string | symbol, any>,
): boolean {
  if (readPaths === "all") return true;
  if (prev === next) return false;
  for (const path of readPaths) {
    if (!Object.is(get(prev, path), get(next, path))) return true;
  }
  return false;
}

/**
 * Whether any component's own state changed: a data field of a symbol-keyed
 * entry other than a loader's. Compared field by field, because a component's
 * entry is often rebuilt with the same contents. Function-valued fields are
 * the component's API (`open`, `scrollToTop`, `setValue`…): handlers look them
 * up in live state when they run, and a binding that calls one reads its path,
 * which `readSliceChanged` checks.
 */
export function ownStateChanged(
  prev: Record<string | symbol, any>,
  next: Record<string | symbol, any>,
  loaderNames: ReadonlySet<string>,
  isApiOnlyField: ApiOnlyFieldFn = NO_API_FIELDS,
): boolean {
  if (prev === next) return false;
  const keys = new Set<symbol>([
    ...Object.getOwnPropertySymbols(prev ?? {}),
    ...Object.getOwnPropertySymbols(next ?? {}),
  ]);
  for (const key of keys) {
    if (key.description && loaderNames.has(key.description)) continue;
    if (dataFieldsChanged(key, prev?.[key], next?.[key], isApiOnlyField)) return true;
  }
  return false;
}

/**
 * Whether a field of a uid's entry is not the component's own state: the uid is
 * a loader (it received a loader action, as the step 1 trace classifies it:
 * DataSource, APICall), or the field is registered API only, not reducer state
 * (a component can register a plain value as API, e.g. `hasOverflow`), and the
 * uid is one the definition names (see `definitionUidsOf`).
 */
export type ApiOnlyFieldFn = (uid: symbol, field: string) => boolean;
const NO_API_FIELDS: ApiOnlyFieldFn = () => false;

function dataFieldsChanged(
  uid: symbol,
  a: unknown,
  b: unknown,
  isApiOnlyField: ApiOnlyFieldFn,
): boolean {
  if (Object.is(a, b)) return false;
  // --- An entry appearing or going away matters only through its data fields
  if (a === undefined && isRecord(b)) a = {};
  if (b === undefined && isRecord(a)) b = {};
  if (!isRecord(a) || !isRecord(b)) return true;
  for (const field of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[field];
    const y = b[field];
    if (Object.is(x, y)) continue;
    if (typeof x === "function" || typeof y === "function") continue;
    if (isApiOnlyField(uid, field)) continue;
    return true;
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const loaderCache = new WeakMap<object, ReadonlySet<string>>();

/** The uids of the loaders (DataSource, APICall wrappers…) anywhere in a definition */
export function loaderNamesOf(root: ComponentDef): ReadonlySet<string> {
  let names = loaderCache.get(root);
  if (names) return names;
  const found = new Set<string>();
  const seen = new Set<object>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object" || seen.has(value as object)) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const def = value as any;
    if (typeof def.type !== "string") return;
    seen.add(def);
    (def.loaders as ComponentDef[] | undefined)?.forEach((loader) => {
      if (loader?.uid) found.add(loader.uid);
      visit(loader);
    });
    (def.children as ComponentDef[] | undefined)?.forEach(visit);
    if (def.props) Object.values(def.props).forEach(visit);
  };
  visit(root);
  names = found;
  loaderCache.set(root, names);
  return names;
}

const uidCache = new WeakMap<object, ReadonlySet<string>>();

/**
 * The uids a definition names anywhere (children, loaders, markup passed as
 * props). A binding that reads such a component's API (`uid.field`) is in the
 * definition too, so the read set sees it. A uid missing from here was made at
 * render time (StepperForm names its segments `segment0`, `segment1`… and binds
 * its buttons to `segment0.isValid`), and so may be what reads it: such a
 * component's API values count as its own state.
 */
export function definitionUidsOf(root: ComponentDef): ReadonlySet<string> {
  let uids = uidCache.get(root);
  if (uids) return uids;
  const found = new Set<string>();
  const seen = new Set<object>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object" || seen.has(value as object)) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const def = value as any;
    if (typeof def.type !== "string") return;
    seen.add(def);
    if (typeof def.uid === "string") found.add(def.uid);
    (def.loaders as ComponentDef[] | undefined)?.forEach(visit);
    (def.children as ComponentDef[] | undefined)?.forEach(visit);
    if (def.props) Object.values(def.props).forEach(visit);
  };
  visit(root);
  uids = found;
  uidCache.set(root, uids);
  return uids;
}

/** What `StateContainer` last handed to `Container` */
export interface HeldState {
  state: Record<string | symbol, any>;
  raw: Record<string | symbol, any>;
  version: number;
  /** Write stamps of the read roots when this state was handed over (see `writeStampsOf`) */
  stamps?: ReadonlyMap<string, number>;
}

/**
 * A binding that calls a function reads whatever the function reads. A function
 * defined in an ancestor (`getFavoritesCount(post)` in the App's code-behind,
 * called from a row) has a stable identity, so the read set must name the
 * variables behind it: `functionDeps` (from `FnDepsProvider`) maps each
 * function to the variables it reads, transitively.
 */
export function expandFunctionReads(
  readPaths: BindingReadPaths,
  functionDeps: Record<string, readonly string[]>,
): BindingReadPaths {
  if (readPaths === "all") return readPaths;
  let expanded: Set<string> | null = null;
  for (const path of readPaths) {
    const deps = functionDeps[rootOf(path)];
    if (!deps?.length) continue;
    expanded ??= new Set(readPaths);
    for (const dep of deps) expanded.add(dep);
  }
  return expanded ?? readPaths;
}

/** The variable a read path starts at: `fruits` for `fruits[0].size` */
export function rootOf(path: string): string {
  const m = /^[^.[]+/.exec(path);
  return m ? m[0] : path;
}

const rootsCache = new WeakMap<object, readonly string[]>();

/** The distinct roots of a container's read paths */
export function readRootsOf(readPaths: BindingReadPaths): readonly string[] {
  if (readPaths === "all") return [];
  let roots = rootsCache.get(readPaths);
  if (!roots) {
    roots = Array.from(new Set(Array.from(readPaths, rootOf)));
    rootsCache.set(readPaths, roots);
  }
  return roots;
}

/**
 * The write stamp of each read root. A handler can write a variable in place
 * (`fruits[0].size = 'small'`), so the value keeps its identity and `Object.is`
 * can't see the write. Every handler write goes through `statePartChanged`,
 * which counts writes per variable: a changed count means changed.
 */
export function writeStampsOf(
  roots: readonly string[],
  stampOf: (key: string) => number,
): ReadonlyMap<string, number> {
  const stamps = new Map<string, number>();
  for (const root of roots) stamps.set(root, stampOf(root));
  return stamps;
}

function stampsChanged(
  prev: ReadonlyMap<string, number> | undefined,
  next: ReadonlyMap<string, number> | undefined,
): boolean {
  if (!prev || !next) return false;
  for (const [root, stamp] of next) {
    if (prev.get(root) !== stamp) return true;
  }
  return false;
}

/**
 * Whether the container can hand over the state (and version) it handed over
 * last time: no read path changed, no component's own state changed. A version
 * bump alone doesn't count: a handler bumps it after each statement that writes
 * state and waits for it to render, and StateContainer resolves that wait itself
 * (`statementCommitRef` on Container).
 */
export function holdsState(
  held: HeldState | null,
  next: HeldState,
  readPaths: BindingReadPaths,
  loaderNames: ReadonlySet<string>,
  isApiOnlyField?: ApiOnlyFieldFn,
): boolean {
  if (!held || readPaths === "all") return false;
  if (readSliceChanged(readPaths, held.state, next.state)) return false;
  if (stampsChanged(held.stamps, next.stamps)) return false;
  if (ownStateChanged(held.raw, next.raw, loaderNames, isApiOnlyField)) return false;
  return true;
}
