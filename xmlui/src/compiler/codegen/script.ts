import type {
  BoundDependency,
  BoundWriteTarget,
  XmluiEventHandlerIr,
  XmluiAssignmentExpressionIr,
  XmluiBlockStatementIr,
  XmluiHandlerStatementIr,
  XmluiIfStatementIr,
  XmluiPostfixUpdateIr,
  XmluiPrefixUpdateIr,
  XmluiScriptIr,
  XmluiVariableDeclarationIr,
  XmluiWhileStatementIr,
} from "../scriptSemantics";
import { handlerUsesSharedYield, loopNeedsPacing, statementNeedsCheckpoint } from "../eventHandlerAnalysis";
import { emitFunctionExpression } from "./emitter";

export type GeneratedExpressionFunctionSource = {
  body: string;
  functionSource: string;
};

export type GeneratedEventFunctionSource = {
  body: string;
  functionSource: string;
  invalidates: Array<{ kind: "local" | "global"; name: string }>;
};

export type SharedYieldHelperOptions = {
  createStateName: string;
  checkpointName: string;
};

export type GenerateEventHandlerFunctionOptions = {
  yieldHelper?: "inline" | "none" | SharedYieldHelperOptions;
};

export function generateExpressionFunction(ir: XmluiScriptIr): GeneratedExpressionFunctionSource {
  const body = `return ${emitExpression(ir)};`;
  return {
    body,
    functionSource: emitFunctionExpression(body),
  };
}

export function generateEventHandlerFunction(
  ir: XmluiEventHandlerIr,
  writes: readonly BoundWriteTarget[] = [],
  options: GenerateEventHandlerFunctionOptions = {},
): GeneratedEventFunctionSource {
  const context = createEventCodegenContext(
    ir.options.executionMode === "sync" ? "none" : options.yieldHelper ?? "inline",
    collectHandlerLocalNames(ir.body),
  );
  const body = [
    ...context.prologue,
    context.stateDeclaration,
    "let __xmluiResult;",
    ...ir.body.map((statement) => emitEventStatement(statement, context)),
    "return __xmluiResult;",
  ].join("\n");
  return {
    body,
    functionSource: emitFunctionExpression(body, "ctx", { async: true }),
    invalidates: dedupeInvalidates(writes
      .filter((write): write is BoundWriteTarget & { kind: "local" | "global" } =>
        write.kind === "local" || write.kind === "global",
      )
      .map((write) => ({ kind: write.kind, name: write.name }))),
  };
}

type EventCodegenContext = {
  prologue: string[];
  stateDeclaration: string;
  checkpointCall: string;
  allocateLoopCheckpointName(): string;
};

export function emitSharedYieldHelperSource({
  createStateName,
  checkpointName,
}: SharedYieldHelperOptions = {
  createStateName: "__xmluiCreateYieldState",
  checkpointName: "__xmluiYieldIfNeeded",
}): string {
  return [
    `const __xmluiNow = () => typeof performance !== "undefined" ? performance.now() : Date.now();`,
    `const ${createStateName} = () => ({ lastYield: __xmluiNow() });`,
    `const ${checkpointName} = async (ctx, state) => {`,
    `const __xmluiElapsed = __xmluiNow() - state.lastYield;`,
    `if (__xmluiElapsed < 100) return;`,
    `await ((ctx.yieldIfNeeded ?? (() => new Promise((resolve) => setTimeout(resolve, 0))))(0));`,
    `state.lastYield = __xmluiNow();`,
    `};`,
  ].join("\n");
}

export { handlerUsesSharedYield };

function inlineYieldPrologue(): string[] {
  return [
    `const __xmluiNow = () => typeof performance !== "undefined" ? performance.now() : Date.now();`,
    `let __xmluiLastYield = __xmluiNow();`,
    `const __xmluiYieldIfNeeded = async () => {`,
    `const __xmluiElapsed = __xmluiNow() - __xmluiLastYield;`,
    `if (__xmluiElapsed < 100) return;`,
    `await ((ctx.yieldIfNeeded ?? (() => new Promise((resolve) => setTimeout(resolve, 0))))(0));`,
    `__xmluiLastYield = __xmluiNow();`,
    `};`,
  ];
}

