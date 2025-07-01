import {
  T_ARROW_EXPRESSION,
  T_ARROW_EXPRESSION_STATEMENT,
  T_BLOCK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_RETURN_STATEMENT,
  type ArrowExpression,
  type ArrowExpressionStatement,
  type BlockStatement,
  type EmptyStatement,
  type Expression,
  type ExpressionStatement,
  type FunctionInvocationExpression,
  type Identifier,
  type Statement,
} from "../script-runner/ScriptingSourceTree";
import type { QueueInfo } from "../script-runner/statement-queue";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";

import { Parser } from "../../parsers/scripting/Parser";
import { processStatementQueueAsync } from "../script-runner/process-statement-async";
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
        new ScriptParseError(
          `${err.code}(${err.line}, ${err.column}): ${wParser.errors[0].text}`,
          source,
          err.position,
        ),
      );
    } else {
      throw err;
    }
  }

  // --- Check for the completeness of source code parsing
  if (!wParser.isEof) {
    const tail = wParser.getTail();
    reportEngineError(
      new ScriptParseError(`Invalid tail found`, source, source.length - tail.length + 1),
    );
  }

  // --- Done
  return parsedStatements!;
}

/**
 * Optionally transform statements in an event handler to an arrow expression statement
 * @param stmts Statements to transform
 * @param evalContext Optional event arguments
 */
export function prepareHandlerStatements(
  stmts: Statement[],
  evalContext?: BindingTreeEvaluationContext,
): Statement[] {
  const stmtLength = stmts?.length ?? 0;
  if (stmtLength === 0) {
    // -- Use a no-op arrow function
    return [
      {
        type: T_ARROW_EXPRESSION_STATEMENT,
        expr: {
          type: T_ARROW_EXPRESSION,
          args: [],
          statement: {
            type: T_EMPTY_STATEMENT,
          } as EmptyStatement,
        } as ArrowExpression,
      } as ArrowExpressionStatement,
    ];
  }

  if (stmtLength === 1) {
    const stmt = stmts[0];

    if (stmt.type === T_EXPRESSION_STATEMENT) {
      // --- Handle single expression statements
      if (evalContext) {
        // --- We have a context in which the event handler is executed
        if (stmt.expr.type === T_IDENTIFIER) {
          // --- A single identifier, it is supposed to be an arrow function
          // --- Use this arrow expression
          return [convertExpressionToFunctionInvocation(stmt.expr)];
        }

        if (isMemberExpressionChain(stmt.expr)) {
          // --- A single member expression chain, it is supposed to be an arrow function
          // --- Use this arrow expression
          return [convertExpressionToFunctionInvocation(stmt.expr)];
        }
      }

      if (stmt.expr.type === T_ARROW_EXPRESSION) {
        // --- A single arrow expression
        return [
          {
            type: T_ARROW_EXPRESSION_STATEMENT,
            expr: stmt.expr,
          } as ArrowExpressionStatement,
        ];
      }

      // --- A single statement, turn into an arrow expression
      return [
        {
          type: T_ARROW_EXPRESSION_STATEMENT,
          expr: {
            type: T_ARROW_EXPRESSION,
            args: [],
            statement: stmts[0],
          } as ArrowExpression,
        } as ArrowExpressionStatement,
      ];
    }

    if (stmt.type === T_RETURN_STATEMENT) {
      // --- A single arrow expression with a return
      return [
        {
          type: T_ARROW_EXPRESSION_STATEMENT,
          expr: {
            type: T_ARROW_EXPRESSION,
            args: [],
            statement: {
              type: T_BLOCK_STATEMENT,
              stmts: [stmt],
            } as BlockStatement,
          } as ArrowExpression,
        } as ArrowExpressionStatement,
      ];
    }

    if (stmt.type === T_BLOCK_STATEMENT) {
      // --- A single block statement?
      if (
        stmt.stmts[0].type === T_EXPRESSION_STATEMENT &&
        stmt.stmts[0].expr.type === T_ARROW_EXPRESSION
      ) {
        // --- A single block statement with a single arrow expression?
        return [
          {
            type: T_ARROW_EXPRESSION_STATEMENT,
            expr: stmt.stmts[0].expr,
          } as ArrowExpressionStatement,
        ];
      } else {
        // --- Consider as a body of a no-arg arrow function
        return [
          {
            type: T_ARROW_EXPRESSION_STATEMENT,
            expr: {
              type: T_ARROW_EXPRESSION,
              args: [],
              statement: stmts[0],
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
        type: T_ARROW_EXPRESSION_STATEMENT,
        expr: {
          type: T_ARROW_EXPRESSION,
          args: [],
          statement: {
            type: T_BLOCK_STATEMENT,
            stmts,
          } as BlockStatement,
        } as unknown as ArrowExpression,
      } as ArrowExpressionStatement,
    ];
  }

  // --- Nothing to transform
  return stmts;

  function isMemberExpressionChain(expr: Expression): boolean {
    return (
      (expr.type === T_MEMBER_ACCESS_EXPRESSION ||
        (expr.type === T_CALCULATED_MEMBER_ACCESS_EXPRESSION && expr.member.type === T_LITERAL)) &&
      (isMemberExpressionChain(expr.obj) || expr.obj.type === T_IDENTIFIER)
    );
  }

  function convertExpressionToFunctionInvocation(expr: Expression): ArrowExpressionStatement {
    // --- A single identifier, it is supposed to be an arrow function
    // --- Create formal arguments
    const formalArgs = evalContext.eventArgs
      ? evalContext.eventArgs.map(
          (_, idx) =>
            ({
              type: T_IDENTIFIER,
              name: `__arg@@#__${idx}__`,
            }) as Identifier,
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
      type: T_ARROW_EXPRESSION,
      args: formalArgs,
      statement: {
        type: T_EXPRESSION_STATEMENT,
        expr: {
          type: T_FUNCTION_INVOCATION_EXPRESSION,
          obj: expr,
          arguments: [...formalArgs],
        } as unknown as FunctionInvocationExpression,
      } as ExpressionStatement,
    } as ArrowExpression;

    // --- Use this arrow expression
    return {
      type: T_ARROW_EXPRESSION_STATEMENT,
      expr: arrowExpr,
    } as ArrowExpressionStatement;
  }
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
): Promise<QueueInfo> {
  const statements = prepareHandlerStatements(parseHandlerCode(source));
  return await processStatementQueueAsync(statements, evalContext, thread);
}
