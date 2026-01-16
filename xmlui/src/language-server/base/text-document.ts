/* Altered version of the vendored package "vscode-languageserver-textdocument"
Keep the API of the TextDocument interface stable so that it works with the document manager 'TextDocuments' imported from "vscode-languageserver"! */
/*

Copyright (c) Microsoft Corporation

All rights reserved.

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { createXmlUiParser, type GetText, type ParseResult } from "../../parsers/xmlui-parser";

/**
 * A tagging type for string properties that are actually URIs.
 */
export type DocumentUri = string;

/**
 * Position in a text document expressed as zero-based line and character offset.
 * The offsets are based on a UTF-16 string representation. So a string of the form
 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
 * units in UTF-16.
 *
 * Positions are line end character agnostic. So you can not specify a position that
 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
 */
export interface Position {
  /**
   * Line position in a document (zero-based).
   *
   * If a line number is greater than the number of lines in a document, it
   * defaults back to the number of lines in the document.
   * If a line number is negative, it defaults to 0.
   *
   * The above two properties are implementation specific.
   */
  line: number;
  /**
   * Character offset on a line in a document (zero-based).
   *
   * The meaning of this offset is determined by the negotiated
   * `PositionEncodingKind`.
   *
   * If the character value is greater than the line length it defaults back
   * to the line length. This property is implementation specific.
   */
  character: number;
}

/**
 * A range in a text document expressed as (zero-based) start and end positions.
 *
 * If you want to specify a range that contains a line including the line ending
 * character(s) then use an end position denoting the start of the next line.
 * For example:
 * ```ts
 * {
 *     start: { line: 5, character: 23 }
 *     end : { line: 6, character : 0 }
 * }
 * ```
 */
export interface Range {
  /**
   * The range's start position.
   */
  start: Position;
  /**
   * The range's end position.
   */
  end: Position;
}

/**
 * A text edit applicable to a text document.
 */
export interface TextEdit {
  /**
   * The range of the text document to be manipulated. To insert
   * text into a document create a range where start === end.
   */
  range: Range;
  /**
   * The string to be inserted. For delete operations use an
   * empty string.
   */
  newText: string;
}

/**
 * An event describing a change to a text document. If range and rangeLength are omitted
 * the new text is considered to be the full content of the document.
 */
export type TextDocumentContentChangeEvent =
  | {
      /**
       * The range of the document that changed.
       */
      range: Range;
      /**
       * The optional length of the range that got replaced.
       *
       * @deprecated use range instead.
       */
      rangeLength?: number;
      /**
       * The new text for the provided range.
       */
      text: string;
    }
  | {
      /**
       * The new text of the whole document.
       */
      text: string;
    };

/**
 * A simple text document. Not to be implemented. The document keeps the content
 * as string.
 */
export interface TextDocument {
  /**
   * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
   * represent files on disk. However, some documents may have other schemes indicating that they are not
   * available on disk.
   *
   * @readonly
   */
  readonly uri: DocumentUri;
  /**
   * The identifier of the language associated with this document.
   *
   * @readonly
   */
  readonly languageId: string;
  /**
   * The version number of this document (it will increase after each
   * change, including undo/redo).
   *
   * @readonly
   */
  readonly version: number;

  readonly cursor: DocumentCursor;

  /**
   * Get the text of this document. A substring can be retrieved by
   * providing a range.
   *
   * @param range (optional) An range within the document to return.
   * If no range is passed, the full content is returned.
   * Invalid range positions are adjusted as described in {@link Position.line}
   * and {@link Position.character}.
   * If the start range position is greater than the end range position,
   * then the effect of getText is as if the two positions were swapped.

   * @return The text of this document or a substring of the text if a
   *         range is provided.
   */
  getText(range?: Range): string;
  /**
   * The number of lines in this document.
   *
   * @readonly
   */
  readonly lineCount: number;

