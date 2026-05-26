/**
 * Theming-validator rule table (plan #08, Step 1.1).
 *
 * Reuses the shared `coercionRules` table from the type-contract
 * verifier for `color` / `length` / `integer` / `number` / `string`,
 * and registers seven new rules specific to theming (`duration`,
 * `easing`, `shadow`, `border`, `fontFamily`, `fontWeight`,
 * `lineHeight`). The single shared rule table guarantees a
 * `valueType: "color"` prop and a `valueType: "color"` theme
 * variable accept identical inputs (see plan §"Resolved Decisions"
 * item 2).
 */

import type { ThemeValueType } from "../../../abstractions/ComponentDefs";
import { coercionRules } from "../../type-contracts/rules/coerce";
import type { CoercionRule, VerifyFailure } from "../../type-contracts/rules/types";
import { borderRule } from "./rules/border";
import { durationRule } from "./rules/duration";
import { easingRule } from "./rules/easing";
import { fontFamilyRule } from "./rules/fontFamily";
import { fontWeightRule } from "./rules/fontWeight";
import { lineHeightRule } from "./rules/lineHeight";
import { shadowRule } from "./rules/shadow";

const themingOnlyRules: readonly CoercionRule[] = [
  durationRule,
  easingRule,
  shadowRule,
  borderRule,
  fontFamilyRule,
  fontWeightRule,
  lineHeightRule,
];

const themingExtra = new Map<string, CoercionRule>(
  themingOnlyRules.map((r) => [r.valueType as unknown as string, r] as const),
);

/**
 * Look up the rule for a `ThemeValueType`. Returns `undefined` for
 * `"string"` (opt-out) and for unknown types (forward-compatible).
 */
export function lookupThemeRule(valueType: ThemeValueType | undefined): CoercionRule | undefined {
  if (!valueType || valueType === "string") return undefined;
  const shared = coercionRules.get(valueType as any);
  if (shared) return shared;
  return themingExtra.get(valueType);
}

/**
 * Verify a single resolved theme value against its declared
 * `valueType`. Returns `null` when valid, a `VerifyFailure` otherwise.
 */
export function verifyThemeValue(
  valueType: ThemeValueType | undefined,
  raw: unknown,
): VerifyFailure | null {
  const rule = lookupThemeRule(valueType);
  if (!rule) return null;
  return rule.verify(raw);
}
