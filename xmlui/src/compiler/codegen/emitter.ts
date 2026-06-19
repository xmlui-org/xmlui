export type EmitJsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | EmitRawJs
  | readonly EmitJsValue[]
  | { readonly [key: string]: EmitJsValue };

export type EmitRawJs = {
  readonly kind: "raw-js";
  readonly code: string;
};

export type EmitImport = {
  readonly localName: string;
  readonly specifier: string;
};

export function rawJs(code: string): EmitRawJs {
  return {
    kind: "raw-js",
    code,
  };
}

export function emitImports(imports: readonly EmitImport[]): string {
  return imports
    .map((item) => `import ${item.localName} from ${JSON.stringify(item.specifier)};`)
    .join("\n");
}

export function emitIdentifier(base: string, used: ReadonlySet<string> = new Set()): string {
  const normalized = normalizeIdentifier(base);
  if (!used.has(normalized)) {
    return normalized;
  }
  let index = 1;
  while (used.has(`${normalized}${index}`)) {
    index++;
  }
  return `${normalized}${index}`;
}

export function emitFunctionExpression(
  body: string,
  parameter = "ctx",
  options: { async?: boolean } = {},
): string {
  const asyncKeyword = options.async ? "async " : "";
  return `${asyncKeyword}(${parameter}) => {\n${indent(body, 1)}\n}`;
}

export function emitValue(value: EmitJsValue, level = 0): string {
  if (isRawJs(value)) {
    return value.code;
  }
  if (value === undefined) {
    return "undefined";
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (isEmitArray(value)) {
    return emitArray(value, level);
  }
  return emitObject(value, level);
}

export function indent(text: string, level = 1): string {
  const prefix = spaces(level);
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function emitArray(value: readonly EmitJsValue[], level: number): string {
  if (value.length === 0) {
    return "[]";
  }
  return `[\n${value
    .map((item) => `${spaces(level + 1)}${emitValue(item, level + 1)}`)
    .join(",\n")}\n${spaces(level)}]`;
}

function emitObject(value: { readonly [key: string]: EmitJsValue }, level: number): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
  if (entries.length === 0) {
    return "{}";
  }
  return `{\n${entries
    .map(([key, entryValue]) => `${spaces(level + 1)}${JSON.stringify(key)}: ${emitValue(entryValue, level + 1)}`)
    .join(",\n")}\n${spaces(level)}}`;
}

function isRawJs(value: EmitJsValue): value is EmitRawJs {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "kind" in value && value.kind === "raw-js");
}

function isEmitArray(value: EmitJsValue): value is readonly EmitJsValue[] {
  return Array.isArray(value);
}

function normalizeIdentifier(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9_$]/g, "_");
  const withInitial = /^[A-Za-z_$]/.test(normalized) ? normalized : `_${normalized}`;
  return withInitial || "_";
}

function spaces(level: number): string {
  return "  ".repeat(level);
}
