import type { BindingTreeEvaluationContext } from "./BindingTreeEvaluationContext";
import type { ICustomOperations } from "./ICustomOperations";
import type { LogicalThread } from "./LogicalThread";
import type {
  ArrowExpression,
  AssignmentExpression,
  BinaryOpSymbols,
  CalculatedMemberAccessExpression,
  Expression,
  Identifier,
  Literal,
  MemberAccessExpression,
  PostfixOpExpression,
  PrefixOpExpression,
  UnaryExpression,
} from "../abstractions/scripting/ScriptingSourceTree";
import type { BlockScope } from "../abstractions/BlockScope";

import { customOperationsRegistry } from "./custom-operations-registry.js";
import { isCustomUiData } from "./custom-ui-data.js";
import { isConstVar } from "./eval-tree-async.js";
import { CustomOperationType } from "./ICustomOperations.js";

// --- Type guard to check for a Promise
export function isPromise(obj: any): obj is Promise<any> {
  return obj && typeof obj.then === "function";
}

// --- Gets the optional custom operation for the specified operation type
export function getCustomOperations(
  opType: CustomOperationType,
  firstOperand: any,
  secondOperand?: any
): ICustomOperations | null {
  // --- The first operand must be a useful value or object
  if (firstOperand === null || firstOperand === undefined) return null;

  // --- Is the first operand a custom UI type?
  if (!isCustomUiData(firstOperand)) return null;

  // --- Has the custom type registered a custom calculator object?
  const calculator = customOperationsRegistry.getOperationsObjectByKey(firstOperand._custom_data_type_);
  if (!calculator) return null;

  // --- The calculator defines the requested operation?
  let exists = false;
  switch (opType) {
    case CustomOperationType.MemberAccess:
      exists = !!calculator.memberAccess;
      break;
    case CustomOperationType.CalculatedMemberAccess:
      exists = !!calculator.calculatedMemberAccess;
      break;
    case CustomOperationType.UnaryPlus:
      exists = !!calculator.unaryPlus;
      break;
    case CustomOperationType.UnaryMinus:
      exists = !!calculator.unaryMinus;
      break;
    case CustomOperationType.LogicalNot:
      exists = !!calculator.logicalNot;
      break;
    case CustomOperationType.BitwiseNot:
      exists = !!calculator.bitwiseNot;
      break;
    case CustomOperationType.Multiply:
      exists = !!calculator.multiply;
      break;
    case CustomOperationType.Divide:
      exists = !!calculator.divide;
      break;
    case CustomOperationType.Remainder:
      exists = !!calculator.remainder;
      break;
    case CustomOperationType.Add:
      exists = !!calculator.add;
      break;
    case CustomOperationType.Subtract:
      exists = !!calculator.subtract;
      break;
    case CustomOperationType.SignedRightShift:
      exists = !!calculator.signedRightShift;
      break;
    case CustomOperationType.UnsignedRightShift:
      exists = !!calculator.unsignedRightShift;
      break;
    case CustomOperationType.LeftShift:
      exists = !!calculator.leftShift;
      break;
    case CustomOperationType.LessThan:
      exists = !!calculator.lessThan;
      break;
    case CustomOperationType.LessThanOrEqual:
      exists = !!calculator.lessThanOrEqual;
      break;
    case CustomOperationType.GreaterThan:
      exists = !!calculator.greaterThan;
      break;
    case CustomOperationType.GreaterThanOrEqual:
      exists = !!calculator.greaterThanOrEqual;
      break;
    case CustomOperationType.Equal:
      exists = !!calculator.equal;
      break;
    case CustomOperationType.StrictEqual:
      exists = !!calculator.strictEqual;
      break;
    case CustomOperationType.NotEqual:
      exists = !!calculator.notEqual;
      break;
    case CustomOperationType.StrictNotEqual:
      exists = !!calculator.strictNotEqual;
      break;
    case CustomOperationType.BitwiseAnd:
      exists = !!calculator.bitwiseAnd;
      break;
    case CustomOperationType.BitwiseXor:
      exists = !!calculator.bitwiseXor;
      break;
    case CustomOperationType.BitwiseOr:
      exists = !!calculator.bitwiseOr;
      break;
    case CustomOperationType.LogicalAnd:
      exists = !!calculator.logicalAnd;
      break;
    case CustomOperationType.LogicalOr:
      exists = !!calculator.logicalOr;
      break;
    case CustomOperationType.NullCoalesce:
      exists = !!calculator.nullCoalesce;
      break;
  }

  // --- The calculator object must support the specified operation
  if (!exists) return null;

  // --- Does the operation support the provided second operand?
  return secondOperand !== undefined
    ? calculator.supportSecondOperand(opType, secondOperand)
      ? calculator
      : null
    : calculator;
}

