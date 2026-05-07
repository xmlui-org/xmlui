/**
 * Unified coercion decision table.
 *
 * `coercionRules` is the single chokepoint shared by the type-contract
 * verifier and the runtime `valueExtractor.as*` helpers. A new
 * `PropertyValueType` is added by:
 *
 *   1. Extending the `PropertyValueType` union in
 *      `xmlui/src/abstractions/ComponentDefs.ts`.
 *   2. Adding a `CoercionRule` to this file (or a sibling rule file
 *      imported here).
 *
 * The runtime extractor and the verifier read the same rule, by
 * construction — see `dev-docs/plans/01-verified-type-contracts.md`
 * Phase 1 §1.2.
 */

import type { PropertyValueType } from "../../../abstractions/ComponentDefs";
import { colorRule } from "./color";
import { iconRule } from "./icon";
import { idRefRule } from "./id-ref";
import { integerRule } from "./integer";
import { lengthRule } from "./length";
import type { CoercionRule, VerifyContext, VerifyFailure } from "./types";
import { urlRule } from "./url";

// Legacy coarse-typed rules — verification is currently a no-op (the
// runtime `as*` helpers retain their existing semantics) but the entries
// exist so consumers can call `coercionRules.get(valueType)` uniformly.

const stringRule: CoercionRule = {
  valueType: "string",
  verify: () => null,
  coerce: (raw) => (raw === undefined || raw === null ? raw : String(raw)),
};

const numberRule: CoercionRule = {
  valueType: "number",
  verify(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === "number" && Number.isFinite(raw)) return null;
    if (typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw))) {
      return null;
    }
    return { message: `Expected a number, got ${typeof raw}.`, expected: "number" };
  },
  coerce(raw) {
    if (raw === undefined || raw === null) return raw;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
    return raw;
  },
};

const booleanRule: CoercionRule = {
  valueType: "boolean",
  verify: () => null,
  coerce(raw) {
    if (raw === undefined || raw === null) return raw;
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
      const v = raw.trim().toLowerCase();
      if (v === "true") return true;
      if (v === "false" || v === "") return false;
    }
    return !!raw;
  },
};

const anyRule: CoercionRule = {
  valueType: "any",
  verify: () => null,
  coerce: (raw) => raw,
};

const componentDefRule: CoercionRule = {
  valueType: "ComponentDef",
  verify: () => null,
  coerce: (raw) => raw,
};

const allRules: readonly CoercionRule[] = [
  // Legacy coarse types
  stringRule,
  numberRule,
  booleanRule,
  anyRule,
  componentDefRule,
  // Refined Phase-1 types
  integerRule,
  colorRule,
  lengthRule,
  urlRule,
  iconRule,
  idRefRule,
];

/**
 * The single shared rule table. Frozen so consumers cannot mutate it.
 */
export const coercionRules: ReadonlyMap<PropertyValueType, CoercionRule> = new Map(
  allRules.map((r) => [r.valueType, r] as const),
);

/**
 * Convenience: verify a raw value against a declared `valueType`. Returns
 * `null` when the rule is unknown (forward-compatibility) so callers can
 * treat unknown types as opt-out rather than as failures.
 */
export function verifyValue(
  valueType: PropertyValueType | undefined,
  raw: unknown,
  ctx?: VerifyContext,
): VerifyFailure | null {
  if (!valueType) return null;
  const rule = coercionRules.get(valueType);
  if (!rule) return null;
  return rule.verify(raw, ctx);
}

/**
 * Convenience: coerce a raw value against a declared `valueType`. Returns
 * the raw value unchanged when the rule is unknown.
 */
export function coerceValue(
  valueType: PropertyValueType | undefined,
  raw: unknown,
  ctx?: VerifyContext,
): unknown {
  if (!valueType) return raw;
  const rule = coercionRules.get(valueType);
  if (!rule) return raw;
  return rule.coerce(raw, ctx);
}

export type { CoercionRule, VerifyContext, VerifyFailure };
