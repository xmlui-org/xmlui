/**
 * UDC Sandbox — declared contract types.
 *
 * A `UdcContract` is produced by the parser from the `<Prop>`, `<Event>`,
 * `<Method>` and `<Slot>` child elements of a `<Component>` definition.
 * When no declarations are present the contract is absent (`undefined`) and
 * the existing inference walk is used (backwards-compatible default).
 *
 * Part of plan #14 "UDC Sandboxing".
 */

// ---------------------------------------------------------------------------
// Capability names
// ---------------------------------------------------------------------------

/**
 * Capability tokens a UDC may declare (analogous to Web App Manifest
 * `permissions`).  When `strictUdcSandbox` is enabled, any use of a managed
 * primitive that is not listed here is a `udc-capability-missing` diagnostic.
 */
export type UdcCapability =
  | "fetch"
  | "websocket"
  | "eventsource"
  | "navigate"
  | "clipboard"
  | "randomBytes"
  | "log"
  | "mark"
  | "environment";

export const ALL_UDC_CAPABILITIES: readonly UdcCapability[] = [
  "fetch",
  "websocket",
  "eventsource",
  "navigate",
  "clipboard",
  "randomBytes",
  "log",
  "mark",
  "environment",
];

// ---------------------------------------------------------------------------
// Individual declaration types
// ---------------------------------------------------------------------------

export interface UdcPropDecl {
  name: string;
  /** XMLUI type expression, e.g. `"string"`, `"number"`, `"boolean"`. */
  type?: string;
  required?: boolean;
  defaultValue?: unknown;
}

export interface UdcEventDecl {
  name: string;
}

export interface UdcMethodDecl {
  name: string;
}

export interface UdcSlotDecl {
  name: string;
  provides?: ReadonlySet<string>;
}

// ---------------------------------------------------------------------------
// Aggregate contract
// ---------------------------------------------------------------------------

export interface UdcContract {
  /** Name of the UDC this contract belongs to. */
  name: string;
  /** Declared props, keyed by prop name. */
  props: ReadonlyMap<string, UdcPropDecl>;
  /** Declared event names. */
  events: ReadonlySet<string>;
  /** Declared method names. */
  methods: ReadonlySet<string>;
  /** Declared slot names. */
  slots: ReadonlySet<string>;
  /** Slot context variables provided by each declared slot, keyed by slot name. */
  slotProvides?: ReadonlyMap<string, ReadonlySet<string>>;
  /** Declared capabilities. */
  capabilities: ReadonlySet<UdcCapability>;
  /** Whether the `capabilities` attribute was explicitly present. */
  capabilitiesDeclared?: boolean;
  /**
   * `"trusted"` — the UDC was loaded from a known-trusted source (same origin,
   * first-party package).  `"untrusted"` — loaded from an external or
   * user-provided source; scope restrictions apply.
   */
  trust: "trusted" | "untrusted";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates an empty (but valid) contract for a given UDC name. */
export function emptyContract(name: string): UdcContract {
  return {
    name,
    props: new Map(),
    events: new Set(),
    methods: new Set(),
    slots: new Set(),
    slotProvides: new Map(),
    capabilities: new Set(),
    capabilitiesDeclared: false,
    trust: "trusted",
  };
}

export function isUdcCapability(value: string): value is UdcCapability {
  return (ALL_UDC_CAPABILITIES as readonly string[]).includes(value);
}

export function parseCapabilityList(value: string | undefined): Set<UdcCapability> {
  if (value === undefined) {
    return new Set(ALL_UDC_CAPABILITIES);
  }
  const capabilities = new Set<UdcCapability>();
  for (const raw of value.split(",")) {
    const token = raw.trim();
    if (!token) continue;
    if (isUdcCapability(token)) {
      capabilities.add(token);
    }
  }
  return capabilities;
}

export function parseProvidesList(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (item.startsWith("$") ? item : `$${item}`)),
  );
}
