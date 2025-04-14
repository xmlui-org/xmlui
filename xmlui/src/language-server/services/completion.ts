import type { MarkupContent, CompletionItem } from "vscode-languageserver";
import { CompletionItemKind, MarkupKind } from "vscode-languageserver";
import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { FindTokenSuccess, findTokenAtPos } from "../../parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import * as docGen from "./common/docs-generation";
import { compNameForTagNameNode, findTagNameNodeInStack } from "./common/syntax-node-utilities";
import type { ComponentMetadataCollection } from "./common/types";

type Override<Type, NewType extends { [key in keyof Type]?: NewType[key] }> = Omit<
  Type,
  keyof NewType
> &
  NewType;

/**
 * Additional data that a completion item contains.
 * with that, a completion item can be resolved, thus
 * the sever can query the documentation of a component,
 * prop, etc...
 */
type XmluiCompletionData = {
  metadataAccessInfo:
  | {
    componentName: string;
  }
  | {
    componentName: string;
    prop: string;
  };
};

export type XmluiCompletionItem = Override<CompletionItem, { data?: XmluiCompletionData }>;

type CompletionResolveContext = {
  item: XmluiCompletionItem;
  metaByComp: ComponentMetadataCollection;
};

export function handleCompletionResolve({
  item,
  metaByComp: metaByComp,
}: CompletionResolveContext): CompletionItem {
  const metadataAccessInfo = item?.data?.metadataAccessInfo;
  if (metadataAccessInfo) {
    const { componentName } = metadataAccessInfo;
    const componentMeta = metaByComp[componentName];
    if ("prop" in metadataAccessInfo) {
      const propName = metadataAccessInfo.prop;
      const propMeta = componentMeta.props[propName];
      item.documentation = markupContent(docGen.generatePropDescription(propName, propMeta));
    } else {
      item.documentation = markupContent(
        docGen.generateCompNameDescription(componentName, componentMeta),
      );
    }
  }
  return item;
}

type CompletionContext = {
  parseResult: ParseResult;
  getText: GetText;
  metaByComp: ComponentMetadataCollection;
};

export function handleCompletion(
  { parseResult: { node }, getText, metaByComp }: CompletionContext,
  position: number,
): XmluiCompletionItem[] | null {
  const findRes = findTokenAtPos(node, position);
  if (!findRes) {
    return null;
  }
  const { chainAtPos, chainBeforePos, sharedParents } = findRes;

  if (findRes.chainBeforePos === undefined) {
    return handleCompletionInsideToken(chainAtPos, position, metaByComp, getText);
  }

  const nodeBefore = chainBeforePos.at(-1);
  switch (nodeBefore.kind) {
    case SyntaxKind.OpenNodeStart:
      return allComponentNames(metaByComp);
    case SyntaxKind.CloseNodeStart:
      //TODO: this can be substituted for an function that finds the first ElementNode up the tree
      const closestElementNodeSuspect = chainBeforePos.at(-2) ?? chainAtPos.at(sharedParents - 1)
      if (closestElementNodeSuspect && closestElementNodeSuspect.kind === SyntaxKind.ElementNode){
        return matchingTagName(closestElementNodeSuspect, metaByComp, getText);
      } else {
        return allComponentNames(metaByComp)
      }
  }

  const completeForProp = chainBeforePos.some(
    (n) =>
      n.kind === SyntaxKind.AttributeKeyNode ||
      n.kind === SyntaxKind.TagNameNode ||
      n.kind === SyntaxKind.AttributeNode,
  );

  if (completeForProp) {
    const tagNameNode = findTagNameNodeInStack(chainAtPos);
    const compName = compNameForTagNameNode(tagNameNode, getText);
    return completionForNewProp(compName, metaByComp);
  }
  return null;
}

type FindTokenSuccessHasBefore = {
  chainAtPos: Node[];
  chainBeforePos: Node[];
  sharedParents: number;
};

function allComponentNames(md: ComponentMetadataCollection): CompletionItem[] {
  return Object.keys(md).map((compName) => CompletionItemBuilder.withComponent(compName).componentResolveData().build());
}

/**
*
* @param elementNode has to point to a ElementNode
* @returns
*/
function matchingTagName(
  elementNode: Node,
  metaByComp: ComponentMetadataCollection,
  getText: GetText,
): CompletionItem[] | null {
  const nameNode = elementNode.children!.find((c) => c.kind === SyntaxKind.TagNameNode);
  if (nameNode === undefined) {
    return allComponentNames(metaByComp);
  }
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
    return allComponentNames(metaByComp);
  }
  name = getText(nameIdent);
  const value = nameSpace !== undefined ? nameSpace + ":" + name : name;
  return [CompletionItemBuilder.withComponent(value).build()];
}

function handleCompletionInsideToken(
  chainAtPos: Node[],
  position: number,
  metaByComp: ComponentMetadataCollection,
  getText: (n: Node) => string,
): CompletionItem[] | null {
  const parent = chainAtPos.at(-2);
  if (!parent) {
    return null;
  }
  switch (parent.kind) {
    case SyntaxKind.TagNameNode: {
      const tagNameNodeParent = chainAtPos.at(-3);
      const tagNameNodeIdx = tagNameNodeParent.children!.findIndex(c => c === parent);
      if(tagNameNodeIdx <= 0) {
        return null;
      }
      const previousNode = tagNameNodeParent.children![tagNameNodeIdx - 1];
      console.log({previousNode, tagNameNodeParent})
      if (previousNode.kind === SyntaxKind.CloseNodeStart && tagNameNodeParent.kind === SyntaxKind.ElementNode){
        console.log("matching")
        return matchingTagName(tagNameNodeParent, metaByComp, getText)
      }
      console.log("inside token")
      return allComponentNames(metaByComp);
    }
    case SyntaxKind.AttributeKeyNode: {
      const tagNameNode = findTagNameNodeInStack(chainAtPos);
      const compName = compNameForTagNameNode(tagNameNode, getText);
      return completionForNewProp(compName, metaByComp);
    }
  }
  return null;
}

function completionForNewProp(
  compName: string,
  metaByComp: ComponentMetadataCollection,
): CompletionItem[] | null {
  const metadata = metaByComp[compName];
  if (!metadata || !metadata.props) {
    return null;
  }
  return Object.keys(metadata.props).map((propName) =>
    CompletionItemBuilder.withProp(propName).propResolveData(compName).build()
  );
}

function markupContent(content: string): MarkupContent {
  return {
    kind: MarkupKind.Markdown,
    value: content,
  };
}

class CompletionItemBuilder {
  static withComponent(name: string){
    const item: CompletionItem = {
      label: name,
      kind: CompletionItemKind.Constructor
    };
    return new CompletionItemBuilder(item);
  }

  static withProp(propName: string){
    const item: CompletionItem = {
      label: propName,
      kind: CompletionItemKind.Property
    };
    return new CompletionItemBuilder(item);
  }

  private item: CompletionItem;

  private constructor(item: CompletionItem) {
    this.item = item;
  }

  componentResolveData(): this {
    const data: XmluiCompletionData = {
      metadataAccessInfo: { componentName: this.item.label }
    }
    this.item.data = data;
    return this;
  }

  propResolveData(componentName: string): this {
    const data: XmluiCompletionData = {
      metadataAccessInfo: {
        componentName,
        prop: this.item.label
      }
    }
    this.item.data = data;
    return this;
  }

  build(): CompletionItem {
    return this.item;
  }
}