function createEventCodegenContext(
  yieldHelper: "inline" | "none" | SharedYieldHelperOptions,
  userNames: Set<string>,
): EventCodegenContext {
  const usedNames = new Set(userNames);
  let nextLoopCheckpointId = 0;
  const allocateLoopCheckpointName = () => {
    while (true) {
      const name = `__xmluiLoopCheckpoint${nextLoopCheckpointId++}`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
  };
  if (yieldHelper === "none") {
    return {
      prologue: [],
      stateDeclaration: "",
      checkpointCall: "",
      allocateLoopCheckpointName,
    };
  }
  if (yieldHelper !== "inline") {
    return {
      prologue: [],
      stateDeclaration: `const __xmluiYieldState = ${yieldHelper.createStateName}();`,
      checkpointCall: `await ${yieldHelper.checkpointName}(ctx, __xmluiYieldState);`,
      allocateLoopCheckpointName,
    };
  }
  return {
    prologue: inlineYieldPrologue(),
    stateDeclaration: "",
    checkpointCall: "await __xmluiYieldIfNeeded();",
    allocateLoopCheckpointName,
  };
}

function emitExpression(ir: XmluiScriptIr): string {
  switch (ir.kind) {
    case "LiteralExpression":
      return JSON.stringify(ir.value);
    case "IdentifierRead":
      return emitRead(ir.dependency, ir.name);
    case "ScopedMemberRead":
      return `ctx.props?.[${JSON.stringify(ir.member)}]`;
    case "MemberRead":
      return emitOptionalMemberRead(ir.object, ir.member);
    case "IndexRead":
      return emitOptionalIndexRead(ir.object, ir.index);
    case "LogicalExpression":
      return `(${emitExpression(ir.left)} ${ir.operator} ${emitExpression(ir.right)})`;
    case "BinaryExpression":
      return `(${emitExpression(ir.left)} ${ir.operator} ${emitExpression(ir.right)})`;
    case "UnaryExpression":
      return `(${ir.operator}${emitExpression(ir.argument)})`;
    case "ConditionalExpression":
      return `(${emitExpression(ir.test)} ? ${emitExpression(ir.consequent)} : ${emitExpression(ir.alternate)})`;
    case "ArrayExpression":
      return `[${ir.elements.map(emitExpression).join(", ")}]`;
    case "ObjectExpression":
      return `{${ir.properties.map((property) => `${JSON.stringify(property.key)}: ${emitExpression(property.value)}`).join(", ")}}`;
    case "CallExpression":
      return emitCallExpression(ir);
    case "ArrowFunctionExpression":
      return `(${ir.params.join(", ")}) => ${emitExpression(ir.body)}`;
    case "AssignmentExpression":
      return emitAssignmentExpression(ir);
    case "PrefixUpdate":
    case "PostfixUpdate":
      return emitUpdateExpression(ir);
    default:
      throw new Error(`Cannot generate ${ir.kind} as an XMLUI expression.`);
  }
}

function emitOptionalMemberRead(object: XmluiScriptIr, member: string): string {
  const objectSource = emitExpression(object);
  return `(${objectSource} == null ? undefined : ${objectSource}[${JSON.stringify(member)}])`;
}

function emitOptionalIndexRead(object: XmluiScriptIr, index: XmluiScriptIr): string {
  const objectSource = emitExpression(object);
  return `(${objectSource} == null ? undefined : ${objectSource}[${emitExpression(index)}])`;
}

function emitCallExpression(ir: Extract<XmluiScriptIr, { kind: "CallExpression" }>): string {
  if (ir.callee.kind !== "MemberRead" || !isAllowedMethodName(ir.callee.member)) {
    throw new Error("Cannot generate unsupported XMLUI expression call target.");
  }
  const objectSource = emitExpression(ir.callee.object);
  const args = ir.args.map(emitExpression).join(", ");
  return `(${objectSource})?.[${JSON.stringify(ir.callee.member)}]?.(${args})`;
}

function emitEventStatement(statement: XmluiHandlerStatementIr, context: EventCodegenContext): string {
  const emitted = emitEventStatementBody(statement, context);
  return context.checkpointCall && statementNeedsCheckpoint(statement)
    ? `${emitted}\n${context.checkpointCall}`
    : emitted;
}

function emitEventStatementBody(statement: XmluiHandlerStatementIr, context: EventCodegenContext): string {
  switch (statement.kind) {
    case "ExpressionStatement":
      return `__xmluiResult = ${emitEventExpression(statement.expression)};`;
    case "VariableDeclaration":
      return emitVariableDeclaration(statement);
    case "BlockStatement":
      return emitBlockStatement(statement, context);
    case "IfStatement":
      return emitIfStatement(statement, context);
    case "WhileStatement":
      return emitWhileStatement(statement, context);
  }
}

function emitEventExpression(expression: XmluiScriptIr): string {
  switch (expression.kind) {
    case "AssignmentExpression":
      return emitAssignmentExpression(expression);
    case "PrefixUpdate":
    case "PostfixUpdate":
      return emitUpdateExpression(expression);
    default:
      return emitAsyncExpression(expression);
  }
}

function emitAsyncExpression(expression: XmluiScriptIr): string {
  if (expression.kind === "CallExpression") {
    return emitAsyncCallExpression(expression);
  }
  return emitExpression(expression);
}

function emitAsyncCallExpression(ir: Extract<XmluiScriptIr, { kind: "CallExpression" }>): string {
  const args = ir.args.map(emitAsyncExpression).join(", ");
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "delay") {
    return `await ((ctx.delay ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))))(${args}))`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "emitEvent") {
    const [name, ...eventArgs] = ir.args.map(emitAsyncExpression);
    return `await ((ctx.complete ?? ((value) => Promise.resolve(value)))(await ctx.emitEvent?.(${name ?? "undefined"}, [${eventArgs.join(", ")}])))`;
  }
  if (ir.callee.kind === "IdentifierRead" && ir.callee.name === "navigate") {
    const [target, queryParams] = ir.args.map(emitAsyncExpression);
    return `ctx.navigate?.(${target ?? "undefined"}, ${queryParams ?? "undefined"})`;
  }
  if (ir.callee.kind === "IdentifierRead") {
    return `await ((ctx.complete ?? ((value) => Promise.resolve(value)))(await ctx.callFunction?.(${JSON.stringify(ir.callee.name)}, [${args}])))`;
  }
  if (ir.callee.kind !== "MemberRead") {
    throw new Error("Cannot generate unsupported XMLUI event call target.");
  }
  const objectSource = emitAsyncExpression(ir.callee.object);
  return `await (ctx.complete ?? ((value) => Promise.resolve(value)))(await (ctx.call ?? ((target, methodName, args) => target?.[methodName]?.(...args)))(${objectSource}, ${JSON.stringify(ir.callee.member)}, [${args}]))`;
}

