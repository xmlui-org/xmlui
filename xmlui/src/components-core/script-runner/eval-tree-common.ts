import type { LogicalThread, ValueResult } from "../../abstractions/scripting/LogicalThread";
import {
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_IDENTIFIER,
  T_MEMBER_ACCESS_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  type ArrowExpression,
  type AssignmentExpression,
  type BinaryExpression,
  type CalculatedMemberAccessExpression,
  type Expression,
  type Identifier,
  type Literal,
  type MemberAccessExpression,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type UnaryExpression,
  type ValueAccessorExpression,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";

// --- Get the cached expression value
export function getExprValue(expr: Expression, thread: LogicalThread): any {
  return thread?.valueCache?.get(expr)?.value;
}

// --- Set the cached expression value
export function setExprValue(expr: Expression, value: any, thread: LogicalThread): void {
  thread.valueCache ??= new Map();
  thread.valueCache.set(expr, { value });
}

// --- Type guard to check for a Promise
export function isPromise(obj: any): obj is Promise<any> {
  return obj && typeof obj.then === "function";
}

// --- Evaluates a literal value (sync & async context)
export function evalLiteral(thisStack: any[], expr: Literal, thread: LogicalThread): any {
  setExprValue(expr, { value: expr.value }, thread);
  thisStack.push(expr.value);
  return expr.value;
}

type IdentifierScope = "global" | "app" | "localContext" | "block";

// --- Gets the scope of an identifier
export function getIdentifierScope(
  expr: Identifier,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): { type?: IdentifierScope; scope: any } {
  let type: IdentifierScope | undefined;
  let scope: any;

  // --- Search for primary value scope
  if (expr.isGlobal) {
    // --- Use the global scope only
    scope = globalThis;
    type = "global";
  } else {
    // --- Iterate trough threads from the current to the parent
    let currentThread: LogicalThread | undefined = thread ?? evalContext.mainThread;
    while (currentThread && !scope) {
      if (currentThread.blocks) {
        // --- Search the block-scopes
        for (let idx = currentThread.blocks.length - 1; idx >= 0; idx--) {
          const blockContext = currentThread.blocks[idx]?.vars;
          if (blockContext && expr.name in blockContext) {
            scope = blockContext;
            type = "block";
            break;
          }
        }
      }

      // --- We may have already found the ID
      if (scope) break;

      if (currentThread.closures) {
        // --- Search block-scopes of the closure list
        for (let idx = currentThread.closures.length - 1; idx >= 0; idx--) {
          const blockContext = currentThread.closures[idx]?.vars;
          if (blockContext && expr.name in blockContext) {
            scope = blockContext;
            type = "block";
            break;
          }
        }
      }

      // --- We may have already found the ID
      if (scope) break;

      // --- Check the parent thread
      currentThread = currentThread.parent;
    }
  }

  // --- If no identifier found so far, check the local context, the app context, and finally, the global context
  if (!scope) {
    if (evalContext.localContext && expr.name in evalContext.localContext) {
      // --- Object in localContext
      scope = evalContext.localContext;
      type = "localContext";
    } else if (evalContext.appContext?.[expr.name] !== undefined) {
      // --- Object in appContext
      scope = evalContext.appContext;
      type = "app";
    } else {
      // --- Finally, check the global context
      scope = globalThis;
      type = "global";
    }
  }

  // --- Done
  return { type, scope: scope };
}

// --- Evaluates an identifier (sync & async context)
export function evalIdentifier(
  thisStack: any[],
  expr: Identifier,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  // --- Check the ID in the cache
  let value: any;
  // --- The cache does not contain the value.
  // --- We need to find the value and store it in the cache.
  const idScope = getIdentifierScope(expr, evalContext, thread);
  const valueScope = idScope.scope;
  let valueIndex: string | number = expr.name;
  value = valueScope[valueIndex];
  const newValue: ValueResult = {
    valueScope,
    valueIndex,
    value,
  };
  setExprValue(expr, newValue, thread);

  // --- Done.
  thisStack.push(value);
  return value;
}

// --- Gets the scope of the root ID
export function getRootIdScope(
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): { type: IdentifierScope | undefined; name: string } | null {
  switch (expr.type) {
    case T_IDENTIFIER:
      const idScope = getIdentifierScope(expr, evalContext, thread);
      return { type: idScope.type, name: expr.name };
    case T_MEMBER_ACCESS_EXPRESSION:
      return getRootIdScope(expr.obj, evalContext, thread);
    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
      return getRootIdScope(expr.obj, evalContext, thread);
  }
  return null;
}

// --- Evaluates a member access expression (sync & async context)
export function evalMemberAccessCore(
  thisStack: any[],
  expr: MemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const parentObj = getExprValue(expr.obj, thread)?.value;
  const value =
    expr.opt || evalContext.options?.defaultToOptionalMemberAccess
      ? parentObj?.[expr.member]
      : parentObj[expr.member];
  setExprValue(
    expr,
    {
      valueScope: parentObj,
      valueIndex: expr.member,
      value,
    },
    thread,
  );
  thisStack.push(value);

  // --- Done.
  return value;
}

// --- Evaluates a calculated member access expression (sync & async context)
export function evalCalculatedMemberAccessCore(
  thisStack: any[],
  expr: CalculatedMemberAccessExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const parentObj = getExprValue(expr.obj, thread)?.value;
  const memberObj = getExprValue(expr.member, thread)?.value;
  const value = evalContext.options?.defaultToOptionalMemberAccess
    ? parentObj?.[memberObj]
    : parentObj[memberObj];
  setExprValue(
    expr,
    {
      valueScope: parentObj,
      valueIndex: memberObj,
      value,
    },
    thread,
  );
  thisStack.push(value);

  // --- Done.
  return value;
}

// --- Evaluates a value accessor expression (sync & async context)
export function evalValueAccessorCore(
  thisStack: any[],
  expr: ValueAccessorExpression,
  thread: LogicalThread,
): any {
  const obj = thisStack[thisStack.length - 1];
  
  // --- Apply value accessor logic
  let value = obj;
  if (obj !== null && obj !== undefined && typeof obj === 'object' && '_VALUE_PROP_' in obj) {
    const propName = obj._VALUE_PROP_;
    if (typeof propName === 'string') {
      value = obj[propName];
      thisStack.pop();
      thisStack.push(value);
    }
  }
  
  setExprValue(expr, { value }, thread);
  return value;
}

// --- Evaluates a unary expression (sync & async context)
export function evalUnaryCore(
  expr: UnaryExpression,
  thisStack: any[],
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  let value: any;
  const operand = getExprValue(expr.expr, thread);
  const operValue = operand?.value;
  switch (expr.op) {
    case "typeof":
      value = typeof operValue;
      break;
    case "delete":
      if (operand.valueScope && operand.valueIndex) {
        value = delete operand.valueScope[operand.valueIndex];
      } else {
        value = false;
      }
      break;
    case "+":
      value = operValue;
      break;
    case "-":
      value = -operValue;
      break;
    case "!":
      value = !operValue;
      break;
    case "~":
      value = ~operValue;
      break;
    default:
      throw new Error(`Unknown unary operator: ${expr.op}`);
  }
  setExprValue(expr, { value }, thread);

  // --- Done.
  thisStack.push(value);
  return value;
}

// --- Evaluates a binary operation (sync & async context)
export function evalBinaryCore(
  expr: BinaryExpression,
  thisStack: any[],
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  let value: any;
  const l = getExprValue(expr.left, thread)?.value;
  const r = getExprValue(expr.right, thread)?.value;
  switch (expr.op) {
    case "**":
      value = l ** r;
      break;
    case "*":
      value = l * r;
      break;
    case "/":
      value = l / r;
      break;
    case "%":
      value = l % r;
      break;
    case "+":
      value = l + r;
      break;
    case "-":
      value = l - r;
      break;
    case ">>":
      value = l >> r;
      break;
    case ">>>":
      value = l >>> r;
      break;
    case "<<":
      value = l << r;
      break;
    case "<":
      value = l < r;
      break;
    case "<=":
      value = l <= r;
      break;
    case ">":
      value = l > r;
      break;
    case ">=":
      value = l >= r;
      break;
    case "in":
      value = l in r;
      break;
    case "==":
      // eslint-disable-next-line eqeqeq
      value = l == r;
      break;
    case "!=":
      // eslint-disable-next-line eqeqeq
      value = l != r;
      break;
    case "===":
      value = l === r;
      break;
    case "!==":
      value = l !== r;
      break;
    case "&":
      value = l & r;
      break;
    case "^":
      value = l ^ r;
      break;
    case "|":
      value = l | r;
      break;
    case "&&":
      value = l && r;
      break;
    case "||":
      value = l || r;
      break;
    case "??":
      value = l ?? r;
      break;
    default:
      throw new Error(`Unknown binary operator: ${expr.op}`);
  }
  setExprValue(expr, { value }, thread);

  // --- Done.
  thisStack.push(value);
  return value;
}

// --- Evaluates an assignment operation (sync & async context)
export function evalAssignmentCore(
  thisStack: any[],
  expr: AssignmentExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const leftValue = getExprValue(expr.leftValue, thread);
  const newValue = getExprValue(expr.expr, thread)?.value;
  if (
    !leftValue.valueScope ||
    leftValue.valueIndex === undefined ||
    leftValue.valueIndex === null
  ) {
    throw new Error(`Evaluation of ${expr.op} requires a left-hand value.`);
  }

  const leftScope = leftValue.valueScope;
  const leftIndex = leftValue.valueIndex;
  if (typeof leftScope !== "object" || leftScope === null) {
    // TODO: Specify the error location in the error message
    throw new Error(`Unknown left-hand value`);
  }

  // --- Check for const value
  if (expr.leftValue.type === T_IDENTIFIER) {
    if (isConstVar(expr.leftValue.name, thread)) {
      throw new Error("A const variable cannot be modified");
    }
  }

  if (leftScope === globalThis && !(leftIndex in leftScope)) {
    throw new Error(`Left value variable (${leftIndex}) not found in the scope.`);
  }

  thisStack.pop();
  switch (expr.op) {
    case "=":
      leftScope[leftIndex] = newValue;
      break;
    case "+=":
      leftScope[leftIndex] += newValue;
      break;
    case "-=":
      leftScope[leftIndex] -= newValue;
      break;
    case "**=":
      leftScope[leftIndex] **= newValue;
      break;
    case "*=":
      leftScope[leftIndex] *= newValue;
      break;
    case "/=":
      leftScope[leftIndex] /= newValue;
      break;
    case "%=":
      leftScope[leftIndex] %= newValue;
      break;
    case "<<=":
      leftScope[leftIndex] <<= newValue;
      break;
    case ">>=":
      leftScope[leftIndex] >>= newValue;
      break;
    case ">>>=":
      leftScope[leftIndex] >>>= newValue;
      break;
    case "&=":
      leftScope[leftIndex] &= newValue;
      break;
    case "^=":
      leftScope[leftIndex] ^= newValue;
      break;
    case "|=":
      leftScope[leftIndex] |= newValue;
      break;
    case "&&=":
      leftScope[leftIndex] &&= newValue;
      break;
    case "||=":
      leftScope[leftIndex] ||= newValue;
      break;
    case "??=":
      leftScope[leftIndex] += newValue;
      break;
  }
  const value = leftScope[leftIndex];
  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

// --- Evaluates a prefix/postfix operator (sync & async context)
export function evalPreOrPostCore(
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): any {
  const operand = getExprValue(expr.expr, thread);
  if (!operand.valueScope || operand.valueIndex === undefined) {
    throw new Error(`Evaluation of ${expr.op} requires a left-hand value.`);
  }

  // --- Check for const value
  if (expr.expr.type === T_IDENTIFIER) {
    if (isConstVar(expr.expr.name, thread)) {
      // --- We cannot modify a const value
      throw new Error("A const variable cannot be modified");
    }
  }

  const value =
    expr.op === "++"
      ? expr.type === T_PREFIX_OP_EXPRESSION
        ? ++operand.valueScope[operand.valueIndex]
        : operand.valueScope[operand.valueIndex]++
      : expr.type === T_PREFIX_OP_EXPRESSION
        ? --operand.valueScope[operand.valueIndex]
        : operand.valueScope[operand.valueIndex]--;

  setExprValue(expr, { value }, thread);
  thisStack.push(value);
  return value;
}

// --- Evaluates an arrow expression (lazy, sync & async context)
export function evalArrow(
  thisStack: any[],
  expr: ArrowExpression,
  thread: LogicalThread,
): ArrowExpression {
  const lazyArrow = {
    ...expr,
    _ARROW_EXPR_: true,
    closureContext: obtainClosures(thread),
  } as ArrowExpression;
  setExprValue(expr, { value: lazyArrow }, thread);
  thisStack.push(lazyArrow);
  return lazyArrow;
}

export function obtainClosures(thread: LogicalThread): BlockScope[] {
  const closures = thread.blocks?.slice(0) ?? [];
  return thread.parent ? [...obtainClosures(thread.parent), ...closures] : closures;
}

/**
 * Gets the context of the variable
 * @param id Identifier to test
 * @param thread Thread to use for evaluation
 */
function isConstVar(id: string, thread: LogicalThread): boolean {
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

export function evalTemplateLiteralCore(segmentValues: any[]): string {
  return segmentValues.map((value) => (typeof value === "string" ? value : `${value}`)).join("");
}
