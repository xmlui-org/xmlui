import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { compileXmluiSource, throwFirstCompilerDiagnostic } from "../compiler/compileXmluiSource";
import type { XmluiElement, XmluiNode } from "../compiler/ir";
import type { XmluiModuleIr, XmluiNodeIr } from "../compiler/ir/index";

export type ProductionBuildFixture = {
  name: string;
  directory: string;
  entry: string;
};

export type ProductionBuildManifest = {
  schemaVersion: 1;
  mode: "production";
  generatedAt: string;
  entrySource: string;
  fixtures: ProductionBuildManifestFixture[];
  sources: ProductionBuildManifestSource[];
  components: ProductionBuildManifestComponent[];
  routes: ProductionBuildManifestRoute[];
  usedBuiltins: string[];
  assets: string[];
  metadata?: {
    path: string;
    hash: string;
  };
  diagnostics: string[];
  deferredCompatibility: string[];
};

export type ProductionBuildManifestFixture = {
  name: string;
  entry: string;
  components: string[];
};

export type ProductionBuildManifestSource = {
  id: string;
  hash: string;
  kind: "app" | "component";
};

export type ProductionBuildManifestComponent = {
  name: string;
  source: string;
};

export type ProductionBuildManifestRoute = {
  fixture: string;
  url: string;
};

type SourceRecord = {
  id: string;
  source: string;
  componentName?: string;
};

