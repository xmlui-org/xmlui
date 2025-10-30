import type { FormattingOptions, TextEdit, Range, Position } from "vscode-languageserver";
import { type GetText, type Node, SyntaxKind, toDbgString } from "../../parsers/xmlui-parser";

type FormattingContex = {
  node: Node;
  getText: GetText;
  offsetToPosition: (offset: number) => Position;
  options: FormattingOptions;
};

export interface FormatOptions extends FormattingOptions {
  maxLineLength?: number;
}

export function handleDocumentFormatting({
  node,
  getText,
  options,
  offsetToPosition,
}: FormattingContex): TextEdit[] | null {
  const formatted = format(node, getText, options);

  // If content is already formatted correctly, return empty array
  const unformattedContent = getText(node, false);
  if (formatted === unformattedContent) {
    return [];
  }

  const entireDocumentRange: Range = {
    start: { line: 0, character: 0 },
    end: offsetToPosition(unformattedContent.length),
  };

  return [
    {
      range: entireDocumentRange,
      newText: formatted,
    },
  ];
}

class XmluiFormatter {
  private readonly maxConsecutiveNewlines: number = 2;
  private readonly getText: GetText;
  private readonly startingNode: Node;
  private readonly maxLineLength: number = 80;
  private readonly tabSize: number;
  private readonly trimRespectingOptions: (str: string) => string;
  private indentationToken: string;
  private indentationLvl: number;
  private newlineToken: string = "\n";

  constructor(node: Node, getText: GetText, options: FormatOptions) {
    this.getText = getText;
    this.startingNode = node;
    this.indentationLvl = 0;
    this.tabSize = options.tabSize;

    this.indentationToken = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";
    if (options.insertFinalNewline && !options.trimFinalNewlines) {
      this.trimRespectingOptions = (formatted: string) => {
        return formatted.trim() + this.newlineToken;
      };
    } else {
      this.trimRespectingOptions = (formatted: string) => {
        return formatted.trim();
      };
    }
  }

  format(): string {
    let formattedStr: string;
    if (this.startingNode.kind !== SyntaxKind.ContentListNode) {
      formattedStr = this.getText(this.startingNode);
    }

    formattedStr = this.printContentListNode(this.startingNode);
    formattedStr = this.trimRespectingOptions(formattedStr);

    return formattedStr;
  }

