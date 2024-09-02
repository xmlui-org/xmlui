import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { LoopScope } from "../../abstractions/scripting/LoopScope";
import type {
  ArrowExpression,
  EmptyStatement,
  FunctionDeclaration,
  LoopStatement,
  Statement,
  TryStatement,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { TryScope } from "../../abstractions/scripting/TryScope";
import type { StatementQueueItem } from "./statement-queue";

import { mapStatementsToQueueItems } from "./statement-queue";
import { obtainClosures } from "../../parsers/scripting/modules";

export function innermostLoopScope(thread: LogicalThread): LoopScope {
  if (!thread.loops || thread.loops.length === 0) {
    throw new Error("Missing loop scope");
  }
  return thread.loops[thread.loops.length - 1];
}

export function innermostBlockScope(thread: LogicalThread): BlockScope | undefined {
  if (!thread.blocks || thread.blocks.length === 0) return undefined;
  return thread.blocks[thread.blocks.length - 1];
}

export function innermostTryScope(thread: LogicalThread): TryScope {
  if (!thread.tryBlocks || thread.tryBlocks.length === 0) {
    throw new Error("Missing try scope");
  }
  return thread.tryBlocks[thread.tryBlocks.length - 1];
}

export function createLoopScope(thread: LogicalThread, continueOffset = 0): LoopScope {
  thread.loops ??= [];
  const breakDepth = thread.blocks?.length ?? 0;
  const tryDepth = thread.tryBlocks?.length ?? 0;
  const loopScope: LoopScope = {
    breakLabel: -1,
    continueLabel: -1,
    breakBlockDepth: breakDepth,
    continueBlockDepth: breakDepth + continueOffset,
    tryBlockDepth: tryDepth,
  };
  thread.loops.push(loopScope);
  return loopScope;
}

export function releaseLoopScope(thread: LogicalThread, skipContinuation = true): void {
  const loopScope = innermostLoopScope(thread);
  if (skipContinuation) {
    thread.loops?.pop();
  }
  if (thread.blocks) {
    thread.blocks.length = skipContinuation ? loopScope.breakBlockDepth : loopScope.continueBlockDepth;
  }
}

// --- Create a list of body statements according to the specified loop statement and scope
export function provideLoopBody(
  loopScope: LoopScope,
  loopStatement: LoopStatement,
  breakLabelValue: number | undefined
): StatementQueueItem[] {
  // --- Stay in the loop, add the body and the guard condition
  const guardStatement = { ...loopStatement, guard: true };
  const toUnshift = mapStatementsToQueueItems([loopStatement.body, guardStatement]);

  // --- The next queue label is for "break"
  loopScope.breakLabel = breakLabelValue ?? -1;

  // --- The guard action's label is for "continue"
  loopScope.continueLabel = toUnshift[1].label;
  return toUnshift;
}

// --- Create a list of body statements according to the specified try statement scope
export function createTryScope(thread: LogicalThread, tryStatement: TryStatement): TryScope {
  thread.tryBlocks ??= [];
  const loopScope: TryScope = {
    statement: tryStatement,
    processingPhase: "try",
    tryLabel: -1,
  };
  thread.tryBlocks.push(loopScope);
  return loopScope;
}

// --- Provide a body for the try block
export function provideTryBody(thread: LogicalThread, tryScope: TryScope): StatementQueueItem[] {
  // --- Stay in the error handling block, add the body and the guard condition
  const guardStatement = { ...tryScope.statement, guard: true };

  // --- New block scope for try
  thread.blocks!.push({
    vars: {},
  });

  // --- Prepare an empty statement that will only remove the block scope when the entire block is processed
  const closing = {
    type: "EmptyS",
    removeBlockScope: true,
  } as EmptyStatement; // --- We need the cast as we do not provide required props

  const toUnshift = mapStatementsToQueueItems([...tryScope.statement.tryBlock.statements, closing, guardStatement]);
  tryScope.tryLabel = toUnshift[toUnshift.length - 1].label;
  return toUnshift;
}

// --- Provide a body for the catch block
export function provideCatchBody(thread: LogicalThread, tryScope: TryScope): StatementQueueItem[] {
  // --- Stay in the error handling block, add the body and the guard condition
  const guardStatement = { ...tryScope.statement, guard: true };

  // --- New block scope for catch
  thread.blocks!.push({
    vars: {},
  });

  // --- Prepare an empty statement that will only remove the block scope when the entire block is processed
  const closing = {
    type: "EmptyS",
    removeBlockScope: true,
  } as EmptyStatement; // --- We need the cast as we do not provide required props

  const toUnshift = mapStatementsToQueueItems([...tryScope.statement.catchBlock!.statements, closing, guardStatement]);
  tryScope.tryLabel = toUnshift[toUnshift.length - 1].label;
  return toUnshift;
}

// --- Provide a body for the finally block
export function provideFinallyBody(thread: LogicalThread, tryScope: TryScope): StatementQueueItem[] {
  // --- Stay in the error handling block, add the body and the guard condition
  const guardStatement = { ...tryScope.statement, guard: true };

  // --- New block scope for finally
  thread.blocks!.push({
    vars: {},
  });

  // --- Prepare an empty statement that will only remove the block scope when the entire block is processed
  const closing = {
    type: "EmptyS",
    removeBlockScope: true,
  } as EmptyStatement; // --- We need the cast as we do not provide required props

  const finallyBlock = tryScope.statement.finallyBlock;
  const toUnshift = mapStatementsToQueueItems([
    ...(finallyBlock ? finallyBlock.statements : []),
    closing,
    guardStatement,
  ]);
  tryScope.tryLabel = toUnshift[toUnshift.length - 1].label;
  return toUnshift;
}

// --- Provide a body for the error block in finally
export function provideFinallyErrorBody(tryScope: TryScope): StatementQueueItem[] {
  // --- Stay in the error handling block, add the body and the guard condition
  const guardStatement = { ...tryScope.statement, guard: true };
  const toUnshift = mapStatementsToQueueItems([guardStatement]);
  tryScope.tryLabel = toUnshift[0].label;
  return toUnshift;
}

// --- Ensure that the evaluation context has a main thread
export function ensureMainThread(evalContext: BindingTreeEvaluationContext): LogicalThread {
  if (!evalContext.mainThread) {
    evalContext.mainThread = {
      childThreads: [],
      blocks: [
        {
          vars: {},
        },
      ],
      loops: [],
      breakLabelValue: -1,
    };
  }
  return evalContext.mainThread;
}

// --- Hoist function definitions to the innermost block scope
export function hoistFunctionDeclarations(thread: LogicalThread, statements: Statement[]): void {
  const block = innermostBlockScope(thread);
  if (!block) {
    throw new Error("Missing block scope");
  }
  statements
    .filter((stmt) => stmt.type === "FuncD")
    .forEach((stmt) => {
      const funcDecl = stmt as FunctionDeclaration;

      // --- Turn the function into an arrow expression
      const arrowExpression = {
        type: "ArrowE",
        args: funcDecl.args,
        statement: funcDecl.statement,
        closureContext: obtainClosures(thread),
        _ARROW_EXPR_: true,
      } as unknown as ArrowExpression;

      // --- Remove the functions from the closure list

      // --- Check name uniqueness
      const id = funcDecl.name;
      if (block.vars[id]) {
        throw new Error(`Variable ${id} is already declared in the current scope.`);
      }

      // --- Function is a constant
      block.vars[id] = arrowExpression;
      block.constVars ??= new Set<string>();
      block.constVars.add(id);
    });
}
