import { GetText } from "./parser";
import { SyntaxKind, getSyntaxKindStrRepr, isInnerNode } from "./syntax-kind";
import { Node } from "./syntax-node";

export function toDbgString(node: Node, getText: (node: Node) => string, indentationLvl: number = 0): string {
  const prefix = `${"  ".repeat(indentationLvl)} ${getSyntaxKindStrRepr(node.kind)} @${node.start}..${node.end}`;
  if (!isInnerNode(node.kind)) {
    let tokenText = getText(node);
    if (node.kind === SyntaxKind.NewLineTrivia) {
      tokenText = "*newline*";
    }
    return prefix + ` "${tokenText}"`;
  } else {
    return prefix + "\n" + node.children?.map((c) => toDbgString(c, getText, indentationLvl + 1)).join("\n");
  }
}

export function tagNameNodesMatch(name1: Node, name2: Node, getText: GetText): boolean{
  const children1 = name1.children ?? [];
  const children2 = name2.children ?? [];

  if(children1.length !== children2.length){
    return false
  }
  for(let i = 0; i < children1.length; ++i){
    if (getText(children1[i]) !== getText(children2[i])){
      return false
    }
  }
  return true
}

/** If the position is in-between two tokens, the chain to the token just before the cursor is provided as well, but the shared parents are inside field chainAtPos */
export type FindTokenSuccess = {
  chainAtPos: Node[];

  /** If the position is in-between two tokens, the chain to the token just before the position is provided.
   stores syntax elements from the fork point to the token */
  chainBeforePos?: Node[];

  /** Only undefined when chainBeforePos is.
   * chainBeforePos starts with the first node or token after the fork point.
   * This field specifies the index of the 0th element of the chainBeforePos if it's parents were part of the array as well. */
  sharedParents?: number;
};

export function findTokenAtPos(node: Node, position: number): FindTokenSuccess | undefined {
  const chain: Node[] = [node];
  let chainBeforePos: Node[];
  let sharedParents: number;

  if (node.start > position || position > node.end) {
    return undefined;
  }

  // if (position === node.end) {
  //   return {
  //     chainBeforePos: findLastToken(node),
  //     sharedParents: 0,
  //   };
  // }
  const res: FindTokenSuccess = { chainAtPos: chain };

  while (node.children !== undefined && node.children.length > 0) {
    //todo: make it a binary search before finding a fork
    const nodeAtPosIdx = node.children.findIndex(
      (n) => n.start <= position && (position < n.end || (n.kind === SyntaxKind.EndOfFileToken && n.start <= n.end))
    );

    const nodeAtPos = node.children[nodeAtPosIdx];
    const nodeBeforePos = node.children[nodeAtPosIdx - 1];

    if (nodeBeforePos !== undefined && position <= nodeAtPos.pos) {
      sharedParents = chain.length;
      chainBeforePos = findLastToken(nodeBeforePos);

      return {
        chainBeforePos,
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
