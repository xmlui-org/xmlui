/**
 * Versioning diagnostic types.
 *
 * `VersioningDiagnostic` is the unit of output from the versioning
 * surface — emitted at LSP / parse / runtime when markup references
 * deprecated, removed, renamed, or otherwise lifecycle-managed
 * component API elements.
 *
 * Code taxonomy (matches `VersioningDiagnosticCode`):
 *   - `deprecated-component`     A component marked `status: "deprecated"` is used.
 *   - `deprecated-prop`          A prop carrying `deprecationMessage` or `deprecatedSince` is used.
 *   - `deprecated-event`         An event marked deprecated is referenced.
 *   - `deprecated-method`        An exposed method marked deprecated is invoked.
 *   - `deprecated-value`         A prop value matched a `valueAliases.from` and was rewritten.
 *   - `removed-prop`             A prop whose `removedIn` is ≤ current version.
 *   - `renamed-prop`             A prop was renamed; the old name was used.
 *   - `experimental-use`         A component / prop marked `status: "experimental"` is used.
 *   - `default-value-changed`    `preserveLegacyDefaults` opted a prop back to its previous default.
 *   - `internal-component-use`   A component marked `status: "internal"` is used in user markup.
 *
 * See `dev-docs/plans/12-enforced-versioning.md`.
 */

export type VersioningDiagnosticCode =
  | "deprecated-component"
  | "deprecated-prop"
  | "deprecated-event"
  | "deprecated-method"
  | "deprecated-value"
  | "removed-prop"
  | "renamed-prop"
  | "experimental-use"
  | "default-value-changed"
  | "internal-component-use";

export interface VersioningDiagnostic {
  code: VersioningDiagnosticCode;
  /**
   * `info` — advisory (used for experimental, default-value-changed).
   * `warn` — non-strict default for deprecation findings.
   * `error` — strict-mode escalation for `removed-prop` and
   * `internal-component-use`.
   */
  severity: "error" | "warn" | "info";
  componentName?: string;
  propName?: string;
  eventName?: string;
  methodName?: string;
  /** Semver of the version that introduced the deprecation. */
  deprecatedSince?: string;
  /** Semver of the version in which the API element will be (or was) removed. */
  removedIn?: string;
  /** Free text or `<componentName>.<propName>` referring to a replacement. */
  replacement?: string;
  /** Optional source range — populated when the verifier walks XML AST nodes. */
  range?: { line: number; col: number; length?: number };
  /** Optional raw character offset into the source file (set by analyzer adapter). */
  sourceOffset?: number;
  /** Optional workspace-relative source file URI. */
  uri?: string;
  message: string;
}
