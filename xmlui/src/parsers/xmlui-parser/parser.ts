import type { Node } from "./syntax-node";
import type { ScannerErrorCallback } from "./scanner";
import type { DiagnosticMessageFromScanner, GeneralDiagnosticMessage } from "./diagnostics";

import { CharacterCodes } from "./CharacterCodes";
import { createScanner } from "./scanner";
import { SyntaxKind, getSyntaxKindStrRepr } from "./syntax-kind";
import { tagNameNodesMatch } from "./utils";
import {
  Diag_Attr_Identifier_Expected,
  Diag_Attr_Value_Expected,
  Diag_CloseNodeStart_Token_Expected,
  Diag_End_Or_Close_Token_Expected,
  Diag_End_Token_Expected,
  Diag_OpenNodeStart_Token_Expected,
  Diag_Tag_Identifier_Expected,
  DiagnosticCategory,
  ErrCodes,
} from "./diagnostics";

const MakeErr = {
  uppercaseAttr: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.uppercaseAttr,
      message: `Attribute name '${attrName}' cannot start with an uppercase letter.`,
    };
  },
  duplAttr: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.duplAttr,
      message: `Duplicated attribute: '${attrName}'.`,
    };
  },
  tagNameMismatch: function (openTagName: string, closeTagName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.tagNameMismatch,
      message: `Opening and closing tag names should match. Opening tag has a name '${openTagName}', but the closing tag name is '${closeTagName}'.`,
    };
  },
  invalidChar: function (char: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.invalidChar,
      message: `Invalid character '${char}'.`,
    };
  },
};

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

const firstSetTagLike = [SyntaxKind.CData, SyntaxKind.Script, SyntaxKind.OpenNodeStart];
// todo
// const firstSetContent = firstSetTagLike.concat ([
//   SyntaxKind.Identifier,
//   SyntaxKind.StringLiteral,
// ])
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
  let errFromScanner: { message: DiagnosticMessageFromScanner; prefixLength: number } | undefined = undefined;

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
        errorAndBump(Diag_OpenNodeStart_Token_Expected);
      }
    }
  }

  function parseTag() {
    startNode();
    bump(SyntaxKind.OpenNodeStart);

    let openTagName: Node | undefined = undefined;
    if (at(SyntaxKind.Identifier)) {
      openTagName = parseTagName();
    } else {
      error(Diag_Tag_Identifier_Expected);
    }

    parseAttrList();

    if (eat(SyntaxKind.NodeClose)) {
      completeNode(SyntaxKind.ElementNode);
      return;
    } else if (eat(SyntaxKind.NodeEnd)) {
      parseContent();
      if (eat(SyntaxKind.CloseNodeStart)) {
        if (at(SyntaxKind.Identifier)) {
          const closeTagName = parseTagName();
          const namesMismatch = openTagName !== undefined && !tagNameNodesMatch(openTagName, closeTagName, getText);
          if (namesMismatch) {
            error(MakeErr.tagNameMismatch(getText(openTagName!), getText(closeTagName)));
          }
        } else {
          errRecover(Diag_Tag_Identifier_Expected, [SyntaxKind.NodeEnd]);
        }
        if (!eat(SyntaxKind.NodeEnd)) {
          error(Diag_End_Token_Expected);
        }
      } else {
        error(Diag_CloseNodeStart_Token_Expected);
      }
      completeNode(SyntaxKind.ElementNode);
      return;
    } else {
      error(Diag_End_Or_Close_Token_Expected);
    }
  }

  function parseTagName(): Node {
    startNode();
    bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon)) {
      if (!eat(SyntaxKind.Identifier)) {
        //TODO: error, possibly check for Eq and report that a name is missing before the attributes. Should parse as attribute then.
      }
    }
    return completeNode(SyntaxKind.TagNameNode);
  }

  function parseAttrList() {
    startNode();
    const attrNames: any[] = [];
    while (!atAnyOf([SyntaxKind.EndOfFileToken, SyntaxKind.NodeEnd, SyntaxKind.NodeClose])) {
      if (at(SyntaxKind.Identifier)) {
        parseAttr(attrNames);
      } else {
        const atTagLike = errRecover(Diag_Attr_Identifier_Expected, firstSetTagLike);
        if (atTagLike) {
          parseTagLike();
        }
      }
    }

    if (node.children!.length === 0) {
      abandonNode();
    } else {
      completeNode(SyntaxKind.AttributeListNode);
    }
  }

  function parseAttr(attrNames: string[]) {
    //todo: make this recovery set actualy true (like implement handling cdata ,...)
    const attrListFollow = [
      // FOLLOW(AttrList) when a Tag is correct
      SyntaxKind.NodeClose,
      SyntaxKind.NodeEnd,
      // FOLLOW(AttrList) when a Tag contains incorrect, but still parsed tokens for resilience
      SyntaxKind.CData,
      // todo
      // SyntaxKind.ScriptLiteral,
      SyntaxKind.OpenNodeStart,
    ];
    const attrFollow = attrListFollow.concat(SyntaxKind.Identifier);

    const attrIdent = peek();
    const attrName = getText(attrIdent);
    if (attrNames.includes(attrName)) {
      errorAt(MakeErr.duplAttr(attrName), attrIdent.pos, attrIdent.end);
    } else if (attrName[0] >= "A" && attrName[0] <= "Z") {
      errorAt(MakeErr.uppercaseAttr(attrName), attrIdent.pos, attrIdent.end);
    } else {
      attrNames.push(attrName);
    }

    startNode();
    bump(SyntaxKind.Identifier);

    if (eat(SyntaxKind.Equal)) {
      if (!eat(SyntaxKind.StringLiteral) && !eat(SyntaxKind.Identifier)) {
        errRecover(Diag_Attr_Value_Expected, attrFollow);
      }
    }

    completeNode(SyntaxKind.AttributeNode);
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
   * @param recoveryTokens the [FollowSet](https://www.geeksforgeeks.org/follow-set-in-syntax-analysis/) of the parsed InnerNode
   * @returns true if the current token is in the recovery set, otherwise false
   * */

  function errRecover(errCodeAndMsg: GeneralDiagnosticMessage, recoveryTokens: SyntaxKind[]): boolean {
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

  function errorAt({ code, message, category }: GeneralDiagnosticMessage, pos: number, end: number) {
    errors.push({
      category,
      code,
      message,
      pos,
      end,
    });
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
      throw new Error(`expected ${getSyntaxKindStrRepr(kind)}, bumped a ${getSyntaxKindStrRepr(token.kind)}`);
    }
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
          err = MakeErr.invalidChar(scanner.getText());
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

  function errorAndBump(errCodeAndMsg: GeneralDiagnosticMessage) {
    errRecover(errCodeAndMsg, []);
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
