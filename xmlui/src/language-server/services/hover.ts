import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos, toDbgString } from "../../parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import { compNameForTagNameNode, findTagNameNodeInStack } from "./syntax-node-utilities";
import * as docGen from "./docs-generation";
import type { ComponentMetadataCollection } from "../../components/collectedComponentMetadata";

type SimpleHover = null | {
  value: string;
  range: {
    pos: number;
    end: number;
  };
};

type HoverContex = {
  parseResult: ParseResult;
  getText: GetText;
  metaByComp: ComponentMetadataCollection;
};
/**
 * @returns The hover content string
 */
export function handleHover(
  { parseResult: { node }, getText, metaByComp }: HoverContex,
  position: number,
): SimpleHover {
  const findRes = findTokenAtPos(node, position);
  console.log("findres: ", findRes);

  if (findRes === undefined) {
    return null;
  }
  const { chainAtPos } = findRes;

  const atNode = chainAtPos.at(-1)!;
  const parentNode = chainAtPos.at(-2);
  console.log("hovering: ", atNode, parentNode);
  switch (atNode.kind) {
    case SyntaxKind.Identifier:
      switch (parentNode?.kind) {
        case SyntaxKind.TagNameNode: {
          return hoverName({
            collectedComponentMetadata: metaByComp,
            tagNameNode: parentNode,
            identNode: atNode,
            getText,
          });
        }
        case SyntaxKind.AttributeKeyNode: {
          return hoverAttr({
            metaByComp,
            attrKeyNode: parentNode,
            parentStack: chainAtPos.slice(0, -2),
            getText,
          });
        }
      }
      break;
  }
  return null;
}

function hoverAttr({
  metaByComp,
  attrKeyNode,
  parentStack,
  getText,
}: {
  metaByComp: ComponentMetadataCollection;
  attrKeyNode: Node;
  parentStack: Node[];
  getText: GetText;
}): SimpleHover {
  if (parentStack.at(-1).kind !== SyntaxKind.AttributeNode) {
    return null;
  }
  if (parentStack.at(-2).kind !== SyntaxKind.AttributeListNode) {
    return null;
  }
  // console.log(parentStack.map(n => toDbgString(n, getText)));
  const tag = parentStack.at(-3);
  if (tag?.kind !== SyntaxKind.ElementNode) {
    return null;
  }

  const tagNameNode = findTagNameNodeInStack(parentStack);
  if (!tagNameNode) {
    return null;
  }
  const compName = compNameForTagNameNode(tagNameNode, getText);

  const component = metaByComp[compName];
  if (!component) {
    return null;
  }
  const attrKeyChildren = attrKeyNode.children!;
  const identIdx = attrKeyChildren.findIndex((c) => c.kind === SyntaxKind.Identifier);

  if (identIdx === -1) {
    return null;
  }

  console.log("here");
  const attrIdent = attrKeyChildren[identIdx];
  const propIsNamespaceDefinition =
    attrKeyChildren[identIdx + 1]?.kind === SyntaxKind.Colon &&
    attrKeyChildren[identIdx + 2]?.kind === SyntaxKind.Identifier &&
    getText(attrIdent) === "xmlns";

  if (propIsNamespaceDefinition) {
    return {
      value: `Defines a namespace. TODO Further Documentation needed.`,
      range: {
        pos: attrKeyNode.pos,
        end: attrKeyNode.end,
      },
    };
  }

  const propName = getText(attrIdent);

  const propMetadata = component.props?.[propName];
  if (!propMetadata) {
    return null;
  }
  const value = docGen.generatePropDescription(propName, propMetadata);
  return {
    value,
    range: {
      pos: attrKeyNode.pos,
      end: attrKeyNode.end,
    },
  };
}

function hoverName({
  collectedComponentMetadata,
  tagNameNode,
  identNode,
  getText,
}: {
  collectedComponentMetadata: ComponentMetadataCollection;
  tagNameNode: Node;
  identNode: Node;
  getText: GetText;
}): SimpleHover {
  const compName = compNameForTagNameNode(tagNameNode, getText);
  if (!compName) {
    return null;
  }
  const compMetadata = collectedComponentMetadata[compName];
  if (!compMetadata) {
    return null;
  }
  const value = docGen.generateCompNameDescription(compName, compMetadata);
  return {
    value,
    range: {
      pos: identNode.pos,
      end: identNode.end,
    },
  };
}
