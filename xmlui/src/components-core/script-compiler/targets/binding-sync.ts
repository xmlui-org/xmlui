import { Parser } from "../../../parsers/scripting/Parser";
import {
  T_ARRAY_LITERAL,
  T_ASSIGNMENT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_BREAK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONTINUE_STATEMENT,
  T_CONDITIONAL_EXPRESSION,
  T_DO_WHILE_STATEMENT,
  T_BLOCK_STATEMENT,
  T_CONST_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_FOR_STATEMENT,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_ARROW_EXPRESSION,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_OBJECT_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_SEQUENCE_EXPRESSION,
  T_SPREAD_EXPRESSION,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_THROW_STATEMENT,
  T_UNARY_EXPRESSION,
  T_WHILE_STATEMENT,
  type ArrayLiteral,
  type AssignmentExpression,
  type ArrowExpression,
  type BinaryExpression,
  type BlockStatement,
  type BreakStatement,
  type CalculatedMemberAccessExpression,
  type ConditionalExpression,
  type ContinueStatement,
  type ConstStatement,
  type DoWhileStatement,
  type Expression,
  type ForInStatement,
  type ForOfStatement,
  type ForStatement,
  type FunctionInvocationExpression,
  type Identifier,
  type IfStatement,
  type LetStatement,
  type MemberAccessExpression,
  type ObjectLiteral,
  type ObjectLiteralProp,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type ReturnStatement,
  type SequenceExpression,
  type Statement,
  type TemplateLiteralExpression,
  type ThrowStatement,
  type UnaryExpression,
  type VarDeclaration,
  type WhileStatement,
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
  writer.write("runtime.start(evalContext);");
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
    emitDeleteExpression(writer, expr.expr, context);
    return;
  }
  writer.write(`(${expr.op} `);
  emitExpression(writer, expr.expr, context);
  writer.write(")", expr);
}

