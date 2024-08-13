import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import type {
  ArrayDestructure,
  AssignmentExpression,
  ConstStatement,
  EmptyStatement,
  ExpressionStatement,
  Identifier,
  LetStatement,
  Literal,
  ObjectDestructure,
  Statement,
  VarDeclaration,
} from "../abstractions/scripting/ScriptingSourceTree";
import type { QueueInfo, StatementQueueItem, ProcessOutcome } from "./statement-queue";
import type { LogicalThread } from "./LogicalThread";
import type { LoopScope } from "./LoopScope";
import type { BlockScope } from "../abstractions/BlockScope";

import { evalBindingAsync, executeArrowExpression } from "./eval-tree-async.js";
import {
  ensureMainThread,
  innermostBlockScope,
  innermostLoopScope,
  createLoopScope,
  provideLoopBody,
  releaseLoopScope,
  provideTryBody,
  createTryScope,
  innermostTryScope,
  provideFinallyBody,
  provideCatchBody,
  provideFinallyErrorBody,
  hoistFunctionDeclarations,
} from "./process-statement-common.js";
import { StatementQueue, mapStatementsToQueueItems, mapToItem } from "./statement-queue.js";
import { reportEngineError } from "./reportEngineError.js";
import {StatementExecutionError, ThrowStatementError} from "./EngineError.js";

export type OnStatementCompletedCallback =
  | ((evalContext: BindingTreeEvaluationContext, completedStatement: Statement) => Promise<void>)
  | undefined;

// --- Helper function to process the entire queue asynchronously
export async function processStatementQueueAsync(
  statements: Statement[],
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
  onStatementCompleted?: OnStatementCompletedCallback
): Promise<QueueInfo> {
  if (!thread) {
    // --- Create the main thread for the queue
    thread = ensureMainThread(evalContext);
  }

  // --- Hoist function declarations to the top scope
  hoistFunctionDeclarations(thread, statements);

  // --- Fill the queue with items
  const queue = new StatementQueue();
  queue.push(mapStatementsToQueueItems(statements));

  // --- Prepare queue diagnostics information
  const diagInfo: QueueInfo = {
    processedStatements: 0,
    maxQueueLength: queue.length,
    unshiftedItems: 0,
    clearToLabels: 0,
    maxBlocks: 0,
    maxLoops: 0,
  };

  // --- Consume the queue
  let startTime = new Date().getTime();
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
      outcome = await processStatementAsync(queueItem!.statement, evalContext, thread, onStatementCompleted);
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
          reportEngineError(new StatementExecutionError(err as any, queueItem!.statement?.source), err);
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

    await onStatementCompleted?.(evalContext, queueItem!.statement);

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

  return diagInfo;
}

/**
 * Process the specified statement asynchronously
 * @param statement Statement to process
 * @param evalContext Evaluation context used for processing
 * @param thread Logical thread to use for statement processing
 * @param onStatementCompleted
 * @returns Items to put back into the queue of statements
 */
