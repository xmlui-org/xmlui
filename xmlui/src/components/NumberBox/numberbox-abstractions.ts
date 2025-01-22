export const NUMBERBOX_MAX_VALUE = 999999999999999;
export const DECIMAL_SEPARATOR = ".";
export const EXPONENTIAL_SEPARATOR = "e";
export const INT_REGEXP = /^-?\d+$/;
export const FLOAT_REGEXP = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
export const DEFAULT_STEP = 1;

export type empty = null | undefined;

export function isEmptyLike(value: string | number | empty): value is empty {
  return typeof value === "undefined" || value === null || value === "";
}

export function mapToRepresentation(value: string | number | empty) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  return "";
}

export function clamp(value: number, min: number, max: number) {
  let clamped = value;
  if (value < min) clamped = min;
  if (value > max) clamped = max;
  return clamped;
}

export function toUsableNumber(value: string | number | empty, isInteger = false): number | empty {
  const isUsable = isInteger ? isUsableInteger : isUsableFloat;
  if (!isUsable(value)) return null;

  if (typeof value === "string") {
    value = isInteger ? Number.parseInt(value) : +value;
  }

  return value;
}

/**
 * Check whether the input value is a usable number for operations.
 * Passes if it's of type number or a non-empty string that evaluates to a number.
 */
function isUsableFloat(value: string | number | empty) {
  if (typeof value === "string" && value.length > 0) {
    return !Number.isNaN(+value) && naiveFloatBounding(value);
  }
  return typeof value === "number";
}

// TEMP
// Rounding and arithmetic with large floats is a hassle if loss of precision is apparent.
// Just bound the incoming floating point value to the max value available.
// This is an edge case but makes it so that we stay consistent and can do arithmetic with the spinner box.
function naiveFloatBounding(value: string) {
  const integerPart = value.split(".")[0];
  return Math.abs(Number.parseInt(integerPart)) <= NUMBERBOX_MAX_VALUE;
}

/**
 * Check whether the input value is a usable integer for operations.
 * Passes if it's of type number and is an integer
 * or a non-empty string that evaluates to an integer.
 */
function isUsableInteger(value: string | number | empty) {
  if (
    typeof value === "string" &&
    value.length > 0 &&
    ![EXPONENTIAL_SEPARATOR, DECIMAL_SEPARATOR].some((item) => value.includes(item))
  ) {
    return Number.isSafeInteger(+value);
  } else if (typeof value === "number") {
    return Number.isSafeInteger(value);
  }
  return false;
}
