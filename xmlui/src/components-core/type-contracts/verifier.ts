/**
 * Type-contract verifier.
 *
 * `verifyComponentDef()` walks a `ComponentDef` tree with the registry in
 * hand and produces `TypeContractDiagnostic` entries for contract
 * violations. The function is **pure and synchronous** — no I/O, no React,
 * no console output. Callers (LSP, Vite plugin, runtime warn-mode) decide
 * what to do with the results.
 *
 * Phase 2 (W3-2) fills in the full per-component checks:
 *   - `missing-required`   required prop absent from the def
 *   - `unknown-prop`       prop not declared in metadata (Levenshtein hint)
 *   - `wrong-type`         literal value fails the declared `valueType` rule
 *   - `value-not-in-enum`  literal value outside the `availableValues` set
 *   - `unknown-event`      event not declared in metadata
 *   - `deprecated-prop`    prop carries a `deprecationMessage`
 *
 * Expression-valued props (`value="{state.x}"`) are skipped for type/enum
 * checks because the resolved value is not known until runtime.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md` Phase 2 §2.1.
 */

import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import { MediaBreakpointKeys } from "../../abstractions/AppContextDefs";
import { layoutOptionKeys } from "../descriptorHelper";
import { verifyValue } from "./rules/coerce";
import { verifyEnum } from "./rules/enum";
import { findSuggestion } from "./suggestions";
import type { TypeContractDiagnostic } from "./diagnostics";

export interface VerifyOptions {
  /**
   * When `true`, contract violations escalate from `warn` to `error`.
   * Controlled by `App.appGlobals.strictTypeContracts`.
   */
  strict?: boolean;
  /**
   * When `true`, components not found in the registry are silently skipped
   * (no `unknown-component` diagnostic).
   */
  skipUnknown?: boolean;
}

/**
 * Verify a component-def tree against the component registry.
 *
 * @param def       Root `ComponentDef` to walk.
 * @param registry  Map from component type name to `ComponentMetadata`.
 * @param opts      Optional verification configuration.
 * @returns         Flat array of diagnostics, sorted by line then column.
 */
export function verifyComponentDef(
  def: ComponentDef,
  registry: ReadonlyMap<string, ComponentMetadata>,
  opts?: VerifyOptions,
): TypeContractDiagnostic[] {
  const { strict = false, skipUnknown = false } = opts ?? {};
  const severity: "error" | "warn" = strict ? "error" : "warn";

  const diagnostics: TypeContractDiagnostic[] = [];

  visit(def);

  diagnostics.sort(byRange);
  return diagnostics;

  function visit(node: ComponentDef | undefined): void {
    if (!node || typeof node !== "object") return;
    const typeName = node.type;

    if (typeof typeName !== "string" || typeName.length === 0) {
      recurse(node);
      return;
    }

    const meta = registry.get(typeName);

    if (!meta) {
      if (!skipUnknown && !isFrameworkType(typeName)) {
        diagnostics.push({
          code: "unknown-component",
          severity,
          componentName: typeName,
          range: extractRange(node),
          message: `Unknown component <${typeName}>: not registered.`,
        });
      }
      recurse(node);
      return;
    }

    // ─── Per-prop checks ────────────────────────────────────────────────────

    const metaProps = meta.props ?? {};
    const defProps = (node.props ?? {}) as Record<string, unknown>;

    // 1. missing-required: props declared isRequired that are absent from the def
    for (const [propName, propMeta] of Object.entries(metaProps)) {
      if (propMeta.isRequired && !(propName in defProps)) {
        diagnostics.push({
          code: "missing-required",
          severity,
          componentName: typeName,
          propName,
          expected: propMeta.valueType ?? "any",
          range: extractRange(node),
          message: `<${typeName}> is missing required prop "${propName}".`,
        });
      }
    }

    // Per-def-prop checks: unknown-prop, wrong-type, value-not-in-enum, deprecated-prop
    const knownPropNames = Object.keys(metaProps);
    for (const [propName, rawValue] of Object.entries(defProps)) {
      const propMeta = metaProps[propName];

      if (!propMeta) {
        // Not in metadata — acceptable if it is a layout option or the component
        // allows arbitrary props.
        if (!isKnownLayoutProp(propName) && !meta.allowArbitraryProps) {
          const suggestion = findSuggestion(propName, knownPropNames);
          diagnostics.push({
            code: "unknown-prop",
            severity,
            componentName: typeName,
            propName,
            range: extractRange(node),
            message: `<${typeName}> has unknown prop "${propName}".`,
            ...(suggestion !== undefined ? { suggestion } : {}),
          });
        }
        continue;
      }

      // deprecated-prop: always warn regardless of strict mode
      if (propMeta.deprecationMessage) {
        diagnostics.push({
          code: "deprecated-prop",
          severity: "warn",
          componentName: typeName,
          propName,
          range: extractRange(node),
          message: `Prop "${propName}" on <${typeName}> is deprecated: ${propMeta.deprecationMessage}`,
        });
      }

      // Skip type and enum checks for expression-valued props — value is unknown
      // until runtime.
      if (isExpressionValue(rawValue)) continue;

      // value-not-in-enum: checked before wrong-type (more specific)
      if (propMeta.availableValues && propMeta.availableValues.length > 0) {
        const enumFailure = verifyEnum(rawValue, propMeta.availableValues);
        if (enumFailure) {
          diagnostics.push({
            code: "value-not-in-enum",
            severity,
            componentName: typeName,
            propName,
            expected: enumFailure.expected,
            actual: rawValue != null ? String(rawValue) : undefined,
            range: extractRange(node),
            message: `<${typeName}> prop "${propName}": ${enumFailure.message}`,
          });
          continue; // enum failure subsumes type failure for the same value
        }
      }

      // wrong-type: literal value against the declared valueType
      if (propMeta.valueType && propMeta.valueType !== "any") {
        const typeFailure = verifyValue(propMeta.valueType, rawValue);
        if (typeFailure) {
          diagnostics.push({
            code: "wrong-type",
            severity,
            componentName: typeName,
            propName,
            expected: typeFailure.expected ?? propMeta.valueType,
            actual: rawValue != null ? String(rawValue) : undefined,
            range: extractRange(node),
            message: `<${typeName}> prop "${propName}": ${typeFailure.message}`,
          });
        }
      }
    }

    // ─── Per-event checks ───────────────────────────────────────────────────

    const metaEvents = meta.events ?? {};
    const defEvents = (node.events ?? {}) as Record<string, unknown>;
    for (const eventName of Object.keys(defEvents)) {
      if (!(eventName in metaEvents)) {
        diagnostics.push({
          code: "unknown-event",
          severity,
          componentName: typeName,
          propName: eventName,
          range: extractRange(node),
          message: `<${typeName}> has unknown event "${eventName}".`,
        });
      }
    }

    recurse(node);
  }

  function recurse(node: ComponentDef): void {
    const children = (node as any).children;
    if (Array.isArray(children)) {
      for (const child of children) visit(child);
    } else if (children && typeof children === "object") {
      visit(children as ComponentDef);
    }
  }
}

