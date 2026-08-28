#!/usr/bin/env node
/**
 * Detects drift between the committed reference pages under
 * `website/content/docs/reference/**` and what `npm run generate-docs`
 * would currently produce from source.
 *
 * Two hazards this script exists to avoid (see
 * resources/worklist-drafts/detect-stale-reference-pages.md for the full
 * writeup):
 *
 * 1. It NEVER writes into the working tree. Generation happens entirely in
 *    a temporary directory; the committed `website/content/docs/reference`
 *    tree is only ever read. There is nothing to restore because nothing
 *    in the working tree is touched.
 *
 * 2. `generate-docs` consumes *built* metadata (`dist/metadata/*.cjs`), not
 *    source. This script always rebuilds that metadata immediately before
 *    generating, so the comparison reflects current source rather than
 *    whatever happened to be sitting in `dist/` already. A build failure
 *    here is a hard failure of the check (fail loudly, not silently trust
 *    a stale dist).
 *
 * The generation logic itself is not reimplemented from scratch: it reuses
 * the real `DocsGenerator` / `MetadataProcessor` machinery from
 * scripts/generate-docs, imported dynamically (after the fresh build) and
 * pointed at a temp output directory instead of the real one. Only the
 * top-level orchestration that get-docs.mjs performs is duplicated here,
 * scoped down to the parts that write under reference/components and
 * reference/extensions/<package> -- the side effects that write elsewhere
 * (nav JSON, landing metadata, script-local metadata.json export) are
 * deliberately skipped since they fall outside this check's scope and
 * would otherwise mutate the real tree.
 */

import { existsSync } from "fs";
import { mkdtemp, mkdir, rm, readdir, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join, dirname, relative } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // xmlui/scripts
const XMLUI_ROOT = join(SCRIPT_DIR, ".."); // xmlui/
const REPO_ROOT = join(XMLUI_ROOT, ".."); // repo root
const GENDOCS_DIR = join(SCRIPT_DIR, "generate-docs");
const COMMITTED_REFERENCE_ROOT = join(REPO_ROOT, "website/content/docs/reference");

function log(msg) {
  console.error(`[check-reference-drift] ${msg}`);
}

function run(command, args, cwd, label) {
  log(`${label}: ${command} ${args.join(" ")} (cwd=${relative(REPO_ROOT, cwd)})`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error) {
    throw new Error(`${label} failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${label} exited with status ${result.status}`);
  }
}

async function main() {
  let tmpDir;
  try {
    // --- Trap 2: never trust a possibly-stale dist/. Always rebuild the
    // metadata the generator will consume, from whatever source is on disk
    // right now.
    run("npm", ["run", "build:xmlui-metadata"], XMLUI_ROOT, "Building main component metadata");

    const extensionsConfigPath = join(GENDOCS_DIR, "extensions-config.json");
    const extensionsConfigRaw = JSON.parse(await readFile(extensionsConfigPath, "utf8"));
    const excludeByName = new Set(extensionsConfigRaw.excludeByName ?? []);

    let candidatePackageNames;
    if (extensionsConfigRaw.includeByName?.length) {
      candidatePackageNames = extensionsConfigRaw.includeByName;
    } else {
      const packagesDir = join(REPO_ROOT, "packages");
      candidatePackageNames = (await readdir(packagesDir)).filter((name) => name.startsWith("xmlui-"));
    }

    const activePackages = [];
    for (const name of candidatePackageNames) {
      if (excludeByName.has(name)) continue;
      const pkgDir = join(REPO_ROOT, "packages", name);
      if (!existsSync(join(pkgDir, "dist"))) {
        // No local build for this package -> the real `npm run generate-docs`
        // would silently skip it too (dynamicallyLoadExtensionPackages only
        // considers packages that already have a dist folder). Mirror that,
        // rather than failing loudly for a package nobody built locally.
        log(`Skipping extension ${name}: no local dist/ (generate-docs would skip it too)`);
        continue;
      }
      run("npm", ["run", "build:meta"], pkgDir, `Building metadata for extension ${name}`);
      activePackages.push(name);
    }

    // --- Generate into a scratch directory. The working tree is never
    // written to below this point.
    tmpDir = await mkdtemp(join(tmpdir(), "xmlui-reference-drift-"));
    await generateReferenceDocs(tmpDir, activePackages);

    // --- Compare.
    const drift = [];
    drift.push(...(await compareDir(join(tmpDir, "components"), join(COMMITTED_REFERENCE_ROOT, "components"), "components")));
    for (const pkg of activePackages) {
      drift.push(
        ...(await compareDir(
          join(tmpDir, "extensions", pkg),
          join(COMMITTED_REFERENCE_ROOT, "extensions", pkg),
          `extensions/${pkg}`,
        )),
      );
    }

    drift.sort();

    if (drift.length > 0) {
      console.error(`Reference drift detected in ${drift.length} file(s) under website/content/docs/reference/:`);
      for (const f of drift) {
        console.error(`  ${f}`);
      }
      process.exitCode = 1;
    } else {
      console.log("No reference drift: committed website/content/docs/reference/** matches generate-docs output.");
    }
  } finally {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  }
}

