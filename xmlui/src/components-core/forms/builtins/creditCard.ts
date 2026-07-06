/**
 * Built-in `creditCard` validator (Plan #9 Step 1.1).
 *
 * Implements the Luhn (mod-10) check. Accepts digits with optional
 * spaces / dashes; rejects anything else. Common card BIN length range
 * is 12–19 digits (matches ISO/IEC 7812).
 */

import type { ValidatorEntry } from "../validator-registry";

const MESSAGE_KEY = "xmlui.validation.creditCard";
const DEFAULT_MESSAGE = "Not a valid credit card number";

export function isValidCreditCard(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string" && typeof value !== "number") return false;
  const digits = String(value).replace(/[\s-]/g, "");
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export const creditCardValidator: ValidatorEntry = {
  name: "creditCard",
  fn: (value) => (isValidCreditCard(value) ? null : MESSAGE_KEY),
  defaultMessage: DEFAULT_MESSAGE,
};
