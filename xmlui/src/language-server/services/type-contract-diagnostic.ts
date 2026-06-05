/**
 * Type-contract LSP diagnostic provider — Plan #01 Step 3.1.
 */
import { DiagnosticSeverity, type Diagnostic } from "vscode-languageserver";
import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { verifyComponentDef } from "../../components-core/type-contracts/verifier";
import { filterSuppressedTypeContractDiagnostics } from "../../components-core/type-contracts/suppression";
import type { MetadataProvider } from "./common/metadata-utils";

export function getTypeContractDiagnostics(
  component: ComponentDef | CompoundComponentDef | null | undefined,
  metadataProvider: MetadataProvider,
  strict = false,
  source?: string,
): Diagnostic[] {
  if (!component) return [];

  try {
    const root = unwrapCompound(component);
    if (!root) return [];

    const diagnostics = verifyComponentDef(root, metadataProvider.componentMetadataMap(), {
      strict,
      skipUnknown: true,
    });

    return filterSuppressedTypeContractDiagnostics(diagnostics, source).map((d) => {
      const line = Math.max(0, (d.range?.line ?? 1) - 1);
      const col = Math.max(0, d.range?.col ?? 0);
      const lspDiag: Diagnostic = {
        severity:
          d.severity === "error" ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
        range: {
          start: { line, character: col },
          end: { line, character: col + (d.range?.length ?? 1) },
        },
        message: d.message,
        code: d.code,
        source: "xmlui-type-contract",
      };
      if (d.suggestion) {
        lspDiag.data = {
          fix: `Replace "${d.propName}" with "${d.suggestion}"`,
          propName: d.propName,
          replacement: d.suggestion,
          componentName: d.componentName,
        };
      }
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
