export {
  COMPILED_SCRIPT_ARTIFACT_VERSION,
  createCompiledScriptFunctionBody,
  createFunctionBodySourceMapArtifact,
  createCompiledScriptArtifact,
  deserializeCompiledScriptArtifact,
  instantiateCompiledScriptArtifact,
  serializeCompiledScriptArtifact,
} from "./artifact";
export {
  CompiledScriptCache,
  createCompiledScriptCache,
  createCompiledScriptCacheKey,
} from "./cache";
export {
  UnsupportedCompiledScriptNodeError,
  throwUnsupportedCompiledScriptNode,
} from "./errors";
export {
  createCompileDiagnostic,
  describeCompileDiagnostic,
  formatCompileDiagnostic,
  reportCompileDiagnostic,
  type CompileDiagnostic,
  type CompileDiagnosticCode,
  type CompileDiagnosticPhase,
} from "./diagnostics";
export { describeScriptNodeType } from "./node-names";
export { createCompiledScriptMapping, createDebugSourceUrl, sourceRangeFromNode } from "./source";
export {
  createCompiledScriptGeneratedSourceUrl,
  createCompiledScriptSourceMap,
  createInlineSourceMapComment,
  createSourceUrlComment,
  type CompiledScriptSourceMap,
} from "./source-map";
export { bindingSyncRuntime } from "./runtime";
export { eventAsyncRuntime } from "./event-runtime";
export {
  compileBindingSyncExpression,
  compileBindingSyncExpressionSource,
  type CompileBindingSyncExpressionOptions,
} from "./targets/binding-sync";
export {
  compileEventAsyncStatements,
  compileEventAsyncStatementSource,
  type CompileEventAsyncStatementsOptions,
} from "./targets/event-async";
export {
  clearBindingSyncCompilerCache,
  evaluateCompiledBinding,
  evaluateCompiledBindingExpressionSource,
} from "./targets/binding-sync-executor";
export {
  clearEventAsyncCompilerCache,
  executeCompiledEventAsyncArtifact,
  executeCompiledEventAsyncHandler,
  executeCompiledEventAsyncStatements,
} from "./targets/event-async-executor";
export type {
  CompiledScriptArtifact,
  CompiledScriptDiagnostic,
  CompiledScriptExecuteArgs,
  CompiledScriptInstantiateOptions,
  CompiledScriptInstance,
  CompiledScriptMapping,
  CompiledScriptSource,
  CompiledScriptSourceOrigin,
  CompiledScriptSourceMapMode,
  CompiledScriptRuntime,
  CompiledScriptSourceRange,
  CompiledScriptTarget,
} from "./types";
