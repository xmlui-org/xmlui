import type { Expression } from "./ScriptingSourceTree";
import { Parser } from "../../parsers/scripting/Parser";
import {
  getSourcedStringSource,
  getSourcedStringValue,
  type SourcedString,
} from "../../abstractions/SourcedString";

/**
 * This function parses a parameter string and splits them into string literal and binding expression sections
 * @param source String to parse
 * @returns Parameter string sections
 */
export function parseParameterString(
  source: string | SourcedString,
): (StringLiteralSection | ExpressionSection)[] {
  const result: (StringLiteralSection | ExpressionSection)[] = [];
  if (source === undefined || source === null) return result;

  const sourceText = getSourcedStringValue(source);
  if (sourceText === undefined) return result;

  const sourceInfo = getSourcedStringSource(source);
  const indexPositions = sourceInfo
    ? buildIndexPositions(sourceText, sourceInfo.startLine, sourceInfo.startColumn)
    : null;

  let phase = ParsePhase.StringLiteral;
  let section = "";
  let escape = "";
  for (let i = 0; i < sourceText.length; i++) {
    const ch = sourceText[i];
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
        const exprSource = sourceText.substring(i);
        const exprPos = indexPositions?.[i];
        const parser = new Parser(sourceText.substring(i), {
          startLine: exprPos?.line,
          startColumn: exprPos?.column,
        });
        let expr: Expression | null = null;
        try {
          expr = parser.parseExpr();
        } catch (err) {
          throw new Error(`Cannot parse expression: '${exprSource}': ${err}`);
        }
        const tail = parser.getTail();
        if (!tail || tail.trim().length < 1 || tail.trim()[0] !== "}") {
          // --- Unclosed expression, back to its beginning
          throw new Error(`Unclosed expression: '${sourceText}'\n'${exprSource}'`);
        } else {
          // --- Successfully parsed expression
          result.push({
            type: "expression",
            value: expr!
          });

          // --- Skip the parsed part of the expression, and start a new literal section
          i = sourceText.length - tail.length;
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

type Position = {
  line: number;
  column: number;
};

function buildIndexPositions(source: string, startLine: number, startColumn: number): Position[] {
  const positions: Position[] = new Array(source.length + 1);
  let line = startLine;
  let column = startColumn;
  positions[0] = { line, column };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\n") {
      line += 1;
      column = 0;
    } else {
      column += 1;
    }
    positions[i + 1] = { line, column };
  }
  return positions;
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
