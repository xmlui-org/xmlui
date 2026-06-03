/**
 * Versioning module barrel — plan #12 (`12-enforced-versioning.md`).
 *
 * Exports the diagnostic taxonomy, the verifier (parse-time walker), the
 * runtime echo helper, the prop-rename helper, and the report builder
 * used by the Inspector "Versioning" tab.
 */

export type {
  VersioningDiagnostic,
  VersioningDiagnosticCode,
} from "./diagnostics";

export { verifyVersioning } from "./verifier";
export type { VerifyVersioningOptions, VersioningRegistry } from "./verifier";

export {
  emitVersioningDiagnostics,
  collectVersioningReport,
  formatMigrationPlan,
  _resetVersioningDedup,
} from "./runtime";
export type { VersioningFinding, VersioningReport } from "./runtime";

export { applyRenames } from "./rename-helper";
export type { PropRename, ApplyRenamesResult } from "./rename-helper";

export { applyValueAliases, applyPreserveLegacyDefault } from "./propCoercion";

export { compareSemver, parseSemver } from "./semver";
