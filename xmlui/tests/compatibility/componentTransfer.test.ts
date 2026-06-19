import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 5 component transfer scaffold", () => {
  it("records the source-adjacent component transfer convention", () => {
    const conventions = readFileSync(resolve("src/components/_conventions.md"), "utf8");
    const closureTemplate = readFileSync(resolve("../.ai/component-compatibility-closure-template.md"), "utf8");

    expect(conventions).toContain("xmlui/src/components/<ComponentName>/");
    expect(conventions).toContain("__tests__/transferred");
    expect(conventions).toContain("partial-centralized");
    expect(closureTemplate).toContain("## Source Organization");
    expect(closureTemplate).toContain("Transferred test archive");
  });

  it("runs the component transfer closure guard", () => {
    const output = execFileSync("node", ["scripts/check-component-transfer.mjs"], {
      cwd: resolve("."),
      encoding: "utf8",
    });

    expect(output).toContain("component transfer scaffold checks passed");
  });
});
