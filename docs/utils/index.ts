import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import componentsSection from "../navSections/components.json";
import extensionsSection from "../navSections/extensions.json";
import extensions from "../extensions";

// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import scss from "@shikijs/langs/scss";
// @ts-ignore
import css from "@shikijs/langs/css";
// @ts-ignore
import json from "@shikijs/langs/json";
// @ts-ignore
import html from "@shikijs/langs/html";

import { xmluiGrammar, xmluiThemeLight, xmluiThemeDark } from "xmlui/syntax/textmate";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import stripMarkdown from "strip-markdown";

export { componentsSection, extensionsSection, extensions };

export function markdownToPlainText(markdown: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(stripMarkdown, { keep: ["code"] })
    .use(remarkStringify);

  const file = processor.processSync(markdown);

  let cleanedText = String(file);

  cleanedText = cleanedText.replace(/\\?\[!\w+\]\s*/g, "");
  cleanedText = cleanedText.replace(/\s*\\\[#.*?\]/g, "");

  const lines = cleanedText.split("\n");
  const reformattedLines = lines.map((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.match(/^\|(?:\s*---\s*\|)+$/)) {
      return null;
    }
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      return trimmedLine
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim())
        .join(" - ");
    }

    if (trimmedLine.startsWith("```") || trimmedLine.startsWith("---")) {
      return null;
    }
    return line;
  });

  cleanedText = reformattedLines.filter((line) => line !== null).join("\n");
  cleanedText = cleanedText.replace(/(\r\n|\n){3,}/g, "\n\n");
  return cleanedText.trim();
}

// @ts-ignore
const contentRuntime: Record<string, any> = import.meta.glob(`/content/**/*.{md,mdx}`, {
  eager: true,
  query: "?raw",
});

// @ts-ignore
const metaJsons: Record<string, MetaJson> = import.meta.glob(`/content/**/_meta.json`, {
  eager: true,
});

export const content: Record<string, any> = {};
export const plainTextContent: Record<string, string> = {};
const navPanelContent: any[] = [];
Object.keys(contentRuntime).map((filePath) => {
  let urlFragment: string;

  if (filePath.startsWith("/content/pages/")) {
    urlFragment = filePath.substring("/content/".length);
  } else {
    urlFragment = filePath.substring("/content/".length).replace(/\.(md|mdx)$/, "");
    navPanelContent.push(urlFragment);
    plainTextContent[urlFragment] = markdownToPlainText(contentRuntime[filePath].default);
  }

  content[urlFragment] = contentRuntime[filePath].default;
});

export const shikiHighlighter = createHighlighterCoreSync({
  // @ts-ignore
  langs: [js, json, html, xmluiGrammar, css, scss],
  // @ts-ignore
  themes: [xmluiThemeLight, xmluiThemeDark],
  engine: createJavaScriptRegexEngine(),
});

export function highlight(
  code: string,
  lang: string,
  meta?: Record<string, any>,
  themeTone: "dark" | "light" = "light",
) {
  if (!code) return "";
  if (!themeTone) themeTone = "light";
  if (!["dark", "light"].includes(themeTone)) {
    themeTone = "light";
  }

  const highlightedRows: DecorationItem[] =
    meta?.highlightRows?.map((row: DecorationItem) => {
      return {
        start: row.start,
        end: row.end,
        properties: row.properties,
      };
    }) ?? [];

  const highlightedSubstrings: DecorationItem[] =
    [...(meta?.highlightSubstringsEmphasized ?? []), ...(meta?.highlightSubstrings ?? [])]?.map(
      (str: DecorationItem) => {
        return {
          start: str.start,
          end: str.end,
          properties: str.properties,
        };
      },
    ) ?? [];

  const opts = {
    lang,
    theme: `xmlui-${themeTone}`,
    decorations: [...highlightedRows, ...highlightedSubstrings],
  };
  return shikiHighlighter.codeToHtml(code, opts);
}

type TreeNode = {
  name: string;
  path: string;
  title?: string;
  type?: string;
  children?: TreeNode[];
};

type MetaJson = Record<string, any>;

function omitIndexFromPath(path: string) {
  return path.endsWith("index") ? path.substring(0, path.length - "index".length) : path;
}

function buildTreeFromPathsAndMeta(paths: string[], metaByFolder: Record<string, MetaJson>): TreeNode[] {
  const root: TreeNode[] = [];

  paths.forEach((path) => {
    const parts = path.split("/");
    let currentPath = "/content";
    let currentLevel: TreeNode[] | undefined = root;

    parts.forEach((part, index) => {
      let existingNode = currentLevel?.find((node) => node.name === part);

      if (!existingNode) {
        const meta = metaByFolder[currentPath + "/_meta.json"];
        let title, type;

        if (meta?.default?.[part]) {
          const metaEntry = meta.default[part];
          if (typeof metaEntry === "string") {
            title = metaEntry;
          } else if (typeof metaEntry === "object") {
            title = metaEntry.title;
            type = metaEntry.type;
          }
        }

        existingNode = {
          name: part,
          title: title || part,
          path: omitIndexFromPath(path),
          ...(type && { type }),
        };
        if (existingNode) {
          currentLevel?.push(existingNode);
        }
      }

      if (index < parts.length - 1) {
        if (existingNode && !existingNode?.children) {
          existingNode.children = [];
        }
        currentLevel = existingNode?.children;
      }
      currentPath += `/${part}`;
    });
  });

  function sortChildren(level: TreeNode[], path: string) {
    const meta = metaByFolder[path + "/_meta.json"];
    if (!meta?.default) return;

    const order = Object.keys(meta.default);
    order.forEach((orderKey) => {
      if (!level.find((item) => item.name === orderKey)) {
        level.push({
          name: orderKey,
          ...meta.default[orderKey],
        });
      }
    });
    level.sort((a, b) => {
      const aIndex = order.indexOf(a.name);
      const bIndex = order.indexOf(b.name);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    level.forEach((node) => {
      if (node.children) {
        sortChildren(node.children, `${path}/${node.name}`);
      }
    });
  }

  sortChildren(root, "/content");
  return root;
}

export const groupedNavPanelContent = buildTreeFromPathsAndMeta(navPanelContent, metaJsons);
