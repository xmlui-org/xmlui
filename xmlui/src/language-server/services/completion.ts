import { CompletionItem } from "vscode-languageserver";
import type { GetText, ParseResult } from "../../parsers/xmlui-parser/parser";
import { findTokenAtPos } from "../../parsers/xmlui-parser/utils"
import { SyntaxKind } from "../../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../../parsers/xmlui-parser/syntax-node";
import metadataByComponent from "../metadata";

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
  const atNode = chainAtPos.at(-1);

  const atEndOfPreceedingNode = atNode.pos === nodeBefore.end;
  const beforeNodeIsIdent = nodeBefore.kind === SyntaxKind.Identifier;

  const preceededByAttrKeyNode = chainBeforePos.findLast(n => n.kind === SyntaxKind.AttributeKeyNode);
  const preceededByNameNode = chainBeforePos.findLast(n => n.kind === SyntaxKind.TagNameNode);
  const preceededByAttrNode = chainBeforePos.findLast(n => n.kind === SyntaxKind.AttributeNode);
  console.log()
  if(preceededByAttrKeyNode || preceededByAttrNode || preceededByNameNode){
    if(!(beforeNodeIsIdent && atEndOfPreceedingNode)){
      return completionForNewProps();
    }
  }

  switch (nodeBefore.kind) {
    case SyntaxKind.OpenNodeStart:
      return allComponentNames();
    case SyntaxKind.CloseNodeStart:
      return matchingTagName(findRes as FindTokenSuccessHasBefore, getText);
    default:
      return null;

      //when would I offer completeion for props?
      //
      // ident preceeds which is inside an attrkeynode. ident's end === position.
        // (first, try without filtering for props starting with ident, see if vscode handles it correctly, or the lang server needs to handle matching the correct prefix.)
      // <A a|>
      // <A ab|="hu">
      //
      // attrNode precedes
      // position is not at the end of the preceeding token, unless it's a string (but the previous stage might already have eliminated this branch)
      // <A abc="hi"|>
      // <A isEnabled |>
      // <A abc="hi" | b="hello" >
      // NameNode preceeds
      // position is not at the end of the preceeding token
      // <A | >
      //
      // atposition ident with attrkey as parent
      // <A isVi|sible >

      // Simplified:
      // 1. attrKeyNode precedes
      // 1.1. before is an ident with end === position
      // 1.2. before is NOT (an ident with end === position)
      // 2. attrNode precedes
      // 2.1. before is an ident with end === position
      // 2.2. before is NOT (an ident with end === position)
      // 3. NameNodepreceeds
      // 3.2 before is NOT (an ident with end === position)
      // 4 inside ident with attrkey as parent
  }
}

type FindTokenSuccessHasBefore = {
  chainAtPos: Node[];
  chainBeforePos: Node[];
  sharedParents: number;
};

function allComponentNames(): CompletionItem[] {
  return Object.keys(metadataByComponent).map(name => ({label: name}));
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
  return null;
}
function completionForNewProps(): CompletionItem[] | null {
  return [{ label: "prop completion!" }];
}
