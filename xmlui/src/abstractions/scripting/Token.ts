// Represents a generic token
export type Token = {
  // The raw text of the token
  readonly text: string;

  // The type of the token
  readonly type: TokenType;

  // The location of the token
  readonly location: TokenLocation;
};

// Represents the location of a token
export interface TokenLocation {
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

// Token types available for parsing
// Using declare enum to make this a type-only declaration
export declare enum TokenType {
  Eof = -1,
  Ws = -2,
  BlockComment = -3,
  EolComment = -4,
  Unknown = 0,

  // --- Binding Expression specific tokens
  LParent,
  RParent,

  Identifier,

  Exponent,
  Divide,
  Multiply,
  Remainder,
  Plus,
  Minus,
  BitwiseXor,
  BitwiseOr,
  LogicalOr,
  BitwiseAnd,
  LogicalAnd,
  IncOp,
  DecOp,
  Assignment,

  AddAssignment,
  SubtractAssignment,
  ExponentAssignment,
  MultiplyAssignment,
  DivideAssignment,
  RemainderAssignment,
  ShiftLeftAssignment,
  ShiftRightAssignment,
  SignedShiftRightAssignment,
  BitwiseAndAssignment,
  BitwiseXorAssignment,
  BitwiseOrAssignment,
  LogicalAndAssignment,
  LogicalOrAssignment,
  NullCoalesceAssignment,

  Semicolon,
  Comma,
  Colon,
  LSquare,
  RSquare,
  QuestionMark,
  NullCoalesce,
  OptionalChaining,
  BinaryNot,
  LBrace,
  RBrace,
  Equal,
  StrictEqual,
  LogicalNot,
  NotEqual,
  StrictNotEqual,
  LessThan,
  LessThanOrEqual,
  ShiftLeft,
  GreaterThan,
  GreaterThanOrEqual,
  ShiftRight,
  SignedShiftRight,
  Dot,
  Spread,
  Global,
  Backtick,
  DollarLBrace,
  Arrow,

  DecimalLiteral,
  HexadecimalLiteral,
  BinaryLiteral,
  RealLiteral,
  StringLiteral,
  Infinity,
  NaN,
  True,
  False,

  Typeof,
  Null,
  Undefined,
  In,

  Let,
  Const,
  Var,
  If,
  Else,
  Return,
  Break,
  Continue,
  Do,
  While,
  For,
  Of,
  Try,
  Catch,
  Finally,
  Throw,
  Switch,
  Case,
  Default,
  Delete,
  Function,
  Export,
  Import,
  As,
  From,
}
