/**
 * Type-contract verifier (skeleton).
 *
 * `verifyComponentDef()` walks a `ComponentDef` tree with the registry in
 * hand and produces `TypeContractDiagnostic` entries for contract
 * violations. The function is **pure and synchronous** — no I/O, no React,
 * no console output. Callers (LSP, Vite plugin, runtime warn-mode) decide
 * what to do with the results.
 *
 * Step 0 ships only the skeleton:
 *   - The function signature is final.
 *   - The only check performed today is the `unknown-component` check
 *     (controlled by `opts.skipUnknown`).
 *   - The full per-component prop / event / value checks land in Step 2.1.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md` Phases 1–2.
 */

import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
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
    if (typeof typeName === "string" && typeName.length > 0) {
      const meta = registry.get(typeName);
      if (!meta && !skipUnknown && !isFrameworkType(typeName)) {
        diagnostics.push({
          code: "unknown-component",
          severity,
          componentName: typeName,
          range: extractRange(node),
          message: `Unknown component <${typeName}>: not registered.`,
        });
      }
      // Per-prop / per-event / per-value checks land in Step 2.1.
    }

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
