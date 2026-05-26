/**
 * API surface extraction (plan #12 Phase 3 Step 3.1).
 *
 * `extractApiSurface()` walks a component-metadata registry and emits a
 * deterministic, JSON-serialisable snapshot of the framework's public
 * API surface. The snapshot is the input to the diff + changeset-bump
 * suggester (`diff.ts`, `suggest-changeset.ts`).
 *
 * The shape is intentionally narrow — only the fields that affect
 * backwards compatibility are captured. Description / signature text
 * does not influence bump classification and is omitted to keep
 * snapshots stable across whitespace edits.
 */

import type { ComponentMetadata } from "../../src/abstractions/ComponentDefs";

export interface ApiSurfaceProp {
  valueType?: string;
  isRequired?: boolean;
  defaultValue?: unknown;
  status?: string;
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
  availableValues?: readonly unknown[];
}

export interface ApiSurfaceEvent {
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
}

export interface ApiSurfaceMethod {
  signature?: string;
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
}

export interface ApiSurfaceComponent {
  status?: string;
  deprecationMessage?: string;
  deprecatedSince?: string;
  removedIn?: string;
  replacement?: string;
  props: Record<string, ApiSurfaceProp>;
  events: Record<string, ApiSurfaceEvent>;
  methods: Record<string, ApiSurfaceMethod>;
}

export interface ApiSurface {
  version: string;
  components: Record<string, ApiSurfaceComponent>;
}

export function extractApiSurface(
  registry: ReadonlyMap<string, ComponentMetadata> | Record<string, ComponentMetadata>,
  version: string,
): ApiSurface {
  const entries: Array<[string, ComponentMetadata]> =
    registry instanceof Map
      ? Array.from(registry.entries())
      : Object.entries(registry);
  // Sort component names so the snapshot is deterministic.
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const components: Record<string, ApiSurfaceComponent> = {};
  for (const [name, meta] of entries) {
    components[name] = extractComponent(meta);
  }
  return { version, components };
}

function extractComponent(meta: ComponentMetadata): ApiSurfaceComponent {
  const out: ApiSurfaceComponent = {
    status: meta.status,
    deprecationMessage: meta.deprecationMessage,
    deprecatedSince: (meta as any).deprecatedSince,
    removedIn: (meta as any).removedIn,
    replacement: (meta as any).replacement,
    props: {},
    events: {},
    methods: {},
  };
  const props = (meta.props ?? {}) as Record<string, any>;
  for (const name of Object.keys(props).sort()) {
    const p = props[name];
    out.props[name] = {
      valueType: p.valueType,
      isRequired: p.isRequired,
      defaultValue: p.defaultValue,
      status: p.status,
      deprecationMessage: p.deprecationMessage,
      deprecatedSince: p.deprecatedSince,
      removedIn: p.removedIn,
      replacement: p.replacement,
      availableValues: p.availableValues
        ? p.availableValues.map((v: any) => (typeof v === "object" && v ? v.value ?? v : v))
        : undefined,
    };
  }
  const events = (meta.events ?? {}) as Record<string, any>;
  for (const name of Object.keys(events).sort()) {
    const e = events[name];
    out.events[name] = {
      deprecationMessage: e.deprecationMessage,
      deprecatedSince: e.deprecatedSince,
      removedIn: e.removedIn,
      replacement: e.replacement,
    };
  }
  const methods = (meta.apis ?? {}) as Record<string, any>;
  for (const name of Object.keys(methods).sort()) {
    const m = methods[name];
    out.methods[name] = {
      signature: m.signature,
      deprecationMessage: m.deprecationMessage,
      deprecatedSince: m.deprecatedSince,
      removedIn: m.removedIn,
      replacement: m.replacement,
    };
  }
  return out;
}

export function serializeApiSurface(surface: ApiSurface): string {
  return JSON.stringify(surface, replacer, 2) + "\n";
}

function replacer(_key: string, value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value;
}
