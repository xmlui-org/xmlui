export {
  COMPILED_SCRIPT_ARTIFACT_VERSION,
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
  createCompiledScriptMapping,
  sourceRangeFromNode,
} from "./source";
export { bindingSyncRuntime } from "./runtime";
export {
  compileBindingSyncExpression,
  compileBindingSyncExpressionSource,
  type CompileBindingSyncExpressionOptions,
} from "./targets/binding-sync";
export {
  clearBindingSyncCompilerCache,
  evaluateCompiledBinding,
  evaluateCompiledBindingExpressionSource,
} from "./targets/binding-sync-executor";
export type {
  CompiledScriptArtifact,
  CompiledScriptDiagnostic,
  CompiledScriptExecuteArgs,
  CompiledScriptInstance,
  CompiledScriptMapping,
  CompiledScriptRuntime,
  CompiledScriptSourceRange,
  CompiledScriptTarget,
} from "./types";
