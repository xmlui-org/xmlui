import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  discoverFixtureGraph,
  generateProductionManifest,
  type ProductionBuildFixture,
} from "../../src/production/manifest";

const rootDir = path.resolve(__dirname, "../..");

describe("production build graph and manifest", () => {
  it("discovers transitive component files from a production fixture", async () => {
    const graph = await discoverFixtureGraph(rootDir, fixture("counterComponents"));

    expect(path.basename(graph.entry.id)).toBe("Main.xmlui");
    expect(graph.sources.map((source) => path.basename(source.id)).sort()).toEqual([
      "IncrementButton.xmlui",
      "Main.xmlui",
    ]);
    expect(graph.sources.find((source) => source.componentName === "IncrementButton")).toBeTruthy();
  });

  it("fails before artifact emission when a referenced component file is missing", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "xmlui-production-missing-"));
    const appDir = path.join(workspace, "app");
    await mkdir(appDir);
    await writeFile(path.join(appDir, "Main.xmlui"), "<App><MissingBox /></App>");
    try {
      await expect(
        discoverFixtureGraph(workspace, {
          name: "missing",
          directory: "app",
          entry: "Main.xmlui",
        }),
      ).rejects.toThrow("Production build could not find component MissingBox");
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  it("accepts fixtures that do not reference user components", async () => {
    const graph = await discoverFixtureGraph(rootDir, {
      name: "counterLocal",
      directory: "src/examples/counter-local",
      entry: "Main.xmlui",
    });
    expect(graph.sources).toHaveLength(1);
    expect(graph.sources[0].componentName).toBeUndefined();
  });

  it("writes a deterministic manifest for compiled production fixtures", async () => {
    const outDir = await mkdtemp(path.join(tmpdir(), "xmlui-production-"));
    try {
      const manifest = await generateProductionManifest({
        rootDir,
        outDir,
        fixtures: [
          fixture("counterComponents"),
          fixture("styleMutation"),
          fixture("routingState"),
        ],
        assets: ["index.html", "internal/index.abc123.js"],
      });

      expect(manifest.schemaVersion).toBe(1);
      expect(manifest.mode).toBe("production");
      expect(manifest.generatedAt).toBe("1970-01-01T00:00:00.000Z");
      expect(manifest.fixtures.map((entry) => entry.name)).toEqual([
        "counterComponents",
        "styleMutation",
        "routingState",
      ]);
      expect(manifest.components).toContainEqual({
        name: "IncrementButton",
        source: "standalone-samples/counter-components/IncrementButton.xmlui",
      });
      expect(manifest.routes).toEqual([
        { fixture: "routingState", url: "/" },
        { fixture: "routingState", url: "/summary" },
      ]);
      expect(manifest.usedBuiltins).toEqual(expect.arrayContaining(["Button", "H1", "Page", "Pages"]));
      expect(manifest.usedBuiltins).not.toContain("IncrementButton");
      expect(manifest.sources.every((source) => source.hash.length === 64)).toBe(true);
      expect(manifest.assets).toEqual(["index.html", "internal/index.abc123.js"]);
      expect(manifest.deferredCompatibility).toContain("xmlui.config.json");

      const written = JSON.parse(await readFile(path.join(outDir, "xmlui-manifest.json"), "utf-8"));
      expect(written).toEqual(manifest);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});

function fixture(name: "counterComponents" | "styleMutation" | "routingState"): ProductionBuildFixture {
  return {
    name,
    directory: `standalone-samples/${kebab(name)}`,
    entry: "Main.xmlui",
  };
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
