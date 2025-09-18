import type { MarkupContent, CompletionItem } from "vscode-languageserver";
import { CompletionItemKind, MarkupKind } from "vscode-languageserver";
import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos } from "../../parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import * as docGen from "./common/docs-generation";
import {
  compNameForTagNameNode,
  findTagNameNodeInStack,
  getFirstNodeFromAncestorChain,
  insideClosingTag,
  visitAncestorsInChain,
} from "./common/syntax-node-utilities";
import {
  addOnPrefix,
  type AttributeKind,
  type MetadataProvider,
  type TaggedAttribute,
} from "./common/metadata-utils";

type Override<Type, NewType extends { [key in keyof Type]?: NewType[key] }> = Omit<
  Type,
  keyof NewType
> &
  NewType;

/**
 * Additional data that a completion item contains.
 * with that, a completion item can be resolved, thus
 * the sever can query the documentation of a component,
 * prop, event etc...
 */
type XmluiCompletionData = {
  metadataAccessInfo: {
    componentName: string;
    attribute?: TaggedAttribute;
  };
};

export type XmluiCompletionItem = Override<CompletionItem, { data?: XmluiCompletionData }>;

type CompletionResolveContext = {
  item: XmluiCompletionItem;
  metaByComp: MetadataProvider;
};

export function handleCompletionResolve({
  item,
  metaByComp: metaByComp,
}: CompletionResolveContext): CompletionItem {
  const metadataAccessInfo = item?.data?.metadataAccessInfo;
  if (metadataAccessInfo) {
    const { componentName, attribute } = metadataAccessInfo;
    const componentMeta = metaByComp.getComponent(componentName);
    if (!componentMeta) {
      return null;
    }
    if (attribute) {
      const attributeMetadata = componentMeta.getAttrForKind(attribute);
      item.documentation = markupContent(
        docGen.generateAttrDescription(attribute.name, attributeMetadata),
      );
    } else {
      item.documentation = markupContent(
        docGen.generateCompNameDescription(componentName, componentMeta.getMetadata()),
      );
    }
  }
  return item;
}

type CompletionContext = {
  parseResult: ParseResult;
  getText: GetText;
  metaByComp: MetadataProvider;
};

export function handleCompletion(
  { parseResult: { node }, getText, metaByComp }: CompletionContext,
  position: number,
): XmluiCompletionItem[] | null {
  const findRes = findTokenAtPos(node, position);
  if (!findRes) {
    return null;
  }
  const { chainAtPos, chainBeforePos } = findRes;

  if (findRes.chainBeforePos === undefined) {
    return handleCompletionInsideToken(chainAtPos, position, metaByComp, getText);
  }

  const nodeBefore = chainBeforePos.at(-1);
  switch (nodeBefore.kind) {
    case SyntaxKind.OpenNodeStart:
      const defaultCompNames = allComponentNames(metaByComp);
      const closestElementNodeSuspect = chainBeforePos.at(-2);

      if (closestElementNodeSuspect && closestElementNodeSuspect.kind === SyntaxKind.ElementNode) {
        const matchingNode = getFirstNodeFromAncestorChain(
          chainBeforePos.slice(0, -3),
          SyntaxKind.ElementNode,
        );
        if (!matchingNode) return defaultCompNames;

        const compName = getNameFromElement(matchingNode, getText);
        if (!compName) return defaultCompNames;

        const compNameSuggestion = componentCompletionItem("/" + compName, 0);
        return [compNameSuggestion, ...defaultCompNames.map((c) => ({ ...c, sortText: "1" }))];
      }
      return defaultCompNames;

    case SyntaxKind.CloseNodeStart: {
      //TODO: this can be substituted for an function that finds the first ElementNode up the tree
      const closestElementNodeSuspect = chainBeforePos.at(-2);
      if (closestElementNodeSuspect && closestElementNodeSuspect.kind === SyntaxKind.ElementNode) {
        const compName = getNameFromElement(closestElementNodeSuspect, getText);
        if (!compName) return allComponentNames(metaByComp);
        return [componentCompletionItem(compName)];
      } else {
        return allComponentNames(metaByComp);
      }
    }
    case SyntaxKind.Identifier:
      const pathToElementNode = visitAncestorsInChain(
        chainBeforePos,
        (n) => n.kind === SyntaxKind.ElementNode,
      );
      const parentOfnodeBefore = chainBeforePos.at(-2);
      const completeCompName =
        parentOfnodeBefore?.kind === SyntaxKind.TagNameNode && position === nodeBefore.end;
      if (completeCompName) {
        if (pathToElementNode && insideClosingTag(pathToElementNode)) {
          const compName = getNameFromElement(pathToElementNode.at(-1), getText);
          if (!compName) return allComponentNames(metaByComp);
          return [componentCompletionItem(compName)];
        }
        return allComponentNames(metaByComp);
      }
  }

  const completeForProp = chainBeforePos.some(
    (n) =>
      n.kind === SyntaxKind.AttributeKeyNode ||
      n.kind === SyntaxKind.TagNameNode ||
      n.kind === SyntaxKind.AttributeNode,
  );

  if (completeForProp) {
    const tagNameNode = findTagNameNodeInStack(chainBeforePos);
    if (!tagNameNode) {
      return null;
    }
    const compName = compNameForTagNameNode(tagNameNode, getText);
    if (!compName) {
      return null;
    }
    return completionForNewAttr(compName, metaByComp);
  }
  return null;
}