/**
 * Reimplements the parts of get-docs.mjs's orchestration that write under
 * reference/components and reference/extensions/<package>, redirected to
 * `outRoot` instead of the real website/content/docs/reference tree. Reuses
 * the real DocsGenerator/MetadataProcessor machinery (imported dynamically,
 * after the fresh metadata build above) so the generated content matches
 * what `npm run generate-docs` actually produces.
 *
 * Deliberately NOT reproduced here (out of scope for this check, and would
 * otherwise write into the real tree if it were): components.json /
 * extensions.json nav JSON, dist/metadata/landing-metadata.json, and the
 * script-local scripts/generate-docs/metadata/*.json export.
 */
async function generateReferenceDocs(outRoot, activePackages) {
  const { DocsGenerator } = await import(pathToFileURL(join(GENDOCS_DIR, "DocsGenerator.mjs")).href);
  const { configManager, pathResolver } = await import(
    pathToFileURL(join(GENDOCS_DIR, "configuration-management.mjs")).href
  );
  const { COMPONENT_STATES, METADATA_PROPERTIES, SUMMARY_CONFIG, TEMPLATE_STRINGS } = await import(
    pathToFileURL(join(GENDOCS_DIR, "constants.mjs")).href
  );
  const { deleteFileIfExists } = await import(pathToFileURL(join(GENDOCS_DIR, "utils.mjs")).href);

  // --- Components (freshly rebuilt above).
  const metadataModuleUrl = pathToFileURL(join(XMLUI_ROOT, "dist/metadata/xmlui-metadata.cjs")).href;
  const { collectedComponentMetadata } = await import(metadataModuleUrl);

  const components = Object.fromEntries(
    Object.entries(collectedComponentMetadata).filter(
      ([, compData]) => compData[METADATA_PROPERTIES.IS_HTML_TAG] !== true,
    ),
  );

  const componentsOut = join(outRoot, "components");
  await mkdir(componentsOut, { recursive: true });

  const componentsConfig = await configManager.loadComponentsConfig();
  const componentsGenerator = new DocsGenerator(
    components,
    {
      sourceFolder: pathResolver.resolvePath("xmlui/src/components", "workspace"),
      outFolder: componentsOut,
    },
    { excludeComponentStatuses: componentsConfig?.excludeComponentStatuses ?? [] },
  );
  componentsGenerator.generateDocs();
  await writeComponentsOverview(componentsOut, SUMMARY_CONFIG, collectedComponentMetadata);
  await componentsGenerator.generatePermalinksForHeaders();

  // --- Extensions (freshly rebuilt above, one package at a time).
  const extensionsConfig = await configManager.loadExtensionsConfig();
  const extensionsOut = join(outRoot, "extensions");
  await mkdir(extensionsOut, { recursive: true });

  for (const packageName of activePackages) {
    const pkgDir = join(REPO_ROOT, "packages", packageName);
    const metaPath = join(pkgDir, "dist", `${packageName}-metadata.js`);
    if (!existsSync(metaPath)) {
      log(`Skipping extension ${packageName}: build:meta did not produce ${relative(REPO_ROOT, metaPath)}`);
      continue;
    }
    const { componentMetadata } = await import(pathToFileURL(metaPath).href);
    if (!componentMetadata?.metadata) continue;
    if (componentMetadata.state === COMPONENT_STATES.INTERNAL) continue;

    const packageFolder = join(extensionsOut, packageName);
    await mkdir(packageFolder, { recursive: true });

    const extensionGenerator = new DocsGenerator(
      componentMetadata.metadata,
      { sourceFolder: pkgDir, outFolder: packageFolder },
      { excludeComponentStatuses: extensionsConfig?.excludeComponentStatuses ?? [] },
    );
    const componentsAndFileNames = extensionGenerator.generateDocs();
    if (Object.keys(componentsAndFileNames).length === 0) {
      await rm(packageFolder, { recursive: true, force: true });
      continue;
    }

    const indexFile = join(packageFolder, `${SUMMARY_CONFIG.EXTENSIONS.fileName}.md`);
    deleteFileIfExists(indexFile);
    await extensionGenerator.generatePackageDescription(
      componentMetadata.description ?? "",
      TEMPLATE_STRINGS.PACKAGE_HEADER(packageName),
      indexFile,
    );
    await copyExtensionPackageDocs(pkgDir, packageFolder);
    // Note: the real get-docs.mjs does not call generatePermalinksForHeaders()
    // for extension packages, only for the main components folder. Matched
    // here deliberately.
  }
}

