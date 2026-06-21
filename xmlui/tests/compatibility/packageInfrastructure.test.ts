import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const xmluiRoot = process.cwd();
const repoRoot = join(xmluiRoot, "..");

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Phase 1 package and command compatibility", () => {
  it("keeps old root command names available as aliases or debt-backed placeholders", () => {
    const packageJson = readJson(join(repoRoot, "package.json"));

    expect(packageJson.scripts).toMatchObject({
      setup: "npm install",
      "build-xmlui": "npm --workspace xmlui run build",
      "build-vscode-extension": "npm --workspace xmlui-vscode run build:vsix",
      "build-extensions": "npm --workspace xmlui-counter-badge run build && npm --workspace xmlui-counter-badge run build:metadata",
      "build-docs": "npm --workspace xmlui run build:docs-reference",
      "generate-docs": "npm --workspace xmlui run build:docs-reference",
      "test-integration": "node scripts/phase1-integration-smoke.mjs",
    });

    expect(packageJson.scripts["build-playground"]).toContain("COMP-0006");
  });

  it("keeps old xmlui package script names available for build and test infrastructure", () => {
    const packageJson = readJson(join(xmluiRoot, "package.json"));

    expect(packageJson.scripts).toMatchObject({
      "build:xmlui": "npm run build",
      "build:xmlui-standalone": "npm run build:standalone",
      "build:xmlui-metadata": "npm run build:metadata",
      "test:unit": "npm run test",
      "check:metadata": "npm run build:metadata",
      "generate-docs": "npm run build:docs-reference",
      "compatibility:style-artifact": "node scripts/style-artifact-report.mjs",
      "compatibility:runtime-artifact": "node scripts/runtime-artifact-report.mjs",
    });
  });

  it("keeps unsupported old infrastructure explicit in compatibility debt", () => {
    const debt = readFileSync(join(repoRoot, ".ai/compatibility-debt.md"), "utf8");

    expect(debt).toContain("COMP-0002");
    expect(debt).toContain("COMP-0003");
    expect(debt).toContain("COMP-0006");
    expect(debt).toContain("COMP-0007");
    expect(debt).toContain("COMP-0008");
  });
});
