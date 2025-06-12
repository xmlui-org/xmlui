import { type FormattingOptions, type TextEdit, type Range, type Position } from 'vscode-languageserver';
import { SyntaxKind, type GetText, type Node, toDbgString } from '../../parsers/xmlui-parser';
import { getTriviaNodes } from './common/syntax-node-utilities';


type FormattingContex = {
  node: Node;
  getText: GetText;
  offsetToPosition: (offset: number) => Position;
  options: FormattingOptions,
};

export interface FormatOptions extends FormattingOptions{
  maxLineLength?: number;
}

export function handleDocumentFormatting({
  node,
  getText,
  options,
  offsetToPosition
}: FormattingContex): TextEdit[] | null {

  const formatted = format(node, getText, options);

  // If content is already formatted correctly, return empty array
  const unformattedContent = getText(node);
  if (formatted === unformattedContent) {
    return [];
  }

  const lastCharIdx = unformattedContent.length === 0 ? 0 : unformattedContent.length - 1;
  const entireDocumentRange: Range = {
    start: { line: 0, character: 0 },
    end: offsetToPosition(lastCharIdx)
  };

  return [{
    range: entireDocumentRange,
    newText: formatted
  }];
}

class XmluiFormatter {
  private readonly getText: GetText;
  private readonly startingNode: Node;
  private readonly maxLineLength: number;
  private readonly tabSize: number;
  private readonly handleTrailingWhitespace: (str: string) => string;
  private indentationToken: string;
  private indentationLvl: number;
  private newlineToken: string = "\n";

  constructor(node: Node, getText: GetText, options: FormatOptions){
    this.getText = getText;
    this.startingNode = node;
    this.indentationLvl = 0;
    this.maxLineLength = 80;
    this.tabSize = options.tabSize;

    this.indentationToken = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";
    if (options.insertFinalNewline && !options.trimFinalNewlines){
      this.handleTrailingWhitespace = (formatted: string) =>{
        return formatted.trimEnd() + this.newlineToken;
      }
    } else {
      this.handleTrailingWhitespace = (formatted: string) =>{
        return formatted.trimEnd();
      }
    }

  }

  format(): string {
    let formattedStr: string;
    if (this.startingNode.kind !== SyntaxKind.ContentListNode){
      formattedStr = this.getText(this.startingNode);
    }

    formattedStr = this.printContentListNode(this.startingNode);
    formattedStr = this.handleTrailingWhitespace(formattedStr);

    return formattedStr;
  }

  private printContentListNode(node: Node): string {
    let acc: string = this.printEveryTrivia(node);
    if (!node.children){
      acc += this.getText(node)
      return acc;
    }

    for (let i = 0; i < node.children.length; i++){
      const c = node.children[i];
      const prevChild = i > 0 ? node.children[i - 1] : null;

      switch (c.kind){
        case SyntaxKind.CData:
        case SyntaxKind.Script:
        case SyntaxKind.ElementNode: {
          const comment = this.getCommentsSpaceJoined(c);
          const prevIsText = prevChild?.kind === SyntaxKind.TextNode;

          if (comment) {
            let commentInline: boolean;

            if (this.hasNewlineTriviaBeforeComment(c)) {
              commentInline = false;
            } else if (prevIsText) {
              const prevText = this.getText(prevChild);
              commentInline = !hasNewlineInTrailingWhitespace(prevText);
            }

            if (commentInline) {
              if (acc.at(-1) === this.newlineToken) {
                acc = acc.substring(0, acc.length - this.newlineToken.length);
              }
              acc += ` ${comment}${this.newlineToken}`;
            } else {
              acc += this.indent(this.indentationLvl) + comment + this.newlineToken;
            }
          }


          acc += this.indent(this.indentationLvl)
          acc += this.printTagLike(c)
          acc += this.newlineToken;
          break;
        }

        case SyntaxKind.StringLiteral:
        case SyntaxKind.TextNode: {
          const formattedContent = this.printContentString(c);
          if (formattedContent !== ""){
            acc += this.indent(this.indentationLvl)
            acc += formattedContent;
            acc += this.newlineToken
          } else {
            acc.trimEnd();
          }
          break;
        }
        case SyntaxKind.ErrorNode:
          acc += this.getText(node)
          break;

        case SyntaxKind.EndOfFileToken:
          break;
      }
    }
    return acc;
  }

