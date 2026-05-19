/**
 * Built-in `isoDate` validator (Plan #9 Step 1.1).
 *
 * Accepts strict ISO 8601 calendar dates: `YYYY-MM-DD`. Also tolerates
 * full ISO 8601 timestamps (`YYYY-MM-DDTHH:mm[:ss[.sss]][Z|±HH:mm]`).
 * Rejects partial / lenient inputs like `2024-1-1` or `01/15/2024`.
 *
 * The check is two-stage:
 *  1. Shape match via regex (cheap, rejects obvious garbage).
 *  2. Round-trip through `Date` to catch invalid days (e.g. Feb 30).
 */

import type { ValidatorEntry } from "../validator-registry";

const DEFAULT_MESSAGE = "Not a valid ISO 8601 date";

// Date only: 1900-2999. Time portion optional.
const ISO_RE =
  /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9](\.[0-9]{1,9})?)?(Z|[+-]([01][0-9]|2[0-3]):[0-5][0-9])?)?$/;

export function isValidIsoDate(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  if (!ISO_RE.test(value)) return false;
  const [y, m, d] = value.split(/[T-]/).map((p) => Number(p));
  // Verify the day actually exists in the month (catches Feb 30, etc.).
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export const isoDateValidator: ValidatorEntry = {
  name: "isoDate",
  fn: (value) => (isValidIsoDate(value) ? null : DEFAULT_MESSAGE),
  defaultMessage: DEFAULT_MESSAGE,
};
