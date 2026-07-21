import { isPlainObject } from "lodash-es";
import type { LogicalThread, ValueResult } from "../../abstractions/scripting/LogicalThread";
import {
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_DESTRUCTURE,
  T_IDENTIFIER,
  T_MEMBER_ACCESS_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_VAR_DECLARATION,
  type ArrowExpression,
  type AssignmentExpression,
  type BinaryExpression,
  type CalculatedMemberAccessExpression,
  type Destructure,
  type Expression,
  type Identifier,
  type Literal,
  type MemberAccessExpression,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type UnaryExpression,
  type VarDeclaration,
} from "./ScriptingSourceTree";
import type { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { BindingTreeEvaluationContext, EvalTreeOptions } from "./BindingTreeEvaluationContext";
import { BannedApiError } from "./bannedFunctions";
import { isBannedMember, type BannedMemberResult } from "./bannedMembers";
import {
  assertCapability,
  capabilityForAppMember,
  capabilityForRootIdentifier,
  type UdcCapability,
} from "../udc-sandbox";

// =============================================================================
// DOM SANDBOX GUARD
// =============================================================================

/**
 * Handles a banned-member check result.
 *
 * - In **strict mode** (`strictDomSandbox === true` or a string array): throws
 *   `BannedApiError`.
 * - In **allow-list strict mode** (`strictDomSandbox` is a string array):
 *   matching API labels are exempted before warn/throw handling. Entries can
 *   be exact labels (`"window.document"`, `"document.body"`) or wildcard
 *   prefixes (`"document.*"`).
 * - In **warn mode** (default): emits `console.warn` so the access is visible
 *   in DevTools, and also pushes a `"sandbox:warn"` trace entry so it appears
 *   in the Inspector when verbose logging is active.
 * - `console` access is **allowed by default** (`allowConsole !== false`).
 *   Pass `allowConsole: false` in options to enforce the ban.
 *
 * Call this immediately after `isBannedMember()` returns `{ banned: true }`.
 * When `result.banned` is `false`, this function is a no-op.
 */
export function handleMemberBan(result: BannedMemberResult, options?: EvalTreeOptions): void {
  if (!result.banned) return;
  // console access is allowed unless the caller explicitly opts out.
  if (result.api === "window.console" && options?.allowConsole !== false) return;
  if (isAllowedDomSandboxApi(result.api, options?.strictDomSandbox)) return;
  const strict = options?.strictDomSandbox === true || Array.isArray(options?.strictDomSandbox);
  const warnLogger = options?.sandboxWarnLogger;
  const msg = `DOM API access to '${result.api}' is not allowed in XMLUI expressions.${
    result.help ? ` ${result.help}` : ""
  }`;
  if (strict) {
    throw new BannedApiError(result.api ?? "unknown", result.help);
  }
  // Warn mode: surface in DevTools and optionally in the Inspector trace.
  console.warn(`[XMLUI sandbox] ${msg}`);
  warnLogger?.({ api: result.api, help: result.help, text: msg });
}

function isAllowedDomSandboxApi(
  api: string | undefined,
  strictDomSandbox: EvalTreeOptions["strictDomSandbox"],
): boolean {
  if (!api || !Array.isArray(strictDomSandbox)) return false;
  return strictDomSandbox.some((entry) => domSandboxEntryMatches(entry, api));
}

function domSandboxEntryMatches(entry: string, api: string): boolean {
  const trimmed = entry.trim();
  if (!trimmed) return false;
  if (trimmed.endsWith(".*")) {
    const base = trimmed.slice(0, -2);
    return api === base || api.startsWith(`${base}.`) || api === `window.${base}`;
  }
  if (api === trimmed || api === `window.${trimmed}`) return true;
  const root = trimmed.split(".")[0];
  return Boolean(root && api === `window.${root}` && trimmed.startsWith(`${root}.`));
}

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

// --- Completes all promises within the input
export function completePromise(input: any): Promise<any> {
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
          const descriptor = Object.getOwnPropertyDescriptor(input, key);
          if (descriptor?.writable || descriptor?.set) {
            input[key] = completedPromise;
          }
        }
      }
      return input;
    }

    // --- Done.
    return input;
  }
}

export async function completeExprValue(expr: Expression, thread: LogicalThread): Promise<any> {
  const exprValue = getExprValue(expr, thread);
  const awaited = await completePromise(exprValue?.value);
  setExprValue(expr, { ...exprValue, value: awaited }, thread);
  return awaited;
}

// --- Evaluates a literal value (sync & async context)
export function evalLiteral(thisStack: any[], expr: Literal, thread: LogicalThread): any {
  setExprValue(expr, { value: expr.value }, thread);
  thisStack.push(expr.value);
  return expr.value;
}

type IdentifierScope = "global" | "app" | "localContext" | "block";

