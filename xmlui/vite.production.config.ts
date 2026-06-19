import react from "@vitejs/plugin-react";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

import {
  generateProductionManifest,
  type ProductionBuildFixture,
} from "./src/production/manifest";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";

const productionFixtures: ProductionBuildFixture[] = [
  {
    name: "counterComponents",
    directory: "standalone-samples/counter-components",
    entry: "Main.xmlui",
  },
  {
    name: "styleMutation",
    directory: "standalone-samples/style-mutation",
    entry: "Main.xmlui",
  },
  {
    name: "routingState",
    directory: "standalone-samples/routing-state",
    entry: "Main.xmlui",
  },
];

function productionArtifactsPlugin(): Plugin {
  return {
    name: "xmlui-rs:production-artifacts",
    async closeBundle() {
      const rootDir = process.cwd();
      const outDir = path.resolve(rootDir, "dist-production");
      await mkdir(outDir, { recursive: true });
      await normalizeIndexHtml(outDir);
      await writeMockApiCompatibilityStub(outDir);
      await writeProductionDiagnostic(outDir);
      await copyMetadataArtifact(rootDir, outDir);
      const assets = await collectAssets(outDir);
      await generateProductionManifest({
        rootDir,
        outDir,
        fixtures: productionFixtures,
        assets,
      });
    },
  };
}

async function copyMetadataArtifact(rootDir: string, outDir: string): Promise<void> {
  const metadataPath = path.resolve(rootDir, "dist-metadata/xmlui-metadata.json");
  if (existsSync(metadataPath)) {
    await copyFile(metadataPath, path.join(outDir, "xmlui-metadata.json"));
  }
}

async function writeProductionDiagnostic(outDir: string): Promise<void> {
  await writeFile(
    path.join(outDir, "production-check.json"),
    `${JSON.stringify(
      {
        kind: "xmlui-production",
        entry: "index.html",
        sourceEntryForbidden: "/src/main.tsx",
      },
      null,
      2,
    )}\n`,
  );
}

async function writeMockApiCompatibilityStub(outDir: string): Promise<void> {
  await writeFile(
    path.join(outDir, "mockApi.js"),
    [
      "// Compatibility stub for stale dev mock-loader requests.",
      "globalThis.__xmluiMockApiStub = true;",
      "",
    ].join("\n"),
  );
}

async function normalizeIndexHtml(outDir: string): Promise<void> {
  const generated = path.join(outDir, "production-index.html");
  const target = path.join(outDir, "index.html");
  if (existsSync(generated)) {
    await rename(generated, target);
  }
}

async function collectAssets(outDir: string): Promise<string[]> {
  const files: string[] = [];
  await visit(outDir);
  return files
    .filter((file) => file !== "xmlui-manifest.json")
    .sort();

  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
        continue;
      }
      files.push(path.relative(outDir, absolute).replaceAll("\\", "/"));
    }
  }
}

export default defineConfig({
  base: "./",
  plugins: [xmluiPlugin(), react(), productionArtifactsPlugin()],
  build: {
    outDir: "dist-production",
    emptyOutDir: true,
    rolldownOptions: {
      input: path.resolve("production-index.html"),
      output: {
        entryFileNames: "internal/[name].[hash].mjs",
        chunkFileNames: "internal/chunks/[name].[hash].mjs",
        assetFileNames: "internal/assets/[name].[hash][extname]",
      },
    },
  },
});
