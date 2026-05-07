/**
 * PII redaction (Phase 2).
 *
 * `redact` applies a policy's `redact` rules to a log entry before it
 * leaves the browser.  The selector engine supports dotted key paths with
 * `*` (single-key wildcard) and `**` (recursive wildcard).
 *
 * Conflict resolution: drop > hash > mask (most aggressive wins).
 * Detected conflicts emit the `audit-policy-conflict` diagnostic but do not
 * throw.
 *
 * `buildBaselineRules` converts `ComponentPropertyMetadata.audit` annotations
 * into `RedactionRule[]` that the redactor uses as the baseline policy layer
 * (before app-level `<App auditPolicy>` rules are applied).
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { AuditPolicy, RedactionRule } from "./policy";
import type { ComponentPropertyMetadata } from "../../abstractions/ComponentDefs";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a baseline set of `RedactionRule` entries from a component's
 * `props` metadata record.
 *
 * Rules are generated for every prop whose `audit.classification` is
 * `"sensitive"` or `"secret"`.  For object-typed props that declare
 * `audit.fieldPolicies`, per-key rules are emitted using the selector
 * `<propName>.<fieldKey>`; the top-level prop rule is still emitted so
 * that keys *not* in `fieldPolicies` are also covered by the default mode.
 *
 * The rules use the prop name as the selector root.  Call sites (e.g. a
 * trace entry producer) are responsible for using the same path naming.
 *
 * @param propsMetadata — The `props` map from a `ComponentMetadata` object.
 * @returns A `RedactionRule[]` ready to prepend to an `AuditPolicy.redact` array.
 */
export function buildBaselineRules(
  propsMetadata: Record<string, ComponentPropertyMetadata>,
): RedactionRule[] {
  const rules: RedactionRule[] = [];

  for (const [propName, def] of Object.entries(propsMetadata)) {
    const audit = def.audit;
    if (!audit || audit.classification === "public") continue;

    const defaultMode = audit.defaultRedaction ?? defaultModeFor(audit.classification);

    // Per-field overrides (for object-typed props like `headers`)
    if (audit.fieldPolicies && Object.keys(audit.fieldPolicies).length > 0) {
      for (const [fieldKey, fieldPolicy] of Object.entries(audit.fieldPolicies)) {
        rules.push({
          selector: `${propName}.${fieldKey}`,
          mode: fieldPolicy.defaultRedaction ?? defaultModeFor(fieldPolicy.classification),
        });
      }
    }

    // Top-level fallback rule:
    // - When fieldPolicies are declared, use `propName.*` so the rule matches any
    //   immediate child key not covered by a per-key rule without redacting the
    //   whole object before per-key rules can apply.
    // - When no fieldPolicies are declared, use `propName` to match the value itself.
    const fallbackSelector =
      audit.fieldPolicies && Object.keys(audit.fieldPolicies).length > 0
        ? `${propName}.*`
        : propName;
    rules.push({ selector: fallbackSelector, mode: defaultMode });
  }

  return rules;
}

/**
 * Apply all redaction rules in `policy` to `entry`.
 *
 * Returns a new (deep-cloned) entry object; the original is not mutated.
 */
export function redact(entry: XsLogEntry, policy: AuditPolicy): XsLogEntry {
  if (!policy.redact || policy.redact.length === 0) {
    return entry;
  }
  // Deep-clone so we never mutate the original
  const clone = deepClone(entry);
  applyRules(clone, policy.redact);
  return clone;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function deepClone<T>(value: T): T {
  // Using JSON round-trip — same approach as safeClone in inspectorUtils
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

/**
 * Collect all rules that match a given path and resolve conflicts by choosing
 * the most aggressive mode: drop > hash > mask.
 */
function resolveMode(
  rules: ReadonlyArray<RedactionRule>,
  keyPath: string,
): { mode: "mask" | "drop" | "hash"; replacement?: string } | null {
  const matching = rules.filter((r) => matchesSelector(r.selector, keyPath));
  if (matching.length === 0) return null;

  const PRIORITY: Record<string, number> = { drop: 3, hash: 2, mask: 1 };
  let best = matching[0];
  for (const r of matching) {
    if (PRIORITY[r.mode] > PRIORITY[best.mode]) best = r;
  }
  return { mode: best.mode, replacement: best.replacement };
}

/**
 * Walk every leaf path in `obj` and apply any matching redaction rule in-place.
 */
function applyRules(
  obj: Record<string, any>,
  rules: ReadonlyArray<RedactionRule>,
  prefix: string = "",
): void {
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    const resolved = resolveMode(rules, fullPath);
    if (resolved) {
      obj[key] = applyRedaction(value, resolved.mode, resolved.replacement);
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      applyRules(value, rules, fullPath);
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (item !== null && typeof item === "object") {
          applyRules(item, rules, `${fullPath}.${idx}`);
        }
      });
    }
  }
}

function applyRedaction(
  value: any,
  mode: "mask" | "drop" | "hash",
  replacement?: string,
): any {
  switch (mode) {
    case "drop":
      return undefined;
    case "hash":
      return hashValue(String(value ?? ""));
    case "mask":
    default:
      return replacement ?? "[REDACTED]";
  }
}

/**
 * Deterministic FNV-1a 32-bit hash, output as 8-char hex.
 * Adequate for pseudonymisation; not cryptographic.
 */
function hashValue(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Match a selector pattern against a dot-separated key path.
 *
 * Supported wildcards:
 *  - `*`  matches exactly one path segment.
 *  - `**` matches zero or more segments (greedy).
 */
export function matchesSelector(selector: string, keyPath: string): boolean {
  const selectorParts = selector.split(".");
  const pathParts = keyPath.split(".");
  return matchParts(selectorParts, 0, pathParts, 0);
}

function matchParts(
  sel: string[],
  si: number,
  path: string[],
  pi: number,
): boolean {
  // Both exhausted → match
  if (si === sel.length && pi === path.length) return true;
  // Selector exhausted but path still has segments → no match
  if (si === sel.length) return false;

  const seg = sel[si];
  if (seg === "**") {
    // Try matching zero remaining path segments from si+1 onwards,
    // then one, two, … (greedy backtracking)
    for (let skip = 0; skip <= path.length - pi; skip++) {
      if (matchParts(sel, si + 1, path, pi + skip)) return true;
    }
    return false;
  }

  // Path exhausted but selector still has non-** segments
  if (pi === path.length) return false;

  if (seg === "*" || seg === path[pi]) {
    return matchParts(sel, si + 1, path, pi + 1);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Return the canonical default redaction mode for a given PII classification.
 *
 * - `"sensitive"` → `"hash"` (pseudonymises; keeps some analytical value)
 * - `"secret"`    → `"mask"` (completely replaces; no analytical value)
 */
function defaultModeFor(
  classification: "public" | "sensitive" | "secret",
): "mask" | "drop" | "hash" {
  return classification === "secret" ? "mask" : "hash";
}

