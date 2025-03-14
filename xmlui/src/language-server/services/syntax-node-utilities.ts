import type { Node, GetText} from "../../parsers/xmlui-parser";
import { SyntaxKind } from "../../parsers/xmlui-parser";

export function findTagNameNodeInStack(nodeStack: Node[]): Node{

  const elementNode = nodeStack.findLast(n => n.kind === SyntaxKind.ElementNode);
  if (!elementNode){
    return null;
  }

  const tagNameNode =  elementNode.children!.find(n => n.kind === SyntaxKind.TagNameNode);
  return tagNameNode;
}

export function compNameForTagNameNode(tagNameNode: Node, getText: GetText): string | null {
  const colonIdx = tagNameNode.children!.findIndex((n) => n.kind === SyntaxKind.Colon);
    const hasNs = colonIdx === -1 ? false : tagNameNode.children!.slice(0, colonIdx).findIndex((n:Node) => n.kind === SyntaxKind.Identifier) !== -1;
    if(hasNs){
      return null;
    }
    const nameNode = tagNameNode.children!.findLast(c => c.kind === SyntaxKind.Identifier)
    return getText(nameNode);
}
