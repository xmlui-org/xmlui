import type { LoopScope } from "../../abstractions/scripting/LoopScope";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import {
  T_ARROW_EXPRESSION_STATEMENT,
  T_ASSIGNMENT_EXPRESSION,
  T_ASYNC_FUNCTION_DECLARATION,
  T_BLOCK_STATEMENT,
  T_BREAK_STATEMENT,
  T_CONST_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_FOR_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_RETURN_STATEMENT,
  T_SWITCH_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_VAR_STATEMENT,
  T_WHILE_STATEMENT,
  type ArrayDestructure,
  type AssignmentExpression,
  type Identifier,
  type Literal,
  type ObjectDestructure,
  type Statement,
  type VarDeclaration,
} from "./ScriptingSourceTree";
import { StatementExecutionError, ThrowStatementError } from "../EngineError";
import { reportEngineError } from "../reportEngineError";
import type {
  QueueInfo,
  StatementQueueItem,
  ProcessOutcome,
  StatementRunTimeInfo,
  StatementWithInfo,
  LoopSignal,
} from "./statement-queue";
import {
  StatementQueue,
  mapStatementsToQueueItems,
  mapToItem
} from "./statement-queue";
import { evalBindingAsync, executeArrowExpression } from "./eval-tree-async";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import {
  ensureMainThread,
  innermostBlockScope,
  innermostLoopScope,
  createLoopScope,
  releaseLoopScope,
  provideTryBody,
  createTryScope,
  innermostTryScope,
  provideFinallyBody,
  provideCatchBody,
  provideFinallyErrorBody,
  hoistFunctionDeclarations,
  closing,
  toStatementItems,
  guard,
} from "./process-statement-common";
import { createXmlUiTreeNodeId } from "../../parsers/scripting/Parser";

// Sentinel to distinguish "return not yet called" from "return called with undefined"
const RETURN_UNSET_ASYNC: unique symbol = Symbol("RETURN_UNSET_ASYNC");

// --- Inner queue-processing loop, shared by processStatementQueueAsync and executeBodyAsync.
// --- Takes an explicit startTime so body sub-queue calls don't reset the outer timeout.
async function runQueueCoreAsync(
  queue: StatementQueue,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  diagInfo: QueueInfo,
  startTime: number,
): Promise<void> {
  while (queue.length > 0 && !evalContext.cancellationToken?.cancelled) {
    // --- Allow time to break from infinite loops
    if (evalContext.timeout && new Date().getTime() - startTime > evalContext.timeout) {
      throw new Error("Script execution timeout");
    }

    // --- Process the first item
    const queueItem = queue.dequeue();
    thread.breakLabelValue = queue.length > 0 ? queue.peek()!.label : -1;

    let outcome: ProcessOutcome | undefined;
    try {
      // --- Sign that the statement is about to start
      await evalContext?.onStatementStarted?.(evalContext, queueItem!.statement);

      // --- Execute the statement
      outcome = await processStatementAsync(
        queueItem!.statement,
        queueItem?.execInfo ?? {},
        evalContext,
        thread,
      );
    } catch (err) {
      if (thread.tryBlocks && thread.tryBlocks.length > 0) {
        // --- We have a try block to handle this error
        const tryScope = thread.tryBlocks[thread.tryBlocks.length - 1];

        // --- Sign the error to raise. Next time the guarded try block will execute the catch block, if there is any
        tryScope.errorToThrow = err;
        tryScope.errorSource = tryScope.processingPhase;
        tryScope.processingPhase = "error";

        // --- Let's skip the remaining parts of the current block (try/catch/finally)
        outcome = {
          clearToLabel: tryScope.tryLabel,
        };
      } else {
        if (err instanceof ThrowStatementError) {
          reportEngineError(err);
        } else {
          // TODO: Provide source code information
          reportEngineError(
            new StatementExecutionError(err as any /* queueItem!.statement?.source */),
            err,
          );
        }
      }
    }

    // --- Modify the queue's content according to the outcome
    if (outcome) {
      if (outcome.toUnshift) {
        queue.unshift(outcome.toUnshift);

        diagInfo.unshiftedItems += outcome.toUnshift.length;
      }
      if (outcome.clearToLabel !== undefined) {
        queue.clearToLabel(outcome.clearToLabel);

        diagInfo.clearToLabels++;
      }
    }

    // --- Sign that the statement has been completed
    await evalContext?.onStatementCompleted?.(evalContext, queueItem!.statement);

    // --- Provide diagnostics
    if (queue.length > diagInfo.maxQueueLength) {
      diagInfo.maxQueueLength = queue.length;
    }
    if (thread.blocks && thread.blocks!.length > diagInfo.maxBlocks) {
      diagInfo.maxBlocks = thread.blocks!.length;
    }
    if (thread.loops && thread.loops.length > diagInfo.maxLoops) {
      diagInfo.maxLoops = thread.loops.length;
    }
    diagInfo.processedStatements++;
  }
}

