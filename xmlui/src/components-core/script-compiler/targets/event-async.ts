import { Parser } from "../../../parsers/scripting/Parser";
import {
  T_ASSIGNMENT_EXPRESSION,
  T_ARRAY_LITERAL,
  T_BINARY_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_BREAK_STATEMENT,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONST_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FOR_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_OBJECT_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_SPREAD_EXPRESSION,
  T_SWITCH_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_UNARY_EXPRESSION,
  T_VAR_STATEMENT,
  T_WHILE_STATEMENT,
  type AssignmentExpression,
  type ArrayDestructure,
  type ArrayLiteral,
  type BinaryExpression,
  type BlockStatement,
  type BreakStatement,
  type CalculatedMemberAccessExpression,
  type ConstStatement,
  type ContinueStatement,
  type DoWhileStatement,
  type Expression,
  type ExpressionStatement,
  type ForInStatement,
  type ForOfStatement,
  type ForStatement,
  type FunctionDeclaration,
  type FunctionInvocationExpression,
  type Identifier,
  type IfStatement,
  type LetStatement,
  type MemberAccessExpression,
  type ObjectLiteral,
  type ObjectLiteralProp,
  type ObjectDestructure,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type ReturnStatement,
  type Statement,
  type SwitchStatement,
  type ThrowStatement,
  type TryStatement,
  type UnaryExpression,
  type VarStatement,
  type VarDeclaration,
  type WhileStatement,
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
  inFunction: boolean;
  controlLabels: Array<
    | { kind: "loop"; breakLabel: string; continueLabel: string }
    | { kind: "switch"; breakLabel: string }
  >;
  nextTemp(): string;
  nextLabel(prefix: string): string;
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
  switch (statement.type) {
    case T_EMPTY_STATEMENT:
      emitBeforeStatement(writer, statement);
      writer.write(";", statement);
      emitAfterStatement(writer, statement);
      return;
    case T_EXPRESSION_STATEMENT:
      emitExpressionStatement(writer, statement, context, emitEventExpressionStatementExpression);
      return;
    case T_RETURN_STATEMENT:
      emitReturnStatement(writer, statement, context);
      return;
    case T_LET_STATEMENT:
      emitBeforeStatement(writer, statement);
      emitDeclarationStatement(writer, "let", statement, context);
      emitAfterStatement(writer, statement);
      return;
    case T_CONST_STATEMENT:
      emitBeforeStatement(writer, statement);
      emitDeclarationStatement(writer, "const", statement, context);
      emitAfterStatement(writer, statement);
      return;
    case T_VAR_STATEMENT:
      emitVarStatement(writer, statement, context);
      return;
    case T_BLOCK_STATEMENT:
      emitBlockStatement(writer, statement, context);
      return;
    case T_IF_STATEMENT:
      emitIfStatement(writer, statement, context);
      return;
    case T_WHILE_STATEMENT:
      emitWhileStatement(writer, statement, context);
      return;
    case T_DO_WHILE_STATEMENT:
      emitDoWhileStatement(writer, statement, context);
      return;
    case T_FOR_STATEMENT:
      emitForStatement(writer, statement, context);
      return;
    case T_FOR_IN_STATEMENT:
      emitForInStatement(writer, statement, context);
      return;
    case T_FOR_OF_STATEMENT:
      emitForOfStatement(writer, statement, context);
      return;
    case T_FUNCTION_DECLARATION:
      emitFunctionDeclarationStatement(writer, statement, context);
      return;
    case T_BREAK_STATEMENT:
      emitBreakStatement(writer, statement, context);
      return;
    case T_CONTINUE_STATEMENT:
      emitContinueStatement(writer, statement, context);
      return;
    case T_THROW_STATEMENT:
      emitThrowStatement(writer, statement, context);
      return;
    case T_SWITCH_STATEMENT:
      emitSwitchStatement(writer, statement, context);
      return;
    case T_TRY_STATEMENT:
      emitTryStatement(writer, statement, context);
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

function emitExpressionStatement(
  writer: CompiledScriptCodeWriter,
  statement: ExpressionStatement,
  context: CompilerContext,
  emitStatementExpression: (
    writer: CompiledScriptCodeWriter,
    expr: Expression,
    context: CompilerContext,
  ) => void,
): void {
  emitBeforeStatement(writer, statement);
  writer.write("await runtime.complete(", statement);
  emitStatementExpression(writer, statement.expr, context);
  writer.write(");", statement);
  emitAfterStatement(writer, statement);
}

function emitPlainExpressionStatementExpression(
  writer: CompiledScriptCodeWriter,
  expr: Expression,
  context: CompilerContext,
): void {
  emitExpression(writer, expr, context);
}

function emitAfterStatement(writer: CompiledScriptCodeWriter, statement: Statement): void {
  writer.write("await runtime.afterStatement(evalContext);", statement);
}

function emitBeforeStatement(writer: CompiledScriptCodeWriter, statement: Statement): void {
  writer.write("await runtime.beforeStatement(evalContext);", statement);
}

function emitReturnStatement(
  writer: CompiledScriptCodeWriter,
  statement: ReturnStatement,
  context: CompilerContext,
): void {
  emitBeforeStatement(writer, statement);
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

function emitVarStatement(
  writer: CompiledScriptCodeWriter,
  statement: VarStatement,
  context: CompilerContext,
): void {
  emitBeforeStatement(writer, statement);
  if (context.inFunction) {
    writer.write(`throw new Error("'var' declarations are not allowed within functions");`, statement);
    return;
  }
  emitAfterStatement(writer, statement);
}

function emitVarDeclaration(
  writer: CompiledScriptCodeWriter,
  decl: VarDeclaration,
  context: CompilerContext,
): void {
  if (!decl.id || decl.aDestr || decl.oDestr) {
    emitDestructureDeclaration(writer, decl, context);
  } else {
    assertJsIdentifier({ name: decl.id }, context.sourceId);
    writer.write(decl.id, decl);
    if (decl.expr) {
      writer.write(" = await runtime.complete(");
      emitExpression(writer, decl.expr, context);
      writer.write(")");
    }
  }
}

function emitDestructureDeclaration(
  writer: CompiledScriptCodeWriter,
  decl: VarDeclaration,
  context: CompilerContext,
): void {
  const specs = collectDestructureSpecs(decl, context);
  if (specs.length === 0) {
    throwUnsupportedCompiledScriptNode(decl, context.sourceId);
  }

  writer.write("{ ");
  specs.forEach(([name], index) => {
    if (index > 0) writer.write(", ");
    writer.write(name, decl);
  });
  writer.write(" }");
  writer.write(" = runtime.destructure(");
  if (decl.expr) {
    writer.write("await runtime.complete(");
    emitExpression(writer, decl.expr, context);
    writer.write(")");
  } else {
    writer.write("undefined");
  }
  writer.write(`, ${JSON.stringify(specs)})`);
}

type DestructureSpec = [name: string, path: Array<string | number>];

function collectDestructureSpecs(
  decl: VarDeclaration,
  context: CompilerContext,
): DestructureSpec[] {
  if (decl.aDestr) {
    return collectArrayDestructureSpecs(decl.aDestr, [], context);
  }
  if (decl.oDestr) {
    return collectObjectDestructureSpecs(decl.oDestr, [], context);
  }
  return [];
}

function collectArrayDestructureSpecs(
  destructure: ArrayDestructure[],
  path: Array<string | number>,
  context: CompilerContext,
): DestructureSpec[] {
  return destructure.flatMap((item, index) => {
    const itemPath = [...path, index];
    if (item.id) {
      assertJsIdentifier({ name: item.id }, context.sourceId);
      return [[item.id, itemPath] satisfies DestructureSpec];
    }
    if (item.aDestr) return collectArrayDestructureSpecs(item.aDestr, itemPath, context);
    if (item.oDestr) return collectObjectDestructureSpecs(item.oDestr, itemPath, context);
    return [];
  });
}

function collectObjectDestructureSpecs(
  destructure: ObjectDestructure[],
  path: Array<string | number>,
  context: CompilerContext,
): DestructureSpec[] {
  return destructure.flatMap((item) => {
    const itemPath = [...path, item.id];
    if (item.aDestr) return collectArrayDestructureSpecs(item.aDestr, itemPath, context);
    if (item.oDestr) return collectObjectDestructureSpecs(item.oDestr, itemPath, context);
    const name = item.alias ?? item.id;
    assertJsIdentifier({ name }, context.sourceId);
    return [[name, itemPath] satisfies DestructureSpec];
  });
}

function emitBlockStatement(
  writer: CompiledScriptCodeWriter,
  statement: BlockStatement,
  context: CompilerContext,
): void {
  const blockContext = extendCompilerContext(context, collectLocalNames(statement.stmts));
  emitBeforeStatement(writer, statement);
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
  emitBeforeStatement(writer, statement);
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

function emitWhileStatement(
  writer: CompiledScriptCodeWriter,
  statement: WhileStatement,
  context: CompilerContext,
): void {
  const breakLabel = context.nextLabel("break");
  const continueLabel = context.nextLabel("continue");
  const loopContext = extendLoopContext(context, breakLabel, continueLabel);
  writer.write(`${breakLabel}: while (true) {`, statement);
  writer.write(`${continueLabel}: {`, statement);
  emitBeforeStatement(writer, statement);
  writer.write("if (!await runtime.complete(", statement);
  emitExpression(writer, statement.cond, context);
  writer.write(")) {", statement);
  emitAfterStatement(writer, statement);
  writer.write(`break ${breakLabel};`, statement);
  writer.write("}", statement);
  emitAfterStatement(writer, statement);
  emitStatement(writer, statement.body, loopContext);
  writer.write("}", statement);
  writer.write("}", statement);
}

function emitDoWhileStatement(
  writer: CompiledScriptCodeWriter,
  statement: DoWhileStatement,
  context: CompilerContext,
): void {
  const breakLabel = context.nextLabel("break");
  const continueLabel = context.nextLabel("continue");
  const loopContext = extendLoopContext(context, breakLabel, continueLabel);
  writer.write(`${breakLabel}: do {`, statement);
  writer.write(`${continueLabel}: {`, statement);
  emitStatement(writer, statement.body, loopContext);
  writer.write("}", statement);
  emitBeforeStatement(writer, statement);
  writer.write("if (!await runtime.complete(", statement);
  emitExpression(writer, statement.cond, context);
  writer.write(")) {", statement);
  emitAfterStatement(writer, statement);
  writer.write(`break ${breakLabel};`, statement);
  writer.write("}", statement);
  emitAfterStatement(writer, statement);
  writer.write("} while (true);", statement);
}

function emitForStatement(
  writer: CompiledScriptCodeWriter,
  statement: ForStatement,
  context: CompilerContext,
): void {
  const scopedContext = extendCompilerContext(context, collectForLocalNames(statement));
  const breakLabel = context.nextLabel("break");
  const continueLabel = context.nextLabel("continue");
  const loopContext = extendLoopContext(scopedContext, breakLabel, continueLabel);

  writer.write("{", statement);
  if (statement.init) {
    if (statement.init.type === T_EXPRESSION_STATEMENT) {
      emitExpressionStatement(
        writer,
        statement.init,
        scopedContext,
        emitPlainExpressionStatementExpression,
      );
    } else {
      emitStatement(writer, statement.init, scopedContext);
    }
  }
  writer.write(`${breakLabel}: while (true) {`, statement);
  writer.write(`${continueLabel}: {`, statement);
  emitBeforeStatement(writer, statement);
  if (statement.cond) {
    writer.write("if (!await runtime.complete(", statement);
    emitExpression(writer, statement.cond, scopedContext);
    writer.write(")) {", statement);
    emitAfterStatement(writer, statement);
    writer.write(`break ${breakLabel};`, statement);
    writer.write("}", statement);
  }
  emitAfterStatement(writer, statement);
  emitStatement(writer, statement.body, loopContext);
  writer.write("}", statement);
  if (statement.upd) {
    emitBeforeStatement(writer, statement);
    writer.write("await runtime.complete(", statement);
    emitPlainExpressionStatementExpression(writer, statement.upd, scopedContext);
    writer.write(");", statement);
    emitAfterStatement(writer, statement);
  }
  writer.write("}", statement);
  writer.write("}", statement);
}

function emitForInStatement(
  writer: CompiledScriptCodeWriter,
  statement: ForInStatement,
  context: CompilerContext,
): void {
  const objectName = context.nextTemp();
  const keysName = context.nextTemp();
  const indexName = context.nextTemp();
  const valueName = context.nextTemp();
  const breakLabel = context.nextLabel("break");
  const continueLabel = context.nextLabel("continue");
  const loopContext = extendLoopContext(context, breakLabel, continueLabel);

  writer.write("{", statement);
  writer.write(`const ${objectName} = await runtime.complete(`, statement);
  emitExpression(writer, statement.expr, context);
  writer.write(");", statement);
  writer.write(`if (${objectName} != undefined) {`, statement);
  writer.write(`const ${keysName} = Object.keys(${objectName});`, statement);
  writer.write(`let ${indexName} = 0;`, statement);
  writer.write(`${breakLabel}: while (true) {`, statement);
  writer.write(`${continueLabel}: {`, statement);
  emitBeforeStatement(writer, statement);
  writer.write(`if (${indexName} >= ${keysName}.length) {`, statement);
  emitAfterStatement(writer, statement);
  writer.write(`break ${breakLabel};`, statement);
  writer.write("}", statement);
  writer.write(`const ${valueName} = ${keysName}[${indexName}++];`, statement);
  emitAfterStatement(writer, statement);
  emitForInOfBody(writer, statement, valueName, loopContext);
  writer.write("}", statement);
  writer.write("}", statement);
  writer.write("}", statement);
  writer.write("}", statement);
}

function emitForOfStatement(
  writer: CompiledScriptCodeWriter,
  statement: ForOfStatement,
  context: CompilerContext,
): void {
  const iterableName = context.nextTemp();
  const iteratorName = context.nextTemp();
  const nextName = context.nextTemp();
  const breakLabel = context.nextLabel("break");
  const continueLabel = context.nextLabel("continue");
  const loopContext = extendLoopContext(context, breakLabel, continueLabel);

  writer.write("{", statement);
  writer.write(`const ${iterableName} = await runtime.complete(`, statement);
  emitExpression(writer, statement.expr, context);
  writer.write(");", statement);
  writer.write(
    `if (${iterableName} == null || typeof ${iterableName}[Symbol.iterator] !== "function") { throw new Error("Object in for..of is not iterable"); }`,
    statement,
  );
  writer.write(`const ${iteratorName} = ${iterableName}[Symbol.iterator]();`, statement);
  writer.write(`${breakLabel}: while (true) {`, statement);
  writer.write(`${continueLabel}: {`, statement);
  emitBeforeStatement(writer, statement);
  writer.write(`const ${nextName} = ${iteratorName}.next();`, statement);
  writer.write(`if (${nextName}.done) {`, statement);
  emitAfterStatement(writer, statement);
  writer.write(`break ${breakLabel};`, statement);
  writer.write("}", statement);
  emitAfterStatement(writer, statement);
  emitForInOfBody(writer, statement, `${nextName}.value`, loopContext);
  writer.write("}", statement);
  writer.write("}", statement);
  writer.write("}", statement);
}

function emitForInOfBody(
  writer: CompiledScriptCodeWriter,
  statement: ForInStatement | ForOfStatement,
  valueExpression: string,
  context: CompilerContext,
): void {
  assertJsIdentifier(statement.id, context.sourceId);
  if (statement.varB === "none") {
    emitIdentifierValueAssignment(writer, statement.id.name, valueExpression, context);
    emitStatement(writer, statement.body, context);
    return;
  }

  const bodyContext = extendCompilerContext(context, [statement.id.name]);
  writer.write("{", statement);
  writer.write(`${statement.varB} ${statement.id.name} = ${valueExpression};`, statement);
  emitStatement(writer, statement.body, bodyContext);
  writer.write("}", statement);
}

function emitIdentifierValueAssignment(
  writer: CompiledScriptCodeWriter,
  name: string,
  valueExpression: string,
  context: CompilerContext,
): void {
  if (context.locals.has(name)) {
    assertJsIdentifier({ name }, context.sourceId);
    writer.write(`${name} = ${valueExpression};`);
    return;
  }
  writer.write(
    `runtime.assignId(${JSON.stringify(name)}, "=", ${valueExpression}, evalContext, thread);`,
  );
}

function emitFunctionDeclarationStatement(
  writer: CompiledScriptCodeWriter,
  statement: FunctionDeclaration,
  context: CompilerContext,
): void {
  if (statement.async) {
    throwUnsupportedCompiledScriptNode(statement, context.sourceId);
  }
  emitBeforeStatement(writer, statement);
  emitFunctionDeclaration(writer, statement, context);
  emitAfterStatement(writer, statement);
}

function emitFunctionDeclaration(
  writer: CompiledScriptCodeWriter,
  statement: FunctionDeclaration,
  context: CompilerContext,
): void {
  assertJsIdentifier(statement.id, context.sourceId);
  const argNames = statement.args.map((arg) => getSimpleArgName(arg, context.sourceId));
  const functionContext = {
    ...extendCompilerContext(context, [statement.id.name, ...argNames]),
    inFunction: true,
  };
  const blockContext = extendCompilerContext(
    functionContext,
    collectLocalNames(statement.stmt.stmts),
  );

  writer.write("async function ", statement);
  writer.write(statement.id.name, statement.id);
  writer.write("(");
  writer.write(argNames.join(", "));
  writer.write(") ");
  writer.write("{", statement.stmt);
  statement.stmt.stmts.forEach((child) => emitStatement(writer, child, blockContext));
  writer.write("}", statement.stmt);
}

function emitBreakStatement(
  writer: CompiledScriptCodeWriter,
  statement: BreakStatement,
  context: CompilerContext,
): void {
  const controlLabel = context.controlLabels[context.controlLabels.length - 1];
  if (!controlLabel) {
    throwUnsupportedCompiledScriptNode(statement, context.sourceId);
  }
  emitBeforeStatement(writer, statement);
  emitAfterStatement(writer, statement);
  writer.write(`break ${controlLabel.breakLabel};`, statement);
}

function emitContinueStatement(
  writer: CompiledScriptCodeWriter,
  statement: ContinueStatement,
  context: CompilerContext,
): void {
  const loopLabel = [...context.controlLabels].reverse().find((label) => label.kind === "loop");
  if (!loopLabel) {
    throwUnsupportedCompiledScriptNode(statement, context.sourceId);
  }
  emitBeforeStatement(writer, statement);
  emitAfterStatement(writer, statement);
  writer.write(`break ${loopLabel.continueLabel};`, statement);
}

function emitSwitchStatement(
  writer: CompiledScriptCodeWriter,
  statement: SwitchStatement,
  context: CompilerContext,
): void {
  const switchValueName = context.nextTemp();
  const matchIndexName = context.nextTemp();
  const breakLabel = context.nextLabel("switch_break");
  const switchContext = extendSwitchContext(context, breakLabel);

  writer.write(`${breakLabel}: {`, statement);
  emitBeforeStatement(writer, statement);
  writer.write(`const ${switchValueName} = await runtime.complete(`, statement);
  emitExpression(writer, statement.expr, context);
  writer.write(");", statement);
  writer.write(`let ${matchIndexName} = -1;`, statement);
  statement.cases.forEach((switchCase, index) => {
    writer.write(`if (${matchIndexName} < 0) {`, statement);
    if (switchCase.caseE === undefined) {
      writer.write(`${matchIndexName} = ${index};`, statement);
    } else {
      const caseValueName = context.nextTemp();
      writer.write(`const ${caseValueName} = await runtime.complete(`, switchCase);
      emitExpression(writer, switchCase.caseE, context);
      writer.write(");", switchCase);
      writer.write(`if (${caseValueName} === ${switchValueName}) { ${matchIndexName} = ${index}; }`, switchCase);
    }
    writer.write("}", statement);
  });
  emitAfterStatement(writer, statement);
  statement.cases.forEach((switchCase, index) => {
    writer.write(`if (${matchIndexName} >= 0 && ${matchIndexName} <= ${index}) {`, switchCase);
    switchCase.stmts?.forEach((child) => emitStatement(writer, child, switchContext));
    writer.write("}", switchCase);
  });
  writer.write("}", statement);
}

function emitTryStatement(
  writer: CompiledScriptCodeWriter,
  statement: TryStatement,
  context: CompilerContext,
): void {
  const errorName = context.nextTemp();

  emitBeforeStatement(writer, statement);
  emitAfterStatement(writer, statement);
  writer.write("try ", statement);
  emitScopedStatementBlock(writer, statement.tryB, context);
  if (statement.catchB) {
    writer.write(` catch (${errorName}) `, statement);
    const catchLocals = statement.catchV ? [statement.catchV.name] : [];
    writer.write("{", statement.catchB);
    if (statement.catchV) {
      assertJsIdentifier(statement.catchV, context.sourceId);
      writer.write(`let ${statement.catchV.name} = runtime.catchValue(${errorName});`, statement.catchV);
    }
    emitStatementBlockBody(
      writer,
      statement.catchB,
      extendCompilerContext(context, catchLocals),
    );
    writer.write("}", statement.catchB);
  }
  if (statement.finallyB) {
    writer.write(" finally ", statement);
    emitScopedStatementBlock(writer, statement.finallyB, context);
  }
}

function emitScopedStatementBlock(
  writer: CompiledScriptCodeWriter,
  statement: BlockStatement,
  context: CompilerContext,
): void {
  writer.write("{", statement);
  emitStatementBlockBody(writer, statement, context);
  writer.write("}", statement);
}

function emitStatementBlockBody(
  writer: CompiledScriptCodeWriter,
  statement: BlockStatement,
  context: CompilerContext,
): void {
  const blockContext = extendCompilerContext(context, collectLocalNames(statement.stmts));
  statement.stmts.forEach((child) => emitStatement(writer, child, blockContext));
}

function emitThrowStatement(
  writer: CompiledScriptCodeWriter,
  statement: ThrowStatement,
  context: CompilerContext,
): void {
  emitBeforeStatement(writer, statement);
  const errorName = context.nextTemp();
  writer.write(`const ${errorName} = await runtime.complete(`, statement);
  emitExpression(writer, statement.expr, context);
  writer.write(");", statement);
  emitAfterStatement(writer, statement);
  writer.write(`runtime.throwStatement(${errorName});`, statement);
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
    case T_ARRAY_LITERAL:
      emitArrayLiteral(writer, expr, context);
      return;
    case T_OBJECT_LITERAL:
      emitObjectLiteral(writer, expr, context);
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

function emitArrayLiteral(
  writer: CompiledScriptCodeWriter,
  expr: ArrayLiteral,
  context: CompilerContext,
): void {
  writer.write("[");
  expr.items.forEach((item, index) => {
    if (index > 0) writer.write(", ");
    if (item.type === T_SPREAD_EXPRESSION) {
      throwUnsupportedCompiledScriptNode(item, context.sourceId);
    }
    writer.write("await runtime.complete(");
    emitExpression(writer, item, context);
    writer.write(")");
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
      throwUnsupportedCompiledScriptNode(prop, context.sourceId);
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
    writer.write("await runtime.complete(");
    emitExpression(writer, prop[0], context);
    writer.write(")");
  }
  writer.write("]: await runtime.complete(");
  emitExpression(writer, prop[1], context);
  writer.write(")");
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
      case T_FUNCTION_DECLARATION:
        return [statement.id.name];
      default:
        return [];
    }
  });
}

function collectForLocalNames(statement: ForStatement): string[] {
  return statement.init?.type === T_LET_STATEMENT
    ? collectDeclarationNames(statement.init.decls)
    : [];
}

function collectDeclarationNames(decls: VarDeclaration[]): string[] {
  return decls.flatMap((decl) => collectVarDeclarationNames(decl));
}

function collectVarDeclarationNames(decl: VarDeclaration): string[] {
  if (decl.id && !decl.aDestr && !decl.oDestr) {
    return [decl.id];
  }
  if (decl.aDestr) {
    return collectArrayDestructureNames(decl.aDestr);
  }
  if (decl.oDestr) {
    return collectObjectDestructureNames(decl.oDestr);
  }
  return [];
}

function collectArrayDestructureNames(destructure: ArrayDestructure[]): string[] {
  return destructure.flatMap((item) => {
    if (item.id) return [item.id];
    if (item.aDestr) return collectArrayDestructureNames(item.aDestr);
    if (item.oDestr) return collectObjectDestructureNames(item.oDestr);
    return [];
  });
}

function collectObjectDestructureNames(destructure: ObjectDestructure[]): string[] {
  return destructure.flatMap((item) => {
    if (item.aDestr) return collectArrayDestructureNames(item.aDestr);
    if (item.oDestr) return collectObjectDestructureNames(item.oDestr);
    return [item.alias ?? item.id];
  });
}

function getSimpleArgName(expr: Expression, sourceId: string): string {
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

function isMemberExpressionChain(expr: Expression): boolean {
  return (
    (expr.type === T_MEMBER_ACCESS_EXPRESSION ||
      (expr.type === T_CALCULATED_MEMBER_ACCESS_EXPRESSION && expr.member.type === T_LITERAL)) &&
    (isMemberExpressionChain(expr.obj) || expr.obj.type === T_IDENTIFIER)
  );
}

function createCompilerContext(sourceId: string): CompilerContext {
  let tempIndex = 0;
  let labelIndex = 0;
  return {
    sourceId,
    locals: new Set(),
    inFunction: false,
    controlLabels: [],
    nextTemp: () => `__xmlui_evt_${tempIndex++}`,
    nextLabel: (prefix: string) => `__xmlui_evt_${prefix}_${labelIndex++}`,
  };
}

function extendCompilerContext(context: CompilerContext, localNames: string[]): CompilerContext {
  return {
    ...context,
    locals: new Set([...context.locals, ...localNames]),
  };
}

function extendLoopContext(
  context: CompilerContext,
  breakLabel: string,
  continueLabel: string,
): CompilerContext {
  return {
    ...context,
    controlLabels: [...context.controlLabels, { kind: "loop", breakLabel, continueLabel }],
  };
}

function extendSwitchContext(context: CompilerContext, breakLabel: string): CompilerContext {
  return {
    ...context,
    controlLabels: [...context.controlLabels, { kind: "switch", breakLabel }],
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
