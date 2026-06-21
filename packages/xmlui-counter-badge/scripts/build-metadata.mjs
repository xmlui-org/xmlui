import { mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

function rawScssModulePlugin() {
  const virtualPrefix = "\0xmlui-theme-vars:";
  return {
    name: "xmlui-rs:raw-scss-module",
    enforce: "pre",
    resolveId(source, importer) {
      const [filename, query = ""] = source.split("?");
      if (
        !query.split("&").includes("xmlui-theme-vars") ||
        !filename.endsWith(".module.scss")
      ) {
        return null;
      }
      const basedir = importer ? path.dirname(importer) : process.cwd();
      const resolved = path.resolve(basedir, filename);
      return `${virtualPrefix}${Buffer.from(resolved).toString("base64url")}`;
    },
    async load(id) {
      if (!id.startsWith(virtualPrefix)) {
        return null;
      }
      const filename = Buffer.from(id.slice(virtualPrefix.length), "base64url").toString("utf8");
      const source = await readFile(filename, "utf8");
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
  plugins: [rawScssModulePlugin()],
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