// --- Helper function to process the entire queue asynchronously
export async function processStatementQueueAsync(
  statements: Statement[],
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): Promise<QueueInfo> {
  if (!thread) {
    // --- Create the main thread for the queue
    thread = ensureMainThread(evalContext);
  }

  // --- Hoist function declarations to the top scope
  hoistFunctionDeclarations(thread, statements);

  // --- Fill the queue with items
  const queue = new StatementQueue();
  queue.push(mapStatementsToQueueItems(toStatementItems(statements)));

  // --- Prepare queue diagnostics information
  const diagInfo: QueueInfo = {
    processedStatements: 0,
    maxQueueLength: queue.length,
    unshiftedItems: 0,
    clearToLabels: 0,
    maxBlocks: 0,
    maxLoops: 0,
  };

  await runQueueCoreAsync(queue, evalContext, thread, diagInfo, new Date().getTime());

  // --- Done.
  return diagInfo;
}

/**
 * Async variant of executeBodySync — runs a loop body in a sub-queue and returns a LoopSignal
 * for break/continue/return/throw, or undefined for normal completion.
 */
export async function executeBodyAsync(
  bodyStatement: Statement,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  loopScope: LoopScope,
): Promise<LoopSignal | undefined> {
  // --- Save outer returnValue; mark as "not set" to detect if a return fires inside
  const savedReturnValue = thread.returnValue;
  thread.returnValue = RETURN_UNSET_ASYNC as unknown as any;

  // --- Snapshot outer try-scope phases to detect if a throw was captured silently
  const outerTryCount = thread.tryBlocks?.length ?? 0;
  const outerTrySnapshots =
    outerTryCount > 0 ? thread.tryBlocks!.map(ts => ts.processingPhase) : undefined;

  const queue = new StatementQueue();
  queue.push(mapToItem(bodyStatement));
  const diagInfo: QueueInfo = {
    processedStatements: 0,
    maxQueueLength: queue.length,
    unshiftedItems: 0,
    clearToLabels: 0,
    maxBlocks: 0,
    maxLoops: 0,
  };

  try {
    await runQueueCoreAsync(queue, evalContext, thread, diagInfo, new Date().getTime());
  } catch (err) {
    thread.returnValue = savedReturnValue;
    return { kind: "throw", error: err };
  }

  // --- Detect return
  if ((thread.returnValue as unknown) !== RETURN_UNSET_ASYNC) {
    return { kind: "return" };
  }
  thread.returnValue = savedReturnValue;

  // --- Detect throw captured by an outer try/catch
  if (outerTrySnapshots && thread.tryBlocks) {
    const count = Math.min(outerTryCount, thread.tryBlocks.length);
    for (let i = 0; i < count; i++) {
      const ts = thread.tryBlocks[i];
      if (outerTrySnapshots[i] !== "error" && ts.processingPhase === "error" && ts.errorToThrow != null) {
        const errorToRethrow = ts.errorToThrow;
        (ts as any).processingPhase = outerTrySnapshots[i];
        ts.errorToThrow = undefined;
        if (thread.blocks) thread.blocks.length = loopScope.breakBlockDepth;
        thread.loops?.pop();
        thread.returnValue = savedReturnValue;
        throw errorToRethrow;
      }
    }
  }

  // --- Detect break / continue
  const signal = loopScope.exitSignal;
  if (signal) {
    loopScope.exitSignal = undefined;
    return { kind: signal };
  }

  return undefined;
}

