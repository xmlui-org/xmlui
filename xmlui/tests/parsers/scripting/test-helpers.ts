import type { BindingTreeEvaluationContext } from "../../../src/components-core/script-runner/BindingTreeEvaluationContext";
import { Parser } from "../../../src/parsers/scripting/Parser";
import type {Expression, Statement} from "../../../src/components-core/script-runner/ScriptingSourceTree";

export function createEvalContext (parts: Partial<BindingTreeEvaluationContext>): BindingTreeEvaluationContext {
  return {
    ...{
      mainThread: {
        childThreads: [],
        blocks: [{ vars: {} }],
        loops: [],
        breakLabelValue: -1
      },
      valueCache: new Map(),
    },
    ...parts
  };
}

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
