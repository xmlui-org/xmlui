import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const xmluiRoot = resolve(scriptDir, "..");
const reportDir = resolve(xmluiRoot, ".compatibility-report");
const contractsSource = await readFile(resolve(xmluiRoot, "src/styling/contracts.ts"), "utf8");
const themeSource = await readFile(resolve(xmluiRoot, "src/styling/theme.ts"), "utf8");

const supportedLayoutPropNames = extractStringArray(contractsSource, "supportedLayoutPropNames");
const styleStates = extractStringArray(contractsSource, "styleStates");
const responsiveBreakpoints = extractNumberObject(contractsSource, "responsiveBreakpoints");
const defaultThemeVariables = extractStringObject(themeSource, "defaultThemeVariables");

const report = {
  schemaVersion: 1,
  generatedAt: new Date(0).toISOString(),
  oldSourceAnchors: [
    "/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming",
    "/Users/dotneteer/source/xmlui/xmlui/src/components-core/themevars",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/*/*.defaults.ts",
    "/Users/dotneteer/source/xmlui/xmlui/src/components/*/*.module.scss",
  ],
  supportedLayoutPropNames,
  responsiveBreakpoints,
  styleStates,
  defaultThemeVariables,
  deferred: [
    "Full theme validation",
    "Generated CSS for breakpoint/state selectors",
    "Full visual regression suite",
    "Complete component part/theme variable parity",
  ],
};

const markdown = [
  "# XMLUI Style Artifact Report",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Old Source Anchors",
  "",
  ...report.oldSourceAnchors.map((anchor) => `- \`${anchor}\``),
  "",
  "## Supported Layout Props",
  "",
  ...supportedLayoutPropNames.map((name) => `- \`${name}\``),
  "",
  "## Responsive Breakpoints",
  "",
  ...Object.entries(responsiveBreakpoints).map(([name, value]) => `- \`${name}\`: ${value}px`),
  "",
  "## Style States",
  "",
  ...styleStates.map((name) => `- \`${name}\``),
  "",
  "## Default Theme Variables",
  "",
  ...Object.entries(defaultThemeVariables).map(([name, value]) => `- \`${name}\`: \`${value}\``),
  "",
  "## Deferred",
  "",
  ...report.deferred.map((item) => `- ${item}`),
  "",
].join("\n");

await mkdir(reportDir, { recursive: true });
await writeFile(resolve(reportDir, "style-artifact-latest.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(reportDir, "style-artifact-latest.md"), markdown);

console.log(`[style-artifact] wrote ${resolve(reportDir, "style-artifact-latest.json")}`);
console.log(`[style-artifact] wrote ${resolve(reportDir, "style-artifact-latest.md")}`);

function extractStringArray(source, name) {
  const match = source.match(new RegExp(String.raw`export const ${name} = \[([\s\S]*?)\] as const;`));
  if (!match) {
    throw new Error(`Cannot find ${name}.`);
  }
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function extractNumberObject(source, name) {
  const match = source.match(new RegExp(String.raw`export const ${name} = \{([\s\S]*?)\} as const;`));
  if (!match) {
    throw new Error(`Cannot find ${name}.`);
  }
  return Object.fromEntries([...match[1].matchAll(/([A-Za-z0-9_-]+):\s*([0-9]+)/g)].map((item) => [
    item[1],
    Number(item[2]),
  ]));
}

function extractStringObject(source, name) {
  const match = source.match(
    new RegExp(String.raw`export const ${name}: Record<string, string> = \{([\s\S]*?)\};`),
  );
  if (!match) {
    throw new Error(`Cannot find ${name}.`);
  }
  return Object.fromEntries([...match[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((item) => [
    item[1],
    item[2],
  ]));
}
