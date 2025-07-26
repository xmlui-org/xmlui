import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { T_ARROW_EXPRESSION } from "../../components-core/script-runner/ScriptingSourceTree";

/**
 * Finds and evaluates given binding expressions in markdown text.
 * The binding expressions are of the form `@{...}`.
 * @param text The markdown text
 * @param extractValue The function to resolve binding expressions
 * @returns the parsed text with resolved binding expressions
 */
export function parseBindingExpression(text: string, extractValue: ValueExtractor) {
  // Remove empty @{} expressions first - Safari/Edge compatible version
  text = text.replaceAll(/(^|[^\\])\@\{\s*\}/g, "$1");

  // Safari/Edge compatible iterative processing to handle adjacent bindings
  // Process content bindings one at a time to avoid position conflicts
  let previousText = "";
  let iterations = 0;
  while (text !== previousText && iterations < 100) { // Safety limit
    previousText = text;
    iterations++;

    // Match first non-escaped @{...} with nested braces support
    const match = text.match(/(^|[^\\])(\@\{((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\})/);
    if (match) {
      const fullMatch = match[0];
      const prefix = match[1];
      const expr = match[3];

      const extracted = extractValue(`{${expr}}`);
      const resultExpr = mapByType(extracted);
      const replacement = typeof resultExpr === "object" && resultExpr !== null
        ? JSON.stringify(resultExpr)
        : resultExpr;

      text = text.replace(fullMatch, prefix + replacement);
    } else {
      break; // No more matches
    }
  }

  return text;

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
      extracted?._ARROW_EXPR_
    ) {
      return "[xmlui function]";
    }
    return "";
  }
}
