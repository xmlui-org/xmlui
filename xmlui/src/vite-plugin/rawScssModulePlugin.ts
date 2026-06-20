import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

const virtualPrefix = "\0xmlui-theme-vars:";

export function rawScssModulePlugin(): Plugin {
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
