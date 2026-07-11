#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const packageArgIndex = args.indexOf("--package");
const packageName = packageArgIndex >= 0 ? args[packageArgIndex + 1] : undefined;
const componentName = args.find((arg, index) => index !== packageArgIndex && index !== packageArgIndex + 1);

if (!componentName && !packageName) {
  console.error("Usage: node xmlui/scripts/verify-protected-component-copy.mjs <Component>");
  console.error("   or: node xmlui/scripts/verify-protected-component-copy.mjs --package <package-name>");
  process.exit(2);
}

const packageRoot = path.resolve(new URL("..", import.meta.url).pathname);
const originalRoot = process.env.XMLUI_ORIGINAL_COMPONENTS ??
  "/Users/dotneteer/source/xmlui/xmlui/src/components";
const rewriteRoot = path.join(packageRoot, "src/components");
const manifestPath = path.join(packageRoot, "scripts/protected-component-copy-manifest.json");
const packageManifestPath = path.join(packageRoot, "scripts/protected-package-copy-manifest.json");

const manifest = existsSync(manifestPath)
  ? JSON.parse(await readFile(manifestPath, "utf8"))
  : {};
const packageManifest = existsSync(packageManifestPath)
  ? JSON.parse(await readFile(packageManifestPath, "utf8"))
  : {};
let failed = false;

if (packageName) {
  await verifyExtensionPackage(packageName);
  process.exit(failed ? 1 : 0);
}

const originalDir = path.join(originalRoot, componentName);
const rewriteDir = path.join(rewriteRoot, componentName);

if (!existsSync(originalDir)) {
  console.error(`Original component folder not found: ${originalDir}`);
  process.exit(2);
}

const manifestEntry = manifest[componentName];
const files = await protectedFiles(originalDir, componentName, manifestEntry);
const entryAdaptedFiles = entryAdaptedManifestFiles(manifestEntry);
const testAdaptedFiles = testAdaptedManifestFiles(manifestEntry);

for (const file of files) {
  const originalFile = path.join(originalDir, file);
  const rewriteFile = path.join(rewriteDir, file);
  if (!existsSync(rewriteFile)) {
    console.log(`${file}: missing`);
    failed = true;
    continue;
  }
  const original = await readFile(originalFile, "utf8");
  const rewrite = await readFile(rewriteFile, "utf8");
  if (original === rewrite) {
    console.log(`${file}: identical`);
    continue;
  }
  if (file === `${componentName}.tsx` || file === `${componentName}.ts` || entryAdaptedFiles.has(file)) {
    const normalizedOriginalEntry = normalizeEntryFile(original);
    const normalizedRewriteEntry = normalizeEntryFile(rewrite);
    if (
      normalizedRewriteEntry === normalizedOriginalEntry ||
      normalizedRewriteEntry.startsWith(`${normalizedOriginalEntry}\n`)
    ) {
      console.log(`${file}: entry-adapted`);
      continue;
    }
  }
  const normalizedOriginal = normalizeImportExportLines(original);
  const normalizedRewrite = normalizeImportExportLines(rewrite);
  if (normalizedOriginal === normalizedRewrite) {
    console.log(`${file}: import-only`);
    continue;
  }
  if (testAdaptedFiles.has(file) && file.endsWith(".spec.ts")) {
    console.log(`${file}: test-adapted`);
    continue;
  }
  console.log(`${file}: drifted`);
  failed = true;
}

process.exit(failed ? 1 : 0);