  parse(): { parseResult: ParseResult; getText: GetText };
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TextDocument = {
  /**
   * Creates a new text document.
   *
   * @param uri The document's uri.
   * @param languageId  The document's language Id.
   * @param version The document's initial version number.
   * @param content The document's content.
   */
  create(uri: DocumentUri, languageId: string, version: number, content: string): TextDocument {
    return new FullTextDocument(uri, languageId, version, content);
  },

  /**
   * Updates a TextDocument by modifying its content.
   *
   * @param document the document to update. Only documents created by TextDocument.create are valid inputs.
   * @param changes the changes to apply to the document.
   * @param version the changes version for the document.
   * @returns The updated TextDocument. Note: That's the same document instance passed in as first parameter.
   *
   */
  update(
    document: TextDocument,
    changes: TextDocumentContentChangeEvent[],
    version: number,
  ): TextDocument {
    if (document instanceof FullTextDocument) {
      document.update(changes, version);
      return document;
    } else {
      throw new Error("TextDocument.update: document must be created by TextDocument.create");
    }
  },

  applyEdits(document: TextDocument, edits: TextEdit[]): string {
    const text = document.getText();
    const sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
      const diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    let lastModifiedOffset = 0;
    const spans = [];
    for (const e of sortedEdits) {
      const startOffset = document.cursor.offsetAt(e.range.start);
      if (startOffset < lastModifiedOffset) {
        throw new Error("Overlapping edit");
      } else if (startOffset > lastModifiedOffset) {
        spans.push(text.substring(lastModifiedOffset, startOffset));
      }
      if (e.newText.length) {
        spans.push(e.newText);
      }
      lastModifiedOffset = document.cursor.offsetAt(e.range.end);
    }
    spans.push(text.substring(lastModifiedOffset));
    return spans.join("");
  },
};

export class DocumentCursor {
  private readonly newlineOffsets: number[];

  constructor(private readonly text: string) {
    this.newlineOffsets = [0];
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (isEOL(ch)) {
        if (
          ch === 13 /* CharCode.CarriageReturn */ &&
          i + 1 < text.length &&
          text.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */
        ) {
          i++;
        }
        this.newlineOffsets.push(i + 1);
      }
    }
  }

  public get textLength(): number {
    return this.text.length;
  }

  public get lineCount(): number {
    return this.newlineOffsets.length;
  }

  /**
   * Converts a zero-based offset to a position.
   *
   * @param offset A zero-based offset.
   * @return A valid {@link Position position}.
   * @example The text document "ab\ncd" produces:
   * * position { line: 0, character: 0 } for `offset` 0.
   * * position { line: 0, character: 1 } for `offset` 1.
   * * position { line: 0, character: 2 } for `offset` 2.
   * * position { line: 1, character: 0 } for `offset` 3.
   * * position { line: 1, character: 1 } for `offset` 4.
   */
  public positionAt(offset: number): Position {
    offset = Math.max(Math.min(offset, this.textLength), 0);
    const lineOffsets = this.newlineOffsets;
    let low = 0,
      high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    // low is the least x for which the line offset is larger than the current offset
    // or array.length if no line offset is larger than the current offset
    const line = low - 1;
    return { line, character: offset - lineOffsets[line] };
  }

  /**
   * Converts the position to a zero-based offset.
   * Invalid positions are adjusted as described in {@link Position.line}
   * and {@link Position.character}.
   *
   * @param position A position.
   * @return A valid zero-based offset.
   */
  public offsetAt(position: Position): number {
    if (position.line >= this.newlineOffsets.length) {
      return this.textLength;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = this.newlineOffsets[position.line];
    if (position.character <= 0) {
      return lineOffset;
    }
    const nextLineOffset =
      position.line + 1 < this.newlineOffsets.length
        ? this.newlineOffsets[position.line + 1]
        : this.textLength;
    return Math.min(lineOffset + position.character, nextLineOffset);
  }

  public offsetToDisplayPos(offset: number): { line: number; character: number } {
    const pos = this.positionAt(offset);
    return { line: pos.line + 1, character: pos.character + 1 };
  }

  public getSurroundingContext(
    pos: number,
    end: number,
    surroundingLines: number,
  ): { contextPos: number; contextEnd: number } {
    const startLine = this.positionAt(pos).line;
    const endLine = this.positionAt(end).line;

    const contextStartLine = Math.max(0, startLine - surroundingLines);
    const contextPos = this.newlineOffsets[contextStartLine];

    const contextEndLineWithContent = Math.min(this.lineCount - 1, endLine + surroundingLines);

    const nextLineAfterContext = contextEndLineWithContent + 1;
    let contextEnd: number;
    if (nextLineAfterContext < this.lineCount) {
      const nextLineStart = this.newlineOffsets[nextLineAfterContext];
      let eolLength = 1;
      if (nextLineStart > 0 && this.text.charCodeAt(nextLineStart - 1) === 10) {
        if (nextLineStart > 1 && this.text.charCodeAt(nextLineStart - 2) === 13) {
          eolLength = 2;
        }
      }
      contextEnd = nextLineStart - eolLength;
    } else {
      contextEnd = this.textLength;
    }

    return { contextPos, contextEnd };
  }

  public rangeAt(range: { pos: number; end: number }): Range {
    return {
      start: this.positionAt(range.pos),
      end: this.positionAt(range.end),
    };
  }

  public offsetRangeAt(range: Range): { pos: number; end: number } {
    return {
      pos: this.offsetAt(range.start),
      end: this.offsetAt(range.end),
    };
  }
}

class FullTextDocument implements TextDocument {
  private _cachedParse:
    | {
        getText: GetText;
        parseResult: ParseResult;
        version: number;
      }
    | {
        getText: undefined;
        parseResult: undefined;
        version: undefined;
      };

