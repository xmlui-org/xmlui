import { Parser } from "../../../parsers/scripting/Parser";
import {
  T_ARRAY_LITERAL,
  T_BINARY_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_CONST_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_ARROW_EXPRESSION,
  T_IDENTIFIER,
  T_LET_STATEMENT,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_OBJECT_LITERAL,
  T_RETURN_STATEMENT,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_UNARY_EXPRESSION,
  type ArrayLiteral,
  type ArrowExpression,
  type BinaryExpression,
  type BlockStatement,
  type CalculatedMemberAccessExpression,
  type ConditionalExpression,
  type ConstStatement,
  type Expression,
  type FunctionInvocationExpression,
  type Identifier,
  type LetStatement,
  type MemberAccessExpression,
  type ObjectLiteral,
  type ObjectLiteralProp,
  type ReturnStatement,
  type SequenceExpression,
  type Statement,
  type TemplateLiteralExpression,
  type UnaryExpression,
  type VarDeclaration,
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

type CompilerContext = {
  sourceId: string;
  locals: Set<string>;
  nextTemp(): string;
};

export function compileBindingSyncExpression(
  expr: Expression,
  { sourceId, sourceText }: CompileBindingSyncExpressionOptions,
): CompiledScriptArtifact {
  const writer = new CompiledScriptCodeWriter(sourceId);
  const context = createCompilerContext(sourceId);
  writer.write("return ");
  emitExpression(writer, expr, context);
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
  context: CompilerContext,
): void {
  switch (expr.type) {
    case T_LITERAL:
      writer.write(literalToJs(expr.value), expr);
      return;
    case T_IDENTIFIER:
      emitIdentifier(writer, expr, context);
      return;
    case T_MEMBER_ACCESS_EXPRESSION:
      emitMemberExpression(writer, expr, context);
      return;
    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
      emitCalculatedMemberExpression(writer, expr, context);
      return;
    case T_UNARY_EXPRESSION:
      emitUnaryExpression(writer, expr, context);
      return;
    case T_BINARY_EXPRESSION:
      emitBinaryExpression(writer, expr, context);
      return;
    case T_CONDITIONAL_EXPRESSION:
      emitConditionalExpression(writer, expr, context);
      return;
    case T_SEQUENCE_EXPRESSION:
      emitSequenceExpression(writer, expr, context);
      return;
    case T_ARRAY_LITERAL:
      emitArrayLiteral(writer, expr, context);
      return;
    case T_OBJECT_LITERAL:
      emitObjectLiteral(writer, expr, context);
      return;
    case T_TEMPLATE_LITERAL_EXPRESSION:
      emitTemplateLiteral(writer, expr, context);
      return;
    case T_FUNCTION_INVOCATION_EXPRESSION:
      emitFunctionInvocation(writer, expr, context);
      return;
    case T_ARROW_EXPRESSION:
      emitArrowExpression(writer, expr, context);
      return;
    default:
      throwUnsupportedCompiledScriptNode(expr, context.sourceId);
  }
}

function emitIdentifier(
  writer: CompiledScriptCodeWriter,
  expr: Identifier,
  context: CompilerContext,
): void {
  if (context.locals.has(expr.name)) {
    assertJsIdentifier(expr, context.sourceId);
    writer.write(expr.name, expr);
    return;
  }
  writer.write(`runtime.id(${JSON.stringify(expr.name)}, evalContext, thread)`, expr);
}

function emitMemberExpression(
  writer: CompiledScriptCodeWriter,
  expr: MemberAccessExpression,
  context: CompilerContext,
): void {
  writer.write("runtime.member(");
  emitExpression(writer, expr.obj, context);
  writer.write(`, ${JSON.stringify(expr.member)}, evalContext)`, expr);
}

function emitCalculatedMemberExpression(
  writer: CompiledScriptCodeWriter,
  expr: CalculatedMemberAccessExpression,
  context: CompilerContext,
): void {
  writer.write("runtime.member(");
  emitExpression(writer, expr.obj, context);
  writer.write(", ");
  emitExpression(writer, expr.member, context);
  writer.write(", evalContext)", expr);
}

function emitUnaryExpression(
  writer: CompiledScriptCodeWriter,
  expr: UnaryExpression,
  context: CompilerContext,
): void {
  if (expr.op === "delete") {
    throwUnsupportedCompiledScriptNode(expr, context.sourceId);
  }
  writer.write(`(${expr.op} `);
  emitExpression(writer, expr.expr, context);
  writer.write(")", expr);
}

function emitBinaryExpression(
  writer: CompiledScriptCodeWriter,
  expr: BinaryExpression,
  context: CompilerContext,
): void {
  writer.write("(");
  emitExpression(writer, expr.left, context);
  writer.write(` ${expr.op} `);
  emitExpression(writer, expr.right, context);
  writer.write(")", expr);
}

function emitConditionalExpression(
  writer: CompiledScriptCodeWriter,
  expr: ConditionalExpression,
  context: CompilerContext,
): void {
  writer.write("(");
  emitExpression(writer, expr.cond, context);
  writer.write(" ? ");
  emitExpression(writer, expr.thenE, context);
  writer.write(" : ");
  emitExpression(writer, expr.elseE, context);
  writer.write(")", expr);
}

function emitSequenceExpression(
  writer: CompiledScriptCodeWriter,
  expr: SequenceExpression,
  context: CompilerContext,
): void {
  if (!expr.exprs || expr.exprs.length === 0) {
    throw new Error("Missing expression sequence");
  }
  writer.write("(");
  expr.exprs.forEach((item, index) => {
    if (index > 0) writer.write(", ");
    emitExpression(writer, item, context);
  });
  writer.write(")", expr);
}

function emitArrayLiteral(
  writer: CompiledScriptCodeWriter,
  expr: ArrayLiteral,
  context: CompilerContext,
): void {
  writer.write("[");
  expr.items.forEach((item, index) => {
    if (index > 0) writer.write(", ");
    if (item.type === T_SPREAD_EXPRESSION) {
      writer.write("...");
      emitExpression(writer, item.expr, context);
    } else {
      emitExpression(writer, item, context);
    }
  });
  writer.write("]", expr);
}

function emitObjectLiteral(
  writer: CompiledScriptCodeWriter,
  expr: ObjectLiteral,
  context: CompilerContext,
): void {
  writer.write("({");
  expr.props.forEach((prop, index) => {
    if (index > 0) writer.write(", ");
    if (!Array.isArray(prop) && !("kind" in prop)) {
      writer.write("...");
      emitExpression(writer, prop.expr, context);
      return;
    }
    if (!Array.isArray(prop)) {
      throwUnsupportedCompiledScriptNode(prop.value, context.sourceId);
    }
    emitObjectLiteralProp(writer, prop, context);
  });
  writer.write("})", expr);
}

function emitObjectLiteralProp(
  writer: CompiledScriptCodeWriter,
  prop: ObjectLiteralProp,
  context: CompilerContext,
): void {
  writer.write("[");
  if (prop[0].type === T_IDENTIFIER) {
    writer.write(JSON.stringify(prop[0].name), prop[0]);
  } else {
    emitExpression(writer, prop[0], context);
  }
  writer.write("]: ");
  emitExpression(writer, prop[1], context);
}

function emitTemplateLiteral(
  writer: CompiledScriptCodeWriter,
  expr: TemplateLiteralExpression,
  context: CompilerContext,
): void {
  writer.write("[");
  expr.segments.forEach((segment, index) => {
    if (index > 0) writer.write(", ");
    emitExpression(writer, segment, context);
  });
  writer.write("].map((value) => typeof value === 'string' ? value : `${value}`).join('')", expr);
}

function emitFunctionInvocation(
  writer: CompiledScriptCodeWriter,
  expr: FunctionInvocationExpression,
  context: CompilerContext,
): void {
  if (expr.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
    const receiverName = context.nextTemp();
    const updateRootName = getNonLocalRootIdentifier(expr.obj.obj, context);
    writer.write("(() => { const ");
    writer.write(receiverName);
    writer.write(" = ");
    emitExpression(writer, expr.obj.obj, context);
    writer.write("; return runtime.call(runtime.member(");
    writer.write(receiverName);
    writer.write(`, ${JSON.stringify(expr.obj.member)}, evalContext), `);
    writer.write(receiverName);
    writer.write(", ");
    emitArgumentArray(writer, expr.arguments, context);
    writer.write(", evalContext, thread");
    if (updateRootName) {
      writer.write(`, ${JSON.stringify(updateRootName)}`);
    }
    writer.write("); })()", expr);
    return;
  }

  const updateRootName = getNonLocalRootIdentifier(expr.obj, context);
  writer.write("runtime.call(");
  emitExpression(writer, expr.obj, context);
  writer.write(", evalContext.localContext, ");
  emitArgumentArray(writer, expr.arguments, context);
  writer.write(", evalContext, thread");
  if (updateRootName) {
    writer.write(`, ${JSON.stringify(updateRootName)}`);
  }
  writer.write(")", expr);
}

function emitArgumentArray(
  writer: CompiledScriptCodeWriter,
  args: Expression[],
  context: CompilerContext,
): void {
  writer.write("[");
  args.forEach((arg, index) => {
    if (index > 0) writer.write(", ");
    if (arg.type === T_SPREAD_EXPRESSION) {
      writer.write("...");
      emitExpression(writer, arg.expr, context);
    } else {
      emitExpression(writer, arg, context);
    }
  });
  writer.write("]");
}

function emitArrowExpression(
  writer: CompiledScriptCodeWriter,
  expr: ArrowExpression,
  context: CompilerContext,
): void {
  if (expr.async) {
    throwUnsupportedCompiledScriptNode(expr, context.sourceId);
  }
  const argNames = expr.args.map((arg) => getArrowArgName(arg, context.sourceId));
  const arrowContext = extendCompilerContext(context, argNames);

  writer.write("((");
  writer.write(argNames.join(", "));
  writer.write(") => ");
  emitArrowBody(writer, expr, arrowContext);
  writer.write(")", expr);
}

function emitArrowBody(
  writer: CompiledScriptCodeWriter,
  expr: ArrowExpression,
  context: CompilerContext,
): void {
  switch (expr.statement.type) {
    case T_EMPTY_STATEMENT:
      writer.write("{ return undefined; }", expr.statement);
      return;
    case T_EXPRESSION_STATEMENT:
      writer.write("{ return ");
      emitExpression(writer, expr.statement.expr, context);
      writer.write("; }", expr.statement);
      return;
    case T_BLOCK_STATEMENT:
      emitBlockStatement(writer, expr.statement, context);
      return;
    default:
      throwUnsupportedCompiledScriptNode(expr.statement, context.sourceId);
  }
}

function emitBlockStatement(
  writer: CompiledScriptCodeWriter,
  stmt: BlockStatement,
  context: CompilerContext,
): void {
  const blockContext = extendCompilerContext(context, collectBlockLocalNames(stmt));
  writer.write("{", stmt);
  stmt.stmts.forEach((child) => emitStatement(writer, child, blockContext));
  writer.write("}", stmt);
}

function emitStatement(
  writer: CompiledScriptCodeWriter,
  stmt: Statement,
  context: CompilerContext,
): void {
  switch (stmt.type) {
    case T_EMPTY_STATEMENT:
      writer.write(";", stmt);
      return;
    case T_EXPRESSION_STATEMENT:
      emitExpression(writer, stmt.expr, context);
      writer.write(";", stmt);
      return;
    case T_RETURN_STATEMENT:
      emitReturnStatement(writer, stmt, context);
      return;
    case T_LET_STATEMENT:
      emitDeclarationStatement(writer, "let", stmt, context);
      return;
    case T_CONST_STATEMENT:
      emitDeclarationStatement(writer, "const", stmt, context);
      return;
    case T_BLOCK_STATEMENT:
      emitBlockStatement(writer, stmt, context);
      return;
    default:
      throwUnsupportedCompiledScriptNode(stmt, context.sourceId);
  }
}

function emitReturnStatement(
  writer: CompiledScriptCodeWriter,
  stmt: ReturnStatement,
  context: CompilerContext,
): void {
  writer.write("return ", stmt);
  if (stmt.expr) {
    emitExpression(writer, stmt.expr, context);
  } else {
    writer.write("undefined");
  }
  writer.write(";", stmt);
}

function emitDeclarationStatement(
  writer: CompiledScriptCodeWriter,
  keyword: "let" | "const",
  stmt: LetStatement | ConstStatement,
  context: CompilerContext,
): void {
  writer.write(`${keyword} `, stmt);
  stmt.decls.forEach((decl, index) => {
    if (index > 0) writer.write(", ");
    emitVarDeclaration(writer, decl, context);
  });
  writer.write(";", stmt);
}

function emitVarDeclaration(
  writer: CompiledScriptCodeWriter,
  decl: VarDeclaration,
  context: CompilerContext,
): void {
  if (!decl.id || decl.aDestr || decl.oDestr) {
    throwUnsupportedCompiledScriptNode(decl, context.sourceId);
  }
  assertJsIdentifier({ type: T_IDENTIFIER, nodeId: decl.nodeId, name: decl.id }, context.sourceId);
  writer.write(decl.id, decl);
  if (decl.expr) {
    writer.write(" = ");
    emitExpression(writer, decl.expr, context);
  }
}

function collectBlockLocalNames(stmt: BlockStatement): string[] {
  const names: string[] = [];
  stmt.stmts.forEach((child) => {
    if (child.type === T_LET_STATEMENT || child.type === T_CONST_STATEMENT) {
      child.decls.forEach((decl) => {
        if (decl.id && !decl.aDestr && !decl.oDestr) {
          names.push(decl.id);
        }
      });
    }
  });
  return names;
}

function getArrowArgName(expr: Expression, sourceId: string): string {
  if (expr.type !== T_IDENTIFIER) {
    throwUnsupportedCompiledScriptNode(expr, sourceId);
  }
  assertJsIdentifier(expr, sourceId);
  return expr.name;
}

function getNonLocalRootIdentifier(expr: Expression, context: CompilerContext): string | undefined {
  switch (expr.type) {
    case T_IDENTIFIER:
      return context.locals.has(expr.name) ? undefined : expr.name;
    case T_MEMBER_ACCESS_EXPRESSION:
    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION:
      return getNonLocalRootIdentifier(expr.obj, context);
    default:
      return undefined;
  }
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

function createCompilerContext(sourceId: string): CompilerContext {
  let tempIndex = 0;
  return {
    sourceId,
    locals: new Set(),
    nextTemp() {
      return `__xmlui_obj_${++tempIndex}`;
    },
  };
}

function extendCompilerContext(parent: CompilerContext, locals: string[]): CompilerContext {
  return {
    ...parent,
    locals: new Set([...parent.locals, ...locals]),
  };
}

function assertJsIdentifier(expr: Identifier, sourceId: string): void {
  if (!/^[$A-Z_a-z][$\w]*$/.test(expr.name)) {
    throwUnsupportedCompiledScriptNode(expr, sourceId);
  }
}
