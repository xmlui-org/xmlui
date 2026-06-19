import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const xmluiRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(xmluiRoot, "..");
const inventoryPath = resolve(repoRoot, ".ai/compatibility-inventory.md");
const templatePath = resolve(repoRoot, ".ai/component-compatibility-closure-template.md");

const requiredTemplateSections = [
  "## Source Organization",
  "## Original Source Anchors",
  "## Compatibility Tests",
  "## Verification",
];

const inventory = readFileSync(inventoryPath, "utf8");
const template = readFileSync(templatePath, "utf8");
const errors = [];

for (const section of requiredTemplateSections) {
  if (!template.includes(section)) {
    errors.push(`Closure template is missing ${section}.`);
  }
}

const componentRows = inventory
  .split("\n")
  .filter((line) => line.startsWith("| ") && !line.startsWith("| Component") && !line.startsWith("| ---"))
  .map((line) => line.split("|").map((cell) => cell.trim()))
  .filter((cells) => cells.length >= 5 && cells[2].startsWith("`xmlui/src/components/"));

for (const cells of componentRows) {
  const name = cells[1];
  const status = cells[3];
  if (status !== "closed") {
    continue;
  }

  const componentDir = resolve(xmluiRoot, "src/components", name);
  const closureNote = resolve(repoRoot, ".ai", `${name}-compatibility-closure.md`);
  const transferredTests = resolve(componentDir, "__tests__/transferred");
  const indexFile = resolve(componentDir, "index.ts");

  if (!existsSync(componentDir)) {
    errors.push(`${name} is closed but ${componentDir} does not exist.`);
  }
  if (!existsSync(indexFile)) {
    errors.push(`${name} is closed but ${indexFile} does not exist.`);
  }
  if (!existsSync(closureNote)) {
    errors.push(`${name} is closed but ${closureNote} does not exist.`);
  }
  if (!existsSync(transferredTests)) {
    errors.push(`${name} is closed but ${transferredTests} does not exist.`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[component-transfer] ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("[component-transfer] component transfer scaffold checks passed");
}
