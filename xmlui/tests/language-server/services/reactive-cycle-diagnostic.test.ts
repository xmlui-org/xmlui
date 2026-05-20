import { describe, expect, it } from "vitest";
import { DiagnosticSeverity } from "vscode-languageserver";

import { xmlUiMarkupToComponent } from "../../../src/components-core/xmlui-parser";
import { getReactiveCycleDiagnostics } from "../../../src/language-server/services/reactive-cycle-diagnostic";

/**
 * Reactive cycle LSP diagnostic provider — Plan #03 Step 3.3 (W6-7).
 *
 * Verifies the wrapper around `collectComponentDefGraph` + `findCycles`
 * produces LSP diagnostics with the expected severity and message.
 */

function diagnosticsForMarkup(markup: string) {
  const { component } = xmlUiMarkupToComponent(markup);
  return getReactiveCycleDiagnostics(component);
}

describe("reactive-cycle-diagnostic (LSP provider)", () => {
  it("returns no diagnostics for cycle-free markup", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.a="{1}" var.b="{a + 1}">
        <Text>{b}</Text>
      </Stack>
    `);
    expect(diags).toEqual([]);
  });

  it("returns one Warning diagnostic for a two-var cycle", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.a="{b + 1}" var.b="{a + 1}" />
    `);
    expect(diags).toHaveLength(1);
    const [d] = diags;
    expect(d.severity).toBe(DiagnosticSeverity.Warning);
    expect(d.code).toBe("reactive-cycle");
    expect(d.source).toBe("xmlui-reactive-graph");
    // The cycle text should reference both var names.
    expect(d.message).toMatch(/\ba\b/);
    expect(d.message).toMatch(/\bb\b/);
  });

  it("anchors diagnostics and related information to cycle members", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.a="{b + 1}" var.b="{a + 1}" />
    `);
    expect(diags).toHaveLength(1);
    const [d] = diags;
    expect(d.range.start.line).toBeGreaterThan(0);
    expect(d.relatedInformation).toHaveLength(2);
    expect(d.relatedInformation?.map((info) => info.location.uri)).toEqual(["0", "0"]);
    expect(d.relatedInformation?.map((info) => info.message).join("\n")).toMatch(/\ba\b/);
    expect(d.relatedInformation?.map((info) => info.message).join("\n")).toMatch(/\bb\b/);
  });

  it("returns no diagnostics for null component", () => {
    expect(getReactiveCycleDiagnostics(null)).toEqual([]);
    expect(getReactiveCycleDiagnostics(undefined)).toEqual([]);
  });

  it("carries a stable cycleId in the diagnostic data payload", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.x="{y}" var.y="{x}" />
    `);
    expect(diags).toHaveLength(1);
    expect((diags[0] as any).data).toMatchObject({
      cycleId: expect.any(String),
    });
  });
});
