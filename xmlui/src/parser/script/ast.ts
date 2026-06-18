import type { ParserDiagnostic } from "../common/diagnostics";
import type { SourceId, SourceSpan, SourceText, TextSource } from "../common/source";
import type { ScriptToken } from "./scanner";

export type ScriptNodeKind =
  | "Program"
  | "ExpressionStatement"
  | "Identifier"
  | "Literal"
  | "MemberExpression"
  | "CallExpression"
  | "UnaryExpression"
  | "BinaryExpression"
  | "AssignmentExpression"
  | "PostfixExpression"
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
};

export type CallExpressionNode = ScriptNodeBase & {
  kind: "CallExpression";
  callee: ScriptNode;
  args: ScriptNode[];
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

export type AssignmentExpressionNode = ScriptNodeBase & {
  kind: "AssignmentExpression";
  operator: string;
  left: ScriptNode;
  right: ScriptNode;
};

export type PostfixExpressionNode = ScriptNodeBase & {
  kind: "PostfixExpression";
  operator: string;
  argument: ScriptNode;
};

export type ErrorNode = ScriptNodeBase & {
  kind: "Error";
};

export type ScriptNode =
  | ProgramNode
  | ExpressionStatementNode
  | IdentifierNode
  | LiteralNode
  | MemberExpressionNode
  | CallExpressionNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | AssignmentExpressionNode
  | PostfixExpressionNode
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
