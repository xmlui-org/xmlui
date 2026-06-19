import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateXmluiMetadata, validateXmluiMetadataArtifact } from "../../../src/metadata";

const xmluiRoot = process.cwd();
const repoRoot = join(xmluiRoot, "..");

describe("compatibility artifact shape", () => {
  it("keeps the current metadata artifact stable enough for tools", () => {
    const metadata = generateXmluiMetadata();

    expect(metadata.schemaVersion).toBe(1);
    expect(validateXmluiMetadataArtifact(metadata)).toEqual([]);
    expect(metadata.components.map((component) => component.name)).toEqual(expect.arrayContaining([
      "App",
      "Button",
      "DataSource",
      "Page",
      "Text",
    ]));
    expect(metadata.source.contractHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("documents package export compatibility gaps against the old package shape", () => {
    const packageJson = JSON.parse(readFileSync(join(xmluiRoot, "package.json"), "utf8"));
    const debt = readFileSync(join(repoRoot, ".ai/compatibility-debt.md"), "utf8");
    const exports = Object.keys(packageJson.exports ?? {});

    expect(exports).toContain(".");
    expect(exports).not.toContain("./parser");
    expect(exports).not.toContain("./language-server");
    expect(exports).not.toContain("./testing");
    expect(debt).toContain("COMP-0002");
  });

  it("recognizes production and SSG artifact locations when they have been built", () => {
    const productionRoot = join(xmluiRoot, "dist-production");
    const ssgRoot = join(xmluiRoot, "dist-ssg");

    if (existsSync(productionRoot)) {
      expect(readdirSync(productionRoot)).toContain("index.html");
    }

    if (existsSync(ssgRoot)) {
      expect(readdirSync(ssgRoot)).toEqual(expect.arrayContaining([
        "xmlui-ssg-manifest.json",
        "summary",
      ]));
    }
  });

  it("recognizes the styling compatibility artifact when generated", () => {
    const styleArtifactPath = join(xmluiRoot, ".compatibility-report/style-artifact-latest.json");

    if (existsSync(styleArtifactPath)) {
      const artifact = JSON.parse(readFileSync(styleArtifactPath, "utf8"));

      expect(artifact.schemaVersion).toBe(1);
      expect(artifact.oldSourceAnchors).toContain("/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming");
      expect(artifact.supportedLayoutPropNames).toEqual(expect.arrayContaining([
        "gap",
        "paddingHorizontal",
        "textUnderlineOffset",
      ]));
      expect(artifact.responsiveBreakpoints).toMatchObject({
        md: 768,
        xxl: 1400,
      });
      expect(artifact.styleStates).toContain("hover");
      expect(artifact.defaultThemeVariables["color-primary"]).toBe("#2563eb");
      expect(artifact.deferred).toContain("Full visual regression suite");
    }
  });

  it("recognizes the runtime compatibility artifact when generated", () => {
    const runtimeArtifactPath = join(xmluiRoot, ".compatibility-report/runtime-artifact-latest.json");

    if (existsSync(runtimeArtifactPath)) {
      const artifact = JSON.parse(readFileSync(runtimeArtifactPath, "utf8"));

      expect(artifact.schemaVersion).toBe(1);
      expect(artifact.oldSourceAnchors).toEqual(expect.arrayContaining([
        "/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource",
        "/Users/dotneteer/source/xmlui/xmlui/src/components/Form",
        "/Users/dotneteer/source/xmlui/xmlui/src/components/App",
      ]));
      expect(artifact.implementedSlices).toEqual(expect.arrayContaining([
        expect.stringContaining("App-scoped toast service"),
        expect.stringContaining("Pages/Page/NavLink"),
      ]));
      expect(artifact.deferred).toEqual(expect.arrayContaining([
        expect.stringContaining("Full form context"),
        expect.stringContaining("Full App shell"),
      ]));
    }
  });

  it("recognizes the extension fixture package metadata artifact when built", () => {
    const metadataPath = join(
      repoRoot,
      "packages/xmlui-counter-badge/dist-metadata/xmlui-counter-badge-metadata.json",
    );

    if (existsSync(metadataPath)) {
      const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
      expect(metadata.components.map((component: { name: string }) => component.name)).toContain("CounterBadge");
    }
  });
});
