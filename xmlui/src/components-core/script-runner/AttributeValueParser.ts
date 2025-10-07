import type { ParsedPropertyValue } from "../../abstractions/scripting/Compilation";
import type { Expression } from "./ScriptingSourceTree";
import { Parser } from "../../parsers/scripting/Parser";

let lastParseId = 0;

/**
 * This function parses a parameter string and splits them into string literal and binding expression sections
 * @param source String to parse
 * @returns Parameter string sections
 */
export function parseAttributeValue(source: string): ParsedPropertyValue {
  const result: ParsedPropertyValue = {
    __PARSED: true,
    parseId: ++lastParseId,
    segments: [],
  };
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
            result.segments.push({
              literal: section,
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
          // --- Successfully parsed expression, get dependencies
          result.segments.push({
            expr,
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
        result.segments.push({
          literal: section,
        });
      }
      break;
    case ParsePhase.Escape:
      result.segments.push({
        literal: section + escape,
      });
      break;
    case ParsePhase.ExprStart:
      result.segments.push({
        literal: section + "{",
      });
      break;
  }

  // --- Done.
  return result;
}

enum ParsePhase {
  StringLiteral,
  Escape,
  ExprStart,
}
