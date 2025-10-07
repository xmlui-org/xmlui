import { isPlainObject } from "lodash-es";

import type { TemplateLiteralExpression } from "./ScriptingSourceTree";
import {
  T_ARRAY_LITERAL,
  T_ARROW_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_DESTRUCTURE,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_OBJECT_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_UNARY_EXPRESSION,
  T_VAR_DECLARATION,
  type ArrayLiteral,
  type ArrowExpression,
  type AssignmentExpression,
  type BinaryExpression,
  type CalculatedMemberAccessExpression,
  type ConditionalExpression,
  type Expression,
  type FunctionInvocationExpression,
  type Identifier,
  type MemberAccessExpression,
  type ObjectLiteral,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type ReturnStatement,
  type SequenceExpression,
  type Statement,
  type UnaryExpression,
  type VarDeclaration,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import { processDeclarationsAsync, processStatementQueueAsync } from "./process-statement-async";
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
  getExprValue,
  getRootIdScope,
  isPromise,
  setExprValue,
} from "./eval-tree-common";
import { ensureMainThread } from "./process-statement-common";
import { getAsyncProxy } from "./asyncProxy";
import { isBannedFunction } from "./bannedFunctions";

type EvaluatorAsyncFunction = (
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
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
): Promise<any> {
  // --- Prepare the evaluation context
  const thisStack: any[] = [];
  ensureMainThread(evalContext);
  thread ??= evalContext.mainThread;

  // --- Evaluate the expression using the context
  return await evalBindingExpressionTreeAsync(
    thisStack,
    expr,
    evalContext,
    thread ?? evalContext.mainThread!,
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
  thread?: LogicalThread,
  ...args: any[]
): Promise<any> {
  // --- Just an extra safety check
  if (expr.type !== T_ARROW_EXPRESSION) {
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
  return await nativeFunction(expr.args, evalContext, thread ?? evalContext.mainThread, ...args);
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
): Promise<any> {
  if (!evalContext.options) {
    evalContext.options = { defaultToOptionalMemberAccess: true };
  }

  // --- Prepare evaluation
  const evaluator: EvaluatorAsyncFunction = evalBindingExpressionTreeAsync;

  // --- Process the expression according to its type

  try {
    switch (expr.type) {
      case T_TEMPLATE_LITERAL_EXPRESSION:
        return evalTemplateLiteralAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_LITERAL:
        return evalLiteral(thisStack, expr, thread);

      case T_IDENTIFIER:
        return evalIdentifier(thisStack, expr, evalContext, thread);

      case T_MEMBER_ACCESS_EXPRESSION:
        return await evalMemberAccessAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
        return await evalCalculatedMemberAccessAsync(
          evaluator,
          thisStack,
          expr,
          evalContext,
          thread,
        );

      case T_SEQUENCE_EXPRESSION:
        return await evalSequenceAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_ARRAY_LITERAL:
        return await evalArrayLiteralAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_OBJECT_LITERAL:
        return await evalObjectLiteralAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_UNARY_EXPRESSION:
        return await evalUnaryAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_BINARY_EXPRESSION:
        return await evalBinaryAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_CONDITIONAL_EXPRESSION:
        return await evalConditionalAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_ASSIGNMENT_EXPRESSION:
        return await evalAssignmentAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_PREFIX_OP_EXPRESSION:
      case T_POSTFIX_OP_EXPRESSION:
        return await evalPreOrPostAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_FUNCTION_INVOCATION_EXPRESSION:
        // --- Special async handling
        return await evalFunctionInvocationAsync(evaluator, thisStack, expr, evalContext, thread);

      case T_ARROW_EXPRESSION:
        return evalArrow(thisStack, expr, thread);

      case T_SPREAD_EXPRESSION:
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
): Promise<any> {
  await evaluator(thisStack, expr.obj, evalContext, thread);
  await completeExprValue(expr.obj, thread);
  // --- At this point we definitely keep the parent object on `thisStack`, as it will be the context object
  // --- of a FunctionInvocationExpression, if that follows the MemberAccess. Other operations would call
  // --- `thisStack.pop()` to remove the result from the previous `evalBindingExpressionTree` call.
  return evalMemberAccessCore(thisStack, expr, evalContext, thread);
}

async function evalCalculatedMemberAccessAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: CalculatedMemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  await evaluator(thisStack, expr.obj, evalContext, thread);
  await completeExprValue(expr.obj, thread);
  await evaluator(thisStack, expr.member, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.member, thread);
  return evalCalculatedMemberAccessCore(thisStack, expr, evalContext, thread);
}

function evalSequenceAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: SequenceExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  if (!expr.exprs || expr.exprs.length === 0) {
    throw new Error(`Missing expression sequence`);
  }
  const result = expr.exprs.map(async (e) => {
    const value = await evaluator(thisStack, e, evalContext, thread);
    setExprValue(e, { value }, thread);
    thisStack.pop();
    return value;
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
): Promise<any> {
  const value: any[] = [];
  for (const item of expr.items) {
    if (item.type === T_SPREAD_EXPRESSION) {
      const spreadArray = await evaluator(thisStack, item.expr, evalContext, thread);
      thisStack.pop();
      if (!Array.isArray(spreadArray)) {
        throw new Error("Spread operator within an array literal expects an array operand.");
      }
      value.push(...spreadArray);
    } else {
      value.push(await evaluator(thisStack, item, evalContext, thread));
      thisStack.pop();
      thisStack.push(value);
    }
  }

  // --- Done.
  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

async function evalObjectLiteralAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: ObjectLiteral,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  const objectHash: any = {};
  for (const prop of expr.props) {
    if (!Array.isArray(prop)) {
      // --- We're using a spread expression
      const spreadItems = await evaluator(thisStack, prop.expr, evalContext, thread);
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
      case T_LITERAL:
        key = prop[0].value;
        break;
      case T_IDENTIFIER:
        key = prop[0].name;
        break;
      default:
        key = await evaluator(thisStack, prop[0], evalContext, thread);
        thisStack.pop();
        break;
    }
    objectHash[key] = await evaluator(thisStack, prop[1], evalContext, thread);
    thisStack.pop();
  }

  // --- Done.
  setExprValue(expr, { value: objectHash }, thread);
  thisStack.push(objectHash);
  return objectHash;
}

async function evalUnaryAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: UnaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  await evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.expr, thread);
  return evalUnaryCore(expr, thisStack, evalContext, thread);
}

async function evalBinaryAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: BinaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  await evaluator(thisStack, expr.left, evalContext, thread);
  thisStack.pop();
  const l = await completeExprValue(expr.left, thread);
  if (expr.op === "&&" && !l) {
    setExprValue(expr, { value: l }, thread);
    return l;
  }
  if (expr.op === "||" && l) {
    setExprValue(expr, { value: l }, thread);
    return l;
  }
  await evaluator(thisStack, expr.right, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.right, thread);
  return evalBinaryCore(expr, thisStack, evalContext, thread);
}

async function evalConditionalAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: ConditionalExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  await evaluator(thisStack, expr.cond, evalContext, thread);
  thisStack.pop();
  const condition = await completeExprValue(expr.cond, thread);
  const value = await evaluator(
    thisStack,
    condition ? expr.thenE : expr.elseE,
    evalContext,
    thread,
  );
  setExprValue(expr, { value }, thread);
  return value;
}

