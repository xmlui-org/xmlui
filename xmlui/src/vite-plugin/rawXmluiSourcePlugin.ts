import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

export function rawPackageXmluiSourcePlugin(): Plugin {
  return {
    name: "xmlui-rs:raw-package-xmlui-source",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith(".xmlui") || !isPackageXmlui(id)) {
        return null;
      }
      const source = await readFile(id, "utf8");
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

function isPackageXmlui(id: string): boolean {
  const normalized = id.split(path.sep).join("/");
  return normalized.includes("/packages/") || normalized.includes("/node_modules/");
}
