/**
 * Content-based PII heuristics (Phase 2.3).
 *
 * `detectPii` scans a scalar string value for recognisable PII patterns and
 * returns the category when a match is found.  Callers (the audit redactor)
 * use this to emit `audit-redaction-missing` diagnostics when a value
 * resembles sensitive data but has no matching redaction rule.
 *
 * Detection is best-effort and intentionally conservative (low false-positive
 * rate preferred over high recall).
 */

export type PiiCategory =
  | "email"
  | "phone"
  | "credit-card"
  | "ssn"
  | "jwt"
  | "ipv4"
  | "api-key";

export interface PiiMatch {
  category: PiiCategory;
  /** The regex that matched. */
  pattern: RegExp;
}

// ---------------------------------------------------------------------------
// Pattern registry
// ---------------------------------------------------------------------------

const PII_PATTERNS: Array<{ category: PiiCategory; pattern: RegExp }> = [
  // JWT: three base64url segments separated by dots
  {
    category: "jwt",
    pattern: /^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/,
  },
  // Email address
  {
    category: "email",
    pattern: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  },
  // Credit card: 13–19 digits, optionally separated by spaces or dashes
  {
    category: "credit-card",
    pattern: /^(?:\d[ -]?){13,18}\d$/,
  },
  // US SSN: 9 digits with optional separators (NNN-NN-NNNN)
  {
    category: "ssn",
    pattern: /^\d{3}[-\s]?\d{2}[-\s]?\d{4}$/,
  },
  // Generic API key / bearer token heuristic: ≥20 alphanumeric+symbols chars
  // that look random (no spaces)
  {
    category: "api-key",
    pattern: /^[A-Za-z0-9+/._\-]{20,}={0,2}$/,
  },
  // Phone: E.164-ish or common US format (flexible)
  {
    category: "phone",
    pattern: /^(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
  },
  // IPv4 address
  {
    category: "ipv4",
    pattern:
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect PII patterns in a string value.
 *
 * Returns the first matching `PiiMatch` or `null` when no pattern fires.
 * JWT detection runs first because JWT strings often also match the api-key
 * heuristic.
 */
export function detectPii(value: string): PiiMatch | null {
  if (typeof value !== "string" || value.length < 5) return null;
  for (const { category, pattern } of PII_PATTERNS) {
    if (pattern.test(value.trim())) {
      return { category, pattern };
    }
  }
  return null;
}
