import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
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
  type MemberAccessExpression,
  type NewExpression,
  type ObjectLiteral,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type SequenceExpression,
  type Statement,
  type UnaryExpression,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import { createXmlUiTreeNodeId, Parser } from "../../parsers/scripting/Parser";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import {
  createArrowArgDeclaration,
  createClosureEvalContext,
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
  getExprValue,
  getStateUpdateScope,
  notifyStateUpdate,
  removeArrowWorkingThread,
  setExprValue,
} from "./eval-tree-common";
import { ensureMainThread } from "./process-statement-common";
import { processDeclarations, processStatementQueue } from "./process-statement-sync";
import { assertSyncResult, callSyncFunction } from "./sync-runtime";
import {
  evaluateCompiledBinding,
  evaluateCompiledBindingExpressionSource,
} from "../script-compiler";

// --- The type of function we use to evaluate a (partial) expression tree
type EvaluatorFunction = (
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
) => any;

/**
 * Evaluates the specified binding expression tree and retrieves the evaluated value
 * @param source Binding tree expression
 * @param evalContext Evaluation context
 * @param thread The logical thread to use for evaluation
 * This code uses the JavaScript semantics and errors when evaluating the code.
 */
export function evalBindingExpression(
  source: string,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
  // --- Use the main thread by default
  ensureMainThread(evalContext);
  thread ??= evalContext.mainThread;

  if (evalContext.options?.compileBindings) {
    return evaluateCompiledBindingExpressionSource(source, evalContext, thread);
  }

  // --- Parse the source code
  const wParser = new Parser(source);
  const tree = wParser.parseExpr();
  if (tree === null) {
    // --- This should happen only when an expression is empty
    return undefined;
  }

  // --- Check for expression termination
  if (!wParser.isEof) {
    throw new Error("Expression is not terminated properly");
  }

  // --- Ok, valid source, evaluate
  return evalBinding(tree, evalContext, thread);
}

/**
 * Evaluates a binding represented by the specified expression
 * @param expr Expression to evaluate
 * @param evalContext Evaluation context to use
 * @param thread The logical thread to use for evaluation
 */
export function evalBinding(
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
  const thisStack: any[] = [];
  ensureMainThread(evalContext);
  thread ??= evalContext.mainThread;
  if (evalContext.options?.compileBindings) {
    return evaluateCompiledBinding(expr, evalContext, thread ?? evalContext.mainThread!);
  }
  return evalBindingExpressionTree(thisStack, expr, evalContext, thread ?? evalContext.mainThread!);
}

/**
 * Executes the specified arrow function
 * @param expr Arrow function expression to run
 * @param evalContext Evaluation context to use
 * @param thread The logical thread to use for evaluation
 * @param args Arguments of the arrow function to execute
 */
export function executeArrowExpressionSync(
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
  const evaluator: EvaluatorFunction = evalBindingExpressionTree;

  // --- Compiles the Arrow function to a JavaScript function
  const nativeFunction = createArrowFunction(evaluator, expr);

  // --- Run the compiled arrow function. Note, we have two prefix arguments:
  // --- #1: The names of arrow function arguments
  // --- #2: The evaluation context the arrow function runs in
  // --- #others: The real arguments of the arrow function
  return nativeFunction(expr.args, evalContext, thread ?? evalContext.mainThread, ...args);
}

/**
 * Evaluates the specified binding expression tree and retrieves the evaluated value
 * @param expr Binding tree expression
 * @param thisStack Stack of "this" object to use with function calls
 * @param evalContext Evaluation context
 * @param thread The logical thread to use for evaluation
 * This code uses the JavaScript semantics and errors when evaluating the code.
 * We use `thisStack` to keep track of the partial results of the evaluation tree so that we can set
 * the real `this` context when invoking a function.
 */