async function evalAssignmentAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: AssignmentExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  const leftValue = expr.leftValue;
  const rootScope = getRootIdScope(leftValue, evalContext, thread);
  const updatesState = rootScope && rootScope.type !== "block";
  if (updatesState && evalContext.onWillUpdate) {
    void evalContext.onWillUpdate(rootScope, rootScope.name, "assignment");
  }
  await evaluator(thisStack, leftValue, evalContext, thread);
  thisStack.pop();
  await completeExprValue(leftValue, thread);
  await evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.expr, thread);
  const value = evalAssignmentCore(thisStack, expr, evalContext, thread);
  if (updatesState && evalContext.onDidUpdate) {
    void evalContext.onDidUpdate(rootScope, rootScope.name, "assignment");
  }
  return value;
}

async function evalPreOrPostAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  const rootScope = getRootIdScope(expr.expr, evalContext, thread);
  const updatesState = rootScope && rootScope.type !== "block";
  if (updatesState && evalContext.onWillUpdate) {
    void evalContext.onWillUpdate(rootScope, rootScope.name, "pre-post");
  }
  await evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.expr, thread);
  const value = evalPreOrPostCore(thisStack, expr, evalContext, thread);
  if (updatesState && evalContext.onDidUpdate) {
    void evalContext.onDidUpdate(rootScope, rootScope.name, "pre-post");
  }
  return value;
}

