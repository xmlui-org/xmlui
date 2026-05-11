/**
 * Rule: closed-enum check via `availableValues`.
 *
 * `availableValues` is the canonical way to declare a closed string/number
 * enum on a property even when `valueType` is `"string"` or `"number"`.
 * The verifier treats it as authoritative when present.
 */

import type { PropertyValueDescription } from "../../../abstractions/ComponentDefs";
import type { VerifyFailure } from "./types";

/**
 * Verify a literal `raw` against an `availableValues` enum.
 *
 * @returns `null` if the value is in the enum (or the enum is empty);
 *          otherwise a `VerifyFailure` with the list of accepted values.
 */
export function verifyEnum(
  raw: unknown,
  availableValues: readonly PropertyValueDescription[] | undefined,
): VerifyFailure | null {
  if (raw === undefined || raw === null) return null;
  if (!availableValues || availableValues.length === 0) return null;

  const accepted = availableValues.map(unwrap);
  if (accepted.some((v) => v === raw || String(v) === String(raw))) return null;

  const acceptedDisplay = accepted.map((v) => JSON.stringify(v)).join(", ");
  return {
    message: `Value ${JSON.stringify(raw)} is not one of: ${acceptedDisplay}.`,
    expected: acceptedDisplay,
  };
}

function unwrap(v: PropertyValueDescription): string | number {
  if (typeof v === "object" && v !== null && "value" in v) return (v as any).value;
  return v as string | number;
}
