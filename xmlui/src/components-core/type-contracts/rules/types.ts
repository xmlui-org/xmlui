/**
 * Shared types for the type-contract rule table.
 *
 * Every refined `PropertyValueType` (Phase 1 of the type-contract plan)
 * ships a `CoercionRule`. The verifier (`verifyComponentDef`) and the
 * runtime extractor (`valueExtractor.as*`) consult the same rule, so a
 * value that passes `verify()` cannot fail `coerce()` and vice versa.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md` Phase 1 §1.2.
 */

import type {
  ComponentMetadata,
  PropertyValueType,
} from "../../../abstractions/ComponentDefs";

/** Optional context the rules may consult during verify / coerce. */
export interface VerifyContext {
  /** Registered component metadata (used by `id-ref` resolution callers). */
  registry?: ReadonlyMap<string, ComponentMetadata>;
  /** Set of icon names known to the active `IconRegistry`. */
  icons?: ReadonlySet<string>;
  /** Set of component `id`s in the current container scope. */
  scopeIds?: ReadonlySet<string>;
}

/**
 * Verification failure detail returned by `CoercionRule.verify()`.
 *
 * `null` means "the value satisfies the contract".
 */
export interface VerifyFailure {
  /** Short human-readable description of the violation. */
  message: string;
  /** Optional canonical description of the expected shape. */
  expected?: string;
}

export interface CoercionRule {
  /** The `PropertyValueType` this rule governs. */
  valueType: PropertyValueType;
  /**
   * Validate a raw value against the contract.
   *
   * @returns `null` if the value satisfies the contract; otherwise a
   *   `VerifyFailure` describing the violation.
   */
  verify(raw: unknown, ctx?: VerifyContext): VerifyFailure | null;
  /**
   * Coerce a raw value to its runtime shape.
   *
   * Must be lossless when `verify()` returns `null` for the same input.
   * May throw or return a sentinel for inputs that fail verification —
   * the runtime path bypasses verification only when an explicit
   * `valueType: "any"` opt-out is in effect.
   */
  coerce(raw: unknown, ctx?: VerifyContext): unknown;
}
