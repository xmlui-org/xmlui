import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { pushXsLog } from "../inspector/inspectorUtils";
import { verifyValue } from "./rules/coerce";
import { verifyEnum } from "./rules/enum";
import type { TypeContractDiagnostic } from "./diagnostics";

const emitted = new Set<string>();

export function resetRuntimeTypeContractDiagnostics() {
  emitted.clear();
}

export function emitRuntimeTypeContractDiagnostics(
  node: ComponentDef,
  metadata: ComponentMetadata | undefined,
  extractValue: ValueExtractor,
  appContext: AppContextObject,
  componentUid: string,
): TypeContractDiagnostic[] {
  if (!metadata?.props || !node.props) return [];

  const strict = appContext.xmluiConfig?.strictTypeContracts !== false;
  const severity: "error" | "warn" = strict ? "error" : "warn";
  const diagnostics: TypeContractDiagnostic[] = [];

  for (const [propName, rawValue] of Object.entries(node.props)) {
    if (!isExpressionValue(rawValue)) continue;
    const propMeta = metadata.props[propName];
    if (!propMeta) continue;

    let resolved: unknown;
    try {
      resolved = extractValue(rawValue, true);
    } catch {
      continue;
    }

    let diagnostic: TypeContractDiagnostic | undefined;
    // availableValues alone is hints-only; strict validation requires isStrictEnum.
    if (propMeta.isStrictEnum && propMeta.availableValues && propMeta.availableValues.length > 0) {
      const enumFailure = verifyEnum(resolved, propMeta.availableValues);
      if (enumFailure) {
        diagnostic = {
          code: "value-not-in-enum",
          severity,
          componentName: node.type,
          propName,
          expected: enumFailure.expected,
          actual: stringifyActual(resolved),
          message: `<${node.type}> prop "${propName}": ${enumFailure.message}`,
        };
      }
    } else if (propMeta.valueType && propMeta.valueType !== "any") {
      const typeFailure = verifyValue(propMeta.valueType, resolved);
      if (typeFailure) {
        diagnostic = {
          code: "wrong-type",
          severity,
          componentName: node.type,
          propName,
          expected: typeFailure.expected ?? propMeta.valueType,
          actual: stringifyActual(resolved),
          message: `<${node.type}> prop "${propName}": ${typeFailure.message}`,
        };
      }
    }

    if (!diagnostic) continue;
    const key = `${componentUid}:${propName}:${diagnostic.code}:${diagnostic.actual ?? ""}`;
    if (emitted.has(key)) continue;
    emitted.add(key);
    diagnostics.push(diagnostic);

    pushXsLog({
      kind: "type-contract",
      ts: Date.now(),
      severity: diagnostic.severity,
      code: diagnostic.code,
      componentName: diagnostic.componentName,
      propName: diagnostic.propName,
      expected: diagnostic.expected,
      actual: diagnostic.actual,
      message: diagnostic.message,
    });

    if (strict) {
      // eslint-disable-next-line no-console
      console.error(diagnostic.message);
      appContext.toast?.error?.(diagnostic.message, {
        id: `type-contract:${componentUid}:${propName}`,
        duration: 8000,
      });
    }
  }

  return diagnostics;
}

function isExpressionValue(value: unknown): boolean {
  return typeof value === "string" && /\{[^}]+\}/.test(value);
}

function stringifyActual(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
