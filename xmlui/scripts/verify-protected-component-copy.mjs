#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const componentName = process.argv[2];
if (!componentName) {
  console.error("Usage: node xmlui/scripts/verify-protected-component-copy.mjs <Component>");
  process.exit(2);
}

const packageRoot = path.resolve(new URL("..", import.meta.url).pathname);
const originalRoot = process.env.XMLUI_ORIGINAL_COMPONENTS ??
  "/Users/dotneteer/source/xmlui/xmlui/src/components";
const rewriteRoot = path.join(packageRoot, "src/components");
const manifestPath = path.join(packageRoot, "scripts/protected-component-copy-manifest.json");

const manifest = existsSync(manifestPath)
  ? JSON.parse(await readFile(manifestPath, "utf8"))
  : {};

const originalDir = path.join(originalRoot, componentName);
const rewriteDir = path.join(rewriteRoot, componentName);

if (!existsSync(originalDir)) {
  console.error(`Original component folder not found: ${originalDir}`);
  process.exit(2);
}

const files = await protectedFiles(originalDir, componentName, manifest[componentName]);
let failed = false;

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
  if (file === `${componentName}.tsx` || file === `${componentName}.ts`) {
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
  console.log(`${file}: drifted`);
  failed = true;
}

process.exit(failed ? 1 : 0);

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
    .map((line) => isImportExportLine(line) ? "<import-export>" : line)
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
