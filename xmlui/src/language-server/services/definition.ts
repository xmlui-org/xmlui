import { type Location } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, Position } from "../base/text-document";
import { findTokenAtOffset } from "../../parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../parsers/xmlui-parser";
import path from "path";

//TODO: handleDefinition is still immature, only works when the component's filename matches the hovered component name, and the returned range should point to the open tag named "Component" in the targe file, not the the very beginning of it.

export function handleDefinition(
  project: Project,
  uri: DocumentUri,
  position: Position,
): Location | null {
  const doc = project.documents.get(uri);
  const {
    parseResult: { node },
    getText,
  } = doc.parse();

  const offset = doc.cursor.offsetAt(position);
  const findRes = findTokenAtOffset(node, offset);
  if (!findRes) {
    return null;
  }

  const targetChain = findRes.chainAtPos;

  const ident = targetChain.at(-1);
  const nameNode = targetChain.at(-2);
  if (nameNode?.kind !== SyntaxKind.TagNameNode || ident?.kind !== SyntaxKind.Identifier) {
    return null;
  }

  if (nameNode.children!.at(-1) !== ident) {
    return null;
  }

  const targetCompName = getText(ident);

  const uris = project.documents.keys();
  for (uri of uris) {
    const compName = path.basename(uri, ".xmlui");
    if (targetCompName === compName) {
      const targetDoc = project.documents.get(uri);
      return {
        uri,
        range: targetDoc.cursor.rangeAt({ pos: 0, end: 0 }),
      };
    }
  }
}
