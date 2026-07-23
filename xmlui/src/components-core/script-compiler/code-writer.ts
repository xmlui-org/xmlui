import { createCompiledScriptMapping, sourceRangeFromNode } from "./source";
import type {
  CompiledScriptMapping,
  CompiledScriptSourceOrigin,
  CompiledScriptSourceRange,
} from "./types";
import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";

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