function emitVariableDeclaration(statement: XmluiVariableDeclarationIr): string {
  const declarations = statement.declarations
    .map((declaration) =>
      declaration.init
        ? `${declaration.name} = ${emitAsyncExpression(declaration.init)}`
        : declaration.name,
    )
    .join(", ");
  return `${statement.declarationKind} ${declarations};`;
}

function emitBlockStatement(statement: XmluiBlockStatementIr, context: EventCodegenContext): string {
  return `{\n${statement.body.map((child) => emitEventStatement(child, context)).join("\n")}\n}`;
}

function emitIfStatement(statement: XmluiIfStatementIr, context: EventCodegenContext): string {
  const consequent = emitStatementBlock(statement.consequent, context);
  const alternate = statement.alternate ? ` else ${emitStatementBlock(statement.alternate, context)}` : "";
  return `if (${emitAsyncExpression(statement.test)}) ${consequent}${alternate}`;
}

function emitWhileStatement(statement: XmluiWhileStatementIr, context: EventCodegenContext): string {
  if (!context.checkpointCall || !loopNeedsPacing(statement)) {
    return `{\nwhile (${emitAsyncExpression(statement.test)}) {\n${emitEventStatement(statement.body, context)}\n}\n}`;
  }
  const checkpointName = context.allocateLoopCheckpointName();
  return `{\nlet ${checkpointName} = 0;\nwhile (${emitAsyncExpression(statement.test)}) {\n${emitEventStatement(statement.body, context)}\nif (((++${checkpointName}) & 255) === 0) {\n${context.checkpointCall}\n}\n}\n}`;
}