  printTagLike(node: Node): string {
    switch (node.kind){
      case SyntaxKind.Script:
      case SyntaxKind.CData:
        return this.getText(node)
      default:
        return this.printElementNode(node)
    }
  }

  printElementNode(node: Node): string {
    let acc = ""
    const contentListIdx = node.children.findIndex(c => c.kind === SyntaxKind.ContentListNode);
    const hasContentList = contentListIdx !== -1;
    const closeNodeStartIdx = node.children.findIndex(c => c.kind === SyntaxKind.CloseNodeStart);
    const hasCloseNodeStart = closeNodeStartIdx !== -1;

    let openTagNodeCount: number;
    if (hasContentList){
      openTagNodeCount = contentListIdx;
    } else if ( hasCloseNodeStart){
      openTagNodeCount = closeNodeStartIdx;
    } else {
      openTagNodeCount = node.children.length;
    }

    const openTagNodes = node.children.slice(0, openTagNodeCount);
    acc += this.printOpenTag(openTagNodes);

    if (hasContentList){
      const contentListNode = node.children[contentListIdx];

      ++this.indentationLvl;
      acc += this.newlineToken;
      acc += this.printContentListNode(contentListNode);
      --this.indentationLvl;
    }

    let closeTagNodesStartIdx: number;
    if (hasCloseNodeStart){
      closeTagNodesStartIdx = closeNodeStartIdx
    } else if (hasContentList){
      closeTagNodesStartIdx = contentListIdx + 1
    } else {
      closeTagNodesStartIdx = openTagNodeCount + 1
    }
    const closeTagNodes = node.children.slice(closeTagNodesStartIdx);
    acc += this.printClosingTag(closeTagNodes, hasContentList);
    return acc;
  }