  private printContentListNode(node: Node): string {
    let acc: string = "";
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      const prevChild = i > 0 ? node.children[i - 1] : null;

      switch (c.kind) {
        case SyntaxKind.CData:
        case SyntaxKind.Script:
        case SyntaxKind.ElementNode: {
          acc += this.printTagLikeTriviaInContent(prevChild, c);

          acc += this.printTagLike(c);
          break;
        }

        case SyntaxKind.StringLiteral:
        case SyntaxKind.TextNode: {
          const formattedContent = this.printContentString(c);
          if (formattedContent !== "") {
            acc += this.newlineToken;
            acc += this.indent(this.indentationLvl);
            acc += formattedContent;
          } else {
            acc.trimEnd();
          }
          break;
        }
        case SyntaxKind.ErrorNode:
          acc += this.getText(c, false);
          break;

        case SyntaxKind.EndOfFileToken: {
          const collapsedTrivias = this.collapseBlankLines(c.triviaBefore ?? []);
          acc += this.addWsToCollapsedTriviaInContentList(collapsedTrivias, prevChild);
          break;
        }
      }
    }
    return acc;
  }

  printTagLikeTriviaInContent(prevSibling: Node | null, node: Node) {
    if (!prevSibling) {
      return this.printTriviaBeforeFirstTaglikeInContent(node);
    } else if (prevSibling.isTagLike()) {
      return this.printTriviaBetweenSiblingTaglikes(node, prevSibling);
    } else if (
      prevSibling.kind === SyntaxKind.TextNode ||
      prevSibling.kind === SyntaxKind.StringLiteral
    ) {
      return this.printTriviaBetweenTextAndTaglike(prevSibling, node);
    } else {
      // prevSibling is an error node, treat is as any taglike
      return this.printTriviaBetweenSiblingTaglikes(node, prevSibling);
    }
  }

  printTriviaBetweenTextAndTaglike(textNode: Node, node: Node) {
    let acc = "";
    const trivias = node.getTriviaNodes() ?? [];
    const collapsedTrivias = this.collapseBlankLines(trivias);
    acc += this.addWsToCollapsedTriviaInContentList(collapsedTrivias, textNode);
    return acc;
  }

  printTriviaBeforeFirstTaglikeInContent(node: Node): string {
    const triviaBetweenTaglikes = node.getTriviaNodes();
    if (!triviaBetweenTaglikes) {
      if (node.start === 0) return "";
      return this.newlineToken + this.indent(this.indentationLvl);
    }

    const collapsedTrivias = this.collapseBlankLines(triviaBetweenTaglikes);
    let acc = this.addWsToCollapsedTriviaInContentList(collapsedTrivias, null);
    return acc;
  }

  printTriviaBetweenSiblingTaglikes(node: Node, prevNode: Node): string {
    const triviaBetweenTaglikes = node.getTriviaNodes();
    if (!triviaBetweenTaglikes) {
      return this.newlineToken + this.indent(this.indentationLvl);
    }

    const collapsedTrivias = this.collapseBlankLines(triviaBetweenTaglikes);
    let acc = this.addWsToCollapsedTriviaInContentList(collapsedTrivias, prevNode);
    return acc;
  }

  /* Filters out trivias so that only comments and newline remain.
  Respects the maximum permitted consecitive blank lines and throws out any extra consecutive newlines. */
  collapseBlankLines(trivias: Node[]) {
    let consecutiveNewlines = 0;
    const accTrivias: Node[] = [];

    for (let t of trivias) {
      if (t.kind === SyntaxKind.NewLineTrivia) {
        consecutiveNewlines++;
        if (consecutiveNewlines <= this.maxConsecutiveNewlines) {
          accTrivias.push(t);
        }
      } else if (t.kind === SyntaxKind.CommentTrivia) {
        consecutiveNewlines = 0;
        accTrivias.push(t);
      }
    }

    return accTrivias;
  }

  addWsToCollapsedTriviaInContentList(trivias: Node[], prevContentNode: Node | null) {
    let newlinesAfterText: number | null = null;
    let newlinesFromText: string | null = null;
    let prevContentIsText = false;
    let newlinesBeforeFirstComment = " ";
    if (prevContentNode) {
      prevContentIsText =
        prevContentNode.kind === SyntaxKind.StringLiteral ||
        prevContentNode.kind === SyntaxKind.TextNode;

      if (prevContentIsText) {
        const trailingNewlinesInText = newlinesInTrailingWhitespace(this.getText(prevContentNode));
        newlinesAfterText = Math.min(trailingNewlinesInText, this.maxConsecutiveNewlines);

        if (newlinesAfterText > 0) {
          newlinesFromText = this.newlineToken.repeat(newlinesAfterText);
          newlinesBeforeFirstComment = newlinesFromText + this.indent(this.indentationLvl);
        }
      }
    }

    let acc = "";
    let lastKeptTriviaIsComment = false;
    for (let i = 0; i < trivias.length; i++) {
      const t = trivias[i];
      switch (t.kind) {
        case SyntaxKind.CommentTrivia: {
          if (i === 0) {
            acc += newlinesBeforeFirstComment;
            acc += this.getText(t);
          } else {
            acc += this.indent(this.indentationLvl) + this.getText(t);
          }
          if (trivias[i + 1]?.kind === SyntaxKind.CommentTrivia) {
            acc += this.newlineToken;
          }
          lastKeptTriviaIsComment = true;
          break;
        }
        case SyntaxKind.NewLineTrivia: {
          acc += this.newlineToken;
          lastKeptTriviaIsComment = false;
          break;
        }
      }
    }

    if (lastKeptTriviaIsComment) {
      acc += this.newlineToken;
    } else if (trivias.length === 0) {
      acc += newlinesFromText ?? this.newlineToken;
    }
    acc += this.indent(this.indentationLvl);

    return acc;
  }

  addWsToCollapsedCloseNodeStartTrivia(trivias: Node[], lastContentNode: Node | null) {
    let newlinesAfterText: number | null = null;
    let lastContentIsText = false;
    if (lastContentNode) {
      if (
        lastContentNode.kind === SyntaxKind.StringLiteral ||
        lastContentNode.kind === SyntaxKind.TextNode
      ) {
        lastContentIsText = true;
        const trailingNewlinesInText = newlinesInTrailingWhitespace(this.getText(lastContentNode));
        newlinesAfterText = Math.min(trailingNewlinesInText, this.maxConsecutiveNewlines);
      }
    }
    const contentEndsInNewlines = lastContentIsText && newlinesAfterText > 0;

    let acc = "";
    if (contentEndsInNewlines) {
      acc += this.newlineToken.repeat(newlinesAfterText);
    }

    for (let i = 0; i < trivias.length; ++i) {
      const t = trivias[i];
      switch (t.kind) {
        case SyntaxKind.CommentTrivia: {
          if (i === 0 && ((lastContentIsText && newlinesAfterText === 0) || !lastContentIsText)) {
            acc += " ";
            acc += this.getText(t);
          } else {
            acc += this.indent(this.indentationLvl + 1) + this.getText(t);
          }
          if (trivias[i + 1]?.kind === SyntaxKind.CommentTrivia) {
            acc += this.newlineToken;
          }
          break;
        }
        case SyntaxKind.NewLineTrivia: {
          acc += this.newlineToken;
          break;
        }
      }
    }

    if (!lastContentNode && trivias.length === 0) {
      // leave the closing tag on the same line
      // when there's nothing inside it
    } else if (contentEndsInNewlines || trivias.at(-1)?.kind === SyntaxKind.NewLineTrivia) {
      acc += this.indent(this.indentationLvl);
    } else {
      acc += this.newlineToken;
      acc += this.indent(this.indentationLvl);
    }

    return acc;
  }

  printTagLike(node: Node): string {
    switch (node.kind) {
      case SyntaxKind.Script:
      case SyntaxKind.CData:
        return this.getText(node);
      default:
        return this.printElementNode(node);
    }
  }

  printElementNode(node: Node): string {
    let acc = "";
    const contentListIdx = node.children.findIndex((c) => c.kind === SyntaxKind.ContentListNode);
    const hasContentList = contentListIdx !== -1;
    const closeNodeStartIdx = node.children.findIndex((c) => c.kind === SyntaxKind.CloseNodeStart);
    const hasCloseNodeStart = closeNodeStartIdx !== -1;

    let nodesOfOpenTagNodeEndIdx: number;
    if (hasContentList) {
      nodesOfOpenTagNodeEndIdx = contentListIdx;
    } else if (hasCloseNodeStart) {
      nodesOfOpenTagNodeEndIdx = closeNodeStartIdx;
    } else {
      nodesOfOpenTagNodeEndIdx = node.children.length;
    }

    const nodesOfOpenTagNode = node.children.slice(0, nodesOfOpenTagNodeEndIdx);
    acc += this.printOpenTag(nodesOfOpenTagNode);

    let lastContentNode: Node | null = null;
    if (hasContentList) {
      const contentListNode = node.children[contentListIdx];
      lastContentNode = contentListNode.children.at(-1);

      ++this.indentationLvl;
      acc += this.printContentListNode(contentListNode);
      --this.indentationLvl;
    }

    let nodesOfCloseTagNodeStartIdx: number;
    if (hasCloseNodeStart) {
      nodesOfCloseTagNodeStartIdx = closeNodeStartIdx;
    } else if (hasContentList) {
      nodesOfCloseTagNodeStartIdx = contentListIdx + 1;
    } else {
      nodesOfCloseTagNodeStartIdx = nodesOfOpenTagNodeEndIdx + 1;
    }
    const closeTagNodes = node.children.slice(nodesOfCloseTagNodeStartIdx);
    acc += this.printClosingTag(closeTagNodes, lastContentNode);
    return acc;
  }

  private printOpenTag(tagChildren: Node[]) {
    let acc = "";
    for (let i = 0; i < tagChildren.length; ++i) {
      const c = tagChildren[i];
      switch (c.kind) {
        case SyntaxKind.OpenNodeStart:
          acc += "<";
          break;
        case SyntaxKind.CloseNodeStart:
          acc += "</";
          break;
        case SyntaxKind.TagNameNode:
          acc += this.printTagName(c);
          break;
        case SyntaxKind.NodeClose:
        case SyntaxKind.NodeEnd:
        case SyntaxKind.AttributeListNode:
          acc += this.printTagAfterName(tagChildren.slice(i), acc);
          return acc;
        case SyntaxKind.ErrorNode:
          acc += this.getText(c, false);
      }
    }
    return acc;
  }

  private printClosingTag(tagChildren: Node[], lastContentNode: Node | null) {
    let acc = "";
    for (let i = 0; i < tagChildren.length; ++i) {
      const c = tagChildren[i];
      switch (c.kind) {
        case SyntaxKind.CloseNodeStart:
          const collapsedTrivias = this.collapseBlankLines(c.triviaBefore ?? []);
          acc += this.addWsToCollapsedCloseNodeStartTrivia(collapsedTrivias, lastContentNode);
          acc += "</";
          break;
        case SyntaxKind.TagNameNode:
          acc += this.printTagName(c);
          break;
        case SyntaxKind.NodeEnd:
          acc += this.printTagAfterName(tagChildren.slice(i), acc);
          return acc;
        case SyntaxKind.ErrorNode:
          acc += this.getText(c, false);
      }
    }
    return acc;
  }

  private printTagAfterName(nodes: Node[], tagAcc: string): string {
    let acc: string = "";
    let closingIsNodeClose = false;
    let attrSegmentsFormatted: string[] = [];

    let closingSegmentsFormatted: string[] = [];

    let attrsAlreadyMultiline = false;

    for (let i = 0; i < nodes.length; ++i) {
      const c = nodes[i];
      switch (c.kind) {
        case SyntaxKind.AttributeListNode:
          attrSegmentsFormatted = this.printAttrList(c);

          attrsAlreadyMultiline = c.children.some((attr) =>
            attr
              .getTriviaNodes()
              ?.some((attrTrivia) => attrTrivia.kind === SyntaxKind.NewLineTrivia),
          );
          break;
        case SyntaxKind.NodeClose: {
          closingIsNodeClose = true;
          const comments = this.getCommentsSpaceJoined(c);
          if (comments) {
            closingSegmentsFormatted = [comments, "/>"];
          } else {
            closingSegmentsFormatted = ["/>"];
          }
          break;
        }
        case SyntaxKind.NodeEnd: {
          closingIsNodeClose = false;

          const comments = this.getCommentsSpaceJoined(c);
          if (comments) {
            closingSegmentsFormatted = [comments, ">"];
          } else {
            closingSegmentsFormatted = [">"];
          }
          break;
        }
        case SyntaxKind.ErrorNode:
          acc += this.getText(c, true);
          break;
      }
    }

    const lineLenBeforeAttrs = this.indentationLvl * this.tabSize + tagAcc.length;
    const errorNodesLen = acc.length;

    const restOfTag = attrSegmentsFormatted.concat(closingSegmentsFormatted);
    const restOfTagNonWsLen = restOfTag.reduce((sum, attr) => attr.length + sum, 0);
    const spacesBetweenRestOfTagNodes = attrSegmentsFormatted.length - 1;

    const sameLineTagLen =
      errorNodesLen + lineLenBeforeAttrs + restOfTagNonWsLen + spacesBetweenRestOfTagNodes;

    const breakAttrsToMultipleLines = attrsAlreadyMultiline || sameLineTagLen > this.maxLineLength;

    const attrsAndTrailingComments = attrSegmentsFormatted.concat(
      closingSegmentsFormatted.slice(0, -1),
    );
    const hasClosing = closingSegmentsFormatted.length > 0;
    const closingFormatted = closingSegmentsFormatted.at(-1);

    if (breakAttrsToMultipleLines) {
      const wsBeforeAttr = this.newlineToken + this.indent(this.indentationLvl + 1);
      const attrsFormatted = attrsAndTrailingComments.join(wsBeforeAttr);

      if (attrsAndTrailingComments.length > 0) {
        acc += wsBeforeAttr + attrsFormatted;
      }
      if (hasClosing) {
        if (closingIsNodeClose) {
          acc += " ";
        }
        acc += closingFormatted;
      }
    } else {
      const wsBeforeAttr = " ";
      const attrsFormatted = attrsAndTrailingComments.join(wsBeforeAttr);

      if (attrsAndTrailingComments.length > 0) {
        acc += wsBeforeAttr + attrsFormatted;
      }
      if (hasClosing) {
        if (closingIsNodeClose) {
          acc += " ";
        }
        acc += closingFormatted;
      }
    }
    return acc;
  }

  private printAttrList(node: Node): string[] {
    const attrsFormatted: string[] = [];
    for (const c of node.children) {
      const comments = this.getCommentsSpaceJoined(c);
      if (comments) {
        attrsFormatted.push(comments);
      }
      attrsFormatted.push(this.printAttrNode(c));
    }
    return attrsFormatted;
  }

  /**
   *
   * @param node a potential ErrorNode
   * @returns the formatted string if the node was an ErrorNode
   * otherwise `null`.
   */
  private printIfErrNode(node: Node): string | null {
    if (node.kind === SyntaxKind.ErrorNode) {
      return this.getText(node, true);
    } else {
      return null;
    }
  }

  /**
   * trivia before the first child element is not handled, as that is
   * the job of the parent function, that joins attrNodes together
   *
   * @param node attrNode
   * @returns
   */
  printAttrNode(node: Node): string {
    const formattedErrNode = this.printIfErrNode(node);
    if (formattedErrNode !== null) {
      return formattedErrNode;
    }
    let acc = this.printAttrKeyNode(node.children[0]);
    const otherChildren = node.children.slice(1);
    acc += this.printNodesSpaceJoinedCommentsBefore(otherChildren);
    return acc;
  }

  printAttrKeyNode(node: Node): string {
    let acc = this.getText(node.children[0]);

    const otherChildren = node.children.slice(1);
    acc += this.printNodesSpaceJoinedCommentsBefore(otherChildren);
    return acc;
  }

  private printNodesSpaceJoinedCommentsBefore(nodes: Node[]) {
    let acc = "";
    for (let node of nodes) {
      if (node.kind === SyntaxKind.ErrorNode) {
        acc += this.getText(node, false);
        continue;
      }
      const comment = this.getCommentsSpaceJoined(node);
      if (comment) {
        acc += " " + comment + " ";
      }
      acc += this.getText(node);
    }
    return acc;
  }

  printTagName(node: Node): string {
    const commentBefName = this.getCommentsSpaceJoined(node.children[0]);
    const firstTokenPrint = this.getText(node.children[0]);
    let acc = commentBefName ? ` ${commentBefName} ${firstTokenPrint}` : firstTokenPrint;

    acc += this.printNodesSpaceJoinedCommentsBefore(node.children.slice(1));
    return acc;
  }

  printContentString(node: Node): string {
    return this.getText(node, false).trim();
  }

  private indent(lvl: number): string {
    return this.indentationToken.repeat(lvl);
  }

  getComments(node: Node): string[] {
    const triviaNodes = node.getTriviaNodes() ?? [];
    return triviaNodes
      .filter(({ kind }) => kind === SyntaxKind.CommentTrivia)
      .map((comment) => this.getText(comment));
  }

  /**
   *
   * @returns null if the node doesn't have comment trivia,
   * otherwise the comments, joined with a space char.
   */
  getCommentsSpaceJoined(node: Node): string | null {
    const comments = this.getComments(node);
    if (comments.length === 0) {
      return null;
    }
    return comments.join(" ");
  }

  /**
   * Check if comments have newlines before them
   */
  hasNewlineTriviaBeforeComment(node: Node): boolean {
    const triviaNodes = node.getTriviaNodes();
    if (!triviaNodes) {
      return false;
    }
    for (let c of triviaNodes) {
      if (c.kind === SyntaxKind.NewLineTrivia) {
        return true;
      } else if (c.kind === SyntaxKind.CommentTrivia) {
        return false;
      }
    }
    return false;
  }
}

export function format(node: Node, getText: GetText, options: FormatOptions): string | null {
  const formatter = new XmluiFormatter(node, getText, options);
  return formatter.format();
}

function newlinesInTrailingWhitespace(text: string): number {
  const trimmedPrevText = text.trimEnd();
  const trailingWhitespace = text.substring(trimmedPrevText.length);
  let newlineCount = 0;
  for (const c of trailingWhitespace) {
    if (c === "\n") {
      newlineCount++;
    }
  }
  return newlineCount;
}
