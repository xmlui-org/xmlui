import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "dist-production");
const indexPath = path.join(outDir, "index.html");

if (!existsSync(indexPath)) {
  throw new Error(`Production output is missing ${indexPath}.`);
}

const indexHtml = await readFile(indexPath, "utf-8");
const moduleMatch = indexHtml.match(/<script type="module"[^>]+src="([^"]+\.mjs)"/);

if (!moduleMatch) {
  throw new Error("Production index.html does not reference an .mjs module script.");
}

if (indexHtml.includes("/src/main.tsx") || indexHtml.includes("/src/production/main.tsx")) {
  throw new Error("Production index.html still references a source .tsx entry.");
}

const modulePath = path.resolve(outDir, moduleMatch[1]);
if (!modulePath.startsWith(`${outDir}${path.sep}`) || !existsSync(modulePath)) {
  throw new Error(`Production module referenced by index.html does not exist: ${moduleMatch[1]}`);
}

const mockApiPath = path.join(outDir, "mockApi.js");
if (!existsSync(mockApiPath)) {
  throw new Error("Production output is missing the mockApi.js compatibility stub.");
}

const diagnosticPath = path.join(outDir, "production-check.json");
if (!existsSync(diagnosticPath)) {
  throw new Error("Production output is missing production-check.json.");
}

const metadataPath = path.join(outDir, "xmlui-metadata.json");
if (!existsSync(metadataPath)) {
  throw new Error("Production output is missing xmlui-metadata.json.");
}

console.log(`Verified production output: ${path.relative(process.cwd(), indexPath)} -> ${moduleMatch[1]}`);
