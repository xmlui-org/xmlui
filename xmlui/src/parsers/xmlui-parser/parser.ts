import { Node } from "./syntax-node";
import type { ScannerErrorCallback } from "./scanner";
import type { ScannerDiagnosticMessage, ParserDiagPositionless, ParserDiag } from "./diagnostics";
import { CharacterCodes } from "./CharacterCodes";
import { createScanner } from "./scanner";
import { SyntaxKind, getSyntaxKindStrRepr } from "./syntax-kind";
import { tagNameNodesWithoutErrorsMatch } from "./utils";
import { ErrCodesParser, DIAGS_PARSER } from "./diagnostics";

type IncompleteNode = {
  children: Node[];
};

export type GetText = (n: Node, ignoreTrivia?: boolean) => string;

export type ParseResult = { node: Node; errors: ParserDiag[] };

const RECOVER_FILE = [SyntaxKind.CData, SyntaxKind.Script, SyntaxKind.OpenNodeStart] as const;
const RECOVER_OPEN_TAG = [
  SyntaxKind.OpenNodeStart,
  SyntaxKind.NodeEnd,
  SyntaxKind.NodeClose,
  SyntaxKind.CloseNodeStart,
  SyntaxKind.CData,
  SyntaxKind.Script,
] as const;
const RECOVER_ATTR = [SyntaxKind.Identifier, ...RECOVER_OPEN_TAG] as const;
const RECOVER_CONTENT_LIST = [
  SyntaxKind.TextNode,
  SyntaxKind.StringLiteral,
  SyntaxKind.CData,
  SyntaxKind.Script,
  SyntaxKind.OpenNodeStart,
  SyntaxKind.CloseNodeStart,
] as const;
const RECOVER_CLOSE_TAG = [
  SyntaxKind.NodeEnd,
  SyntaxKind.OpenNodeStart,
  SyntaxKind.CloseNodeStart,
  SyntaxKind.CData,
  SyntaxKind.Script,
] as const;

const needsExtendedContext = [
  ErrCodesParser.unexpectedCloseTag,
  ErrCodesParser.expCloseStartWithName,
  ErrCodesParser.expCloseStart,
  ErrCodesParser.tagNameMismatch,
  ErrCodesParser.expEnd,
  ErrCodesParser.expTagName,
  ErrCodesParser.expTagOpen,
  ErrCodesParser.expEndOrClose,
  ErrCodesParser.expTagNameAfterNamespace,
  ErrCodesParser.expTagNameAfterCloseStart,
];

export function createXmlUiParser(source: string): {
  parse: () => ParseResult;
  getText: GetText;
} {
  return {
    parse: () => parseXmlUiMarkup(source),
    getText: (n: { pos?: number; start?: number; end: number }, ignoreTrivia: boolean = true) =>
      source.substring(ignoreTrivia ? (n.pos ?? n.start ?? 0) : (n.start ?? n.pos ?? 0), n.end),
  };
}

