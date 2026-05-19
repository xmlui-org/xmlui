/**
 * UDC Sandbox — diagnostic codes and diagnostic shape.
 *
 * Part of plan #14 "UDC Sandboxing".
 * See `xmlui/dev-docs/plans/14-udc-sandbox.md`.
 */

// ---------------------------------------------------------------------------
// Diagnostic codes
// ---------------------------------------------------------------------------

export type UdcDiagCode =
  /** A `$props.foo` reference in the implementation that has no matching `<Prop name="foo">` declaration. */
  | "udc-prop-undeclared"
  /** The caller passed a value whose type does not match the declared `<Prop type="…">`. */
  | "udc-prop-shape-mismatch"
  /** The caller fired an event name that has no matching `<Event name="…">` declaration. */
  | "udc-event-undeclared"
  /** A method exposed by the UDC has no matching `<Method name="…">` declaration. */
  | "udc-method-undeclared"
  /** A slot used by the caller has no matching `<Slot name="…">` declaration. */
  | "udc-slot-undeclared"
  /** The UDC implementation read an identifier from the parent scope it was not passed as a prop. */
  | "udc-scope-leak"
  /** A managed primitive (`App.fetch`, `navigate`, etc.) was called but not listed in `capabilities`. */
  | "udc-capability-missing"
  /** A capability was declared in the `<Component>` header but never used in the implementation. */
  | "udc-capability-undeclared"
  /** The implementation's contract does not match its shipped `udc.manifest.json`. */
  | "udc-manifest-mismatch"
  /** An untrusted UDC violated the strict-scope or capability restrictions. */
  | "udc-untrusted-violation";

// ---------------------------------------------------------------------------
// Diagnostic record
// ---------------------------------------------------------------------------

export interface UdcDiagnostic {
  code: UdcDiagCode;
  severity: "error" | "warn" | "info";
  /** Name of the UDC that produced the diagnostic. */
  udc: string;
  /** Source file path, if known. */
  file?: string;
  /** 1-based source line, if known. */
  line?: number;
  /** 1-based source column, if known. */
  column?: number;
  message: string;
  /** Extra structured context specific to the diagnostic code. */
  data?: unknown;
}
