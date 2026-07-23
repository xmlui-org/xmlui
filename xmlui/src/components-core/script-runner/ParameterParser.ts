import type { Expression } from "./ScriptingSourceTree";
import { Parser } from "../../parsers/scripting/Parser";
import type {
  CompiledScriptArtifact,
  CompiledScriptSource,
  CompiledScriptSourceOrigin,
} from "../script-compiler/types";
import { compileBindingSyncExpression } from "../script-compiler/targets/binding-sync";

export type ParseBindingOptions = {
  compileBindings?: boolean;
  sourceId?: string;
  sourceUrl?: string;
  displayName?: string;
  sourceOrigin?: CompiledScriptSourceOrigin;
};

/**
 * This function parses a parameter string and splits them into string literal and binding expression sections
 * @param source String to parse
 * @returns Parameter string sections
 */
export function parseParameterString(
  source: string,
  options: ParseBindingOptions = {},
): (StringLiteralSection | ExpressionSection)[] {
  const result: (StringLiteralSection | ExpressionSection)[] = [];
  if (source === undefined || source === null) return result;

  let phase = ParsePhase.StringLiteral;
  let section = "";
  let escape = "";
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    switch (phase) {
      case ParsePhase.StringLiteral:
        if (ch === "\\") {
          phase = ParsePhase.Escape;
          escape = "\\";
        } else if (ch === "{") {
          // --- A new expression starts, close the previous string literal
          if (section !== "") {
            result.push({
              type: "literal",
              value: section,
            });
          }
          // --- Start a new section
          section = "";
          phase = ParsePhase.ExprStart;
        } else {
          section += ch;
        }
        break;

      case ParsePhase.Escape:
        if (ch === "\\") {
          // --- Go on with escape
          escape += ch;
          break;
        }

        if (ch === "{") {
          // --- End escape as a literal section without the first "\" escape character
          section += escape.substring(1) + ch;
        } else {
          // --- End escape as a literal section with the full sequence
          section += escape + ch;
        }
        phase = ParsePhase.StringLiteral;
        break;

      case ParsePhase.ExprStart:
        const exprSource = source.substring(i);
        const parser = new Parser(source.substring(i));
        let expr: Expression | null = null;
        try {
          expr = parser.parseExpr();
        } catch (err) {
          throw new Error(`Cannot parse expression: '${exprSource}': ${err}`);
        }
        const tail = parser.getTail();
        if (!tail || tail.trim().length < 1 || tail.trim()[0] !== "}") {
          // --- Unclosed expression, back to its beginning
          throw new Error(`Unclosed expression: '${source}'\n'${exprSource}'`);
        } else {
          const segmentIndex = result.length;
          const exprText = exprSource.substring(0, exprSource.length - tail.length);
          // --- Successfully parsed expression
          result.push({
            type: "expression",
            value: expr!,
            compiled: createCompiledBindingArtifact(expr!, exprText, options, segmentIndex, i),
          });

          // --- Skip the parsed part of the expression, and start a new literal section
          i = source.length - tail.length;
          section = "";
        }
        phase = ParsePhase.StringLiteral;
        break;
    }
  }

  // --- Process  the last segment
  switch (phase) {
    case ParsePhase.StringLiteral:
      if (section !== "") {
        result.push({
          type: "literal",
          value: section,
        });
      }
      break;
    case ParsePhase.Escape:
      result.push({
        type: "literal",
        value: section + escape,
      });
      break;
    case ParsePhase.ExprStart:
      result.push({
        type: "literal",
        value: section + "{",
      });
      break;
  }

  // --- Done.
  return result;
}

function createCompiledBindingArtifact(
  expr: Expression,
  sourceText: string,
  options: ParseBindingOptions,
  segmentIndex: number,
  expressionStart: number,
): CompiledScriptArtifact | undefined {
  if (!options.compileBindings) {
    return undefined;
  }
  const sourceId = `${options.sourceId ?? "inline"}#expr-${segmentIndex}`;
  return compileBindingSyncExpression(expr, {
    sourceId,
    sourceText,
    sourceUrl: options.sourceUrl,
    displayName: options.displayName,
    sources: createCompiledSources(sourceId, options, sourceText),
    sourceOrigin: createSegmentSourceOrigin(options.sourceOrigin, expressionStart),
  });
}

export function createSegmentSourceOrigin(
  sourceOrigin: CompiledScriptSourceOrigin | undefined,
  segmentStart: number,
): CompiledScriptSourceOrigin | undefined {
  if (!sourceOrigin) {
    return undefined;
  }
  return {
    ...sourceOrigin,
    offset: (sourceOrigin.offset ?? 0) + segmentStart,
  };
}

export function createCompiledSources(
  sourceId: string,
  options: Pick<ParseBindingOptions, "sourceOrigin" | "sourceUrl" | "displayName">,
  fallbackSourceText: string,
): CompiledScriptSource[] {
  return [
    {
      id: sourceId,
      ...(options.sourceUrl ? { url: options.sourceUrl } : {}),
      ...(options.displayName ? { displayName: options.displayName } : {}),
      sourceText: options.sourceOrigin?.sourceText ?? fallbackSourceText,
    },
  ];
}

enum ParsePhase {
  StringLiteral,
  Escape,
  ExprStart,
}
/**
 * Represents a literal segment
 */
type StringLiteralSection = {
  type: "literal";

  // --- The string literal
  value: string;
};

type ExpressionSection = {
  type: "expression";

  // --- The expression string to parse
  value: Expression;

  // --- Optional compiled representation of the expression
  compiled?: CompiledScriptArtifact;
};
