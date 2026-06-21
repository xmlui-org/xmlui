import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 5 component transfer scaffold", () => {
  it("records the source-adjacent component transfer convention", () => {
    const conventions = readFileSync(resolve("src/component-core/component-conventions.md"), "utf8");
    const closureTemplate = readFileSync(resolve("../.ai/component-compatibility-closure-template.md"), "utf8");

    expect(conventions).toContain("xmlui/src/components/<ComponentName>/");
    expect(conventions).toContain("xmlui/src/component-core");
    expect(conventions).toContain("Do not create `__tests__` folders");
    expect(conventions).toContain("partial-centralized");
    expect(closureTemplate).toContain("## Source Organization");
    expect(closureTemplate).toContain("Old tests ported beside component");
  });

  it("runs the component transfer closure guard", () => {
    const output = execFileSync("node", ["scripts/check-component-transfer.mjs"], {
      cwd: resolve("."),
      encoding: "utf8",
    });

    expect(output).toContain("component transfer scaffold checks passed");
  });
});
