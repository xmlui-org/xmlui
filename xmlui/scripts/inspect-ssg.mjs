import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "dist-ssg");
const manifestPath = path.join(outDir, "xmlui-ssg-manifest.json");

if (!existsSync(manifestPath)) {
  throw new Error("SSG output was not found. Run npm run build:ssg first.");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));

console.log(`SSG output: ${path.relative(process.cwd(), outDir)}`);
console.log(`Fallback: ${manifest.fallbackFile}`);
console.log(`Search index: ${manifest.searchIndexFile}`);
console.log("Routes:");
for (const route of manifest.routes ?? []) {
  console.log(`  ${route.path} -> ${route.file} (${route.fixture})`);
}
console.log("Check in browser:");
console.log("  npm run preview:ssg");
console.log("  http://127.0.0.1:8080/");
console.log("  http://127.0.0.1:8080/summary/");
console.log("  http://127.0.0.1:8080/counter-components/");
console.log("  http://127.0.0.1:8080/style-mutation/");

