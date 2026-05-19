/**
 * Forms module barrel (Plan #9 Step 0).
 *
 * Public surface of the `forms/` module — re-export only the types and
 * factories that other modules (`FormReact.tsx`, `FormItem.tsx`,
 * `AppContext.tsx`, tests) consume. Internal helpers stay file-local.
 */

export type {
  FormDiagnostic,
  FormDiagnosticCode,
  FormDiagnosticSeverity,
} from "./diagnostics";

import {
  registerValidator as registerValidatorRaw,
  lookupValidator as lookupValidatorRaw,
  hasValidator as hasValidatorRaw,
  listValidatorNames as listValidatorNamesRaw,
  runValidator as runValidatorRaw,
  runValidators as runValidatorsRaw,
  configureValidatorRegistry,
  __resetValidatorRegistryForTests as resetValidatorRegistryForTestsRaw,
} from "./validator-registry";
import type {
  ValidatorContext,
  ValidatorEntry,
  ValidatorFn,
  ValidatorRunResult,
  ValidatorSeverity,
} from "./validator-registry";
export type {
  ValidatorContext,
  ValidatorEntry,
  ValidatorFn,
  ValidatorRunResult,
  ValidatorSeverity,
} from "./validator-registry";

export { extractServerValidationProblem } from "./server-error-mapping";
export type {
  InvalidParam,
  ServerValidationProblem,
} from "./server-error-mapping";

export {
  DEFAULT_SUBMIT_POLICY,
  decideSubmit,
  submitPolicyToHandlerPolicy,
} from "./submit-guard";
export type {
  SubmitGuardDecision,
  SubmitGuardState,
  SubmitPolicy,
} from "./submit-guard";

import { registerBuiltInValidators } from "./builtins";

function ensureBuiltInValidatorsRegistered(): void {
  registerBuiltInValidators();
}

export function registerValidator(entry: ValidatorEntry): void {
  ensureBuiltInValidatorsRegistered();
  registerValidatorRaw(entry);
}

export function lookupValidator(name: string): ValidatorEntry | undefined {
  ensureBuiltInValidatorsRegistered();
  return lookupValidatorRaw(name);
}

export function hasValidator(name: string): boolean {
  ensureBuiltInValidatorsRegistered();
  return hasValidatorRaw(name);
}

export function listValidatorNames(): string[] {
  ensureBuiltInValidatorsRegistered();
  return listValidatorNamesRaw();
}

export function runValidator(
  name: string,
  value: unknown,
  ctx: ValidatorContext,
  params?: unknown,
): Promise<ValidatorRunResult> {
  ensureBuiltInValidatorsRegistered();
  return runValidatorRaw(name, value, ctx, params);
}

export function runValidators(
  names: string[],
  value: unknown,
  ctx: ValidatorContext,
  params?: unknown,
): Promise<ValidatorRunResult> {
  ensureBuiltInValidatorsRegistered();
  return runValidatorsRaw(names, value, ctx, params);
}

export { configureValidatorRegistry };

export function __resetValidatorRegistryForTests(): void {
  resetValidatorRegistryForTestsRaw();
}
