import {
  MarkupSyntaxKind,
  parseScriptEventHandler,
  parseScriptExpression,
  SourceText,
  tokenizeMarkup,
  tokenizeScript,
  type MarkupToken,
  type ScriptNode,
  type ScriptToken,
  type SourceSpan,
} from "../../../xmlui/src/parser";

export const tokenTypes = [
  "xmluiTag",
  "xmluiAttribute",
  "xmluiText",
  "comment",
  "string",
  "keyword",
  "operator",
  "variable",
  "number",
  "xmluiSpecial",
  "xmluiMember",
  "xmluiWriteTarget",
] as const;

export type XmluiSemanticTokenType = (typeof tokenTypes)[number];

export type XmluiSemanticToken = {
  line: number;
  character: number;
  length: number;
  tokenType: XmluiSemanticTokenType;
};

type MarkupContext = "content" | "openTag" | "closeTag" | "afterTagName" | "attributeValue";

export function collectXmluiSemanticTokens(text: string): XmluiSemanticToken[] {
  const source = new SourceText(text, "document.xmlui");
  const { tokens } = tokenizeMarkup(source);
  const semanticTokens: XmluiSemanticToken[] = [];
  let context: MarkupContext = "content";
  let currentAttributeName: string | undefined;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    switch (token.kind) {
      case MarkupSyntaxKind.OpenNodeStart:
        context = "openTag";
        pushToken(semanticTokens, source, token.span, "operator");
        break;
      case MarkupSyntaxKind.CloseNodeStart:
        context = "closeTag";
        pushToken(semanticTokens, source, token.span, "operator");
        break;
      case MarkupSyntaxKind.NodeEnd:
      case MarkupSyntaxKind.NodeClose:
      case MarkupSyntaxKind.Equal:
      case MarkupSyntaxKind.Dot:
        if (token.kind === MarkupSyntaxKind.NodeEnd || token.kind === MarkupSyntaxKind.NodeClose) {
          context = "content";
          currentAttributeName = undefined;
        }
        pushToken(semanticTokens, source, token.span, "operator");
        break;
      case MarkupSyntaxKind.Identifier:
        if (context === "openTag" || context === "closeTag") {
          context = "afterTagName";
          pushToken(semanticTokens, source, token.span, "xmluiTag");
        } else if (context === "afterTagName") {
          currentAttributeName = collectAttributeName(tokens, index);
          pushToken(semanticTokens, source, token.span, "xmluiAttribute");
        }
        break;
      case MarkupSyntaxKind.StringLiteral:
        context = "afterTagName";
        pushToken(semanticTokens, source, token.span, "string");
        pushEmbeddedScriptTokens(semanticTokens, source, token, currentAttributeName);
        currentAttributeName = undefined;
        break;
      case MarkupSyntaxKind.Text:
        pushToken(semanticTokens, source, token.span, "xmluiText");
        pushTextExpressionTokens(semanticTokens, source, token);
        break;
      case MarkupSyntaxKind.CommentTrivia:
        pushToken(semanticTokens, source, token.span, "comment");
        break;
    }
  }

  return semanticTokens.sort((a, b) => a.line - b.line || a.character - b.character);
}

function pushEmbeddedScriptTokens(
  semanticTokens: XmluiSemanticToken[],
  source: SourceText,
  token: MarkupToken,
  attributeName: string | undefined,
): void {
  const value = token.value ?? "";
  if (!attributeName || !isScriptAttribute(attributeName)) {
    pushTextExpressionTokens(semanticTokens, source, token, value, token.span.start + 1);
    return;
  }

  const originSpan = {
    sourceId: source.id,
    start: token.span.start + 1,
    end: token.span.end - 1,
  };
  const scriptTokens = tokenizeScript(value, { originSpan }).tokens;
  const parsed = parseScriptEventHandler(value, { originSpan });
  pushScriptTokens(semanticTokens, source, scriptTokens, parsed.node);
}

