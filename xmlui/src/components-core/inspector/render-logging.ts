/**
 * Render-pass logging for the XMLUI inspector (#3942).
 *
 * Emits one `render:pass` trace entry per render of `App`, each user-defined
 * component (UDC) and each explicit container, giving the cause of the pass
 * and its duration. Implicit containers (an element with a `var.`) are folded
 * into the pass of the nearest emitting ancestor rendering at the same time;
 * one that renders on its own emits its own entry, marked `implicit: true`.
 *
 * The cause is derived by comparing a container's inputs with those of its
 * previous pass. `StateContainer` is memoized, so it re-renders only when one
 * of its props changed, its own state (reducer state or component APIs)
 * changed, or a context it reads changed. The trace id is captured when the
 * change is dispatched, because the handler's trace may have ended by the time
 * React renders.
 *
 * `durationMs` is inclusive: from the start of the container's render to its
 * `useLayoutEffect`, which runs after those of all its descendants. Durations
 * of nested passes overlap and are not additive; use `parentPassId` to sum
 * top-level passes only. The figure is an upper bound: anything React does
 * between render and commit is counted too.
 *
 * Everything here is inert unless `xsVerbose` is on.
 */

import { createContext } from "react";
import { ContainerActionKind } from "../rendering/containers";
import { getCurrentTrace, pushXsLog } from "./inspectorUtils";

// ============================================================================
// TYPES
// ============================================================================

export const RENDER_PASS_KIND = "render:pass";

/** One reason for a render pass. A pass may have several. */
export type RenderPassCause =
  | { kind: "mount" }
  /** Own `var` keys changed */
  | { kind: "state"; keys: string[] }
  /** A component's own state changed (e.g. a MediaPlayer's currentTime) */
  | { kind: "componentState"; uid: string; fields?: string[] }
  /** A DataSource / APICall state changed */
  | { kind: "loader"; uid: string; fields?: string[] }
  /** UDC props changed */
  | { kind: "props"; names: string[]; sameSourceNewIdentity?: string[] }
  /** Pass-through from the parent: which inputs from the parent changed */
  | { kind: "parent"; passId?: number; inputs: string[]; keys?: string[] }
  /** Nothing captured explains the pass (e.g. a React context changed) */
  | { kind: "unknown"; detail?: string };

/** A container folded into its ancestor's pass */
export interface FoldedContainer {
  component: string;
  uid?: string;
  cause: RenderPassCause[];
}

/** Folded containers grouped by component and cause, as emitted */
export interface FoldedGroup {
  component: string;
  cause: RenderPassCause[];
  count: number;
  /** Up to FOLDED_UID_SAMPLE uids of the group's containers */
  uids?: string[];
}

export const FOLDED_UID_SAMPLE = 5;

/** Group folded containers by component and cause, keeping a sample of uids */
export function groupFolded(entries: FoldedContainer[]): FoldedGroup[] {
  const groups = new Map<string, FoldedGroup>();
  entries.forEach((entry) => {
    const signature = entry.component + "|" + JSON.stringify(entry.cause);
    let group = groups.get(signature);
    if (!group) {
      group = { component: entry.component, cause: entry.cause, count: 0 };
      groups.set(signature, group);
    }
    group.count += 1;
    if (entry.uid) {
      group.uids ??= [];
      if (group.uids.length < FOLDED_UID_SAMPLE) group.uids.push(entry.uid);
    }
  });
  return Array.from(groups.values());
}

/**
 * The handle a container exposes to its descendants. The object is stable for
 * the container's lifetime; its fields change from pass to pass.
 */
export interface RenderPassHandle {
  /** The pass id descendants should report as their parent */
  passId: number;
  /** True between the start of the container's render and its commit */
  open: boolean;
  traceId?: string;
  fold(entry: FoldedContainer): void;
}

export const RenderPassContext = createContext<RenderPassHandle | null>(null);

