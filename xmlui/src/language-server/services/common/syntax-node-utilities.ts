import type { Node, GetText } from "../../../parsers/xmlui-parser";
import { SyntaxKind } from "../../../parsers/xmlui-parser";

export function findTagNameNodeInStack(nodeStack: Node[]): Node {
  const elementNode = nodeStack.findLast((n) => n.kind === SyntaxKind.ElementNode);
  if (!elementNode) {
    return null;
  }

  const tagNameNode = elementNode.children!.find((n) => n.kind === SyntaxKind.TagNameNode);
  return tagNameNode;
}

export function compNameForTagNameNode(tagNameNode: Node, getText: GetText): string | null {
  const colonIdx = tagNameNode.children!.findIndex((n) => n.kind === SyntaxKind.Colon);
  const hasNs =
    colonIdx === -1
      ? false
      : tagNameNode
          .children!.slice(0, colonIdx)
          .findIndex((n: Node) => n.kind === SyntaxKind.Identifier) !== -1;
  if (hasNs) {
    return null;
  }
  const nameNode = tagNameNode.children!.findLast((c) => c.kind === SyntaxKind.Identifier);
  return getText(nameNode);
}

/**
 *
 * @param pathToElementNode nodes from the inner most node to the closest ElementNode
 * @returns
 */
export function insideClosingTag(pathToElementNode: Node[]): boolean {
  if (pathToElementNode === null) {
    return false;
  }

  const elementNode = pathToElementNode.at(-1)!;
  const nodeBeforeElementNode = pathToElementNode.at(-2);
  const inputWasOnlyAnElementNode = !nodeBeforeElementNode;

  if (inputWasOnlyAnElementNode) {
    return false;
  }

  const idxClosingStartToken = elementNode.children!.findIndex(
    (n) => n.kind === SyntaxKind.CloseNodeStart,
  );
  if (idxClosingStartToken === -1) {
    return false;
  }

  const idxElementNodeChild = elementNode.children!.findIndex((n) => n === nodeBeforeElementNode);
  if (idxClosingStartToken <= idxElementNodeChild) {
    return true;
  }

  // just in case the guard statements missed a case
  return false;
}

/**
 * Visits ancestors in the chain from the innermost to the outermost node.
 * @param chain The chain of nodes to visit.
 * @param predicate A function that takes a node and returns a boolean.
 * @returns An array of nodes from the innermost to the node that satisfies the predicate, or null if no such node is found.
 */
export function visitAncestorsInChain(
  chain: Node[],
  predicate: (node: Node) => boolean,
): Node[] | null {
  let currentIdx = -1;
  let current = chain.at(currentIdx);
  let path = [current];

  while (current) {
    if (predicate(current)) {
      return path;
    }
    currentIdx--;
    current = chain.at(currentIdx);
    path.push(current);
  }
  return null;
}

/**
 * Finds the first ancestor node of a specific kind in a chain of nodes.
 * @param chain The chain of nodes to search through.
 * @param kind The SyntaxKind to look for.
 * @returns The first ancestor node of the specified kind, or null if not found.
 */
export function getFirstNodeFromAncestorChain(chain: Node[], kind: SyntaxKind): Node | null {
  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].kind === kind) {
      return chain[i];
    }
  }
  return null;
}

/**
 * Finds all ancestor nodes of a specific kind in a chain of nodes.
 * @param chain The chain of nodes to search through.
 * @param kind The SyntaxKind to look for.
 * @returns An array of ancestor nodes of the specified kind.
 */
export function getAllRelevantNodesFromAncestorChain(chain: Node[], kind: SyntaxKind): Node[] {
  const relevantNodes: Node[] = [];
  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].kind === kind) {
      relevantNodes.push(chain[i]);
    }
  }
  return relevantNodes;
}

/**
 *
 * @param node an ElementNode
 */
function isPairedNode(node: Node): boolean {
  for (const c of node.children) {
    if (c.kind === SyntaxKind.CloseNodeStart) {
      return true;
    } else if (c.kind === SyntaxKind.NodeClose) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param node an ElementNode
 */
function isSelfClosingNode(node: Node): boolean {
  return !isPairedNode(node);
}