  private printOpenTag(tagChildren: Node[]) {
    let acc = "";
    for (let i = 0; i < tagChildren.length; ++i){
      const c = tagChildren[i];
      switch(c.kind){
        case SyntaxKind.OpenNodeStart:
          acc += "<"
          break;
        case SyntaxKind.CloseNodeStart:
          acc += "</"
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


  private printClosingTag(tagChildren: Node[], hasContentList: boolean) {
    let acc = "";
    for (let i = 0; i < tagChildren.length; ++i){
      const c = tagChildren[i];
      switch(c.kind){
        case SyntaxKind.CloseNodeStart:
          const comment = this.getCommentsSpaceJoined(c);
          if (comment){
            if (!hasContentList){
              acc += this.newlineToken;
            }
            acc += this.indent(this.indentationLvl + 1);
            acc += comment + this.newlineToken;
          }

          acc += this.indent(this.indentationLvl) + "</";
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

  private printTagAfterName(nodes: Node[], tagAcc: string): string{
    let acc: string = "";
    let closingIsNodeClose = false;
    let attrSegmentsFormatted: string[] = [];
    let attrListOffsetInAcc: number;

    let closingSegmentsFormatted: string[] = [];
    let closingOffsetInAcc: number;

    let attrsAlreadyMultiline = false;

    for (let i = 0; i < nodes.length; ++i){
      const c = nodes[i];
      switch(c.kind){
        case SyntaxKind.AttributeListNode:
          attrSegmentsFormatted = this.printAttrList(c);

          attrsAlreadyMultiline = c.children
            .some((attr) => getTriviaNodes(attr).some(attrTrivia => attrTrivia.kind === SyntaxKind.NewLineTrivia));
          attrListOffsetInAcc = acc.length
          break;
        case SyntaxKind.NodeClose: {
          closingOffsetInAcc = acc.length
          closingIsNodeClose = true;
          const comments = this.getCommentsSpaceJoined(c);
          if (comments){
            closingSegmentsFormatted = [comments, "/>"];
          } else {
            closingSegmentsFormatted = ["/>"];
          }
          break;
        }
        case SyntaxKind.NodeEnd: {
          closingOffsetInAcc = acc.length
          closingIsNodeClose = false;

          const comments = this.getCommentsSpaceJoined(c);
          if (comments){
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
      errorNodesLen +
      lineLenBeforeAttrs +
      restOfTagNonWsLen +
      spacesBetweenRestOfTagNodes;

    const breakAttrsToMultipleLines = attrsAlreadyMultiline || sameLineTagLen > this.maxLineLength

    const attrsAndTrailingComments = attrSegmentsFormatted.concat(closingSegmentsFormatted.slice(0, -1));
    const hasClosing = closingSegmentsFormatted.length > 0;
    const closingFormatted = closingSegmentsFormatted.at(-1);

    if (breakAttrsToMultipleLines) {
      const wsBeforeAttr = this.newlineToken + this.indent(this.indentationLvl + 1);
      const attrsFormatted = attrsAndTrailingComments.join(wsBeforeAttr);

      if (attrsAndTrailingComments.length > 0 ){
        acc += wsBeforeAttr + attrsFormatted ;
      }
      if (hasClosing){
        if (closingIsNodeClose){
          acc += " ";
        }
        acc += closingFormatted;
      }
    } else {
      const wsBeforeAttr = " ";
      const attrsFormatted = attrsAndTrailingComments.join(wsBeforeAttr);

      if (attrsAndTrailingComments.length > 0 ){
        acc += wsBeforeAttr + attrsFormatted ;
      }
      if (hasClosing){
        if (closingIsNodeClose){
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
      if (comments){
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
  private printIfErrNode(node: Node): string | null{
    if (node.kind === SyntaxKind.ErrorNode){
      return this.getText(node, true);
    } else {
      return null
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

  private printNodesSpaceJoinedCommentsBefore(nodes: Node[]){
    let acc = "";
    for (let node of nodes){
      const comment = this.getCommentsSpaceJoined(node);
      if (comment){
        acc += " " + comment + " ";
      }
      acc += this.getText(node);
    }
    return acc;

  }

  printTagName(node: Node): string{
    const commentBefName = this.getCommentsSpaceJoined(node.children[0]);
    const firstTokenPrint = this.getText(node.children[0]);
    let acc = commentBefName? ` ${commentBefName} ${firstTokenPrint}`: firstTokenPrint;

    acc += this.printNodesSpaceJoinedCommentsBefore(node.children.slice(1))
    return acc;
  }

  printContentString(node: Node): string {
    return this.getText(node, false).trim();
  }

  private printEveryTrivia(node: Node): string {
    return (node.triviaBefore ?? []).map((trivia: Node) => this.getText(trivia)).join("");
  }

  private indent(lvl: number): string {
    return this.indentationToken.repeat(lvl);
  };

  getComments(node: Node): string[] {
    const triviaNodes = getTriviaNodes(node);
    return triviaNodes.filter(({ kind }) => kind === SyntaxKind.CommentTrivia).map((comment) => this.getText(comment));
  }

  /**
  *
  * @returns null if the node doesn't have comment trivia,
  * otherwise the comments, joined with a space char.
  */
  getCommentsSpaceJoined(node: Node): string | null {
    const comments = this.getComments(node);
    if (comments.length === 0){
      return null;
    }
    return comments.join(" ");
  }

  /**
   * Check if comments have newlines before them
   */
  hasNewlineTriviaBeforeComment(node: Node): boolean {
    const triviaNodes = getTriviaNodes(node);
    for (let c of triviaNodes){
      if(c.kind === SyntaxKind.NewLineTrivia){
        return true;
      } else if (c.kind === SyntaxKind.CommentTrivia){
        return false;
      }
    }
    return false;
  }
}

export function format(node: Node, getText: GetText, options: FormatOptions) : string | null {
  const formatter = new XmluiFormatter(node, getText, options);
  const formattedString = formatter.format();
  return formattedString;
}

function hasNewlineInTrailingWhitespace(text:string): boolean {
  const lastNewlineIdx = text.lastIndexOf("\n");
  const trimmedPrevText = text.trimEnd();
  const textEndedInNewline = lastNewlineIdx >= trimmedPrevText.length;
  return textEndedInNewline;
}
