import type { LogicalThread } from "../../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "../../script-runner/BindingTreeEvaluationContext";
import type { Expression, Statement } from "../../script-runner/ScriptingSourceTree";
import { createCompiledScriptCache, createCompiledScriptCacheKey } from "../cache";
import { instantiateCompiledScriptArtifact } from "../artifact";
import { createCompiledScriptGeneratedSourceUrl } from "../source-map";
import { bindingSyncRuntime } from "../runtime";
import {
  compileBindingSyncExpression,
  compileBindingSyncExpressionSource,
  compileStatementSyncStatements,
} from "./binding-sync";
import { emitCompiledScriptDebugSourceTrace } from "../debug-source-trace";

const bindingSyncCache = createCompiledScriptCache();

export function evaluateCompiledBindingExpressionSource(
  source: string,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
  const sourceId = `binding:${source}`;
  const key = createCompiledScriptCacheKey({
    target: "binding-sync",
    sourceId,
    sourceText: source,
    optionsKey: createBindingSyncOptionsKey(evalContext),
  });
  const artifact = bindingSyncCache.getOrCreate(key, () =>
    compileBindingSyncExpressionSource(source, sourceId),
  );
  emitCompiledScriptDebugSourceTrace(artifact, evalContext);
  return instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime, {
    sourceMapMode: evalContext.options?.sourceMaps,
    generatedSourceUrl: getExternalGeneratedSourceUrl(artifact),
    sourceMapUrl: getExternalSourceMapUrl(artifact),
  }).execute({ evalContext, thread });
}

export function evaluateCompiledBinding(
  expr: Expression,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
  const sourceId = `binding:ast:${expr.nodeId}`;
  const key = createCompiledScriptCacheKey({
    target: "binding-sync",
    sourceId,
    sourceText: expr.source,
    astNodeId: expr.nodeId,
    optionsKey: createBindingSyncOptionsKey(evalContext),
  });
  const artifact = bindingSyncCache.getOrCreate(key, () =>
    compileBindingSyncExpression(expr, {
      sourceId,
      sourceText: expr.source,
    }),
  );
  emitCompiledScriptDebugSourceTrace(artifact, evalContext);
  return instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime, {
    sourceMapMode: evalContext.options?.sourceMaps,
    generatedSourceUrl: getExternalGeneratedSourceUrl(artifact),
    sourceMapUrl: getExternalSourceMapUrl(artifact),
  }).execute({ evalContext, thread });
}

/**
 * Runs a statement list through the `statement-sync` target, compiling on first use and
 * caching by AST node id — the same shape as binding evaluation, because it is the same
 * emitter behind a different entry point.
 *
 * The value is whatever the statements `return`, handed back directly rather than parked
 * on a thread block. The interpreted path stores it at
 * `thread.blocks[last].returnValue`; callers that need to work either way read this
 * return value when the compiled path ran.
 */
export function executeCompiledStatementSync(
  statements: Statement[],
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
  // --- A handler written as an arrow is wrapped in a *synthetic* statement by the
  // --- caller, and a synthesized node has no `nodeId`. Keying on the statement alone
  // --- gave every such handler the same key, so the first one compiled was handed to all
  // --- the rest — the row predicate of one table answering for another's. The inner
  // --- expression is a real parsed node and does have an id.
  const astNodeId = statements[0]?.nodeId ?? (statements[0] as any)?.expr?.nodeId;
  const sourceId = `statements:ast:${astNodeId ?? "anonymous"}`;
  const compile = () => compileStatementSyncStatements(statements, { sourceId });
  if (astNodeId === undefined) {
    // --- Nothing stable to key on. Compiling every time is slow, but sharing an artifact
    // --- between unrelated scripts is wrong, and wrong is worse.
    return runCompiledStatementArtifact(compile(), evalContext, thread);
  }
  const key = createCompiledScriptCacheKey({
    target: "statement-sync",
    sourceId,
    sourceText: (statements[0] as any)?.source,
    astNodeId,
    optionsKey: createBindingSyncOptionsKey(evalContext),
  });
  const artifact = bindingSyncCache.getOrCreate(key, compile);
  return runCompiledStatementArtifact(artifact, evalContext, thread);
}

function runCompiledStatementArtifact(
  artifact: ReturnType<typeof compileStatementSyncStatements>,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): any {
  emitCompiledScriptDebugSourceTrace(artifact, evalContext);
  return instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime, {
    sourceMapMode: evalContext.options?.sourceMaps,
    generatedSourceUrl: getExternalGeneratedSourceUrl(artifact),
    sourceMapUrl: getExternalSourceMapUrl(artifact),
  }).execute({ evalContext, thread });
}

export function clearBindingSyncCompilerCache(): void {
  bindingSyncCache.clear();
}

function createBindingSyncOptionsKey(evalContext: BindingTreeEvaluationContext): string {
  return JSON.stringify({
    defaultToOptionalMemberAccess: evalContext.options?.defaultToOptionalMemberAccess !== false,
    strictDomSandbox: evalContext.options?.strictDomSandbox,
    allowConsole: evalContext.options?.allowConsole,
    strictUdcSandbox: evalContext.options?.strictUdcSandbox,
  });
}

function getExternalGeneratedSourceUrl(
  artifact: Parameters<typeof createCompiledScriptGeneratedSourceUrl>[0],
): string {
  return createCompiledScriptGeneratedSourceUrl(artifact);
}

function getExternalSourceMapUrl(
  artifact: Parameters<typeof createCompiledScriptGeneratedSourceUrl>[0],
): string {
  return `${createCompiledScriptGeneratedSourceUrl(artifact)}.map`;
}
