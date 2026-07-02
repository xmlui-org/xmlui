import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";

const svgReactSuffix = ".svg?react";

export function svgReactPlugin(): Plugin {
  return {
    name: "xmlui-svg-react",
    enforce: "pre",
    async load(id) {
      if (!id.includes(svgReactSuffix)) {
        return null;
      }
      const fileName = id.slice(0, id.indexOf("?react"));
      const svg = await readFile(fileName, "utf8");
      return svgToReactComponent(svg);
    },
  };
}

function svgToReactComponent(svg: string): string {
  const svgTagMatch = svg.match(/<svg([^>]*)>/);
  const svgTag = svgTagMatch?.[1] ?? "";
  const innerContent = svg
    .replace(/<svg[^>]*>|<\/svg>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const attributes: Record<string, string> = {};
  const attributePattern = /([\w:.-]+)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(svgTag)) !== null) {
    const [, name, value] = match;
    const propName = toReactSvgProp(name);
    if (propName !== "className") {
      attributes[propName] = value;
    }
  }
  const inner = escapeTemplate(innerContent);
  return `
import * as React from "react";

const SvgIcon = React.forwardRef(function SvgIcon(props, ref) {
  const { children: _children, ...rest } = props;
  return React.createElement("svg", {
    ...${JSON.stringify(attributes)},
    ...rest,
    ref,
    dangerouslySetInnerHTML: { __html: \`${inner}\` },
  });
});

export default SvgIcon;
`;
}

function escapeTemplate(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function toReactSvgProp(name: string): string {
  if (/^(data-|aria-)/.test(name)) {
    return name;
  }
  const special: Record<string, string> = {
    class: "className",
    "clip-rule": "clipRule",
    "fill-rule": "fillRule",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-miterlimit": "strokeMiterlimit",
    "stroke-width": "strokeWidth",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "stroke-opacity": "strokeOpacity",
    "fill-opacity": "fillOpacity",
    "stop-color": "stopColor",
    "stop-opacity": "stopOpacity",
    "xmlns:xlink": "xmlnsXlink",
    "xlink:href": "xlinkHref",
  };
  if (special[name]) {
    return special[name];
  }
  return name.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
