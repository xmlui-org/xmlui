import { type ReactNode, isValidElement } from "react";
import { encodeToBase64, decodeFromBase64 } from "../../components-core/utils/base64-utils";

const highlightRowsClass = "codeBlockHighlightRow";
const highlightSubstringsClass = "codeBlockHighlightString";
const highlightSubstringsEmphasisClass = "codeBlockHighlightStringEmphasis";

// Re-export for backward compatibility
export { encodeToBase64, decodeFromBase64 };

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
  // parse
  const rawCodeStr = getCodeStrFromNode(node);
  const rawMeta = getCodeMetaFromNode(node, CodeHighlighterMetaKeysData);
  // map
  const codeStr = transformCodeLines(rawCodeStr);
  const meta = extractMetaFromChildren(rawMeta, codeStr);

  const { language, ...restMeta } = meta;
  if (language && codeHighlighter.availableLangs.includes(language)) {
    // NOTE: Keep in mind, at this point, we are working with the markdown text
    try{
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
    } catch (e){
      // this could happen in safari after the optimized build (some regexp issues, could be remix/vite/shiki related, TBD)
      return {
        meta,
        codeStr,
        cleanedHtmlStr: codeStr,
        classNames: null
      };
    }

  }
  return null;
}

function getCodeStrFromNode(node: ReactNode) {
  if (typeof node === "string") {
    return node;
  }

  if (isValidElement(node) && node.props && node.props.children) {
    if (Array.isArray(node.props.children)) {
      return node.props.children.map(getCodeStrFromNode).join("");
    }
    return getCodeStrFromNode(node.props.children);
  }
  return "";
}

function getCodeMetaFromNode(node: ReactNode, keys: string[]) {
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
    return Object.entries(node.props)
      .filter(([key, _]) => keys.includes(key))
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, any>,
      );
  }
  return {};
}

export function transformCodeLines(node: string) {
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

export function extractMetaFromChildren(
  meta: Record<string, any>,
  code: string = "",
): CodeHighlighterMeta {
  if (!meta) return {};

  return {
    // NOTE: Row numbers are disabled for now, because applying the highlight class removes the "numbered" class
    /* [CodeHighlighterMetaKeys.rowNumbers.prop]: parseBoolean(
      meta[CodeHighlighterMetaKeys.rowNumbers.data],
    ), */
    [CodeHighlighterMetaKeys.language.prop]: meta[CodeHighlighterMetaKeys.language.data],
    [CodeHighlighterMetaKeys.copy.prop]: parseBoolean(meta[CodeHighlighterMetaKeys.copy.data]),
    [CodeHighlighterMetaKeys.filename.prop]: meta[CodeHighlighterMetaKeys.filename.data],
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
      let start = -1;
      let end = -1;

      if (split.length === 0) return { start, end, properties: { class: highlightRowsClass } };
      if (split.length > 2) return { start, end, properties: { class: highlightRowsClass } };
      if (split[0] === "") return { start, end, properties: { class: highlightRowsClass } };
      if (split[1] === "") return { start, end, properties: { class: highlightRowsClass } };
      start = 0;
      end = 0;

      // Start Index
      const startIdx = validate(parse(split[0]));
      start = getLineLengthIndex(startIdx);

      // End Index
      const endIdx = split.length === 1 ? startIdx : validate(parse(split[1]));
      let endLineLength = 0;
      if (endIdx >= 0 && codeLines[endIdx] !== undefined) {
        endLineLength = codeLines[endIdx].length;
      }
      end = getLineLengthIndex(endIdx) + endLineLength;

      return { start, end, properties: { class: highlightRowsClass } };
    })
    .filter((item) => {
      if (item.start <= -1 || item.end <= -1) return false;
      if (item.start > code.length || item.end > code.length) return false;
      return true;
    });

  function parse(value: string): number {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return -1;
    return parsed;
  }

  function validate(parsed: number): number {
    // correct for 0-indexed array
    parsed -= 1;
    // check bounds
    if (parsed < 0 || parsed >= codeLines.length) return -1;
    return parsed;
  }

  function getLineLengthIndex(lineNumber: number) {
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
    .map((item) => decodeFromBase64(item))
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
