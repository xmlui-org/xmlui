import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
  resolve: {
    alias: {
      xmlui: path.resolve("../../xmlui/src/index.ts"),
    },
  },
});

try {
  const [{ generateXmluiMetadata, metadataToJson }, extensionModule] = await Promise.all([
    server.ssrLoadModule(path.resolve("../../xmlui/src/metadata/index.ts")),
    server.ssrLoadModule(path.resolve("src/index.ts")),
  ]);
  const artifact = generateXmluiMetadata({ extensions: [extensionModule.default] });
  const outDir = path.resolve("dist-metadata");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "xmlui-counter-badge-metadata.json"), metadataToJson(artifact));
  console.log("Generated extension metadata: dist-metadata/xmlui-counter-badge-metadata.json");
} finally {
  await server.close();
}
