/**
 * Built-in `strongPassword` validator (Plan #9 Step 1.1).
 *
 * Default policy: minimum length 12, must contain at least one
 * upper-case letter, one lower-case letter, one digit, and one symbol
 * (any non-alphanumeric character).
 *
 * `validatorParams` may override `minLength` (Step 1.3):
 *   <FormItem validator="strongPassword"
 *             validatorParams="{{ minLength: 16 }}" />
 *
 * Empty values pass — pair with `required` to enforce presence.
 */

import type { ValidatorEntry } from "../validator-registry";

const DEFAULT_MESSAGE =
  "Password must be at least 12 characters and include upper, lower, digit, and symbol";

export interface StrongPasswordParams {
  minLength?: number;
}

const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_DIGIT = /[0-9]/;
const HAS_SYMBOL = /[^A-Za-z0-9]/;

export function isValidStrongPassword(value: unknown, params?: StrongPasswordParams): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  const minLength = Number.isFinite(params?.minLength) ? (params!.minLength as number) : 12;
  return (
    value.length >= minLength &&
    HAS_UPPER.test(value) &&
    HAS_LOWER.test(value) &&
    HAS_DIGIT.test(value) &&
    HAS_SYMBOL.test(value)
  );
}

export const strongPasswordValidator: ValidatorEntry = {
  name: "strongPassword",
  fn: (value, _ctx, params) =>
    isValidStrongPassword(value, params as StrongPasswordParams | undefined)
      ? null
      : DEFAULT_MESSAGE,
  defaultMessage: DEFAULT_MESSAGE,
};
