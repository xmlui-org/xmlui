// Represents a generic token
export type GenericToken<T> = {
  // The raw text of the token
  readonly text: string;

  // The type of the token
  readonly type: T;

  // Start position in the source stream
  readonly startPosition: number;

  // End position (exclusive) in the source stream
  readonly endPosition: number;

  // Start line number
  readonly startLine: number;

  // End line number of the token
  readonly endLine: number;

  // Start column number of the token
  readonly startColumn: number;

  // End column number of the token
  readonly endColumn: number;
};
