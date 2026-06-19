import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = resolve(root, "dist", "standalone", "xmlui-latest.js");
const samples = [
  "counter-components",
  "style-mutation",
  "routing-state",
];

for (const sample of samples) {
  const targetDir = resolve(root, "standalone-samples", sample, "xmlui");
  await mkdir(targetDir, { recursive: true });
  await copyFile(bundle, resolve(targetDir, "xmlui-latest.js"));
}

console.log("Prepared standalone samples.");

