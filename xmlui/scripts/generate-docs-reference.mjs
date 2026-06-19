import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const metadataPath = path.resolve(process.cwd(), "dist-metadata/xmlui-metadata.json");
const outDir = path.resolve(process.cwd(), "dist-docs-reference");
const componentsDir = path.join(outDir, "components");

if (!existsSync(metadataPath)) {
  throw new Error("Metadata artifact not found. Run npm run build:metadata first.");
}

const metadata = JSON.parse(await readFile(metadataPath, "utf-8"));
await mkdir(componentsDir, { recursive: true });

await writeFile(
  path.join(outDir, "components.json"),
  `${JSON.stringify(metadata.components, null, 2)}\n`,
);
await writeFile(
  path.join(outDir, "nav-components.json"),
  `${JSON.stringify({
    title: "Components",
    items: metadata.components.map((component) => ({
      label: component.name,
      to: `/docs/reference/components/${component.name}`,
    })),
  }, null, 2)}\n`,
);

for (const component of metadata.components) {
  await writeFile(path.join(componentsDir, `${component.name}.md`), componentMarkdown(component));
}

console.log(`Generated docs reference: ${path.relative(process.cwd(), outDir)}`);
console.log(`Components: ${metadata.components.length}`);

function componentMarkdown(component) {
  const lines = [
    `# ${component.name}`,
    "",
    component.description,
    "",
    "## Props",
    "",
    component.props.length > 0
      ? `| Name | Type | Description |\n|---|---|---|\n${component.props.map((prop) => `| ${prop.name} | ${prop.type} | ${prop.description} |`).join("\n")}`
      : "This component has no documented props in the current metadata subset.",
    "",
    "## Events",
    "",
    component.events.length > 0
      ? `| Attribute | Description |\n|---|---|\n${component.events.map((event) => `| ${event.attributeName} | ${event.description} |`).join("\n")}`
      : "This component has no documented events in the current metadata subset.",
    "",
  ];
  if (component.contextVariables.length > 0) {
    lines.push("## Context Variables", "");
    lines.push(component.contextVariables.map((item) => `- \`${item.name}\`: ${item.description}`).join("\n"));
    lines.push("");
  }
  if (component.apis.length > 0) {
    lines.push("## APIs", "");
    lines.push(component.apis.map((item) => `- \`${item.name}\`: ${item.description}`).join("\n"));
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

