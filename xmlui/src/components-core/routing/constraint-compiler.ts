import { lookupValidator } from "../forms";
import type { RoutingDiagnostic } from "./diagnostics";

export interface CompiledConstraint {
  name: string;
  params?: unknown;
  validate: (raw: string) => boolean;
  coerce: (raw: string) => unknown;
}

export interface CompiledRoute {
  rrPath: string;
  constraints: ReadonlyMap<string, CompiledConstraint>;
  queryConstraints: ReadonlyMap<string, CompiledQueryConstraint>;
  diagnostics: ReadonlyArray<RoutingDiagnostic>;
}

const CONSTRAINED_SEGMENT = /^:([A-Za-z_][\w-]*):([A-Za-z_][\w-]*)(?:\((.*)\))?$/;
const QUERY_DECL = /^([A-Za-z_][\w-]*):([A-Za-z_][\w-]*)(?:\((.*)\))?(\?)?$/;

export interface CompiledQueryConstraint {
  key: string;
  optional: boolean;
  constraint: CompiledConstraint;
}

export function compileRoute(url: string, strict = false, queryParams?: string): CompiledRoute {
  const constraints = new Map<string, CompiledConstraint>();
  const queryConstraints = new Map<string, CompiledQueryConstraint>();
  const diagnostics: RoutingDiagnostic[] = [];
  const severity = strict ? "error" : "warn";
  const parts = String(url || "").split("/");

  const rrPath = parts
    .map((part) => {
      const match = CONSTRAINED_SEGMENT.exec(part);
      if (!match) return part;

      const [, segment, name, rawParams] = match;
      const constraint = createConstraint(name, rawParams);
      if (!constraint) {
        diagnostics.push({
          code: "unknown-constraint",
          severity,
          pageUrl: url,
          segment,
          constraint: name,
          message: `Unknown route constraint "${name}" on segment ":${segment}".`,
        });
        return `:${segment}`;
      }

      if (constraints.has(segment)) {
        diagnostics.push({
          code: "duplicate-constraint",
          severity,
          pageUrl: url,
          segment,
          constraint: name,
          message: `Duplicate route constraint for segment ":${segment}".`,
        });
      } else {
        constraints.set(segment, constraint);
      }
      return `:${segment}`;
    })
    .join("/");

  for (const queryConstraint of parseQueryConstraints(queryParams, url, severity, diagnostics)) {
    queryConstraints.set(queryConstraint.key, queryConstraint);
  }

  return { rrPath, constraints, queryConstraints, diagnostics };
}

export function validateRouteParams(
  route: CompiledRoute,
  params: Record<string, string | undefined>,
  pageUrl: string,
  strict = false,
): { ok: true; params: Record<string, unknown> } | { ok: false; diagnostic: RoutingDiagnostic } {
  const coerced: Record<string, unknown> = { ...params };
  for (const [segment, constraint] of route.constraints) {
    const raw = params[segment];
    if (raw === undefined || !constraint.validate(raw)) {
      return {
        ok: false,
        diagnostic: {
          code: "constraint-rejected",
          severity: strict ? "error" : "warn",
          pageUrl,
          segment,
          constraint: constraint.name,
          rawValue: raw,
          message: `Route parameter "${segment}" rejected by "${constraint.name}" constraint.`,
        },
      };
    }
    coerced[segment] = constraint.coerce(raw);
  }
  return { ok: true, params: coerced };
}

export function validateQueryParams(
  route: CompiledRoute,
  searchParams: URLSearchParams,
  pageUrl: string,
  strict = false,
): { ok: true; params: Record<string, unknown> } | { ok: false; diagnostic: RoutingDiagnostic } {
  const coerced: Record<string, unknown> = {};
  if (route.queryConstraints.size === 0) {
    for (const [key, value] of searchParams.entries()) {
      coerced[key] = value;
    }
    return { ok: true, params: coerced };
  }

  for (const [key, { optional, constraint }] of route.queryConstraints) {
    const raw = searchParams.get(key);
    if (raw === null || raw === "") {
      if (optional) {
        coerced[key] = undefined;
        continue;
      }
      return {
        ok: false,
        diagnostic: {
          code: "constraint-rejected",
          severity: strict ? "error" : "warn",
          pageUrl,
          segment: key,
          constraint: constraint.name,
          message: `Required query parameter "${key}" is missing.`,
        },
      };
    }
    if (!constraint.validate(raw)) {
      return {
        ok: false,
        diagnostic: {
          code: "constraint-rejected",
          severity: strict ? "error" : "warn",
          pageUrl,
          segment: key,
          constraint: constraint.name,
          rawValue: raw,
          message: `Query parameter "${key}" rejected by "${constraint.name}" constraint.`,
        },
      };
    }
    coerced[key] = constraint.coerce(raw);
  }

  if (!strict) {
    for (const [key, value] of searchParams.entries()) {
      if (!route.queryConstraints.has(key)) {
        coerced[key] = value;
      }
    }
  }

  return { ok: true, params: coerced };
}

