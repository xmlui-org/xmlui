import { describe, expect, it } from "vitest";

import {
  collectParsedScriptInventory,
  formatParsedScriptInventory,
} from "../../../src/components-core/script-compiler/script-inventory";

function parsedScript(extra: Record<string, any> = {}) {
  return {
    __PARSED: true,
    statements: [{ type: 3 }],
    parseId: 1,
    compiledUnsupported: false,
    ...extra,
  };
}

describe("parsed script inventory", () => {
  it("counts compiled, unsupported, and never-attempted blocks", () => {
    const appDefinition = {
      component: {
        events: { click: parsedScript({ compiled: { js: "return 1;" } }) },
        children: [
          {
            events: {
              press: parsedScript({
                compiledUnsupported: true,
                compiledUnsupportedReason: "unsupported await expression (node type 119)",
              }),
            },
          },
          { events: { hover: parsedScript() } },
        ],
      },
    };

    expect(collectParsedScriptInventory(appDefinition)).toEqual({
      total: 3,
      compiled: 1,
      unsupported: 1,
      notAttempted: 1,
      reasons: ["unsupported await expression (node type 119)"],
    });
  });

  it("survives cycles in the definition graph", () => {
    const node: any = { events: { click: parsedScript({ compiled: { js: "" } }) } };
    node.self = node;

    expect(collectParsedScriptInventory(node).compiled).toBe(1);
  });

  it("reports fallback reasons in the summary line", () => {
    const summary = formatParsedScriptInventory({
      total: 3,
      compiled: 1,
      unsupported: 2,
      notAttempted: 0,
      reasons: ["unsupported await expression (node type 119) at line 4, column 3"],
    });

    expect(summary).toContain("1 compiled at build time");
    expect(summary).toContain("2 fell back to interpretation");
    expect(summary).toContain("unsupported await expression");
  });

  it("says so when compilation is on but nothing was pre-compiled", () => {
    const summary = formatParsedScriptInventory({
      total: 4,
      compiled: 0,
      unsupported: 0,
      notAttempted: 4,
      reasons: [],
    });

    expect(summary).toContain("none of the 4 script block(s) carry a build-time artifact");
    expect(summary).toContain("xmlui.config.json");
  });
});