/** What the container passes in at each render, to be compared with the previous pass */
export interface RenderPassSnapshot {
  /** The container's own props (the inputs its memo compares) */
  props: Record<string, any>;
  /** Reducer state merged with component APIs */
  componentState: Record<string | symbol, any>;
  version: number;
  /** For a UDC: the markup source of each prop at this pass */
  propSources?: Record<string, any>;
}

export interface RenderPassInfo {
  /** UDC name, "App", or the wrapped component's type */
  component: string;
  uid?: string;
  isUdc: boolean;
  isImplicit: boolean;
  source?: any;
}

type UidKind = "loader" | "componentState";

// ============================================================================
// PURE HELPERS (unit-tested)
// ============================================================================

let passCounter = 0;

/** Allocate a pass id unique within this page */
export function nextPassId(): number {
  passCounter += 1;
  return passCounter;
}

/** The keys (string and symbol) whose values differ by identity between two objects */
export function changedKeys(
  prev: Record<string | symbol, any> | undefined,
  next: Record<string | symbol, any> | undefined,
): Array<string | symbol> {
  if (prev === next) return [];
  const a = prev ?? {};
  const b = next ?? {};
  const keys = new Set<string | symbol>([...Reflect.ownKeys(a), ...Reflect.ownKeys(b)]);
  const result: Array<string | symbol> = [];
  keys.forEach((key) => {
    if (!Object.is((a as any)[key], (b as any)[key])) result.push(key);
  });
  return result;
}

export function keyLabel(key: string | symbol): string {
  return typeof key === "symbol" ? key.description || "<anonymous>" : key;
}

/** Container props that come from the parent, mapped to the names reported in a `parent` cause */
const IGNORED_PROPS = new Set(["children"]);

export interface BuildCausesInput {
  prev: RenderPassSnapshot | undefined;
  next: RenderPassSnapshot;
  isUdc: boolean;
  /** Kind of each uid key in componentState, as seen at dispatch time */
  uidKinds: Map<symbol, UidKind>;
  /** Fields changed per uid key since the last pass, as seen at dispatch time */
  uidFields: Map<symbol, Set<string>>;
  /** The parent pass, when it is rendering at the same time */
  parentPassId?: number;
}

/**
 * Derive the causes of a pass from the previous and current snapshots.
 * Returns `[{ kind: "unknown" }]` rather than guessing when nothing differs.
 */
export function buildCauses(input: BuildCausesInput): RenderPassCause[] {
  const { prev, next, isUdc, uidKinds, uidFields, parentPassId } = input;
  if (!prev) return [{ kind: "mount" }];

  const causes: RenderPassCause[] = [];

  // --- Own state: vars are keyed by name, loaders and components by uid symbol
  const stateKeys: string[] = [];
  changedKeys(prev.componentState, next.componentState).forEach((key) => {
    if (typeof key === "string") {
      stateKeys.push(key);
      return;
    }
    const fields = uidFields.get(key);
    const entry = {
      uid: keyLabel(key),
      ...(fields && fields.size > 0 && { fields: Array.from(fields) }),
    };
    causes.push(
      uidKinds.get(key) === "loader"
        ? { kind: "loader", ...entry }
        : { kind: "componentState", ...entry },
    );
  });
  if (stateKeys.length > 0) causes.unshift({ kind: "state", keys: stateKeys });

  // --- Inputs from the parent
  const changedProps = changedKeys(prev.props, next.props)
    .map(keyLabel)
    .filter((name) => !IGNORED_PROPS.has(name));
  const parentInputs: string[] = [];
  let parentKeys: string[] | undefined;
  changedProps.forEach((name) => {
    if (name === "node" && isUdc) {
      const propsCause = buildPropsCause(prev, next);
      if (propsCause) {
        causes.push(propsCause);
        return;
      }
    }
    if (name === "parentState") {
      parentKeys = changedKeys(prev.props.parentState, next.props.parentState).map(keyLabel);
    }
    parentInputs.push(name);
  });
  if (parentInputs.length > 0) {
    causes.push({
      kind: "parent",
      ...(parentPassId !== undefined && { passId: parentPassId }),
      inputs: parentInputs,
      ...(parentKeys && parentKeys.length > 0 && { keys: parentKeys }),
    });
  }

  if (causes.length === 0) {
    if (prev.version !== next.version) return [{ kind: "unknown", detail: "version" }];
    // --- No input differs, yet React rendered: a context the container reads
    // --- changed, or the parent re-rendered it with identical props.
    return [
      parentPassId !== undefined
        ? { kind: "parent", passId: parentPassId, inputs: [] }
        : { kind: "unknown" },
    ];
  }
  return causes;
}