async function verifyExtensionPackage(name) {
  const repoRoot = path.resolve(packageRoot, "..");
  const originalPackageDir = path.join("/Users/dotneteer/source/xmlui/packages", name);
  const rewritePackageDir = path.join(repoRoot, "packages", name);

  if (!existsSync(originalPackageDir)) {
    console.error(`Original package folder not found: ${originalPackageDir}`);
    process.exit(2);
  }

  if (!existsSync(rewritePackageDir)) {
    console.error(`Rewrite package folder not found: ${rewritePackageDir}`);
    process.exit(2);
  }

  const files = await protectedPackageFiles(originalPackageDir);
  const sourceAdaptedFiles = new Set(packageManifest[name]?.sourceAdapted ?? []);
  for (const file of files) {
    const originalFile = path.join(originalPackageDir, file);
    const rewriteFile = path.join(rewritePackageDir, file);
    if (!existsSync(rewriteFile)) {
      console.log(`${file}: missing`);
      failed = true;
      continue;
    }

    const original = await readFile(originalFile, "utf8");
    const rewrite = await readFile(rewriteFile, "utf8");
    if (original === rewrite) {
      console.log(`${file}: identical`);
      continue;
    }

    const normalizedOriginal = normalizeImportExportLines(original);
    const normalizedRewrite = normalizeImportExportLines(rewrite);
    if (normalizedOriginal === normalizedRewrite) {
      console.log(`${file}: import-only`);
      continue;
    }
    if (sourceAdaptedFiles.has(file)) {
      console.log(`${file}: source-adapted`);
      continue;
    }

    console.log(`${file}: drifted`);
    failed = true;
  }
}

async function protectedPackageFiles(packageDir) {
  const files = [];
  await collectProtectedPackageFiles(packageDir, packageDir, files);
  return files.sort();
}

async function collectProtectedPackageFiles(rootDir, dir, files) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === "dist-metadata" ||
      entry.name === ".turbo"
    ) {
      continue;
    }

    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectProtectedPackageFiles(rootDir, entryPath, files);
      continue;
    }

    if (entry.isFile() && isProtectedPackageFile(entryPath, rootDir)) {
      files.push(path.relative(rootDir, entryPath));
    }
  }
}

function isProtectedPackageFile(filePath, rootDir) {
  const relativePath = path.relative(rootDir, filePath);
  const name = path.basename(filePath);
  return relativePath === "index.ts" ||
    relativePath === "index.tsx" ||
    relativePath === "index.html" ||
    name === "CHANGELOG.md" ||
    name === "README.md" ||
    relativePath.startsWith("src/") ||
    relativePath.startsWith("meta/") ||
    relativePath.startsWith("demo/");
}

async function protectedFiles(componentDir, component, manifestEntry) {
  const entries = await readdir(componentDir, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => isProtectedFile(name, component));
  const extra = Array.isArray(manifestEntry)
    ? manifestEntry
    : Array.isArray(manifestEntry?.files)
      ? manifestEntry.files
      : [];
  return Array.from(new Set([...fileNames, ...extra])).sort();
}

function entryAdaptedManifestFiles(manifestEntry) {
  const files = Array.isArray(manifestEntry?.entryAdapted)
    ? manifestEntry.entryAdapted
    : [];
  return new Set(files);
}

function testAdaptedManifestFiles(manifestEntry) {
  const files = Array.isArray(manifestEntry?.testAdapted)
    ? manifestEntry.testAdapted
    : [];
  return new Set(files);
}

function isProtectedFile(name, component) {
  return name.endsWith("React.tsx") ||
    name === `${component}.tsx` ||
    name === `${component}.ts` ||
    name.endsWith(".module.scss") ||
    (name.endsWith(".scss") && !name.endsWith(".module.scss")) ||
    name.endsWith(".defaults.ts") ||
    name.endsWith(".md") ||
    name.endsWith(".spec.ts");
}

function normalizeImportExportLines(source) {
  return source
    .split(/\r?\n/)
    .filter((line) => !isImportExportLine(line))
    .join("\n");
}

function normalizeEntryFile(source) {
  return source
    .split(/\r?\n/)
    .filter((line) => !isImportExportLine(line))
    .join("\n")
    .trimEnd();
}

function isImportExportLine(line) {
  const trimmed = line.trim();
  return /^import\b/.test(trimmed) ||
    /^export\b.*\bfrom\s+["']/.test(trimmed);
}
