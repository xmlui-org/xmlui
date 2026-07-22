import { createCompiledScriptMapping, sourceRangeFromNode } from "./source";
import type { CompiledScriptMapping, CompiledScriptSourceRange } from "./types";
import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";

export class CompiledScriptCodeWriter {
  private chunks: string[] = [];
  private mappings: CompiledScriptMapping[] = [];
  private length = 0;

  constructor(private readonly sourceId: string) {}

  write(text: string, source?: Pick<ScripNodeBase, "startToken" | "endToken">): void {
    const start = this.length;
    this.chunks.push(text);
    this.length += text.length;
    const sourceRange = sourceRangeFromNode(source);
    if (sourceRange) {
      this.addMapping(start, this.length, sourceRange);
    }
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

