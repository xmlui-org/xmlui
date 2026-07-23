import type { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import type { BindingTreeEvaluationContext } from "../script-runner/BindingTreeEvaluationContext";

export type CompiledScriptTarget = "binding-sync" | "event-async";

export type CompiledScriptSourceMapMode = boolean | "inline" | "external";

export type CompiledScriptSourceRange = {
  start: number;
  end: number;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
};

export type CompiledScriptSource = {
  id: string;
  url?: string;
  displayName?: string;
  sourceText?: string;
};

export type CompiledScriptSourceOrigin = {
  /**
   * Absolute character offset of the compiled snippet within the original source.
   */
  offset?: number;
  /**
   * 1-based line where the compiled snippet starts in the original source.
   */
  line?: number;
  /**
   * 0-based column where the compiled snippet starts in the original source.
   */
  column?: number;
  /**
   * Full original source text. When supplied, line/column values are computed
   * from absolute offsets instead of relying on caller-provided line metadata.
   */
  sourceText?: string;
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
  sourceUrl?: string;
  displayName?: string;
  sourceText?: string;
  sources: CompiledScriptSource[];
  sourceRange?: CompiledScriptSourceRange;
  astNodeId?: number;
  dependencies: string[];
  js: string;
  mappings: CompiledScriptMapping[];
  diagnostics: CompiledScriptDiagnostic[];
};

export type CompiledScriptRuntime = Record<string, unknown>;

export type CompiledScriptInstantiateOptions = {
  sourceMapMode?: CompiledScriptSourceMapMode;
  generatedSourceUrl?: string;
  sourceMapUrl?: string;
};

export type CompiledScriptExecuteArgs = {
  evalContext: BindingTreeEvaluationContext;
  thread?: LogicalThread;
};

export type CompiledScriptInstance<TValue = unknown> = {
  artifact: CompiledScriptArtifact;
  nativeFn: Function;
  execute(args: CompiledScriptExecuteArgs): TValue;
};