async function evalFunctionInvocationAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: FunctionInvocationExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  let functionObj: any;
  let implicitContextObject: any = null;

  // --- Check for contexted object
  if (expr.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
    const hostObject = await evaluator(thisStack, expr.obj.obj, evalContext, thread);
    await completeExprValue(expr.obj.obj, thread);
    functionObj = evalMemberAccessCore(thisStack, expr.obj, evalContext, thread);
    if (expr.obj.obj.type === T_IDENTIFIER && hostObject?._SUPPORT_IMPLICIT_CONTEXT) {
      implicitContextObject = hostObject;
    }
  } else {
    // --- Get the object on which to invoke the function
    await evaluator(thisStack, expr.obj, evalContext, thread);
    functionObj = await completeExprValue(expr.obj, thread);
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
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true })),
    );
    functionObj = await createArrowFunctionAsync(evaluator, functionObj as ArrowExpression);
  } else if (expr.obj.type === T_ARROW_EXPRESSION) {
    // --- We delay evaluating expression values. We pass the argument names as the first parameter, and then
    // --- all parameter expressions
    functionArgs.push(
      expr.obj.args.map((a) => (a as Identifier).name),
      evalContext,
      thread,
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true })),
    );
  } else {
    // --- We evaluate the argument values to pass to a JavaScript function
    for (let i = 0; i < expr.arguments.length; i++) {
      const arg = expr.arguments[i];
      if (arg.type === T_SPREAD_EXPRESSION) {
        await evaluator([], arg.expr, evalContext, thread);
        const funcArg = await completeExprValue(arg.expr, thread);
        if (!Array.isArray(funcArg)) {
          throw new Error("Spread operator within a function invocation expects an array operand.");
        }
        functionArgs.push(...funcArg);
      } else {
        if (arg.type === T_ARROW_EXPRESSION) {
          const funcArg = await createArrowFunctionAsync(evaluator, arg);
          const wrappedFunc = (...args: any[]) => {
            return funcArg(arg.args, evalContext, thread, ...args);
          };
          functionArgs.push(wrappedFunc);
        } else {
          await evaluator([], arg, evalContext, thread);
          const funcArg = await completeExprValue(arg, thread);
          if (funcArg?._ARROW_EXPR_) {
            const wrappedFuncArg = await createArrowFunctionAsync(evaluator, funcArg);
            const wrappedFunc = (...args: any[]) =>
              wrappedFuncArg(funcArg.args, evalContext, thread, ...args);
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
  const rootScope = getRootIdScope(expr.obj, evalContext, thread);
  const updatesState = rootScope && rootScope.type !== "block";
  if (updatesState && evalContext.onWillUpdate) {
    void evalContext.onWillUpdate(rootScope, rootScope.name, "function-call");
  }
  const value = evalContext.options?.defaultToOptionalMemberAccess
    ? (functionObj as Function)?.call(currentContext, ...functionArgs)
    : (functionObj as Function).call(currentContext, ...functionArgs);

  let returnValue = await completePromise(value);
  if (updatesState && evalContext.onDidUpdate) {
    void evalContext.onDidUpdate(rootScope, rootScope.name, "function-call");
  }

  // --- Done.
  setExprValue(expr, { value: returnValue }, thread);
  thisStack.push(returnValue);
  return returnValue;
}

function createArrowFunctionAsync(
  evaluator: EvaluatorAsyncFunction,
  expr: ArrowExpression,
): Promise<Function> {
  // --- Use this function, it evaluates the arrow function
  return async (...args: any[]) => {
    // --- Prepare the variables to pass
    const runTimeEvalContext = args[1] as BindingTreeEvaluationContext;
    const runtimeThread = args[2] as LogicalThread;

    // --- Create the thread that runs the arrow function
    const workingThread: LogicalThread = {
      parent: runtimeThread,
      childThreads: [],
      blocks: [{ vars: {} }],
      loops: [],
      breakLabelValue: -1,
      closures: (expr as any).closureContext,
    };
    runtimeThread.childThreads.push(workingThread);

    // --- Create a block for a named arrow function
    if (expr.name) {
      const functionBlock: BlockScope = { vars: {} };
      workingThread.blocks ??= [];
      workingThread.blocks.push(functionBlock);
      functionBlock.vars[expr.name] = expr;
      functionBlock.constVars = new Set([expr.name]);
    }

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
        case T_IDENTIFIER: {
          decl = {
            type: T_VAR_DECLARATION,
            id: argSpec.name,
          } as VarDeclaration;
          break;
        }
        case T_DESTRUCTURE: {
          decl = {
            type: T_VAR_DECLARATION,
            id: argSpec.id,
            aDestr: argSpec.aDestr,
            oDestr: argSpec.oDestr,
          } as VarDeclaration;
          break;
        }
        case T_SPREAD_EXPRESSION: {
          restFound = true;
          decl = {
            type: T_VAR_DECLARATION,
            id: (argSpec.expr as unknown as Identifier).name,
          } as VarDeclaration;
          break;
        }

        default:
          throw new Error("Unexpected arrow argument specification");
      }

      if (decl) {
        if (restFound) {
          // --- Get the rest of the arguments
          const restArgs = args.slice(i + 3);
          let argVals: any[] = [];
          for (const arg of restArgs) {
            if (arg?._EXPRESSION_) {
              argVals.push(await evaluator([], arg, runTimeEvalContext, runtimeThread));
            } else {
              argVals.push(arg);
            }
          }
          await processDeclarationsAsync(
            arrowBlock,
            runTimeEvalContext,
            runtimeThread,
            [decl],
            false,
            true,
            argVals,
          );
        } else {
          // --- Get the actual value to work with
          let argVal = args[i + 3];
          if (argVal?._EXPRESSION_) {
            argVal = await evaluator([], argVal, runTimeEvalContext, runtimeThread);
          }
          await processDeclarationsAsync(
            arrowBlock,
            runTimeEvalContext,
            runtimeThread,
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
      case T_EMPTY_STATEMENT:
        statements = [];
        break;
      case T_EXPRESSION_STATEMENT:
        // --- Create a new thread for the call
        statements = [
          {
            type: T_RETURN_STATEMENT,
            expr: expr.statement.expr,
          } as ReturnStatement,
        ];
        break;
      case T_BLOCK_STATEMENT:
        // --- Create a new thread for the call
        statements = expr.statement.stmts;
        break;
      default:
        throw new Error(
          `Arrow expression with a body of '${expr.statement.type}' is not supported yet.`,
        );
    }

    // --- Process the statement with a new processor
    await processStatementQueueAsync(statements, runTimeEvalContext, workingThread);

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
function completePromise(input: any): Promise<any> {
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

async function evalTemplateLiteralAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: TemplateLiteralExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  const segmentValues = new Array(expr.segments.length);
  for (let i = 0; i < expr.segments.length; ++i) {
    await evaluator(thisStack, expr.segments[i], evalContext, thread);
    thisStack.pop();
    const evaledValue = await completeExprValue(expr.segments[i], thread);
    segmentValues[i] = evaledValue;
  }
  const value = evalTemplateLiteralCore(segmentValues);
  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

export async function completeExprValue(expr: Expression, thread: LogicalThread): Promise<any> {
  const exprValue = getExprValue(expr, thread);
  const awaited = await completePromise(exprValue?.value);
  setExprValue(expr, { ...exprValue, value: awaited }, thread);
  return awaited;
}
