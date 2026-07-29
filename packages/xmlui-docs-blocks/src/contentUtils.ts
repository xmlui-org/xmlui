import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import stripMarkdown from "strip-markdown";
import { load as yamlLoad } from "js-yaml";

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: raw };
  const content = raw.slice(match[0].length);
  const parsed = yamlLoad(match[1]);
  const data = parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
  return { data, content };
}

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

export interface BuildContentFromRuntimeOptions {
  contentPrefix?: string;
}

function toPlainTextContentKey(urlPrefix: string | undefined, urlFragment: string): string {
  const prefix = urlPrefix ?? "";
  if (!urlFragment) {
    return prefix.endsWith("/") ? prefix.slice(0, -1) || "/" : prefix || "/";
  }
  return prefix + urlFragment;
}

function toPublicUrlFragment(contentFragment: string): string {
  const withoutExtension = contentFragment.replace(/\.(md|mdx)$/, "");
  if (!withoutExtension.startsWith("pages/")) {
    return withoutExtension;
  }

  const pageFragment = withoutExtension.slice("pages/".length);
  return pageFragment === "intro" ? "" : pageFragment;
}

export function buildContentFromRuntime(
  contentRuntime: Record<string, { default: string }>,
  options: BuildContentFromRuntimeOptions = {},
  plainTextOptions: { urlPrefix?: string } = {},
): {
  content: Record<string, string>;
  plainTextContent: Record<string, string>;
  navPanelContent: string[];
  frontmatter: Record<string, Record<string, unknown>>;
} {
  const contentPrefix = options.contentPrefix ?? "/content/";
  const content: Record<string, string> = {};
  const plainTextContent: Record<string, string> = {};
  const navPanelContent: string[] = [];
  const frontmatter: Record<string, Record<string, unknown>> = {};

  Object.keys(contentRuntime).forEach((filePath) => {
    const raw = contentRuntime[filePath]?.default ?? "";
    const { data, content: body } = parseFrontmatter(raw);
    const contentFragment = filePath.substring(contentPrefix.length);
    const publicUrlFragment = toPublicUrlFragment(contentFragment);
    let contentKey: string;

    if (filePath.startsWith(contentPrefix + "pages/")) {
      contentKey = contentFragment;
    } else {
      contentKey = publicUrlFragment;
      navPanelContent.push(contentKey);
    }

    const plainTextContentKey = toPlainTextContentKey(
      plainTextOptions.urlPrefix,
      publicUrlFragment,
    );
    plainTextContent[plainTextContentKey] = markdownToPlainText(body);

    content[contentKey] = body;
    if (Object.keys(data).length > 0) {
      frontmatter[plainTextContentKey] = data;
    }
  });
  return { content, plainTextContent, navPanelContent, frontmatter };
}
