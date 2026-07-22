import { Parser } from "../../../parsers/scripting/Parser";
import {
  T_ASSIGNMENT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONST_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_UNARY_EXPRESSION,
  type AssignmentExpression,
  type BinaryExpression,
  type BlockStatement,
  type CalculatedMemberAccessExpression,
  type ConstStatement,
  type Expression,
  type FunctionInvocationExpression,
  type Identifier,
  type IfStatement,
  type LetStatement,
  type MemberAccessExpression,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type ReturnStatement,
  type Statement,
  type UnaryExpression,
  type VarDeclaration,
} from "../../script-runner/ScriptingSourceTree";
import { createCompiledScriptArtifact } from "../artifact";
import { CompiledScriptCodeWriter } from "../code-writer";
import { throwUnsupportedCompiledScriptNode } from "../errors";
import { sourceRangeFromNode } from "../source";
import type { CompiledScriptArtifact, CompiledScriptSourceRange } from "../types";

export type CompileEventAsyncStatementsOptions = {
  sourceId: string;
  sourceText?: string;
};

type CompilerContext = {
  sourceId: string;
  locals: Set<string>;
  nextTemp(): string;
};

export function compileEventAsyncStatements(
  statements: Statement[],
  { sourceId, sourceText }: CompileEventAsyncStatementsOptions,
): CompiledScriptArtifact {
  const writer = new CompiledScriptCodeWriter(sourceId);
  const sourceRange = sourceRangeFromStatements(statements);
  const context = extendCompilerContext(createCompilerContext(sourceId), collectLocalNames(statements));

  writer.write("return (async () => {");
  writer.write("await runtime.start(evalContext, thread);");
  statements.forEach((statement) => emitStatement(writer, statement, context));
  writer.write("return undefined;");
  writer.write("})();");

  return createCompiledScriptArtifact({
    target: "event-async",
    sourceId,
    sourceText,
    sourceRange,
    astNodeId: statements[0]?.nodeId,
    js: writer.toString(),
    mappings: writer.getMappings(),
  });
}

export function compileEventAsyncStatementSource(
  sourceText: string,
  sourceId: string,
): CompiledScriptArtifact {
  const parser = new Parser(sourceText);
  const statements = parser.parseStatements();
  return compileEventAsyncStatements(statements, { sourceId, sourceText });
}

function emitStatement(
  writer: CompiledScriptCodeWriter,
  statement: Statement,
  context: CompilerContext,
): void {
  writer.write("await runtime.beforeStatement(evalContext);", statement);
  switch (statement.type) {
    case T_EMPTY_STATEMENT:
      writer.write(";", statement);
      emitAfterStatement(writer, statement);
      return;
    case T_EXPRESSION_STATEMENT:
      writer.write("await runtime.complete(", statement);
      emitEventExpressionStatementExpression(writer, statement.expr, context);
      writer.write(");", statement);
      emitAfterStatement(writer, statement);
      return;
    case T_RETURN_STATEMENT:
      emitReturnStatement(writer, statement, context);
      return;
    case T_LET_STATEMENT:
      emitDeclarationStatement(writer, "let", statement, context);
      emitAfterStatement(writer, statement);
      return;
    case T_CONST_STATEMENT:
      emitDeclarationStatement(writer, "const", statement, context);
      emitAfterStatement(writer, statement);
      return;
    case T_BLOCK_STATEMENT:
      emitBlockStatement(writer, statement, context);
      return;
    case T_IF_STATEMENT:
      emitIfStatement(writer, statement, context);
      return;
    default:
      throwUnsupportedCompiledScriptNode(statement, context.sourceId);
  }
}

function emitEventExpressionStatementExpression(
  writer: CompiledScriptCodeWriter,
  expr: Expression,
  context: CompilerContext,
): void {
  if (expr.type === T_IDENTIFIER || isMemberExpressionChain(expr)) {
    const updateRootName = getNonLocalRootIdentifier(expr, context);
    writer.write("await runtime.call(await runtime.complete(");
    emitExpression(writer, expr, context);
    writer.write("), evalContext.localContext, evalContext.eventArgs ?? [], evalContext, thread");
    if (updateRootName) {
      writer.write(`, ${JSON.stringify(updateRootName)}`);
    }
    writer.write(")", expr);
    return;
  }
  emitExpression(writer, expr, context);
}