// --- Evaluates a literal value (sync & async context)
export function evalLiteral(thisStack: any[], expr: Literal): any {
  thisStack.push(expr.value);
  return expr.value;
}

type IdentifierScope = "global" | "app" | "localContext" | "block";

export function getIdentifierScope(
  expr: Identifier,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread
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
  thread: LogicalThread
): any {
  const idScope = getIdentifierScope(expr, evalContext, thread);
  const valueScope = idScope.scope;
  let valueIndex: string | number = expr.name;
  let idObj: any;

  // --- Get the variable value
  expr.valueScope = valueScope;
  expr.valueIndex = valueIndex;
  idObj = valueScope[valueIndex];

  // --- Done
  expr.value = idObj;
  thisStack.push(idObj);
  return idObj;
}

// --- Evaluates a member access expression (sync & async context)
export function evalMemberAccessCore(
  parentObj: any,
  thisStack: any[],
  expr: MemberAccessExpression,
  evalContext: BindingTreeEvaluationContext
): any {
  // --- At this point we definitely keep the parent object on `thisStack`, as it will be the context object
  // --- of a FunctionInvocationExpression, if that follows the MemberAccess. Other operations would call
  // --- `thisStack.pop()` to remove the result from the previous `evalBindingExpressionTree` call.
  expr.valueScope = parentObj;
  expr.valueIndex = expr.member;
  const memberObj =
    expr.isOptional || evalContext.options?.defaultToOptionalMemberAccess
      ? parentObj?.[expr.member]
      : parentObj[expr.member];
  thisStack.push(memberObj);

  // --- Done.
  return memberObj;
}

// --- Evaluates a calculated member access expression (sync & async context)
export function evalCalculatedMemberAccessCore(
  parentObj: any,
  memberObj: any,
  thisStack: any[],
  expr: CalculatedMemberAccessExpression,
  evalContext: BindingTreeEvaluationContext
): any {
  // --- At this point we definitely keep the parent object on `thisStack`, as it will be the context object
  // --- of a FunctionInvocationExpression, if that follows the MemberAccess. Other operations would call
  // --- `thisStack.pop()` to remove the result from the previous `evalBindingExpressionTree` call.
  expr.valueScope = parentObj;
  expr.valueIndex = memberObj;
  const calcMemberObj = evalContext.options?.defaultToOptionalMemberAccess
    ? parentObj?.[memberObj]
    : parentObj[memberObj];
  thisStack.push(calcMemberObj);

  // --- Done.
  return calcMemberObj;
}

// --- Evaluates a unary expression (sync & async context)
export function evalUnaryCore(
  expr: UnaryExpression,
  operand: any,
  thisStack: any[],
  customOp: ICustomOperations | null
): any {
  let unaryObj: any;
  switch (expr.operator) {
    case "typeof":
      unaryObj = typeof operand;
      break;
    case "delete":
      if (expr.operand.valueScope && expr.operand.valueIndex) {
        return delete expr.operand.valueScope[expr.operand.valueIndex];
      }
      return false;
    case "+":
      customOp = getCustomOperations(CustomOperationType.UnaryPlus, operand);
      unaryObj = customOp ? customOp.unaryPlus!(operand) : operand;
      break;
    case "-":
      customOp = getCustomOperations(CustomOperationType.UnaryMinus, operand);
      unaryObj = customOp ? customOp.unaryPlus!(operand) : -operand;
      break;
    case "!":
      customOp = getCustomOperations(CustomOperationType.LogicalNot, operand);
      unaryObj = customOp ? customOp.unaryPlus!(operand) : !operand;
      break;
    case "~":
      customOp = getCustomOperations(CustomOperationType.BitwiseNot, operand);
      unaryObj = customOp ? customOp.unaryPlus!(operand) : ~operand;
      break;
    default:
      throw new Error(`Unknown unary operator: ${expr.operator}`);
  }
  thisStack.push(unaryObj);
  return unaryObj;
}

