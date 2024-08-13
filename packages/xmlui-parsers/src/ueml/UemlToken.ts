// Token types available for parsing
export enum UemlTokenType {
  Eof = -1,
  Ws = -2,
  Unknown = 0,

  // --- UEML specific tokens
  Comment,
  SingleWord,
  Identifier,
  OpenNodeStart,
  CloseNodeStart,
  NodeEnd,
  NodeClose,
  Colon,
  Equal,
  StringLiteral,
  HardLiteral,
  ScriptLiteral,
  NestedText
}

// Represents a generic token
export type UemlToken = {
  // The raw text of the token
  readonly text: string;

  // The type of the token
  readonly type: UemlTokenType;

  // The location of the token
  readonly location: TokenLocation;
};

// Represents the location of a token
interface TokenLocation {
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
}
