import { type FoldingRange, FoldingRangeKind } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, TextDocument } from "../base/text-document";
import { SyntaxKind, toDbgString } from "../../parsers/xmlui-parser";
import type { GetText, Node } from "../../parsers/xmlui-parser";
import { getOpeningTagNameNode, isSelfClosingNode } from "./common/syntax-node-utilities";

const regexEndsWithNewlinePossiblyWs = /\n\s*$/;

class FoldingRangeStore {
  private ranges: FoldingRange[] = [];

  constructor(private doc: TextDocument) {}

  /**
   * Only adds the folding range, if there's no conflicting foldrange
   * which starts at the same line. Only checks the last folding range for conflict,
   * so make sure to add folding ranges in order.
   */
  tryAddFoldRange(startOffset: number, endOffset: number): void {
    const startLine = this.doc.cursor.positionAt(startOffset).line;
    const endLine = this.doc.cursor.positionAt(endOffset).line - 1;
    if (endLine <= startLine) return;

    const range: FoldingRange = {
      startLine,
      endLine,
    };

    if (this.ranges.length === 0) {
      this.ranges.push(range);
      return;
    }

    const prevRange = this.ranges.at(-1);
    if (prevRange.startLine !== startLine) {
      this.ranges.push(range);
    }
  }

  getRangesOrNull(): FoldingRange[] | null {
    if (this.ranges.length === 0) return null;
    return this.ranges;
  }
}

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

  const foldStore = new FoldingRangeStore(doc);

  collectFoldingRanges(rootNode, doc, getText, foldStore);

  return foldStore.getRangesOrNull();
}

/**
 * Recursively walk the CST and collect folding ranges.
 */
function collectFoldingRanges(
  node: Node,
  doc: TextDocument,
  getText: GetText,
  foldStore: FoldingRangeStore,
): void {
  if (!node) {
    return;
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const prevChild = i > 0 ? node.children[i - 1] : null;
      const prevTextNode = prevChild?.kind === SyntaxKind.TextNode ? prevChild : null;
      const c = node.children[i];

      if (c.triviaBefore) {
        for (let i = 0; i < c.triviaBefore.length; ++i) {
          const t = c.triviaBefore[i];
          if (t.kind === SyntaxKind.CommentTrivia) {
            tryAddFoldRange(doc, t.pos, t.end);
          }
        }
      }

      switch (c.kind) {
        case SyntaxKind.ElementNode: {
          const range = getElementFoldRange(c, prevTextNode, doc, getText);
          if (range) {
            foldStore.push(range);
          }
          break;
        }
        case SyntaxKind.Script: {
          const range = getScriptFoldRange(c, prevTextNode, doc, getText);
          if (range) {
            foldStore.push(range);
          }
          break;
        }
      }
      collectFoldingRanges(c, doc, getText, foldStore);
    }
  }
}

function getElementFoldRange(node: Node, foldStore: FoldingRangeStore) {
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

  return foldStore.tryAddFoldRange(startOffset, endOffset);
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
  return tryAddFoldRange(doc, node.pos, node.end);
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
