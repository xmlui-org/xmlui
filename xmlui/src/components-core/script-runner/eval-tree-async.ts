import { isPlainObject } from "lodash-es";

import type {
  ArrayLiteral,
  ArrowExpression,
  AssignmentExpression,
  BinaryExpression,
  CalculatedMemberAccessExpression,
  ConditionalExpression,
  Expression,
  FunctionInvocationExpression,
  Identifier,
  MemberAccessExpression,
  ObjectLiteral,
  PostfixOpExpression,
  PrefixOpExpression,
  ReturnStatement,
  SequenceExpression,
  Statement,
  TemplateLiteralExpression,
  UnaryExpression,
  VarDeclaration,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { ICustomOperations } from "./ICustomOperations";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";

import {
  OnStatementCompletedCallback,
  processDeclarationsAsync,
  processStatementQueueAsync,
} from "./process-statement-async";
import {
  evalArrow,
  evalAssignmentCore,
  evalBinaryCore,
  evalCalculatedMemberAccessCore,
  evalIdentifier,
  evalLiteral,
  evalMemberAccessCore,
  evalPreOrPostCore,
  evalTemplateLiteralCore,
  evalUnaryCore,
  isPromise,
} from "./eval-tree-common";
import { ensureMainThread } from "./process-statement-common";
import { getAsyncProxy } from "./asyncProxy";
import { isBannedFunction } from "./bannedFunctions";

type EvaluatorAsyncFunction = (
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
) => Promise<any>;

/**
 * Evaluates a binding represented by the specified expression
 * @param expr Expression to evaluate
 * @param evalContext Evaluation context to use
 * @param thread The logical thread to use for evaluation
 * @param onStatementCompleted Execute this function when a statement is completed
 */
export async function evalBindingAsync(
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread | undefined,
  onStatementCompleted?: OnStatementCompletedCallback,
): Promise<any> {
  const thisStack: any[] = [];
  ensureMainThread(evalContext);
  thread ??= evalContext.mainThread;
  return await evalBindingExpressionTreeAsync(
    thisStack,
    expr,
    evalContext,
    thread ?? evalContext.mainThread!,
    onStatementCompleted,
  );
}

/**
 * Executes the specified arrow function
 * @param expr Arrow function expression to run
 * @param evalContext Evaluation context to use
 * @param onStatementCompleted Execute this function when a statement is completed
 * @param thread The logical thread to use for evaluation
 * @param args Arguments of the arrow function to execute
 */
export async function executeArrowExpression(
  expr: ArrowExpression,
  evalContext: BindingTreeEvaluationContext,
  onStatementCompleted: OnStatementCompletedCallback,
  thread?: LogicalThread,
  ...args: any[]
): Promise<any> {
  // --- Just an extra safety check
  if (expr.type !== "ArrowE") {
    throw new Error("executeArrowExpression expects an 'ArrowExpression' object.");
  }

  // --- This is the evaluator that an arrow expression uses internally
  const evaluator: EvaluatorAsyncFunction = evalBindingExpressionTreeAsync;

  // --- Compiles the Arrow function to a JavaScript function
  const nativeFunction = await createArrowFunctionAsync(evaluator, expr);

  // --- Run the compiled arrow function. Note, we have two prefix arguments:
  // --- #1: The names of arrow function arguments
  // --- #2: The evaluation context the arrow function runs in
  // --- #others: The real arguments of the arrow function
  return await nativeFunction(
    expr.args,
    evalContext,
    thread ?? evalContext.mainThread,
    onStatementCompleted,
    ...args,
  );
}

/**
 * Evaluates the specified binding expression tree and retrieves the evaluated value
 * @param expr Binding tree expression
 * @param thisStack Stack of "this" object to use with function calls
 * @param evalContext Evaluation context
 * @param thread The logical thread to use for evaluation
 * @param onStatementCompleted Execute this function when a statement is completed
 * This code uses the JavaScript semantics and errors when evaluating the code.
 * We use `thisStack` to keep track of the partial results of the evaluation tree so that we can set
 * the real `this` context when invoking a function.
 */
async function evalBindingExpressionTreeAsync(
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  if (!evalContext.options) {
    evalContext.options = { defaultToOptionalMemberAccess: true };
  }

  // --- Prepare evaluation
  let customOp: ICustomOperations | null = null;
  const evaluator: EvaluatorAsyncFunction = evalBindingExpressionTreeAsync;

  // --- Reset the expression scope
  expr.valueScope = expr.valueIndex = undefined;

  // --- Process the expression according to its type

  try {
    switch (expr.type) {
      case "TempLitE":
        return evalTemplateLiteralAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );
      case "LitE":
        return evalLiteral(thisStack, expr);

      case "IdE":
        return evalIdentifier(thisStack, expr, evalContext, thread);

      case "MembE":
        return await evalMemberAccessAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "CMembE":
        return await evalCalculatedMemberAccessAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "SeqE":
        return await evalSequenceAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "ALitE":
        return await evalArrayLiteralAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "OLitE":
        return await evalObjectLiteralAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "UnaryE":
        return await evalUnaryAsync(
          evaluator,
          thisStack,
          customOp,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "BinaryE":
        return await evalBinaryAsync(
          evaluator,
          thisStack,
          customOp,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "CondE":
        return await evalConditionalAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "AsgnE":
        return await evalAssignmentAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "PrefE":
      case "PostfE":
        return await evalPreOrPostAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "InvokeE":
        // --- Special async handling
        return await evalFunctionInvocationAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
          onStatementCompleted,
        );

      case "ArrowE":
        return evalArrow(thisStack, expr, thread);

      case "SpreadE":
        throw new Error("Cannot use spread expression (...) with the current intermediate value.");

      default:
        throw new Error(`Unknown expression tree node: ${(expr as any).type}`);
    }
  } catch (e) {
    //TODO decorate error with expression details (startColumn, startLine, startPosition, etc.)
    throw e;
  }
}

async function evalMemberAccessAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: MemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const parentObj = await evaluator(
    thisStack,
    expr.object,
    evalContext,
    thread,
    onStatementCompleted,
  );
  return evalMemberAccessCore(parentObj, thisStack, expr, evalContext);
}

async function evalCalculatedMemberAccessAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: CalculatedMemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const parentObj = await evaluator(
    thisStack,
    expr.object,
    evalContext,
    thread,
    onStatementCompleted,
  );

  // --- At this point we definitely keep the parent object on `thisStack`, as it will be the context object
  // --- of a FunctionInvocationExpression, if that follows the MemberAccess. Other operations would call
  // --- `thisStack.pop()` to remove the result from the previous `evalBindingExpressionTree` call.
  const memberObj = await evaluator(
    thisStack,
    expr.member,
    evalContext,
    thread,
    onStatementCompleted,
  );
  thisStack.pop();
  return evalCalculatedMemberAccessCore(parentObj, memberObj, thisStack, expr, evalContext);
}

async function evalSequenceAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: SequenceExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  if (!expr.expressions || expr.expressions.length === 0) {
    throw new Error(`Missing expression sequence`);
  }
  const result = expr.expressions.map(async (e) => {
    const exprValue = await evaluator(thisStack, e, evalContext, thread, onStatementCompleted);
    thisStack.pop();
    return exprValue;
  });
  const lastObj = result[result.length - 1];
  thisStack.push(lastObj);
  return lastObj;
}

async function evalArrayLiteralAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: ArrayLiteral,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const arrayValue: any[] = [];
  for (const item of expr.items) {
    if (item.type === "SpreadE") {
      const spreadArray = await evaluator(
        thisStack,
        item.operand,
        evalContext,
        thread,
        onStatementCompleted,
      );
      thisStack.pop();
      if (!Array.isArray(spreadArray)) {
        throw new Error("Spread operator within an array literal expects an array operand.");
      }
      arrayValue.push(...spreadArray);
    } else {
      arrayValue.push(await evaluator(thisStack, item, evalContext, thread, onStatementCompleted));
      thisStack.pop();
      thisStack.push(arrayValue);
    }
  }
  return arrayValue;
}

async function evalObjectLiteralAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: ObjectLiteral,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const objectHash: any = {};
  for (const prop of expr.props) {
    if (!Array.isArray(prop)) {
      // --- We're using a spread expression
      const spreadItems = await evaluator(
        thisStack,
        prop.operand,
        evalContext,
        thread,
        onStatementCompleted,
      );
      thisStack.pop();
      if (Array.isArray(spreadItems)) {
        // --- Spread of an array
        for (let i = 0; i < spreadItems.length; i++) {
          objectHash[i] = spreadItems[i];
        }
      } else if (typeof spreadItems === "object") {
        // --- Spread of a hash object
        for (const [key, value] of Object.entries(spreadItems)) {
          objectHash[key] = value;
        }
      }
      continue;
    }

    // --- We're using key/[value] pairs
    let key: any;
    switch (prop[0].type) {
      case "LitE":
        key = prop[0].value;
        break;
      case "IdE":
        key = prop[0].name;
        break;
      default:
        key = await evaluator(thisStack, prop[0], evalContext, thread, onStatementCompleted);
        thisStack.pop();
        break;
    }
    objectHash[key] = await evaluator(
      thisStack,
      prop[1],
      evalContext,
      thread,
      onStatementCompleted,
    );
    thisStack.pop();
  }
  thisStack.push(objectHash);
  return objectHash;
}

