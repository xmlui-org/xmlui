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
    const exports = Object.keys(packageJson.exports ?? {});

    expect(exports).toContain(".");
    expect(exports).not.toContain("./parser");
    expect(exports).not.toContain("./language-server");
    expect(exports).not.toContain("./testing");
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
