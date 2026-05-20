import { describe, expect, it } from "vitest";
import { DiagnosticSeverity } from "vscode-languageserver";
import { xmlUiMarkupToComponent } from "../../../src/components-core/xmlui-parser";
import { getTypeContractDiagnostics } from "../../../src/language-server/services/type-contract-diagnostic";
import { mockMetadataProvider } from "../mockData";

function diagnosticsForMarkup(markup: string, strict = false) {
  const { component } = xmlUiMarkupToComponent(markup, "test.xmlui");
  return getTypeContractDiagnostics(component, mockMetadataProvider, strict);
}

describe("type-contract-diagnostic (LSP provider)", () => {
  it("returns a warning with quick-fix data for an unknown prop suggestion", () => {
    const diags = diagnosticsForMarkup(`<Button labe="Save" />`);
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({
      severity: DiagnosticSeverity.Warning,
      code: "unknown-prop",
      source: "xmlui-type-contract",
      data: {
        propName: "labe",
        replacement: "label",
        componentName: "Button",
      },
    });
  });

  it("escalates error-capable diagnostics in strict mode", () => {
    const diags = diagnosticsForMarkup(`<Button variant="vibrant" />`, true);
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({
      severity: DiagnosticSeverity.Error,
      code: "value-not-in-enum",
    });
  });

  it("returns no diagnostics for valid markup", () => {
    expect(diagnosticsForMarkup(`<Button label="Save" />`)).toEqual([]);
  });
});