async function evalUnaryAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  customOp: ICustomOperations | null,
  expr: UnaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const operand = await evaluator(
    thisStack,
    expr.operand,
    evalContext,
    thread,
    onStatementCompleted,
  );
  thisStack.pop();
  return evalUnaryCore(expr, operand, thisStack, customOp);
}

async function evalBinaryAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  customOp: ICustomOperations | null,
  expr: BinaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const l = await evaluator(thisStack, expr.left, evalContext, thread, onStatementCompleted);
  thisStack.pop();
  if (expr.operator === "&&" && !l) {
    thisStack.push(l);
    return l;
  }
  if (expr.operator === "||" && l) {
    thisStack.push(l);
    return l;
  }
  const r = await evaluator(thisStack, expr.right, evalContext, thread, onStatementCompleted);
  thisStack.pop();
  return evalBinaryCore(l, r, thisStack, customOp, expr.operator);
}

async function evalConditionalAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: ConditionalExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const condition = await evaluator(
    thisStack,
    expr.condition,
    evalContext,
    thread,
    onStatementCompleted,
  );
  thisStack.pop();
  return await evaluator(
    thisStack,
    condition ? expr.consequent : expr.alternate,
    evalContext,
    thread,
    onStatementCompleted,
  );
}

async function runAssignment(
  evalContext: BindingTreeEvaluationContext,
  doAssignment: () => Promise<any>,
) {
  const updateHook = evalContext.onUpdateHook || (async (updateFn) => await updateFn());

  return await updateHook(async () => {
    return await doAssignment();
  });
}

async function evalAssignmentAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: AssignmentExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  return runAssignment(evalContext, async () => {
    const leftValue = expr.leftValue;
    await evaluator(thisStack, leftValue, evalContext, thread, onStatementCompleted);
    thisStack.pop();
    const newValue = await evaluator(
      thisStack,
      expr.operand,
      evalContext,
      thread,
      onStatementCompleted,
    );
    thisStack.pop();
    return evalAssignmentCore(leftValue, newValue, thisStack, expr, thread);
  });
}

async function evalPreOrPostAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  return runAssignment(evalContext, async () => {
    const operand = expr.operand;
    await evaluator(thisStack, operand, evalContext, thread, onStatementCompleted);
    thisStack.pop();
    return evalPreOrPostCore(operand, thisStack, expr, evalContext, thread);
  });
}

