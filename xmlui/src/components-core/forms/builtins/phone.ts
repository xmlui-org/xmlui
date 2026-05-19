/**
 * Built-in `phone` validator (Plan #9 Step 1.1).
 *
 * Legacy `pattern="phone"` semantics preserved: must contain at least
 * one digit and only allowed characters (`a-z`, `A-Z`, `0-9`, `#`, `*`,
 * `(`, `)`, `+`, `.`, `-`, `_`, `&`, `'`). Empty values are valid —
 * combine with `required` to enforce presence.
 */

import type { ValidatorEntry } from "../validator-registry";

const MESSAGE_KEY = "xmlui.validation.phone";
const DEFAULT_MESSAGE = "Not a valid phone number";

const PHONE_ALLOWED = /^[a-zA-Z0-9#*)(+.\-_&']+$/;
const HAS_DIGIT = /[0-9]/;

export function isValidPhone(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  return PHONE_ALLOWED.test(value) && HAS_DIGIT.test(value);
}

export const phoneValidator: ValidatorEntry = {
  name: "phone",
  fn: (value) => (isValidPhone(value) ? null : MESSAGE_KEY),
  defaultMessage: DEFAULT_MESSAGE,
};
