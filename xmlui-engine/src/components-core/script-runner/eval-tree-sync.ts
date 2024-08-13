import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import type { ICustomOperations } from "./ICustomOperations";
import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type {
  ArrayLiteral,
  ArrowExpression,
  AssignmentExpression,
  BinaryExpression,
  CalculatedMemberAccessExpression,
  ConditionalExpression,
  Expression,
  FunctionInvocationExpression,
  MemberAccessExpression,
  ObjectLiteral,
  PostfixOpExpression,
  PrefixOpExpression,
  ReturnStatement,
  SequenceExpression,
  Statement,
  UnaryExpression,
  VarDeclaration,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";

import {
  evalArrow,
  evalAssignmentCore,
  evalBinaryCore,
  evalCalculatedMemberAccessCore,
  evalIdentifier,
  evalLiteral,
  evalMemberAccessCore,
  evalPreOrPostCore,
  evalUnaryCore,
  isPromise,
} from "./eval-tree-common";
import { Parser } from "../../parsers/scripting/Parser";
import { ensureMainThread } from "./process-statement-common";
import { processDeclarations, processStatementQueue } from "./process-statement-sync";
import { isBannedFunction } from "./bannedFunctions";

// --- The type of function we use to evaluate a (partial) expression tree
type EvaluatorFunction = (
  thisStack: any[],
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
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
  thread?: LogicalThread
): any {
  // --- Use the main thread by default
  thread ??= evalContext.mainThread;

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
export function evalBinding(expr: Expression, evalContext: BindingTreeEvaluationContext, thread?: LogicalThread): any {
  const thisStack: any[] = [];
  ensureMainThread(evalContext);
  thread ??= evalContext.mainThread;
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
  if (expr.type !== "ArrowE") {
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
  thread: LogicalThread
): any {
  if (!evalContext.options) {
    evalContext.options = { defaultToOptionalMemberAccess: true };
  }

  // --- Prepare evaluation
  let customOp: ICustomOperations | null = null;
  const evaluator: EvaluatorFunction = evalBindingExpressionTree;

  // --- Reset the expression scope
  expr.valueScope = expr.valueIndex = undefined;

  // --- Process the expression according to its type
  switch (expr.type) {
    case "LitE":
      return evalLiteral(thisStack, expr);

    case "IdE":
      return evalIdentifier(thisStack, expr, evalContext, thread);

    case "MembE":
      return evalMemberAccess(evaluator, thisStack, expr, evalContext, thread);

    case "CMembE":
      return evalCalculatedMemberAccess(evaluator, thisStack, expr, evalContext, thread);

    case "SeqE":
      return evalSequence(evaluator, thisStack, expr, evalContext, thread);

    case "ALitE":
      return evalArrayLiteral(evaluator, thisStack, expr, evalContext, thread);

    case "OLitE":
      return evalObjectLiteral(evaluator, thisStack, expr, evalContext, thread);

    case "UnaryE":
      return evalUnary(evaluator, thisStack, customOp, expr, evalContext, thread);

    case "BinaryE":
      return evalBinary(evaluator, thisStack, customOp, expr, evalContext, thread);

    case "CondE":
      return evalConditional(evaluator, thisStack, expr, evalContext, thread);

    case "AsgnE":
      return evalAssignment(evaluator, thisStack, expr, evalContext, thread);

    case "PrefE":
    case "PostfE":
      return evalPreOrPost(evaluator, thisStack, expr, evalContext, thread);

    case "InvokeE":
      // --- Special sync handling
      const funcResult = evalFunctionInvocation(evaluator, thisStack, expr, evalContext, thread);
      if (isPromise(funcResult)) {
        throw new Error("Promises (async function calls) are not allowed in binding expressions.");
      }
      return funcResult;

    case "ArrowE":
      // --- Special sync handling
      return evalArrow(thisStack, expr, thread);

    case "SpreadE":
      throw new Error("Cannot use spread expression (...) with the current intermediate value.");

    default:
      throw new Error(`Unknown expression tree node: ${(expr as any).type}`);
  }
}

function evalMemberAccess(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: MemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const parentObj = evaluator(thisStack, expr.object, evalContext, thread);
  return evalMemberAccessCore(parentObj, thisStack, expr, evalContext);
}

function evalCalculatedMemberAccess(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: CalculatedMemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const parentObj = evaluator(thisStack, expr.object, evalContext, thread);

  // --- At this point we definitely keep the parent object on `thisStack`, as it will be the context object
  // --- of a FunctionInvocationExpression, if that follows the MemberAccess. Other operations would call
  // --- `thisStack.pop()` to remove the result from the previous `evalBindingExpressionTree` call.
  const memberObj = evaluator(thisStack, expr.member, evalContext, thread);
  thisStack.pop();
  return evalCalculatedMemberAccessCore(parentObj, memberObj, thisStack, expr, evalContext);
}

function evalSequence(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: SequenceExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  if (!expr.expressions || expr.expressions.length === 0) {
    throw new Error(`Missing expression sequence`);
  }
  const result = expr.expressions.map((e) => {
    const exprValue = evaluator(thisStack, e, evalContext, thread);
    thisStack.pop();
    return exprValue;
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
  thread: LogicalThread
): any {
  const arrayValue: any[] = [];
  for (const item of expr.items) {
    if (item.type === "SpreadE") {
      const spreadArray = evaluator(thisStack, item.operand, evalContext, thread);
      thisStack.pop();
      if (!Array.isArray(spreadArray)) {
        throw new Error("Spread operator within an array literal expects an array operand.");
      }
      arrayValue.push(...spreadArray);
    } else {
      arrayValue.push(evaluator(thisStack, item, evalContext, thread));
      thisStack.pop();
      thisStack.push(arrayValue);
    }
  }
  return arrayValue;
}

function evalObjectLiteral(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: ObjectLiteral,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const objectHash: any = {};
  for (const prop of expr.props) {
    if (!Array.isArray(prop)) {
      // --- We're using a spread expression
      const spreadItems = evaluator(thisStack, prop.operand, evalContext, thread);
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
        key = evaluator(thisStack, prop[0], evalContext, thread);
        thisStack.pop();
        break;
    }
    objectHash[key] = evaluator(thisStack, prop[1], evalContext, thread);
    thisStack.pop();
  }
  thisStack.push(objectHash);
  return objectHash;
}

function evalUnary(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  customOp: ICustomOperations | null,
  expr: UnaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const operand = evaluator(thisStack, expr.operand, evalContext, thread);
  thisStack.pop();
  return evalUnaryCore(expr, operand, thisStack, customOp);
}

function evalBinary(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  customOp: ICustomOperations | null,
  expr: BinaryExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const l = evaluator(thisStack, expr.left, evalContext, thread);
  thisStack.pop();
  if (expr.operator === "&&" && !l) {
    thisStack.push(l);
    return l;
  }
  if (expr.operator === "||" && l) {
    thisStack.push(l);
    return l;
  }
  const r = evaluator(thisStack, expr.right, evalContext, thread);
  thisStack.pop();
  return evalBinaryCore(l, r, thisStack, customOp, expr.operator);
}

function evalConditional(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: ConditionalExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const condition = evaluator(thisStack, expr.condition, evalContext, thread);
  thisStack.pop();
  return evaluator(thisStack, condition ? expr.consequent : expr.alternate, evalContext, thread);
}

function evalAssignment(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: AssignmentExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const leftValue = expr.leftValue;
  evaluator(thisStack, leftValue, evalContext, thread);
  thisStack.pop();
  const newValue = evaluator(thisStack, expr.operand, evalContext, thread);
  thisStack.pop();
  return evalAssignmentCore(leftValue, newValue, thisStack, expr, thread);
}

function evalPreOrPost(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  const operand = expr.operand;
  evaluator(thisStack, operand, evalContext, thread);
  thisStack.pop();
  return evalPreOrPostCore(operand, thisStack, expr, evalContext, thread);
}

function evalFunctionInvocation(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: FunctionInvocationExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  let functionObj: any;
  let implicitContextObject: any = null;

  // --- Check for contexted object
  if (expr.object.type === "MembE" && expr.object.object.type === "IdE") {
    const hostObject = evaluator(thisStack, expr.object.object, evalContext, thread);
    functionObj = evalMemberAccessCore(hostObject, thisStack, expr.object, evalContext);
    if (hostObject?._SUPPORT_IMPLICIT_CONTEXT) {
      implicitContextObject = hostObject;
    }
  } else {
    // --- Get the object on which to invoke the function
    functionObj = evaluator(thisStack, expr.object, evalContext, thread);
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
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true }))
    );
    functionObj = createArrowFunction(evaluator, functionObj as ArrowExpression);
  } else if (expr.object.type === "ArrowE") {
    // --- We delay evaluating expression values. We pass the argument names as the first parameter, and then
    // --- all parameter expressions
    functionArgs.push(
      expr.object.args,
      evalContext,
      thread,
      ...expr.arguments.map((a) => ({ ...a, _EXPRESSION_: true }))
    );
  } else {
    // --- We evaluate the argument values to pass to a JavaScript function
    for (let i = 0; i < expr.arguments.length; i++) {
      const arg = expr.arguments[i];
      if (arg.type === "SpreadE") {
        const funcArg = evaluator([], arg.operand, evalContext, thread);
        if (!Array.isArray(funcArg)) {
          throw new Error("Spread operator within a function invocation expects an array operand.");
        }
        functionArgs.push(...funcArg);
      } else {
        if (arg.type === "ArrowE") {
          const funcArg = createArrowFunction(evaluator, arg);
          const wrappedFunc = (...args: any[]) => funcArg(arg.args, evalContext, thread, ...args);
          functionArgs.push(wrappedFunc);
        } else {
          const funcArg = evaluator([], arg, evalContext, thread);
          if (funcArg?._ARROW_EXPR_) {
            const wrappedFuncArg = createArrowFunction(evaluator, funcArg);
            const wrappedFunc = (...args: any[]) => wrappedFuncArg(funcArg.args, evalContext, thread, ...args);
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
    throw new Error(`Function ${bannedInfo.func?.name ?? "unknown"} is not allowed to call. ${bannedInfo?.help ?? ""}`);
  }

  // --- We use context for "this"
  const currentContext = thisStack.length > 0 ? thisStack.pop() : evalContext.localContext;

  // --- Now, invoke the function
  const value = evalContext.options?.defaultToOptionalMemberAccess
    ? (functionObj as Function)?.call(currentContext, ...functionArgs)
    : (functionObj as Function).call(currentContext, ...functionArgs);
  thisStack.push(value);
  return value;
}

function createArrowFunction(evaluator: EvaluatorFunction, expr: ArrowExpression): Function {
  // --- Use this function, it evaluates the arrow function
  return (...args: any[]) => {
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
      closures: expr.closureContext,
    };
    runtimeThread.childThreads.push(workingThread);

    // --- Assign argument values to names
    const arrowBlock: BlockScope = { vars: {} };
    workingThread.blocks ??= [];
    workingThread.blocks.push(arrowBlock);
    const argSpecs = args[0] as Expression[];
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
        default:
          throw new Error("Unexpected arrow argument specification");
      }
      if (decl) {
        // --- Get the actual value to work with
        let argVal = args[i + 3];
        if (argVal?._EXPRESSION_) {
          argVal = evaluator([], argVal, runTimeEvalContext, runtimeThread);
        }
        processDeclarations(arrowBlock, runTimeEvalContext, runtimeThread, [decl], false, true, argVal);
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
        throw new Error(`Arrow expression with a body of '${expr.statement.type}' is not supported yet.`);
    }

    // --- Process the statement with a new processor
    processStatementQueue(statements, runTimeEvalContext, workingThread);

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
