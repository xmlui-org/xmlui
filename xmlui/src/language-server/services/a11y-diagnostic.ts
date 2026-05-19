/**
 * Accessibility LSP diagnostic provider — Plan #05 Phase 1 Step 1.3.
 *
 * Given a parsed XMLUI `ComponentDef` and the project's `MetadataProvider`,
 * runs `lintComponentDef()` and converts each `A11yDiagnostic` into an LSP
 * `Diagnostic`.
 *
 * Severity mapping:
 *   - `A11yDiagnostic.severity === "error"` → `DiagnosticSeverity.Error`
 *   - `A11yDiagnostic.severity === "warn"`  → `DiagnosticSeverity.Warning`
 *
 * The analyzer must never crash the LSP server; any error is swallowed and
 * yields zero diagnostics.
 *
 * `fix` suggestions are embedded in `diagnostic.data.fix` so the code-action
 * provider can surface them as quick-fix actions.
 */
import { DiagnosticSeverity, type Diagnostic } from "vscode-languageserver";
import { lintComponentDef } from "../../components-core/accessibility/linter";
import type { MetadataProvider } from "./common/metadata-utils";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { CompoundComponentDef } from "../../abstractions/ComponentDefs";

/**
 * Compute accessibility diagnostics for a single parsed document.
 *
 * `component` is the value returned by `xmlUiMarkupToComponent(...).component`
 * (or any equivalent root).  When `null`, `undefined`, or analysis fails,
 * returns `[]`.
 *
 * @param component        Parsed component tree root.
 * @param metadataProvider Project metadata provider (supplies a11y registry).
 * @param strict           When `true`, must-have violations become errors.
 */
export function getA11yDiagnostics(
  component: ComponentDef | CompoundComponentDef | null | undefined,
  metadataProvider: MetadataProvider,
  strict = false,
): Diagnostic[] {
  if (!component) return [];

  try {
    const root = unwrapCompound(component);
    if (!root) return [];

    const registry = metadataProvider.a11yMetadataMap();
    const a11yDiags = lintComponentDef(root, registry, { strict, skipUnknown: true });

    return a11yDiags.map((d) => {
      // Ranges in `A11yDiagnostic` are 1-based; LSP ranges are 0-based.
      const line = Math.max(0, (d.range?.line ?? 1) - 1);
      const col = Math.max(0, d.range?.col ?? 0);
      const endCol = col + (d.range?.length ?? 1);

      const lspDiag: Diagnostic = {
        severity: d.severity === "error"
          ? DiagnosticSeverity.Error
          : DiagnosticSeverity.Warning,
        range: {
          start: { line, character: col },
          end: { line, character: endCol },
        },
        message: d.message,
        code: d.code,
        source: "xmlui-a11y",
      };

      // Attach the fix suggestion as opaque data so code-action providers
      // can surface it as a quick-fix without parsing the message string.
      if (d.fix) {
        lspDiag.data = { fix: d.fix, componentName: d.componentName };
      }

      return lspDiag;
    });
  } catch {
    // Accessibility linter must never crash the LSP server.
    return [];
  }
}

/**
 * Compound components are wrapped as `{ type: "Component", component: ... }`.
 * Unwrap to the inner tree when present so the linter walks the real content.
 */
function unwrapCompound(
  def: ComponentDef | CompoundComponentDef,
): ComponentDef | null {
  if (!def) return null;
  if ((def as CompoundComponentDef).component) {
    return (def as CompoundComponentDef).component as ComponentDef;
  }
  return def as ComponentDef;
}