function emitAfterStatement(writer: CompiledScriptCodeWriter, statement: Statement): void {
  writer.write("await runtime.afterStatement(evalContext);", statement);
}

function emitReturnStatement(
  writer: CompiledScriptCodeWriter,
  statement: ReturnStatement,
  context: CompilerContext,
): void {
  const returnName = context.nextTemp();
  writer.write(`const ${returnName} = `, statement);
  if (statement.expr) {
    writer.write("await runtime.complete(");
    emitExpression(writer, statement.expr, context);
    writer.write(")");
  } else {
    writer.write("undefined");
  }
  writer.write(";", statement);
  emitAfterStatement(writer, statement);
  writer.write(`return ${returnName};`, statement);
}

function emitDeclarationStatement(
  writer: CompiledScriptCodeWriter,
  keyword: "let" | "const",
  statement: LetStatement | ConstStatement,
  context: CompilerContext,
): void {
  writer.write(`${keyword} `, statement);
  statement.decls.forEach((decl, index) => {
    if (index > 0) writer.write(", ");
    emitVarDeclaration(writer, decl, context);
  });
  writer.write(";", statement);
}

function emitVarDeclaration(
  writer: CompiledScriptCodeWriter,
  decl: VarDeclaration,
  context: CompilerContext,
): void {
  if (!decl.id || decl.aDestr || decl.oDestr) {
    throwUnsupportedCompiledScriptNode(decl, context.sourceId);
  }
  assertJsIdentifier({ name: decl.id }, context.sourceId);
  writer.write(decl.id, decl);
  if (decl.expr) {
    writer.write(" = await runtime.complete(");
    emitExpression(writer, decl.expr, context);
    writer.write(")");
  }
}

function emitBlockStatement(
  writer: CompiledScriptCodeWriter,
  statement: BlockStatement,
  context: CompilerContext,
): void {
  const blockContext = extendCompilerContext(context, collectLocalNames(statement.stmts));
  emitAfterStatement(writer, statement);
  writer.write("{", statement);
  statement.stmts.forEach((child) => emitStatement(writer, child, blockContext));
  writer.write("}", statement);
}

function emitIfStatement(
  writer: CompiledScriptCodeWriter,
  statement: IfStatement,
  context: CompilerContext,
): void {
  const condName = context.nextTemp();
  writer.write(`const ${condName} = await runtime.complete(`, statement);
  emitExpression(writer, statement.cond, context);
  writer.write(");", statement);
  emitAfterStatement(writer, statement);
  writer.write(`if (${condName}) {`, statement);
  emitStatement(writer, statement.thenB, context);
  writer.write("}", statement);
  if (statement.elseB) {
    writer.write(" else {", statement);
    emitStatement(writer, statement.elseB, context);
    writer.write("}", statement);
  }
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
    case T_FUNCTION_INVOCATION_EXPRESSION:
      emitFunctionInvocation(writer, expr, context);
      return;
    case T_ASSIGNMENT_EXPRESSION:
      emitAssignmentExpression(writer, expr, context);
      return;
    case T_PREFIX_OP_EXPRESSION:
    case T_POSTFIX_OP_EXPRESSION:
      emitPrePostExpression(writer, expr, context);
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
  if (!context.locals.has(expr.name)) {
    switch (expr.name) {
      case "NaN":
      case "Infinity":
      case "undefined":
        writer.write(expr.name, expr);
        return;
    }
  }
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
  writer.write("runtime.member(await runtime.complete(");
  emitExpression(writer, expr.obj, context);
  writer.write(`), ${JSON.stringify(expr.member)}, evalContext)`, expr);
}

function emitCalculatedMemberExpression(
  writer: CompiledScriptCodeWriter,
  expr: CalculatedMemberAccessExpression,
  context: CompilerContext,
): void {
  writer.write("runtime.member(await runtime.complete(");
  emitExpression(writer, expr.obj, context);
  writer.write("), await runtime.complete(");
  emitExpression(writer, expr.member, context);
  writer.write("), evalContext)", expr);
}

