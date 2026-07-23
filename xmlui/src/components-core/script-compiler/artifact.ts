import type {
  CompiledScriptArtifact,
  CompiledScriptDiagnostic,
  CompiledScriptInstantiateOptions,
  CompiledScriptInstance,
  CompiledScriptMapping,
  CompiledScriptSource,
  CompiledScriptRuntime,
  CompiledScriptSourceRange,
  CompiledScriptTarget,
} from "./types";
import {
  createCompiledScriptGeneratedSourceUrl,
  createCompiledScriptSourceMap,
  createInlineSourceMapComment,
  createSourceUrlComment,
} from "./source-map";

export const COMPILED_SCRIPT_ARTIFACT_VERSION = 1;

type CreateCompiledScriptArtifactOptions = {
  target: CompiledScriptTarget;
  sourceId: string;
  sourceUrl?: string;
  displayName?: string;
  sourceText?: string;
  sources?: CompiledScriptSource[];
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
  sourceUrl,
  displayName,
  sourceText,
  sources,
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
    sourceUrl,
    displayName,
    sourceText,
    sources: sources?.length
      ? sources.map((source) => ({ ...source }))
      : [
          {
            id: sourceId,
            ...(sourceUrl ? { url: sourceUrl } : {}),
            ...(displayName ? { displayName } : {}),
            ...(sourceText !== undefined ? { sourceText } : {}),
          },
        ],
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
  options: CompiledScriptInstantiateOptions = {},
): CompiledScriptInstance<TValue> {
  const nativeFn = new Function(
    "runtime",
    "evalContext",
    "thread",
    createCompiledScriptFunctionBody(artifact, options),
  );

  return {
    artifact,
    nativeFn,
    execute({ evalContext, thread }) {
      return nativeFn(runtime, evalContext, thread) as TValue;
    },
  };
}

export function createCompiledScriptFunctionBody(
  artifact: CompiledScriptArtifact,
  options: CompiledScriptInstantiateOptions = {},
): string {
  const sourceMapMode = options.sourceMapMode;
  const prefix = `"use strict";\n`;
  const body = `${prefix}${artifact.js}`;
  if (!sourceMapMode) {
    return body;
  }

  const sourceUrl = options.generatedSourceUrl ?? createCompiledScriptGeneratedSourceUrl(artifact);
  const comments: string[] = [];
  if (sourceMapMode === "external" && options.sourceMapUrl) {
    comments.push(`//# sourceMappingURL=${options.sourceMapUrl}`);
  } else {
    comments.push(
      createInlineSourceMapComment(
        createCompiledScriptSourceMap(
          createFunctionBodySourceMapArtifact(artifact, body, prefix.length),
          sourceUrl,
        ),
      ),
    );
  }
  comments.push(createSourceUrlComment(sourceUrl));
  return `${body}\n${comments.join("\n")}`;
}

export function createFunctionBodySourceMapArtifact(
  artifact: CompiledScriptArtifact,
  body: string,
  generatedOffset: number,
): CompiledScriptArtifact {
  return {
    ...artifact,
    js: body,
    mappings: artifact.mappings.map((mapping) => ({
      ...mapping,
      generatedStart: mapping.generatedStart + generatedOffset,
      generatedEnd: mapping.generatedEnd + generatedOffset,
    })),
  };
}