function evalBindingExpressionTree(
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  if (!evalContext.options) {
    evalContext.options = { defaultToOptionalMemberAccess: true };
  }

  // --- Prepare evaluation
  const evaluator: EvaluatorFunction = evalBindingExpressionTree;

  // --- Process the expression according to its type
  switch (expr.type) {
    case T_TEMPLATE_LITERAL_EXPRESSION:
      return evalTemplateLiteral(evaluator, thisStack, expr, evalContext, thread);

    case T_LITERAL:
      return evalLiteral(thisStack, expr, thread);

    case T_IDENTIFIER:
      return evalIdentifier(thisStack, expr, evalContext, thread);

    case T_MEMBER_ACCESS_EXPRESSION:
      return evalMemberAccess(evaluator, thisStack, expr, evalContext, thread);

    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
      return evalCalculatedMemberAccess(evaluator, thisStack, expr, evalContext, thread);

    case T_SEQUENCE_EXPRESSION:
      return evalSequence(evaluator, thisStack, expr, evalContext, thread);

    case T_ARRAY_LITERAL:
      return evalArrayLiteral(evaluator, thisStack, expr, evalContext, thread);

    case T_OBJECT_LITERAL:
      return evalObjectLiteral(evaluator, thisStack, expr, evalContext, thread);

    case T_UNARY_EXPRESSION:
      return evalUnary(evaluator, thisStack, expr, evalContext, thread);

    case T_BINARY_EXPRESSION:
      return evalBinary(evaluator, thisStack, expr, evalContext, thread);

    case T_CONDITIONAL_EXPRESSION:
      return evalConditional(evaluator, thisStack, expr, evalContext, thread);

    case T_ASSIGNMENT_EXPRESSION:
      return evalAssignment(evaluator, thisStack, expr, evalContext, thread);

    case T_PREFIX_OP_EXPRESSION:
    case T_POSTFIX_OP_EXPRESSION:
      return evalPreOrPost(evaluator, thisStack, expr, evalContext, thread);

    case T_FUNCTION_INVOCATION_EXPRESSION:
      // --- Special sync handling
      const funcResult = evalFunctionInvocation(evaluator, thisStack, expr, evalContext, thread);
      assertSyncResult(funcResult);
      return funcResult;

    case T_ARROW_EXPRESSION:
      // --- Special sync handling
      return evalArrow(thisStack, expr, evalContext, thread);

    case T_SPREAD_EXPRESSION:
      throw new Error("Cannot use spread expression (...) with the current intermediate value.");

    case T_AWAIT_EXPRESSION:
      throw new Error("XMLUI does not support the await operator.");

    case T_NEW_EXPRESSION:
      return evalNewExpression(evaluator, thisStack, expr, evalContext, thread);

    default:
      throw new Error(`Unknown expression tree node: ${(expr as any).type}`);
  }
}

