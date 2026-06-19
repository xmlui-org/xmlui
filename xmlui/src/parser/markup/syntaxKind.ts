export const MarkupSyntaxKind = {
  Unknown: "Unknown",
  EndOfFile: "EndOfFile",
  WhitespaceTrivia: "WhitespaceTrivia",
  NewLineTrivia: "NewLineTrivia",
  CommentTrivia: "CommentTrivia",
  Identifier: "Identifier",
  OpenNodeStart: "OpenNodeStart",
  CloseNodeStart: "CloseNodeStart",
  NodeEnd: "NodeEnd",
  NodeClose: "NodeClose",
  Equal: "Equal",
  Dot: "Dot",
  Colon: "Colon",
  StringLiteral: "StringLiteral",
  Text: "Text",
  Document: "Document",
  ContentList: "ContentList",
  Element: "Element",
  TagName: "TagName",
  AttributeList: "AttributeList",
  Attribute: "Attribute",
  AttributeKey: "AttributeKey",
  Error: "Error",
} as const;

export type MarkupSyntaxKind = (typeof MarkupSyntaxKind)[keyof typeof MarkupSyntaxKind];

export function isMarkupTrivia(kind: MarkupSyntaxKind): boolean {
  return (
    kind === MarkupSyntaxKind.WhitespaceTrivia ||
    kind === MarkupSyntaxKind.NewLineTrivia ||
    kind === MarkupSyntaxKind.CommentTrivia
  );
}

export function isMarkupSyntaxNode(kind: MarkupSyntaxKind): boolean {
  return (
    kind === MarkupSyntaxKind.Document ||
    kind === MarkupSyntaxKind.ContentList ||
    kind === MarkupSyntaxKind.Element ||
    kind === MarkupSyntaxKind.TagName ||
    kind === MarkupSyntaxKind.AttributeList ||
    kind === MarkupSyntaxKind.Attribute ||
    kind === MarkupSyntaxKind.AttributeKey ||
    kind === MarkupSyntaxKind.Error
  );
}
