import type { FoldingRange } from "vscode-languageserver";
import { FoldingRangeKind } from "vscode-languageserver";
import type { Project } from "../base/project";
import type { DocumentUri, TextDocument } from "../base/text-document";
import { SyntaxKind } from "../../parsers/xmlui-parser";
import type { Node } from "../../parsers/xmlui-parser";
import { getOpeningTagNameNode, isSelfClosingNode } from "./common/syntax-node-utilities";
class FoldingRangeStore {
  private ranges: FoldingRange[] = [];

  constructor(private doc: TextDocument) {}

  /**
   * Only adds the folding range, if there's no conflicting foldrange
   * which starts at the same line. Only checks the last folding range for conflict,
   * so make sure to add folding ranges in order.
   */
  tryAddFoldRange(
    startOffset: number,
    endOffset: number,
    kind: FoldingRangeKind = FoldingRangeKind.Region,
  ): void {
    const startLine = this.doc.cursor.positionAt(startOffset).line;
    const endLine = this.doc.cursor.positionAt(endOffset).line - 1;
    if (endLine <= startLine) return;

    const range: FoldingRange = {
      startLine,
      endLine,
      kind,
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
 * - Comments spanning multiple lines
 * - Script tags spanning multiple lines
 */
export function handleFoldingRanges(project: Project, uri: DocumentUri): FoldingRange[] | null {
  const doc = project.documents.get(uri);
  const {
    parseResult: { node: rootNode },
  } = doc.parse();

  const foldStore = new FoldingRangeStore(doc);

  collectFoldingRanges(rootNode, foldStore);

  return foldStore.getRangesOrNull();
}

/**
 * Recursively walk the CST and collect folding ranges.
 */
function collectFoldingRanges(node: Node, foldStore: FoldingRangeStore): void {
  if (!node) {
    return;
  }

  if (node.children) {
    for (const c of node.children) {
      // doing depth-first search so that the inner most
      // tag fold ranges get inserted into the store first
      // so that the surrounding ranges get thrown away,
      // when they begin on the same line.
      collectFoldingRanges(c, foldStore);

      if (c.triviaBefore) {
        for (let i = 0; i < c.triviaBefore.length; ++i) {
          const t = c.triviaBefore[i];
          if (t.kind === SyntaxKind.CommentTrivia) {
            foldStore.tryAddFoldRange(t.pos, t.end, "comment");
          }
        }
      }

      switch (c.kind) {
        case SyntaxKind.ElementNode: {
          getElementFoldRange(c, foldStore);
          break;
        }
        case SyntaxKind.Script: {
          foldStore.tryAddFoldRange(c.pos, c.end);
          break;
        }
      }
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
