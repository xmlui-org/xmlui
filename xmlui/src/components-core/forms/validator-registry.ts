/**
 * Named validator registry (Plan #9 Step 0 + Phase 1).
 *
 * Apps and the built-in standard library register validators by *name*;
 * `<FormItem validator="name">` looks them up here. The registry is a
 * process-wide singleton (validator names are global to the app, per
 * plan §1.2).
 *
 * W5-1 ships:
 * - The registry + lookup API.
 * - `App.registerValidator()` (wired in `AppContext.tsx`).
 * - Built-in validators living under `./builtins/`.
 * - `validatorParams` and multi-validator (array) support via
 *   `ValidatorFn`'s third `params` argument.
 * - Async `ctx.signal: AbortSignal` plumbed from the per-field
 *   `AbortController` (already present in `useValidation`).
 *
 * Diagnostics emitted (via `pushXsLog({ kind: "forms", code, ... })`):
 * - `duplicate-validator` (warn in non-strict, error in strict) on
 *   re-registration.
 * - `unknown-validator` (warn / error) at FormItem render.
 * - `validator-throw` (warn / error) when `fn` throws; the field is
 *   marked invalid with the exception message.
 */

import type { FormDiagnostic, FormDiagnosticSeverity } from "./diagnostics";

/** Severity of a validator's failure result. */
export type ValidatorSeverity = "error" | "warning";

/**
 * Per-invocation validator context.
 *
 * - `fieldName` / `formData` give the validator access to neighbouring
 *   field values (kept for parity with `<FormValidator>` cross-field
 *   semantics, but field-level validators rarely need it).
 * - `signal` — an `AbortSignal` that fires when the field is re-edited
 *   before the previous async validation resolves (Step 1.4). Sync
 *   validators may ignore it.
 */
export interface ValidatorContext {
  fieldName: string;
  formData: Record<string, unknown>;
  signal?: AbortSignal;
}

/**
 * Validator function signature.
 *
 * Return `null` / `undefined` / empty string when the value is valid;
 * return a non-empty string when invalid (the string becomes the error
 * message). Async validators return a `Promise` of the same.
 *
 * The optional `params` argument carries the value of
 * `<FormItem validatorParams>` (Step 1.3).
 */
export type ValidatorFn = (
  value: unknown,
  ctx: ValidatorContext,
  params?: unknown,
) => string | null | undefined | Promise<string | null | undefined>;

export interface ValidatorEntry {
  name: string;
  fn: ValidatorFn;
  defaultMessage: string;
  severity?: ValidatorSeverity;
}

/** Result of running a single validator. */
export interface ValidatorRunResult {
  isValid: boolean;
  message?: string;
  severity: ValidatorSeverity;
}

// --- module-private state ------------------------------------------------

const registry = new Map<string, ValidatorEntry>();

let strictModeReader: () => boolean = () => false;
let diagnosticSink: (d: FormDiagnostic) => void = () => {
  /* default sink is a no-op — `AppContext.tsx` wires it to `pushXsLog` */
};

/**
 * Wire the registry to the app's strict-mode flag and diagnostic sink.
 * Called once from `AppContext.tsx`; tests may call it directly.
 */
export function configureValidatorRegistry(opts: {
  isStrict: () => boolean;
  emit: (d: FormDiagnostic) => void;
}): void {
  strictModeReader = opts.isStrict;
  diagnosticSink = opts.emit;
}

function emit(
  code: FormDiagnostic["code"],
  message: string,
  extra?: Partial<FormDiagnostic>,
): void {
  const strict = strictModeReader();
  const baseSeverity: FormDiagnosticSeverity =
    code === "deprecated-alias" ? "warn" : strict ? "error" : "warn";
  diagnosticSink({
    code,
    severity: baseSeverity,
    message,
    ...extra,
  });
}

// --- public registry API -------------------------------------------------

/**
 * Register a validator by name. Duplicate registration emits the
 * `duplicate-validator` diagnostic (warn → error under `strictForms`)
 * and *overwrites* the previous entry so that hot reload and test
 * overrides behave predictably.
 */
export function registerValidator(entry: ValidatorEntry): void {
  if (!entry || typeof entry.name !== "string" || entry.name.length === 0) {
    throw new TypeError("registerValidator: entry.name must be a non-empty string");
  }
  if (typeof entry.fn !== "function") {
    throw new TypeError(`registerValidator(${entry.name}): entry.fn must be a function`);
  }
  if (registry.has(entry.name)) {
    emit("duplicate-validator", `Validator "${entry.name}" is already registered; overwriting.`, {
      validatorName: entry.name,
    });
  }
  registry.set(entry.name, {
    name: entry.name,
    fn: entry.fn,
    defaultMessage: entry.defaultMessage ?? "Invalid value",
    severity: entry.severity ?? "error",
  });
}

/** Look up a validator by name. Returns `undefined` if not registered. */
export function lookupValidator(name: string): ValidatorEntry | undefined {
  return registry.get(name);
}

/** True if a validator with this name is registered. */
export function hasValidator(name: string): boolean {
  return registry.has(name);
}

/** All currently registered validator names — used by docs / tests. */
export function listValidatorNames(): string[] {
  return Array.from(registry.keys()).sort();
}

/**
 * Test-only: clear the registry. Built-ins must be re-registered after
 * calling this (typically by re-importing `./builtins/index.ts`).
 */
export function __resetValidatorRegistryForTests(): void {
  registry.clear();
}

// --- execution helpers ---------------------------------------------------

/**
 * Run a single named validator against `value`, returning a normalised
 * result. Emits `unknown-validator` / `validator-throw` diagnostics.
 *
 * Async validators are awaited; if `ctx.signal` aborts mid-flight, the
 * function resolves to a `{ isValid: true }` no-op (the caller will
 * have queued a fresh run).
 */
export async function runValidator(
  name: string,
  value: unknown,
  ctx: ValidatorContext,
  params?: unknown,
): Promise<ValidatorRunResult> {
  const entry = registry.get(name);
  if (!entry) {
    emit("unknown-validator", `Unknown validator "${name}".`, {
      validatorName: name,
      fieldName: ctx.fieldName,
    });
    return { isValid: true, severity: "error" };
  }
  try {
    const raw = entry.fn(value, ctx, params);
    const result = raw && typeof (raw as Promise<unknown>).then === "function"
      ? await (raw as Promise<string | null | undefined>)
      : (raw as string | null | undefined);
    if (ctx.signal?.aborted) {
      return { isValid: true, severity: entry.severity ?? "error" };
    }
    if (result == null || result === "") {
      return { isValid: true, severity: entry.severity ?? "error" };
    }
    return {
      isValid: false,
      message: result,
      severity: entry.severity ?? "error",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emit("validator-throw", `Validator "${name}" threw: ${message}`, {
      validatorName: name,
      fieldName: ctx.fieldName,
      data: { error: message },
    });
    return {
      isValid: false,
      message: entry.defaultMessage || message,
      severity: "error",
    };
  }
}

/**
 * Run a list of validators in order; the first failing one wins
 * (matches the "first failure wins" rule from plan Step 1.3).
 */
export async function runValidators(
  names: string[],
  value: unknown,
  ctx: ValidatorContext,
  params?: unknown,
): Promise<ValidatorRunResult> {
  for (const name of names) {
    const r = await runValidator(name, value, ctx, params);
    if (!r.isValid) return r;
    if (ctx.signal?.aborted) return { isValid: true, severity: "error" };
  }
  return { isValid: true, severity: "error" };
}
