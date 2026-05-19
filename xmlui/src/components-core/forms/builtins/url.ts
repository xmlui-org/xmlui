/**
 * Built-in `url` validator (Plan #9 Step 1.1).
 *
 * Legacy `pattern="url"` semantics: parses via the URL constructor and
 * additionally restricts the protocol to `http:` / `https:`. Empty
 * values are valid — combine with `required` to enforce presence.
 */

import type { ValidatorEntry } from "../validator-registry";

const DEFAULT_MESSAGE = "Not a valid URL";

export function isValidUrl(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const urlValidator: ValidatorEntry = {
  name: "url",
  fn: (value) => (isValidUrl(value) ? null : DEFAULT_MESSAGE),
  defaultMessage: DEFAULT_MESSAGE,
};
