import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const metadataPath = path.resolve(process.cwd(), "dist-metadata/xmlui-metadata.json");
const outDir = path.resolve(process.cwd(), "dist-docs-reference");
const componentsDir = path.join(outDir, "components");

if (!existsSync(metadataPath)) {
  throw new Error("Metadata artifact not found. Run npm run build:metadata first.");
}

const metadata = JSON.parse(await readFile(metadataPath, "utf-8"));
const server = await createServer({
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "silent",
});
try {
  const { generateComponentReferenceMarkdown } = await server.ssrLoadModule("/src/metadata/componentDocs.ts");

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
    await writeFile(
      path.join(componentsDir, `${component.name}.md`),
      generateComponentReferenceMarkdown(component),
    );
  }

  console.log(`Generated docs reference: ${path.relative(process.cwd(), outDir)}`);
  console.log(`Components: ${metadata.components.length}`);
} finally {
  await server.close();
}
