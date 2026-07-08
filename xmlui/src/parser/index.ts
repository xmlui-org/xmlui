export {
  InputStream,
  SourceText,
  type SourceId,
  type SourcePosition,
  type SourceSpan,
  type TextSource,
} from "./common/source";
export {
  createErrorDiagnostic,
  type ParserDiagnostic,
  type ParserDiagnosticSeverity,
} from "./common/diagnostics";
export type { BaseToken, TokenClassification } from "./common/tokens";
export { MarkupSyntaxKind, isMarkupSyntaxNode, isMarkupTrivia } from "./markup/syntaxKind";
export { MarkupScanner, tokenizeMarkup, type MarkupToken } from "./markup/scanner";
export { parseMarkup, type ParseMarkupResult } from "./markup/parser";
export { ScriptTokenKind, isScriptTrivia } from "./script/tokenKind";
export {
  ScriptScanner,
  tokenizeScript,
  type ScriptToken,
  type TokenizeScriptOptions,
  type TokenizeScriptResult,
} from "./script/scanner";
export {
  findScriptNodeAtOffset,
  type AssignmentExpressionNode,
  type ArrayExpressionNode,
  type ArrowFunctionExpressionNode,
  type BinaryExpressionNode,
  type BlockStatementNode,
  type CallExpressionNode,
  type ConditionalExpressionNode,
  type ErrorNode,
  type ExpressionStatementNode,
  type FindScriptNodeSuccess,
  type IdentifierNode,
  type IfStatementNode,
  type IndexExpressionNode,
  type LiteralNode,
  type MemberExpressionNode,
  type ObjectExpressionNode,
  type ObjectPropertyNode,
  type ParseScriptOptions,
  type ParseScriptResult,
  type PostfixExpressionNode,
  type PrefixExpressionNode,
  type ProgramNode,
  type ReturnStatementNode,
  type ScriptNode,
  type ScriptNodeBase,
  type ScriptNodeKind,
  type ScriptSourceInput,
  type SequenceExpressionNode,
  type TemplateLiteralNode,
  type ThrowStatementNode,
  type UnaryExpressionNode,
  type VariableDeclarationNode,
  type VariableDeclaratorNode,
  type WhileStatementNode,
} from "./script/ast";
export { parseScriptEventHandler, parseScriptExpression } from "./script/parser";
export {
  diagnosticsToLspDiagnostics,
  findMarkupCursorContext,
  findScriptCursorContext,
  markupSemanticTokens,
  scriptSemanticTokens,
  type LspPosition,
  type LspRange,
  type MarkupCursorContext,
  type ParserLspDiagnostic,
  type ParserSemanticToken,
  type ScriptCursorContext,
} from "./lsp";
export {
  createErrorNode,
  createSyntaxNode,
  createTokenNode,
  findTokenAtOffset,
  getNodeText,
  toDebugString,
  type FindTokenSuccess,
  type MarkupSyntaxNode,
} from "./markup/syntaxNode";
