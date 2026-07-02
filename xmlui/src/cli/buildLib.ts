import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { build as viteBuild, createServer, type Plugin } from "vite";

import { rawScssModulePlugin } from "../vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "../vite-plugin/svgReactPlugin";

const execFileAsync = promisify(execFile);

export interface BuildLibOptions {
  mode?: string;
  watch?: boolean;
}

type PackageJson = {
  name?: string;
  exports?: string | Record<string, unknown>;
};

export async function buildLib(options: BuildLibOptions = {}): Promise<void> {
  const root = process.cwd();
  const packageJson = await readPackageJson(root);
  const packageName = packageJson.name;
  if (!packageName) {
    throw new Error("Cannot build extension package: package.json has no name.");
  }
  const entry = await resolveEntry(root, packageJson);

  if (options.mode === "metadata") {
    await buildExtensionMetadata({ root, packageName, entry });
    return;
  }

  if (options.mode && options.mode !== "extension") {
    throw new Error(`Unsupported build-lib mode '${options.mode}'.`);
  }

  await typecheckIfConfigured(root);
  await buildExtensionLibrary({ root, packageName, entry, watch: options.watch === true });
}

async function readPackageJson(root: string): Promise<PackageJson> {
  const filename = path.join(root, "package.json");
  return JSON.parse(await readFile(filename, "utf8"));
}

async function resolveEntry(root: string, packageJson: PackageJson): Promise<string> {
  const exportEntry = typeof packageJson.exports === "string"
    ? packageJson.exports
    : undefined;
  const candidates = [
    exportEntry,
    "./src/index.tsx",
    "./src/index.ts",
    "./index.ts",
    "./index.tsx",
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const resolved = path.resolve(root, candidate);
    if (await exists(resolved)) {
      return resolved;
    }
  }

  throw new Error(`Cannot find extension package entry. Tried: ${candidates.join(", ")}`);
}

async function typecheckIfConfigured(root: string): Promise<void> {
  const tsconfig = path.join(root, "tsconfig.json");
  if (!await exists(tsconfig)) {
    return;
  }
  try {
    await execFileAsync("tsc", ["-p", tsconfig, "--noEmit"], {
      cwd: root,
      maxBuffer: 1024 * 1024 * 10,
    });
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    const output = [err.stdout, err.stderr].filter(Boolean).join("\n").trim();
    throw new Error(output || "TypeScript extension package check failed.");
  }
}

async function buildExtensionLibrary(options: {
  root: string;
  packageName: string;
  entry: string;
  watch: boolean;
}): Promise<void> {
  await viteBuild({
    root: options.root,
    configFile: false,
    plugins: [rawXmluiPlugin(), rawScssModulePlugin(), svgReactPlugin(), react()],
    build: {
      emptyOutDir: true,
      outDir: "dist",
      sourcemap: false,
      watch: options.watch ? {} : null,
      lib: {
        entry: options.entry,
        formats: ["es", "cjs"],
        fileName: (format) => `${options.packageName}${format === "es" ? ".mjs" : ".js"}`,
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "xmlui",
        ],
        output: {
          exports: "named",
        },
      },
    },
  });
}

async function buildExtensionMetadata(options: {
  root: string;
  packageName: string;
  entry: string;
}): Promise<void> {
  const xmluiSrcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const server = await createServer({
    root: options.root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
    plugins: [rawXmluiPlugin(), rawScssModulePlugin(), svgReactPlugin(), react()],
    resolve: {
      alias: [
        { find: /^xmlui$/, replacement: path.join(xmluiSrcDir, "index.ts") },
      ],
    },
  });

  try {
    const [metadataModule, extensionModule] = await Promise.all([
      server.ssrLoadModule(path.join(xmluiSrcDir, "metadata/index.ts")),
      server.ssrLoadModule(options.entry),
    ]);
    const artifact = metadataModule.generateXmluiMetadata({
      extensions: [extensionModule.default],
    });
    const errors = metadataModule.validateXmluiMetadataArtifact(artifact);
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    const outDir = path.join(options.root, "dist-metadata");
    const outFile = path.join(outDir, `${options.packageName}-metadata.json`);
    await mkdir(outDir, { recursive: true });
    await writeFile(outFile, metadataModule.metadataToJson(artifact));
    console.log(`Generated extension metadata: ${path.relative(options.root, outFile)}`);
    console.log(`Components: ${artifact.components.length}`);
  } finally {
    await server.close();
  }
}

function rawXmluiPlugin(): Plugin {
  return {
    name: "xmlui-rs:raw-xmlui-extension-source",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith(".xmlui")) {
        return null;
      }
      const source = await readFile(id, "utf8");
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

async function exists(filename: string): Promise<boolean> {
  try {
    await access(filename, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