export async function generateProductionManifest({
  rootDir,
  outDir,
  fixtures,
  assets = [],
}: {
  rootDir: string;
  outDir: string;
  fixtures: ProductionBuildFixture[];
  assets?: string[];
}): Promise<ProductionBuildManifest> {
  const allSources = new Map<string, SourceRecord>();
  const fixtureManifests: ProductionBuildManifestFixture[] = [];
  const components = new Map<string, ProductionBuildManifestComponent>();
  const routes: ProductionBuildManifestRoute[] = [];
  const usedBuiltins = new Set<string>();
  const diagnostics: string[] = [];

  for (const fixture of fixtures) {
    const graph = await discoverFixtureGraph(rootDir, fixture);
    for (const source of graph.sources) {
      allSources.set(source.id, source);
    }
    const knownComponents = new Set(graph.sources.flatMap((source) => source.componentName ? [source.componentName] : []));
    const compiledEntry = compileXmluiSource({
      id: graph.entry.id,
      source: graph.entry.source,
      knownComponents,
    });
    collectUsedBuiltins(compiledEntry.compilerIr, usedBuiltins, knownComponents);
    routes.push(...collectRoutes(fixture.name, compiledEntry.runtimeDocument.root));
    diagnostics.push(...compiledEntry.compilerIr.diagnostics.map((diagnostic) => diagnostic.message));
    throwFirstCompilerDiagnostic(compiledEntry);

    for (const componentSource of graph.sources.filter((source) => source.componentName)) {
      const compiled = compileXmluiSource({
        id: componentSource.id,
        source: componentSource.source,
        knownComponents,
      });
      collectUsedBuiltins(compiled.compilerIr, usedBuiltins, knownComponents);
      diagnostics.push(...compiled.compilerIr.diagnostics.map((diagnostic) => diagnostic.message));
      throwFirstCompilerDiagnostic(compiled);
      components.set(componentSource.componentName!, {
        name: componentSource.componentName!,
        source: relative(rootDir, componentSource.id),
      });
    }

    fixtureManifests.push({
      name: fixture.name,
      entry: relative(rootDir, graph.entry.id),
      components: [...knownComponents].sort(),
    });
  }

  const manifest: ProductionBuildManifest = {
    schemaVersion: 1,
    mode: "production",
    generatedAt: new Date(0).toISOString(),
    entrySource: "production-index.html",
    fixtures: fixtureManifests,
    sources: [...allSources.values()]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((source) => ({
        id: relative(rootDir, source.id),
        hash: hashSource(source.source),
        kind: source.componentName ? "component" : "app",
      })),
    components: [...components.values()].sort((left, right) => left.name.localeCompare(right.name)),
    routes: routes.sort((left, right) => `${left.fixture}:${left.url}`.localeCompare(`${right.fixture}:${right.url}`)),
    usedBuiltins: [...usedBuiltins].sort(),
    assets: [...assets].sort(),
    metadata: await readMetadataReference(outDir),
    diagnostics,
    deferredCompatibility: [
      "CONFIG_ONLY build mode",
      "INLINE_ALL build mode",
      "xmlui.config.json",
      "Globals.xs",
      "code-behind files",
      "extension package production artifacts",
      "SSG and hydration",
    ],
  };
  await writeFile(
    path.join(outDir, "xmlui-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

async function readMetadataReference(outDir: string): Promise<ProductionBuildManifest["metadata"]> {
  const metadataPath = path.join(outDir, "xmlui-metadata.json");
  if (!existsSync(metadataPath)) {
    return undefined;
  }
  return {
    path: "xmlui-metadata.json",
    hash: hashSource(await readFile(metadataPath, "utf-8")),
  };
}

export async function discoverFixtureGraph(
  rootDir: string,
  fixture: ProductionBuildFixture,
): Promise<{ entry: SourceRecord; sources: SourceRecord[] }> {
  const directory = path.resolve(rootDir, fixture.directory);
  const entryPath = path.resolve(directory, fixture.entry);
  const entry = await readSource(entryPath);
  const initial = compileXmluiSource({
    id: entry.id,
    source: entry.source,
    validateComponentReferences: false,
  });
  const pending = [...initial.referencedComponents];
  const sources = [entry];
  const seenComponents = new Set<string>();

  while (pending.length > 0) {
    const componentName = pending.shift()!;
    if (seenComponents.has(componentName)) {
      continue;
    }
    seenComponents.add(componentName);
    const componentPath = path.resolve(directory, `${componentName}.xmlui`);
    if (!existsSync(componentPath)) {
      throw new Error(`Production build could not find component ${componentName} at ${componentPath}.`);
    }
    const componentSource = await readSource(componentPath, componentName);
    sources.push(componentSource);
    const compiled = compileXmluiSource({
      id: componentSource.id,
      source: componentSource.source,
      validateComponentReferences: false,
    });
    for (const reference of compiled.referencedComponents) {
      if (!seenComponents.has(reference)) {
        pending.push(reference);
      }
    }
  }

  await assertNoDuplicateComponentFiles(directory);
  return { entry, sources };
}

function collectUsedBuiltins(
  module: XmluiModuleIr,
  usedBuiltins: Set<string>,
  userComponents: Set<string>,
): void {
  visit(module.definition.root);

  function visit(node: XmluiNodeIr): void {
    if (node.kind === "builtin" && !userComponents.has(node.type)) {
      usedBuiltins.add(node.type);
    }
    if ("children" in node) {
      node.children.forEach(visit);
    }
  }
}

function collectRoutes(fixture: string, root: XmluiElement): ProductionBuildManifestRoute[] {
  const routes: ProductionBuildManifestRoute[] = [];
  visit(root);
  return routes;

  function visit(node: XmluiNode): void {
    if (node.kind !== "element") {
      return;
    }
    if (node.type === "Page" && typeof node.props.url === "string") {
      routes.push({ fixture, url: node.props.url });
    }
    node.children.forEach(visit);
  }
}

async function readSource(id: string, componentName?: string): Promise<SourceRecord> {
  return {
    id,
    source: await readFile(id, "utf-8"),
    ...(componentName ? { componentName } : {}),
  };
}

async function assertNoDuplicateComponentFiles(directory: string): Promise<void> {
  const files = await readdir(directory);
  const names = new Set<string>();
  for (const file of files.filter((file) => file.endsWith(".xmlui") && file !== "Main.xmlui")) {
    const name = path.basename(file, ".xmlui");
    if (names.has(name)) {
      throw new Error(`Duplicate production component '${name}' in ${directory}.`);
    }
    names.add(name);
  }
}

function hashSource(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

function relative(rootDir: string, value: string): string {
  return path.relative(rootDir, value).replaceAll("\\", "/");
}
