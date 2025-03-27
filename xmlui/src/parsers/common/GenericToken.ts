// Represents a generic token
export type GenericToken<T> = {
  // The raw text of the token
  text: string;

  // The type of the token
  type: T;

  // Start position in the source stream
  startPosition: number;

  // End position (exclusive) in the source stream
  endPosition: number;

  // Start line number
  startLine: number;

  // End line number of the token
  endLine: number;

  // Start column number of the token
  startColumn: number;

  // End column number of the token
  endColumn: number;
};
