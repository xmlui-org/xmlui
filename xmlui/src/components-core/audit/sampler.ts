/**
 * Trace sampling (Step 0 stub).
 *
 * `sample` decides whether an entry should be forwarded to the sink.
 * The Step 0 implementation always returns `true` (keep all entries).
 * Phase 3 replaces the body with head-based + tail-based sampling logic.
 */

import type { XsLogEntry } from "../inspector/inspectorUtils";
import type { AuditPolicy } from "./policy";

/**
 * Return `true` when `entry` should be forwarded to the configured sink.
 *
 * **Step 0 stub**: always returns `true`.
 */
export function sample(_entry: XsLogEntry, _policy: AuditPolicy): boolean {
  return true;
}
