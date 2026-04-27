import { type Location, type Range } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, Position, TextDocument } from "../base/text-document";
import { findTokenAtOffset } from "../../parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../parsers/xmlui-parser";
import path from "path";
import * as fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const PROJECT_ROOT_MARKERS = ["Main.xmlui", "config.json"];

/**
 * Walk up the file system from the directory containing `docUri` until a
 * directory that contains a project root marker (`Main.xmlui` or `config.json`)
 * is found. Returns a URI prefix (ending in `/`) suitable for `startsWith`
 * comparisons against other document URIs. If no marker is found, falls back
 * to the document's own directory.
 */
function findProjectRoot(docUri: string): string | null {
  let docPath: string;
  try {
    docPath = fileURLToPath(docUri);
  } catch {
    return null;
  }
  let dir = path.dirname(docPath);
  while (true) {
    for (const marker of PROJECT_ROOT_MARKERS) {
      if (fs.existsSync(path.join(dir, marker))) {
        return pathToFileURL(dir).toString() + "/";
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root — no marker found
    dir = parent;
  }
  // Fallback: use the document's own directory (safe degradation)
  return pathToFileURL(path.dirname(docPath)).toString() + "/";
}

/**
 * Returns the range of the `Component` tag-name identifier in the root
 * `<Component>` element of the target user-defined component file. Falls back
 * to the start of the file if no such element is found.
 */
function findComponentTagRange(targetDoc: TextDocument): Range {
  const {
    parseResult: { node },
  } = targetDoc.parse();
  const rootElement = node.children?.find((c) => c.kind === SyntaxKind.ElementNode);
  if (rootElement) {
    const tagNameNode = rootElement.children?.find((c) => c.kind === SyntaxKind.TagNameNode);
    if (tagNameNode) {
      return targetDoc.cursor.rangeAt({ pos: tagNameNode.pos, end: tagNameNode.end });
    }
  }
  return targetDoc.cursor.rangeAt({ pos: 0, end: 0 });
}

/**
 * Returns the value of the `name` attribute from the root `<Component name="…">`
 * element in a UDC file. Returns `null` when the attribute is absent or the
 * document does not start with a `<Component>` element.
 */
function getComponentDeclaredName(targetDoc: TextDocument): string | null {
  const {
    parseResult: { node },
    getText,
  } = targetDoc.parse();
  const rootElement = node.children?.find((c) => c.kind === SyntaxKind.ElementNode);
  if (!rootElement) return null;
  const attrList = rootElement.children?.find((c) => c.kind === SyntaxKind.AttributeListNode);
  if (!attrList) return null;
  for (const attrNode of attrList.children ?? []) {
    if (attrNode.kind !== SyntaxKind.AttributeNode) continue;
    const keyNode = attrNode.children?.find((c) => c.kind === SyntaxKind.AttributeKeyNode);
    if (!keyNode) continue;
    const keyIdent = keyNode.children?.find((c) => c.kind === SyntaxKind.Identifier);
    if (!keyIdent || getText(keyIdent) !== "name") continue;
    // Value is a StringLiteral token that includes surrounding quotes
    const valueLit = attrNode.children?.find((c) => c.kind === SyntaxKind.StringLiteral);
    if (!valueLit) continue;
    const raw = getText(valueLit);
    return raw.length >= 2 ? raw.slice(1, -1) : null;
  }
  return null;
}

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

  const projectRoot = findProjectRoot(uri);
  for (const candidateUri of project.documents.keys()) {
    if (projectRoot && !candidateUri.startsWith(projectRoot)) continue;
    let candidatePath: string;
    try {
      candidatePath = fileURLToPath(candidateUri);
    } catch {
      continue;
    }
    if (!candidatePath.endsWith(".xmlui")) continue;
    const targetDoc = project.documents.get(candidateUri);
    if (!targetDoc) continue;
    // Prefer the declared name attribute; fall back to the filename stem
    const declaredName = getComponentDeclaredName(targetDoc);
    const compName = declaredName ?? path.basename(candidatePath, ".xmlui");
    if (targetCompName !== compName) continue;
    return {
      uri: candidateUri,
      range: findComponentTagRange(targetDoc),
    };
  }
  return null;
}
