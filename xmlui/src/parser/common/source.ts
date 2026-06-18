export type SourceId = string;

export type SourcePosition = {
  line: number;
  column: number;
};

export type SourceSpan = {
  sourceId: SourceId;
  start: number;
  end: number;
  generatedFrom?: SourceSpan;
};

export type TextSource = {
  id: SourceId;
  text: string;
};

export class SourceText {
  readonly id: SourceId;
  readonly text: string;

  private readonly lineStarts: number[];

  constructor(source: TextSource | string, id: SourceId = "anonymous.xmlui") {
    if (typeof source === "string") {
      this.id = id;
      this.text = source;
    } else {
      this.id = source.id;
      this.text = source.text;
    }
    this.lineStarts = computeLineStarts(this.text);
  }

  get length(): number {
    return this.text.length;
  }

  slice(start: number, end: number = this.text.length): string {
    return this.text.slice(start, end);
  }

  span(start: number, end: number, generatedFrom?: SourceSpan): SourceSpan {
    return {
      sourceId: this.id,
      start: clampOffset(start, this.length),
      end: clampOffset(end, this.length),
      ...(generatedFrom ? { generatedFrom } : {}),
    };
  }

  positionAt(offset: number): SourcePosition {
    const safeOffset = clampOffset(offset, this.length);
    let low = 0;
    let high = this.lineStarts.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const lineStart = this.lineStarts[mid];
      const nextLineStart = this.lineStarts[mid + 1] ?? Number.POSITIVE_INFINITY;
      if (safeOffset < lineStart) {
        high = mid - 1;
      } else if (safeOffset >= nextLineStart) {
        low = mid + 1;
      } else {
        return {
          line: mid,
          column: safeOffset - lineStart,
        };
      }
    }

    return { line: 0, column: safeOffset };
  }
}

export class InputStream {
  readonly source: SourceText;

  private offset = 0;

  constructor(source: SourceText | TextSource | string, id?: SourceId) {
    this.source = source instanceof SourceText ? source : new SourceText(source, id);
  }

  get position(): number {
    return this.offset;
  }

  get eof(): boolean {
    return this.offset >= this.source.length;
  }

  peek(ahead: number = 0): string | null {
    const index = this.offset + ahead;
    return index >= this.source.length ? null : this.source.text[index];
  }

  startsWith(value: string): boolean {
    return this.source.text.startsWith(value, this.offset);
  }

  advance(count: number = 1): string {
    const start = this.offset;
    this.offset = clampOffset(this.offset + count, this.source.length);
    return this.source.slice(start, this.offset);
  }

  seek(offset: number): void {
    this.offset = clampOffset(offset, this.source.length);
  }

  slice(start: number, end: number = this.offset): string {
    return this.source.slice(start, end);
  }

  span(start: number, end: number = this.offset, generatedFrom?: SourceSpan): SourceSpan {
    return this.source.span(start, end, generatedFrom);
  }

  positionAt(offset: number = this.offset): SourcePosition {
    return this.source.positionAt(offset);
  }
}

function computeLineStarts(text: string): number[] {
  const starts = [0];
  for (let index = 0; index < text.length; index++) {
    if (text[index] === "\n") {
      starts.push(index + 1);
    }
  }
  return starts;
}

function clampOffset(offset: number, length: number): number {
  return Math.max(0, Math.min(offset, length));
}
