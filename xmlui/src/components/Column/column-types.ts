export const COLUMN_TYPE_NAMES = [
  "text",
  "short-text",
  "long-text",
  "markdown",
  "code",
  "json",
  "email",
  "phone",
  "url",
  "uuid",
  "id",
  "name",
  "address",
  "color",
  "number",
  "integer",
  "decimal",
  "percent",
  "currency",
  "accounting",
  "scientific",
  "bytes",
  "duration",
  "rating",
  "date",
  "time",
  "datetime",
  "relative-time",
  "timestamp",
  "iso-date",
  "boolean",
  "checkbox",
  "yes-no",
  "status",
  "enum",
  "tag",
  "tags",
  "image",
  "avatar",
  "icon",
  "link",
  "object",
  "array",
  "list",
] as const;

export type ColumnTypeName = (typeof COLUMN_TYPE_NAMES)[number];

export type ColumnTypeSource = "explicit" | "inferred" | "fallback";

export type ColumnTypeDiagnosticCode =
  | "empty-type"
  | "invalid-type-value"
  | "unknown-type"
  | "malformed-arguments"
  | "unsupported-arguments"
  | "invalid-argument"
  | "invalid-type-options";

export type ColumnTypeDiagnostic = {
  code: ColumnTypeDiagnosticCode;
  message: string;
  input?: unknown;
  argument?: string;
};

export type NormalizedColumnType = {
  name: ColumnTypeName;
  args?: unknown[];
  options?: Record<string, unknown>;
  source: ColumnTypeSource;
};

export type NormalizeColumnTypeResult = {
  type: NormalizedColumnType;
  diagnostics: ColumnTypeDiagnostic[];
};

type ParsedArgument =
  | {
      kind: "positional";
      value: unknown;
      raw: string;
    }
  | {
      kind: "named";
      name: string;
      value: unknown;
      raw: string;
    };

const SUPPORTED_COLUMN_TYPES = new Set<string>(COLUMN_TYPE_NAMES);
const DATE_TIME_STYLES = new Set(["short", "medium", "long", "full"]);

export function isColumnTypeName(value: string): value is ColumnTypeName {
  return SUPPORTED_COLUMN_TYPES.has(value);
}

export function normalizeColumnType(
  rawType: unknown,
  rawTypeOptions?: unknown,
  source: Exclude<ColumnTypeSource, "fallback"> = "explicit",
): NormalizeColumnTypeResult {
  const diagnostics: ColumnTypeDiagnostic[] = [];
  let typeOptionsEvaluated = false;
  let typeOptions: Pick<NormalizedColumnType, "options"> | undefined;
  const getTypeOptions = () => {
    if (!typeOptionsEvaluated) {
      typeOptions = normalizedTypeOptions(rawTypeOptions, diagnostics);
      typeOptionsEvaluated = true;
    }
    return typeOptions;
  };
  const fallback = (): NormalizedColumnType => ({
    name: "text",
    source: "fallback",
    ...(getTypeOptions() ?? {}),
  });

  if (rawType === undefined || rawType === null) {
    return {
      type: {
        name: "text",
        source: "fallback",
        ...(getTypeOptions() ?? {}),
      },
      diagnostics,
    };
  }

  if (typeof rawType !== "string") {
    diagnostics.push({
      code: "invalid-type-value",
      message: "Column type must be a string.",
      input: rawType,
    });
    return { type: fallback(), diagnostics };
  }

  const trimmedType = rawType.trim();
  if (!trimmedType) {
    diagnostics.push({
      code: "empty-type",
      message: "Column type cannot be empty.",
      input: rawType,
    });
    return { type: fallback(), diagnostics };
  }

  const parsed = parseTypeExpression(trimmedType);
  if (!parsed.ok) {
    diagnostics.push({
      code: "malformed-arguments",
      message: parsed.message,
      input: rawType,
    });
    return { type: fallback(), diagnostics };
  }

  const name = parsed.name.toLowerCase();
  if (!isColumnTypeName(name)) {
    diagnostics.push({
      code: "unknown-type",
      message: `Unknown column type '${parsed.name}'.`,
      input: rawType,
    });
    return { type: fallback(), diagnostics };
  }

  const normalized: NormalizedColumnType = {
    name,
    source,
  };

  const argsResult = normalizeArguments(name, parsed.arguments, rawType);
  diagnostics.push(...argsResult.diagnostics);
  if (argsResult.args.length > 0) {
    normalized.args = argsResult.args;
  }
  const optionEntries = {
    ...argsResult.options,
    ...(getTypeOptions()?.options ?? {}),
  };
  if (Object.keys(optionEntries).length > 0) {
    normalized.options = optionEntries;
  }

  if (argsResult.shouldFallback) {
    return { type: fallback(), diagnostics };
  }

  return { type: normalized, diagnostics };
}