/**
 * Process the specified statement asynchronously
 * @param statement Statement to process
 * @param execInfo Execution information
 * @param evalContext Evaluation context used for processing
 * @param thread Logical thread to use for statement processing
 * @param onStatementCompleted
 * @returns Items to put back into the queue of statements
 */
async function processStatementAsync(
  statement: Statement,
  execInfo: StatementRunTimeInfo,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<ProcessOutcome> {
  // --- These items should be put in the statement queue after return
  let toUnshift: StatementQueueItem[] = [];
  let clearToLabel: number | undefined;

  // --- Process the statement according to its type
  switch (statement.type) {
    case T_ASYNC_FUNCTION_DECLARATION:
      throw new Error("XMLUI does not support async function declarations.");

    case T_FUNCTION_DECLARATION:
      // --- Function declarations are already hoisted, nothing to do
      break;

    case T_VAR_STATEMENT:
      if (thread !== evalContext.mainThread) {
        throw new Error("'var' declarations are not allowed within functions");
      }
      break;

    case T_EMPTY_STATEMENT:
      // --- Nothing to do
      break;

    case T_BLOCK_STATEMENT:
      // --- No statement, nothing to process
      if (statement.stmts.length === 0) break;

      // --- Create a new block scope
      thread.blocks ??= [];
      thread.blocks.push({ vars: {} });

      // --- Hoist function declarations to the innermost block scope
      hoistFunctionDeclarations(thread, statement.stmts);

      // --- Queue the block scope's body...
      toUnshift = mapStatementsToQueueItems([
        ...toStatementItems(statement.stmts),
        // --- ...and an empty statement to remove the block scope
        closing(),
      ]);
      break;

    case T_EXPRESSION_STATEMENT:
      // --- Just evaluate it
      const statementValue = await evalBindingAsync(
        statement.expr,
        evalContext,
        thread,
      );
      if (thread.blocks && thread.blocks.length !== 0) {
        thread.blocks[thread.blocks.length - 1].returnValue = statementValue;
      }
      break;

    case T_ARROW_EXPRESSION_STATEMENT:
      // --- Compile the arrow expression
      const arrowFuncValue = await executeArrowExpression(
        statement.expr,
        evalContext,
        thread,
        ...(evalContext.eventArgs ?? []),
      );
      if (thread.blocks && thread.blocks.length !== 0) {
        thread.blocks[thread.blocks.length - 1].returnValue = arrowFuncValue;
      }
      break;

    case T_LET_STATEMENT: {
      // --- Create a new variable in the innermost scope
      const block = innermostBlockScope(thread);
      if (!block) {
        throw new Error("Missing block scope");
      }
      await processDeclarationsAsync(block, evalContext, thread, statement.decls);
      break;
    }

    case T_CONST_STATEMENT: {
      // --- Create a new variable in the innermost scope
      const block = innermostBlockScope(thread);
      if (!block) {
        throw new Error("Missing block scope");
      }
      await processDeclarationsAsync(block, evalContext, thread, statement.decls, true);
      break;
    }

    case T_IF_STATEMENT:
      // --- Evaluate the condition
      const condition = !!(await evalBindingAsync(statement.cond, evalContext, thread));
      if (condition) {
        toUnshift = mapToItem(statement.thenB);
      } else if (statement.elseB) {
        toUnshift = mapToItem(statement.elseB);
      }
      break;

    case T_RETURN_STATEMENT: {
      // --- Check if return is valid here
      let blockScope = innermostBlockScope(thread);
      if (blockScope === undefined) {
        throw new Error("Return requires a block scope");
      }

      // --- Store the return value
      thread.returnValue = statement.expr
        ? await evalBindingAsync(statement.expr, evalContext, thread)
        : undefined;

      // --- Check for try blocks
      if ((thread.tryBlocks ?? []).length > 0) {
        // --- Mark ALL try scopes to exit with "return" to properly propagate through nested tries
        for (let i = 0; i < thread.tryBlocks!.length; i++) {
          thread.tryBlocks![i].exitType = "return";
        }

        // --- Remove the try/catch/finally block's scope (check innermost, not outermost)
        const tryScope = innermostTryScope(thread);
        if (tryScope.processingPhase !== "postFinally") {
          thread.blocks!.pop();
        }

        // --- Clear the last part of the try/catch/finally block
        clearToLabel = tryScope.tryLabel;
      } else {
        // --- Delete the remaining part of the queue
        clearToLabel = -1;
      }
      break;
    }

    case T_WHILE_STATEMENT: {
      const whileLoopScope = createLoopScope(thread);
      let whileBroke = false;
      whileOuter: {
        while (!!(await evalBindingAsync(statement.cond, evalContext, thread))) {
          const whileSignal = await executeBodyAsync(statement.body, evalContext, thread, whileLoopScope);
          if (whileSignal === undefined || whileSignal.kind === "continue") continue;
          if (whileSignal.kind === "break") { whileBroke = true; break; }
          if (whileSignal.kind === "return") {
            releaseLoopScope(thread);
            clearToLabel = -1;
            break whileOuter;
          }
          if (whileSignal.kind === "throw") throw whileSignal.error;
        }
        if (!whileBroke) releaseLoopScope(thread);
      }
      break;
    }

    case T_DO_WHILE_STATEMENT: {
      const doWhileLoopScope = createLoopScope(thread);
      let doWhileBroke = false;
      doWhileOuter: {
        do {
          const doWhileSignal = await executeBodyAsync(statement.body, evalContext, thread, doWhileLoopScope);
          if (doWhileSignal === undefined || doWhileSignal.kind === "continue") continue;
          if (doWhileSignal.kind === "break") { doWhileBroke = true; break; }
          if (doWhileSignal.kind === "return") {
            releaseLoopScope(thread);
            clearToLabel = -1;
            break doWhileOuter;
          }
          if (doWhileSignal.kind === "throw") throw doWhileSignal.error;
        } while (!!(await evalBindingAsync(statement.cond, evalContext, thread)));
        if (!doWhileBroke) releaseLoopScope(thread);
      }
      break;
    }

    case T_CONTINUE_STATEMENT: {
      // --- Search for the innermost non-switch loop scope, release the switch scopes
      if (!thread.loops || thread.loops.length === 0) {
        throw new Error("Missing loop scope");
      }

      let loopScope: LoopScope | undefined;
      while (thread.loops.length > 0) {
        loopScope = innermostLoopScope(thread);
        if (!loopScope.isSwitch) {
          break;
        }
        thread.loops.pop();
      }

      if (!loopScope) {
        throw new Error("Missing loop scope");
      }

      if (
        loopScope.tryBlockDepth >= 0 &&
        loopScope.tryBlockDepth < (thread.tryBlocks ?? []).length
      ) {
        // --- Mark the loop's try scope to exit with "continue"
        for (let i = loopScope.tryBlockDepth; i < thread.tryBlocks!.length; i++) {
          thread.tryBlocks![loopScope.tryBlockDepth]!.exitType = "continue";
        }

        // --- Clear the last part of the try/catch/finally block
        const tryScope = innermostTryScope(thread);
        clearToLabel = tryScope.tryLabel;
      } else {
        loopScope.exitSignal = "continue";
        clearToLabel = loopScope.continueLabel;
        releaseLoopScope(thread, false);
      }
      break;
    }

    case T_BREAK_STATEMENT: {
      const loopScope = innermostLoopScope(thread);
      if (loopScope === undefined) {
        throw new Error("Missing loop scope");
      }

      if (!!loopScope.isSwitch) {
        // --- Break is in a switch case
        clearToLabel = loopScope.breakLabel;
        break;
      }

      // --- Break is in a loop construct
      if (
        loopScope.tryBlockDepth >= 0 &&
        loopScope.tryBlockDepth < (thread.tryBlocks ?? []).length
      ) {
        // --- Mark the loop's try scope to exit with "break"
        for (let i = loopScope.tryBlockDepth; i < thread.tryBlocks!.length; i++) {
          thread.tryBlocks![loopScope.tryBlockDepth]!.exitType = "break";
        }

        // --- Clear the last part of the try/catch/finally block
        const tryScope = innermostTryScope(thread);
        clearToLabel = tryScope.tryLabel;
      } else {
        loopScope.exitSignal = "break";
        clearToLabel = loopScope.breakLabel;
        releaseLoopScope(thread);
      }
      break;
    }

    case T_FOR_STATEMENT: {
      const forLoopScope = createLoopScope(thread, 1);
      thread.blocks ??= [];
      thread.blocks.push({ vars: {} });
      if (statement.init) {
        const initQueue = new StatementQueue();
        initQueue.push(mapToItem(statement.init));
        const initDiag: QueueInfo = {
          processedStatements: 0, maxQueueLength: 1, unshiftedItems: 0,
          clearToLabels: 0, maxBlocks: 0, maxLoops: 0,
        };
        await runQueueCoreAsync(initQueue, evalContext, thread, initDiag, new Date().getTime());
      }
      let forBroke = false;
      forOuter: {
        while (!statement.cond || !!(await evalBindingAsync(statement.cond, evalContext, thread))) {
          const forSignal = await executeBodyAsync(statement.body, evalContext, thread, forLoopScope);
          if (forSignal === undefined || forSignal.kind === "continue") {
            if (statement.upd) await evalBindingAsync(statement.upd, evalContext, thread);
            continue;
          }
          if (forSignal.kind === "break") { forBroke = true; break; }
          if (forSignal.kind === "return") {
            releaseLoopScope(thread);
            clearToLabel = -1;
            break forOuter;
          }
          if (forSignal.kind === "throw") throw forSignal.error;
        }
        if (!forBroke) releaseLoopScope(thread);
      }
      break;
    }

    case T_FOR_IN_STATEMENT: {
      const keyedObject = await evalBindingAsync(statement.expr, evalContext, thread);
      if (keyedObject == null) break;
      const forInKeys = Object.keys(keyedObject);
      const forInLoopScope = createLoopScope(thread, 1);
      thread.blocks ??= [];
      thread.blocks.push({ vars: {} });
      let forInBroke = false;
      forInOuter: {
        for (const forInKey of forInKeys) {
          const forInBlock = innermostBlockScope(thread)!;
          forInBlock.vars = {};
          forInBlock.constVars = undefined;
          switch (statement.varB) {
            case "none": {
              const assignExpr: AssignmentExpression = {
                type: T_ASSIGNMENT_EXPRESSION,
                leftValue: { type: T_IDENTIFIER, name: statement.id.name } as Identifier,
                op: "=",
                expr: { type: T_LITERAL, value: forInKey } as Literal,
              } as AssignmentExpression;
              await evalBindingAsync(assignExpr, evalContext, thread);
              break;
            }
            case "const":
            case "let": {
              forInBlock.vars[statement.id.name] = forInKey;
              if (statement.varB === "const") {
                forInBlock.constVars ??= new Set<string>();
                forInBlock.constVars.add(statement.id.name);
              }
              break;
            }
          }
          const forInSignal = await executeBodyAsync(statement.body, evalContext, thread, forInLoopScope);
          if (forInSignal === undefined || forInSignal.kind === "continue") continue;
          if (forInSignal.kind === "break") { forInBroke = true; break; }
          if (forInSignal.kind === "return") {
            releaseLoopScope(thread);
            clearToLabel = -1;
            break forInOuter;
          }
          if (forInSignal.kind === "throw") throw forInSignal.error;
        }
        if (!forInBroke) releaseLoopScope(thread);
      }
      break;
    }

    case T_FOR_OF_STATEMENT: {
      const iterableObj = await evalBindingAsync(statement.expr, evalContext, thread);
      if (iterableObj == null || typeof iterableObj[Symbol.iterator] !== "function") {
        throw new Error("Object in for..of is not iterable");
      }
      const forOfLoopScope = createLoopScope(thread, 1);
      thread.blocks ??= [];
      thread.blocks.push({ vars: {} });
      const forOfIter = iterableObj[Symbol.iterator]();
      forOfOuter: {
        nativeForOf: while (true) {
          const next = forOfIter.next();
          if (next.done) {
            releaseLoopScope(thread);
            break nativeForOf;
          }
          const forOfBlock = innermostBlockScope(thread)!;
          forOfBlock.vars = {};
          forOfBlock.constVars = undefined;
          const forOfValue = next.value;
          switch (statement.varB) {
            case "none": {
              const assignExpr: AssignmentExpression = {
                type: T_ASSIGNMENT_EXPRESSION,
                leftValue: { type: T_IDENTIFIER, name: statement.id.name } as Identifier,
                op: "=",
                expr: { type: T_LITERAL, value: forOfValue } as Literal,
              } as AssignmentExpression;
              await evalBindingAsync(assignExpr, evalContext, thread);
              break;
            }
            case "const":
            case "let": {
              forOfBlock.vars[statement.id.name] = forOfValue;
              if (statement.varB === "const") {
                forOfBlock.constVars ??= new Set<string>();
                forOfBlock.constVars.add(statement.id.name);
              }
              break;
            }
          }
          const forOfSignal = await executeBodyAsync(statement.body, evalContext, thread, forOfLoopScope);
          if (forOfSignal === undefined || forOfSignal.kind === "continue") continue nativeForOf;
          if (forOfSignal.kind === "break") break nativeForOf;
          if (forOfSignal.kind === "return") {
            releaseLoopScope(thread);
            clearToLabel = -1;
            break forOfOuter;
          }
          if (forOfSignal.kind === "throw") throw forOfSignal.error;
        }
      }
      break;
    }

    case T_THROW_STATEMENT: {
      throw new ThrowStatementError(await evalBindingAsync(statement.expr, evalContext, thread));
    }

    case T_TRY_STATEMENT: {
      if (!execInfo.guard) {
        // --- Execute the try block
        toUnshift = provideTryBody(thread, createTryScope(thread, statement));
        break;
      }

      // --- Evaluate try
      const tryScope = innermostTryScope(thread);
      switch (tryScope.processingPhase) {
        case "error":
          // --- There was an error we may handle with catch
          switch (tryScope.errorSource) {
            case "try":
              // --- Remove the "try" block's scope
              thread.blocks!.pop();

              // --- Go on with catch or finally
              if (statement.catchB) {
                if (tryScope.statement.catchV) {
                  const block = innermostBlockScope(thread)!;
                  block.vars[tryScope.statement.catchV.name] =
                    tryScope.errorToThrow instanceof ThrowStatementError
                      ? tryScope.errorToThrow.errorObject
                      : tryScope.errorToThrow;
                }
                delete tryScope.errorToThrow;
                tryScope.processingPhase = "catch";
                toUnshift = provideCatchBody(thread, tryScope);
              } else if (tryScope.statement.finallyB) {
                // --- No catch, move on finally
                tryScope.processingPhase = "finally";
                toUnshift = provideFinallyBody(thread, tryScope);
              }
              break;
            case "catch":
              // --- Remove the "catch" block's scope
              thread.blocks!.pop();

              // --- Move to the finally block
              tryScope.processingPhase = "finally";
              toUnshift = provideFinallyBody(thread, tryScope);
              break;
            case "finally":
              // --- Remove the "finally" block's scope
              thread.blocks!.pop();

              // --- Move to the post finally execution
              tryScope.processingPhase = "postFinally";
              toUnshift = provideFinallyErrorBody(tryScope);
              break;
          }
          break;
        case "try":
          // --- We completed the try block successfully
          tryScope.processingPhase = "finally";
          if (statement.finallyB) {
            toUnshift = provideFinallyBody(thread, tryScope);
          } else {
            // --- No finally block, but we still need to advance to postFinally to check exitType
            toUnshift = provideFinallyErrorBody(tryScope);
          }
          break;
        case "catch":
          // --- We completed the catch block successfully, remove the handled error
          tryScope.processingPhase = "finally";
          if (statement.finallyB) {
            toUnshift = provideFinallyBody(thread, tryScope);
          } else {
            // --- No finally block, but we still need to advance to postFinally to check exitType
            toUnshift = provideFinallyErrorBody(tryScope);
          }
          break;
        case "finally":
          tryScope.processingPhase = "postFinally";
          toUnshift = provideFinallyErrorBody(tryScope);
          break;

        case "postFinally":
          // --- We completed the finally block successfully
          const innermostTry = thread.tryBlocks!.pop()!;

          //  --- Is there any special exit type?
          switch (innermostTry.exitType) {
            case "break": {
              const loopScope = innermostLoopScope(thread);
              if (loopScope === undefined) {
                throw new Error("Missing loop scope");
              }
              loopScope.exitSignal = "break";
              releaseLoopScope(thread);
              clearToLabel = loopScope.breakLabel;
              break;
            }
            case "continue": {
              const loopScope = innermostLoopScope(thread);
              if (loopScope === undefined) {
                throw new Error("Missing loop scope");
              }
              loopScope.exitSignal = "continue";
              clearToLabel = loopScope.continueLabel;
              releaseLoopScope(thread, false);
              break;
            }
            case "return":
              // --- When returning, we need to clean up any remaining try/catch blocks
              // --- and their associated block scopes before exiting
              if (thread.tryBlocks && thread.tryBlocks.length > 0) {
                // --- There are outer try blocks, exit through them
                // --- We need to pop the catch block scope that won't be cleaned up
                // --- because we're skipping its closing statement
                if (thread.blocks && thread.blocks.length > 1) {
                  thread.blocks.pop(); // Pop the catch block
                }
                // --- The outer try's guard will handle its own cleanup and check exitType
                const outerTry = thread.tryBlocks[thread.tryBlocks.length - 1];
                clearToLabel = outerTry.tryLabel;
              } else {
                // --- No more try blocks, exit the function
                clearToLabel = -1;
              }
              break;
          }

          // --- Should we raise an error?
          if (innermostTry.errorToThrow) {
            throw innermostTry.errorToThrow;
          }
          break;
      }
      break;
    }

    case T_SWITCH_STATEMENT: {
      // --- Create or get the loop's scope (guard is falsy for the first execution)
      if (execInfo.guard) {
        // --- Complete the switch
        releaseLoopScope(thread);
      } else {
        let loopScope = createLoopScope(thread);
        loopScope.isSwitch = true;
        thread.blocks!.push({ vars: {} });

        // --- Evaluate the switch value
        const switchValue = await evalBindingAsync(statement.expr, evalContext, thread);

        // --- Find the matching label
        let matchingIndex = -1;
        for (let i = 0; i < statement.cases.length; i++) {
          const currentCase = statement.cases[i];

          // --- Check for default case
          if (currentCase.caseE === undefined) {
            matchingIndex = i;
            break;
          }

          // --- Check for matching case
          const caseValue = await evalBindingAsync(currentCase.caseE, evalContext, thread);
          if (caseValue === switchValue) {
            matchingIndex = i;
            break;
          }
        }

        // --- Merge all statements from the matching label
        const statementFlow: Statement[] = [];
        if (matchingIndex >= 0) {
          for (let i = matchingIndex; i < statement.cases.length; i++) {
            statementFlow.push(...statement.cases[i].stmts!);
          }
        }

        // --- Queue the statement flow and the guard
        toUnshift = mapStatementsToQueueItems([
          ...toStatementItems(statementFlow),
          guard(statement),
        ]);
        loopScope.breakLabel = toUnshift[toUnshift.length - 1].label;
      }
      break;
    }
  }

  // --- The statement may remove the innermost scope
  if (execInfo.removeBlockScope) {
    if (thread.blocks && thread.blocks.length > 0) {
      thread.blocks.pop();
    }
  }

  // --- Done.
  return { toUnshift, clearToLabel };
}

/**
 * Funtion to process a visited ID
 */
type IdDeclarationVisitor = (id: string) => void;

// --- Process a variable declaration
export async function processDeclarationsAsync(
  block: BlockScope,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  declarations: VarDeclaration[],
  addConst = false,
  useValue = false,
  baseValue = undefined,
): Promise<void> {
  for (let i = 0; i < declarations.length; i++) {
    let value: any;
    const decl = declarations[i];
    if (useValue) {
      value = baseValue;
    } else if (decl.expr) {
      value = await evalBindingAsync(decl.expr, evalContext, thread);
    }
    visitDeclaration(block, decl, value, addConst);
  }

  // --- Visit a variable
  function visitDeclaration(
    block: BlockScope,
    decl: VarDeclaration,
    baseValue: any,
    addConst: boolean,
  ): void {
    // --- Process each declaration
    if (decl.id) {
      visitIdDeclaration(block, decl.id, baseValue, addConst);
    } else if (decl.aDestr) {
      visitArrayDestruct(block, decl.aDestr, baseValue, addConst);
    } else if (decl.oDestr) {
      visitObjectDestruct(block, decl.oDestr, baseValue, addConst);
    } else {
      throw new Error("Unknown declaration specifier");
    }
  }

  // --- Visits a single ID declaration
  function visitIdDeclaration(
    block: BlockScope,
    id: string,
    baseValue: any,
    addConst: boolean,
  ): void {
    if (block.vars[id]) {
      throw new Error(`Variable ${id} is already declared in the current scope.`);
    }
    block.vars[id] = baseValue;
    if (addConst) {
      block.constVars ??= new Set<string>();
      block.constVars.add(id);
    }
  }

  // --- Visits an array destructure declaration
  function visitArrayDestruct(
    block: BlockScope,
    arrayD: ArrayDestructure[],
    baseValue: any,
    addConst: boolean,
  ): void {
    for (let i = 0; i < arrayD.length; i++) {
      const arrDecl = arrayD[i];
      const value = baseValue?.[i];
      if (arrDecl.id) {
        visitIdDeclaration(block, arrDecl.id, value, addConst);
      } else if (arrDecl.aDestr) {
        visitArrayDestruct(block, arrDecl.aDestr, value, addConst);
      } else if (arrDecl.oDestr) {
        visitObjectDestruct(block, arrDecl.oDestr, value, addConst);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(
    block: BlockScope,
    objectD: ObjectDestructure[],
    baseValue: any,
    addConst: boolean,
  ): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      const value = baseValue?.[objDecl.id!];
      if (objDecl.aDestr) {
        visitArrayDestruct(block, objDecl.aDestr, value, addConst);
      } else if (objDecl.oDestr) {
        visitObjectDestruct(block, objDecl.oDestr, value, addConst);
      } else {
        visitIdDeclaration(block, objDecl.alias ?? objDecl.id!, value, addConst);
      }
    }
  }
}
