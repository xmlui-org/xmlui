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

/**
 * Compiled function products, keyed by artifact identity and then by the
 * options that affect the emitted body.
 *
 * A `new Function` product has global scope only — it closes over nothing, and
 * `runtime` / `evalContext` / `thread` all arrive as parameters — so a single
 * function is correct for every instance, evaluation context, and thread that
 * shares an artifact. Compiling per evaluation was the cost behind
 * xmlui-org/xmlui#3763: the artifact (the compiled JS *source*) was already
 * cached by source text in binding-sync-executor.ts, but every evaluation still
 * paid `new Function` — and, when source maps are on, a fresh inline source map
 * from createCompiledScriptFunctionBody. That is why the profile scaled with
 * component instance count rather than with the number of distinct expressions.
 *
 * Keyed on artifact identity rather than on the body text: the artifact cache
 * already yields one stable object per unique expression, so this is an O(1)
 * lookup that does not have to build the body just to compute a key. A WeakMap
 * keeps the entries collectable as soon as the bounded artifact cache evicts
 * the artifact, so memory tracks distinct expressions, not instances.
 */
let nativeFnCache = new WeakMap<CompiledScriptArtifact, Map<string, Function>>();

function createNativeFnCacheKey(options: CompiledScriptInstantiateOptions): string {
  return JSON.stringify([
    options.sourceMapMode ?? "",
    options.generatedSourceUrl ?? "",
    options.sourceMapUrl ?? "",
  ]);
}

function getOrCreateNativeFn(
  artifact: CompiledScriptArtifact,
  options: CompiledScriptInstantiateOptions,
): Function {
  const key = createNativeFnCacheKey(options);
  let byOptions = nativeFnCache.get(artifact);
  if (!byOptions) {
    byOptions = new Map<string, Function>();
    nativeFnCache.set(artifact, byOptions);
  }
  const cached = byOptions.get(key);
  if (cached) {
    return cached;
  }
  const nativeFn = new Function(
    "runtime",
    "evalContext",
    "thread",
    createCompiledScriptFunctionBody(artifact, options),
  );
  byOptions.set(key, nativeFn);
  return nativeFn;
}

/** Drops every memoized function product. Exposed for tests. */
export function clearCompiledScriptNativeFnCache(): void {
  nativeFnCache = new WeakMap<CompiledScriptArtifact, Map<string, Function>>();
}

export function instantiateCompiledScriptArtifact<TValue = unknown>(
  artifact: CompiledScriptArtifact,
  runtime: CompiledScriptRuntime = {},
  options: CompiledScriptInstantiateOptions = {},
): CompiledScriptInstance<TValue> {
  // Only the function is shared. The instance wrapper is rebuilt per call
  // because `execute` closes over `runtime`, and the async event executor
  // passes a fresh per-invocation runtime — sharing the wrapper would leak one
  // invocation's runtime into another's call.
  const nativeFn = getOrCreateNativeFn(artifact, options);

  return {
    artifact,
    nativeFn,
    execute({ evalContext, thread }) {
      return nativeFn(runtime, evalContext, thread) as TValue;
    },
  };
}

/**
 * The body handed to `new Function`, always ending in a `//# sourceURL` line.
 *
 * Naming the product is not the same thing as shipping a source map: the URL is one
 * short, app-relative line built in the browser — it adds nothing to the bundle and
 * carries no source text — and without it every compiled artifact shows up as
 * `<anonymous>` in stack traces, profiles, and the debugger, which is precisely where
 * one needs to know which script block is running. The source-map *payload*, inline or
 * external, stays behind `sourceMapMode`.
 */
export function createCompiledScriptFunctionBody(
  artifact: CompiledScriptArtifact,
  options: CompiledScriptInstantiateOptions = {},
): string {
  const sourceMapMode = options.sourceMapMode;
  const prefix = `"use strict";\n`;
  const body = `${prefix}${artifact.js}`;
  const sourceUrl = options.generatedSourceUrl ?? createCompiledScriptGeneratedSourceUrl(artifact);
  const comments: string[] = [];
  if (sourceMapMode === "external" && options.sourceMapUrl) {
    comments.push(`//# sourceMappingURL=${options.sourceMapUrl}`);
  } else if (sourceMapMode) {
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
