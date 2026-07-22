import { Parser } from "../../../parsers/scripting/Parser";
import type { Statement } from "../../script-runner/ScriptingSourceTree";
import { createCompiledScriptArtifact } from "../artifact";
import { CompiledScriptCodeWriter } from "../code-writer";
import { createCompiledScriptMapping, sourceRangeFromNode } from "../source";
import type { CompiledScriptArtifact, CompiledScriptSourceRange } from "../types";

export type CompileEventAsyncStatementsOptions = {
  sourceId: string;
  sourceText?: string;
};

export function compileEventAsyncStatements(
  statements: Statement[],
  { sourceId, sourceText }: CompileEventAsyncStatementsOptions,
): CompiledScriptArtifact {
  const writer = new CompiledScriptCodeWriter(sourceId);
  const sourceRange = sourceRangeFromStatements(statements);
  const generatedStart = writer.toString().length;
  writer.write(
    `throw runtime.unsupported("event-async", ${JSON.stringify(sourceId)}, ${JSON.stringify(
      sourceRange,
    )});`,
  );
  const generatedEnd = writer.toString().length;

  return createCompiledScriptArtifact({
    target: "event-async",
    sourceId,
    sourceText,
    sourceRange,
    astNodeId: statements[0]?.nodeId,
    js: writer.toString(),
    mappings: [createCompiledScriptMapping(generatedStart, generatedEnd, sourceId, sourceRange)],
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