function createConstraint(name: string, rawParams?: string): CompiledConstraint | undefined {
  switch (name) {
    case "int": {
      const range = parseNamedNumberParams(rawParams);
      return {
        name,
        params: range,
        validate: (raw) => /^-?\d+$/.test(raw) && inRange(Number(raw), range),
        coerce: (raw) => Number(raw),
      };
    }
    case "number":
      return {
        name,
        validate: (raw) => raw.trim() !== "" && Number.isFinite(Number(raw)),
        coerce: (raw) => Number(raw),
      };
    case "uuid":
      return {
        name,
        validate: (raw) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw),
        coerce: (raw) => raw.toLowerCase(),
      };
    case "slug":
      return {
        name,
        validate: (raw) => /^[a-z0-9-]+$/.test(raw),
        coerce: String,
      };
    case "bool":
      return {
        name,
        validate: (raw) => raw === "true" || raw === "false",
        coerce: (raw) => raw === "true",
      };
    case "string":
      return {
        name,
        validate: () => true,
        coerce: String,
      };
    case "enum": {
      const values = (rawParams ?? "").split(",").map((v) => v.trim()).filter(Boolean);
      return {
        name,
        params: values,
        validate: (raw) => values.includes(raw),
        coerce: String,
      };
    }
    case "length": {
      const range = parseRangeParams(rawParams);
      return {
        name,
        params: range,
        validate: (raw) => inRange(raw.length, range),
        coerce: String,
      };
    }
    case "regex": {
      const re = parseRegex(rawParams);
      if (!re) return undefined;
      return {
        name,
        params: rawParams,
        validate: (raw) => re.test(raw),
        coerce: String,
      };
    }
    default:
      return createRegistryConstraint(name, rawParams);
  }
}

/**
 * Step 1.2 — Custom constraints via the forms validator registry.
 *
 * If the constraint name is not a built-in, look it up in the shared
 * `App.registerValidator()` registry. The validator's `fn` is reused
 * synchronously: a `null` / `undefined` / `""` return means valid,
 * any string means invalid. Async (Promise-returning) validators are
 * rejected — route validation runs on the render path and cannot
 * await. Constraint parameters parse as a comma-separated list and
 * are forwarded as `{ args: [...] }`.
 */
function createRegistryConstraint(name: string, rawParams?: string): CompiledConstraint | undefined {
  const entry = lookupValidator(name);
  if (!entry) return undefined;
  const args = rawParams === undefined
    ? undefined
    : rawParams.split(",").map((part) => coerceParamValue(part.trim()));
  const params = args ? { args } : undefined;
  const ctx = { fieldName: "", formData: {} as Record<string, unknown> };
  return {
    name,
    params,
    validate: (raw) => {
      try {
        const result = entry.fn(raw, ctx, params);
        if (result && typeof (result as Promise<unknown>).then === "function") {
          return false;
        }
        return result == null || result === "";
      } catch {
        return false;
      }
    },
    coerce: String,
  };
}

function coerceParamValue(raw: string): unknown {
  if (raw === "") return raw;
  if (raw === "true") return true;
  if (raw === "false") return false;
  const n = Number(raw);
  if (raw.trim() !== "" && Number.isFinite(n)) return n;
  return raw;
}

function parseQueryConstraints(
  queryParams: string | undefined,
  pageUrl: string,
  severity: "error" | "warn",
  diagnostics: RoutingDiagnostic[],
): CompiledQueryConstraint[] {
  if (!queryParams?.trim()) return [];
  const result: CompiledQueryConstraint[] = [];
  for (const decl of splitTopLevel(queryParams)) {
    const match = QUERY_DECL.exec(decl.trim());
    if (!match) {
      diagnostics.push({
        code: "unknown-constraint",
        severity,
        pageUrl,
        constraint: decl,
        message: `Invalid query constraint declaration "${decl}".`,
      });
      continue;
    }
    const [, key, name, rawParams, optional] = match;
    const constraint = createConstraint(name, rawParams);
    if (!constraint) {
      diagnostics.push({
        code: "unknown-constraint",
        severity,
        pageUrl,
        segment: key,
        constraint: name,
        message: `Unknown query constraint "${name}" on query parameter "${key}".`,
      });
      continue;
    }
    result.push({ key, optional: optional === "?", constraint });
  }
  return result;
}

function splitTopLevel(input: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      result.push(input.slice(start, i));
      start = i + 1;
    }
  }
  result.push(input.slice(start));
  return result.filter((part) => part.trim() !== "");
}

function parseNamedNumberParams(raw?: string): { min?: number; max?: number } {
  const result: { min?: number; max?: number } = {};
  if (!raw) return result;
  for (const part of raw.split(",")) {
    const [key, value] = part.split("=").map((v) => v.trim());
    const n = Number(value);
    if ((key === "min" || key === "max") && Number.isFinite(n)) {
      result[key] = n;
    }
  }
  return result;
}

function parseRangeParams(raw?: string): { min?: number; max?: number } {
  if (!raw) return {};
  if (raw.includes("=")) return parseNamedNumberParams(raw);
  const [min, max] = raw.split(",").map((v) => Number(v.trim()));
  return {
    ...(Number.isFinite(min) ? { min } : {}),
    ...(Number.isFinite(max) ? { max } : {}),
  };
}

function inRange(value: number, range: { min?: number; max?: number }): boolean {
  if (range.min !== undefined && value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  return true;
}

function parseRegex(raw?: string): RegExp | undefined {
  if (!raw?.startsWith("/")) return undefined;
  const lastSlash = raw.lastIndexOf("/");
  if (lastSlash <= 0) return undefined;
  try {
    return new RegExp(raw.slice(1, lastSlash), raw.slice(lastSlash + 1));
  } catch {
    return undefined;
  }
}
