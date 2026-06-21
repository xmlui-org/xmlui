export const NUMBERBOX_MAX_VALUE = 999999999999999;
export const DECIMAL_SEPARATOR = ".";
export const EXPONENTIAL_SEPARATOR = "e";
export const INT_REGEXP = /^-?\d+$/;
export const FLOAT_REGEXP = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
export const DEFAULT_STEP = 1;

export type EmptyNumberValue = null | undefined | "";

export function isEmptyLike(value: unknown): value is EmptyNumberValue {
  return value === undefined || value === null || value === "";
}

export function mapToRepresentation(value: unknown): string {
  if (isEmptyLike(value)) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  if (typeof value === "string") {
    return isRepresentableNumberString(value) ? value : "";
  }
  return "";
}

export function toUsableNumber(value: unknown, integerOnly = false): number | null {
  if (!isUsableNumber(value, integerOnly)) {
    return null;
  }
  return typeof value === "number"
    ? value
    : integerOnly
      ? Number.parseInt(String(value), 10)
      : Number(value);
}

export function isUsableNumber(value: unknown, integerOnly = false): boolean {
  if (typeof value === "number") {
    return integerOnly ? Number.isSafeInteger(value) : Number.isFinite(value);
  }
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  if (integerOnly) {
    return INT_REGEXP.test(value) && Number.isSafeInteger(Number(value));
  }
  return !Number.isNaN(Number(value)) && naiveFloatBounding(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeNumberInput(value: string, integerOnly: boolean, zeroOrPositive: boolean): string {
  let next = value.replace(/,/g, "");
  next = next.replace(/[^\d.eE+-]/g, "");
  next = next.replace(/E/g, EXPONENTIAL_SEPARATOR);
  if (integerOnly) {
    next = next.split(/[.eE]/)[0] ?? "";
  }
  if (zeroOrPositive) {
    next = next.replace(/-/g, "");
  } else {
    next = normalizeMinusSigns(next);
  }
  next = normalizePlusSigns(next);
  next = normalizeDecimalSeparators(next, integerOnly);
  next = normalizeExponentSeparators(next, integerOnly);
  return next;
}

export function applyStep(
  currentValue: string,
  step: number,
  min: number,
  max: number,
  integerOnly: boolean,
): number | undefined {
  const current = toUsableNumber(currentValue, integerOnly) ?? 0;
  const precision = Math.max(decimalPlaces(currentValue), decimalPlaces(String(step)));
  const scale = 10 ** precision;
  const rounded = Math.round((current + step) * scale) / scale;
  const next = clamp(rounded, min, max);
  return integerOnly ? Math.trunc(next) : next;
}

function isRepresentableNumberString(value: string): boolean {
  return value === "" ||
    value === "-" ||
    FLOAT_REGEXP.test(value) ||
    INT_REGEXP.test(value) ||
    /^-?\d*\.?\d*([eE][+-]?\d*)?$/.test(value);
}

function naiveFloatBounding(value: string): boolean {
  const integerPart = value.split(".")[0] ?? "";
  return Math.abs(Number.parseInt(integerPart, 10) || 0) <= NUMBERBOX_MAX_VALUE;
}

function normalizeMinusSigns(value: string): string {
  const negative = value.startsWith("-");
  let next = negative ? value.slice(1) : value;
  const exponentIndex = next.toLowerCase().indexOf(EXPONENTIAL_SEPARATOR);
  let exponentNegative = false;
  if (exponentIndex >= 0) {
    const afterExponent = next.slice(exponentIndex + 1);
    exponentNegative = afterExponent.startsWith("-");
  }
  next = next.replace(/-/g, "");
  if (exponentIndex >= 0 && exponentNegative) {
    next = `${next.slice(0, exponentIndex + 1)}-${next.slice(exponentIndex + 1)}`;
  }
  return negative ? `-${next}` : next;
}

function normalizePlusSigns(value: string): string {
  return value.replace(/\+/g, "");
}

function normalizeDecimalSeparators(value: string, integerOnly: boolean): string {
  if (integerOnly) {
    return value.replace(/\./g, "");
  }
  const first = value.indexOf(".");
  if (first < 0) {
    return value;
  }
  return `${value.slice(0, first + 1)}${value.slice(first + 1).replace(/\./g, "")}`;
}

function normalizeExponentSeparators(value: string, integerOnly: boolean): string {
  if (integerOnly) {
    return value.replace(/[eE]/g, "");
  }
  const first = value.indexOf(EXPONENTIAL_SEPARATOR);
  if (first < 0) {
    return value;
  }
  return `${value.slice(0, first + 1)}${value.slice(first + 1).replace(/[eE]/g, "")}`;
}

function decimalPlaces(value: string): number {
  const normalized = value.toLowerCase();
  if (normalized.includes("e")) {
    const numberValue = Number(normalized);
    return Number.isFinite(numberValue) ? decimalPlaces(String(numberValue)) : 0;
  }
  const fraction = normalized.split(".")[1];
  return fraction?.length ?? 0;
}