function allComponentNames(md: MetadataProvider): XmluiCompletionItem[] {
  return md.componentNames().map(componentCompletionItem);
}

/**
 * Retrieves the name from an ElementNode
 * @param elementNode has to point to a ElementNode
 * @returns
 */
function getNameFromElement(elementNode: Node, getText: GetText): string | null {
  const nameNode = elementNode.children!.find((c) => c.kind === SyntaxKind.TagNameNode);
  if (nameNode === undefined) {
    return null;
  }
  // --- Handle namespaces
  const colonIdx = nameNode.children!.findIndex((c) => c.kind === SyntaxKind.Colon);
  let nameSpace: string | undefined = undefined;
  let nameIdentSearchSpace = nameNode.children!;
  let name: string | undefined = undefined;
  if (colonIdx !== -1) {
    nameIdentSearchSpace = nameNode.children!.slice(colonIdx + 1);
    const nameSpaceIdx = nameNode.children!.findIndex((c) => c.kind === SyntaxKind.Identifier);
    if (nameSpaceIdx < colonIdx) {
      nameSpace = getText(nameNode.children![nameSpaceIdx]);
    }
  }
  const nameIdent = nameIdentSearchSpace.find((c) => c.kind === SyntaxKind.Identifier);
  if (nameIdent === undefined) {
    return null;
  }
  name = getText(nameIdent);
  const value = nameSpace !== undefined ? nameSpace + ":" + name : name;
  return value;
}

function handleCompletionInsideToken(
  chainAtPos: Node[],
  position: number,
  metaByComp: MetadataProvider,
  getText: (n: Node) => string,
): CompletionItem[] | null {
  const parent = chainAtPos.at(-2);
  if (!parent) {
    return null;
  }
  switch (parent.kind) {
    case SyntaxKind.TagNameNode: {
      const tagNameNodeParent = chainAtPos.at(-3);
      const tagNameNodeIdx = tagNameNodeParent.children!.findIndex((c) => c === parent);
      if (tagNameNodeIdx <= 0) {
        return null;
      }
      const previousNode = tagNameNodeParent.children![tagNameNodeIdx - 1];
      if (
        previousNode.kind === SyntaxKind.CloseNodeStart &&
        tagNameNodeParent.kind === SyntaxKind.ElementNode
      ) {
        const compName = getNameFromElement(tagNameNodeParent, getText);
        if (!compName) return allComponentNames(metaByComp);
        return [componentCompletionItem(compName)];
      }
      return allComponentNames(metaByComp);
    }
    case SyntaxKind.AttributeKeyNode: {
      const tagNameNode = findTagNameNodeInStack(chainAtPos);
      const compName = compNameForTagNameNode(tagNameNode, getText);
      return completionForNewAttr(compName, metaByComp);
    }
  }
  return null;
}

function completionForNewAttr(
  compName: string,
  metaByComp: MetadataProvider,
): CompletionItem[] | null {
  const metadata = metaByComp.getComponent(compName);
  if (!metadata) {
    return null;
  }

  const completionItemFromAttr = attributeCompletionItem.bind({}, compName);
  return metadata.getAllAttributes().map(completionItemFromAttr);
}

function attrKindToCompletionItemKind(attrKind: AttributeKind) {
  switch (attrKind) {
    case "api":
      return CompletionItemKind.Function;
    case "event":
      return CompletionItemKind.Event;
    case "layout":
      return CompletionItemKind.Unit;
    case "prop":
    case "implicit":
      return CompletionItemKind.Property;
    default:
      const _exhaustiveCheck: never = attrKind;
      return _exhaustiveCheck;
  }
}

function attributeCompletionItem(
  componentName: string,
  attribute: TaggedAttribute,
): XmluiCompletionItem {
  const label = attribute.kind === "event" ? addOnPrefix(attribute.name) : attribute.name;
  return {
    label,
    kind: attrKindToCompletionItemKind(attribute.kind),
    sortText: attributeDisplayOrder(attribute.kind) + label,
    data: {
      metadataAccessInfo: {
        componentName,
        attribute,
      },
    },
  };
}

function componentCompletionItem(
  componentName: string,
  sortingOrder?: number,
): XmluiCompletionItem {
  const sortText =
    sortingOrder !== undefined &&
    sortingOrder !== 0 &&
    sortingOrder !== null &&
    !isNaN(sortingOrder)
      ? sortingOrder.toString()
      : "";
  return {
    label: componentName,
    kind: CompletionItemKind.Constructor,
    sortText,
    data: {
      metadataAccessInfo: {
        componentName,
      },
    },
  };
}

function markupContent(content: string): MarkupContent {
  return {
    kind: MarkupKind.Markdown,
    value: content,
  };
}
function attributeDisplayOrder(kind: AttributeKind): string {
  switch (kind) {
    case "api":
    case "prop":
    case "implicit":
    case "event":
      return "0";

    case "layout":
      return "1";
    default: {
      const _exhaustiveCheck: never = kind;
      return _exhaustiveCheck;
    }
  }
}