function checkUdcCapability(
  evalContext: BindingTreeEvaluationContext,
  root: string,
  member?: string,
): void {
  const contract = evalContext.options?.udcContract;
  if (!contract) return;
  const mapper = evalContext.options.udcCapabilityMapper;
  const capability: UdcCapability | undefined = mapper
    ? mapper(root, member)
    : root === "App" && member
      ? capabilityForAppMember(member)
      : member === undefined
        ? capabilityForRootIdentifier(root)
        : undefined;
  if (!capability) return;
  assertCapability(
    capability,
    contract,
    evalContext.options?.strictUdcSandbox === true,
    evalContext.options?.udcDiagnosticLogger,
  );
}

// --- Gets the scope of an identifier
export function getIdentifierScope(
  expr: Identifier,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): { type?: IdentifierScope; scope: any } {
  let type: IdentifierScope | undefined;
  let scope: any;

  // --- Search for primary value scope
  {
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
  // --- Check whether this global identifier is on the banned list.
  if (idScope.type === "global") {
    const banResult = isBannedMember(valueScope, valueIndex as string);
    handleMemberBan(banResult, evalContext.options);
  } else if (idScope.type === "app") {
    checkUdcCapability(evalContext, expr.name);
  }
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
  const root = getRootIdScope(expr.obj, evalContext, thread);
  if (root?.type === "app") {
    checkUdcCapability(evalContext, root.name, expr.member);
  }
  // --- Check banned member access (read path).
  const banResult = isBannedMember(parentObj, expr.member);
  handleMemberBan(banResult, evalContext.options);
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
  // --- Check banned member access (calculated read path).
  const banResult = isBannedMember(parentObj, memberObj);
  handleMemberBan(banResult, evalContext.options);
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
    case "instanceof":
      value = l instanceof r;
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

  // --- Check banned member access (write path).
  const writeBanResult = isBannedMember(leftScope, leftIndex as string);
  handleMemberBan(writeBanResult, evalContext.options);

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

  if (operand.valueScope === globalThis && !(operand.valueIndex in operand.valueScope)) {
    throw new Error(`Left value variable (${operand.valueIndex}) not found in the scope.`);
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
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): ArrowExpression {
  // --- Check if this is an async arrow function
  if (expr.async) {
    throw new Error("XMLUI does not support async arrow functions.");
  }

  const lazyArrow = {
    ...expr,
    _ARROW_EXPR_: true,
    closureContext: obtainClosures(thread),
  } as ArrowExpression;
  Object.defineProperty(lazyArrow, "closureEvalContext", {
    value: evalContext,
    enumerable: false,
    configurable: true,
  });
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

// --- Constructors allowed with the 'new' operator in XMLUI scripts.
// Keep this list to inert value/container types. Constructors that execute code,
// start browser capabilities, or expose raw platform control stay blocked.
export const allowedNewConstructors = new Map<string, Function>();

addAllowedNewConstructor("String", String);
addAllowedNewConstructor("Number", Number);
addAllowedNewConstructor("Boolean", Boolean);
addAllowedNewConstructor("Date", Date);
addAllowedNewConstructor("RegExp", RegExp);

addAllowedNewConstructor("Array", Array);
addAllowedNewConstructor("Object", Object);
addAllowedNewConstructor("Map", Map);
addAllowedNewConstructor("Set", Set);
addAllowedNewConstructor("WeakMap", WeakMap);
addAllowedNewConstructor("WeakSet", WeakSet);

addAllowedNewConstructor("ArrayBuffer", ArrayBuffer);
addAllowedNewConstructor("DataView", DataView);
addAllowedNewConstructor("Int8Array", Int8Array);
addAllowedNewConstructor("Uint8Array", Uint8Array);
addAllowedNewConstructor("Uint8ClampedArray", Uint8ClampedArray);
addAllowedNewConstructor("Int16Array", Int16Array);
addAllowedNewConstructor("Uint16Array", Uint16Array);
addAllowedNewConstructor("Int32Array", Int32Array);
addAllowedNewConstructor("Uint32Array", Uint32Array);
addAllowedNewConstructor("Float32Array", Float32Array);
addAllowedNewConstructor("Float64Array", Float64Array);
addAllowedNewConstructor("BigInt64Array", globalThis.BigInt64Array);
addAllowedNewConstructor("BigUint64Array", globalThis.BigUint64Array);

addAllowedNewConstructor("URL", globalThis.URL);
addAllowedNewConstructor("URLSearchParams", globalThis.URLSearchParams);
addAllowedNewConstructor("TextEncoder", globalThis.TextEncoder);
addAllowedNewConstructor("TextDecoder", globalThis.TextDecoder);
addAllowedNewConstructor("Blob", globalThis.Blob);
addAllowedNewConstructor("File", globalThis.File);

addAllowedNewConstructor("Error", Error);
addAllowedNewConstructor("EvalError", EvalError);
addAllowedNewConstructor("RangeError", RangeError);
addAllowedNewConstructor("ReferenceError", ReferenceError);
addAllowedNewConstructor("SyntaxError", SyntaxError);
addAllowedNewConstructor("TypeError", TypeError);
addAllowedNewConstructor("URIError", URIError);
addAllowedNewConstructor("AggregateError", globalThis.AggregateError);
addAllowedNewConstructor("DOMException", globalThis.DOMException);

function addAllowedNewConstructor(name: string, ctor: Function | undefined): void {
  if (typeof ctor === "function") {
    allowedNewConstructors.set(name, ctor);
  }
}

export function getAllowedNewConstructor(constructorObj: any): any {
  for (const [, ctor] of allowedNewConstructors) {
    if (constructorObj === ctor) {
      return ctor;
    }
  }

  const constructorName = constructorObj?.name || "unknown";
  throw new Error(
    `XMLUI does not support the new operator with constructor '${constructorName}'. ` +
      `Allowed constructors: ${Array.from(allowedNewConstructors.keys()).join(", ")}.`
  );
}

export function evalTemplateLiteralCore(segmentValues: any[]): string {
  return segmentValues.map((value) => (typeof value === "string" ? value : `${value}`)).join("");
}

export type StateUpdateKind = "assignment" | "pre-post" | "function-call";
export type RootUpdateScope = ReturnType<typeof getRootIdScope>;

export function getStateUpdateScope(
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): RootUpdateScope {
  const rootScope = getRootIdScope(expr, evalContext, thread);
  return rootScope && rootScope.type !== "block" ? rootScope : null;
}

export function notifyStateUpdate(
  phase: "will" | "did",
  evalContext: BindingTreeEvaluationContext,
  rootScope: RootUpdateScope,
  kind: StateUpdateKind,
): void {
  if (!rootScope) return;
  const hook = phase === "will" ? evalContext.onWillUpdate : evalContext.onDidUpdate;
  if (hook) {
    void hook(rootScope, rootScope.name, kind);
  }
}

export function createClosureEvalContext(
  callerEvalContext: BindingTreeEvaluationContext,
  closureEvalContext?: BindingTreeEvaluationContext,
): BindingTreeEvaluationContext {
  if (!closureEvalContext) return callerEvalContext;
  return {
    ...callerEvalContext,
    localContext: createLayeredScope(
      callerEvalContext.localContext,
      closureEvalContext.localContext,
    ),
    appContext: createLayeredScope(
      callerEvalContext.appContext,
      closureEvalContext.appContext,
    ),
  };
}

function createLayeredScope<T>(callerScope: T, closureScope: T): T {
  if (!callerScope || !closureScope || callerScope === closureScope) {
    return callerScope ?? closureScope;
  }

  return new Proxy(callerScope as any, {
    has(target, prop) {
      return prop in target || prop in (closureScope as any);
    },
    get(target, prop, receiver) {
      return prop in target
        ? Reflect.get(target, prop, receiver)
        : Reflect.get(closureScope as any, prop);
    },
    set(target, prop, value, receiver) {
      return prop in target || !(prop in (closureScope as any))
        ? Reflect.set(target, prop, value, receiver)
        : Reflect.set(closureScope as any, prop, value);
    },
    ownKeys(target) {
      return Array.from(
        new Set([...Reflect.ownKeys(closureScope as any), ...Reflect.ownKeys(target)]),
      );
    },
    getOwnPropertyDescriptor(target, prop) {
      return (
        Reflect.getOwnPropertyDescriptor(target, prop) ??
        Reflect.getOwnPropertyDescriptor(closureScope as any, prop)
      );
    },
  }) as T;
}

export function createArrowWorkingThread(
  expr: ArrowExpression,
  runtimeThread: LogicalThread,
): LogicalThread {
  const workingThread: LogicalThread = {
    parent: runtimeThread,
    childThreads: [],
    blocks: [{ vars: {} }],
    loops: [],
    breakLabelValue: -1,
    closures: (expr as any).closureContext,
  };
  runtimeThread.childThreads.push(workingThread);

  if (expr.name) {
    const functionBlock: BlockScope = { vars: {} };
    workingThread.blocks ??= [];
    workingThread.blocks.push(functionBlock);
    functionBlock.vars[expr.name] = expr;
    functionBlock.constVars = new Set([expr.name]);
  }

  return workingThread;
}

export function createArrowArgDeclaration(argSpec: Expression): VarDeclaration {
  switch (argSpec.type) {
    case T_IDENTIFIER:
      return {
        type: T_VAR_DECLARATION,
        id: argSpec.name,
      } as VarDeclaration;

    case T_DESTRUCTURE:
      return {
        type: T_VAR_DECLARATION,
        id: (argSpec as Destructure).id,
        aDestr: (argSpec as Destructure).aDestr,
        oDestr: (argSpec as Destructure).oDestr,
      } as VarDeclaration;

    case T_SPREAD_EXPRESSION:
      return {
        type: T_VAR_DECLARATION,
        id: (argSpec.expr as unknown as Identifier).name,
      } as VarDeclaration;

    default:
      throw new Error("Unexpected arrow argument specification");
  }
}

export function removeArrowWorkingThread(
  runtimeThread: LogicalThread,
  workingThread: LogicalThread,
): void {
  const workingIndex = runtimeThread.childThreads.indexOf(workingThread);
  if (workingIndex < 0) {
    throw new Error("Cannot find thread to remove.");
  }
  runtimeThread.childThreads.splice(workingIndex, 1);
  workingThread.blocks.pop();
}
