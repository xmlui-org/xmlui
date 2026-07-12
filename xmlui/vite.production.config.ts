import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import counterBadgeExtension from "../packages/xmlui-counter-badge/src";

import { rawScssModulePlugin } from "./src/vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "./src/vite-plugin/svgReactPlugin";
import { xmluiPlugin } from "./src/vite-plugin/xmluiPlugin";
import {
  createXmluiLogger,
  styleToJsInteropPlugin,
  xmluiCssOptions,
  xmluiEnvironmentCssPlugin,
} from "./vite.shared";

type ProductionBuildFixture = {
  name: string;
  directory: string;
  entry: string;
  components?: string[];
};

const productionFixtures: ProductionBuildFixture[] = [
  {
    name: "counterComponents",
    directory: "standalone-samples/counter-components",
    entry: "Main.xmlui",
    components: ["IncrementButton"],
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
  {
    name: "extensionCounterBadge",
    directory: "standalone-samples/extension-counter-badge",
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
      await writeStaticProductionManifest({
        rootDir,
        outDir,
        fixtures: productionFixtures,
        assets,
      });
    },
  };
}

async function writeStaticProductionManifest({
  rootDir,
  outDir,
  fixtures,
  assets,
}: {
  rootDir: string;
  outDir: string;
  fixtures: ProductionBuildFixture[];
  assets: string[];
}): Promise<void> {
  const sources = fixtures.flatMap((fixture) => [
    {
      id: relative(rootDir, path.resolve(rootDir, fixture.directory, fixture.entry)),
      hash: "",
      kind: "app",
    },
    ...(fixture.components ?? []).map((component) => ({
      id: relative(rootDir, path.resolve(rootDir, fixture.directory, `${component}.xmlui`)),
      hash: "",
      kind: "component",
    })),
  ]);
  await Promise.all(sources.map(async (source) => {
    source.hash = await hashFile(path.resolve(rootDir, source.id));
  }));
  const manifest = {
    schemaVersion: 1,
    mode: "production",
    generatedAt: new Date(0).toISOString(),
    entrySource: "production-index.html",
    fixtures: fixtures.map((fixture) => ({
      name: fixture.name,
      entry: relative(rootDir, path.resolve(rootDir, fixture.directory, fixture.entry)),
      components: fixture.components ?? [],
    })),
    sources,
    components: fixtures.flatMap((fixture) =>
      (fixture.components ?? []).map((component) => ({
        name: component,
        source: relative(rootDir, path.resolve(rootDir, fixture.directory, `${component}.xmlui`)),
      })),
    ),
    routes: [
      { fixture: "routingState", url: "/" },
      { fixture: "routingState", url: "/summary" },
    ],
    usedBuiltins: ["App", "Button", "H1", "Page", "Pages", "Text", "VStack"],
    assets: [...assets].sort(),
    metadata: await readMetadataReference(outDir),
    diagnostics: [],
    deferredCompatibility: [
      "CONFIG_ONLY build mode",
      "INLINE_ALL build mode",
      "xmlui.config.json",
      "Globals.xs",
      "code-behind files",
      "extension package production artifacts",
      "compiler-backed production manifest analysis",
      "SSG and hydration",
    ],
  };
  await writeFile(path.join(outDir, "xmlui-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function hashFile(filename: string): Promise<string> {
  if (!existsSync(filename)) {
    return hashSource("");
  }
  return hashSource(await readFile(filename, "utf-8"));
}

async function readMetadataReference(outDir: string): Promise<{ path: string; hash: string } | undefined> {
  const metadataPath = path.join(outDir, "xmlui-metadata.json");
  if (!existsSync(metadataPath)) {
    return undefined;
  }
  return {
    path: "xmlui-metadata.json",
    hash: hashSource(await readFile(metadataPath, "utf-8")),
  };
}

function hashSource(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

function relative(rootDir: string, filename: string): string {
  return path.relative(rootDir, filename).replaceAll("\\", "/");
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
  customLogger: createXmluiLogger(),
  resolve: {
    alias: {
      "attr-accept": path.resolve("src/compat/attrAccept.ts"),
      papaparse: path.resolve("src/compat/papaParse.ts"),
      "react-qr-code": path.resolve("src/compat/reactQrCode.tsx"),
      "style-to-js": path.resolve("src/compat/styleToJs.ts"),
    },
  },
  css: xmluiCssOptions,
  plugins: [
    xmluiEnvironmentCssPlugin(),
    styleToJsInteropPlugin(),
    rawScssModulePlugin(),
    svgReactPlugin(),
    xmluiPlugin({ extensions: [counterBadgeExtension] }),
    react(),
    productionArtifactsPlugin(),
  ],
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