function emitUnaryExpression(
  writer: CompiledScriptCodeWriter,
  expr: UnaryExpression,
  context: CompilerContext,
): void {
  writer.write(`(${expr.op} await runtime.complete(`);
  emitExpression(writer, expr.expr, context);
  writer.write("))", expr);
}

function emitBinaryExpression(
  writer: CompiledScriptCodeWriter,
  expr: BinaryExpression,
  context: CompilerContext,
): void {
  writer.write("(await runtime.complete(");
  emitExpression(writer, expr.left, context);
  writer.write(`) ${expr.op} await runtime.complete(`);
  emitExpression(writer, expr.right, context);
  writer.write("))", expr);
}

function emitFunctionInvocation(
  writer: CompiledScriptCodeWriter,
  expr: FunctionInvocationExpression,
  context: CompilerContext,
): void {
  if (expr.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
    const receiverName = context.nextTemp();
    const updateRootName = getNonLocalRootIdentifier(expr.obj.obj, context);
    writer.write("(async () => { const ");
    writer.write(receiverName);
    writer.write(" = await runtime.complete(");
    emitExpression(writer, expr.obj.obj, context);
    writer.write("); return await runtime.call(runtime.member(");
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
  writer.write("await runtime.call(await runtime.complete(");
  emitExpression(writer, expr.obj, context);
  writer.write("), evalContext.localContext, ");
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
    writer.write("await runtime.complete(");
    emitExpression(writer, arg, context);
    writer.write(")");
  });
  writer.write("]");
}

function emitAssignmentExpression(
  writer: CompiledScriptCodeWriter,
  expr: AssignmentExpression,
  context: CompilerContext,
): void {
  emitWriteExpression(writer, expr.leftValue, context, (writeTarget) => {
    if (writeTarget.kind === "local-id") {
      writer.write(`(${writeTarget.name} ${expr.op} await runtime.complete(`);
      emitExpression(writer, expr.expr, context);
      writer.write("))", expr);
      return;
    }
    writer.write(
      writeTarget.kind === "id"
        ? `runtime.assignId(${JSON.stringify(writeTarget.name)}, ${JSON.stringify(expr.op)}, await runtime.complete(`
        : "runtime.assignMember(",
    );
    if (writeTarget.kind === "member") {
      writer.write(writeTarget.objName);
      writer.write(", ");
      writer.write(writeTarget.memberName);
      writer.write(`, ${JSON.stringify(expr.op)}, await runtime.complete(`);
    }
    emitExpression(writer, expr.expr, context);
    writer.write("), evalContext, thread");
    if (writeTarget.kind === "member" && writeTarget.rootName) {
      writer.write(`, ${JSON.stringify(writeTarget.rootName)}`);
    }
    writer.write(")", expr);
  });
}

function emitPrePostExpression(
  writer: CompiledScriptCodeWriter,
  expr: PrefixOpExpression | PostfixOpExpression,
  context: CompilerContext,
): void {
  const prefix = expr.type === T_PREFIX_OP_EXPRESSION;
  emitWriteExpression(writer, expr.expr, context, (writeTarget) => {
    if (writeTarget.kind === "local-id") {
      writer.write(prefix ? `${expr.op}${writeTarget.name}` : `${writeTarget.name}${expr.op}`, expr);
      return;
    }
    writer.write(
      writeTarget.kind === "id"
        ? `runtime.prePostId(${JSON.stringify(writeTarget.name)}, ${JSON.stringify(expr.op)}, ${prefix}, evalContext, thread)`
        : `runtime.prePostMember(${writeTarget.objName}, ${writeTarget.memberName}, ${JSON.stringify(expr.op)}, ${prefix}, evalContext, thread${
            writeTarget.rootName ? `, ${JSON.stringify(writeTarget.rootName)}` : ""
          })`,
      expr,
    );
  });
}

type WriteTarget =
  | { kind: "local-id"; name: string }
  | { kind: "id"; name: string }
  | { kind: "member"; objName: string; memberName: string; rootName?: string };

