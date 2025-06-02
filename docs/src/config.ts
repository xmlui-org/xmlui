import type { StandaloneAppDescription } from "xmlui";
import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
// @ts-ignore
import js from "@shikijs/langs/javascript";
// @ts-ignore
import json from "@shikijs/langs/json";

import xmluiGrammar from "./syntax/grammar.tmLanguage.json";
import xmluiThemeLight from "./syntax/textMate/xmlui-light.json";
import xmluiThemeDark from "./syntax/textMate/xmlui-dark.json";

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
const navPanelContent: any[] = [];
Object.keys(contentRuntime).map((filePath) => {
  const urlFragment = filePath.substring("/content/".length).replace(".mdx", "").replace(".md", "");
  content[omitIndexFromPath(urlFragment)] = contentRuntime[filePath].default;
  navPanelContent.push(urlFragment);
});

const pagesRuntime: Record<string, any> = import.meta.glob(`/public/pages/**/*.md`, {
  eager: true,
  query: "?raw",
});

const prefetchedContent: Record<string, any> = {};
Object.keys(pagesRuntime).map((filePath) => {
  const urlFragment = filePath
    .substring("/public".length)
    .replace("/pages", "")
    .replace(".mdx", "")
    .replace(".md", "");
  prefetchedContent[urlFragment] = pagesRuntime[filePath].default;
});

const shikiHighlighter = createHighlighterCoreSync({
  // @ts-ignore
  langs: [js, json, xmluiGrammar],
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
// console.log(groupedNavPanelContent);
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
    navPanelContent: groupedNavPanelContent,
    content,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    prefetchedContent,
  },
};

export default App;
