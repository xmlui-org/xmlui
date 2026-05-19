/**
 * API surface differ (plan #12 Phase 3 Step 3.2).
 *
 * `diffApiSurfaces()` compares two `ApiSurface` snapshots and produces a
 * flat array of `ApiDelta` entries plus a recommended changeset bump.
 *
 * Bump classification:
 *   - `major` — any removal (component, prop, event, method) that does
 *     not have a matching `removedIn` ≤ the new version; any default
 *     value change without a `defaultValueChangedIn` record; any prop
 *     rename without a `renamedProps` record; required-prop additions.
 *   - `minor` — additions (component, prop, event, method); status
 *     transitions `stable → deprecated`; relaxations of required.
 *   - `patch` — description / signature / deprecation-message edits;
 *     classification metadata edits that do not affect callers.
 *
 * The diff is intentionally conservative: when in doubt it escalates.
 */

import type {
  ApiSurface,
  ApiSurfaceComponent,
  ApiSurfaceEvent,
  ApiSurfaceMethod,
  ApiSurfaceProp,
} from "./extract";
import { compareSemver } from "../../src/components-core/versioning/semver";

export type DeltaKind =
  | "component-added"
  | "component-removed"
  | "component-status-changed"
  | "prop-added"
  | "prop-removed"
  | "prop-required-added"
  | "prop-required-relaxed"
  | "prop-type-changed"
  | "prop-default-changed"
  | "prop-renamed"
  | "prop-enum-removed"
  | "event-added"
  | "event-removed"
  | "method-added"
  | "method-removed";

export type BumpType = "patch" | "minor" | "major";

export interface ApiDelta {
  kind: DeltaKind;
  componentName: string;
  propName?: string;
  eventName?: string;
  methodName?: string;
  detail?: string;
  /** Recommended changeset bump for this delta in isolation. */
  bump: BumpType;
  /** When `true`, the delta is covered by metadata (e.g. `removedIn`) and does not escalate. */
  covered?: boolean;
}

export interface DiffReport {
  deltas: ApiDelta[];
  bump: BumpType;
}

export function diffApiSurfaces(prev: ApiSurface, next: ApiSurface): DiffReport {
  const deltas: ApiDelta[] = [];
  const prevNames = new Set(Object.keys(prev.components));
  const nextNames = new Set(Object.keys(next.components));

  for (const name of nextNames) {
    if (!prevNames.has(name)) {
      deltas.push({
        kind: "component-added",
        componentName: name,
        bump: "minor",
      });
    }
  }
  for (const name of prevNames) {
    if (!nextNames.has(name)) {
      const prevComp = prev.components[name];
      const covered = isRemovalCovered(prevComp.removedIn, next.version);
      deltas.push({
        kind: "component-removed",
        componentName: name,
        bump: covered ? "minor" : "major",
        covered,
      });
    }
  }
  for (const name of nextNames) {
    if (!prevNames.has(name)) continue;
    diffComponent(name, prev.components[name], next.components[name], next.version, deltas);
  }

  const bump = aggregateBump(deltas);
  return { deltas, bump };
}

function diffComponent(
  name: string,
  prev: ApiSurfaceComponent,
  next: ApiSurfaceComponent,
  nextVersion: string,
  out: ApiDelta[],
): void {
  if (prev.status !== next.status) {
    out.push({
      kind: "component-status-changed",
      componentName: name,
      detail: `${prev.status ?? "stable"} → ${next.status ?? "stable"}`,
      bump: next.status === "deprecated" ? "minor" : "patch",
    });
  }

  diffMap(
    name,
    prev.props,
    next.props,
    nextVersion,
    out,
    "prop-added",
    "prop-removed",
    (cn, propName, p1, p2) => diffProp(cn, propName, p1, p2, out),
  );

  diffMap(
    name,
    prev.events,
    next.events,
    nextVersion,
    out,
    "event-added",
    "event-removed",
    () => {},
  );

  diffMap(
    name,
    prev.methods,
    next.methods,
    nextVersion,
    out,
    "method-added",
    "method-removed",
    () => {},
  );
}

function diffMap<T extends { removedIn?: string }>(
  componentName: string,
  prevMap: Record<string, T>,
  nextMap: Record<string, T>,
  nextVersion: string,
  out: ApiDelta[],
  addedKind: DeltaKind,
  removedKind: DeltaKind,
  onCommon: (componentName: string, name: string, prev: T, next: T) => void,
): void {
  const prevKeys = new Set(Object.keys(prevMap));
  const nextKeys = new Set(Object.keys(nextMap));
  for (const k of nextKeys) {
    if (!prevKeys.has(k)) {
      out.push({
        kind: addedKind,
        componentName,
        ...nameField(addedKind, k),
        bump: "minor",
      });
    }
  }
  for (const k of prevKeys) {
    if (!nextKeys.has(k)) {
      const covered = isRemovalCovered(prevMap[k]?.removedIn, nextVersion);
      out.push({
        kind: removedKind,
        componentName,
        ...nameField(removedKind, k),
        bump: covered ? "minor" : "major",
        covered,
      });
    }
  }
  for (const k of nextKeys) {
    if (!prevKeys.has(k)) continue;
    onCommon(componentName, k, prevMap[k], nextMap[k]);
  }
}

function nameField(kind: DeltaKind, name: string): Partial<ApiDelta> {
  if (kind.startsWith("prop")) return { propName: name };
  if (kind.startsWith("event")) return { eventName: name };
  if (kind.startsWith("method")) return { methodName: name };
  return {};
}

function diffProp(
  componentName: string,
  propName: string,
  prev: ApiSurfaceProp,
  next: ApiSurfaceProp,
  out: ApiDelta[],
): void {
  if ((prev.valueType ?? "any") !== (next.valueType ?? "any")) {
    out.push({
      kind: "prop-type-changed",
      componentName,
      propName,
      detail: `${prev.valueType ?? "any"} → ${next.valueType ?? "any"}`,
      bump: "major",
    });
  }
  if (!prev.isRequired && next.isRequired) {
    out.push({
      kind: "prop-required-added",
      componentName,
      propName,
      bump: "major",
    });
  } else if (prev.isRequired && !next.isRequired) {
    out.push({
      kind: "prop-required-relaxed",
      componentName,
      propName,
      bump: "minor",
    });
  }
  if (!sameDefault(prev.defaultValue, next.defaultValue)) {
    out.push({
      kind: "prop-default-changed",
      componentName,
      propName,
      detail: `${JSON.stringify(prev.defaultValue)} → ${JSON.stringify(next.defaultValue)}`,
      bump: "major",
    });
  }
  if (prev.availableValues && next.availableValues) {
    const nextSet = new Set(next.availableValues);
    for (const v of prev.availableValues) {
      if (!nextSet.has(v)) {
        out.push({
          kind: "prop-enum-removed",
          componentName,
          propName,
          detail: `removed value ${JSON.stringify(v)}`,
          bump: "major",
        });
      }
    }
  }
}

function sameDefault(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return a === b;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function isRemovalCovered(removedIn: string | undefined, nextVersion: string): boolean {
  if (!removedIn) return false;
  return compareSemver(nextVersion, removedIn) >= 0;
}

function aggregateBump(deltas: readonly ApiDelta[]): BumpType {
  let result: BumpType = "patch";
  for (const d of deltas) {
    if (d.bump === "major") return "major";
    if (d.bump === "minor") result = result === "patch" ? "minor" : result;
  }
  return result;
}
