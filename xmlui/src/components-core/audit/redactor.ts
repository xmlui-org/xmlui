/**
 * PII redaction (Step 0 stub).
 *
 * `redact` applies a policy's `redact` rules to a log entry before it
 * leaves the browser.  The Step 0 implementation is a pass-through —
 * Phase 2 replaces the body with the full path-selector engine.
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { AuditPolicy } from "./policy";

/**
 * Apply all redaction rules in `policy` to `entry`.
 *
 * Returns a new entry object (the original is not mutated).
 *
 * **Step 0 stub**: returns `entry` unchanged until Phase 2 is implemented.
 */
export function redact(entry: XsLogEntry, _policy: AuditPolicy): XsLogEntry {
  return entry;
}
