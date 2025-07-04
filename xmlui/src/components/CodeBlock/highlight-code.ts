import { type ReactNode, isValidElement } from "react";

const highlightRowsClass = "codeBlockHighlightRow";
const highlightSubstringsClass = "codeBlockHighlightString";
const highlightSubstringsEmphasisClass = "codeBlockHighlightStringEmphasis";

/*
 * Encode string, returns base64 value
 * @Params: string
 */
export function encodeValue(value) {
  if (!value) {
    return null;
  }

  const valueToString = value.toString();

  if (typeof window !== "undefined") {
    return window.atob(valueToString);
  }

  const buff = Buffer.from(valueToString, "base64");
  return buff.toString("ascii");
}

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
  themeTone?: string,
): HighlighterResults | null {
  const codeStr = mapTextContent(node);
  const meta = extractMetaFromChildren(node, CodeHighlighterMetaKeysData, codeStr);

  const { language, ...restMeta } = meta;
  if (language && codeHighlighter.availableLangs.includes(language)) {
    // NOTE: Keep in mind, at this point, we are working with the markdown text
    const htmlCodeStr = codeHighlighter.highlight(codeStr, language, restMeta, themeTone);
    const match = htmlCodeStr.match(/<pre\b[^>]*\bclass\s*=\s*["']([^"']*)["'][^>]*>/i);
    const classNames = match ? match[1] : null;

    // NOTE: Why remove the <pre>?
    // Shiki appends <pre> tags to the highlighted code,
    // so we would get <pre><pre><code>...</code></pre></pre>
    let cleanedHtmlStr = htmlCodeStr.replace(/<pre\b[^>]*>|<\/pre>/gi, "");

    const numberedRowClass = meta.rowNumbers ? "numbered" : "";
    cleanedHtmlStr = cleanedHtmlStr.replaceAll(
      /<span class="line"/g,
      `<span class="line ${numberedRowClass}"`,
    );

    return { classNames, cleanedHtmlStr, codeStr, meta };
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
    const splitNode = node.split(/\r?\n/);
    for (let i = 0; i < splitNode.length; i++) {
      // Backslash before a codefence indicates an escaped codefence
      // -> don't render the backslash
      if (splitNode[i].startsWith("\\```")) {
        splitNode[i] = splitNode[i].replace("\\```", "```");
      }
    }

    // Remove empty lines from start and end
    let startTrimIdx = 0;
    let endTrimIdx = splitNode.length - 1;
    for (let i = 0; i < splitNode.length; i++) {
      if (splitNode[i].trim() !== "") {
        startTrimIdx = i;
        break;
      }
    }
    for (let i = splitNode.length - 1; i >= 0; i--) {
      if (splitNode[i].trim() !== "") {
        endTrimIdx = i;
        break;
      }
    }

    splitNode.splice(0, startTrimIdx);
    splitNode.splice(endTrimIdx + 1);
    return splitNode.join("\n");
  }
}

function extractMetaFromChildren(
  node: ReactNode,
  keys: string[],
  code: string = "",
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
    const meta = Object.entries(node.props)
      .filter(([key, _]) => keys.includes(key))
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

    return {
      [CodeHighlighterMetaKeys.language.prop]: meta[CodeHighlighterMetaKeys.language.data],
      [CodeHighlighterMetaKeys.copy.prop]: parseBoolean(meta[CodeHighlighterMetaKeys.copy.data]),
      [CodeHighlighterMetaKeys.filename.prop]: meta[CodeHighlighterMetaKeys.filename.data],
      // NOTE: Row numbers are disabled for now, because applying the highlight class removes the "numbered" class
      /* [CodeHighlighterMetaKeys.rowNumbers.prop]: parseBoolean(
        meta[CodeHighlighterMetaKeys.rowNumbers.data],
      ), */
      [CodeHighlighterMetaKeys.highlightRows.prop]: parseRowHighlights(
        code,
        meta[CodeHighlighterMetaKeys.highlightRows.data],
      ),
      [CodeHighlighterMetaKeys.highlightSubstrings.prop]: parseSubstringHighlights(
        code,
        meta[CodeHighlighterMetaKeys.highlightSubstrings.data],
      ),
      [CodeHighlighterMetaKeys.highlightSubstringsEmphasized.prop]: parseSubstringHighlights(
        code,
        meta[CodeHighlighterMetaKeys.highlightSubstringsEmphasized.data],
        true,
      ),
    };
  }
  return {};
}

