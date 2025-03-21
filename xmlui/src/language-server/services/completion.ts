import type { MarkupContent, CompletionItem} from "vscode-languageserver";
import { CompletionItemKind, MarkupKind } from "vscode-languageserver";
import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos } from "../../parsers/xmlui-parser/utils"
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import * as docGen from "./docs-generation"
import { compNameForTagNameNode, findTagNameNodeInStack } from "./syntax-node-utilities";
import type { ComponentMetadataCollection } from "../../components/collectedComponentMetadata";

type Override<Type, NewType extends { [key in keyof Type]?: NewType[key] }> = Omit<Type, keyof NewType> & NewType;

type XmluiCompletionData = {
  metadataAccessInfo: {
    componentName: string
  } | {
    componentName: string
    prop: string
  }
}

export type XmluiCompletionItem = Override<CompletionItem, { data?: XmluiCompletionData }>;

type CompletionResolveContext = {
  item: XmluiCompletionItem,
  metaByComp: ComponentMetadataCollection
}
export function handleCompletionResolve({ item, metaByComp: metaByComp}: CompletionResolveContext): CompletionItem {
  const metadataAccessInfo = item?.data?.metadataAccessInfo;
  if (metadataAccessInfo) {
    metaByComp.Alert.props
    const { componentName } = metadataAccessInfo;
    const componentMeta = metaByComp[componentName];
    if ("prop" in metadataAccessInfo) {
      const propName = metadataAccessInfo.prop;
      const propMeta = componentMeta.props[propName]
      item.documentation = markupContent(docGen.generatePropDescription(propName, propMeta));
    } else {
      item.documentation = markupContent(docGen.generateCompNameDescription(componentName, componentMeta));
    }
  }
  return item;
}

type CompletionContext = {
  parseResult: ParseResult,
  getText: GetText,
  metaByComp: ComponentMetadataCollection
}

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
      return matchingTagName(findRes as FindTokenSuccessHasBefore, metaByComp, getText);
  }

  const completeForProp = chainBeforePos.some(n =>
      n.kind === SyntaxKind.AttributeKeyNode ||
      n.kind === SyntaxKind.TagNameNode ||
      n.kind === SyntaxKind.AttributeNode
  );

  if(completeForProp){
    const tagNameNode = findTagNameNodeInStack(chainAtPos);
    const compName = compNameForTagNameNode(tagNameNode, getText)
    return completionForNewProps(compName, metaByComp);
  }
  return null;
}

type FindTokenSuccessHasBefore = {
  chainAtPos: Node[];
  chainBeforePos: Node[];
  sharedParents: number;
};

function allComponentNames(md: ComponentMetadataCollection): CompletionItem[] {
  return Object.keys(md).map(componentCompletionItem);
}

function matchingTagName(
  { chainAtPos, chainBeforePos, sharedParents }: FindTokenSuccessHasBefore,
  metaByComp: ComponentMetadataCollection,
  getText: GetText,
): CompletionItem[]|null{
  let parentBefore: Node;
  if (chainBeforePos.length > 1) {
    parentBefore = chainBeforePos[chainBeforePos.length - 2];
  } else if (sharedParents! > 0) {
    parentBefore = chainAtPos[sharedParents! - 1];
  } else {
    return allComponentNames(metaByComp);
  }

  if (parentBefore.kind === SyntaxKind.ElementNode) {
    const nameNode = parentBefore.children!.find((c) => c.kind === SyntaxKind.TagNameNode);
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
    return [componentCompletionItem(value)];
  }
  return null;
}


function handleCompletionInsideToken(chainAtPos: Node[], position: number, metaByComp: ComponentMetadataCollection, getText: (n: Node) => string): CompletionItem[] {
  const parent = chainAtPos.at(-2);
  if (!parent){
    return null;
  }
  switch (parent.kind){
    case SyntaxKind.TagNameNode: {
      return allComponentNames(metaByComp);
    }
    case SyntaxKind.AttributeKeyNode: {
      const tagNameNode = findTagNameNodeInStack(chainAtPos);
      const compName = compNameForTagNameNode(tagNameNode, getText)
      return completionForNewProps(compName, metaByComp);
    }
  }
  return null;
}

function completionForNewProps(compName: string, metaByComp: ComponentMetadataCollection): CompletionItem[] | null {
  const metadata = metaByComp[compName];
  if (!metadata || !metadata.props){
    return null;
  }
  return Object.keys(metadata.props).map((propName) => propCompletionItem(compName, propName));
}

function componentCompletionItem(name:string): XmluiCompletionItem{
  return {
    label: name,
    kind: CompletionItemKind.Constructor,
    labelDetails: {
      description: "Core component"
    },
    data: {
      metadataAccessInfo: {
        componentName: name
      }
    }
  }
}

function propCompletionItem(componentName:string, name:string): XmluiCompletionItem{
  return {
    label: name,
    kind: CompletionItemKind.Property,
    data: {
      metadataAccessInfo:{
        prop: name,
        componentName: componentName,
      }
    }
  }
}

function markupContent(content: string): MarkupContent{
  return {
    kind: MarkupKind.Markdown,
    value: content
  }
}