async function writeComponentsOverview(componentsOut, SUMMARY_CONFIG, collectedComponentMetadata) {
  const { writeFile } = await import("fs/promises");
  const summaryFileName = SUMMARY_CONFIG.COMPONENTS.fileName;
  const summaryTitle = SUMMARY_CONFIG.COMPONENTS.title;

  const componentNames = Object.keys(collectedComponentMetadata)
    .filter((name) => {
      const compData = collectedComponentMetadata[name];
      return compData?.isHtmlTag !== true;
    })
    .sort();

  const tableHeader = `# ${summaryTitle} [#components-overview]\n\n| Component | Description |\n| :---: | --- |`;
  const tableRows = componentNames.map((componentName) => {
    const description = collectedComponentMetadata[componentName]?.description || "No description available";
    return `| [${componentName}](/docs/reference/components/${componentName}) | ${description} |`;
  });
  const content = [tableHeader, ...tableRows].join("\n");
  await writeFile(join(componentsOut, `${summaryFileName}.md`), content);
}

async function copyExtensionPackageDocs(sourceFolder, outFolder) {
  const { copyFile } = await import("fs/promises");
  const { extname, basename } = await import("path");
  const docsFolder = join(sourceFolder, "docs");
  if (!existsSync(docsFolder)) return;

  const docFiles = (await readdir(docsFolder)).filter((file) => [".md", ".mdx"].includes(extname(file)));
  for (const file of docFiles) {
    await copyFile(join(docsFolder, file), join(outFolder, file));
  }
}

/**
 * Full 1:1 comparison between a freshly generated directory and its
 * committed counterpart. Both directories are treated as authoritative for
 * the file set the real generator manages (cleanFolder:true means the real
 * run would remove any committed file that generation no longer produces),
 * so files present on only one side count as drift too.
 */
async function compareDir(generatedDir, committedDir, label) {
  const generatedFiles = await listMarkdownFiles(generatedDir);
  const committedFiles = await listMarkdownFiles(committedDir);
  const allRelPaths = new Set([...generatedFiles.keys(), ...committedFiles.keys()]);

  const drift = [];
  for (const relPath of allRelPaths) {
    const genContent = generatedFiles.get(relPath);
    const committedContent = committedFiles.get(relPath);
    if (genContent === undefined) {
      drift.push(`website/content/docs/reference/${label}/${relPath} (committed, but generate-docs no longer produces it)`);
    } else if (committedContent === undefined) {
      drift.push(`website/content/docs/reference/${label}/${relPath} (generate-docs would produce this, but it is not committed)`);
    } else if (genContent !== committedContent) {
      drift.push(`website/content/docs/reference/${label}/${relPath}`);
    }
  }
  return drift;
}

async function listMarkdownFiles(dir) {
  const map = new Map();
  if (!existsSync(dir)) return map;
  await walk(dir, dir, map);
  return map;
}

async function walk(root, dir, map) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(root, full, map);
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      const relPath = relative(root, full);
      map.set(relPath, await readFile(full, "utf8"));
    }
  }
}

main().catch((error) => {
  console.error(`[check-reference-drift] FAILED: ${error.message}`);
  if (error.stack) console.error(error.stack);
  process.exitCode = 1;
});
