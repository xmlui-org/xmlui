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

export type MetaJson = Record<string, unknown>;

export type TreeNode = {
  name: string;
  path: string;
  title?: string;
  type?: string;
  children?: TreeNode[];
};

export interface BuildContentFromRuntimeOptions {
  contentPrefix?: string;
}

export function buildContentFromRuntime(
  contentRuntime: Record<string, { default: string }>,
  options: BuildContentFromRuntimeOptions = {},
): {
  content: Record<string, string>;
  plainTextContent: Record<string, string>;
  navPanelContent: string[];
} {
  const contentPrefix = options.contentPrefix ?? "/content/";
  const content: Record<string, string> = {};
  const plainTextContent: Record<string, string> = {};
  const navPanelContent: string[] = [];

  Object.keys(contentRuntime).forEach((filePath) => {
    const raw = contentRuntime[filePath]?.default ?? "";
    let urlFragment: string;

    if (filePath.startsWith(contentPrefix + "pages/")) {
      urlFragment = filePath.substring(contentPrefix.length);
    } else {
      urlFragment = filePath.substring(contentPrefix.length).replace(/\.(md|mdx)$/, "");
      navPanelContent.push(urlFragment);
      plainTextContent[urlFragment] = markdownToPlainText(raw);
    }

    content[urlFragment] = raw;
  });

  return { content, plainTextContent, navPanelContent };
}

function omitIndexFromPath(path: string): string {
  return path.endsWith("index") ? path.substring(0, path.length - "index".length) : path;
}

export interface BuildTreeFromPathsAndMetaOptions {
  contentRoot?: string;
}

export function buildTreeFromPathsAndMeta(
  paths: string[],
  metaByFolder: Record<string, MetaJson>,
  options: BuildTreeFromPathsAndMetaOptions = {},
): TreeNode[] {
  const contentRoot = options.contentRoot ?? "/content";
  const root: TreeNode[] = [];

  paths.forEach((path) => {
    const parts = path.split("/");
    let currentPath = contentRoot;
    let currentLevel: TreeNode[] | undefined = root;

    parts.forEach((part, index) => {
      let existingNode = currentLevel?.find((node) => node.name === part);

      if (!existingNode) {
        const meta = metaByFolder[currentPath + "/_meta.json"];
        let title: string | undefined;
        let type: string | undefined;

        if (meta && typeof meta === "object" && "default" in meta && meta.default && typeof meta.default === "object") {
          const defaultMeta = meta.default as Record<string, unknown>;
          const metaEntry = defaultMeta[part];
          if (typeof metaEntry === "string") {
            title = metaEntry;
          } else if (typeof metaEntry === "object" && metaEntry !== null) {
            const obj = metaEntry as Record<string, unknown>;
            title = obj.title as string | undefined;
            type = obj.type as string | undefined;
          }
        }

        existingNode = {
          name: part,
          title: title ?? part,
          path: omitIndexFromPath(path),
          ...(type && { type }),
        };
        currentLevel?.push(existingNode);
      }

      if (index < parts.length - 1) {
        if (existingNode && !existingNode.children) {
          existingNode.children = [];
        }
        currentLevel = existingNode?.children;
      }
      currentPath += `/${part}`;
    });
  });

  function sortChildren(level: TreeNode[], path: string): void {
    const meta = metaByFolder[path + "/_meta.json"];
    if (!meta || typeof meta !== "object" || !("default" in meta) || typeof meta.default !== "object") return;

    const order = Object.keys(meta.default as Record<string, unknown>);
    order.forEach((orderKey) => {
      if (!level.find((item) => item.name === orderKey)) {
        const val = (meta.default as Record<string, unknown>)[orderKey];
        const extra =
          typeof val === "object" && val !== null ? val : typeof val === "string" ? { title: val } : {};
        level.push({ name: orderKey, ...extra } as TreeNode);
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

  sortChildren(root, contentRoot);
  return root;
}
