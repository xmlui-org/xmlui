import type { ParserDiagnostic } from "../common/diagnostics";
import type { SourceId, SourceSpan, SourceText, TextSource } from "../common/source";
import type { ScriptToken } from "./scanner";

export type ScriptNodeKind =
  | "Program"
  | "ExpressionStatement"
  | "BlockStatement"
  | "IfStatement"
  | "WhileStatement"
  | "VariableDeclaration"
  | "VariableDeclarator"
  | "Identifier"
  | "Literal"
  | "MemberExpression"
  | "IndexExpression"
  | "CallExpression"
  | "ArrowFunctionExpression"
  | "UnaryExpression"
  | "BinaryExpression"
  | "ConditionalExpression"
  | "AssignmentExpression"
  | "PrefixExpression"
  | "PostfixExpression"
  | "ArrayExpression"
  | "ObjectExpression"
  | "ObjectProperty"
  | "Error";

export type ScriptNodeBase = {
  kind: ScriptNodeKind;
  span: SourceSpan;
  startToken?: ScriptToken;
  endToken?: ScriptToken;
  children?: ScriptNode[];
};

export type ProgramNode = ScriptNodeBase & {
  kind: "Program";
  body: ScriptNode[];
};

export type ExpressionStatementNode = ScriptNodeBase & {
  kind: "ExpressionStatement";
  expression: ScriptNode;
};

export type BlockStatementNode = ScriptNodeBase & {
  kind: "BlockStatement";
  body: ScriptNode[];
};

export type IfStatementNode = ScriptNodeBase & {
  kind: "IfStatement";
  test: ScriptNode;
  consequent: ScriptNode;
  alternate?: ScriptNode;
};

export type WhileStatementNode = ScriptNodeBase & {
  kind: "WhileStatement";
  test: ScriptNode;
  body: ScriptNode;
};

export type VariableDeclarationNode = ScriptNodeBase & {
  kind: "VariableDeclaration";
  declarationKind: "let" | "const";
  declarations: VariableDeclaratorNode[];
};

export type VariableDeclaratorNode = ScriptNodeBase & {
  kind: "VariableDeclarator";
  id: IdentifierNode;
  init?: ScriptNode;
};

export type IdentifierNode = ScriptNodeBase & {
  kind: "Identifier";
  name: string;
};

export type LiteralNode = ScriptNodeBase & {
  kind: "Literal";
  value: string | number | boolean | null | undefined;
  raw: string;
};

export type MemberExpressionNode = ScriptNodeBase & {
  kind: "MemberExpression";
  object: ScriptNode;
  property: IdentifierNode;
  optional?: boolean;
};

export type IndexExpressionNode = ScriptNodeBase & {
  kind: "IndexExpression";
  object: ScriptNode;
  index: ScriptNode;
  optional?: boolean;
};

export type CallExpressionNode = ScriptNodeBase & {
  kind: "CallExpression";
  callee: ScriptNode;
  args: ScriptNode[];
  optional?: boolean;
};

export type ArrowFunctionExpressionNode = ScriptNodeBase & {
  kind: "ArrowFunctionExpression";
  params: IdentifierNode[];
  body: ScriptNode;
};

export type UnaryExpressionNode = ScriptNodeBase & {
  kind: "UnaryExpression";
  operator: string;
  argument: ScriptNode;
};

export type BinaryExpressionNode = ScriptNodeBase & {
  kind: "BinaryExpression";
  operator: string;
  left: ScriptNode;
  right: ScriptNode;
};

export type ConditionalExpressionNode = ScriptNodeBase & {
  kind: "ConditionalExpression";
  test: ScriptNode;
  consequent: ScriptNode;
  alternate: ScriptNode;
};

export type AssignmentExpressionNode = ScriptNodeBase & {
  kind: "AssignmentExpression";
  operator: string;
  left: ScriptNode;
  right: ScriptNode;
};

export type PrefixExpressionNode = ScriptNodeBase & {
  kind: "PrefixExpression";
  operator: string;
  argument: ScriptNode;
};

export type PostfixExpressionNode = ScriptNodeBase & {
  kind: "PostfixExpression";
  operator: string;
  argument: ScriptNode;
};

export type ArrayExpressionNode = ScriptNodeBase & {
  kind: "ArrayExpression";
  elements: ScriptNode[];
};

export type ObjectPropertyNode = ScriptNodeBase & {
  kind: "ObjectProperty";
  key: IdentifierNode | LiteralNode;
  value: ScriptNode;
  shorthand?: boolean;
};

export type ObjectExpressionNode = ScriptNodeBase & {
  kind: "ObjectExpression";
  properties: ObjectPropertyNode[];
};

export type ErrorNode = ScriptNodeBase & {
  kind: "Error";
};

export type ScriptNode =
  | ProgramNode
  | ExpressionStatementNode
  | BlockStatementNode
  | IfStatementNode
  | WhileStatementNode
  | VariableDeclarationNode
  | VariableDeclaratorNode
  | IdentifierNode
  | LiteralNode
  | MemberExpressionNode
  | IndexExpressionNode
  | CallExpressionNode
  | ArrowFunctionExpressionNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | ConditionalExpressionNode
  | AssignmentExpressionNode
  | PrefixExpressionNode
  | PostfixExpressionNode
  | ArrayExpressionNode
  | ObjectPropertyNode
  | ObjectExpressionNode
  | ErrorNode;

export type ParseScriptResult<TNode extends ScriptNode = ScriptNode> = {
  source: SourceText;
  node: TNode;
  diagnostics: ParserDiagnostic[];
};

export type ParseScriptOptions = {
  sourceId?: SourceId;
  originSpan?: SourceSpan;
};

export type ScriptSourceInput = SourceText | TextSource | string;

export type FindScriptNodeSuccess = {
  chainAtPos: ScriptNode[];
  chainBeforePos?: ScriptNode[];
};

export function findScriptNodeAtOffset(
  node: ScriptNode,
  offset: number,
): FindScriptNodeSuccess | undefined {
  if (offset < node.span.start || offset > node.span.end) {
    return undefined;
  }

  const chainAtPos = findChainAtOffset(node, offset) ?? [node];
  const chainBeforePos = findChainBeforeOffset(node, offset);
  return {
    chainAtPos,
    ...(chainBeforePos ? { chainBeforePos } : {}),
  };
}

function findChainAtOffset(node: ScriptNode, offset: number): ScriptNode[] | undefined {
  if (offset < node.span.start || offset > node.span.end) {
    return undefined;
  }

  const children = node.children ?? [];
  for (const child of children) {
    const childChain = findChainAtOffset(child, offset);
    if (childChain) {
      return [node, ...childChain];
    }
  }

  return [node];
}

function findChainBeforeOffset(node: ScriptNode, offset: number): ScriptNode[] | undefined {
  let best: ScriptNode[] | undefined;

  for (const child of node.children ?? []) {
    if (child.span.end <= offset) {
      const childBest = findChainBeforeOffset(child, offset) ?? [child];
      best = [node, ...childBest];
      continue;
    }
    if (child.span.start > offset) {
      break;
    }
  }

  return best;
}
