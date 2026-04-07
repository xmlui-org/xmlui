import { type FoldingRange, FoldingRangeKind } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, TextDocument } from "../base/text-document";
import { SyntaxKind } from "../../parsers/xmlui-parser";
import type { GetText, Node } from "../../parsers/xmlui-parser";

/**
 * Handle folding range requests.
 * Computes fold ranges for a XMLUI document based on its CST structure.
 *
 * Fold ranges are emitted for:
 * - Paired element tags (opening to closing tag)
 * - Self-closing tags spanning multiple lines
 * - CDATA sections spanning multiple lines
 * - Comments spanning multiple lines
 */
export function handleFoldingRanges(project: Project, uri: DocumentUri): FoldingRange[] | null {
  const doc = project.documents.get(uri);
  const {
    parseResult: { node: rootNode },
    getText,
  } = doc.parse();

  const ranges: FoldingRange[] = [];

  collectFoldingRanges(rootNode, doc, getText, ranges);

  if (ranges.length === 0) {
    return null;
  }

  return ranges;
}

/**
 * Recursively walk the CST and collect folding ranges.
 */
function collectFoldingRanges(
  node: Node,
  doc: TextDocument,
  getText: GetText,
  ranges: FoldingRange[],
): void {
  if (!node) {
    return;
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const prevChild = i > 0 ? node.children[i - 1] : null;
      const prevTextNode = prevChild?.kind === SyntaxKind.TextNode ? prevChild : null;
      const c = node.children[i];

      collectFoldingRanges(c, doc, getText, ranges);
      switch (c.kind) {
        case SyntaxKind.ElementNode:
          //do stuff here later
          break;
        case SyntaxKind.Script:
          const range = getScriptFoldRange(c, prevTextNode, doc, getText);
          if (range) {
            console.log("found one!", range.startLine, range.endLine);
            ranges.push(range);
          }
          break;
      }
    }
  }
}

function getScriptFoldRange(
  node: Node,
  prevTextNode: Node | null,
  doc: TextDocument,
  getText: GetText,
): FoldingRange | null {
  if (!nodeOnNewline(node, prevTextNode, doc, getText)) {
    console.log("node not on newline", node.pos, prevTextNode?.pos);
    return null;
  }
  const startLine = doc.cursor.positionAt(node.pos).line;
  const endLine = doc.cursor.positionAt(node.end).line - 1;
  if (startLine < endLine) {
    console.log("script fold range", startLine, endLine);
    return {
      startLine,
      endLine,
    };
  }
  return null;
}

function nodeOnNewline(
  node: Node,
  prevTextNode: Node | null,
  doc: TextDocument,
  getText: GetText,
): boolean {
  if (node.triviaBefore) {
    const onNewlineCandidate = nodeOnNewlineAccordingToTrivia(node.triviaBefore);
    if (onNewlineCandidate) return true;
  }
  if (prevTextNode) {
    if (regexEndsWithNewlinePossiblyWs.test(getText(prevTextNode))) {
      return true;
    }
    console.log("prev text node not ending in newline", getText(prevTextNode));
  }
  if (doc.cursor.positionAt(node.pos).line === 0) return true;
  console.log("non of the above");
  return false;
}

function nodeOnNewlineAccordingToTrivia(triviaNodes: Node[]): boolean {
  console.log("wassup");
  for (let i = triviaNodes.length - 1; i >= 0; i--) {
    switch (triviaNodes[i].kind) {
      case SyntaxKind.NewLineTrivia:
        console.log("newline trivia", triviaNodes);
        return true;
      case SyntaxKind.CommentTrivia:
        console.log("comment trivia", triviaNodes);
        return false;
    }
  }
  console.log("no newline or comment trivia", triviaNodes);
  return false;
}

const regexEndsWithNewlinePossiblyWs = /\n\s*$/;