function normalizedTypeOptions(
  rawTypeOptions: unknown,
  diagnostics: ColumnTypeDiagnostic[],
): Pick<NormalizedColumnType, "options"> | undefined {
  if (rawTypeOptions === undefined || rawTypeOptions === null) {
    return undefined;
  }
  if (
    typeof rawTypeOptions !== "object" ||
    Array.isArray(rawTypeOptions) ||
    rawTypeOptions instanceof Date
  ) {
    diagnostics.push({
      code: "invalid-type-options",
      message: "Column typeOptions must be an object.",
      input: rawTypeOptions,
    });
    return undefined;
  }
  return {
    options: { ...(rawTypeOptions as Record<string, unknown>) },
  };
}

function parseTypeExpression(input: string):
  | {
      ok: true;
      name: string;
      arguments: ParsedArgument[];
    }
  | {
      ok: false;
      message: string;
    } {
  const match = /^([A-Za-z][A-Za-z0-9-]*)(?:\((.*)\))?$/.exec(input);
  if (!match) {
    return { ok: false, message: "Column type must use the form 'name' or 'name(args)'." };
  }

  const [, name, rawArguments] = match;
  if (rawArguments === undefined) {
    return { ok: true, name, arguments: [] };
  }
  if (rawArguments.trim() === "") {
    return { ok: false, message: "Column type argument list cannot be empty." };
  }
  if (/[()]/.test(rawArguments)) {
    return { ok: false, message: "Column type arguments cannot contain nested parentheses." };
  }

  const parts = rawArguments.split(",");
  if (parts.some((part) => part.trim() === "")) {
    return { ok: false, message: "Column type arguments cannot be empty." };
  }

  const args: ParsedArgument[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex >= 0) {
      const argName = trimmed.slice(0, colonIndex).trim();
      const argValue = trimmed.slice(colonIndex + 1).trim();
      if (!isIdentifier(argName) || !argValue) {
        return { ok: false, message: `Invalid named argument '${trimmed}'.` };
      }
      args.push({
        kind: "named",
        name: argName,
        value: parseArgumentValue(argValue),
        raw: trimmed,
      });
    } else {
      args.push({
        kind: "positional",
        value: parseArgumentValue(trimmed),
        raw: trimmed,
      });
    }
  }

  const hasNamed = args.some((arg) => arg.kind === "named");
  const hasPositional = args.some((arg) => arg.kind === "positional");
  if (hasNamed && hasPositional) {
    return {
      ok: false,
      message: "Column type arguments cannot mix positional and named syntax.",
    };
  }

  return { ok: true, name, arguments: args };
}

