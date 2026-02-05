import type { StandaloneAppDescription } from "xmlui";
import { createHighlighterCoreSync, type DecorationItem } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
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

export function markdownToPlainText(markdown: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(stripMarkdown, { keep: ["code"] })
    .use(remarkStringify);

  const file = processor.processSync(markdown);

  let cleanedText = String(file);

  // NEW: Remove admonition tags like [!WARNING] or \[!NOTE]
  // This looks for an optional backslash, then "[!", any word, and "]"
  cleanedText = cleanedText.replace(/\\?\[!\w+\]\s*/g, "");
  // 1. Remove the anchor-like tags, e.g., "\[#button]"
  cleanedText = cleanedText.replace(/\s*\\\[#.*?\]/g, "");

  // 2. Process each line individually to reformat tables
  const lines = cleanedText.split("\n");
  const reformattedLines = lines.map((line) => {
    const trimmedLine = line.trim();

    // Check if the line is a table separator like "| --- | --- |"
    if (trimmedLine.match(/^\|(?:\s*---\s*\|)+$/)) {
      return null; // Mark this line for removal
    }
    // Check if the line is a table row (starts and ends with '|')
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      // Remove leading/trailing pipes, then split into cells
      return trimmedLine
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()) // Trim whitespace from each cell
        .join(" - "); // Join cells with a more readable separator
    }

    // filter code block header/footers
    if (trimmedLine.startsWith("```") || trimmedLine.startsWith("---")) {
      return null;
    }
    // If it's not a table line, return it as is
    return line;
  });

  // 3. Filter out the removed separator lines and join back into a string
  cleanedText = reformattedLines.filter((line) => line !== null).join("\n");

  // 4. Consolidate multiple consecutive newlines into a maximum of two
  cleanedText = cleanedText.replace(/(\r\n|\n){3,}/g, "\n\n");

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

// @ts-ignore
const blogSearchData: Record<string, any> = import.meta.glob(`/public/blog-search-data.json`, {
  eager: true,
  query: "?raw",
});

const content: Record<string, any> = {};
const plainTextContent: Record<string, string> = {};
const navPanelContent: any[] = [];
Object.keys(contentRuntime).map((filePath) => {
  const urlFragment = filePath.substring("/content/".length).replace(".mdx", "").replace(".md", "");
  content[omitIndexFromPath(urlFragment)] = contentRuntime[filePath].default;
  plainTextContent[omitIndexFromPath(urlFragment)] = markdownToPlainText(
    contentRuntime[filePath].default,
  );
  navPanelContent.push(urlFragment);
});

// Add blog content to search index
let blogContent: Record<string, string> = {};
try {
  if (blogSearchData["/public/blog-search-data.json"]) {
    blogContent = JSON.parse(blogSearchData["/public/blog-search-data.json"].default);
    console.log(`Loaded ${Object.keys(blogContent).length} blog posts for search indexing`);
  }
} catch (error) {
  console.warn("Could not load blog search data:", error);
}

// Merge blog content into plainTextContent
Object.assign(plainTextContent, blogContent);

const pagesRuntime: Record<string, any> = import.meta.glob(`/public/blog/*.md`, {
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
  langs: [js, json, html, xmluiGrammar, css, scss],
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

export const blogPosts = [
  {
    title: "Introducing XMLUI",
    slug: "introducing-xmlui",
    description:
      "Let's make building user interfaces as easy as it was 30 years ago.",
    author: "Jon Udell",
    date: "2025-07-18",
    image: "xmlui-demo.png",
    tags: ["xmlui"],
  },
  {
    title: "Reproducible XMLUI",
    slug: "xmlui-playground",
    description:
      "Use playgrounds to infuse docs with live examples, iterate on prototypes, and reproduce bugs.",
    author: "Jon Udell",
    date: "2025-10-27",
    image: "playground.png",
    tags: ["playground"],
  },
  {
    title: "An XMLUI-powered blog",
    slug: "xmlui-powered-blog",
    description: "How we made this blog with a few dozen lines of XMLUI.",
    author: "Jon Udell",
    date: "2025-10-28",
    image: "blog-scrabble.png",
    tags: ["blog"],
  },
  {
    title: "Introducing the XMLUI CLI",
    slug: "introducing-the-xmlui-cli",
    description: "Your all-in-one tool for working with XMLUI.",
    author: "Jon Udell",
    date: "2025-12-19",
    image: "cli-blog-header.svg",
    tags: ["cli"],
  },
  {
    title: "Supabase + XMLUI",
    slug: "supabase-and-xmlui",
    description: "Build an XMLUI interface to a Supabase backend.",
    author: "Jon Udell",
    date: "2026-01-27",
    image: "supabase-and-xmlui.png",
    draft: true,
    tags: ["supabase"],
  },
];

const App: StandaloneAppDescription = {
  name: "XMLUI Blog",
  defaultTheme: "xmlui-blog",
  resources: {
    logo: "/resources/logo.svg",
    "logo-dark": "/resources/logo-dark.svg",
    favicon: "/resources/favicon.ico",
    "icon.github": "/resources/icons/github.svg",
    "icon.rss": "/resources/icons/rss.svg",
  },
  appGlobals: {
    useHashBasedRouting: false,
    showHeadingAnchors: true,
    searchIndexEnabled: true,
    navPanelContent: groupedNavPanelContent,
    content,
    plainTextContent,
    codeHighlighter: {
      availableLangs: shikiHighlighter.getLoadedLanguages(),
      highlight,
    },
    prefetchedContent,
    lintSeverity: "skip", // Turn off xmlui linting
    popOutUrl: "https://playground.xmlui.org/#/playground",
    blog: { layout: "basic" },
    posts: blogPosts,
  },
};

export default App;
