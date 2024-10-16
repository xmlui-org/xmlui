/** tokens and nodes combined. Order is significant since the functions below use the numeric values of this enum to check for a range of possible values*/
export const enum SyntaxKind {
  Unknown = 0,
  EndOfFileToken = 1,

  // Trivia (skipped tokens)
  CommentTrivia,
  NewLineTrivia,
  WhitespaceTrivia,

  // Effective tokens
  Identifier,
  OpenNodeStart, // "<"
  CloseNodeStart, // "</"
  NodeEnd, // ">"
  NodeClose, // "/>"
  Colon, // ":"
  Equal, // "="
  StringLiteral,
  CData, // "<![CDATA[" ... "]]>"
  Script, // <script>...</script>

  // A token created by the parser which contains arbitrary text, but not the '<' character
  TextNode,

  // XMLUI entities
  AmpersandEntity,
  LessThanEntity,
  GreaterThanEntity,
  SingleQuoteEntity,
  DoubleQuoteEntity,

  // Syntax node types
  ElementNode,
  AttributeNode,
  AttributeNameNode,
  ContentListNode,
  AttributeListNode,
  TagNameNode,
  // should be the last syntax node type
  ErrorNode,
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
    case SyntaxKind.AttributeNameNode:
      return "AttributeNameNode";
  }
  return assertUnreachable(kind);
}

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
