import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const outDir = path.resolve(process.cwd(), "dist-metadata");
const outFile = path.join(outDir, "xmlui-metadata.json");

const server = await createServer({
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "silent",
});

try {
  const metadataModule = await server.ssrLoadModule("/src/metadata/index.ts");
  const artifact = metadataModule.generateXmluiMetadata();
  const errors = metadataModule.validateXmluiMetadataArtifact(artifact);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, metadataModule.metadataToJson(artifact));
  console.log(`Generated XMLUI metadata: ${path.relative(process.cwd(), outFile)}`);
  console.log(`Components: ${artifact.components.length}`);
  console.log(`Examples: ${artifact.examples.length}`);
} finally {
  await server.close();
}