/**
 * For a UDC, the props arrive in `node.vars.$props`. Name the props that
 * changed, and flag function props whose markup source is unchanged (a new
 * function identity for the same handler text).
 */
function buildPropsCause(
  prev: RenderPassSnapshot,
  next: RenderPassSnapshot,
): RenderPassCause | undefined {
  const prevProps = prev.props.node?.vars?.$props;
  const nextProps = next.props.node?.vars?.$props;
  if (prevProps === nextProps) return undefined;
  const names = changedKeys(prevProps, nextProps).map(keyLabel);
  if (names.length === 0) return undefined;
  const prevSources = prev.propSources ?? {};
  const nextSources = next.propSources ?? {};
  const sameSource = names.filter(
    (name) =>
      typeof prevProps?.[name] === "function" &&
      typeof nextProps?.[name] === "function" &&
      name in nextSources &&
      sameMarkupSource(prevSources[name], nextSources[name]),
  );
  return {
    kind: "props",
    names,
    ...(sameSource.length > 0 && { sameSourceNewIdentity: sameSource }),
  };
}

function sameMarkupSource(a: any, b: any): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// ============================================================================
// PER-CONTAINER TRACKER
// ============================================================================

/**
 * Tracks the passes of one container. Created only when `xsVerbose` is on.
 * Call order per pass: `beginRender` → `observe` → (children render) → `commit`.
 */
export class RenderPassTracker {
  readonly handle: RenderPassHandle;

  private prev: RenderPassSnapshot | undefined;
  private startMs = 0;
  private passId = 0;
  private parent: RenderPassHandle | null = null;
  private parentPassId: number | undefined;
  private folded = false;
  private causes: RenderPassCause[] = [];
  private foldedChildren: FoldedContainer[] = [];
  private pendingTraceId: string | undefined;
  private readonly uidKinds = new Map<symbol, UidKind>();
  private uidFields = new Map<symbol, Set<string>>();

  constructor(private info: RenderPassInfo) {
    const tracker = this;
    this.handle = {
      passId: 0,
      open: false,
      traceId: undefined,
      fold(entry: FoldedContainer) {
        // --- A folded implicit container forwards to the pass it is part of
        if (tracker.folded && tracker.parent?.open) {
          tracker.parent.fold(entry);
        } else {
          tracker.foldedChildren.push(entry);
        }
      },
    };
  }

  setInfo(info: RenderPassInfo) {
    this.info = info;
  }

  /** Call first thing in the container's render */
  beginRender(parent: RenderPassHandle | null) {
    this.startMs = performance.now();
    this.parent = parent;
    this.parentPassId = parent?.open ? parent.passId : undefined;
    this.folded = this.info.isImplicit && this.parentPassId !== undefined;
    this.passId = this.folded ? this.parentPassId! : nextPassId();
    this.foldedChildren = [];
    this.handle.passId = this.passId;
    this.handle.open = true;
    this.handle.traceId = this.pendingTraceId ?? (parent?.open ? parent.traceId : undefined);
  }

