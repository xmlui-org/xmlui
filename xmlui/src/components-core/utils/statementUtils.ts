import type {
  ArrowExpression,
  ArrowExpressionStatement,
  BlockStatement,
  EmptyStatement,
  ExpressionStatement,
  FunctionInvocationExpression,
  Identifier,
  Statement,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { QueueInfo } from "../script-runner/statement-queue";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";

import { Parser } from "../../parsers/scripting/Parser";
import {
  type OnStatementCompletedCallback,
  processStatementQueueAsync,
} from "../script-runner/process-statement-async";
import { reportEngineError } from "../reportEngineError";
import { ScriptParseError } from "../EngineError";

/**
 * Parse the specified source code as event handler code
 * @param source Event handler source code
 */
export function parseHandlerCode(source: string): Statement[] {
  // --- Parse the event code
  const wParser = new Parser(source);
  let parsedStatements: Statement[] | null = null;
  try {
    // --- Invoke the parser
    parsedStatements = wParser.parseStatements();
  } catch (err) {
    // --- Parsing error with explicit error code
    if (wParser.errors.length > 0) {
      const err = wParser.errors[0];
      reportEngineError(
        new ScriptParseError(`${err.code}(${err.line}, ${err.column}): ${wParser.errors[0].text}`, source, err.position)
      );
    } else {
      throw err;
    }
  }

  // --- Check for the completeness of source code parsing
  if (!wParser.isEof) {
    const tail = wParser.getTail();
    reportEngineError(new ScriptParseError(`Invalid tail found`, source, source.length - tail.length + 1));
  }

  // --- Done
  return parsedStatements!;
}

/**
 * Optionally transform statements in an event handler to an arrow expression statement
 * @param statements Statements to transform
 * @param evalContext Optional event arguments
 */
export function prepareHandlerStatements(
  statements: Statement[],
  evalContext?: BindingTreeEvaluationContext
): Statement[] {
  const stmtLength = statements?.length ?? 0;
  if (stmtLength === 0) {
    // -- Use a no-op arrow function
    return [
      {
        type: "ArrowS",
        expression: {
          type: "ArrowE",
          args: [],
          statement: {
            type: "EmptyS",
          } as EmptyStatement,
        } as unknown as ArrowExpression,
      } as ArrowExpressionStatement,
    ];
  }

  if (stmtLength === 1) {
    const stmt = statements[0];
    if (evalContext && stmt.type === "ExprS" && stmt.expression.type === "IdE") {
      // --- A single identifier, it is supposed to be an arrow function
      // --- Create formal arguments
      const formalArgs = evalContext.eventArgs
        ? evalContext.eventArgs.map(
            (_, idx) =>
              ({
                type: "IdE",
                name: `__arg@@#__${idx}__`,
              } as Identifier)
          )
        : [];

      // --- Add formal argument with current values
      if (evalContext.eventArgs) {
        evalContext.eventArgs.forEach((val, idx) => {
          evalContext.localContext[`__arg@@#__${idx}__`] = val;
        });
      }

      // --- Create the arrow expression
      const arrowExpr: ArrowExpression = {
        type: "ArrowE",
        args: formalArgs,
        statement: {
          type: "ExprS",
          expression: {
            type: "InvokeE",
            object: stmt.expression,
            arguments: [...formalArgs],
          } as unknown as FunctionInvocationExpression,
        } as ExpressionStatement,
      } as ArrowExpression;

      // --- Use this arrow expression
      return [
        {
          type: "ArrowS",
          expression: arrowExpr,
        } as ArrowExpressionStatement,
      ];
    }

    if (stmt.type === "ExprS" && stmt.expression.type === "ArrowE") {
      // --- A single arrow expression
      return [
        {
          type: "ArrowS",
          expression: stmt.expression,
        } as ArrowExpressionStatement,
      ];
    }

    if (stmt.type === "ExprS" && stmt.expression.type !== "ArrowE") {
      // --- A single arrow expression
      return [
        {
          type: "ArrowS",
          expression: {
            type: "ArrowE",
            args: [],
            statement: statements[0],
          } as unknown as ArrowExpression,
        } as ArrowExpressionStatement,
      ];
    }

    if (stmt.type === "RetS") {
      // --- A single arrow expression with a return
      return [
        {
          type: "ArrowS",
          expression: {
            type: "ArrowE",
            args: [],
            statement: {
              type: "BlockS",
              statements: [stmt],
            } as BlockStatement,
          } as unknown as ArrowExpression,
        } as ArrowExpressionStatement,
      ];
    }

    if (stmt.type === "BlockS") {
      // --- A single block statement?
      if (stmt.statements[0].type === "ExprS" && stmt.statements[0].expression.type === "ArrowE") {
        // --- A single block statement with a single arrow expression?
        return [
          {
            type: "ArrowS",
            expression: stmt.statements[0].expression,
          } as ArrowExpressionStatement,
        ];
      } else {
        // --- Consider as a body of a no-arg arrow function
        return [
          {
            type: "ArrowS",
            expression: {
              type: "ArrowE",
              args: [],
              statement: statements[0],
            } as unknown as ArrowExpression,
          } as ArrowExpressionStatement,
        ];
      }
    }
  }

  if (stmtLength > 1) {
    // --- Use the statements as the body of a no-arg arrow function
    return [
      {
        type: "ArrowS",
        expression: {
          type: "ArrowE",
          args: [],
          statement: {
            type: "BlockS",
            statements,
          } as BlockStatement,
        } as unknown as ArrowExpression,
      } as ArrowExpressionStatement,
    ];
  }

  // --- Nothing to transform
  return statements;
}

/**
 * Runs the specified event handler code
 * @param source Event handler source code
 * @param evalContext Evaluation context to use
 * @param thread Logical thread to use
 * @param onStatementCompleted Callback for statement completion
 */
export async function runEventHandlerCode(
  source: string,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
  onStatementCompleted?: OnStatementCompletedCallback
): Promise<QueueInfo> {
  const statements = prepareHandlerStatements(parseHandlerCode(source));
  return await processStatementQueueAsync(statements, evalContext, thread, onStatementCompleted);
}
