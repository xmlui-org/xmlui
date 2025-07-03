import type { Expression } from "./ScriptingSourceTree";
import { Parser } from "../../parsers/scripting/Parser";

/**
 * This function parses a parameter string and splits them into string literal and binding expression sections
 * @param source String to parse
 * @returns Parameter string sections
 */
export function parseParameterString (source: string): (StringLiteralSection | ExpressionSection)[] {
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
              value: section
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
          // --- Successfully parsed expression
          result.push({
            type: "expression",
            value: expr!
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
          value: section
        });
      }
      break;
    case ParsePhase.Escape:
      result.push({
        type: "literal",
        value: section + escape
      });
      break;
    case ParsePhase.ExprStart:
      result.push({
        type: "literal",
        value: section + "{"
      });
      break;
  }

  // --- Done.
  return result;
}

enum ParsePhase {
  StringLiteral,
  Escape,
  ExprStart
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
};
