import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos, toDbgString } from "../../parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import { compNameForTagNameNode, findTagNameNodeInStack } from "./common/syntax-node-utilities";
import * as docGen from "./common/docs-generation";
import type { ComponentMetadataCollection, MetadataProvider } from "./common/metadata-utils";
import type { Hover,  Position } from "vscode-languageserver";
import { MarkupKind } from "vscode-languageserver";


type SimpleHover = null | {
  value: string;
  range: {
    pos: number;
    end: number;
  };
};

type HoverContex = {
  node: Node;
  getText: GetText;
  metaByComp: MetadataProvider;
  offsetToPosition: (pos: number) => Position;
};

/**
 * @returns The hover content string
 */
export function handleHoverCore(
  { node , getText, metaByComp }: Omit<HoverContex, 'offsetToPosition'>,
  position: number,
): SimpleHover {
  const findRes = findTokenAtPos(node, position);

  if (findRes === undefined) {
    return null;
  }
  const { chainAtPos } = findRes;

  const atNode = chainAtPos.at(-1)!;
  const parentNode = chainAtPos.at(-2);
  switch (atNode.kind) {
    case SyntaxKind.Identifier:
      switch (parentNode?.kind) {
        case SyntaxKind.TagNameNode: {
          return hoverName({
            metaByComp: metaByComp,
            tagNameNode: parentNode,
            identNode: atNode,
            getText
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

export function handleHover(ctx: HoverContex, position: number,): Hover {
  const hoverRes = handleHoverCore(ctx, position);
  if (hoverRes === null){
    return null;
  }
  const { value, range } = hoverRes;
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value,
    },
    range: {
      start: ctx.offsetToPosition(range.pos),
      end: ctx.offsetToPosition(range.end),
    },
  };
}

function hoverAttr({
  metaByComp,
  attrKeyNode,
  parentStack,
  getText,
}: {
  metaByComp: MetadataProvider;
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
  const tag = parentStack.at(-3);
  if (tag?.kind !== SyntaxKind.ElementNode) {
    return null;
  }

  const tagNameNode = findTagNameNodeInStack(parentStack);
  if (!tagNameNode) {
    return null;
  }
  const compName = compNameForTagNameNode(tagNameNode, getText);

  const component = metaByComp.getComponent(compName);
  if (!component) {
    return null;
  }
  const attrKeyChildren = attrKeyNode.children!;
  const identIdx = attrKeyChildren.findIndex((c) => c.kind === SyntaxKind.Identifier);

  if (identIdx === -1) {
    return null;
  }

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

  const attrName = getText(attrIdent);

  const attrMd = component.getAttr(attrName);
  if (!attrMd) {
    return null;
  }
  const value = docGen.generateAttrDescription(attrName, attrMd);
  return {
    value,
    range: {
      pos: attrKeyNode.pos,
      end: attrKeyNode.end,
    },
  };
}

function hoverName({
  metaByComp,
  tagNameNode,
  identNode,
  getText,
}: {
  metaByComp: MetadataProvider;
  tagNameNode: Node;
  identNode: Node;
  getText: GetText;
}): SimpleHover {
  const compName = compNameForTagNameNode(tagNameNode, getText);
  if (!compName) {
    return null;
  }
  const compMetadata = metaByComp.getComponent(compName)?.getMetadata();
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
