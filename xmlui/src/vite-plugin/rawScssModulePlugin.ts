import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
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
      let resolved = path.resolve(basedir, filename);
      if (filename.startsWith("src/") && !existsSync(resolved)) {
        resolved = path.resolve(process.cwd(), "xmlui", filename);
      }
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
        const cssModule = scssModuleToCss(source, filename);
        const styleId = `xmlui-css-module-${Buffer.from(filename).toString("base64url")}`;
        return [
          `const css = ${JSON.stringify(cssModule.css)};`,
          `if (typeof document !== "undefined" && !document.getElementById(${JSON.stringify(styleId)})) {`,
          `  const style = document.createElement("style");`,
          `  style.id = ${JSON.stringify(styleId)};`,
          `  style.textContent = css;`,
          `  document.head.appendChild(style);`,
          `}`,
          `export default ${JSON.stringify(cssModule.classes)};`,
        ].join("\n");
      }
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

function scssModuleToCss(source: string, filename: string): { css: string; classes: Record<string, string> } {
  const css = source
    .replace(/\/\/.*$/gm, "")
    .replace(/@function\s+createThemeVar\s*\([^)]*\)\s*{[\s\S]*?^}/m, "")
    .replace(/^\s*\$[^;\n]+;\s*$/gm, "")
    .replace(/:export\s*{[\s\S]*?}/g, "")
    .trim();
  const globalPlaceholders: string[] = [];
  const cssWithoutGlobals = css.replace(/:global\(([^)]*)\)/g, (_match, selector: string) => {
    const placeholder = `__XMLUI_GLOBAL_${globalPlaceholders.length}__`;
    globalPlaceholders.push(selector);
    return placeholder;
  });
  const classNames = [...new Set([...cssWithoutGlobals.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)]
    .map((match) => match[1]))].sort();
  const classes = Object.fromEntries(classNames.map((name) => [
    name,
    shouldScopeClassName(name) ? scopedClassName(filename, name) : name,
  ]));
  const scopedCss = cssWithoutGlobals
    .replace(/\.([A-Za-z_][A-Za-z0-9_-]*)/g, (match, name: string) => {
      const scoped = classes[name];
      return scoped ? `.${scoped}` : match;
    })
    .replace(/__XMLUI_GLOBAL_(\d+)__/g, (_match, index: string) => globalPlaceholders[Number(index)] ?? "");
  return { css: scopedCss, classes };
}

function scopedClassName(filename: string, className: string): string {
  const componentName = path.basename(filename).replace(/\.module\.scss$/, "");
  const scope = createHash("sha1").update(filename).digest("base64url").slice(0, 6);
  return `${componentName}_${className}_${scope}`;
}

function shouldScopeClassName(className: string): boolean {
  return !className.startsWith("xmlui") && !/[A-Z]/.test(className);
}
