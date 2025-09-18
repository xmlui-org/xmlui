/** tokens and nodes combined. Order is significant since the functions below use the numeric values of this enum to check for a range of possible values*/
export const enum SyntaxKind {
  Unknown = 0,
  EndOfFileToken = 1,

  // Trivia (skipped tokens)
  CommentTrivia = 2,
  NewLineTrivia = 3,
  WhitespaceTrivia = 4,

  // Effective tokens
  Identifier = 5,
  /** < */
  OpenNodeStart = 6,
  /** </ */
  CloseNodeStart = 7,
  /** > */
  NodeEnd = 8,
  /** /> */
  NodeClose = 9,
  /** : */
  Colon = 10,
  /** = */
  Equal = 11,
  /** string literal */
  StringLiteral = 12,
  /** <![CDATA[ ... ]]> */
  CData = 13,
  /** <script>...</script> */
  Script = 14,

  // A token created by the parser which contains arbitrary text, but not the '<' character
  TextNode = 15,

  // XMLUI entities
  AmpersandEntity = 16,
  LessThanEntity = 17,
  GreaterThanEntity = 18,
  SingleQuoteEntity = 19,
  DoubleQuoteEntity = 20,

  // Syntax node types
  ElementNode = 21,
  AttributeNode = 22,
  AttributeKeyNode = 23,
  ContentListNode = 24,
  AttributeListNode = 25,
  TagNameNode = 26,
  // should be the last syntax node type
  ErrorNode = 27,
}

export function isTrivia(token: SyntaxKind): boolean {
  return token >= SyntaxKind.CommentTrivia && token <= SyntaxKind.WhitespaceTrivia;
}

export function isInnerNode(token: SyntaxKind): boolean {
  return token >= SyntaxKind.ElementNode && token <= SyntaxKind.ErrorNode;
}

export function getSyntaxKindStrRepr(kind: SyntaxKind): string {
  switch (kind) {
    case SyntaxKind.Unknown:
      return "Unknown";
    case SyntaxKind.EndOfFileToken:
      return "EndOfFileToken";
    case SyntaxKind.CommentTrivia:
      return "CommentTrivia";
    case SyntaxKind.NewLineTrivia:
      return "NewLineTrivia";
    case SyntaxKind.WhitespaceTrivia:
      return "WhitespaceTrivia";
    case SyntaxKind.Identifier:
      return "Identifier";
    case SyntaxKind.OpenNodeStart:
      return "OpenNodeStart";
    case SyntaxKind.CloseNodeStart:
      return "CloseNodeStart";
    case SyntaxKind.NodeEnd:
      return "NodeEnd";
    case SyntaxKind.NodeClose:
      return "NodeClose";
    case SyntaxKind.Colon:
      return "Colon";
    case SyntaxKind.Equal:
      return "Equal";
    case SyntaxKind.StringLiteral:
      return "StringLiteral";
    case SyntaxKind.CData:
      return "CData";
    case SyntaxKind.Script:
      return "Script";
    case SyntaxKind.AmpersandEntity:
      return "AmpersandEntity";
    case SyntaxKind.LessThanEntity:
      return "LessThanEntity";
    case SyntaxKind.GreaterThanEntity:
      return "GreaterThanEntity";
    case SyntaxKind.SingleQuoteEntity:
      return "SingleQuoteEntity";
    case SyntaxKind.DoubleQuoteEntity:
      return "DoubleQuoteEntity";
    case SyntaxKind.ElementNode:
      return "ElementNode";
    case SyntaxKind.AttributeNode:
      return "AttributeNode";
    case SyntaxKind.TextNode:
      return "TextNode";
    case SyntaxKind.ContentListNode:
      return "ContentListNode";
    case SyntaxKind.AttributeListNode:
      return "AttributeListNode";
    case SyntaxKind.TagNameNode:
      return "TagNameNode";
    case SyntaxKind.ErrorNode:
      return "ErrorNode";
    case SyntaxKind.AttributeKeyNode:
      return "AttributeKeyNode";
  }
  return assertUnreachable(kind);
}

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
