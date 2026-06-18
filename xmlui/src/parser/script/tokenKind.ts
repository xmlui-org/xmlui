export const ScriptTokenKind = {
  Unknown: "Unknown",
  EndOfFile: "EndOfFile",
  WhitespaceTrivia: "WhitespaceTrivia",
  NewLineTrivia: "NewLineTrivia",
  LineCommentTrivia: "LineCommentTrivia",
  BlockCommentTrivia: "BlockCommentTrivia",
  Identifier: "Identifier",
  NumberLiteral: "NumberLiteral",
  StringLiteral: "StringLiteral",
  TrueKeyword: "TrueKeyword",
  FalseKeyword: "FalseKeyword",
  NullKeyword: "NullKeyword",
  UndefinedKeyword: "UndefinedKeyword",
  Dollar: "Dollar",
  Dot: "Dot",
  OpenParen: "OpenParen",
  CloseParen: "CloseParen",
  OpenBracket: "OpenBracket",
  CloseBracket: "CloseBracket",
  OpenBrace: "OpenBrace",
  CloseBrace: "CloseBrace",
  Comma: "Comma",
  Semicolon: "Semicolon",
  Colon: "Colon",
  Question: "Question",
  LogicalOr: "LogicalOr",
  LogicalAnd: "LogicalAnd",
  Exclamation: "Exclamation",
  Equal: "Equal",
  PlusPlus: "PlusPlus",
} as const;

export type ScriptTokenKind = (typeof ScriptTokenKind)[keyof typeof ScriptTokenKind];

export function isScriptTrivia(kind: ScriptTokenKind): boolean {
  return (
    kind === ScriptTokenKind.WhitespaceTrivia ||
    kind === ScriptTokenKind.NewLineTrivia ||
    kind === ScriptTokenKind.LineCommentTrivia ||
    kind === ScriptTokenKind.BlockCommentTrivia
  );
}
