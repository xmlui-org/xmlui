import type { Node } from "./syntax-node";
import type { GetText } from "./parser";
import { SyntaxKind, getSyntaxKindStrRepr, isInnerNode } from "./syntax-kind";

export function toDbgString(
  node: Node,
  getText: (node: Node) => string,
  indentationLvl: number = 0,
): string {
  const prefix = `${"  ".repeat(indentationLvl)} ${getSyntaxKindStrRepr(node.kind)} @${node.start}..${node.end}`;
  if (!isInnerNode(node.kind)) {
    let tokenText = getText(node);
    if (node.kind === SyntaxKind.NewLineTrivia) {
      tokenText = "*newline*";
    }
    return prefix + ` "${tokenText}"`;
  } else {
    return (
      prefix +
      "\n" +
      node.children?.map((c) => toDbgString(c, getText, indentationLvl + 1)).join("\n")
    );
  }
}

/** Disregards error nodes amongst the children of the 2 compared name node. (Those reported an error earlyer anyways)*/
export function tagNameNodesWithoutErrorsMatch(
  name1: Node,
  name2: Node,
  getText: GetText,
): boolean {
  const children1 = name1.children?.filter((c) => c.kind !== SyntaxKind.ErrorNode) ?? [];
  const children2 = name2.children?.filter((c) => c.kind !== SyntaxKind.ErrorNode) ?? [];

  if (children1.length !== children2.length) {
    return false;
  }
  for (let i = 0; i < children1.length; ++i) {
    if (getText(children1[i]) !== getText(children2[i])) {
      return false;
    }
  }
  return true;
}

/** If the position is in-between two tokens, the chain to the token just before the cursor is provided as well*/
export type FindTokenSuccess =
  | {
      chainAtPos: Node[];

      /** If the position is in-between two tokens, the chain to the token just before the position is provided. */
      chainBeforePos: Node[];

      /**
       * This field specifies the first index where
       * `chainBeforePos` differs from chainAtPos
       */
      sharedParents: number;
    }
  | {
      chainBeforePos: undefined;
      chainAtPos: Node[];
      sharedParents: undefined;
    };

export function findTokenAtPos(node: Node, position: number): FindTokenSuccess | undefined {
  const chain: Node[] = [node];
  let sharedParents: number;

  if (node.start > position || position > node.end) {
    return undefined;
  }

  const res: FindTokenSuccess = {
    chainAtPos: chain,
    chainBeforePos: undefined,
    sharedParents: undefined,
  };

  while (node.children !== undefined && node.children.length > 0) {
    //todo: make it a binary search before finding a fork
    const nodeAtPosIdx = node.children.findIndex(
      (n) =>
        n.start <= position &&
        (position < n.end || (n.kind === SyntaxKind.EndOfFileToken && n.start <= n.end)),
    );

    const nodeAtPos = node.children[nodeAtPosIdx];
    const nodeBeforePos = node.children[nodeAtPosIdx - 1];

    if (nodeBeforePos !== undefined && position <= nodeAtPos.pos) {
      sharedParents = chain.length;

      return {
        chainBeforePos: chain.concat(findLastToken(nodeBeforePos)),
        sharedParents,

        chainAtPos: chain.concat(findFirstToken(nodeAtPos)),
      };
    }

    node = nodeAtPos;
    res.chainAtPos!.push(node);
  }
  return res;
}

function findFirstToken(node: Node): Node[] {
  const chain = [node];
  while (node.children !== undefined && node.children.length > 0) {
    node = node.children[0];
    chain.push(node);
  }
  return chain;
}

function findLastToken(node: Node): Node[] {
  const chain = [node];
  while (node.children !== undefined && node.children.length > 0) {
    node = node.children[node.children.length - 1];
    chain.push(node);
  }
  return chain;
}
