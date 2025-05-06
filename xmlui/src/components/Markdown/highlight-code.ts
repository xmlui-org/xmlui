import { type ReactNode, isValidElement } from "react";


/**
 * This function handles two things:
 * 1. The extraction of meta information from code blocks and exposing them as data-meta attributes
 * 2. The highlighting of code blocks providing the highlighter function with meta information
 * @param node The React node containing the code block
 * @param codeHighlighter The highlighter object containing the highlight function and the available languages 
 * @returns CSS class names for the codefence and the HTML string with highlighted code tokens
 */
export function parseMetaAndHighlightCode(
  node: ReactNode,
  codeHighlighter: CodeHighlighter,
): { classNames: string | null; cleanedHtmlStr: string } | null {
  const meta = extractMetaFromChildren(node);
  
  // TEMP
  const metaLanguage =
    meta.language === "xmlui" || meta.language === "xmlui-pg" ? "xml" : meta.language;
  // !TEMP

  if (metaLanguage && codeHighlighter.availableLangs.includes(metaLanguage)) {
    
    // NOTE: Keep in mind, at this point, we are working with the markdown text
    const htmlCodeStr = codeHighlighter.highlight(mapTextContent(node), metaLanguage);
    const match = htmlCodeStr.match(/<pre\b[^>]*\bclass\s*=\s*["']([^"']*)["'][^>]*>/i);
    const classNames = match ? match[1] : null;

    // NOTE: Why remove the <pre>?
    // Shiki appends <pre> tags to the highlighted code,
    // so we would get <pre><pre><code>...</code></pre></pre>
    const cleanedHtmlStr = htmlCodeStr.replace(/<pre\b[^>]*>|<\/pre>/gi, "");

    return { classNames, cleanedHtmlStr };
  }
  return null;
}

function mapTextContent(node: ReactNode): string {
  if (typeof node === "string") {
    return transformCodeLines(node);
  }

  if (isValidElement(node) && node.props && node.props.children) {
    if (Array.isArray(node.props.children)) {
      return node.props.children.map(mapTextContent).join("");
    }
    return mapTextContent(node.props.children);
  }
  return "";

  // ---

  function transformCodeLines(node: string) {
    const splitNode = node.split("\n");
    for (let i = 0; i < splitNode.length; i++) {
      // Backslash before a codefence indicates an escaped codefence
      // -> don't render the backslash
      if (splitNode[i].startsWith("\\```")) {
        splitNode[i] = splitNode[i].replace("\\```", "```");
      }
    }
    return splitNode.join("\n");
  }
}

function extractMetaFromChildren(
  node: ReactNode,
  keys: string[] = ["data-language", "data-meta"],
): CodeHighlighterMeta {
  if (!node) return {};
  if (typeof node === "string") return {};
  if (typeof node === "number") return {};
  if (typeof node === "boolean") return {};
  if (Array.isArray(node)) return {};

  if (
    isValidElement(node) &&
    node.props &&
    node.props.children &&
    typeof node.props.children === "string"
  ) {
    return Object.entries<Record<string, any>>(node.props)
      .filter(([key, _]) => keys.includes(key))
      .reduce((acc, [key, value]) => {
        acc[key.replace("data-", "")] = value;
        return acc;
      }, {});
  }
  return {};
}

export type CodeHighlighter = {
  // Returns html in string!
  highlight: (code: string, language: string, meta?: Record<string, any>) => string;
  availableLangs: string[];
};

type CodeHighlighterMeta = {
  language?: string;
  copy?: boolean;
  filename?: string;
  rowHighlights?: number[];
  columnHighlights?: number[];
};
