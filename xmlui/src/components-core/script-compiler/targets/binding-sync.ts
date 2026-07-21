import { Parser } from "../../../parsers/scripting/Parser";
import {
  T_ARRAY_LITERAL,
  T_BINARY_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_OBJECT_LITERAL,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_UNARY_EXPRESSION,
  type ArrayLiteral,
  type BinaryExpression,
  type CalculatedMemberAccessExpression,
  type ConditionalExpression,
  type Expression,
  type MemberAccessExpression,
  type ObjectLiteral,
  type ObjectLiteralProp,
  type SequenceExpression,
  type TemplateLiteralExpression,
  type UnaryExpression,
} from "../../script-runner/ScriptingSourceTree";
import { collectVariableDependencies } from "../../script-runner/visitors";
import { createCompiledScriptArtifact } from "../artifact";
import { CompiledScriptCodeWriter } from "../code-writer";
import { throwUnsupportedCompiledScriptNode } from "../errors";
import { sourceRangeFromNode } from "../source";
import type { CompiledScriptArtifact } from "../types";

export type CompileBindingSyncExpressionOptions = {
  sourceId: string;
  sourceText?: string;
};

export function compileBindingSyncExpression(
  expr: Expression,
  { sourceId, sourceText }: CompileBindingSyncExpressionOptions,
): CompiledScriptArtifact {
  const writer = new CompiledScriptCodeWriter(sourceId);
  writer.write("return ");
  emitExpression(writer, expr, sourceId);
  writer.write(";");

  return createCompiledScriptArtifact({
    target: "binding-sync",
    sourceId,
    sourceText,
    sourceRange: sourceRangeFromNode(expr),
    astNodeId: expr.nodeId,
    dependencies: collectVariableDependencies(expr),
    js: writer.toString(),
    mappings: writer.getMappings(),
  });
}

export function compileBindingSyncExpressionSource(
  sourceText: string,
  sourceId: string,
): CompiledScriptArtifact {
  const parser = new Parser(sourceText);
  const expr = parser.parseExpr();
  if (!expr) {
    return createCompiledScriptArtifact({
      target: "binding-sync",
      sourceId,
      sourceText,
      js: "return undefined;",
    });
  }
  if (!parser.isEof) {
    throw new Error("Expression is not terminated properly");
  }
  return compileBindingSyncExpression(expr, { sourceId, sourceText });
}

function emitExpression(
  writer: CompiledScriptCodeWriter,
  expr: Expression,
  sourceId: string,
): void {
  switch (expr.type) {
    case T_LITERAL:
      writer.write(literalToJs(expr.value), expr);
      return;
    case T_IDENTIFIER:
      writer.write(`runtime.id(${JSON.stringify(expr.name)}, evalContext, thread)`, expr);
      return;
    case T_MEMBER_ACCESS_EXPRESSION:
      emitMemberExpression(writer, expr, sourceId);
      return;
    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
      emitCalculatedMemberExpression(writer, expr, sourceId);
      return;
    case T_UNARY_EXPRESSION:
      emitUnaryExpression(writer, expr, sourceId);
      return;
    case T_BINARY_EXPRESSION:
      emitBinaryExpression(writer, expr, sourceId);
      return;
    case T_CONDITIONAL_EXPRESSION:
      emitConditionalExpression(writer, expr, sourceId);
      return;
    case T_SEQUENCE_EXPRESSION:
      emitSequenceExpression(writer, expr, sourceId);
      return;
    case T_ARRAY_LITERAL:
      emitArrayLiteral(writer, expr, sourceId);
      return;
    case T_OBJECT_LITERAL:
      emitObjectLiteral(writer, expr, sourceId);
      return;
    case T_TEMPLATE_LITERAL_EXPRESSION:
      emitTemplateLiteral(writer, expr, sourceId);
      return;
    default:
      throwUnsupportedCompiledScriptNode(expr, sourceId);
  }
}

function emitMemberExpression(
  writer: CompiledScriptCodeWriter,
  expr: MemberAccessExpression,
  sourceId: string,
): void {
  writer.write("runtime.member(");
  emitExpression(writer, expr.obj, sourceId);
  writer.write(`, ${JSON.stringify(expr.member)}, evalContext)`, expr);
}

