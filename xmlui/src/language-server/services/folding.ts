import { type FoldingRange, FoldingRangeKind } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, TextDocument } from "../base/text-document";
import { SyntaxKind, toDbgString } from "../../parsers/xmlui-parser";
import type { GetText, Node } from "../../parsers/xmlui-parser";
import { getOpeningTagNameNode, isSelfClosingNode } from "./common/syntax-node-utilities";

const regexEndsWithNewlinePossiblyWs = /\n\s*$/;
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

      switch (c.kind) {
        case SyntaxKind.ElementNode: {
          const range = getElementFoldRange(c, prevTextNode, doc, getText);
          if (range) {
            ranges.push(range);
          }
          break;
        }
        case SyntaxKind.Script: {
          const range = getScriptFoldRange(c, prevTextNode, doc, getText);
          if (range) {
            ranges.push(range);
          }
          break;
        }
      }
      collectFoldingRanges(c, doc, getText, ranges);
    }
  }
}

function getElementFoldRange(node: Node, prevTextNode: Node, doc: TextDocument, getText: GetText) {
  if (!isNodeOnNewline(node, prevTextNode, doc, getText)) {
    return null;
  }

  let startOffset: number;
  let endOffset: number;

  const isSelfClosing = isSelfClosingNode(node);
  const tagNameNode = getOpeningTagNameNode(node, isSelfClosing);
  if (tagNameNode) {
    startOffset = tagNameNode.end;
  } else {
    const openNodeStart = node.children!.find((c) => c.kind === SyntaxKind.OpenNodeStart);
    startOffset = openNodeStart.end;
  }

  if (isSelfClosing) {
    endOffset = node.end;
  } else {
    const closeNodeStart = node.children!.find((c) => c.kind === SyntaxKind.CloseNodeStart);
    if (closeNodeStart) endOffset = closeNodeStart.end;
    else endOffset = node.end;
  }

  const startLine = doc.cursor.positionAt(startOffset).line;
  const endLine = doc.cursor.positionAt(endOffset).line - 1;
  if (startLine < endLine) {
    return {
      startLine,
      endLine,
    };
  }
  return null;
}

function getScriptFoldRange(
  node: Node,
  prevTextNode: Node | null,
  doc: TextDocument,
  getText: GetText,
): FoldingRange | null {
  if (!isNodeOnNewline(node, prevTextNode, doc, getText)) {
    return null;
  }
  const startLine = doc.cursor.positionAt(node.pos).line;
  const endLine = doc.cursor.positionAt(node.end).line - 1;
  if (startLine < endLine) {
    return {
      startLine,
      endLine,
    };
  }
  return null;
}

function isNodeOnNewline(
  node: Node,
  prevTextNode: Node | null,
  doc: TextDocument,
  getText: GetText,
): boolean {
  const triviaNodes = node.getTriviaNodes();
  if (triviaNodes) {
    const onNewlineCandidate = nodeOnNewlineAccordingToTrivia(triviaNodes);
    if (onNewlineCandidate) return true;
  }
  if (prevTextNode) {
    if (regexEndsWithNewlinePossiblyWs.test(getText(prevTextNode))) {
      return true;
    }
  }
  if (doc.cursor.positionAt(node.pos).line === 0) return true;
  return false;
}

function nodeOnNewlineAccordingToTrivia(triviaNodes: Node[]): boolean {
  for (let i = triviaNodes.length - 1; i >= 0; i--) {
    switch (triviaNodes[i].kind) {
      case SyntaxKind.NewLineTrivia:
        return true;
      case SyntaxKind.CommentTrivia:
        return false;
    }
  }
  return false;
}
