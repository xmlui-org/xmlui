/**
 * Built-in `noLeadingTrailingWhitespace` validator (Plan #9 Step 1.1).
 *
 * Rejects strings that begin or end with whitespace — a common source
 * of "looks the same but isn't" bugs in usernames, slugs, and IDs.
 * Empty strings pass.
 */

import type { ValidatorEntry } from "../validator-registry";

const DEFAULT_MESSAGE = "Value must not start or end with whitespace";

export function hasNoLeadingTrailingWhitespace(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  return value === value.trim();
}

export const noLeadingTrailingWhitespaceValidator: ValidatorEntry = {
  name: "noLeadingTrailingWhitespace",
  fn: (value) => (hasNoLeadingTrailingWhitespace(value) ? null : DEFAULT_MESSAGE),
  defaultMessage: DEFAULT_MESSAGE,
};
