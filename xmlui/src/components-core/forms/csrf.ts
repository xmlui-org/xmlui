/**
 * Pure helpers backing the CSRF / idempotency surface introduced by
 * Plan #09 Step 5.1 ("Forms Validation Discipline"). Kept side-effect
 * free so they can be exercised directly from unit tests without
 * mounting a Form component.
 */

export interface BuildSubmitHeadersInput {
  csrfToken?: string;
  idempotencyKey?: string;
  csrfHeaderName?: string;
  idempotencyHeaderName?: string;
}

export const DEFAULT_CSRF_HEADER_NAME = "X-CSRF-Token";
export const DEFAULT_IDEMPOTENCY_HEADER_NAME = "Idempotency-Key";

/**
 * Construct the `headers` object the built-in submit handler attaches
 * to the request. Returns `undefined` when neither header would be
 * populated so callers can drop the `headers:` clause from the
 * generated handler template.
 */
export function buildSubmitHeaders(
  input: BuildSubmitHeadersInput,
): Record<string, string> | undefined {
  const csrfHeader = input.csrfHeaderName || DEFAULT_CSRF_HEADER_NAME;
  const idemHeader = input.idempotencyHeaderName || DEFAULT_IDEMPOTENCY_HEADER_NAME;
  const headers: Record<string, string> = {};
  if (input.csrfToken) headers[csrfHeader] = input.csrfToken;
  if (input.idempotencyKey) headers[idemHeader] = input.idempotencyKey;
  return Object.keys(headers).length > 0 ? headers : undefined;
}

export interface ShouldEmitCsrfMissingInput {
  /** True when `strictForms` or `requireFormCsrf` appGlobals are set. */
  requireCsrf: boolean;
  csrfToken?: string;
  /** HTTP verb used by the submit handler. Defaults to `"post"`. */
  submitMethod?: string;
}

/**
 * Decide whether the `csrf-token-missing` diagnostic should fire for a
 * given submit attempt. GET / HEAD requests are skipped — they are
 * non-mutating and therefore don't need CSRF protection.
 */
export function shouldEmitCsrfMissing(input: ShouldEmitCsrfMissingInput): boolean {
  if (!input.requireCsrf) return false;
  if (input.csrfToken) return false;
  const method = (input.submitMethod ?? "post").toString().toLowerCase();
  return method !== "get" && method !== "head";
}
