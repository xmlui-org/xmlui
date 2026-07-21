import type { LogicalThread } from "../../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "../../script-runner/BindingTreeEvaluationContext";
import type { Expression } from "../../script-runner/ScriptingSourceTree";
import { createCompiledScriptCache, createCompiledScriptCacheKey } from "../cache";
import { instantiateCompiledScriptArtifact } from "../artifact";
import { bindingSyncRuntime } from "../runtime";
import {
  compileBindingSyncExpression,
  compileBindingSyncExpressionSource,
} from "./binding-sync";

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
  return instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime).execute({
    evalContext,
    thread,
  });
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
  return instantiateCompiledScriptArtifact(artifact, bindingSyncRuntime).execute({
    evalContext,
    thread,
  });
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