function pushTextExpressionTokens(
  semanticTokens: XmluiSemanticToken[],
  source: SourceText,
  token: MarkupToken,
  text: string = token.text,
  baseOffset: number = token.span.start,
): void {
  let cursor = 0;
  while (cursor < text.length) {
    const open = text.indexOf("{", cursor);
    if (open < 0) {
      return;
    }
    const close = text.indexOf("}", open + 1);
    if (close < 0) {
      return;
    }
    const expression = text.slice(open + 1, close);
    const originSpan = {
      sourceId: source.id,
      start: baseOffset + open + 1,
      end: baseOffset + close,
    };
    const scriptTokens = tokenizeScript(expression, { originSpan }).tokens;
    const parsed = parseScriptExpression(expression, { originSpan });
    pushScriptTokens(semanticTokens, source, scriptTokens, parsed.node);
    cursor = close + 1;
  }
}

function pushScriptTokens(
  semanticTokens: XmluiSemanticToken[],
  source: SourceText,
  scriptTokens: ScriptToken[],
  root?: ScriptNode,
): void {
  for (const token of scriptTokens) {
    if (token.text.length === 0) {
      continue;
    }
    if (token.classification === "identifier") {
      continue;
    }
    const type = scriptTokenType(token);
    if (type) {
      pushToken(semanticTokens, source, token.span, type);
    }
  }
  if (root) {
    pushScriptAstTokens(semanticTokens, source, root);
  }
}

function pushScriptAstTokens(
  semanticTokens: XmluiSemanticToken[],
  source: SourceText,
  node: ScriptNode,
  parent?: ScriptNode,
): void {
  switch (node.kind) {
    case "Identifier":
      pushToken(
        semanticTokens,
        source,
        node.span,
        node.name.startsWith("$") ? "xmluiSpecial" : "variable",
      );
      break;
    case "MemberExpression":
      pushScriptAstTokens(semanticTokens, source, node.object, node);
      pushToken(semanticTokens, source, node.property.span, "xmluiMember");
      return;
    case "AssignmentExpression":
      if (node.left.kind === "Identifier" || node.left.kind === "MemberExpression") {
        pushWriteTargetToken(semanticTokens, source, node.left);
      } else {
        pushScriptAstTokens(semanticTokens, source, node.left, node);
      }
      pushScriptAstTokens(semanticTokens, source, node.right, node);
      return;
    case "PrefixExpression":
      if (node.argument.kind === "Identifier" || node.argument.kind === "MemberExpression") {
        pushWriteTargetToken(semanticTokens, source, node.argument);
        return;
      }
      break;
    case "PostfixExpression":
      if (node.argument.kind === "Identifier" || node.argument.kind === "MemberExpression") {
        pushWriteTargetToken(semanticTokens, source, node.argument);
        return;
      }
      break;
  }

  for (const child of node.children ?? []) {
    if (child !== parent) {
      pushScriptAstTokens(semanticTokens, source, child, node);
    }
  }
}

function pushWriteTargetToken(
  semanticTokens: XmluiSemanticToken[],
  source: SourceText,
  node: ScriptNode,
): void {
  if (node.kind === "Identifier") {
    pushToken(semanticTokens, source, node.span, "xmluiWriteTarget");
    return;
  }
  if (node.kind === "MemberExpression") {
    pushScriptAstTokens(semanticTokens, source, node.object, node);
    pushToken(semanticTokens, source, node.property.span, "xmluiWriteTarget");
  }
}

function pushToken(
  semanticTokens: XmluiSemanticToken[],
  source: SourceText,
  span: SourceSpan,
  tokenType: XmluiSemanticTokenType,
): void {
  const start = source.positionAt(span.start);
  const end = source.positionAt(span.end);
  if (start.line !== end.line) {
    return;
  }
  semanticTokens.push({
    line: start.line,
    character: start.column,
    length: Math.max(0, end.column - start.column),
    tokenType,
  });
}

function collectAttributeName(tokens: MarkupToken[], startIndex: number): string {
  let name = "";
  for (let index = startIndex; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.kind === MarkupSyntaxKind.Identifier || token.kind === MarkupSyntaxKind.Dot) {
      name += token.text;
      continue;
    }
    break;
  }
  return name;
}

function isScriptAttribute(attributeName: string): boolean {
  return /^on[A-Z]/.test(attributeName);
}

function scriptTokenType(token: ScriptToken): XmluiSemanticTokenType | undefined {
  switch (token.classification) {
    case "identifier":
      return "variable";
    case "keyword":
      return "keyword";
    case "operator":
      return "operator";
    case "string":
      return token.kind === "NumberLiteral" ? "number" : "string";
    case "comment":
      return "comment";
    default:
      return undefined;
  }
}