// --- Evaluates a binary operation (sync & async context)
export function evalBinaryCore(
  l: any,
  r: any,
  thisStack: any[],
  customOp: ICustomOperations | null,
  opSymbol: BinaryOpSymbols
): any {
  let binaryObj: any;
  switch (opSymbol) {
    case "**":
      binaryObj = l ** r;
      break;
    case "*":
      customOp = getCustomOperations(CustomOperationType.Multiply, l, r);
      binaryObj = customOp ? customOp.multiply!(l, r) : l * r;
      break;
    case "/":
      customOp = getCustomOperations(CustomOperationType.Divide, l, r);
      binaryObj = customOp ? customOp.divide!(l, r) : l / r;
      break;
    case "%":
      customOp = getCustomOperations(CustomOperationType.Remainder, l, r);
      binaryObj = customOp ? customOp.remainder!(l, r) : l % r;
      break;
    case "+":
      customOp = getCustomOperations(CustomOperationType.Add, l, r);
      binaryObj = customOp ? customOp.add!(l, r) : l + r;
      break;
    case "-":
      customOp = getCustomOperations(CustomOperationType.Subtract, l, r);
      binaryObj = customOp ? customOp.subtract!(l, r) : l - r;
      break;
    case ">>":
      customOp = getCustomOperations(CustomOperationType.SignedRightShift, l, r);
      binaryObj = customOp ? customOp.signedRightShift!(l, r) : l >> r;
      break;
    case ">>>":
      customOp = getCustomOperations(CustomOperationType.UnsignedRightShift, l, r);
      binaryObj = customOp ? customOp.unsignedRightShift!(l, r) : l >>> r;
      break;
    case "<<":
      customOp = getCustomOperations(CustomOperationType.LeftShift, l, r);
      binaryObj = customOp ? customOp.leftShift!(l, r) : l << r;
      break;
    case "<":
      customOp = getCustomOperations(CustomOperationType.LessThan, l, r);
      binaryObj = customOp ? customOp.lessThan!(l, r) : l < r;
      break;
    case "<=":
      customOp = getCustomOperations(CustomOperationType.LessThanOrEqual, l, r);
      binaryObj = customOp ? customOp.lessThanOrEqual!(l, r) : l <= r;
      break;
    case ">":
      customOp = getCustomOperations(CustomOperationType.GreaterThan, l, r);
      binaryObj = customOp ? customOp.greaterThan!(l, r) : l > r;
      break;
    case ">=":
      customOp = getCustomOperations(CustomOperationType.GreaterThanOrEqual, l, r);
      binaryObj = customOp ? customOp.greaterThanOrEqual!(l, r) : l >= r;
      break;
    case "in":
      binaryObj = l in r;
      break;
    case "==":
      customOp = getCustomOperations(CustomOperationType.Equal, l, r);
      // eslint-disable-next-line eqeqeq
      binaryObj = customOp ? customOp.equal!(l, r) : l == r;
      break;
    case "!=":
      customOp = getCustomOperations(CustomOperationType.NotEqual, l, r);
      // eslint-disable-next-line eqeqeq
      binaryObj = customOp ? customOp.notEqual!(l, r) : l != r;
      break;
    case "===":
      customOp = getCustomOperations(CustomOperationType.StrictEqual, l, r);
      binaryObj = customOp ? customOp.strictEqual!(l, r) : l === r;
      break;
    case "!==":
      customOp = getCustomOperations(CustomOperationType.StrictNotEqual, l, r);
      binaryObj = customOp ? customOp.strictNotEqual!(l, r) : l !== r;
      break;
    case "&":
      customOp = getCustomOperations(CustomOperationType.BitwiseAnd, l, r);
      binaryObj = customOp ? customOp.bitwiseAnd!(l, r) : l & r;
      break;
    case "^":
      customOp = getCustomOperations(CustomOperationType.BitwiseXor, l, r);
      binaryObj = customOp ? customOp.bitwiseXor!(l, r) : l ^ r;
      break;
    case "|":
      customOp = getCustomOperations(CustomOperationType.BitwiseOr, l, r);
      binaryObj = customOp ? customOp.bitwiseOr!(l, r) : l | r;
      break;
    case "&&":
      customOp = getCustomOperations(CustomOperationType.LogicalAnd, l, r);
      binaryObj = customOp ? customOp.logicalAnd!(l, r) : l && r;
      break;
    case "||":
      customOp = getCustomOperations(CustomOperationType.LogicalOr, l, r);
      binaryObj = customOp ? customOp.logicalOr!(l, r) : l || r;
      break;
    case "??":
      customOp = getCustomOperations(CustomOperationType.NullCoalesce, l, r);
      binaryObj = customOp ? customOp.nullCoalesce!(l, r) : l ?? r;
      break;
    default:
      throw new Error(`Unknown binary operator: ${opSymbol}`);
  }
  thisStack.push(binaryObj);
  return binaryObj;
}

