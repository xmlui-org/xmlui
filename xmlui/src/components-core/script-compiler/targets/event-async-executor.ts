import type { LogicalThread } from "../../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "../../script-runner/BindingTreeEvaluationContext";
import type { Statement } from "../../script-runner/ScriptingSourceTree";
import { instantiateCompiledScriptArtifact } from "../artifact";
import { createCompiledScriptCache, createCompiledScriptCacheKey } from "../cache";
import { eventAsyncRuntime } from "../event-runtime";
import type { CompiledScriptArtifact } from "../types";
import { compileEventAsyncStatements } from "./event-async";

const eventAsyncCache = createCompiledScriptCache();

export async function executeCompiledEventAsyncArtifact(
  artifact: CompiledScriptArtifact,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): Promise<any> {
  return await instantiateCompiledScriptArtifact<Promise<any>>(artifact, eventAsyncRuntime).execute({
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
    return await executeCompiledEventAsyncArtifact(artifact, evalContext, thread);
  }
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
