import type { OurColumnMetadata } from "../Column/TableContext";

export const DEFAULT_COLUMN_INFERENCE = "first-n(25)";

export type ColumnInferenceModeName =
  | "first-only"
  | "first-n"
  | "sample"
  | "all"
  | "non-null-first"
  | "until-stable"
  | "visible-page"
  | "schema-only"
  | "off";

export type ColumnInferenceMode = {
  name: ColumnInferenceModeName;
  count?: number;
};

export type ColumnInferenceDiagnosticCode =
  | "invalid-mode-value"
  | "unknown-mode"
  | "malformed-mode"
  | "invalid-count";

export type ColumnInferenceDiagnostic = {
  code: ColumnInferenceDiagnosticCode;
  message: string;
  input?: unknown;
};

export type ParseColumnInferenceResult = {
  mode: ColumnInferenceMode;
  diagnostics: ColumnInferenceDiagnostic[];
};

const DEFAULT_MODE: ColumnInferenceMode = {
  name: "first-n",
  count: 25,
};

const BARE_MODES = new Set<ColumnInferenceModeName>([
  "first-only",
  "all",
  "non-null-first",
  "visible-page",
  "schema-only",
  "off",
]);

const COUNTED_MODES = new Set<ColumnInferenceModeName>(["first-n", "sample", "until-stable"]);
const EXCLUDED_INFERRED_FIELDS = new Set(["order"]);

export function parseColumnInference(value: unknown): ParseColumnInferenceResult {
  const diagnostics: ColumnInferenceDiagnostic[] = [];

  if (value === undefined || value === null || value === "") {
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  if (typeof value !== "string") {
    diagnostics.push({
      code: "invalid-mode-value",
      message: "Table columnInference must be a string.",
      input: value,
    });
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  const input = value.trim();
  if (!input) {
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  const match = /^([A-Za-z][A-Za-z0-9-]*)(?:\((.*)\))?$/.exec(input);
  if (!match) {
    diagnostics.push({
      code: "malformed-mode",
      message: "Table columnInference must use the form 'mode' or 'mode(count)'.",
      input: value,
    });
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  const modeName = match[1].toLowerCase() as ColumnInferenceModeName;
  const rawCount = match[2];

  if (!BARE_MODES.has(modeName) && !COUNTED_MODES.has(modeName)) {
    diagnostics.push({
      code: "unknown-mode",
      message: `Unknown Table columnInference mode '${match[1]}'.`,
      input: value,
    });
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  if (BARE_MODES.has(modeName)) {
    if (rawCount !== undefined) {
      diagnostics.push({
        code: "invalid-count",
        message: `Table columnInference mode '${modeName}' does not accept a count.`,
        input: value,
      });
      return { mode: { ...DEFAULT_MODE }, diagnostics };
    }
    return { mode: { name: modeName }, diagnostics };
  }

  if (rawCount === undefined || rawCount.trim() === "") {
    diagnostics.push({
      code: "invalid-count",
      message: `Table columnInference mode '${modeName}' requires a positive integer count.`,
      input: value,
    });
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  const count = Number(rawCount.trim());
  if (!Number.isInteger(count) || count <= 0) {
    diagnostics.push({
      code: "invalid-count",
      message: `Table columnInference mode '${modeName}' requires a positive integer count.`,
      input: value,
    });
    return { mode: { ...DEFAULT_MODE }, diagnostics };
  }

  return { mode: { name: modeName, count }, diagnostics };
}

export function sampleRowsForColumnInference<T>(
  rows: readonly T[],
  modeOrValue?: ColumnInferenceMode | unknown,
  visibleRows?: readonly T[],
): T[] {
  const mode =
    typeof modeOrValue === "object" &&
    modeOrValue !== null &&
    "name" in modeOrValue &&
    typeof (modeOrValue as ColumnInferenceMode).name === "string"
      ? (modeOrValue as ColumnInferenceMode)
      : parseColumnInference(modeOrValue).mode;

  switch (mode.name) {
    case "off":
    case "schema-only":
      return [];
    case "first-only":
      return rows.length > 0 ? [rows[0]] : [];
    case "first-n":
      return rows.slice(0, mode.count ?? DEFAULT_MODE.count);
    case "all":
    case "non-null-first":
    case "until-stable":
      return rows.slice();
    case "sample":
      return deterministicSample(rows, mode.count ?? DEFAULT_MODE.count);
    case "visible-page":
      return visibleRows ? visibleRows.slice() : rows.slice();
    default:
      return rows.slice(0, DEFAULT_MODE.count);
  }
}

export function discoverColumnFields(
  rows: readonly unknown[],
  modeOrValue?: ColumnInferenceMode | unknown,
): string[] {
  const sampledRows = sampleRowsForColumnInference(rows, modeOrValue);
  const fields: string[] = [];
  const seen = new Set<string>();

  for (const row of sampledRows) {
    if (!isPlainRecord(row)) {
      continue;
    }
    for (const key of Object.keys(row)) {
      if (EXCLUDED_INFERRED_FIELDS.has(key) || seen.has(key)) {
        continue;
      }
      seen.add(key);
      fields.push(key);
    }
  }

  return fields;
}

export function buildInferredColumns(
  rows: readonly unknown[],
  modeOrValue?: ColumnInferenceMode | unknown,
): OurColumnMetadata[] {
  return discoverColumnFields(rows, modeOrValue).map((field) => ({
    header: field,
    accessorKey: field,
    canSort: true,
  }));
}

function deterministicSample<T>(rows: readonly T[], count: number): T[] {
  if (count <= 0 || rows.length === 0) {
    return [];
  }
  if (rows.length <= count) {
    return rows.slice();
  }
  if (count === 1) {
    return [rows[0]];
  }

  const indexes = new Set<number>();
  const lastIndex = rows.length - 1;
  for (let i = 0; i < count; i++) {
    indexes.add(Math.round((i * lastIndex) / (count - 1)));
  }

  return [...indexes].sort((a, b) => a - b).map((index) => rows[index]);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