function normalizeArguments(
  typeName: ColumnTypeName,
  args: ParsedArgument[],
  input: unknown,
): {
  args: unknown[];
  options: Record<string, unknown>;
  diagnostics: ColumnTypeDiagnostic[];
  shouldFallback: boolean;
} {
  const diagnostics: ColumnTypeDiagnostic[] = [];
  const normalizedArgs: unknown[] = [];
  const options: Record<string, unknown> = {};

  if (args.length === 0) {
    return { args: normalizedArgs, options, diagnostics, shouldFallback: false };
  }

  if (args.every((arg) => arg.kind === "named")) {
    for (const arg of args) {
      if (arg.kind === "named") {
        if (Object.prototype.hasOwnProperty.call(options, arg.name)) {
          diagnostics.push({
            code: "invalid-argument",
            message: `Duplicate column type argument '${arg.name}'.`,
            input,
            argument: arg.name,
          });
          continue;
        }
        options[arg.name] = arg.value;
      }
    }
    return { args: normalizedArgs, options, diagnostics, shouldFallback: false };
  }

  const positional = args
    .filter(
      (arg): arg is Extract<ParsedArgument, { kind: "positional" }> => arg.kind === "positional",
    )
    .map((arg) => arg.value);

  switch (typeName) {
    case "number": {
      if (positional.length !== 2) {
        return invalidArgumentCount(typeName, input, diagnostics);
      }
      const precision = asNonNegativeInteger(positional[0]);
      const scale = asNonNegativeInteger(positional[1]);
      if (precision === undefined || precision === 0 || scale === undefined || scale > precision) {
        diagnostics.push({
          code: "invalid-argument",
          message:
            "number(p,s) expects positive integer precision and non-negative integer scale where scale <= precision.",
          input,
        });
        return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
      }
      normalizedArgs.push(precision, scale);
      options.precision = precision;
      options.scale = scale;
      break;
    }
    case "decimal": {
      if (positional.length !== 1) {
        return invalidArgumentCount(typeName, input, diagnostics);
      }
      const scale = asNonNegativeInteger(positional[0]);
      if (scale === undefined) {
        diagnostics.push({
          code: "invalid-argument",
          message: "decimal(s) expects a non-negative integer scale.",
          input,
        });
        return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
      }
      normalizedArgs.push(scale);
      options.scale = scale;
      break;
    }
    case "currency":
    case "accounting": {
      if (positional.length !== 1 || typeof positional[0] !== "string") {
        return invalidArgumentCount(typeName, input, diagnostics);
      }
      const currency = positional[0].toUpperCase();
      if (!/^[A-Z]{3}$/.test(currency)) {
        diagnostics.push({
          code: "invalid-argument",
          message: `${typeName}(code) expects a three-letter currency code.`,
          input,
        });
        return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
      }
      normalizedArgs.push(currency);
      options.currency = currency;
      break;
    }
    case "rating": {
      if (positional.length !== 1) {
        return invalidArgumentCount(typeName, input, diagnostics);
      }
      const max = asPositiveNumber(positional[0]);
      if (max === undefined) {
        diagnostics.push({
          code: "invalid-argument",
          message: "rating(max) expects a positive number.",
          input,
        });
        return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
      }
      normalizedArgs.push(max);
      options.max = max;
      break;
    }
    case "date":
    case "time":
    case "datetime": {
      if (positional.length !== 1 || typeof positional[0] !== "string") {
        return invalidArgumentCount(typeName, input, diagnostics);
      }
      const style = positional[0].toLowerCase();
      if (!DATE_TIME_STYLES.has(style)) {
        diagnostics.push({
          code: "invalid-argument",
          message: `${typeName}(style) expects one of: short, medium, long, full.`,
          input,
        });
        return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
      }
      normalizedArgs.push(style);
      options.style = style;
      break;
    }
    case "id": {
      if (positional.length !== 1 || typeof positional[0] !== "string") {
        return invalidArgumentCount(typeName, input, diagnostics);
      }
      const mode = positional[0].toLowerCase();
      if (mode !== "short" && mode !== "full") {
        diagnostics.push({
          code: "invalid-argument",
          message: "id(mode) expects 'short' or 'full'.",
          input,
        });
        return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
      }
      normalizedArgs.push(mode);
      options.mode = mode;
      break;
    }
    default:
      diagnostics.push({
        code: "unsupported-arguments",
        message: `Column type '${typeName}' does not support positional arguments.`,
        input,
      });
      return { args: normalizedArgs, options, diagnostics, shouldFallback: true };
  }

  return { args: normalizedArgs, options, diagnostics, shouldFallback: false };
}

function invalidArgumentCount(
  typeName: ColumnTypeName,
  input: unknown,
  diagnostics: ColumnTypeDiagnostic[],
) {
  diagnostics.push({
    code: "invalid-argument",
    message: `Invalid argument count for column type '${typeName}'.`,
    input,
  });
  return { args: [], options: {}, diagnostics, shouldFallback: true };
}

function parseArgumentValue(raw: string): unknown {
  const trimmed = raw.trim();
  const quoted = /^(['"])(.*)\1$/.exec(trimmed);
  if (quoted) {
    return quoted[2];
  }
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed;
}

function isIdentifier(value: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(value);
}

function asNonNegativeInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined;
}

function asPositiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}
