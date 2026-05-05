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
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { AuditPolicy, RedactionRule } from "./policy";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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

