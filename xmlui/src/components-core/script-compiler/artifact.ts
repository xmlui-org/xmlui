import type {
  CompiledScriptArtifact,
  CompiledScriptDiagnostic,
  CompiledScriptInstance,
  CompiledScriptMapping,
  CompiledScriptRuntime,
  CompiledScriptSourceRange,
  CompiledScriptTarget,
} from "./types";

export const COMPILED_SCRIPT_ARTIFACT_VERSION = 1;

type CreateCompiledScriptArtifactOptions = {
  target: CompiledScriptTarget;
  sourceId: string;
  sourceText?: string;
  sourceRange?: CompiledScriptSourceRange;
  astNodeId?: number;
  dependencies?: string[];
  js: string;
  mappings?: CompiledScriptMapping[];
  diagnostics?: CompiledScriptDiagnostic[];
};

export function createCompiledScriptArtifact({
  target,
  sourceId,
  sourceText,
  sourceRange,
  astNodeId,
  dependencies = [],
  js,
  mappings = [],
  diagnostics = [],
}: CreateCompiledScriptArtifactOptions): CompiledScriptArtifact {
  return {
    version: COMPILED_SCRIPT_ARTIFACT_VERSION,
    target,
    sourceId,
    sourceText,
    sourceRange,
    astNodeId,
    dependencies: [...dependencies],
    js,
    mappings: [...mappings],
    diagnostics: [...diagnostics],
  };
}

export function serializeCompiledScriptArtifact(artifact: CompiledScriptArtifact): string {
  return JSON.stringify(artifact);
}

export function deserializeCompiledScriptArtifact(serialized: string): CompiledScriptArtifact {
  return JSON.parse(serialized) as CompiledScriptArtifact;
}

export function instantiateCompiledScriptArtifact<TValue = unknown>(
  artifact: CompiledScriptArtifact,
  runtime: CompiledScriptRuntime = {},
): CompiledScriptInstance<TValue> {
  const nativeFn = new Function(
    "runtime",
    "evalContext",
    "thread",
    `"use strict";\n${artifact.js}`,
  );

  return {
    artifact,
    nativeFn,
    execute({ evalContext, thread }) {
      return nativeFn(runtime, evalContext, thread) as TValue;
    },
  };
}

