import { createCompiledScriptMapping, sourceRangeFromNode } from "./source";
import type {
  CompiledScriptMapping,
  CompiledScriptSourceOrigin,
  CompiledScriptSourceRange,
} from "./types";
import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";

export type CompiledScriptCodeWriterMark = {
  chunkCount: number;
  length: number;
  mappingCount: number;
};

export class CompiledScriptCodeWriter {
  private chunks: string[] = [];
  private mappings: CompiledScriptMapping[] = [];
  private length = 0;
  private suppressMappings = 0;

  constructor(
    private readonly sourceId: string,
    private readonly sourceOrigin?: CompiledScriptSourceOrigin,
  ) {}

  write(text: string, source?: Pick<ScripNodeBase, "startToken" | "endToken">): void {
    const start = this.length;
    this.chunks.push(text);
    this.length += text.length;
    const sourceRange = sourceRangeFromNode(source, this.sourceOrigin);
    if (sourceRange && this.suppressMappings === 0) {
      this.addMapping(start, this.length, sourceRange);
    }
  }

  withoutMappings(callback: () => void): void {
    this.suppressMappings++;
    try {
      callback();
    } finally {
      this.suppressMappings--;
    }
  }

  /**
   * Captures the writer's current position so a subsequent speculative emission can be
   * discarded with `resetTo` if it turns out to be unsupported.
   */
  mark(): CompiledScriptCodeWriterMark {
    return {
      chunkCount: this.chunks.length,
      length: this.length,
      mappingCount: this.mappings.length,
    };
  }

  /**
   * Discards everything written since `mark` was captured, restoring the writer to that
   * earlier position. Used to roll back a speculative emission attempt.
   */
  resetTo(mark: CompiledScriptCodeWriterMark): void {
    this.chunks.length = mark.chunkCount;
    this.length = mark.length;
    this.mappings.length = mark.mappingCount;
  }

  newline(): void {
    this.write("\n");
  }

  toString(): string {
    return this.chunks.join("");
  }

  getMappings(): CompiledScriptMapping[] {
    return [...this.mappings];
  }

  private addMapping(
    generatedStart: number,
    generatedEnd: number,
    sourceRange: CompiledScriptSourceRange,
  ): void {
    this.mappings.push(
      createCompiledScriptMapping(generatedStart, generatedEnd, this.sourceId, sourceRange),
    );
  }
}