  /** Record a reducer action at dispatch time */
  noteDispatch(action: any) {
    const traceId = getCurrentTrace();
    if (traceId) this.pendingTraceId = traceId;
    const uid = action?.payload?.uid;
    if (typeof uid !== "symbol") return;
    let field: string | undefined;
    switch (action.type) {
      case ContainerActionKind.LOADER_LOADED:
      case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED:
      case ContainerActionKind.LOADER_IS_REFETCHING_CHANGED:
      case ContainerActionKind.LOADER_ERROR:
      case ContainerActionKind.LOADER_CANCELLED:
        this.uidKinds.set(uid, "loader");
        field = LOADER_FIELDS[action.type];
        break;
      case ContainerActionKind.COMPONENT_STATE_CHANGED:
        if (!this.uidKinds.has(uid)) this.uidKinds.set(uid, "componentState");
        Object.keys(action.payload?.state ?? {}).forEach((key) => this.addField(uid, key));
        break;
      case ContainerActionKind.EVENT_HANDLER_STARTED:
      case ContainerActionKind.EVENT_HANDLER_COMPLETED:
      case ContainerActionKind.EVENT_HANDLER_ERROR:
        if (!this.uidKinds.has(uid)) this.uidKinds.set(uid, "componentState");
        field = `${action.payload?.eventName}InProgress`;
        break;
    }
    if (field) this.addField(uid, field);
  }

  /** Record a component API registration at call time */
  noteApi(uid: symbol) {
    const traceId = getCurrentTrace();
    if (traceId) this.pendingTraceId = traceId;
    if (!this.uidKinds.has(uid)) this.uidKinds.set(uid, "componentState");
  }

  /** Record one component API field that actually changed */
  noteField(uid: symbol, field: string) {
    this.addField(uid, field);
  }

  private addField(uid: symbol, field: string) {
    let set = this.uidFields.get(uid);
    if (!set) {
      set = new Set();
      this.uidFields.set(uid, set);
    }
    set.add(field);
  }

  /** Compare with the previous pass; folds into the parent pass when implicit */
  observe(snapshot: RenderPassSnapshot) {
    this.causes = buildCauses({
      prev: this.prev,
      next: snapshot,
      isUdc: this.info.isUdc,
      uidKinds: this.uidKinds,
      uidFields: this.uidFields,
      parentPassId: this.parentPassId,
    });
    this.prev = snapshot;
    if (this.folded) {
      this.parent!.fold({ component: this.info.component, uid: this.info.uid, cause: this.causes });
    }
  }

  /** Call from the container's useLayoutEffect, which runs after its descendants' */
  commit() {
    const endMs = performance.now();
    this.handle.open = false;
    const traceId = this.handle.traceId;
    this.pendingTraceId = undefined;
    this.uidFields = new Map();
    if (this.folded) return;

    const { component, uid, isUdc, isImplicit, source } = this.info;
    pushXsLog({
      ts: Date.now(),
      perfTs: this.startMs,
      kind: RENDER_PASS_KIND,
      ...(traceId && { traceId }),
      passId: this.passId,
      ...(this.parentPassId !== undefined && { parentPassId: this.parentPassId }),
      component,
      ...(uid && { uid }),
      ...(isUdc && { udc: true }),
      ...(isImplicit && { implicit: true }),
      ...(source && { source }),
      startMs: this.startMs,
      durationMs: Math.round((endMs - this.startMs) * 1000) / 1000,
      cause: this.causes,
      ...(this.foldedChildren.length > 0 && {
        implicitContainers: this.foldedChildren.length,
        folded: groupFolded(this.foldedChildren),
      }),
    });
  }
}

const LOADER_FIELDS: Record<string, string> = {
  [ContainerActionKind.LOADER_LOADED]: "value",
  [ContainerActionKind.LOADER_IN_PROGRESS_CHANGED]: "inProgress",
  [ContainerActionKind.LOADER_IS_REFETCHING_CHANGED]: "isRefetching",
  [ContainerActionKind.LOADER_ERROR]: "error",
  [ContainerActionKind.LOADER_CANCELLED]: "cancelled",
};
