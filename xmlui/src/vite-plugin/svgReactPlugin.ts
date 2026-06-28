import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";

export function svgReactPlugin(): Plugin {
  return {
    name: "xmlui-svg-react",
    enforce: "pre",
    async load(id) {
      const [filename, query] = id.split("?", 2);
      if (!filename.endsWith(".svg") || query !== "react") {
        return null;
      }
      const svg = await readFile(filename, "utf8");
      return svgToReactModule(svg);
    },
  };
}

function svgToReactModule(svg: string): string {
  const normalized = svg.replace(/^\uFEFF/, "").trim();
  const match = normalized.match(/^<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i);
  if (!match) {
    return emptySvgModule();
  }
  const attrs = parseAttributes(match[1]);
  const inner = match[2];
  return [
    `import React from "react";`,
    `const defaultAttrs = ${JSON.stringify(attrs)};`,
    `const innerSvg = ${JSON.stringify(inner)};`,
    `const SvgComponent = React.forwardRef(function SvgComponent(props, ref) {`,
    `  return React.createElement("svg", { ...defaultAttrs, ...props, ref, dangerouslySetInnerHTML: { __html: innerSvg } });`,
    `});`,
    `export default SvgComponent;`,
  ].join("\n");
}

function emptySvgModule(): string {
  return [
    `import React from "react";`,
    `const SvgComponent = React.forwardRef(function SvgComponent(props, ref) {`,
    `  return React.createElement("svg", { ...props, ref });`,
    `});`,
    `export default SvgComponent;`,
  ].join("\n");
}

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of source.matchAll(attrPattern)) {
    const [, rawName, doubleQuoted, singleQuoted] = match;
    const name = toReactAttributeName(rawName);
    if (name === "className") {
      continue;
    }
    attrs[name] = doubleQuoted ?? singleQuoted ?? "";
  }
  return attrs;
}

function toReactAttributeName(name: string): string {
  if (name.startsWith("data-") || name.startsWith("aria-")) {
    return name;
  }
  if (name === "class") {
    return "className";
  }
  return name.replace(/[-:]([a-z])/g, (_match, char: string) => char.toUpperCase());
}