async function processStatementAsync(
  statement: Statement,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback
): Promise<ProcessOutcome> {
  // --- These items should be put in the statement queue after return
  let toUnshift: StatementQueueItem[] = [];
  let clearToLabel: number | undefined;

  // --- Process the statement according to its type
  switch (statement.type) {
    case "ImportD":
      // --- Get module information
      const thisModule = statement.module;
      if (!thisModule) {
        throw new Error("Missing module");
      }
      const parentModule = statement.module?.parent;
      if (!parentModule) {
        throw new Error("Missing parent module");
      }

      // --- At this point the imported module is set
      // if (!statement.module!.executed) {
      //   // --- Run the module, it has not been executed yet
      //   const childEvalContext = createEvalContext({
      //     cancellationToken: evalContext.cancellationToken,
      //     timeout: evalContext.timeout ?? 1000
      //   });
      //   statement.module!.executed = true;
      //   executeScriptModule(statement.module!, childEvalContext);
      // }

      // --- Import the module's exported variables into the parent module
      const topVars = evalContext.mainThread!.blocks![0].vars!;
      const topConst = evalContext.mainThread!.blocks![0].constVars!;
      for (const key of Object.keys(statement.imports)) {
        if (key in topVars) {
          throw new Error(`Import ${key} already exists`);
        }
        topVars[key] = statement.module!.exports.get(statement.imports[key]);
        topConst.add(key);
      }
      break;

    case "FuncD":
      // --- Function declarations are already hoisted, nothing to do
      break;

    case "EmptyS":
      // --- Nothing to do
      break;

    case "BlockS":
      // --- No statement, nothing to process
      if (statement.statements.length === 0) break;

      // --- Create a new block scope
      thread.blocks ??= [];
      thread.blocks.push({ vars: {} });

      // --- Hoist function declarations to the innermost block scope
      hoistFunctionDeclarations(thread, statement.statements);

      // --- Prepare an empty statement that will only remove the block scope when the entire block is processed
      const closing = {
        type: "EmptyS",
        removeBlockScope: true,
      } as EmptyStatement; // --- We need the cast as we do not provide required props

      // --- Queue the block scope's body
      toUnshift = mapStatementsToQueueItems([...statement.statements, closing]);
      break;

    case "ExprS":
      // --- Just evaluate it
      const statementValue = await evalBindingAsync(statement.expression, evalContext, thread, onStatementCompleted);
      if (thread.blocks && thread.blocks.length !== 0) {
        thread.blocks[thread.blocks.length - 1].returnValue = statementValue;
      }
      break;

    case "ArrowS":
      // --- Compile the arrow expression
      const arrowFuncValue = await executeArrowExpression(
        statement.expression,
        evalContext,
        onStatementCompleted,
        thread,
        ...(evalContext.eventArgs ?? [])
      );
      if (thread.blocks && thread.blocks.length !== 0) {
        thread.blocks[thread.blocks.length - 1].returnValue = arrowFuncValue;
      }
      break;

    case "LetS": {
      // --- Create a new variable in the innermost scope
      const block = innermostBlockScope(thread);
      if (!block) {
        throw new Error("Missing block scope");
      }
      await processDeclarationsAsync(block, evalContext, thread, onStatementCompleted, statement.declarations);
      break;
    }

    case "ConstS": {
      // --- Create a new variable in the innermost scope
      const block = innermostBlockScope(thread);
      if (!block) {
        throw new Error("Missing block scope");
      }
      await processDeclarationsAsync(block, evalContext, thread, onStatementCompleted, statement.declarations, true);
      break;
    }

    case "IfS":
      // --- Evaluate the condition
      const condition = !!(await evalBindingAsync(statement.condition, evalContext, thread, onStatementCompleted));
      if (condition) {
        toUnshift = mapToItem(statement.thenBranch);
      } else if (statement.elseBranch) {
        toUnshift = mapToItem(statement.elseBranch);
      }
      break;

    case "RetS": {
      // --- Check if return is valid here
      let blockScope = innermostBlockScope(thread);
      if (blockScope === undefined) {
        throw new Error("Return requires a block scope");
      }

      // --- Store the return value
      thread.returnValue = statement.expression
        ? await evalBindingAsync(statement.expression, evalContext, thread, onStatementCompleted)
        : undefined;

      // --- Check for try blocks
      if ((thread.tryBlocks ?? []).length > 0) {
        // --- Mark the loop's try scope to exit with "return"
        const returnTryScope = thread.tryBlocks![0];
        returnTryScope.exitType = "return";

        // --- Remove the try/catch/finally block's scope
        if (returnTryScope.processingPhase !== "postFinally") {
          thread.blocks!.pop();
        }

        // --- Clear the last part of the try/catch/finally block
        const tryScope = innermostTryScope(thread);
        clearToLabel = tryScope.tryLabel;
      } else {
        // --- Delete the remaining part of the queue
        clearToLabel = -1;
      }
      break;
    }

    case "WhileS": {
      // --- Create or get the loop's scope (guard is falsy for the first execution)
      let loopScope = statement.guard ? innermostLoopScope(thread) : createLoopScope(thread);

      // --- Evaluate the loop condition
      const condition = !!(await evalBindingAsync(statement.condition, evalContext, thread, onStatementCompleted));
      if (condition) {
        toUnshift = provideLoopBody(loopScope!, statement, thread.breakLabelValue);
      } else {
        // --- When the condition is not met, we're done.
        releaseLoopScope(thread);
      }
      break;
    }

    case "DoWS": {
      if (!statement.guard) {
        // --- First loop execution (do-while is a post-test loop)
        toUnshift = provideLoopBody(createLoopScope(thread), statement, thread.breakLabelValue);
        break;
      }

      // --- Evaluate the loop condition
      const condition = !!(await evalBindingAsync(statement.condition, evalContext, thread, onStatementCompleted));
      if (condition) {
        toUnshift = provideLoopBody(innermostLoopScope(thread), statement, thread.breakLabelValue);
      } else {
        // --- When the condition is not met, we're done.
        releaseLoopScope(thread);
      }
      break;
    }

    case "ContS": {
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

      if (loopScope.tryBlockDepth >= 0 && loopScope.tryBlockDepth < (thread.tryBlocks ?? []).length) {
        // --- Mark the loop's try scope to exit with "continue"
        for (let i = loopScope.tryBlockDepth; i < thread.tryBlocks!.length; i++) {
          thread.tryBlocks![loopScope.tryBlockDepth]!.exitType = "continue";
        }

        // --- Clear the last part of the try/catch/finally block
        const tryScope = innermostTryScope(thread);
        clearToLabel = tryScope.tryLabel;
      } else {
        clearToLabel = loopScope.continueLabel;
        releaseLoopScope(thread, false);
      }
      break;
    }

    case "BrkS": {
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
      if (loopScope.tryBlockDepth >= 0 && loopScope.tryBlockDepth < (thread.tryBlocks ?? []).length) {
        // --- Mark the loop's try scope to exit with "break"
        for (let i = loopScope.tryBlockDepth; i < thread.tryBlocks!.length; i++) {
          thread.tryBlocks![loopScope.tryBlockDepth]!.exitType = "break";
        }

        // --- Clear the last part of the try/catch/finally block
        const tryScope = innermostTryScope(thread);
        clearToLabel = tryScope.tryLabel;
      } else {
        clearToLabel = loopScope.breakLabel;
        releaseLoopScope(thread);
      }
      break;
    }

    case "ForS":
      if (!statement.guard) {
        // --- Init the loop with a new scope
        createLoopScope(thread, 1);

        // --- Create a new block for the loop variables
        thread.blocks ??= [];
        thread.blocks.push({
          vars: {},
        });

        const guardStatement = { ...statement, guard: true };
        if (statement.init) {
          // --- Unshift the initialization part and the guarded for-loop
          toUnshift = mapStatementsToQueueItems([statement.init, guardStatement]);
        } else {
          // --- No init, unshift only the guard statement
          toUnshift = mapStatementsToQueueItems([guardStatement]);
        }
      } else {
        // --- Initialization already done. Evaluate the condition
        if (
          !statement.condition ||
          !!(await evalBindingAsync(statement.condition, evalContext, thread, onStatementCompleted))
        ) {
          // --- Stay in the loop, inject the body, the update expression, and the loop guard
          const loopScope = innermostLoopScope(thread);

          if (statement.update) {
            const updateStmt = {
              type: "ExprS",
              expression: statement.update,
            } as ExpressionStatement;
            toUnshift = mapStatementsToQueueItems([statement.body, updateStmt, { ...statement }]);
          } else {
            toUnshift = mapStatementsToQueueItems([statement.body, { ...statement }]);
          }
          // --- The next queue label is for "break"
          loopScope.breakLabel = thread.breakLabelValue ?? -1;

          // --- The guard action's label is for "continue"
          loopScope.continueLabel = toUnshift[1].label;
        } else {
          // --- The condition is not met, we're done. Remove the loop's scope from the evaluation context
          releaseLoopScope(thread);
        }
      }
      break;

    case "ForInS":
      if (!statement.guard) {
        // --- Get the object keys
        const keyedObject = await evalBindingAsync(statement.expression, evalContext, thread);
        if (keyedObject == undefined) {
          // --- Nothing to do, no object to traverse
          break;
        }

        // --- Init the loop with a new scope
        createLoopScope(thread, 1);

        // --- Create a new block for the loop variables
        thread.blocks ??= [];
        thread.blocks.push({ vars: {} });

        statement.keys = Object.keys(keyedObject);
        statement.keyIndex = 0;
        toUnshift = mapStatementsToQueueItems([{ ...statement, guard: true }]);
      } else {
        // --- Just for the sake of extra safety
        if (statement.keyIndex === undefined || statement.keys === undefined) {
          throw new Error("Keys information expected in for..in loop");
        }

        // --- Any key left?
        if (statement.keyIndex < statement.keys.length) {
          // --- Set the binding variable to the next key
          const propValue = statement.keys[statement.keyIndex++];
          switch (statement.varBinding) {
            case "none": {
              const assigmentExpr: AssignmentExpression = {
                type: "AsgnE",
                leftValue: {
                  type: "IdE",
                  name: statement.id,
                } as Identifier,
                operator: "=",
                operand: {
                  type: "LitE",
                  value: propValue,
                } as Literal,
              } as AssignmentExpression;
              await evalBindingAsync(assigmentExpr, evalContext, thread);
              break;
            }

            case "const":
            case "let":
              {
                // --- Create a new variable in the innermost scope
                const block = innermostBlockScope(thread);
                if (!block) {
                  throw new Error("Missing block scope");
                }
                block.vars[statement.id] = propValue;
                if (statement.varBinding === "const") {
                  block.constVars ??= new Set<string>();
                  block.constVars.add(statement.id);
                }
              }
              break;
          }

          // --- Inject the loop body
          const loopScope = innermostLoopScope(thread);
          toUnshift = mapStatementsToQueueItems([statement.body, { ...statement }]);

          // --- The next queue label is for "break"
          loopScope.breakLabel = thread.breakLabelValue ?? -1;

          // --- The guard action's label is for "continue"
          loopScope.continueLabel = toUnshift[1].label;
        } else {
          // --- The condition is not met, we're done. Remove the loop's scope from the evaluation context
          releaseLoopScope(thread);
        }
      }
      break;

    case "ForOfS":
      if (!statement.guard) {
        // --- Get the object keys
        const iteratorObject = await evalBindingAsync(statement.expression, evalContext, thread);
        if (iteratorObject == null || typeof iteratorObject[Symbol.iterator] !== "function") {
          // --- The object is not an iterator
          throw new Error("Object in for..of is not iterable");
        }

        // --- Init the loop with a new scope
        createLoopScope(thread, 1);

        // --- Create a new block for the loop variables
        thread.blocks ??= [];
        thread.blocks.push({ vars: {} });

        statement.iterator = iteratorObject[Symbol.iterator]();
        toUnshift = mapStatementsToQueueItems([{ ...statement, guard: true }]);
      } else {
        // --- Just for the sake of extra safety
        if (statement.iterator === undefined) {
          throw new Error("Iterator expected in for..of loop");
        }

        // --- Any iteration left?
        const nextIteration = statement.iterator.next();
        if (nextIteration.done) {
          // --- The for..of loop is complete. Remove the loop's scope from the evaluation context
          releaseLoopScope(thread);
          break;
        }

        // --- Set the binding variable to the next key
        const propValue = nextIteration.value;
        switch (statement.varBinding) {
          case "none": {
            const assigmentExpr: AssignmentExpression = {
              type: "AsgnE",
              leftValue: {
                type: "IdE",
                name: statement.id,
              } as Identifier,
              operator: "=",
              operand: {
                type: "LitE",
                value: propValue,
              } as Literal,
            } as AssignmentExpression;
            await evalBindingAsync(assigmentExpr, evalContext, thread);
            break;
          }

          case "const":
          case "let":
            {
              // --- Create a new variable in the innermost scope
              const block = innermostBlockScope(thread);
              if (!block) {
                throw new Error("Missing block scope");
              }
              block.vars[statement.id] = propValue;
              if (statement.varBinding === "const") {
                block.constVars ??= new Set<string>();
                block.constVars.add(statement.id);
              }
            }
            break;
        }

        // --- Inject the loop body
        const loopScope = innermostLoopScope(thread);
        toUnshift = mapStatementsToQueueItems([statement.body, { ...statement }]);

        // --- The next queue label is for "break"
        loopScope.breakLabel = thread.breakLabelValue ?? -1;

        // --- The guard action's label is for "continue"
        loopScope.continueLabel = toUnshift[1].label;
      }
      break;

    case "ThrowS": {
      throw new ThrowStatementError(
        await evalBindingAsync(statement.expression, evalContext, thread, onStatementCompleted)
      );
    }

    case "TryS": {
      if (!statement.guard) {
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
              if (statement.catchBlock) {
                if (tryScope.statement.catchVariable) {
                  const block = innermostBlockScope(thread)!;
                  block.vars[tryScope.statement.catchVariable] =
                    tryScope.errorToThrow instanceof ThrowStatementError
                      ? tryScope.errorToThrow.errorObject
                      : tryScope.errorToThrow;
                }
                delete tryScope.errorToThrow;
                tryScope.processingPhase = "catch";
                toUnshift = provideCatchBody(thread, tryScope);
              } else if (tryScope.statement.finallyBlock) {
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
          if (statement.finallyBlock) {
            toUnshift = provideFinallyBody(thread, tryScope);
          }
          break;
        case "catch":
          // --- We completed the catch block successfully, remove the handled error
          tryScope.processingPhase = "finally";
          if (statement.finallyBlock) {
            toUnshift = provideFinallyBody(thread, tryScope);
          }
          break;
        case "finally":
          tryScope.processingPhase = "postFinally";
          toUnshift = provideFinallyErrorBody(tryScope);
          break;

        case "postFinally":
          // --- We completed the finally block successfully
          const innermostTry = thread.tryBlocks!.pop()!;

          // --- Is there any special exit type?
          switch (innermostTry.exitType) {
            case "break": {
              const loopScope = innermostLoopScope(thread);
              if (loopScope === undefined) {
                throw new Error("Missing loop scope");
              }
              releaseLoopScope(thread);
              clearToLabel = loopScope.breakLabel;
              break;
            }
            case "continue": {
              const loopScope = innermostLoopScope(thread);
              if (loopScope === undefined) {
                throw new Error("Missing loop scope");
              }

              clearToLabel = loopScope.continueLabel;
              releaseLoopScope(thread, false);
              break;
            }
            case "return":
              clearToLabel = -1;
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

    case "SwitchS": {
      // --- Create or get the loop's scope (guard is falsy for the first execution)
      if (statement.guard) {
        // --- Complete the switch
        releaseLoopScope(thread);
      } else {
        let loopScope = createLoopScope(thread);
        loopScope.isSwitch = true;
        thread.blocks!.push({ vars: {} });

        // --- Evaluate the switch value
        const switchValue = await evalBindingAsync(statement.expression, evalContext, thread);

        // --- Find the matching label
        let matchingIndex = -1;
        for (let i = 0; i < statement.cases.length; i++) {
          const currentCase = statement.cases[i];

          // --- Check for default case
          if (currentCase.caseExpression === undefined) {
            matchingIndex = i;
            break;
          }

          // --- Check for matching case
          const caseValue = await evalBindingAsync(currentCase.caseExpression, evalContext, thread);
          if (caseValue === switchValue) {
            matchingIndex = i;
            break;
          }
        }

        // --- Merge all statements from the matching label
        const statementFlow: Statement[] = [];
        if (matchingIndex >= 0) {
          for (let i = matchingIndex; i < statement.cases.length; i++) {
            statementFlow.push(...statement.cases[i].statements!);
          }
        }

        // --- Queue the statement flow and the guard
        const guardStatement = { ...statement, guard: true };
        toUnshift = mapStatementsToQueueItems([...statementFlow, guardStatement]);
        loopScope.breakLabel = toUnshift[toUnshift.length - 1].label;
      }
      break;
    }
  }

  // --- The statement may remove the innermost scope
  if (statement.removeBlockScope) {
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

/**
 * Visits all declarations in a let or const statement
 * @param declaration Declaration to process
 * @param visitor Function to call on each visited declaration
 */
export function visitLetConstDeclarations(
  declaration: LetStatement | ConstStatement,
  visitor: IdDeclarationVisitor
): void {
  for (let i = 0; i < declaration.declarations.length; i++) {
    let value: any;
    const decl = declaration.declarations[i];
    visitDeclaration(decl, visitor);
  }

  function visitDeclaration(varDecl: VarDeclaration, visitor: IdDeclarationVisitor): void {
    // --- Process each declaration
    if (varDecl.id) {
      visitor(varDecl.id);
    } else if (varDecl.arrayDestruct) {
      visitArrayDestruct(varDecl.arrayDestruct, visitor);
    } else if (varDecl.objectDestruct) {
      visitObjectDestruct(varDecl.objectDestruct, visitor);
    } else {
      throw new Error("Unknown declaration specifier");
    }
  }

  // --- Visits an array destructure declaration
  function visitArrayDestruct(arrayD: ArrayDestructure[], visitor: IdDeclarationVisitor): void {
    for (let i = 0; i < arrayD.length; i++) {
      const arrDecl = arrayD[i];
      if (arrDecl.id) {
        visitor(arrDecl.id);
      } else if (arrDecl.arrayDestruct) {
        visitArrayDestruct(arrDecl.arrayDestruct, visitor);
      } else if (arrDecl.objectDestruct) {
        visitObjectDestruct(arrDecl.objectDestruct, visitor);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(objectD: ObjectDestructure[], visitor: IdDeclarationVisitor): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      if (objDecl.arrayDestruct) {
        visitArrayDestruct(objDecl.arrayDestruct, visitor);
      } else if (objDecl.objectDestruct) {
        visitObjectDestruct(objDecl.objectDestruct, visitor);
      } else {
        visitor(objDecl.alias ?? objDecl.id!);
      }
    }
  }
}

// --- Process a variable declaration
export async function processDeclarationsAsync(
  block: BlockScope,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
  declarations: VarDeclaration[],
  addConst = false,
  useValue = false,
  baseValue = undefined
): Promise<void> {
  for (let i = 0; i < declarations.length; i++) {
    let value: any;
    const decl = declarations[i];
    if (useValue) {
      value = baseValue;
    } else if (decl.expression) {
      value = await evalBindingAsync(decl.expression, evalContext, thread, onStatementCompleted);
    }
    visitDeclaration(block, decl, value, addConst);
  }

  // --- Visit a variable
  function visitDeclaration(block: BlockScope, decl: VarDeclaration, baseValue: any, addConst: boolean): void {
    // --- Process each declaration
    if (decl.id) {
      visitIdDeclaration(block, decl.id, baseValue, addConst);
    } else if (decl.arrayDestruct) {
      visitArrayDestruct(block, decl.arrayDestruct, baseValue, addConst);
    } else if (decl.objectDestruct) {
      visitObjectDestruct(block, decl.objectDestruct, baseValue, addConst);
    } else {
      throw new Error("Unknown declaration specifier");
    }
  }

  // --- Visits a single ID declaration
  function visitIdDeclaration(block: BlockScope, id: string, baseValue: any, addConst: boolean): void {
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
  function visitArrayDestruct(block: BlockScope, arrayD: ArrayDestructure[], baseValue: any, addConst: boolean): void {
    for (let i = 0; i < arrayD.length; i++) {
      const arrDecl = arrayD[i];
      const value = baseValue?.[i];
      if (arrDecl.id) {
        visitIdDeclaration(block, arrDecl.id, value, addConst);
      } else if (arrDecl.arrayDestruct) {
        visitArrayDestruct(block, arrDecl.arrayDestruct, value, addConst);
      } else if (arrDecl.objectDestruct) {
        visitObjectDestruct(block, arrDecl.objectDestruct, value, addConst);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(
    block: BlockScope,
    objectD: ObjectDestructure[],
    baseValue: any,
    addConst: boolean
  ): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      const value = baseValue?.[objDecl.id!];
      if (objDecl.arrayDestruct) {
        visitArrayDestruct(block, objDecl.arrayDestruct, value, addConst);
      } else if (objDecl.objectDestruct) {
        visitObjectDestruct(block, objDecl.objectDestruct, value, addConst);
      } else {
        visitIdDeclaration(block, objDecl.alias ?? objDecl.id!, value, addConst);
      }
    }
  }
}