function evalTemplateLiteral(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: TemplateLiteralExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const segmentValues = expr.segments.map((s) => {
    const evaledValue = evaluator(thisStack, s, evalContext, thread);
    thisStack.pop();
    return evaledValue;
  });
  const value = evalTemplateLiteralCore(segmentValues);
  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

function evalMemberAccess(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: MemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  evaluator(thisStack, expr.obj, evalContext, thread);
  // --- At this point we definitely keep the parent object on `thisStack`, as it will be the context object
  // --- of a FunctionInvocationExpression, if that follows the MemberAccess. Other operations would call
  // --- `thisStack.pop()` to remove the result from the previous `evalBindingExpressionTree` call.
  return evalMemberAccessCore(thisStack, expr, evalContext, thread);
}

function evalCalculatedMemberAccess(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: CalculatedMemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  evaluator(thisStack, expr.obj, evalContext, thread);
  evaluator(thisStack, expr.member, evalContext, thread);

  thisStack.pop();
  return evalCalculatedMemberAccessCore(thisStack, expr, evalContext, thread);
}

function evalSequence(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: SequenceExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  if (!expr.exprs || expr.exprs.length === 0) {
    throw new Error(`Missing expression sequence`);
  }
  const result = expr.exprs.map((e) => {
    const value = evaluator(thisStack, e, evalContext, thread);
    setExprValue(e, { value }, thread);
    thisStack.pop();
    return value;
  });
  const lastObj = result[result.length - 1];
  thisStack.push(lastObj);
  return lastObj;
}

function evalArrayLiteral(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: ArrayLiteral,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const value: any[] = [];
  for (const item of expr.items) {
    if (item.type === T_SPREAD_EXPRESSION) {
      const spreadArray = evaluator(thisStack, item.expr, evalContext, thread);
      thisStack.pop();
      if (!Array.isArray(spreadArray)) {
        throw new Error("Spread operator within an array literal expects an array operand.");
      }
      value.push(...spreadArray);
    } else {
      value.push(evaluator(thisStack, item, evalContext, thread));
      thisStack.pop();
      thisStack.push(value);
    }
  }

  // --- Done.
  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

function evalObjectLiteral(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: ObjectLiteral,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const objectHash: any = {};
  for (const prop of expr.props) {
    if (!Array.isArray(prop) && !("kind" in prop)) {
      // --- We're using a spread expression
      const spreadItems = evaluator(thisStack, prop.expr, evalContext, thread);
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
      const key = evaluateObjectLiteralKey(evaluator, thisStack, prop.key, evalContext, thread);
      const accessor = createArrowFunction(evaluator, prop.value);
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
    const key = evaluateObjectLiteralKey(evaluator, thisStack, prop[0], evalContext, thread);
    const value = evaluator(thisStack, prop[1], evalContext, thread);
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

function evaluateObjectLiteralKey(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  switch (expr.type) {
    case T_LITERAL:
      return expr.value;
    case T_IDENTIFIER:
      return expr.name;
    default: {
      const key = evaluator(thisStack, expr, evalContext, thread);
      thisStack.pop();
      return key;
    }
  }
}

function evalUnary(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: UnaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  return evalUnaryCore(expr, thisStack, evalContext, thread);
}

function evalBinary(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: BinaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  evaluator(thisStack, expr.left, evalContext, thread);
  thisStack.pop();
  const l = getExprValue(expr.left, thread)?.value;
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
  if (expr.op === "??" && l !== null && l !== undefined) {
    setExprValue(expr, { value: l }, thread);
    thisStack.push(l);
    return l;
  }
  evaluator(thisStack, expr.right, evalContext, thread);
  thisStack.pop();
  return evalBinaryCore(expr, thisStack, evalContext, thread);
}

function evalConditional(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: ConditionalExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const condition = evaluator(thisStack, expr.cond, evalContext, thread);
  thisStack.pop();
  const value = evaluator(thisStack, condition ? expr.thenE : expr.elseE, evalContext, thread);
  setExprValue(expr, { value }, thread);
  return value;
}

function evalAssignment(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: AssignmentExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const leftValue = expr.leftValue;
  const rootScope = getStateUpdateScope(leftValue, evalContext, thread);
  notifyStateUpdate("will", evalContext, rootScope, "assignment");
  evaluator(thisStack, leftValue, evalContext, thread);
  thisStack.pop();
  evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  const value = evalAssignmentCore(thisStack, expr, evalContext, thread);
  notifyStateUpdate("did", evalContext, rootScope, "assignment");
  return value;
}

function evalPreOrPost(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const rootScope = getStateUpdateScope(expr.expr, evalContext, thread);
  notifyStateUpdate("will", evalContext, rootScope, "pre-post");
  evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  const value = evalPreOrPostCore(thisStack, expr, evalContext, thread);
  notifyStateUpdate("did", evalContext, rootScope, "pre-post");
  return value;
}

function evalFunctionInvocation(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: FunctionInvocationExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  let functionObj: any;
  let implicitContextObject: any = null;

  // --- Check for contexted object
  if (expr.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
    const hostObject = evaluator(thisStack, expr.obj.obj, evalContext, thread);
    functionObj = evalMemberAccessCore(thisStack, expr.obj, evalContext, thread);
    if (expr.obj.obj.type === T_IDENTIFIER && hostObject?._SUPPORT_IMPLICIT_CONTEXT) {
      implicitContextObject = hostObject;
    }
  } else {
    // --- Get the object on which to invoke the function
    functionObj = evaluator(thisStack, expr.obj, evalContext, thread);
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
    functionObj = createArrowFunction(evaluator, functionObj as ArrowExpression);
  } else if (expr.obj.type === T_ARROW_EXPRESSION) {
    // --- We delay evaluating expression values. We pass the argument names as the first parameter, and then
    // --- all parameter expressions
    functionArgs.push(
      expr.obj.args,
      evalContext,
      thread,
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true })),
    );
  } else {
    // --- We evaluate the argument values to pass to a JavaScript function
    for (let i = 0; i < expr.arguments.length; i++) {
      const arg = expr.arguments[i];
      if (arg.type === T_SPREAD_EXPRESSION) {
        const funcArg = evaluator([], arg.expr, evalContext, thread);
        if (!Array.isArray(funcArg)) {
          throw new Error("Spread operator within a function invocation expects an array operand.");
        }
        functionArgs.push(...funcArg);
      } else {
        if (arg.type === T_ARROW_EXPRESSION) {
          const funcArg = createArrowFunction(evaluator, arg);
          const wrappedFunc = (...args: any[]) => funcArg(arg.args, evalContext, thread, ...args);
          functionArgs.push(wrappedFunc);
        } else {
          const funcArg = evaluator([], arg, evalContext, thread);
          if (isArrowExpressionObject(funcArg)) {
            const wrappedFuncArg = createArrowFunction(evaluator, funcArg);
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

  // --- We use context for "this"
  const currentContext = thisStack.length > 0 ? thisStack.pop() : evalContext.localContext;

  // --- Now, invoke the function
  const rootScope = getStateUpdateScope(expr.obj, evalContext, thread);
  notifyStateUpdate("will", evalContext, rootScope, "function-call");

  const value = callSyncFunction({
    functionObj,
    thisArg: currentContext,
    args: functionArgs,
    evalContext,
    optional: evalContext.options?.defaultToOptionalMemberAccess,
  });

  notifyStateUpdate("did", evalContext, rootScope, "function-call");

  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

function evalNewExpression(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: NewExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  // --- Evaluate the callee to get the constructor
  const constructorObj = evaluator(thisStack, expr.callee, evalContext, thread);
  thisStack.pop();

  // --- Check if the constructor is allowed
  const allowedConstructor = getAllowedNewConstructor(constructorObj);

  // --- Evaluate arguments
  const constructorArgs: any[] = [];
  for (let i = 0; i < expr.arguments.length; i++) {
    const arg = expr.arguments[i];
    if (arg.type === T_SPREAD_EXPRESSION) {
      const funcArg = evaluator([], arg.expr, evalContext, thread);
      if (!Array.isArray(funcArg)) {
        throw new Error("Spread operator within a new expression expects an array operand.");
      }
      constructorArgs.push(...funcArg);
    } else {
      const funcArg = evaluator([], arg, evalContext, thread);
      constructorArgs.push(funcArg);
    }
  }

  // --- Create the new instance
  const value = new allowedConstructor(...constructorArgs);

  // --- Done.
  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

function createArrowFunction(evaluator: EvaluatorFunction, expr: ArrowExpression): Function {
  // --- Use this function, it evaluates the arrow function
  return (...args: any[]) => {
    // --- Prepare the variables to pass
    const callerEvalContext = args[1] as BindingTreeEvaluationContext;
    const closureEvalContext = (expr as any).closureEvalContext as
      | BindingTreeEvaluationContext
      | undefined;
    const runTimeEvalContext = createClosureEvalContext(callerEvalContext, closureEvalContext);
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
            argVals.push(evaluator([], arg, callerEvalContext, runtimeThread));
          } else {
            argVals.push(arg);
          }
        }
        processDeclarations(
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
          argVal = evaluator([], argVal, callerEvalContext, runtimeThread);
        }
        processDeclarations(
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
            nodeId: createXmlUiTreeNodeId(),
            expr: expr.statement.expr,
          },
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
    processStatementQueue(statements, runTimeEvalContext, workingThread);

    // --- Return value is in a return value slot
    returnValue = workingThread.returnValue;

    // --- Remove the current working thread
    removeArrowWorkingThread(runtimeThread, workingThread);

    // --- Return the function value
    return returnValue;
  };
}
