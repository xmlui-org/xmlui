/**
 * Server-error mapping (Plan #9 Phase 3 / Step 3.1).
 *
 * `<Form>`'s submit handler normalises rejection payloads into
 * `ServerValidationProblem` so per-field errors can land on the
 * matching `<FormItem>` without bespoke user code.
 *
 * Supported wire shapes (auto-detected, in priority order):
 *
 *  1. RFC 7807 / RFC 9457 Problem Details with `invalid-params`:
 *       { type, title, status: 422, detail,
 *         "invalid-params": [{ name, reason, code? }, ...] }
 *
 *  2. Spring Boot-style: `{ errors: [{ field, defaultMessage }, ...] }`
 *
 *  3. Laravel-style: `{ message, errors: { fieldName: ["msg"] } }`
 *
 *  4. The existing XMLUI `GenericBackendError`-style payload:
 *       `{ details: { issues: [{ field, message, severity }] } }`
 *     (kept for backward compatibility with the pre-W5-3 path.)
 *
 * Any other shape returns `undefined` and the caller falls back to its
 * existing handling (raw error rendered as a form-level message).
 */

export interface InvalidParam {
  /** Field name as the server reports it; may not match a `FormItem.bindTo`. */
  name: string;
  /** Human-readable error message. */
  reason: string;
  /** Optional machine-readable error code (e.g. `"required"`). */
  code?: string;
  /** Severity, if the wire format carries one (XMLUI legacy shape). */
  severity?: "error" | "warning";
}

export interface ServerValidationProblem {
  /** RFC 7807 `type` URI, if present. */
  type?: string;
  /** RFC 7807 `title`, if present. */
  title?: string;
  /** HTTP status (typically 400 or 422). */
  status?: number;
  /** RFC 7807 `detail`, if present. */
  detail?: string;
  /** Normalised per-field errors. Empty array ⇒ general failure only. */
  invalidParams: InvalidParam[];
}

// --- private helpers -----------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Walk the error/payload tree looking for an object that "looks like"
 * a Problem Details body or one of the supported aliases. We try:
 *
 *  - `error` itself
 *  - `error.data` (XMLUI `AppError.data`)
 *  - `error.body` (raw fetch body)
 *  - `error.response` / `error.response.data` (axios-style)
 *  - `error.details` (XMLUI `GenericBackendError`)
 */
function* candidatePayloads(error: unknown): Iterable<Record<string, unknown>> {
  const seen = new Set<unknown>();
  const enqueue = (v: unknown) => {
    const rec = asRecord(v);
    if (rec && !seen.has(rec)) {
      seen.add(rec);
      return rec;
    }
    return undefined;
  };
  const root = enqueue(error);
  if (root) {
    yield root;
    const subs = [
      root.data,
      root.body,
      root.payload,
      root.problem,
      root.details,
      root.response,
    ];
    for (const s of subs) {
      const r = enqueue(s);
      if (r) yield r;
    }
    const response = asRecord(root.response);
    if (response) {
      const rd = enqueue(response.data);
      if (rd) yield rd;
    }
  }
}

function extractRfc7807(payload: Record<string, unknown>): InvalidParam[] | undefined {
  // RFC 9457 uses hyphenated key; some implementations use camelCase.
  const list =
    (payload["invalid-params"] as unknown) ??
    (payload["invalidParams"] as unknown);
  if (!Array.isArray(list)) return undefined;
  const out: InvalidParam[] = [];
  for (const item of list) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = asString(rec.name);
    const reason = asString(rec.reason) ?? asString(rec.detail);
    if (!name || !reason) continue;
    const code = asString(rec.code);
    out.push(code ? { name, reason, code } : { name, reason });
  }
  return out.length ? out : undefined;
}

function extractSpring(payload: Record<string, unknown>): InvalidParam[] | undefined {
  const errors = payload.errors;
  if (!Array.isArray(errors)) return undefined;
  const out: InvalidParam[] = [];
  for (const item of errors) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = asString(rec.field) ?? asString(rec.objectName);
    const reason =
      asString(rec.defaultMessage) ??
      asString(rec.message) ??
      asString(rec.reason);
    if (!name || !reason) continue;
    const code = asString(rec.code);
    out.push(code ? { name, reason, code } : { name, reason });
  }
  return out.length ? out : undefined;
}

function extractLaravel(payload: Record<string, unknown>): InvalidParam[] | undefined {
  const errors = asRecord(payload.errors);
  if (!errors) return undefined;
  const out: InvalidParam[] = [];
  for (const [name, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      const reason = value.find((x) => typeof x === "string");
      if (typeof reason === "string") out.push({ name, reason });
    } else if (typeof value === "string") {
      out.push({ name, reason: value });
    }
  }
  return out.length ? out : undefined;
}

function extractXmluiLegacy(payload: Record<string, unknown>): InvalidParam[] | undefined {
  // GenericBackendError shape: `details.issues: [{ field, message, severity }]`
  const details = asRecord(payload.details) ?? payload;
  const issues = details.issues;
  if (!Array.isArray(issues)) return undefined;
  const out: InvalidParam[] = [];
  for (const item of issues) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = asString(rec.field);
    const reason = asString(rec.message);
    if (!name || !reason) continue;
    const severityRaw = asString(rec.severity);
    const severity =
      severityRaw === "warning" || severityRaw === "warn"
        ? "warning"
        : severityRaw === "error"
          ? "error"
          : undefined;
    out.push(severity ? { name, reason, severity } : { name, reason });
  }
  return out.length ? out : undefined;
}

// --- public API ----------------------------------------------------------

/**
 * Attempt to normalise `error` into a `ServerValidationProblem`.
 *
 * Returns `undefined` when no recognised shape is present — the caller
 * should then fall back to its existing handling.
 *
 * Pure / synchronous / side-effect-free; safe to call from a `catch`.
 */
export function extractServerValidationProblem(
  error: unknown,
): ServerValidationProblem | undefined {
  for (const payload of candidatePayloads(error)) {
    const invalidParams =
      extractRfc7807(payload) ??
      extractSpring(payload) ??
      extractLaravel(payload) ??
      extractXmluiLegacy(payload);
    if (invalidParams && invalidParams.length > 0) {
      return {
        type: asString(payload.type),
        title: asString(payload.title),
        status: asNumber(payload.status),
        detail: asString(payload.detail) ?? asString(payload.message),
        invalidParams,
      };
    }
  }
  return undefined;
}
