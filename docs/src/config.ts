import type { StandaloneAppDescription } from "xmlui";
import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import json from "@shikijs/langs/json";

// @ts-ignore
import html from "@shikijs/langs/html";


import xmluiGrammar from "./syntax/grammar.tmLanguage.json";
import xmluiThemeLight from "./syntax/textMate/xmlui-light.json";
import xmluiThemeDark from "./syntax/textMate/xmlui-dark.json";


import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import stripMarkdown from 'strip-markdown'

export function markdownToPlainText(markdown: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(stripMarkdown, {keep: ['code']})
    .use(remarkStringify);

  const file = processor.processSync(markdown);

  let cleanedText = String(file);

  // NEW: Remove admonition tags like [!WARNING] or \[!NOTE]
  // This looks for an optional backslash, then "[!", any word, and "]"
  cleanedText = cleanedText.replace(/\\?\[!\w+\]\s*/g, '');
  // 1. Remove the anchor-like tags, e.g., "\[#button]"
  cleanedText = cleanedText.replace(/\s*\\\[#.*?\]/g, '');

  // 2. Process each line individually to reformat tables
  const lines = cleanedText.split('\n');
  const reformattedLines = lines.map(line => {
    const trimmedLine = line.trim();

    // Check if the line is a table separator like "| --- | --- |"
    if (trimmedLine.match(/^\|(?:\s*---\s*\|)+$/)) {
      return null; // Mark this line for removal
    }
    // Check if the line is a table row (starts and ends with '|')
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      // Remove leading/trailing pipes, then split into cells
      return trimmedLine
        .slice(1, -1)
        .split('|')
        .map(cell => cell.trim()) // Trim whitespace from each cell
        .join(' - '); // Join cells with a more readable separator
    }


    // filter code block header/footers
    if(trimmedLine.startsWith('```') || trimmedLine.startsWith('---')){
      return null;
    }
    // If it's not a table line, return it as is
    return line;
  });

  // 3. Filter out the removed separator lines and join back into a string
  cleanedText = reformattedLines.filter(line => line !== null).join('\n');

  // 4. Consolidate multiple consecutive newlines into a maximum of two
  cleanedText = cleanedText.replace(/(\r\n|\n){3,}/g, '\n\n');

  // 5. Trim any leading or trailing whitespace from the final result
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

const content: Record<string, any> = {};
const plainTextContent: Record<string, string> = {};
const navPanelContent: any[] = [];
Object.keys(contentRuntime).map((filePath) => {
  const urlFragment = filePath.substring("/content/".length).replace(".mdx", "").replace(".md", "");
  content[omitIndexFromPath(urlFragment)] = contentRuntime[filePath].default;
  plainTextContent[omitIndexFromPath(urlFragment)] = markdownToPlainText(contentRuntime[filePath].default);
  navPanelContent.push(urlFragment);
});

const pagesRuntime: Record<string, any> = import.meta.glob(`/public/pages/**/*.md`, {
  eager: true,
  query: "?raw",
});

const prefetchedContent: Record<string, any> = {};
Object.keys(pagesRuntime).map((filePath) => {
  const urlFragment = filePath.substring("/public".length);
  prefetchedContent[urlFragment] = pagesRuntime[filePath].default;
});

const shikiHighlighter = createHighlighterCoreSync({
  // @ts-ignore
  langs: [js, json, html, xmluiGrammar],
  // @ts-ignore
  themes: [xmluiThemeLight, xmluiThemeDark],
  engine: createJavaScriptRegexEngine(),
});

function highlight(
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
        // line and character are 0-indexed
        start: { line: row.start, character: 0 },
        end: { line: row.end, character: 0 },
        properties: row.properties,
      };
    }) ?? [];

  const highlightedSubstrings: DecorationItem[] =
    [...(meta?.highlightSubstringsEmphasized ?? []), ...(meta?.highlightSubstrings ?? [])]?.map(
      (str: DecorationItem) => {
        return {
          // line and character are 0-indexed
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

// generated with chatgpt
function buildTreeFromPathsAndMeta(
  paths: string[],
  metaByFolder: Record<string, MetaJson>,
): TreeNode[] {
  const root: TreeNode[] = [];

  paths.forEach((path) => {
    const parts = path.split("/");
    let currentPath = "/content";
    let currentLevel: TreeNode[] | undefined = root;

    parts.forEach((part, index) => {
      let existingNode = currentLevel?.find((node) => node.name === part);

      if (!existingNode) {
        // --- Look up title/type in meta
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

  // Function to sort children based on _meta.json order
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

const groupedNavPanelContent = buildTreeFromPathsAndMeta(navPanelContent, metaJsons);
const App: StandaloneAppDescription = {
  name: "XMLUI docs",
  defaultTheme: "default",
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
    "font.Inter":
      "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  appGlobals: {
    searchIndexEnabled: true,
    navPanelContent: groupedNavPanelContent,
    content,
    plainTextContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    prefetchedContent,
  },
};

export default App;
