import type { CompletionItem } from "vscode-languageserver";
import type { GetText, ParseResult } from "../xmlui-parser/parser";
import { findTokenAtPos } from "../xmlui-parser/utils"
import { SyntaxKind } from "../xmlui-parser/syntax-kind";
import { Node } from "../xmlui-parser/syntax-node";
import metadataByComponent from "../metadata";

export function handleCompletion(
  { node }: ParseResult,
  position: number,
  getText: (n: Node) => string,
): CompletionItem[] {
  const findRes = findTokenAtPos(node, position);
  if (findRes === undefined) {
    return [];
  }

  if (findRes.chainBeforePos === undefined) {
    return [];
  }
  const kindBefore = findRes.chainBeforePos[findRes.chainBeforePos.length - 1].kind;
  switch (kindBefore) {
    case SyntaxKind.OpenNodeStart:
      return allComponentNames();
    case SyntaxKind.CloseNodeStart:
      return matchingTagName(findRes as FindTokenSuccessHasBefore, getText);
    default:
      return [];
  }
}

type FindTokenSuccessHasBefore = {
  chainAtPos: Node[];
  chainBeforePos: Node[];
  sharedParents: number;
};

function allComponentNames(){
  return Object.keys(metadataByComponent).map(name => ({label: name}));
}

function matchingTagName(
  { chainAtPos, chainBeforePos, sharedParents }: FindTokenSuccessHasBefore,
  getText: GetText,
): CompletionItem[] {
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
  return [];
}