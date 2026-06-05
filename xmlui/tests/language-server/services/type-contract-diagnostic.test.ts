import { describe, expect, it } from "vitest";
import { DiagnosticSeverity } from "vscode-languageserver";
import { xmlUiMarkupToComponent } from "../../../src/components-core/xmlui-parser";
import { getTypeContractDiagnostics } from "../../../src/language-server/services/type-contract-diagnostic";
import { mockMetadataProvider } from "../mockData";

function diagnosticsForMarkup(markup: string, strict = false) {
  const { component } = xmlUiMarkupToComponent(markup, "test.xmlui");
  return getTypeContractDiagnostics(component, mockMetadataProvider, strict, markup);
}

describe("type-contract-diagnostic (LSP provider)", () => {
  it("returns a warning with quick-fix data for an unknown prop suggestion", () => {
    const diags = diagnosticsForMarkup(`<Button labe="Save" />`);
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({
      severity: DiagnosticSeverity.Warning,
      code: "id-unknown-prop",
      source: "xmlui-type-contract",
      message: `<Button> has unknown prop "labe". Did you mean "label"?`,
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

  it("honors analyzer-style suppression comments for type-contract diagnostics", () => {
    const diags = diagnosticsForMarkup(`
      <App>
        <!-- xmlui-disable id-unknown-prop -->
        <Button labe="Save" />
        <Button variant="vibrant" />
      </App>
    `);

    expect(diags.some((diag) => diag.code === "id-unknown-prop")).toBe(false);
    expect(diags.some((diag) => diag.code === "value-not-in-enum")).toBe(true);
  });

  it("honors type-contract code suppression comments", () => {
    const diags = diagnosticsForMarkup(`
      <App>
        <!-- xmlui-disable-next-line value-not-in-enum -->
        <Button variant="vibrant" />
      </App>
    `);

    expect(diags).toEqual([]);
  });

  it("targets attribute names and values instead of the host tag", () => {
    const markup = `<App>
  <Button labe="Save" variant="vibrant" />
</App>`;

    const diags = diagnosticsForMarkup(markup);

    expect(diags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "id-unknown-prop",
          range: {
            start: { line: 1, character: 10 },
            end: { line: 1, character: 14 },
          },
        }),
        expect.objectContaining({
          code: "value-not-in-enum",
          range: {
            start: { line: 1, character: 31 },
            end: { line: 1, character: 38 },
          },
        }),
      ]),
    );
  });
});