function emitAssignmentExpression(
  writer: CompiledScriptCodeWriter,
  expr: AssignmentExpression,
  context: CompilerContext,
): void {
  emitWriteExpression(writer, expr.leftValue, context, (writeTarget) => {
    if (writeTarget.kind === "local-id") {
      writer.write(`(${writeTarget.name} ${expr.op} `);
      emitExpression(writer, expr.expr, context);
      writer.write(")", expr);
      return;
    }
    writer.write(
      writeTarget.kind === "id"
        ? `runtime.assignId(${JSON.stringify(writeTarget.name)}, ${JSON.stringify(expr.op)}, `
        : "runtime.assignMember(",
    );
    if (writeTarget.kind === "member") {
      writer.write(writeTarget.objName);
      writer.write(", ");
      writer.write(writeTarget.memberName);
      writer.write(`, ${JSON.stringify(expr.op)}, `);
    }
    emitExpression(writer, expr.expr, context);
    writer.write(", evalContext, thread");
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

function emitDeleteExpression(
  writer: CompiledScriptCodeWriter,
  expr: Expression,
  context: CompilerContext,
): void {
  emitWriteExpression(writer, expr, context, (writeTarget) => {
    if (writeTarget.kind !== "member") {
      throwUnsupportedCompiledScriptNode(expr, context.sourceId);
    }
    writer.write(
      `runtime.deleteMember(${writeTarget.objName}, ${writeTarget.memberName}, evalContext, thread${
        writeTarget.rootName ? `, ${JSON.stringify(writeTarget.rootName)}` : ""
      })`,
      expr,
    );
  });
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
      writer.write("{ runtime.checkTimeout(evalContext); ");
      const blockContext = extendCompilerContext(context, collectBlockLocalNames(expr.statement));
      expr.statement.stmts.forEach((child) => emitStatement(writer, child, blockContext));
      writer.write("}", expr.statement);
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
  writer.write("runtime.checkTimeout(evalContext);", stmt);
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
    case T_IF_STATEMENT:
      emitIfStatement(writer, stmt, context);
      return;
    case T_THROW_STATEMENT:
      emitThrowStatement(writer, stmt, context);
      return;
    case T_WHILE_STATEMENT:
      emitWhileStatement(writer, stmt, context);
      return;
    case T_DO_WHILE_STATEMENT:
      emitDoWhileStatement(writer, stmt, context);
      return;
    case T_FOR_STATEMENT:
      emitForStatement(writer, stmt, context);
      return;
    case T_FOR_OF_STATEMENT:
      emitForOfStatement(writer, stmt, context);
      return;
    case T_FOR_IN_STATEMENT:
      emitForInStatement(writer, stmt, context);
      return;
    case T_BREAK_STATEMENT:
      writer.write("break;", stmt as BreakStatement);
      return;
    case T_CONTINUE_STATEMENT:
      writer.write("continue;", stmt as ContinueStatement);
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

function emitIfStatement(
  writer: CompiledScriptCodeWriter,
  stmt: IfStatement,
  context: CompilerContext,
): void {
  writer.write("if (", stmt);
  emitExpression(writer, stmt.cond, context);
  writer.write(")");
  emitStatementAsBody(writer, stmt.thenB, context);
  if (stmt.elseB) {
    writer.write(" else ");
    emitStatementAsBody(writer, stmt.elseB, context);
  }
}

function emitThrowStatement(
  writer: CompiledScriptCodeWriter,
  stmt: ThrowStatement,
  context: CompilerContext,
): void {
  writer.write("throw ", stmt);
  emitExpression(writer, stmt.expr, context);
  writer.write(";", stmt);
}

function emitWhileStatement(
  writer: CompiledScriptCodeWriter,
  stmt: WhileStatement,
  context: CompilerContext,
): void {
  writer.write("while (", stmt);
  emitExpression(writer, stmt.cond, context);
  writer.write(") { runtime.checkTimeout(evalContext);");
  emitStatement(writer, stmt.body, context);
  writer.write("}", stmt);
}

function emitDoWhileStatement(
  writer: CompiledScriptCodeWriter,
  stmt: DoWhileStatement,
  context: CompilerContext,
): void {
  writer.write("do { runtime.checkTimeout(evalContext);", stmt);
  emitStatement(writer, stmt.body, context);
  writer.write("} while (");
  emitExpression(writer, stmt.cond, context);
  writer.write(");", stmt);
}

function emitForStatement(
  writer: CompiledScriptCodeWriter,
  stmt: ForStatement,
  context: CompilerContext,
): void {
  const loopContext = extendCompilerContext(
    context,
    stmt.init?.type === T_LET_STATEMENT ? collectDeclarationNames(stmt.init.decls) : [],
  );
  writer.write("for (", stmt);
  emitForInit(writer, stmt.init, loopContext);
  writer.write("; ");
  if (stmt.cond) {
    emitExpression(writer, stmt.cond, loopContext);
  }
  writer.write("; ");
  if (stmt.upd) {
    emitExpression(writer, stmt.upd, loopContext);
  }
  writer.write(") { runtime.checkTimeout(evalContext);");
  emitStatement(writer, stmt.body, loopContext);
  writer.write("}", stmt);
}

function emitForOfStatement(
  writer: CompiledScriptCodeWriter,
  stmt: ForOfStatement,
  context: CompilerContext,
): void {
  emitForEachStatement(writer, "of", stmt, context);
}

function emitForInStatement(
  writer: CompiledScriptCodeWriter,
  stmt: ForInStatement,
  context: CompilerContext,
): void {
  emitForEachStatement(writer, "in", stmt, context);
}

function emitForEachStatement(
  writer: CompiledScriptCodeWriter,
  op: "of" | "in",
  stmt: ForOfStatement | ForInStatement,
  context: CompilerContext,
): void {
  assertJsIdentifier(stmt.id, context.sourceId);
  const localBinding = stmt.varB === "let" || stmt.varB === "const";
  const loopContext = localBinding ? extendCompilerContext(context, [stmt.id.name]) : context;
  writer.write("for (", stmt);
  if (localBinding) {
    writer.write(`${stmt.varB} ${stmt.id.name} ${op} `);
    emitExpression(writer, stmt.expr, context);
    writer.write(") { runtime.checkTimeout(evalContext);");
    emitStatement(writer, stmt.body, loopContext);
    writer.write("}", stmt);
    return;
  }
  const itemName = context.nextTemp();
  writer.write(`const ${itemName} ${op} `);
  emitExpression(writer, stmt.expr, context);
  writer.write(`) { runtime.checkTimeout(evalContext);runtime.assignId(${JSON.stringify(stmt.id.name)}, "=", ${itemName}, evalContext, thread);`);
  emitStatement(writer, stmt.body, loopContext);
  writer.write("}", stmt);
}

function emitForInit(
  writer: CompiledScriptCodeWriter,
  init: ForStatement["init"],
  context: CompilerContext,
): void {
  if (!init) return;
  if (init.type === T_EXPRESSION_STATEMENT) {
    emitExpression(writer, init.expr, context);
    return;
  }
  if (init.type === T_LET_STATEMENT) {
    writer.write("let ");
    init.decls.forEach((decl, index) => {
      if (index > 0) writer.write(", ");
      emitVarDeclaration(writer, decl, context);
    });
    return;
  }
  throwUnsupportedCompiledScriptNode(init, context.sourceId);
}

function emitStatementAsBody(
  writer: CompiledScriptCodeWriter,
  stmt: Statement,
  context: CompilerContext,
): void {
  if (stmt.type === T_BLOCK_STATEMENT) {
    emitBlockStatement(writer, stmt, context);
    return;
  }
  writer.write("{");
  emitStatement(writer, stmt, context);
  writer.write("}");
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
      names.push(...collectDeclarationNames(child.decls));
    }
  });
  return names;
}

function collectDeclarationNames(decls: VarDeclaration[]): string[] {
  return decls.flatMap((decl) => (decl.id && !decl.aDestr && !decl.oDestr ? [decl.id] : []));
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

type WriteTarget =
  | { kind: "local-id"; name: string }
  | { kind: "id"; name: string }
  | { kind: "member"; objName: string; memberName: string; rootName?: string };

function emitWriteExpression(
  writer: CompiledScriptCodeWriter,
  expr: Expression,
  context: CompilerContext,
  emitWithTarget: (target: WriteTarget) => void,
): void {
  switch (expr.type) {
    case T_IDENTIFIER:
      emitWithTarget(
        context.locals.has(expr.name)
          ? { kind: "local-id", name: expr.name }
          : { kind: "id", name: expr.name },
      );
      return;
    case T_MEMBER_ACCESS_EXPRESSION: {
      const objName = context.nextTemp();
      writer.write("(() => { const ");
      writer.write(objName);
      writer.write(" = ");
      emitExpression(writer, expr.obj, context);
      writer.write("; return ");
      emitWithTarget({
        kind: "member",
        objName,
        memberName: JSON.stringify(expr.member),
        rootName: getNonLocalRootIdentifier(expr.obj, context),
      });
      writer.write("; })()", expr);
      return;
    }
    case T_CALCULATED_MEMBER_ACCESS_EXPRESSION: {
      const objName = context.nextTemp();
      const memberName = context.nextTemp();
      writer.write("(() => { const ");
      writer.write(objName);
      writer.write(" = ");
      emitExpression(writer, expr.obj, context);
      writer.write("; const ");
      writer.write(memberName);
      writer.write(" = ");
      emitExpression(writer, expr.member, context);
      writer.write("; return ");
      emitWithTarget({
        kind: "member",
        objName,
        memberName,
        rootName: getNonLocalRootIdentifier(expr.obj, context),
      });
      writer.write("; })()", expr);
      return;
    }
    default:
      throwUnsupportedCompiledScriptNode(expr, context.sourceId);
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