function emitCalculatedMemberExpression(
  writer: CompiledScriptCodeWriter,
  expr: CalculatedMemberAccessExpression,
  sourceId: string,
): void {
  writer.write("runtime.member(");
  emitExpression(writer, expr.obj, sourceId);
  writer.write(", ");
  emitExpression(writer, expr.member, sourceId);
  writer.write(", evalContext)", expr);
}

function emitUnaryExpression(
  writer: CompiledScriptCodeWriter,
  expr: UnaryExpression,
  sourceId: string,
): void {
  if (expr.op === "delete") {
    throwUnsupportedCompiledScriptNode(expr, sourceId);
  }
  writer.write(`(${expr.op} `);
  emitExpression(writer, expr.expr, sourceId);
  writer.write(")", expr);
}

function emitBinaryExpression(
  writer: CompiledScriptCodeWriter,
  expr: BinaryExpression,
  sourceId: string,
): void {
  writer.write("(");
  emitExpression(writer, expr.left, sourceId);
  writer.write(` ${expr.op} `);
  emitExpression(writer, expr.right, sourceId);
  writer.write(")", expr);
}

function emitConditionalExpression(
  writer: CompiledScriptCodeWriter,
  expr: ConditionalExpression,
  sourceId: string,
): void {
  writer.write("(");
  emitExpression(writer, expr.cond, sourceId);
  writer.write(" ? ");
  emitExpression(writer, expr.thenE, sourceId);
  writer.write(" : ");
  emitExpression(writer, expr.elseE, sourceId);
  writer.write(")", expr);
}

function emitSequenceExpression(
  writer: CompiledScriptCodeWriter,
  expr: SequenceExpression,
  sourceId: string,
): void {
  if (!expr.exprs || expr.exprs.length === 0) {
    throw new Error("Missing expression sequence");
  }
  writer.write("(");
  expr.exprs.forEach((item, index) => {
    if (index > 0) writer.write(", ");
    emitExpression(writer, item, sourceId);
  });
  writer.write(")", expr);
}

function emitArrayLiteral(
  writer: CompiledScriptCodeWriter,
  expr: ArrayLiteral,
  sourceId: string,
): void {
  writer.write("[");
  expr.items.forEach((item, index) => {
    if (index > 0) writer.write(", ");
    if (item.type === T_SPREAD_EXPRESSION) {
      writer.write("...");
      emitExpression(writer, item.expr, sourceId);
    } else {
      emitExpression(writer, item, sourceId);
    }
  });
  writer.write("]", expr);
}

function emitObjectLiteral(
  writer: CompiledScriptCodeWriter,
  expr: ObjectLiteral,
  sourceId: string,
): void {
  writer.write("({");
  expr.props.forEach((prop, index) => {
    if (index > 0) writer.write(", ");
    if (!Array.isArray(prop) && !("kind" in prop)) {
      writer.write("...");
      emitExpression(writer, prop.expr, sourceId);
      return;
    }
    if (!Array.isArray(prop)) {
      throwUnsupportedCompiledScriptNode(prop.value, sourceId);
    }
    emitObjectLiteralProp(writer, prop, sourceId);
  });
  writer.write("})", expr);
}

function emitObjectLiteralProp(
  writer: CompiledScriptCodeWriter,
  prop: ObjectLiteralProp,
  sourceId: string,
): void {
  writer.write("[");
  if (prop[0].type === T_IDENTIFIER) {
    writer.write(JSON.stringify(prop[0].name), prop[0]);
  } else {
    emitExpression(writer, prop[0], sourceId);
  }
  writer.write("]: ");
  emitExpression(writer, prop[1], sourceId);
}

function emitTemplateLiteral(
  writer: CompiledScriptCodeWriter,
  expr: TemplateLiteralExpression,
  sourceId: string,
): void {
  writer.write("[");
  expr.segments.forEach((segment, index) => {
    if (index > 0) writer.write(", ");
    emitExpression(writer, segment, sourceId);
  });
  writer.write("].map((value) => typeof value === 'string' ? value : `${value}`).join('')", expr);
}

function literalToJs(value: any): string {
  if (typeof value === "bigint") {
    return `${value.toString()}n`;
  }
  if (value === undefined) {
    return "undefined";
  }
  return JSON.stringify(value);
}
