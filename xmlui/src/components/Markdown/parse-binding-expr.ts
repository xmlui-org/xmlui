import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { T_ARROW_EXPRESSION } from "../../components-core/script-runner/ScriptingSourceTree";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";

/**
 * Splits markdown text into segments that are either inside or outside triple-backtick
 * code fences. Segments inside code fences are flagged so that binding expression
 * processing can be skipped for them.
 */
function splitByCodeFences(text: string): Array<{ content: string; isCodeFence: boolean }> {
  const segments: Array<{ content: string; isCodeFence: boolean }> = [];
  const lines = text.split("\n");
  let inFence = false;
  let fenceOpener = "";
  let accumulator = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineWithNewline = i < lines.length - 1 ? line + "\n" : line;
    const fenceMatch = line.match(/^(`{3,})(.*)/);

    if (!inFence) {
      if (fenceMatch) {
        // Opening code fence — flush accumulated outside-text first
        if (accumulator) {
          segments.push({ content: accumulator, isCodeFence: false });
          accumulator = "";
        }
        fenceOpener = fenceMatch[1];
        inFence = true;
        accumulator = lineWithNewline;
      } else {
        accumulator += lineWithNewline;
      }
    } else {
      accumulator += lineWithNewline;
      // Closing fence: same backtick sequence as opener, no info string
      if (fenceMatch && fenceMatch[1] === fenceOpener && fenceMatch[2].trim() === "") {
        segments.push({ content: accumulator, isCodeFence: true });
        accumulator = "";
        inFence = false;
        fenceOpener = "";
      }
    }
  }

  if (accumulator) {
    // Unterminated fence: treat remaining content with whatever state we're in
    segments.push({ content: accumulator, isCodeFence: inFence });
  }

  return segments;
}

/**
 * Finds and evaluates given binding expressions in markdown text.
 * The binding expressions are of the form `@{...}`.
 * Expressions inside triple-backtick code fences are left unchanged.
 * @param text The markdown text
 * @param extractValue The function to resolve binding expressions
 * @returns the parsed text with resolved binding expressions
 */
export function parseBindingExpression(text: string, extractValue: ValueExtractor) {
  const segments = splitByCodeFences(text);
  return segments
    .map(({ content, isCodeFence }) => (isCodeFence ? content : processSegment(content)))
    .join("");

  function processSegment(segText: string): string {
    // Remove empty @{} expressions first
    segText = segText.replaceAll(/(?<!\\)\@\{\s*\}/g, "");
    // The (?<!\\) is a "negative lookbehind" in regex that ensures that
    // if escaping the @{...} expression like this: \@{...}, we don't match it
    const regex = /(?<!\\)\@\{((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\}/g;
    return segText.replace(regex, (_, expr) => {
      const extracted = extractValue(`{${expr}}`);
      const resultExpr = mapByType(extracted);
      // The result expression might be an object, in that case we stringify it here,
      // at the last step, so that there are no unnecessary apostrophes
      return typeof resultExpr === "object" && resultExpr !== null
        ? JSON.stringify(resultExpr)
        : resultExpr;
    });
  }

  // ---

  function mapByType(extracted: unknown) {
    if (extracted === null) {
      return null;
    } else if (extracted === undefined || typeof extracted === "undefined") {
      return undefined;
    } else if (typeof extracted === "object") {
      const arrowFuncResult = parseArrowFunc(extracted as Record<string, unknown>);
      if (arrowFuncResult) {
        return arrowFuncResult;
      }
      if (Array.isArray(extracted)) {
        return extracted;
      }
      return Object.fromEntries(
        Object.entries(extracted).map(([key, value]) => {
          return [key, mapByType(value)];
        }),
      );
    } else {
      return extracted;
    }
  }

  function parseArrowFunc(extracted: Record<string, unknown>): string {
    if (
      extracted.hasOwnProperty("type") &&
      extracted.type === T_ARROW_EXPRESSION &&
      isArrowExpressionObject(extracted)
    ) {
      return "[xmlui function]";
    }
    return "";
  }
}
