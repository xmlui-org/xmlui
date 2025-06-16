import type { Node } from "./syntax-node";
import type { ScannerErrorCallback } from "./scanner";
import type { ScannerDiagnosticMessage, GeneralDiagnosticMessage , DiagnosticCategory} from "./diagnostics";
import { CharacterCodes } from "./CharacterCodes";
import { createScanner } from "./scanner";
import { SyntaxKind, getSyntaxKindStrRepr } from "./syntax-kind";
import { tagNameNodesWithoutErrorsMatch   } from "./utils";
import {
  ErrCodes,
  DIAGS
} from "./diagnostics";

export interface Error {
  readonly category: DiagnosticCategory;
  readonly code: ErrCodes;
  readonly message: string;
  readonly pos: number;
  readonly end: number;
}

type IncompleteNode = {
  children: Node[];
};

export type GetText = (n: Node, ignoreTrivia?: boolean) => string;

export type ParseResult = { node: Node; errors: Error[] };

const TAG_START_OR_END_TOKENS = [SyntaxKind.OpenNodeStart, SyntaxKind.NodeEnd, SyntaxKind.NodeClose, SyntaxKind.CloseNodeStart, SyntaxKind.CData, SyntaxKind.Script];

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
  const errors: Error[] = [];
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

  function getText(n: Node, ignoreTrivia: boolean = true) {
    return text.substring(ignoreTrivia ? n.pos : n.start, n.end);
  }

  function parseContent() {
    startNode();
    loop: while (true) {
      const token = peekInContent();
      switch (token.kind) {
        case SyntaxKind.TextNode:
        case SyntaxKind.StringLiteral:
          bump(token.kind);
          break;
        case SyntaxKind.CloseNodeStart:
          break loop;
        case SyntaxKind.EndOfFileToken:
          break loop;
        default:
          parseTagLike();
          break;
      }
    }
    if (node.children && node.children.length > 0) {
      completeNode(SyntaxKind.ContentListNode);
    } else {
      abandonNode();
    }
  }

  function parseSourceContent() {
    while (true) {
      const token = peekInContent();
      switch (token.kind) {
        case SyntaxKind.EndOfFileToken:
          bumpAny();
          return;
        default:
          parseTagLike();
          break;
      }
    }
  }

  function parseTagLike() {
    if (!eat(SyntaxKind.CData) && !eat(SyntaxKind.Script)) {
      if (at(SyntaxKind.OpenNodeStart)) {
        parseTag();
      } else {
        errorAndBump(DIAGS.expTagOpen);
      }
    }
  }


  function parseTag() {
    startNode();
    bump(SyntaxKind.OpenNodeStart);
    let errInName = true;
    let openTagName: Node | null = null;
    if (at(SyntaxKind.Identifier)) {
      const tagNameParseRes = parseTagName();
      errInName = tagNameParseRes.errInName;
      openTagName = tagNameParseRes.node;
    } else {
      const errNode = errNodeUntil(TAG_START_OR_END_TOKENS);
      if (errNode){
        errorAt(DIAGS.expTagName, errNode.pos, errNode.end)
      } else {
        error(DIAGS.expTagName);
      }
    }

    if(!errInName){
      parseAttrList();
    }

    switch (peek().kind){
      case SyntaxKind.NodeClose:{
        bumpAny();
        completeNode(SyntaxKind.ElementNode);
        return;
      }
      case SyntaxKind.NodeEnd:{
        bumpAny();
        parseContent();
        parseClosingTag(openTagName, errInName);
        completeNode(SyntaxKind.ElementNode);
        return;
      }
      case SyntaxKind.OpenNodeStart:
      case SyntaxKind.Script:
      case SyntaxKind.CData: {
        completeNode(SyntaxKind.ElementNode);
        error(DIAGS.expEndOrClose);
        return;
      }

      case SyntaxKind.CloseNodeStart:{
        error(DIAGS.expEndOrClose);
        parseClosingTag(openTagName, errInName);
        completeNode(SyntaxKind.ElementNode);
        return;
      }

      default:{
        error(DIAGS.expEndOrClose);
      }
    }
  }

  function parseClosingTag(openTagName: Node | null, skipNameMatching: boolean){
    if (eat(SyntaxKind.CloseNodeStart)) {
      if (at(SyntaxKind.Identifier)) {
        const closeTagName = parseClosingTagName();
        if (!skipNameMatching){
          const namesMismatch =
            openTagName !== null && !tagNameNodesWithoutErrorsMatch(openTagName, closeTagName, getText);
          if (namesMismatch) {
            error(DIAGS.tagNameMismatch(getText(openTagName!), getText(closeTagName)));
          }
        }
      } else {
        errRecover(DIAGS.expTagName, [SyntaxKind.NodeEnd]);
      }
      if (!eat(SyntaxKind.NodeEnd)) {
        error(DIAGS.expEnd);
      }
    } else {
      if (openTagName){
        errorAt(DIAGS.expCloseStartWithName(getText(openTagName)), openTagName.pos, openTagName.end);
      } else {
        error(DIAGS.expCloseStart);
      }
    }
  }

  function parseClosingTagName (): Node{
    startNode();
    bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = completeNode(SyntaxKind.TagNameNode);
      errorAt(DIAGS.expTagNameAfterNamespace, nameNodeWithColon.pos, nameNodeWithColon.end);
      errNodeUntil(TAG_START_OR_END_TOKENS);
      return nameNodeWithColon;
    } else {
      return completeNode(SyntaxKind.TagNameNode);
    }
  }

  function parseTagName(): { node: Node, errInName: boolean } {
    startNode();
    bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = completeNode(SyntaxKind.TagNameNode);
      errorAt(DIAGS.expTagNameAfterNamespace, nameNodeWithColon.pos, nameNodeWithColon.end);
      errNodeUntil([SyntaxKind.Identifier, ...TAG_START_OR_END_TOKENS]);
      return { node: nameNodeWithColon, errInName: true };
    } else {
      return { node: completeNode(SyntaxKind.TagNameNode), errInName: false };
    }
  }

  function parseAttrList() {
    startNode();
    const attrNames: { ns?: string; name: string }[] = [];
    while (!atAnyOf([SyntaxKind.EndOfFileToken, ...TAG_START_OR_END_TOKENS])) {
      parseAttr(attrNames);
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
      const errNode = errNodeUntil([SyntaxKind.Identifier, ...TAG_START_OR_END_TOKENS]);
      if (errNode){
        errorAt(DIAGS.expAttrName, errNode.pos, errNode.end);
        completeNode(SyntaxKind.AttributeNode);
      } else {
        abandonNode();
        error(DIAGS.expAttrName);
      }
      return;
    }

    if (eat(SyntaxKind.Equal)) {
      if (!eat(SyntaxKind.StringLiteral)) {
        const attrFollowWithoutIdent = [SyntaxKind.NodeEnd, SyntaxKind.NodeClose];
        errRecover(DIAGS.expAttrValue, attrFollowWithoutIdent);
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
        const errNode = errNodeUntil([SyntaxKind.Equal, SyntaxKind.Identifier, ...TAG_START_OR_END_TOKENS])
        if (errNode){
          errorAt(DIAGS.expAttrNameAfterNamespace, errNode.pos, errNode.end);
        } else {
          error(DIAGS.expAttrNameAfterNamespace);
        }
      }
    }
    checkAttrName(attrNames, { nsIdent, nameIdent });
    completeNode(SyntaxKind.AttributeKeyNode);
  }

  type AttrName = {
    ns?: string,
    name: string
  };

  /** emits errors when the attribute name is incorrect. Otherwise adds the attribute name to the list of valid names*/
  function checkAttrName(attrNames: AttrName[], { nameIdent, nsIdent }: { nameIdent: Node; nsIdent?: Node }) {
    const attrName = getText(nameIdent);
    const attrNs = nsIdent && getText(nsIdent);
    const attrKeyMatches = ({ ns, name }: AttrName) => name === attrName && ns === attrNs;
    const isDuplicate = attrNames.findIndex(attrKeyMatches) !== -1;
    const nameStartsWithUppercase = "A" <= attrName[0] && attrName[0] <= "Z";
    const faultyName = isDuplicate || nameStartsWithUppercase;

    //TODO: account for the namespace as well
    if (isDuplicate) {
      errorAt(DIAGS.duplAttr(attrName), nameIdent.pos, nameIdent.end);
    }
    if (!nsIdent && nameStartsWithUppercase) {
      errorAt(DIAGS.uppercaseAttr(attrName), nameIdent.pos, nameIdent.end);
    }
    if (!faultyName) {
      attrNames.push({ name: attrName, ns: attrNs });
    }
  }

  function at(kindToCheck: SyntaxKind): boolean {
    return peek().kind === kindToCheck;
  }

  function eat(kind: SyntaxKind): boolean {
    const kindMatched = at(kind);
    if (kindMatched) {
      bumpAny();
    }
    return kindMatched;
  }

  function atAnyOf(kinds: SyntaxKind[]): boolean {
    return kinds.includes(peek().kind);
  }

  /**
  *
  * @param tokens that won't be consumed
  * @returns the error node with the consumed tokens, or null if there were no tokens consumed
  */
  function errNodeUntil(tokens: SyntaxKind[]): Node | null {
    startNode();
    advance(tokens);
    if(node.children!.length === 0){
      abandonNode();
      return null;
    } else {
      return completeNode(SyntaxKind.ErrorNode);
    }
  }

  /**
   * report an error and skip the next token if it isn't in the recoveryTokens. EoF isn't skipped.
   * @param recoveryTokens the [FollowSet](https://www.geeksforgeeks.org/follow-set-in-syntax-analysis/) of the parsed InnerNode. These tokens (or the EoF token) won't be skipped
   * @returns true if the current token is in the recovery set or EoF
   * */
  function errRecover(
    errCodeAndMsg: GeneralDiagnosticMessage,
    recoveryTokens: SyntaxKind[],
  ): boolean {
    if (atAnyOf(recoveryTokens) || at(SyntaxKind.EndOfFileToken)) {
      error(errCodeAndMsg);
      return true;
    }

    startNode();
    error(errCodeAndMsg);
    bumpAny();
    completeNode(SyntaxKind.ErrorNode);
    return false;
  }

  /** Bumps over the next token and marks it as an error node while adding an error to the error list*/
  function errorAndBump(errCodeAndMsg: GeneralDiagnosticMessage) {
    errRecover(errCodeAndMsg, []);
  }

  function error({ code, message, category }: GeneralDiagnosticMessage) {
    const { pos, end } = peek();
    errors.push({
      category,
      code,
      message,
      pos,
      end,
    });
  }

  function errorAt(
    { code, message, category }: GeneralDiagnosticMessage,
    pos: number,
    end: number,
  ) {
    errors.push({
      category,
      code,
      message,
      pos,
      end,
    });
  }

  function advance(to: SyntaxKind[]) {
    for (
      let token = peek();
      token.kind !== SyntaxKind.EndOfFileToken && !to.includes(token.kind);
      bumpAny(), token = peek()
    ){}
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
    let start = pos;
    let triviaBefore = undefined;
    if (leadingComments.length > 0) {
      triviaBefore = leadingComments;
      start = leadingComments[0].pos;
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

    peekedToken = { kind, start, pos, end, triviaBefore };
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
        let err: GeneralDiagnosticMessage;
        if (errFromScanner.message.code === ErrCodes.invalidChar) {
          err = DIAGS.invalidChar(scanner.getTokenText());
        } else {
          err = errFromScanner.message;
        }

        const pos = scanner.getTokenStart();
        const token = {
          kind,
          start,
          pos,
          end: scanner.getTokenEnd(),
          triviaBefore: triviaCollected.length > 0 ? triviaCollected : undefined,
        };

        triviaCollected = [];
        if (inContent && err.code === ErrCodes.invalidChar) {
          errFromScanner = undefined;
          return token;
        }

        const badPrefixEnd = pos + errFromScanner.prefixLength;
        token.end = badPrefixEnd;
        scanner.resetTokenState(badPrefixEnd);
        startNode();
        node.children!.push(token);
        errorAt(err, pos, badPrefixEnd);
        completeNode(SyntaxKind.ErrorNode);

        errFromScanner = undefined;
        return collectToken(inContent);
      }
      switch (kind) {
        case SyntaxKind.CommentTrivia:
        case SyntaxKind.NewLineTrivia:
        case SyntaxKind.WhitespaceTrivia:
          triviaCollected.push({
            kind,
            start,
            pos: scanner.getTokenStart(),
            end: scanner.getTokenEnd(),
          });
          break;

        default:
          return {
            kind,
            start,
            pos: scanner.getTokenStart(),
            end: scanner.getTokenEnd(),
            triviaBefore: triviaCollected.length > 0 ? triviaCollected : undefined,
          };
      }
    }
  }


  function abandonNode() {
    const parentNode = parents[parents.length - 1];
    parentNode!.children!.push(...node.children!);
    node = parentNode;
    parents.pop();
  }

  parseSourceContent();
  const completedNode: Node = createNode(SyntaxKind.ContentListNode, node.children);
  return { node: completedNode, errors };
}

function createNode(kind: SyntaxKind, children: Node[]): Node {
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  return {
    kind,
    start: firstChild.start,
    pos: firstChild.pos,
    end: lastChild.end,
    children,
  };
}
