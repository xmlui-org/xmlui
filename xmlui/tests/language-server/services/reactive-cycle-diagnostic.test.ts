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

  it("returns one Warning diagnostic per member of a two-var cycle", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.a="{b + 1}" var.b="{a + 1}" />
    `);
    expect(diags).toHaveLength(2);
    for (const d of diags) {
      expect(d.severity).toBe(DiagnosticSeverity.Warning);
      expect(d.code).toBe("reactive-cycle");
      expect(d.source).toBe("xmlui-reactive-graph");
    }
    // The cycle text should reference both var names.
    expect(diags[0].message).toMatch(/\ba\b/);
    expect(diags[0].message).toMatch(/\bb\b/);
  });

  it("anchors diagnostics and related information to all cycle members", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.a="{b + 1}" var.b="{a + 1}" />
    `);
    expect(diags).toHaveLength(2);
    expect(diags.map((d) => d.range.start.line)).toEqual([1, 1]);
    expect(diags.map((d) => d.range.start.character).sort((a, b) => a - b)).toEqual([13, 29]);
    expect(diags.every((d) => d.range.end.character > d.range.start.character + 1)).toBe(true);
    for (const d of diags) {
      expect(d.relatedInformation).toHaveLength(2);
      expect(d.relatedInformation?.map((info) => info.location.uri)).toEqual(["0", "0"]);
      expect(d.relatedInformation?.map((info) => info.message).join("\n")).toMatch(/\ba\b/);
      expect(d.relatedInformation?.map((info) => info.message).join("\n")).toMatch(/\bb\b/);
    }
  });

  it("returns no diagnostics for null component", () => {
    expect(getReactiveCycleDiagnostics(null)).toEqual([]);
    expect(getReactiveCycleDiagnostics(undefined)).toEqual([]);
  });

  it("carries a stable cycleId in the diagnostic data payload", () => {
    const diags = diagnosticsForMarkup(`
      <Stack var.x="{y}" var.y="{x}" />
    `);
    expect(diags).toHaveLength(2);
    expect(new Set(diags.map((d) => (d as any).data.cycleId)).size).toBe(1);
    expect((diags[0] as any).data).toMatchObject({
      cycleId: expect.any(String),
      nodeId: expect.any(String),
    });
  });
});