  public cursor: DocumentCursor;

  constructor(
    public readonly uri: DocumentUri,
    public readonly languageId: string,
    public version: number,
    private _content: string,
  ) {
    this._cachedParse = {
      getText: undefined,
      parseResult: undefined,
      version: undefined,
    };
    this.cursor = new DocumentCursor(_content);
  }

  public get lineCount(): number {
    return this.cursor.lineCount;
  }

  public getText(range?: Range): string {
    if (range) {
      const start = this.cursor.offsetAt(range.start);
      const end = this.cursor.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }

  public parse(): { parseResult: ParseResult; getText: GetText } {
    if (this._cachedParse.version && this._cachedParse.version === this.version) {
      return {
        parseResult: this._cachedParse.parseResult,
        getText: this._cachedParse.getText,
      };
    }

    const parser = createXmlUiParser(this.getText());
    const getText = parser.getText;

    const parseResult = parser.parse();

    this._cachedParse.getText = parser.getText;
    this._cachedParse.parseResult = parseResult;
    this._cachedParse.version = this.version;

    return { parseResult, getText };
  }

  public update(changes: TextDocumentContentChangeEvent[], version: number): void {
    for (const change of changes) {
      if (isIncremental(change)) {
        const range = getWellformedRange(change.range);
        const startOffset = this.cursor.offsetAt(range.start);
        const endOffset = this.cursor.offsetAt(range.end);
        this._content =
          this._content.substring(0, startOffset) +
          change.text +
          this._content.substring(endOffset, this._content.length);
      } else if (isFull(change)) {
        this._content = change.text;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this.cursor = new DocumentCursor(this._content);
    this.version = version;
  }
}

function isIncremental(
  event: TextDocumentContentChangeEvent,
): event is { range: Range; rangeLength?: number; text: string } {
  const candidate = event as any;
  return (
    candidate !== undefined &&
    candidate !== null &&
    typeof candidate.text === "string" &&
    candidate.range !== undefined &&
    (candidate.rangeLength === undefined || typeof candidate.rangeLength === "number")
  );
}

function isFull(event: TextDocumentContentChangeEvent): event is { text: string } {
  const candidate = event as any;
  return (
    candidate !== undefined &&
    candidate !== null &&
    typeof candidate.text === "string" &&
    candidate.range === undefined &&
    candidate.rangeLength === undefined
  );
}

function mergeSort<T>(data: T[], compare: (a: T, b: T) => number): T[] {
  if (data.length <= 1) {
    // sorted
    return data;
  }
  const p = (data.length / 2) | 0;
  const left = data.slice(0, p);
  const right = data.slice(p);
  mergeSort(left, compare);
  mergeSort(right, compare);
  let leftIdx = 0;
  let rightIdx = 0;
  let i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    const ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      // smaller_equal -> take left to preserve order
      data[i++] = left[leftIdx++];
    } else {
      // greater -> take right
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}

function isEOL(char: number): boolean {
  return char === 13 /* CharCode.CarriageReturn */ || char === 10 /* CharCode.LineFeed */;
}

function getWellformedRange(range: Range): Range {
  const start = range.start;
  const end = range.end;
  if (start.line > end.line || (start.line === end.line && start.character > end.character)) {
    return { start: end, end: start };
  }
  return range;
}

function getWellformedEdit(textEdit: TextEdit): TextEdit {
  const range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}
