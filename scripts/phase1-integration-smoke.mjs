import { readFile } from "node:fs/promises";

const rootPackage = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const xmluiPackage = JSON.parse(await readFile(new URL("../xmlui/package.json", import.meta.url), "utf8"));
const debt = await readFile(new URL("../.ai/compatibility-debt.md", import.meta.url), "utf8");
const inventory = await readFile(new URL("../.ai/compatibility-inventory.md", import.meta.url), "utf8");

const requiredRootScripts = [
  "build-xmlui",
  "build-vscode-extension",
  "build-extensions",
  "build-docs",
  "build-playground",
  "generate-docs",
  "test",
  "test-smoke",
  "test-integration",
  "compatibility:sweep",
];

const requiredXmluiScripts = [
  "build:xmlui",
  "build:xmlui-standalone",
  "build:xmlui-metadata",
  "test:unit",
  "test:e2e",
  "check:metadata",
  "generate-docs",
  "compatibility:sweep",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const script of requiredRootScripts) {
  assert(rootPackage.scripts?.[script], `Missing root script '${script}'.`);
}

for (const script of requiredXmluiScripts) {
  assert(xmluiPackage.scripts?.[script], `Missing xmlui script '${script}'.`);
}

for (const id of ["COMP-0002", "COMP-0003", "COMP-0006", "COMP-0007", "COMP-0008"]) {
  assert(debt.includes(id), `Missing compatibility debt entry '${id}'.`);
}

for (const surface of [
  "Framework package exports",
  "Integration tests",
  "Release workflows",
  "Create app utility",
]) {
  assert(inventory.includes(surface), `Missing inventory surface '${surface}'.`);
}

console.log("Phase 1 integration smoke passed.");
