import { describe, expect, it } from "vitest";

import { collectXmluiCompletions } from "../src/completions";
import { collectXmluiDiagnostics } from "../src/diagnostics";
import { collectXmluiHover } from "../src/hover";

describe("VS Code metadata tooling", () => {
  it("collects component and prop completions from shared metadata", () => {
    expect(collectXmluiCompletions("<", 1)).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Button", kind: "component" }),
    ]));

    expect(collectXmluiCompletions("<Button ", "<Button ".length)).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "label", kind: "prop" }),
      expect.objectContaining({ label: "onClick", kind: "event" }),
    ]));
  });

  it("collects hover info from shared metadata", () => {
    expect(collectXmluiHover("<DataSource url=\"/api\" />", 2)).toEqual({
      title: "<DataSource>",
      body: "Managed data loader with refetch and status APIs.",
    });
  });

  it("keeps diagnostics on the shared compiler diagnostic adapter", () => {
    const diagnostics = collectXmluiDiagnostics("<App><Button unknown=\"x\" /></App>");

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "XC002",
        message: "<Button> has unknown prop 'unknown'.",
      }),
    ]);
  });
});

