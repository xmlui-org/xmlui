/**
 * Versioning LSP diagnostic provider — Plan #12 Phase 1.1.
 *
 * Given a parsed XMLUI `ComponentDef` and the project's `MetadataProvider`,
 * runs `verifyVersioning()` and converts each `VersioningDiagnostic` into an
 * LSP `Diagnostic`.
 *
 * Severity mapping mirrors the runtime:
 *   - `severity: "error"` → `DiagnosticSeverity.Error`
 *   - `severity: "warn"`  → `DiagnosticSeverity.Warning`
 *   - `severity: "info"`  → `DiagnosticSeverity.Information`
 *
 * The verifier must never crash the LSP server; any error is swallowed and
 * yields zero diagnostics.
 */
import { DiagnosticSeverity, type Diagnostic } from "vscode-languageserver";
import { verifyVersioning } from "../../components-core/versioning/verifier";
import type { MetadataProvider } from "./common/metadata-utils";
import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";

export function getVersioningDiagnostics(
  component: ComponentDef | CompoundComponentDef | null | undefined,
  metadataProvider: MetadataProvider,
  strict = false,
): Diagnostic[] {
  if (!component) return [];

  try {
    const root = unwrapCompound(component);
    if (!root) return [];

    const registry = metadataProvider.componentMetadataMap();
    const diags = verifyVersioning(root, registry, { strict });

    return diags.map((d) => {
      const line = Math.max(0, (d.range?.line ?? 1) - 1);
      const col = Math.max(0, d.range?.col ?? 0);
      const length = d.range?.length ?? (d.componentName?.length ?? 1);

      const severity =
        d.severity === "error"
          ? DiagnosticSeverity.Error
          : d.severity === "warn"
            ? DiagnosticSeverity.Warning
            : DiagnosticSeverity.Information;

      const lspDiag: Diagnostic = {
        severity,
        range: {
          start: { line, character: col },
          end: { line, character: col + length },
        },
        message: d.message,
        code: d.code,
        source: "xmlui-versioning",
        data: {
          componentName: d.componentName,
          propName: d.propName,
          eventName: d.eventName,
          methodName: d.methodName,
          deprecatedSince: d.deprecatedSince,
          removedIn: d.removedIn,
          replacement: d.replacement,
        },
      };

      return lspDiag;
    });
  } catch {
    return [];
  }
}

function unwrapCompound(def: ComponentDef | CompoundComponentDef): ComponentDef | null {
  if (!def) return null;
  if ((def as CompoundComponentDef).component) {
    return (def as CompoundComponentDef).component as ComponentDef;
  }
  return def as ComponentDef;
}
