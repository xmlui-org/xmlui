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
  diagnostics: ReadonlyArray<RoutingDiagnostic>;
}

const CONSTRAINED_SEGMENT = /^:([A-Za-z_][\w-]*):([A-Za-z_][\w-]*)(?:\((.*)\))?$/;

export function compileRoute(url: string, strict = false): CompiledRoute {
  const constraints = new Map<string, CompiledConstraint>();
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

  return { rrPath, constraints, diagnostics };
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
      return undefined;
  }
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
