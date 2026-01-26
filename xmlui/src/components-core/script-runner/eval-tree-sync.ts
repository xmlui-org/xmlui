import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type { Identifier, TemplateLiteralExpression } from "./ScriptingSourceTree";
import {
  T_ARRAY_LITERAL,
  T_ARROW_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_AWAIT_EXPRESSION,
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
  type MemberAccessExpression,
  type ObjectLiteral,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type SequenceExpression,
  type Statement,
  type UnaryExpression,
  type VarDeclaration,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import { createXmlUiTreeNodeId, Parser } from "../../parsers/scripting/Parser";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import { isBannedFunction } from "./bannedFunctions";
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
import { processDeclarations, processStatementQueue } from "./process-statement-sync";

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
export function evalBinding(
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
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
      if (isPromise(funcResult)) {
        throw new Error("Promises (async function calls) are not allowed in binding expressions.");
      }
      return funcResult;

    case T_ARROW_EXPRESSION:
      // --- Special sync handling
      return evalArrow(thisStack, expr, thread);

    case T_SPREAD_EXPRESSION:
      throw new Error("Cannot use spread expression (...) with the current intermediate value.");

    case T_AWAIT_EXPRESSION:
      throw new Error("XMLUI does not support the await operator.");

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
    if (!Array.isArray(prop)) {
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
        key = evaluator(thisStack, prop[0], evalContext, thread);
        thisStack.pop();
        break;
    }
    objectHash[key] = evaluator(thisStack, prop[1], evalContext, thread);
    thisStack.pop();
  }

  // --- Done.
  setExprValue(expr, { value: objectHash }, thread);
  thisStack.push(objectHash);
  return objectHash;
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
  const rootScope = getRootIdScope(leftValue, evalContext, thread);
  const updatesState = rootScope && rootScope.type !== "block";
  if (updatesState && evalContext.onWillUpdate) {
    void evalContext.onWillUpdate(rootScope, rootScope.name, "assignment");
  }
  evaluator(thisStack, leftValue, evalContext, thread);
  thisStack.pop();
  evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  const value = evalAssignmentCore(thisStack, expr, evalContext, thread);
  if (updatesState && evalContext.onDidUpdate) {
    void evalContext.onDidUpdate(rootScope, rootScope.name, "assignment");
  }
  return value;
}

function evalPreOrPost(
  evaluator: EvaluatorFunction,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const rootScope = getRootIdScope(expr.expr, evalContext, thread);
  const updatesState = rootScope && rootScope.type !== "block";
  if (updatesState && evalContext.onWillUpdate) {
    void evalContext.onWillUpdate(rootScope, rootScope.name, "pre-post");
  }
  evaluator(thisStack, expr.expr, evalContext, thread);
  thisStack.pop();
  const value = evalPreOrPostCore(thisStack, expr, evalContext, thread);
  if (updatesState && evalContext.onDidUpdate) {
    void evalContext.onDidUpdate(rootScope, rootScope.name, "pre-post");
  }
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

  // --- Check if the function is banned from running
  const bannedInfo = isBannedFunction(functionObj);
  if (bannedInfo.banned) {
    throw new Error(
      `Function ${bannedInfo.func?.name ?? "unknown"} is not allowed to call. ${bannedInfo?.help ?? ""}`,
    );
  }

  // --- We use context for "this"
  const currentContext = thisStack.length > 0 ? thisStack.pop() : evalContext.localContext;

  // --- Now, invoke the function
  const rootScope = getRootIdScope(expr.obj, evalContext, thread);
  const updatesState = rootScope && rootScope.type !== "block";
  if (updatesState && evalContext.onWillUpdate) {
    void evalContext.onWillUpdate(rootScope, rootScope.name, "function-call");
  }

  const value = evalContext.options?.defaultToOptionalMemberAccess
    ? (functionObj as Function)?.call(currentContext, ...functionArgs)
    : (functionObj as Function).call(currentContext, ...functionArgs);

  if (updatesState && evalContext.onDidUpdate) {
    void evalContext.onDidUpdate(rootScope, rootScope.name, "function-call");
  }

  setExprValue(expr, { value }, thread);
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
              argVals.push(evaluator([], arg, runTimeEvalContext, runtimeThread));
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
            argVal = evaluator([], argVal, runTimeEvalContext, runtimeThread);
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
