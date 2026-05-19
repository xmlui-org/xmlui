/**
 * Built-in `iban` validator (Plan #9 Step 1.1).
 *
 * Implements the ISO 13616 mod-97 check (per ECBS):
 *  1. Strip spaces, upper-case.
 *  2. Length sanity (15–34 chars, alphanumeric only, must start with two
 *     letters + two digits).
 *  3. Move the first four chars to the end.
 *  4. Replace each letter with its 1-indexed alphabetic value + 9
 *     (A=10, B=11, …, Z=35).
 *  5. The resulting numeric string must be ≡ 1 (mod 97).
 *
 * Done in BigInt-free chunks to stay portable.
 */

import type { ValidatorEntry } from "../validator-registry";

const DEFAULT_MESSAGE = "Not a valid IBAN";

export function isValidIban(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  const normalised = value.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalised)) return false;
  const rearranged = normalised.slice(4) + normalised.slice(0, 4);
  // Map letters → numeric pairs.
  let expanded = "";
  for (let i = 0; i < rearranged.length; i++) {
    const c = rearranged.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      expanded += rearranged[i];
    } else if (c >= 65 && c <= 90) {
      expanded += (c - 55).toString(); // A=10
    } else {
      return false;
    }
  }
  // Chunked mod-97 to avoid Number-precision loss.
  let remainder = 0;
  for (let i = 0; i < expanded.length; i += 7) {
    const chunk = String(remainder) + expanded.slice(i, i + 7);
    remainder = Number(chunk) % 97;
  }
  return remainder === 1;
}

export const ibanValidator: ValidatorEntry = {
  name: "iban",
  fn: (value) => (isValidIban(value) ? null : DEFAULT_MESSAGE),
  defaultMessage: DEFAULT_MESSAGE,
};
