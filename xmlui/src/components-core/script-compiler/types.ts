import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";

export type CompiledScriptTarget = "binding-sync" | "event-async";

export type CompiledScriptSourceRange = {
  start: number;
  end: number;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
};

export type CompiledScriptMapping = {
  generatedStart: number;
  generatedEnd: number;
  sourceId: string;
  sourceRange?: CompiledScriptSourceRange;
};

export type CompiledScriptDiagnostic = {
  code: string;
  message: string;
  severity: "error" | "warning";
  sourceRange?: CompiledScriptSourceRange;
};

export type CompiledScriptArtifact = {
  version: number;
  target: CompiledScriptTarget;
  sourceId: string;
  sourceText?: string;
  sourceRange?: CompiledScriptSourceRange;
  astNodeId?: number;
  dependencies: string[];
  js: string;
  mappings: CompiledScriptMapping[];
  diagnostics: CompiledScriptDiagnostic[];
};

export type CompiledScriptRuntime = Record<string, unknown>;

export type CompiledScriptExecuteArgs = {
  evalContext: BindingTreeEvaluationContext;
  thread?: LogicalThread;
};

export type CompiledScriptInstance<TValue = unknown> = {
  artifact: CompiledScriptArtifact;
  nativeFn: Function;
  execute(args: CompiledScriptExecuteArgs): TValue;
};
