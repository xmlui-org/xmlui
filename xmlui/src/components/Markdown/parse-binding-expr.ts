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
  // Remove empty @{} expressions first
  text = text.replaceAll(/(?<!\\)\@\{\s*\}/g, "");
  // The (?<!\\) is a "negative lookbehind" in regex that ensures that
  // if escaping the @{...} expression like this: \@{...}, we don't match it
  const regex = /(?<!\\)\@\{((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\}/g;
  const result = text.replace(regex, (_, expr) => {
    const extracted = extractValue(`{${expr}}`);
    const resultExpr = mapByType(extracted);
    // The result expression might be an object, in that case we stringify it here,
    // at the last step, so that there are no unnecessary apostrophes
    return typeof resultExpr === "object" && resultExpr !== null
      ? JSON.stringify(resultExpr)
      : resultExpr;
  });
  return result;

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
