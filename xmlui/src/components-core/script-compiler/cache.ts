import { COMPILED_SCRIPT_ARTIFACT_VERSION } from "./artifact";
import type { CompiledScriptArtifact, CompiledScriptTarget } from "./types";

export type CompiledScriptCacheKeyParts = {
  target: CompiledScriptTarget;
  sourceId: string;
  sourceText?: string;
  astNodeId?: number;
  optionsKey?: string;
  compilerVersion?: number;
};

export function createCompiledScriptCacheKey({
  target,
  sourceId,
  sourceText = "",
  astNodeId,
  optionsKey = "",
  compilerVersion = COMPILED_SCRIPT_ARTIFACT_VERSION,
}: CompiledScriptCacheKeyParts): string {
  return JSON.stringify({
    compilerVersion,
    target,
    sourceId,
    sourceText,
    astNodeId,
    optionsKey,
  });
}

export class CompiledScriptCache {
  private readonly artifacts = new Map<string, CompiledScriptArtifact>();

  constructor(private readonly maxEntries = 1000) {}

  get size(): number {
    return this.artifacts.size;
  }

  get(key: string): CompiledScriptArtifact | undefined {
    return this.artifacts.get(key);
  }

  set(key: string, artifact: CompiledScriptArtifact): CompiledScriptArtifact {
    if (!this.artifacts.has(key) && this.artifacts.size >= this.maxEntries) {
      const oldestKey = this.artifacts.keys().next().value;
      this.artifacts.delete(oldestKey);
    }
    this.artifacts.set(key, artifact);
    return artifact;
  }

  getOrCreate(key: string, createArtifact: () => CompiledScriptArtifact): CompiledScriptArtifact {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }
    return this.set(key, createArtifact());
  }

  clear(): void {
    this.artifacts.clear();
  }
}

export function createCompiledScriptCache(maxEntries?: number): CompiledScriptCache {
  return new CompiledScriptCache(maxEntries);
}