/**
 * Framework-level type names that should never be flagged as unknown
 * (mirrors the analyzer's `id-unknown-component` allowlist).
 */
const FRAMEWORK_TYPES: ReadonlySet<string> = new Set([
  "Component",
  "Fragment",
  "#text",
  "#comment",
  "#cdata-section",
]);

function isFrameworkType(name: string): boolean {
  return FRAMEWORK_TYPES.has(name);
}

/**
 * Return `true` when `propName` is a layout option (e.g. `"width"`) or a
 * responsive variant of one (e.g. `"width-md"`).  These props are injected
 * by the layout engine and are not declared in component metadata.
 */
function isKnownLayoutProp(propName: string): boolean {
  if (layoutOptionKeys.includes(propName)) return true;
  // Handle responsive variants like "width-md", "height-xs"
  const dashIdx = propName.lastIndexOf("-");
  if (dashIdx > 0) {
    const base = propName.slice(0, dashIdx);
    const suffix = propName.slice(dashIdx + 1);
    if (
      layoutOptionKeys.includes(base) &&
      (MediaBreakpointKeys as readonly string[]).includes(suffix)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Return `true` when the prop value contains at least one `{...}` binding
 * expression, meaning its resolved value is not known until runtime.
 *
 * A simple regex test is intentionally used here instead of the full
 * `parseParameterString` to keep the verifier dependency-free from the
 * scripting parser.  The check is conservative: any value that *looks like*
 * it might contain a binding expression is left for runtime verification.
 */
function isExpressionValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /\{[^}]+\}/.test(value);
}

function extractRange(node: any): TypeContractDiagnostic["range"] {
  const sourceRange = node?.__SOURCE_RANGE ?? node?.__SOURCE;
  if (!sourceRange) return undefined;
  if (
    typeof sourceRange.line === "number" &&
    typeof sourceRange.col === "number"
  ) {
    return {
      line: sourceRange.line,
      col: sourceRange.col,
      length: sourceRange.length,
    };
  }
  return undefined;
}

function byRange(a: TypeContractDiagnostic, b: TypeContractDiagnostic): number {
  const al = a.range?.line ?? 0;
  const bl = b.range?.line ?? 0;
  if (al !== bl) return al - bl;
  const ac = a.range?.col ?? 0;
  const bc = b.range?.col ?? 0;
  return ac - bc;
}
