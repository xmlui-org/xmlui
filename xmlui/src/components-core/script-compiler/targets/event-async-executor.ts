import type { LogicalThread } from "../../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "../../script-runner/BindingTreeEvaluationContext";
import type { Statement } from "../../script-runner/ScriptingSourceTree";
import { instantiateCompiledScriptArtifact } from "../artifact";
import { createCompiledScriptCache, createCompiledScriptCacheKey } from "../cache";
import { eventAsyncRuntime } from "../event-runtime";
import type { CompiledScriptArtifact } from "../types";
import { compileEventAsyncStatements } from "./event-async";

const eventAsyncCache = createCompiledScriptCache();

function isCompiledEventDiagnosticEnabled(evalContext: BindingTreeEvaluationContext): boolean {
  void evalContext;
  return false;
}

function logCompiledEventDiagnostic(
  evalContext: BindingTreeEvaluationContext,
  message: string,
  details: Record<string, any>,
): void {
  if (isCompiledEventDiagnosticEnabled(evalContext) && typeof console !== "undefined" && console.warn) {
    console.warn(`[xmlui:event-compiler] ${message}`, details);
  }
}

export async function executeCompiledEventAsyncArtifact(
  artifact: CompiledScriptArtifact,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): Promise<any> {
  const invocation = eventAsyncRuntime.createInvocation({
    suppressYield: evalContext.options?.handlerExecutionMode === "sync",
  });
  logCompiledEventDiagnostic(evalContext, "executing compiled artifact", {
    sourceId: artifact.sourceId,
    target: artifact.target,
    handlerExecutionMode: evalContext.options?.handlerExecutionMode,
    suppressYield: evalContext.options?.handlerExecutionMode === "sync",
  });
  await invocation.initialize(evalContext);
  return await instantiateCompiledScriptArtifact<Promise<any>>(
    artifact,
    invocation,
  ).execute({
    evalContext,
    thread,
  });
}

export async function executeCompiledEventAsyncHandler(
  statements: Statement[],
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
  artifact?: CompiledScriptArtifact,
  sourceId = `event:ast:${statements[0]?.nodeId ?? "empty"}`,
  sourceText?: string,
): Promise<any> {
  if (artifact) {
    logCompiledEventDiagnostic(evalContext, "using parse-time compiled artifact", {
      sourceId: artifact.sourceId,
      sourceText: artifact.sourceText,
    });
    return await executeCompiledEventAsyncArtifact(artifact, evalContext, thread);
  }
  logCompiledEventDiagnostic(evalContext, "no parse-time artifact; compiling at runtime", {
    sourceId,
    hasSourceText: sourceText !== undefined,
    statementCount: statements.length,
  });
  return await executeCompiledEventAsyncStatements(
    statements,
    evalContext,
    thread,
    sourceId,
    sourceText,
  );
}

export async function executeCompiledEventAsyncStatements(
  statements: Statement[],
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
  sourceId = `event:ast:${statements[0]?.nodeId ?? "empty"}`,
  sourceText?: string,
): Promise<any> {
  const key = createCompiledScriptCacheKey({
    target: "event-async",
    sourceId,
    sourceText,
    astNodeId: statements[0]?.nodeId,
    optionsKey: createEventAsyncOptionsKey(evalContext),
  });
  logCompiledEventDiagnostic(evalContext, "runtime compiled artifact cache lookup", {
    sourceId,
    cacheKey: key,
    astNodeId: statements[0]?.nodeId,
  });
  const artifact = eventAsyncCache.getOrCreate(key, () =>
    compileEventAsyncStatements(statements, { sourceId, sourceText }),
  );
  return await executeCompiledEventAsyncArtifact(artifact, evalContext, thread);
}

export function clearEventAsyncCompilerCache(): void {
  eventAsyncCache.clear();
}

function createEventAsyncOptionsKey(evalContext: BindingTreeEvaluationContext): string {
  return JSON.stringify({
    defaultToOptionalMemberAccess: evalContext.options?.defaultToOptionalMemberAccess !== false,
    strictDomSandbox: evalContext.options?.strictDomSandbox,
    allowConsole: evalContext.options?.allowConsole,
    strictUdcSandbox: evalContext.options?.strictUdcSandbox,
  });
}
