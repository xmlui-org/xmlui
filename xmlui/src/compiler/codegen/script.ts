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
): GeneratedEventFunctionSource {
  const body = ir.body.map((statement) => emitEventStatement(statement)).join("\n");
  return {
    body,
    functionSource: emitFunctionExpression(body),
    invalidates: dedupeInvalidates(writes
      .filter((write): write is BoundWriteTarget & { kind: "local" | "global" } =>
        write.kind === "local" || write.kind === "global",
      )
      .map((write) => ({ kind: write.kind, name: write.name }))),
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

function emitEventStatement(statement: XmluiHandlerStatementIr): string {
  switch (statement.kind) {
    case "ExpressionStatement":
      return `${emitEventExpression(statement.expression)};`;
    case "VariableDeclaration":
      return emitVariableDeclaration(statement);
    case "BlockStatement":
      return emitBlockStatement(statement);
    case "IfStatement":
      return emitIfStatement(statement);
    case "WhileStatement":
      return emitWhileStatement(statement);
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
      return emitExpression(expression);
  }
}

function emitVariableDeclaration(statement: XmluiVariableDeclarationIr): string {
  const declarations = statement.declarations
    .map((declaration) =>
      declaration.init
        ? `${declaration.name} = ${emitExpression(declaration.init)}`
        : declaration.name,
    )
    .join(", ");
  return `${statement.declarationKind} ${declarations};`;
}

function emitBlockStatement(statement: XmluiBlockStatementIr): string {
  return `{\n${statement.body.map((child) => emitEventStatement(child)).join("\n")}\n}`;
}

function emitIfStatement(statement: XmluiIfStatementIr): string {
  const consequent = emitStatementBlock(statement.consequent);
  const alternate = statement.alternate ? ` else ${emitStatementBlock(statement.alternate)}` : "";
  return `if (${emitExpression(statement.test)}) ${consequent}${alternate}`;
}

function emitWhileStatement(statement: XmluiWhileStatementIr): string {
  return `{\nlet __xmluiLoopGuard = 0;\nwhile (${emitExpression(statement.test)}) {\nif (++__xmluiLoopGuard > 10000) throw new Error("XMLUI handler loop guard exceeded.");\n${emitEventStatement(statement.body)}\n}\n}`;
}

function emitStatementBlock(statement: XmluiHandlerStatementIr): string {
  return statement.kind === "BlockStatement" ? emitBlockStatement(statement) : `{\n${emitEventStatement(statement)}\n}`;
}

function emitAssignmentExpression(expression: XmluiAssignmentExpressionIr): string {
  const target = expression.target;
  const right = emitExpression(expression.right);
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
  ].includes(name);
}