function emitStatementBlock(statement: XmluiHandlerStatementIr, context: EventCodegenContext): string {
  return statement.kind === "BlockStatement" ? emitBlockStatement(statement, context) : `{\n${emitEventStatement(statement, context)}\n}`;
}

function emitAssignmentExpression(expression: XmluiAssignmentExpressionIr): string {
  const target = expression.target;
  const right = emitAsyncExpression(expression.right);
  if (target.kind === "handlerLocal") {
    if (expression.operator === "=") {
      return `${target.name} = ${right}`;
    }
    return `${target.name} ${expression.operator} ${right}`;
  }
  const next = expression.operator === "="
    ? right
    : `(${emitTargetRead(target)} ${compoundOperator(expression.operator)} ${right})`;
  return emitTargetWrite(target, next);
}

function emitUpdateExpression(expression: XmluiPrefixUpdateIr | XmluiPostfixUpdateIr): string {
  const target = expression.target;
  if (target.kind === "handlerLocal") {
    return `${expression.kind === "PrefixUpdate" ? expression.operator : ""}${target.name}${expression.kind === "PostfixUpdate" ? expression.operator : ""}`;
  }
  const delta = expression.operator === "--" ? "- 1" : "+ 1";
  return emitTargetWrite(target, `Number(${emitTargetRead(target)}) ${delta}`);
}

function emitTargetRead(target: BoundWriteTarget): string {
  if (target.kind === "handlerLocal") {
    return target.name;
  }
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot generate invalid XMLUI event write target '${target.name}'.`);
  }
  const read = target.kind === "local" ? "readLocal" : "readGlobal";
  return `ctx.${read}(${JSON.stringify(target.name)})`;
}

function emitTargetWrite(target: BoundWriteTarget, valueSource: string): string {
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot generate invalid XMLUI event write target '${target.name}'.`);
  }
  const write = target.kind === "local" ? "writeLocal" : "writeGlobal";
  return `ctx.${write}(${JSON.stringify(target.name)}, ${valueSource})`;
}

function compoundOperator(operator: XmluiAssignmentExpressionIr["operator"]): string {
  return operator === "=" ? "=" : operator.slice(0, -1);
}

function dedupeInvalidates(
  invalidates: Array<{ kind: "local" | "global"; name: string }>,
): Array<{ kind: "local" | "global"; name: string }> {
  const seen = new Set<string>();
  return invalidates.filter((invalidate) => {
    const key = `${invalidate.kind}:${invalidate.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function emitRead(dependency: BoundDependency | undefined, name: string): string {
  switch (dependency?.kind) {
    case "local":
      return `ctx.readLocal(${JSON.stringify(name)})`;
    case "global":
      return `ctx.readGlobal(${JSON.stringify(name)})`;
    case "context":
      return `ctx.readContext?.(${JSON.stringify(name)})`;
    case "reference":
      return `ctx.readReference?.(${JSON.stringify(name)})`;
    case undefined:
      return name;
    default:
      throw new Error(`Cannot generate unresolved XMLUI identifier '${name}'.`);
  }
}

function isAllowedMethodName(name: string): boolean {
  return [
    "map",
    "filter",
    "find",
    "some",
    "every",
    "includes",
    "join",
    "toLowerCase",
    "toUpperCase",
    "startsWith",
    "endsWith",
    "hasOverflow",
    "scrollToTop",
    "scrollToBottom",
    "scrollToStart",
    "scrollToEnd",
  ].includes(name);
}

function collectHandlerLocalNames(statements: readonly XmluiHandlerStatementIr[]): Set<string> {
  const names = new Set<string>();
  const visit = (statement: XmluiHandlerStatementIr) => {
    switch (statement.kind) {
      case "VariableDeclaration":
        for (const declaration of statement.declarations) {
          names.add(declaration.name);
        }
        break;
      case "BlockStatement":
        statement.body.forEach(visit);
        break;
      case "IfStatement":
        visit(statement.consequent);
        if (statement.alternate) {
          visit(statement.alternate);
        }
        break;
      case "WhileStatement":
        visit(statement.body);
        break;
      case "ExpressionStatement":
        break;
    }
  };
  statements.forEach(visit);
  return names;
}
