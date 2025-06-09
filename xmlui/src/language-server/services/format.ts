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

    for (const c of node.children){
      switch (c.kind){
        case SyntaxKind.CData:
        case SyntaxKind.Script:
        case SyntaxKind.ElementNode:
          acc += this.indent(this.indentationLvl)
          acc += this.printTagLike(c)
          acc += this.newlineToken;
          break;

        case SyntaxKind.StringLiteral:
        case SyntaxKind.TextNode:
          acc += this.indent(this.indentationLvl)
          acc += this.printContentString(c);
          acc += this.newlineToken
          break;

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

    const openTagChildrenCount = hasContentList? contentListIdx: node.children.length ;
    const openTagChildren = node.children.slice(0, openTagChildrenCount);

    acc += this.printTag(openTagChildren);

    if (hasContentList){
      const contentListNode = node.children[contentListIdx];

      ++this.indentationLvl;
      acc += this.newlineToken;
      acc += this.printContentListNode(contentListNode);
      --this.indentationLvl;

      const closeTagChildren = node.children.slice(contentListIdx+1);
      if (closeTagChildren.length > 0){
        acc += this.indent(this.indentationLvl);
        acc += this.printTag(closeTagChildren);
      }
    }
    return acc;
  }

  printTag(tagChildren: Node[]) {
    let acc = "";
    for (const c of tagChildren){
      switch(c.kind){
        case SyntaxKind.OpenNodeStart:
          acc += "<"
          break;
        case SyntaxKind.NodeClose:
          acc += " />"
          break;
        case SyntaxKind.CloseNodeStart:
          acc += "</"
          break;
        case SyntaxKind.NodeEnd:
          acc += ">"
          break;
        case SyntaxKind.TagNameNode:
          acc += this.printTagName(c);
          break;
        case SyntaxKind.AttributeListNode:
          const attrsAlreadyMultiline = c.children
            .some((attr) => getTriviaNodes(attr).some(attrTrivia => attrTrivia.kind === SyntaxKind.NewLineTrivia));

          const lineLenBeforeAttrs = this.indentationLvl * this.tabSize + acc.length;

          const attrsFormatted = this.printAttrList(c);
          const attrsCombinedLen = attrsFormatted.reduce((sum, attr) => attr.length + sum, 0);

          const spacesBetweenAttrs = attrsFormatted.length - 1;
          const potentialClosingTokenLen = 3; // " />".length
          const sameLineAttrsTotalLen =
            lineLenBeforeAttrs +
            attrsCombinedLen +
            spacesBetweenAttrs +
            potentialClosingTokenLen;

          const breakAttrsToMultipleLines = sameLineAttrsTotalLen > this.maxLineLength || attrsAlreadyMultiline
          if (breakAttrsToMultipleLines){
            const wsBeforeAttr = this.newlineToken + this.indent(this.indentationLvl + 1);
            acc += wsBeforeAttr + attrsFormatted.join(wsBeforeAttr);
          } else {
            acc += " " + attrsFormatted.join(" ");
          }
          break;
        case SyntaxKind.ErrorNode:
          acc += this.getText(c);
      }
    }
    return acc;
  }

  printAttrList(c: Node): string[]{
    const attrsFormatted = c.children.map((c) => {
      return this.printAttrNode(c);
    });
    return attrsFormatted;
  }

  /**
  * trivia before the first child element is not handled, as that is
  * the job of the parent function, that joins attrNodes together
  *
  * @param node attrNode
  * @returns
  */
  printAttrNode(node: Node): string {
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
    return this.getText(node).trim();
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
}

export function format(node: Node, getText: GetText, options: FormatOptions) : string | null {
  const formatter = new XmluiFormatter(node, getText, options);
  const formattedString = formatter.format();
  return formattedString;
}
