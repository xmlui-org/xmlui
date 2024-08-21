import { Expression, Statement } from "@abstractions/scripting/ScriptingSourceTree";
import { Parser } from "@parsers/scripting/Parser";

export function parseStatements (source: string): Statement[] {
  const wParser = new Parser(source);
  const tree = wParser.parseStatements();
  if (tree === null) {
    // --- This should happen only there were errors during the parse phase
    throw new Error("Source code parsing failed");
  }
  return tree;
}

export function parseExpression (source: string): Expression {
  const wParser = new Parser(source);
  const tree = wParser.parseExpr();
  if (tree === null) {
    // --- This should happen only there were errors during the parse phase
    throw new Error("Source code parsing failed");
  }
  return tree;
}
