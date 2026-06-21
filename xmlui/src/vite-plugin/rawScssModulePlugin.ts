import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

const rawVirtualPrefix = "\0xmlui-theme-vars:";
const cssVirtualPrefix = "\0xmlui-css-module:";

export function rawScssModulePlugin(): Plugin {
  return {
    name: "xmlui-rs:raw-scss-module",
    enforce: "pre",
    resolveId(source, importer) {
      const [filename, query = ""] = source.split("?");
      if (
        !query.split("&").some((part) => part === "xmlui-theme-vars" || part === "xmlui-css-module") ||
        !filename.endsWith(".module.scss")
      ) {
        return null;
      }
      const basedir = importer ? path.dirname(importer) : process.cwd();
      const resolved = path.resolve(basedir, filename);
      const prefix = query.split("&").includes("xmlui-css-module")
        ? cssVirtualPrefix
        : rawVirtualPrefix;
      return `${prefix}${Buffer.from(resolved).toString("base64url")}`;
    },
    async load(id) {
      if (!id.startsWith(rawVirtualPrefix) && !id.startsWith(cssVirtualPrefix)) {
        return null;
      }
      const isCssModule = id.startsWith(cssVirtualPrefix);
      const prefix = isCssModule ? cssVirtualPrefix : rawVirtualPrefix;
      const filename = Buffer.from(id.slice(prefix.length), "base64url").toString("utf8");
      const source = await readFile(filename, "utf8");
      if (isCssModule) {
        const css = scssModuleToCss(source);
        const classNames = [...new Set([...css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)]
          .map((match) => match[1]))].sort();
        const styleId = `xmlui-css-module-${Buffer.from(filename).toString("base64url")}`;
        return [
          `const css = ${JSON.stringify(css)};`,
          `if (typeof document !== "undefined" && !document.getElementById(${JSON.stringify(styleId)})) {`,
          `  const style = document.createElement("style");`,
          `  style.id = ${JSON.stringify(styleId)};`,
          `  style.textContent = css;`,
          `  document.head.appendChild(style);`,
          `}`,
          `export default ${JSON.stringify(Object.fromEntries(classNames.map((name) => [name, name])))};`,
        ].join("\n");
      }
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

function scssModuleToCss(source: string): string {
  return source
    .replace(/\/\/.*$/gm, "")
    .replace(/@function\s+createThemeVar\s*\([^)]*\)\s*{[\s\S]*?^}/m, "")
    .replace(/^\s*\$[^;\n]+;\s*$/gm, "")
    .replace(/:export\s*{[\s\S]*?}/g, "")
    .trim();
}
