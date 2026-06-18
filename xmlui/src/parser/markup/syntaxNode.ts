import type { SourceId, SourceSpan, SourceText } from "../common/source";
import type { TokenClassification } from "../common/tokens";
import type { MarkupToken } from "./scanner";
import { isMarkupSyntaxNode, MarkupSyntaxKind } from "./syntaxKind";
import type { MarkupSyntaxKind as MarkupSyntaxKindType } from "./syntaxKind";

export type MarkupSyntaxNode = {
  kind: MarkupSyntaxKindType;
  sourceId: SourceId;
  start: number;
  pos: number;
  end: number;
  text?: string;
  value?: string;
  classification?: TokenClassification;
  triviaBefore?: MarkupSyntaxNode[];
  children?: MarkupSyntaxNode[];
};

export type FindTokenSuccess =
  | {
      chainAtPos: MarkupSyntaxNode[];
      chainBeforePos: MarkupSyntaxNode[];
      sharedParents: number;
    }
  | {
      chainAtPos: MarkupSyntaxNode[];
      chainBeforePos: undefined;
      sharedParents: undefined;
    };

export function createTokenNode(
  token: MarkupToken,
  triviaBefore?: MarkupSyntaxNode[],
): MarkupSyntaxNode {
  const start = triviaBefore?.[0]?.start ?? token.span.start;
  return {
    kind: token.kind,
    sourceId: token.span.sourceId,
    start,
    pos: token.span.start,
    end: token.span.end,
    text: token.text,
    ...(token.value !== undefined ? { value: token.value } : {}),
    classification: token.classification,
    ...(triviaBefore && triviaBefore.length > 0 ? { triviaBefore } : {}),
  };
}

export function createSyntaxNode(
  kind: MarkupSyntaxKindType,
  children: MarkupSyntaxNode[],
  span?: SourceSpan,
): MarkupSyntaxNode {
  if (!isMarkupSyntaxNode(kind)) {
    throw new Error(`Expected a syntax node kind, got ${kind}.`);
  }

  const firstChild = children[0];
  const lastChild = children.at(-1);
  const sourceId = span?.sourceId ?? firstChild?.sourceId ?? "anonymous.xmlui";
  const pos = span?.start ?? firstChild?.pos ?? 0;
  const end = span?.end ?? lastChild?.end ?? pos;
  const start = firstChild?.start ?? pos;

  return {
    kind,
    sourceId,
    start,
    pos,
    end,
    children,
  };
}

export function createErrorNode(span: SourceSpan, children: MarkupSyntaxNode[] = []) {
  return createSyntaxNode(MarkupSyntaxKind.Error, children, span);
}

export function getNodeText(node: MarkupSyntaxNode, source: SourceText): string {
  if (node.text !== undefined) {
    return node.text;
  }
  return source.slice(node.pos, node.end);
}

export function toDebugString(
  node: MarkupSyntaxNode,
  source: SourceText,
  indentationLevel: number = 0,
): string {
  const prefix = `${"  ".repeat(indentationLevel)}${node.kind} @${node.start}..${node.end}`;
  if (!node.children || node.children.length === 0) {
    const text = node.kind === MarkupSyntaxKind.NewLineTrivia ? "*newline*" : getNodeText(node, source);
    return `${prefix} "${text}"`;
  }

  return [prefix, ...node.children.map((child) => toDebugString(child, source, indentationLevel + 1))].join(
    "\n",
  );
}

export function findTokenAtOffset(
  node: MarkupSyntaxNode,
  offset: number,
): FindTokenSuccess | undefined {
  if (offset < node.start || offset > node.end) {
    return undefined;
  }

  const chain: MarkupSyntaxNode[] = [node];
  let current = node;

  while (current.children && current.children.length > 0) {
    const children = current.children;
    let childAtOffsetIndex = children.findIndex(
      (child) =>
        child.start <= offset &&
        (offset < child.end ||
          (child.kind === MarkupSyntaxKind.EndOfFile && child.start <= offset && offset <= child.end)),
    );

    if (childAtOffsetIndex < 0 && offset === current.end) {
      childAtOffsetIndex = children.length - 1;
    }
    if (childAtOffsetIndex < 0) {
      return {
        chainAtPos: chain,
        chainBeforePos: findLastTokenBefore(children, offset, chain),
        sharedParents: chain.length,
      };
    }

    const childAtOffset = children[childAtOffsetIndex];
    const childBeforeOffset = children[childAtOffsetIndex - 1];

    if (childBeforeOffset && offset <= childAtOffset.pos) {
      const sharedParents = chain.length;
      return {
        chainBeforePos: chain.concat(findLastToken(childBeforeOffset)),
        chainAtPos: chain.concat(findFirstToken(childAtOffset)),
        sharedParents,
      };
    }

    current = childAtOffset;
    chain.push(current);
  }

  return {
    chainAtPos: chain,
    chainBeforePos: undefined,
    sharedParents: undefined,
  };
}

function findLastTokenBefore(
  children: MarkupSyntaxNode[],
  offset: number,
  chain: MarkupSyntaxNode[],
): MarkupSyntaxNode[] {
  for (let index = children.length - 1; index >= 0; index--) {
    const previous = children[index];
    if (previous.end <= offset) {
      return chain.concat(findLastToken(previous));
    }
  }
  return chain;
}

function findFirstToken(node: MarkupSyntaxNode): MarkupSyntaxNode[] {
  const chain = [node];
  let current = node;
  while (current.children && current.children.length > 0) {
    current = current.children[0];
    chain.push(current);
  }
  return chain;
}

function findLastToken(node: MarkupSyntaxNode): MarkupSyntaxNode[] {
  const chain = [node];
  let current = node;
  while (current.children && current.children.length > 0) {
    current = current.children[current.children.length - 1];
    chain.push(current);
  }
  return chain;
}
