import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type { TemplateLiteralExpression } from "./ScriptingSourceTree";
import {
  T_ARRAY_LITERAL,
  T_ARROW_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_AWAIT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_NEW_EXPRESSION,
  T_OBJECT_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_UNARY_EXPRESSION,
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
  type NewExpression,
  type ObjectLiteral,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type ReturnStatement,
  type SequenceExpression,
  type Statement,
  type UnaryExpression,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import { processDeclarationsAsync, processStatementQueueAsync } from "./process-statement-async";
import {
  completeExprValue,
  completePromise,
  createArrowArgDeclaration,
  createArrowWorkingThread,
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
  getAllowedNewConstructor,
  getStateUpdateScope,
  notifyStateUpdate,
  removeArrowWorkingThread,
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

      case T_AWAIT_EXPRESSION:
        throw new Error("XMLUI does not support the await operator.");

      case T_NEW_EXPRESSION:
        return await evalNewExpressionAsync(evaluator, thisStack, expr, evalContext, thread);

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
    if (!Array.isArray(prop) && !("kind" in prop)) {
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

    if (!Array.isArray(prop)) {
      const key = await evaluateObjectLiteralKeyAsync(
        evaluator,
        thisStack,
        prop.key,
        evalContext,
        thread,
      );
      const accessor = createArrowFunctionAsync(evaluator, prop.value);
      const existing = Object.getOwnPropertyDescriptor(objectHash, key);
      const pairedAccessor =
        existing && ("get" in existing || "set" in existing)
          ? prop.kind === "get"
            ? { set: existing.set }
            : { get: existing.get }
          : {};
      Object.defineProperty(objectHash, key, {
        ...pairedAccessor,
        enumerable: true,
        configurable: true,
        [prop.kind]: (...args: any[]) => accessor(prop.value.args, evalContext, thread, ...args),
      });
      continue;
    }

    // --- We're using key/[value] pairs
    const key = await evaluateObjectLiteralKeyAsync(
      evaluator,
      thisStack,
      prop[0],
      evalContext,
      thread,
    );
    const value = await evaluator(thisStack, prop[1], evalContext, thread);
    thisStack.pop();
    Object.defineProperty(objectHash, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  // --- Done.
  setExprValue(expr, { value: objectHash }, thread);
  thisStack.push(objectHash);
  return objectHash;
}

async function evaluateObjectLiteralKeyAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  switch (expr.type) {
    case T_LITERAL:
      return expr.value;
    case T_IDENTIFIER:
      return expr.name;
    default: {
      const key = await evaluator(thisStack, expr, evalContext, thread);
      thisStack.pop();
      return key;
    }
  }
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
    thisStack.push(l);
    return l;
  }
  if (expr.op === "||" && l) {
    setExprValue(expr, { value: l }, thread);
    thisStack.push(l);
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
  const rootScope = getStateUpdateScope(leftValue, evalContext, thread);
  notifyStateUpdate("will", evalContext, rootScope, "assignment");
  await evaluator(thisStack, leftValue, evalContext, thread);
  thisStack.pop();
  await completeExprValue(leftValue, thread);
  await evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.expr, thread);
  const value = evalAssignmentCore(thisStack, expr, evalContext, thread);
  notifyStateUpdate("did", evalContext, rootScope, "assignment");
  return value;
}

async function evalPreOrPostAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  const rootScope = getStateUpdateScope(expr.expr, evalContext, thread);
  notifyStateUpdate("will", evalContext, rootScope, "pre-post");
  await evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  await completeExprValue(expr.expr, thread);
  const value = evalPreOrPostCore(thisStack, expr, evalContext, thread);
  notifyStateUpdate("did", evalContext, rootScope, "pre-post");
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
  if (isArrowExpressionObject(functionObj)) {
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
          const funcArg = createArrowFunctionAsync(evaluator, arg);
          const wrappedFunc = (...args: any[]) => {
            return funcArg(arg.args, evalContext, thread, ...args);
          };
          functionArgs.push(wrappedFunc);
        } else {
          await evaluator([], arg, evalContext, thread);
          const funcArg = await completeExprValue(arg, thread);
          if (isArrowExpressionObject(funcArg)) {
            const wrappedFuncArg = createArrowFunctionAsync(evaluator, funcArg);
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
  const rootScope = getStateUpdateScope(expr.obj, evalContext, thread);
  notifyStateUpdate("will", evalContext, rootScope, "function-call");
  const value = evalContext.options?.defaultToOptionalMemberAccess
    ? (functionObj as Function)?.call(currentContext, ...functionArgs)
    : (functionObj as Function).call(currentContext, ...functionArgs);

  let returnValue = await completePromise(value);
  notifyStateUpdate("did", evalContext, rootScope, "function-call");

  // --- Done.
  setExprValue(expr, { value: returnValue }, thread);
  thisStack.push(returnValue);
  return returnValue;
}

async function evalNewExpressionAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: NewExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  // --- Evaluate the callee to get the constructor
  await evaluator(thisStack, expr.callee, evalContext, thread);
  const constructorObj = await completeExprValue(expr.callee, thread);
  thisStack.pop();

  // --- Check if the constructor is allowed
  const allowedConstructor = getAllowedNewConstructor(constructorObj);

  // --- Evaluate arguments
  const constructorArgs: any[] = [];
  for (let i = 0; i < expr.arguments.length; i++) {
    const arg = expr.arguments[i];
    if (arg.type === T_SPREAD_EXPRESSION) {
      await evaluator([], arg.expr, evalContext, thread);
      const funcArg = await completeExprValue(arg.expr, thread);
      if (!Array.isArray(funcArg)) {
        throw new Error("Spread operator within a new expression expects an array operand.");
      }
      constructorArgs.push(...funcArg);
    } else {
      await evaluator([], arg, evalContext, thread);
      const funcArg = await completeExprValue(arg, thread);
      constructorArgs.push(funcArg);
    }
  }

  // --- Create the new instance
  const value = new allowedConstructor(...constructorArgs);
  const returnValue = await completePromise(value);

  // --- Done.
  setExprValue(expr, { value: returnValue }, thread);
  thisStack.push(returnValue);
  return returnValue;
}

function createArrowFunctionAsync(
  evaluator: EvaluatorAsyncFunction,
  expr: ArrowExpression,
): Function {
  // --- Use this function, it evaluates the arrow function
  return async (...args: any[]) => {
    // --- Prepare the variables to pass
    const runTimeEvalContext = args[1] as BindingTreeEvaluationContext;
    const runtimeThread = args[2] as LogicalThread;

    // --- Create the thread that runs the arrow function
    const workingThread = createArrowWorkingThread(expr, runtimeThread);

    // --- Assign argument values to names
    const arrowBlock: BlockScope = { vars: {} };
    workingThread.blocks ??= [];
    workingThread.blocks.push(arrowBlock);
    const argSpecs = args[0] as Expression[];
    let restFound = false;
    for (let i = 0; i < argSpecs.length; i++) {
      // --- Turn argument specification into processable variable declarations
      const argSpec = argSpecs[i];
      const decl = createArrowArgDeclaration(argSpec);
      restFound = restFound || argSpec.type === T_SPREAD_EXPRESSION;
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
    removeArrowWorkingThread(runtimeThread, workingThread);

    // --- Return the function value
    return returnValue;
  };
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
