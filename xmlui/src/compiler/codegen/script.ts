import type {
  BoundDependency,
  BoundWriteTarget,
  XmluiEventHandlerIr,
  XmluiExpressionStatementIr,
  XmluiScriptIr,
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
  const body = ir.body.map((statement) => `${emitEventStatement(statement)};`).join("\n");
  return {
    body,
    functionSource: emitFunctionExpression(body),
    invalidates: writes
      .filter((write): write is BoundWriteTarget & { kind: "local" | "global" } =>
        write.kind === "local" || write.kind === "global",
      )
      .map((write) => ({ kind: write.kind, name: write.name })),
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
    case "LogicalExpression":
      return `(${emitExpression(ir.left)} || ${emitExpression(ir.right)})`;
    default:
      throw new Error(`Cannot generate ${ir.kind} as an XMLUI expression.`);
  }
}

function emitEventStatement(statement: XmluiExpressionStatementIr): string {
  const expression = statement.expression;
  if (expression.kind !== "PostfixUpdate") {
    return emitExpression(expression);
  }
  const target = expression.target;
  if (target.kind !== "local" && target.kind !== "global") {
    throw new Error(`Cannot generate invalid XMLUI event write target '${target.name}'.`);
  }
  const read = target.kind === "local" ? "readLocal" : "readGlobal";
  const write = target.kind === "local" ? "writeLocal" : "writeGlobal";
  return `ctx.${write}(${JSON.stringify(target.name)}, Number(ctx.${read}(${JSON.stringify(target.name)})) + 1)`;
}

function emitRead(dependency: BoundDependency | undefined, name: string): string {
  switch (dependency?.kind) {
    case "local":
      return `ctx.readLocal(${JSON.stringify(name)})`;
    case "global":
      return `ctx.readGlobal(${JSON.stringify(name)})`;
    default:
      throw new Error(`Cannot generate unresolved XMLUI identifier '${name}'.`);
  }
}