// --- Evaluates an assignment operation (sync & async context)
export function evalAssignmentCore(
  leftValue: Expression,
  newValue: any,
  thisStack: any[],
  expr: AssignmentExpression,
  thread: LogicalThread
): any {
  if (!leftValue.valueScope || leftValue.valueIndex === undefined || leftValue.valueIndex === null) {
    throw new Error(
      `Evaluation of ${expr.operator} requires a left-hand value., valueScope: ${leftValue.valueScope}, valueIndex: ${leftValue.valueIndex}`
    );
  }

  const leftScope = leftValue.valueScope;
  const leftIndex = leftValue.valueIndex;
  if (typeof leftScope !== "object" || leftScope === null) {
    throw new Error(`Unknown left-hand value ${leftValue?.source}, ${expr.source}`);
  }

  // --- Check for const value
  if (expr.leftValue.type === "IdE") {
    if (isConstVar(expr.leftValue.name, thread)) {
      throw new Error("A const variable cannot be modified");
    }
  }

  if (leftScope === globalThis && !(leftIndex in leftScope)) {
    throw new Error(`Left value variable (${leftIndex}) not found in the scope.`);
  }

  thisStack.pop();
  switch (expr.operator) {
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
  thisStack.push(value);
  return value;
}

// --- Evaluates a prefix/postfix operator (sync & async context)
export function evalPreOrPostCore(
  operand: Expression,
  thisStack: any[],
  expr: PrefixOpExpression | PostfixOpExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread
): any {
  if (!operand.valueScope || operand.valueIndex === undefined) {
    throw new Error(`Evaluation of ${expr.operator} requires a left-hand value.`);
  }

  // --- Check for const value
  if (expr.operand.type === "IdE") {
    if (isConstVar(expr.operand.name, thread)) {
      // --- We cannot modify a const value
      throw new Error("A const variable cannot be modified");
    }
  }

  const value =
    expr.operator === "++"
      ? expr.type === "PrefE"
        ? ++operand.valueScope[operand.valueIndex]
        : operand.valueScope[operand.valueIndex]++
      : expr.type === "PrefE"
      ? --operand.valueScope[operand.valueIndex]
      : operand.valueScope[operand.valueIndex]--;
  thisStack.push(value);
  return value;
}

// --- Evaluates an arrow expression (lazy, sync & async context)
export function evalArrow(thisStack: any[], expr: ArrowExpression, thread: LogicalThread): ArrowExpression {
  const lazyArrow = {
    ...expr,
    _ARROW_EXPR_: true,
    closureContext: obtainClosures(thread),
  } as ArrowExpression;
  thisStack.push(lazyArrow);
  return lazyArrow;
}

export function obtainClosures(thread: LogicalThread): BlockScope[] {
  const closures = thread.blocks?.slice(0) ?? [];
  return thread.parent ? [...obtainClosures(thread.parent), ...closures] : closures;
}