export function parseXmlUiMarkup(text: string): ParseResult {
  const errors: ParserDiag[] = [];
  const parents: (IncompleteNode | Node)[] = [];
  let peekedToken: Node | undefined;
  let node: Node | IncompleteNode = { children: [] };
  let errFromScanner: { message: ScannerDiagnosticMessage; prefixLength: number } | undefined =
    undefined;

  const onScannerErr: ScannerErrorCallback = function (message, length) {
    errFromScanner = {
      message,
      prefixLength: length,
    };
  };
  const scanner = createScanner(false, text, onScannerErr);
  const fileContentListNode = parseFile();
  return { node: fileContentListNode, errors };

  function getText(n: Node, ignoreTrivia: boolean = true) {
    return text.substring(ignoreTrivia ? n.pos : n.start, n.end);
  }

  function parseFile(): Node {
    while (true) {
      const token = peekInContent();
      switch (token.kind) {
        case SyntaxKind.EndOfFileToken:
          bumpAny();
          return createNode(SyntaxKind.ContentListNode, node.children);
        case SyntaxKind.CData:
        case SyntaxKind.Script:
          bumpAny();
          break;
        case SyntaxKind.OpenNodeStart:
          parseOpeningTag();
          break;

        case SyntaxKind.TextNode:
          bumpAny();
          break;
        case SyntaxKind.CloseNodeStart: {
          const errNode = errNodeUntil(RECOVER_FILE);
          errorAt(DIAGS_PARSER.unexpectedCloseTag, errNode!.pos, errNode!.end);
          break;
        }
        default:
          const errNode = errNodeUntil(RECOVER_FILE);
          errorAt(DIAGS_PARSER.expTagOpen, errNode!.pos, errNode!.end);
          break;
      }
    }
  }

  function parseContentList() {
    startNode();
    loop: while (true) {
      const token = peekInContent();
      switch (token.kind) {
        case SyntaxKind.TextNode:
        case SyntaxKind.StringLiteral:
        case SyntaxKind.CData:
        case SyntaxKind.Script:
          bumpAny();
          break;
        case SyntaxKind.OpenNodeStart:
          parseOpeningTag();
          break;
        case SyntaxKind.CloseNodeStart:
        case SyntaxKind.EndOfFileToken:
          break loop;
        default:
          const errNode = errNodeUntil(RECOVER_CONTENT_LIST);
          errorAt(DIAGS_PARSER.expTagOpen, errNode!.pos, errNode!.end);
          break;
      }
    }
    if (node.children && node.children.length > 0) {
      completeNode(SyntaxKind.ContentListNode);
    } else {
      abandonNode();
    }
  }

  function parseOpeningTag() {
    startNode();
    bump(SyntaxKind.OpenNodeStart);
    let errInName = true;
    let openTagName: Node | null = null;
    if (at(SyntaxKind.Identifier)) {
      const tagNameParseRes = parseOpeningTagName();
      errInName = tagNameParseRes.errInName;
      openTagName = tagNameParseRes.node;
    } else {
      const errNode = errNodeUntil(RECOVER_OPEN_TAG);
      if (errNode) {
        errorAt(DIAGS_PARSER.expTagName, errNode.pos, errNode.end);
      } else {
        error(DIAGS_PARSER.expTagName);
      }
    }

    if (!errInName) {
      parseAttrList();
    }

    switch (peek().kind) {
      case SyntaxKind.NodeClose: {
        bumpAny();
        completeNode(SyntaxKind.ElementNode);
        return;
      }

      case SyntaxKind.NodeEnd: {
        bumpAny();
        parseContentList();
        parseClosingTag(openTagName, errInName);
        completeNode(SyntaxKind.ElementNode);
        return;
      }

      default: {
        completeNode(SyntaxKind.ElementNode);
        error(DIAGS_PARSER.expEndOrClose);
        return;
      }
    }
  }

  function parseOpeningTagName(): { node: Node; errInName: boolean } {
    startNode();
    const identNode = bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = completeNode(SyntaxKind.TagNameNode);
      const namespaceName = getText(identNode);
      errorAt(
        DIAGS_PARSER.expTagNameAfterNamespace(namespaceName),
        nameNodeWithColon.pos,
        nameNodeWithColon.end,
      );
      errNodeUntil([SyntaxKind.Identifier, ...RECOVER_OPEN_TAG]);
      return { node: nameNodeWithColon, errInName: true };
    } else {
      return { node: completeNode(SyntaxKind.TagNameNode), errInName: false };
    }
  }

  function parseAttrList() {
    startNode();
    const attrNames: { ns?: string; name: string }[] = [];

    loop: while (true) {
      switch (peek().kind) {
        case SyntaxKind.EndOfFileToken:
        // same as RECOVER_OPEN_TAG
        case SyntaxKind.OpenNodeStart:
        case SyntaxKind.NodeEnd:
        case SyntaxKind.NodeClose:
        case SyntaxKind.CloseNodeStart:
        case SyntaxKind.CData:
        case SyntaxKind.Script:
          break loop;

        default:
          parseAttr(attrNames);
      }
    }

    if (node.children!.length === 0) {
      abandonNode();
    } else {
      completeNode(SyntaxKind.AttributeListNode);
    }
  }

  function parseAttr(attrNames: { ns?: string; name: string }[]) {
    startNode();
    if (at(SyntaxKind.Identifier)) {
      parseAttrName(attrNames);
    } else {
      const errNode = errNodeUntil(RECOVER_ATTR);
      if (errNode) {
        if (at(SyntaxKind.Equal)) {
          errorAt(DIAGS_PARSER.expAttrNameBeforeEq, errNode.pos, errNode.end);
        } else {
          errorAt(DIAGS_PARSER.expAttrName, errNode.pos, errNode.end);
        }
        completeNode(SyntaxKind.AttributeNode);
      } else {
        abandonNode();
        error(DIAGS_PARSER.expAttrName);
      }
      return;
    }

    if (eat(SyntaxKind.Equal)) {
      if (!eat(SyntaxKind.StringLiteral)) {
        const errNode = errNodeUntil(RECOVER_ATTR);
        if (errNode) {
          errorAt(DIAGS_PARSER.expAttrStr, errNode.pos, errNode.end);
        } else {
          error(DIAGS_PARSER.expAttrStr);
        }
      }
    }

    completeNode(SyntaxKind.AttributeNode);
  }

  function parseAttrName(attrNames: { ns?: string; name: string }[]) {
    let nameIdent = peek();
    let nsIdent = undefined;

    startNode();
    bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon)) {
      if (at(SyntaxKind.Identifier)) {
        nsIdent = nameIdent;
        nameIdent = bump(SyntaxKind.Identifier);
      } else {
        const namespaceName = getText(nameIdent);
        const errNode = errNodeUntil([
          SyntaxKind.Equal,
          SyntaxKind.Identifier,
          ...RECOVER_OPEN_TAG,
        ]);

        if (errNode) {
          errorAt(DIAGS_PARSER.expAttrNameAfterNamespace(namespaceName), errNode.pos, errNode.end);
        } else {
          error(DIAGS_PARSER.expAttrNameAfterNamespace(namespaceName));
        }
      }
    }
    checkAttrName(attrNames, { nsIdent, nameIdent });
    completeNode(SyntaxKind.AttributeKeyNode);
  }

  function parseClosingTag(openTagName: Node | null, skipNameMatching: boolean) {
    if (eat(SyntaxKind.CloseNodeStart)) {
      if (at(SyntaxKind.Identifier)) {
        const closeTagName = parseClosingTagName();
        if (!skipNameMatching) {
          const namesMismatch =
            openTagName !== null &&
            !tagNameNodesWithoutErrorsMatch(openTagName, closeTagName, getText);
          if (namesMismatch) {
            const msg = DIAGS_PARSER.tagNameMismatch(getText(openTagName!), getText(closeTagName));
            errorAt(msg, closeTagName.pos, closeTagName.end);
          }
        }
      } else {
        const errNode = errNodeUntil(RECOVER_CLOSE_TAG);
        if (errNode) {
          errorAt(DIAGS_PARSER.expTagNameAfterCloseStart, errNode.pos, errNode.end);
        } else {
          error(DIAGS_PARSER.expTagNameAfterCloseStart);
        }
      }
      if (!eat(SyntaxKind.NodeEnd)) {
        error(DIAGS_PARSER.expEnd);
      }
    } else {
      if (openTagName) {
        errorAt(
          DIAGS_PARSER.expCloseStartWithName(getText(openTagName)),
          openTagName.pos,
          openTagName.end,
        );
      } else {
        error(DIAGS_PARSER.expCloseStart);
      }
    }
  }

  function parseClosingTagName(): Node {
    startNode();
    const identNode = bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = completeNode(SyntaxKind.TagNameNode);
      errorAt(
        DIAGS_PARSER.expTagNameAfterNamespace(getText(identNode)),
        nameNodeWithColon.pos,
        nameNodeWithColon.end,
      );
      errNodeUntil(RECOVER_OPEN_TAG);
      return nameNodeWithColon;
    } else {
      return completeNode(SyntaxKind.TagNameNode);
    }
  }

  type AttrName = {
    ns?: string;
    name: string;
  };

  /** emits errors when the attribute name is incorrect. Otherwise adds the attribute name to the list of valid names*/
  function checkAttrName(
    attrNames: AttrName[],
    { nameIdent, nsIdent }: { nameIdent: Node; nsIdent?: Node },
  ) {
    const attrName = getText(nameIdent);
    const attrNs = nsIdent && getText(nsIdent);
    const attrKeyMatches = ({ ns, name }: AttrName) => name === attrName && ns === attrNs;
    const isDuplicate = attrNames.findIndex(attrKeyMatches) !== -1;
    const nameStartsWithUppercase = "A" <= attrName[0] && attrName[0] <= "Z";
    const faultyName = isDuplicate || nameStartsWithUppercase;

    //TODO: account for the namespace as well
    if (isDuplicate) {
      errorAt(DIAGS_PARSER.duplAttr(attrName), nameIdent.pos, nameIdent.end);
    }
    if (!nsIdent && nameStartsWithUppercase) {
      errorAt(DIAGS_PARSER.uppercaseAttr(attrName), nameIdent.pos, nameIdent.end);
    }
    if (!faultyName) {
      attrNames.push({ name: attrName, ns: attrNs });
    }
  }

  function getContextWithSurroundingLines(
    pos: number,
    end: number,
    surroundingContextLines: number,
  ): { contextPos: number; contextEnd: number } {
    let newlinesFound: number;
    let cursor: number;

    let contextPos: number;
    cursor = pos;
    newlinesFound = 0;
    while (cursor >= 0) {
      if (text[cursor] === "\n") {
        newlinesFound++;
        if (newlinesFound > surroundingContextLines) {
          break;
        }
      }
      cursor--;
    }
    contextPos = cursor + 1;

    let contextEnd: number;
    cursor = end;
    newlinesFound = 0;
    while (cursor < text.length) {
      if (text[cursor] === "\n") {
        newlinesFound++;
        if (newlinesFound > surroundingContextLines) {
          break;
        }
        cursor++;
      } else if (text[cursor] === "\r" && text[cursor + 1] === "\n") {
        newlinesFound++;
        if (newlinesFound > surroundingContextLines) {
          break;
        }
        cursor += 2;
      } else {
        cursor++;
      }
    }
    contextEnd = cursor;

    return { contextPos, contextEnd };
  }

  function error({ code, message, category }: ParserDiagPositionless) {
    const { pos, end } = peek();

    const { contextPos, contextEnd } = getContextWithSurroundingLines(pos, end, 1);

    errors.push({
      category,
      code,
      message,
      pos,
      end,
      contextPos,
      contextEnd,
    });
  }

  function errorAt({ code, message, category }: ParserDiagPositionless, pos: number, end: number) {
    const { contextPos, contextEnd } = getContextWithSurroundingLines(pos, end, 1);

    errors.push({
      category,
      code,
      message,
      pos,
      end,
      contextPos,
      contextEnd,
    });
  }

  /**
   *
   * @param tokens that won't be consumed
   * @returns the error node with the consumed tokens, or null if there were no tokens consumed
   */
  function errNodeUntil(tokens: readonly SyntaxKind[]): Node | null {
    startNode();
    advance(tokens);
    if (node.children!.length === 0) {
      abandonNode();
      return null;
    } else {
      return completeNode(SyntaxKind.ErrorNode);
    }
  }

  function advance(to: readonly SyntaxKind[]) {
    for (
      let token = peek();
      token.kind !== SyntaxKind.EndOfFileToken && !to.includes(token.kind);
      bumpAny(), token = peek()
    ) {}
  }

  function eat(kind: SyntaxKind): boolean {
    const kindMatched = at(kind);
    if (kindMatched) {
      bumpAny();
    }
    return kindMatched;
  }

  function at(kindToCheck: SyntaxKind): boolean {
    return peek().kind === kindToCheck;
  }

  function peek(inContent: boolean = false) {
    if (peekedToken !== undefined) {
      return peekedToken;
    }
    peekedToken = collectToken(inContent);
    return peekedToken;
  }

  function peekInContent(): Node {
    const token = peek(true);
    if (
      token.kind === SyntaxKind.EndOfFileToken ||
      token.kind === SyntaxKind.OpenNodeStart ||
      token.kind === SyntaxKind.Script ||
      token.kind === SyntaxKind.CData ||
      token.kind === SyntaxKind.CloseNodeStart
    ) {
      return token;
    }

    const trivia = token.triviaBefore;
    const triviaLength = trivia?.length ?? 0;
    let i = 0;
    let leadingComments = [];
    let firstNonCommentTriviaIdx: number = -1;
    for (; i < triviaLength; ++i) {
      if (trivia![i].kind === SyntaxKind.CommentTrivia) {
        leadingComments.push(trivia![i]);
      } else {
        firstNonCommentTriviaIdx = i;
        break;
      }
    }

    let secondCommentGroupStartIdx = -1;
    for (; i < triviaLength; ++i) {
      if (trivia![i].kind === SyntaxKind.CommentTrivia) {
        secondCommentGroupStartIdx = i;
        break;
      }
    }

    let parseAsStringLiteral = false;
    if (token.kind === SyntaxKind.StringLiteral) {
      const beforeLookahead = token.end;
      const nextToken = collectToken(true);
      parseAsStringLiteral =
        nextToken.kind === SyntaxKind.CData ||
        nextToken.kind === SyntaxKind.CloseNodeStart ||
        nextToken.kind === SyntaxKind.Script ||
        nextToken.kind === SyntaxKind.OpenNodeStart;
      scanner.resetTokenState(beforeLookahead);
    }

    let pos: number;
    if (parseAsStringLiteral) {
      pos = token.pos;
    } else if (leadingComments.length > 0) {
      pos = leadingComments[leadingComments.length - 1].end;
    } else if (firstNonCommentTriviaIdx !== -1) {
      pos = trivia![firstNonCommentTriviaIdx].pos;
    } else {
      pos = token.start;
    }
    let triviaBefore = undefined;
    if (leadingComments.length > 0) {
      triviaBefore = leadingComments;
    }

    let kind = SyntaxKind.TextNode;
    let end: number = -1;
    if (secondCommentGroupStartIdx !== -1) {
      end = trivia![secondCommentGroupStartIdx].pos;
      scanner.resetTokenState(end);
    } else if (parseAsStringLiteral) {
      kind = SyntaxKind.StringLiteral;
      end = token.end;
    } else {
      while (true) {
        const nextChar = scanner.peekChar();
        if (nextChar === null || nextChar === CharacterCodes.lessThan) {
          break;
        }
        scanner.scanChar();
      }
      end = scanner.getTokenEnd();
    }

    peekedToken = new Node(kind, pos, end, triviaBefore);
    return peekedToken;
  }

  /** Same as bumpAny, but with an assertion of the token that was bumped over.
   * Makes the code more redundant, but also more defensive*/
  function bump(kind: SyntaxKind) {
    const token = bumpAny();
    if (token.kind !== kind) {
      throw new Error(
        `expected ${getSyntaxKindStrRepr(kind)}, bumped a ${getSyntaxKindStrRepr(token.kind)}`,
      );
    }
    return token;
  }

  function bumpAny(): Node {
    if (peekedToken) {
      node.children!.push(peekedToken);
      const bumpedToken = peekedToken;
      peekedToken = undefined;
      return bumpedToken;
    }
    const token = collectToken(false);
    node.children!.push(token);
    return token;
  }

  /** start a new node. Any new tokens or nodes will be put into it's children list from that point. Each call to this should be paired with a [completeNode] */
  function startNode() {
    parents.push(node);
    node = {
      children: [],
    };
  }

  function completeNode(type: SyntaxKind): Node {
    const completedNode = createNode(type, node.children!);
    const parentNode = parents[parents.length - 1]!;

    parentNode.children!.push(completedNode);

    node = parentNode;
    parents.pop();
    return completedNode;
  }

  function collectToken(inContent: boolean): Node {
    let kind: SyntaxKind;
    let triviaCollected: Node[] = [];
    let start: number | null = null;
    while (true) {
      kind = scanner.scan();
      if (start === null) {
        start = scanner.getTokenStart();
      }
      //handle error from scanner
      if (errFromScanner !== undefined) {
        let err: ParserDiagPositionless;
        if (errFromScanner.message.code === ErrCodesParser.invalidChar) {
          err = DIAGS_PARSER.invalidChar(scanner.getTokenText());
        } else {
          err = errFromScanner.message;
        }

        const pos = scanner.getTokenStart();
        const triviaBefore = triviaCollected.length > 0 ? triviaCollected : undefined;

        triviaCollected = [];
        if (inContent && err.code === ErrCodesParser.invalidChar) {
          errFromScanner = undefined;
          return new Node(kind, pos, scanner.getTokenEnd(), triviaBefore);
        }

        const badPrefixEnd = pos + errFromScanner.prefixLength;
        const token = new Node(kind, pos, badPrefixEnd, triviaBefore);

        scanner.resetTokenState(badPrefixEnd);
        startNode();
        node.children!.push(token);

        const { contextPos, contextEnd } = getContextWithSurroundingLines(pos, badPrefixEnd, 0);
        errors.push({
          category: err.category,
          code: err.code,
          message: err.message,
          pos,
          end: badPrefixEnd,
          contextPos,
          contextEnd,
        });
        completeNode(SyntaxKind.ErrorNode);

        errFromScanner = undefined;
        return collectToken(inContent);
      }

      switch (kind) {
        case SyntaxKind.CommentTrivia:
        case SyntaxKind.NewLineTrivia:
        case SyntaxKind.WhitespaceTrivia:
          triviaCollected.push(new Node(kind, scanner.getTokenStart(), scanner.getTokenEnd()));
          break;

        default:
          return new Node(
            kind,
            scanner.getTokenStart(),
            scanner.getTokenEnd(),
            triviaCollected.length > 0 ? triviaCollected : undefined,
          );
      }
    }
  }

  function abandonNode() {
    const parentNode = parents[parents.length - 1];
    parentNode!.children!.push(...node.children!);
    node = parentNode;
    parents.pop();
  }
}

function createNode(kind: SyntaxKind, children: Node[]): Node {
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  return new Node(kind, firstChild.pos, lastChild.end, undefined, children);
}
