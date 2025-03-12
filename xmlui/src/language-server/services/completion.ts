import type { CompletionItem } from "vscode-languageserver";
import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos } from "../../parsers/xmlui-parser/utils"
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import { collectedComponentMetadata } from "../../../dist/xmlui-metadata.mjs";
import { compNameForTagNameNode, findTagNameNodeInStack } from "./syntax-node-utilities";

export function handleCompletion(
  { node }: ParseResult,
  position: number,
  getText: (n: Node) => string,
): CompletionItem[] | null {
  const findRes = findTokenAtPos(node, position);
  if (!findRes) {
    return null;
  }
  const { chainAtPos, chainBeforePos, sharedParents } = findRes;

  if (findRes.chainBeforePos === undefined) {
    return handleCompletionInsideToken(chainAtPos, position, getText);
  }

  const nodeBefore = chainBeforePos.at(-1);
  switch (nodeBefore.kind) {
    case SyntaxKind.OpenNodeStart:
      return allComponentNames();
    case SyntaxKind.CloseNodeStart:
      return matchingTagName(findRes as FindTokenSuccessHasBefore, getText);
  }

  const completeForProp = chainBeforePos.some(n =>
      n.kind === SyntaxKind.AttributeKeyNode ||
      n.kind === SyntaxKind.TagNameNode ||
      n.kind === SyntaxKind.AttributeNode
  );

  if(completeForProp){
    const tagNameNode = findTagNameNodeInStack(chainAtPos);
    const compName = compNameForTagNameNode(tagNameNode, getText)
    return completionForNewProps(compName);
  }
  return null;
}

type FindTokenSuccessHasBefore = {
  chainAtPos: Node[];
  chainBeforePos: Node[];
  sharedParents: number;
};

function allComponentNames(): CompletionItem[] {
  return Object.keys(collectedComponentMetadata).map(name => ({label: name}));
}

function matchingTagName(
  { chainAtPos, chainBeforePos, sharedParents }: FindTokenSuccessHasBefore,
  getText: GetText,
): CompletionItem[]|null{
  let parentBefore;
  if (chainBeforePos.length > 1) {
    parentBefore = chainBeforePos[chainBeforePos.length - 2];
  } else if (sharedParents! > 0) {
    parentBefore = chainAtPos[sharedParents! - 1];
  } else {
    return allComponentNames();
  }

  if (parentBefore.kind === SyntaxKind.ElementNode) {
    const nameNode = parentBefore.children!.find((c) => c.kind === SyntaxKind.TagNameNode);
    if (nameNode === undefined) {
      return allComponentNames();
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
      return allComponentNames();
    }
    name = getText(nameIdent);
    const value = nameSpace !== undefined ? nameSpace + ":" + name : name;
    return [{ label: value }];
  }
  return null;
}

function handleCompletionInsideToken(chainAtPos: Node[], position: number, getText: (n: Node) => string): CompletionItem[] {
  const parent = chainAtPos.at(-2);
  if (!parent){
    return null;
  }
  switch (parent.kind){
    case SyntaxKind.TagNameNode: {
      return allComponentNames();
    }
    case SyntaxKind.AttributeKeyNode: {
      const tagNameNode = findTagNameNodeInStack(chainAtPos);
      const compName = compNameForTagNameNode(tagNameNode, getText)
      return completionForNewProps(compName);
    }
  }
  return null;
}

function completionForNewProps(compName: string): CompletionItem[] | null {
  const metadata = collectedComponentMetadata[compName];
  if (!metadata || !metadata.props){
    return null;
  }
  return Object.keys(metadata.props).map(propName => ({ label: propName }));
}