function parseBoolean(str?: string) {
  if (str === "true") return true;
  if (str === "false") return false;
  return false;
}

function parseRowHighlights(code: string, str?: string): DecorationItem[] {
  if (!str) return [];
  if (str === "") return [];
  const codeLines = code.split("\n");
  return str
    .split(",")
    .map((item) => {
      item = item.trim();
      const split = item.split("-");
      let start = 0;
      let end = 0;

      if (split.length === 0) return { start, end, properties: { class: highlightRowsClass } };

      // Start Index
      const startIdx = parseAndValidate(split[0]) - 1;
      if (startIdx > 0) {
        start = getLineStartIndex(startIdx);
      }
      // End Index
      const endIdx = split.length === 1 ? startIdx : parseAndValidate(split[1]) - 1;
      let endLineLength = 0;
      if (endIdx >= 0 && codeLines[endIdx] !== undefined) {
        endLineLength = codeLines[endIdx].length;
      }
      end = getLineStartIndex(endIdx) + endLineLength;

      return { start, end, properties: { class: highlightRowsClass } };
    })
    .filter((item) => {
      if (item.start <= -1 || item.end <= -1) return false;
      if (item.start > code.length || item.end > code.length) return false;
      return true;
    });

  function parseAndValidate(value: string): number {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return -1;
    if (parsed <= 0) return -1;
    if (parsed > codeLines.length) return -1;
    return parsed;
  }

  function getLineStartIndex(lineNumber: number) {
    if (lineNumber < 0) return -1;
    if (lineNumber === 0) return 0;

    let count = 0;
    let index = 0;
    while (count < lineNumber && index !== -1) {
      index = code.indexOf('\n', index);
      if (index !== -1) {
        index++; // Move past the '\n'
        count++;
      }
    }
    return (index !== -1) ? index : -1;
  }
}

function parseSubstringHighlights(
  code: string,
  str?: string,
  emphasized = false,
): DecorationItem[] {
  if (!str) return [];
  if (!code) return [];
  return str
    .split(" ")
    .map((item) => encodeValue(item))
    .filter((item) => item.trim() !== "")
    .reduce((acc, item) => acc.concat(findAllNonOverlappingSubstrings(code, item)), []);

  function findAllNonOverlappingSubstrings(str: string, code: string) {
    const result: DecorationItem[] = [];
    let startIndex = 0;
    const searchLength = code.length;

    while (startIndex <= str.length - searchLength) {
      const index = str.indexOf(code, startIndex);
      if (index === -1) break;

      result.push({
        start: index,
        end: index + searchLength,
        properties: {
          class: emphasized ? highlightSubstringsEmphasisClass : highlightSubstringsClass,
        },
      });
      startIndex = index + searchLength; // Jump past this match
    }

    return result;
  }
}

export type CodeHighlighter = {
  // Returns html in string!
  highlight: (
    code: string,
    language: string,
    meta?: CodeHighlighterMeta,
    themeTone?: string,
  ) => string;
  availableLangs: string[];
};

export function isCodeHighlighter(obj: any): obj is CodeHighlighter {
  return obj && obj.highlight && typeof obj.highlight === "function" && obj.availableLangs;
}

type HighlighterResults = {
  classNames: string | null;
  cleanedHtmlStr: string;
  codeStr: string;
  meta: CodeHighlighterMeta;
};

export type CodeHighlighterMeta = {
  language?: string;
  copy?: boolean;
  filename?: string;
  rowNumbers?: boolean;
  highlightRows?: DecorationItem[];
  highlightSubstrings?: DecorationItem[];
};

type DecorationItem = {
  start: number;
  end: number;
  properties: { class?: string; style?: string };
};

export const CodeHighlighterMetaKeys = {
  language: { data: "data-language", prop: "language" },
  copy: { data: "data-copy", prop: "copy" },
  filename: { data: "data-filename", prop: "filename" },
  rowNumbers: { data: "data-row-numbers", prop: "rowNumbers" },
  highlightRows: { data: "data-highlight-rows", prop: "highlightRows" },
  highlightSubstrings: { data: "data-highlight-substrings", prop: "highlightSubstrings" },
  highlightSubstringsEmphasized: {
    data: "data-highlight-substrings-emp",
    prop: "highlightSubstringsEmphasized",
  },
};
export const CodeHighlighterMetaKeysData = Object.values(CodeHighlighterMetaKeys).map(
  (item) => item.data,
);
