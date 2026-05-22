/**
 * Built-in `length` parameterised validator (Plan #9 Step 1.3).
 *
 * Usage:
 *   <FormItem validator="length" validatorParams="{{ min: 5, max: 10 }}" />
 *
 * Both bounds are optional; `min` defaults to `0`, `max` defaults to
 * `Infinity`. Operates on strings and arrays alike (`value.length`).
 * Empty values are valid — combine with `required` to enforce presence.
 */

import type { ValidatorEntry } from "../validator-registry";

const DEFAULT_MESSAGE = "Invalid length";

export interface LengthParams {
  min?: number;
  max?: number;
}

function lengthOf(value: unknown): number | undefined {
  if (typeof value === "string" || Array.isArray(value)) return value.length;
  return undefined;
}

export function isValidLength(value: unknown, params?: LengthParams): boolean {
  if (value == null || value === "") return true;
  const len = lengthOf(value);
  if (len === undefined) return false;
  const min = Number.isFinite(params?.min) ? (params!.min as number) : 0;
  const max = Number.isFinite(params?.max) ? (params!.max as number) : Number.POSITIVE_INFINITY;
  return len >= min && len <= max;
}

export const lengthValidator: ValidatorEntry = {
  name: "length",
  fn: (value, _ctx, params) => {
    if (isValidLength(value, params as LengthParams | undefined)) return null;
    const p = (params ?? {}) as LengthParams;
    if (p.min !== undefined && p.max !== undefined) {
      return `Length must be between ${p.min} and ${p.max}`;
    }
    if (p.min !== undefined) return `Length must be at least ${p.min}`;
    if (p.max !== undefined) return `Length must be at most ${p.max}`;
    return DEFAULT_MESSAGE;
  },
  defaultMessage: DEFAULT_MESSAGE,
};