function emitWriteExpression(
  writer: CompiledScriptCodeWriter,
  expr: Expression,
  context: CompilerContext,
  emit: (writeTarget: WriteTarget) => void,
): void {
  if (expr.type === T_IDENTIFIER) {
    if (context.locals.has(expr.name)) {
      assertJsIdentifier(expr, context.sourceId);
      emit({ kind: "local-id", name: expr.name });
    } else {
      emit({ kind: "id", name: expr.name });
    }
    return;
  }
  if (expr.type === T_MEMBER_ACCESS_EXPRESSION) {
    const objName = context.nextTemp();
    const rootName = getNonLocalRootIdentifier(expr.obj, context);
    writer.write("(async () => { const ");
    writer.write(objName);
    writer.write(" = await runtime.complete(");
    emitExpression(writer, expr.obj, context);
    writer.write("); return ");
    emit({
      kind: "member",
      objName,
      memberName: JSON.stringify(expr.member),
      rootName,
    });
    writer.write("; })()", expr);
    return;
  }
  if (expr.type === T_CALCULATED_MEMBER_ACCESS_EXPRESSION) {
    const objName = context.nextTemp();
    const memberName = context.nextTemp();
    const rootName = getNonLocalRootIdentifier(expr.obj, context);
    writer.write("(async () => { const ");
    writer.write(objName);
    writer.write(" = await runtime.complete(");
    emitExpression(writer, expr.obj, context);
    writer.write("); const ");
    writer.write(memberName);
    writer.write(" = await runtime.complete(");
    emitExpression(writer, expr.member, context);
    writer.write("); return ");
    emit({ kind: "member", objName, memberName, rootName });
    writer.write("; })()", expr);
    return;
  }
  throwUnsupportedCompiledScriptNode(expr, context.sourceId);
}

function collectLocalNames(statements: Statement[]): string[] {
  return statements.flatMap((statement) => {
    switch (statement.type) {
      case T_LET_STATEMENT:
      case T_CONST_STATEMENT:
        return collectDeclarationNames(statement.decls);
      default:
        return [];
    }
  });
}

function collectDeclarationNames(decls: VarDeclaration[]): string[] {
  return decls.flatMap((decl) => (decl.id ? [decl.id] : []));
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

function isMemberExpressionChain(expr: Expression): boolean {
  return (
    (expr.type === T_MEMBER_ACCESS_EXPRESSION ||
      (expr.type === T_CALCULATED_MEMBER_ACCESS_EXPRESSION && expr.member.type === T_LITERAL)) &&
    (isMemberExpressionChain(expr.obj) || expr.obj.type === T_IDENTIFIER)
  );
}

function createCompilerContext(sourceId: string): CompilerContext {
  let tempIndex = 0;
  return {
    sourceId,
    locals: new Set(),
    nextTemp: () => `__xmlui_evt_${tempIndex++}`,
  };
}

function extendCompilerContext(context: CompilerContext, localNames: string[]): CompilerContext {
  return {
    ...context,
    locals: new Set([...context.locals, ...localNames]),
  };
}

function literalToJs(value: any): string {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "number":
      if (Number.isNaN(value)) return "NaN";
      if (value === Infinity) return "Infinity";
      if (value === -Infinity) return "-Infinity";
      return JSON.stringify(value);
    case "bigint":
      return `${value.toString()}n`;
    case "boolean":
      return value ? "true" : "false";
    case "undefined":
      return "undefined";
    default:
      if (value === null) return "null";
      return JSON.stringify(value);
  }
}

function assertJsIdentifier(expr: Pick<Identifier, "name">, sourceId: string): void {
  if (!/^[$A-Z_a-z][$\w]*$/.test(expr.name)) {
    throw new Error(`Cannot compile identifier '${expr.name}' in '${sourceId}'.`);
  }
}

function sourceRangeFromStatements(
  statements: Statement[],
): CompiledScriptSourceRange | undefined {
  if (statements.length === 0) {
    return undefined;
  }
  const first = statements[0];
  const last = statements[statements.length - 1];
  return sourceRangeFromNode({
    startToken: first.startToken,
    endToken: last.endToken,
  });
}
