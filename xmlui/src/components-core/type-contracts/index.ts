/**
 * Type-contracts module — public barrel.
 *
 * Exports the `TypeContractDiagnostic` type, the `TypeContractCode` union,
 * the `verifyComponentDef()` function, and the unified `coercionRules`
 * decision table. All consumers (LSP, Vite plugin, `valueExtractor`,
 * tests) import from here.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md`.
 */

export type { TypeContractCode, TypeContractDiagnostic } from "./diagnostics";
export type { VerifyOptions } from "./verifier";
export { verifyComponentDef } from "./verifier";
export {
  coerceValue,
  coercionRules,
  verifyValue,
} from "./rules/coerce";
export type { CoercionRule, VerifyContext, VerifyFailure } from "./rules/types";
export { verifyEnum } from "./rules/enum";
