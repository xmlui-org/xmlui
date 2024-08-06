import { Parser } from "./Parser";
import { Expression, PropertyValue } from "./source-tree";

/**
 * This function parses a parameter string and splits them into string literal and binding expression sections
 * @param source String to parse
 * @returns Parameter string sections
 */
export function parsePropertyValue(source: any): PropertyValue | undefined | null {
  if (typeof source !== "string") {
    return {
      type: "SPV",
      value: source,
    };
  }

  // --- We parse only string values
  if (source === undefined || source === null) return null;
  const parts: (string | Expression)[] = [];

  let phase = ParsePhase.StringLiteral;
  let section = "";
  let escape = "";
  const parser = new Parser();

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
            parts.push(section);
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
        parser.setSource(source.substring(i));
        let expr: Expression | null = null;
        try {
          expr = parser.parseExpr();
        } catch (err) {
          throw new Error(`Cannot parse expression: '${exprSource}': ${err}`);
        }
        const tail = parser.getTail();
        if (!tail || tail.trim().length < 1 || tail.trim()[0] !== "}") {
          // --- Unclosed expression, back to its beginning
          throw new Error(`Unclosed expression: '${exprSource}'`);
        } else {
          // --- Successfully parsed expression
          parts.push(expr!);

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
        parts.push(section);
      }
      break;
    case ParsePhase.Escape:
      parts.push(section + escape);
      break;
    case ParsePhase.ExprStart:
      parts.push(section + "{");
      break;
  }

  // --- Done.
  if (parts.length === 0) {
    return { type: "SPV", value: "" };
  }
  if (parts.length === 1) {
    return typeof parts[0] === "string"
      ? { type: "SPV", value: parts[0] }
      : { type: "SEV", expr: parts[0] };
  }
  return {
    type: "CPV",
    parts,
  };
}

enum ParsePhase {
  StringLiteral,
  Escape,
  ExprStart,
}