async function evalFunctionInvocationAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: FunctionInvocationExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  let functionObj: any;
  let implicitContextObject: any = null;
  let hostObject: any;

  // --- Check for contexted object
  if (expr.object.type === "MembE") {
    hostObject = await evaluator(
      thisStack,
      expr.object.object,
      evalContext,
      thread,
      onStatementCompleted,
    );
    functionObj = evalMemberAccessCore(hostObject, thisStack, expr.object, evalContext);
    if (expr.object.object.type === "IdE" && hostObject?._SUPPORT_IMPLICIT_CONTEXT) {
      implicitContextObject = hostObject;
    }
  } else {
    // --- Get the object on which to invoke the function
    functionObj = await evaluator(
      thisStack,
      expr.object,
      evalContext,
      thread,
      onStatementCompleted,
    );
  }
  thisStack.pop();

  // --- Keep function arguments here, we pass it to the function later
  const functionArgs: any[] = [];

  // --- The functionObj may be an ArrowExpression. In this care we need to create the invokable arrow function
  if (functionObj?._ARROW_EXPR_) {
    functionArgs.push(
      functionObj.args,
      evalContext,
      thread,
      onStatementCompleted,
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true })),
    );
    functionObj = await createArrowFunctionAsync(evaluator, functionObj as ArrowExpression);
  } else if (expr.object.type === "ArrowE") {
    // --- We delay evaluating expression values. We pass the argument names as the first parameter, and then
    // --- all parameter expressions
    functionArgs.push(
      expr.object.args.map((a) => (a as Identifier).name),
      evalContext,
      thread,
      onStatementCompleted,
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true })),
    );
  } else {
    // --- We evaluate the argument values to pass to a JavaScript function
    for (let i = 0; i < expr.arguments.length; i++) {
      const arg = expr.arguments[i];
      if (arg.type === "SpreadE") {
        const funcArg = await evaluator([], arg.operand, evalContext, thread, onStatementCompleted);
        if (!Array.isArray(funcArg)) {
          throw new Error("Spread operator within a function invocation expects an array operand.");
        }
        functionArgs.push(...funcArg);
      } else {
        if (arg.type === "ArrowE") {
          const funcArg = await createArrowFunctionAsync(evaluator, arg);
          const wrappedFunc = async (...args: any[]) => {
            return funcArg(arg.args, evalContext, thread, onStatementCompleted, ...args);
          };
          functionArgs.push(wrappedFunc);
        } else {
          const funcArg = await evaluator([], arg, evalContext, thread, onStatementCompleted);
          if (funcArg?._ARROW_EXPR_) {
            const wrappedFuncArg = await createArrowFunctionAsync(evaluator, funcArg);
            const wrappedFunc = (...args: any[]) =>
              wrappedFuncArg(funcArg.args, evalContext, thread, onStatementCompleted, ...args);
            functionArgs.push(wrappedFunc);
          } else {
            functionArgs.push(funcArg);
          }
        }
      }
    }

    // --- We can pass implicit arguments to JavaScript function
    if (implicitContextObject) {
      // --- Let's obtain the implicit context
      if (evalContext.implicitContextGetter) {
        const implicitContext = evalContext.implicitContextGetter(implicitContextObject);
        functionArgs.unshift(implicitContext);
      } else {
        throw new Error("Cannot use implicitContextGetter, it is undefined");
      }
    }
  }

  // --- Check if the function is banned from running
  const bannedInfo = isBannedFunction(functionObj);
  if (bannedInfo.banned) {
    throw new Error(
      `Function ${bannedInfo.func?.name ?? "unknown"} is not allowed to call. ${bannedInfo?.help ?? ""}`,
    );
  }

  // --- We use context for "this"
  const currentContext = thisStack.length > 0 ? thisStack.pop() : evalContext.localContext;

  // --- We need to use proxies for JavaScript functions (such as Array.prototype.filter) not supporting
  // --- async arguments
  functionObj = getAsyncProxy(functionObj, functionArgs, currentContext);

  // --- Now, invoke the function
  try {
    const value = evalContext.options?.defaultToOptionalMemberAccess
      ? (functionObj as Function)?.call(currentContext, ...functionArgs)
      : (functionObj as Function).call(currentContext, ...functionArgs);

    let returnValue = await completePromise(value);
    thisStack.push(returnValue);
    return returnValue;
  } catch (err) {
    console.log(typeof functionObj, functionObj);
    throw err;
  }
}

