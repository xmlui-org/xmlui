/**
 * Type-contract diagnostic types.
 *
 * `TypeContractDiagnostic` is the unit of output from the type-contract
 * verifier. Each code maps to a specific contract violation.
 *
 * Code taxonomy (matches the `TypeContractCode` union):
 *   - `unknown-component`         A component type was referenced that is not in the registry.
 *   - `unknown-prop`              A prop name was used that the component metadata does not declare.
 *   - `wrong-type`                A literal prop value failed the declared `valueType` check.
 *   - `missing-required`          A prop declared `isRequired` was not supplied.
 *   - `value-not-in-enum`         A literal value was not in the declared `availableValues`.
 *   - `unknown-event`             An event name was used that the component metadata does not declare.
 *   - `unknown-exposed-method`    An exposed-method reference targets an undeclared method.
 *   - `deprecated-prop`           A prop carrying `deprecationMessage` was used.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md`.
 */

export type TypeContractCode =
  | "unknown-component"
  | "unknown-prop"
  | "wrong-type"
  | "missing-required"
  | "value-not-in-enum"
  | "unknown-event"
  | "unknown-exposed-method"
  | "deprecated-prop";

export interface TypeContractDiagnostic {
  code: TypeContractCode;
  severity: "error" | "warn";
  /**
   * The XMLUI component type that produced this diagnostic
   * (e.g., `"Button"`, `"NumberBox"`).
   */
  componentName: string;
  /** Prop or event name when the diagnostic targets a single attribute. */
  propName?: string;
  /** Human-readable description of the expected shape. */
  expected?: string;
  /** The offending raw value, stringified for display. */
  actual?: string;
  /** Source range of the offending element (1-based). */
  range?: { line: number; col: number; length?: number };
  /** Workspace-relative URI of the source file. */
  uri?: string;
  /** Human-readable description of the violation. */
  message: string;
  /** Optional remediation hint shown in the IDE quick-fix surface. */
  suggestion?: string;
}
