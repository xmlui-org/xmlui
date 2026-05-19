/**
 * Built-in `email` validator (Plan #9 Step 1.1).
 *
 * Empty string / null / undefined are considered valid here so that
 * `validator="email"` does not collide with `required` — pair the two
 * to require a non-empty, valid email.
 *
 * Regex preserved verbatim from the legacy `pattern="email"` branch in
 * `Validations.ts` so behaviour is bit-identical to pre-W5-1 apps.
 */

import type { ValidatorEntry } from "../validator-registry";

const MESSAGE_KEY = "xmlui.validation.email";
const DEFAULT_MESSAGE = "Not a valid email address";

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function isValidEmail(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  return EMAIL_RE.test(value);
}

export const emailValidator: ValidatorEntry = {
  name: "email",
  fn: (value) => (isValidEmail(value) ? null : MESSAGE_KEY),
  defaultMessage: DEFAULT_MESSAGE,
};