async function createArrowFunctionAsync(
  evaluator: EvaluatorAsyncFunction,
  expr: ArrowExpression,
): Promise<Function> {
  // --- Use this function, it evaluates the arrow function
  return async (...args: any[]) => {
    // --- Prepare the variables to pass
    const runTimeEvalContext = args[1] as BindingTreeEvaluationContext;
    const runtimeThread = args[2] as LogicalThread;
    const runTimeOnStatementCompleted = args[3] as OnStatementCompletedCallback;

    // --- Create the thread that runs the arrow function
    const workingThread: LogicalThread = {
      parent: runtimeThread,
      childThreads: [],
      blocks: [{ vars: {} }],
      loops: [],
      breakLabelValue: -1,
      closures: expr.closureContext,
    };
    runtimeThread.childThreads.push(workingThread);

    // --- Assign argument values to names
    const arrowBlock: BlockScope = { vars: {} };
    workingThread.blocks ??= [];
    workingThread.blocks.push(arrowBlock);
    const argSpecs = args[0] as Expression[];
    let restFound = false;
    for (let i = 0; i < argSpecs.length; i++) {
      // --- Turn argument specification into processable variable declarations
      const argSpec = argSpecs[i];
      let decl: VarDeclaration | undefined;
      switch (argSpec.type) {
        case "IdE": {
          decl = {
            type: "VarD",
            id: argSpec.name,
          } as VarDeclaration;
          break;
        }
        case "Destr": {
          decl = {
            type: "VarD",
            id: argSpec.id,
            arrayDestruct: argSpec.arrayDestruct,
            objectDestruct: argSpec.objectDestruct,
          } as VarDeclaration;
          break;
        }
        case "SpreadE": {
          restFound = true;
          decl = {
            type: "VarD",
            id: (argSpec.operand as unknown as Identifier).name,
          } as VarDeclaration;
          break;
        }
        default:
          throw new Error("Unexpected arrow argument specification");
      }
      if (decl) {
        if (restFound) {
          // --- Get the rest of the arguments
          const restArgs = args.slice(i + 4);
          let argVals: any[] = [];
          for (const arg of restArgs) {
            if (arg?._EXPRESSION_) {
              argVals.push(
                await evaluator(
                  [],
                  arg,
                  runTimeEvalContext,
                  runtimeThread,
                  runTimeOnStatementCompleted,
                ),
              );
            } else {
              argVals.push(arg);
            }
          }
          await processDeclarationsAsync(
            arrowBlock,
            runTimeEvalContext,
            runtimeThread,
            runTimeOnStatementCompleted,
            [decl],
            false,
            true,
            argVals,
          );
        } else {
          // --- Get the actual value to work with
          let argVal = args[i + 4];
          if (argVal?._EXPRESSION_) {
            argVal = await evaluator(
              [],
              argVal,
              runTimeEvalContext,
              runtimeThread,
              runTimeOnStatementCompleted,
            );
          }
          await processDeclarationsAsync(
            arrowBlock,
            runTimeEvalContext,
            runtimeThread,
            runTimeOnStatementCompleted,
            [decl],
            false,
            true,
            argVal,
          );
        }
      }
    }

    // --- Evaluate the arrow expression body
    let returnValue: any;
    let statements: Statement[];

    switch (expr.statement.type) {
      case "EmptyS":
        statements = [];
        break;
      case "ExprS":
        // --- Create a new thread for the call
        statements = [
          {
            type: "RetS",
            expression: expr.statement.expression,
          } as ReturnStatement,
        ];
        break;
      case "BlockS":
        // --- Create a new thread for the call
        statements = expr.statement.statements;
        break;
      default:
        throw new Error(
          `Arrow expression with a body of '${expr.statement.type}' is not supported yet.`,
        );
    }

    // --- Process the statement with a new processor
    await processStatementQueueAsync(
      statements,
      runTimeEvalContext,
      workingThread,
      runTimeOnStatementCompleted,
    );

    // --- Return value is in a return value slot
    returnValue = workingThread.returnValue;

    // --- Remove the current working thread
    const workingIndex = runtimeThread.childThreads.indexOf(workingThread);
    if (workingIndex < 0) {
      throw new Error("Cannot find thread to remove.");
    }
    runtimeThread.childThreads.splice(workingIndex, 1);

    // --- Remove the function level block
    workingThread.blocks.pop();

    // --- Return the function value
    return returnValue;
  };
}

// --- Completes all promises within the input
async function completePromise(input: any): Promise<any> {
  const visited = new Map<any, any>();

  return completePromiseInternal(input);

  async function completePromiseInternal(input: any): Promise<any> {
    // --- No need to resolve undefined or null
    if (input === undefined || input === null) return input;

    // --- Already visited?
    const resolved = visited.get(input);
    if (resolved) return resolved;

    // --- Resolve the chain of promises
    if (isPromise(input)) {
      const awaited = await input;
      visited.set(input, awaited);
      return completePromiseInternal(awaited);
    }

    // --- In any other cases, we keep the input reference
    visited.set(input, input);

    // --- Resolve promises within an array
    if (Array.isArray(input)) {
      for (let i = 0; i < input.length; i++) {
        const completedPromise = await completePromiseInternal(input[i]);
        if (input[i] !== completedPromise) {
          //prevent write if it's the same reference (can cause problems in frozen objects)
          input.splice(i, 1, completedPromise);
        }
      }
      return input;
    }

    // --- Resolve promises in object properties
    if (isPlainObject(input)) {
      for (const key of Object.keys(input)) {
        let completedPromise = await completePromiseInternal(input[key]);
        if (input[key] !== completedPromise) {
          //prevent write if it's the same reference (can cause problems in frozen objects)
          input[key] = completedPromise;
        }
      }
      return input;
    }

    // --- Done.
    return input;
  }
}

/**
 * Gets the context of the variable
 * @param id Identifier to test
 * @param thread Thread to use for evaluation
 */
export function isConstVar(id: string, thread: LogicalThread): boolean {
  // --- Start search the block context
  if (thread.blocks) {
    for (let idx = thread.blocks.length; idx >= 0; idx--) {
      const constContext = thread.blocks[idx]?.constVars;
      if (constContext && constContext.has(id)) return true;
    }
  }

  // --- Not in block context
  return false;
}

async function evalTemplateLiteralAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: TemplateLiteralExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
  onStatementCompleted: OnStatementCompletedCallback,
): Promise<any> {
  const segmentValuePromises = expr.segments.map(async (s) => {
    const evaledValue = await evaluator(thisStack, s, evalContext, thread, onStatementCompleted);
    thisStack.pop();
    return evaledValue;
  });
  const segmentValues = await Promise.all(segmentValuePromises);
  return evalTemplateLiteralCore(segmentValues);
}
