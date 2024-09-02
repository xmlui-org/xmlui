import { CharacterCodes } from "../xmlui-parser/CharacterCodes";
import { createScanner } from "../xmlui-parser/scanner";
import { SyntaxKind, getSyntaxKindStrRepr } from "../xmlui-parser/syntax-kind";
import { Node } from "../xmlui-parser/syntax-node";
import { tagNameNodesMatch } from "./utils";

export enum ErrCodes {
  onlyOneElem = "U002",
  expTagOpen = "U003",
  expTagIdent = "U004",
  expCloseStart = "U005",
  expEndOrClose = "U006",
  tagNameMismatch = "U007",
  expEnd = "U008",
  expAttrIdent = "U009",
  expEq = "U010",
  expAttrValue = "U011",
  duplAttr = "U012",
  uppercaseAttr = "U013",
}

type ErrResult = {
  code: ErrCodes;
  message: string;
};

const Err = {
  uppercaseAttr: function (attrName: string) {
    return {
      code: ErrCodes.uppercaseAttr,
      message: `Attribute name '${attrName}' cannot start with an uppercase letter.`,
    };
  },
  duplAttr: function (attrName: string) {
    return {
      code: ErrCodes.duplAttr,
      message: `Duplicated attribute: '${attrName}'.`,
    };
  },
  expEnd: function () {
    return {
      code: ErrCodes.expEnd,
      message: "A '>' token expected.",
    };
  },
  expCloseStart: function () {
    return {
      code: ErrCodes.expCloseStart,
      message: "A '</' token expected.",
    };
  },

  expTagIdent: function () {
    return {
      code: ErrCodes.expTagIdent,
      message: "A tag identifier expected.",
    };
  },
  expAttrValue: function () {
    return {
      code: ErrCodes.expAttrValue,
      message: "An attribute value expected",
    };
  },
  expEq: function () {
    return {
      code: ErrCodes.expEq,
      message: "An '=' token expected",
    };
  },
  expTagOpen: function () {
    return {
      code: ErrCodes.expTagOpen,
      message: "A '<' token expected.",
    };
  },
  expEndOrClose: function () {
    return {
      code: ErrCodes.expEndOrClose,
      message: `A '>' or '/>' token expected.`,
    };
  },
  expAttrIdent: function () {
    return {
      code: ErrCodes.expAttrIdent,
      message: `An attribute identifier expected.`,
    };
  },
  tagNameMismatch: function (openTagName: string, closeTagName: string) {
    return {
      code: ErrCodes.tagNameMismatch,
      message: `Opening and closing tag names should match. Opening tag has a name '${openTagName}', but the closing tag name is '${closeTagName}'.`,
    };
  },
};

export interface Error {
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
export function createXmlUiParser(source: string) {
  return {
    parse: () => parseXmlUiMarkup(source),
    getText: (n: Node, ignoreTrivia: boolean = true) => source.substring(ignoreTrivia ? n.pos : n.start, n.end),
  };
}

export function parseXmlUiMarkup(text: string): ParseResult {
  const errors: Error[] = [];
  const parents: (IncompleteNode | Node)[] = [];
  let peekedToken: Node | undefined;
  let node: Node | IncompleteNode = { children: [] };
  const scanner = createScanner(false, text);

  function getText(n: Node, ignoreTrivia: boolean = true) {
    return text.substring(ignoreTrivia ? n.pos : n.start, n.end);
  }

  function parseContent() {
    startNode();
    parseSource();
    if (node.children && node.children.length > 0) {
      completeNode(SyntaxKind.ContentListNode);
    } else {
      abandonNode();
    }
  }

  function parseSource() {
    while (!eat(SyntaxKind.EndOfFileToken) && !at(SyntaxKind.CloseNodeStart)) {
      if (peekInContent().kind === SyntaxKind.TextNode) {
        bump(SyntaxKind.TextNode);
        continue;
      }
      if (eat(SyntaxKind.StringLiteral)) {
        continue;
      }
      parseTagLike();
    }
  }

  function parseTagLike() {
    if (!eat(SyntaxKind.CData) && !eat(SyntaxKind.Script)) {
      if (at(SyntaxKind.OpenNodeStart)) {
        parseTag();
      } else {
        errorAndBump(Err.expTagOpen());
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
      error(Err.expTagIdent());
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
            error(Err.tagNameMismatch(getText(openTagName!), getText(closeTagName)));
          }
        } else {
          errRecover(Err.expTagIdent(), [SyntaxKind.NodeEnd]);
        }
        if (!eat(SyntaxKind.NodeEnd)) {
          error(Err.expEnd());
        }
      } else {
        error(Err.expCloseStart());
      }
      completeNode(SyntaxKind.ElementNode);
      return;
    } else {
      error(Err.expEndOrClose());
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
    // no need to call errRecovery, since AttrList is optional
    startNode();
    const attrNames: any[] = [];
    while (!atAnyOf([SyntaxKind.EndOfFileToken, SyntaxKind.NodeEnd, SyntaxKind.NodeClose])) {
      // parseAttr
      if (!at(SyntaxKind.Identifier)) {
        if (atAnyOf(firstSetTagLike)) {
          error(Err.expAttrIdent());
          parseTagLike();
        } else {
          errorAndBump(Err.expAttrIdent());
        }
      } else {
        parseAttr(attrNames);
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

    startNode();
    bump(SyntaxKind.Identifier);

    if (eat(SyntaxKind.Equal)) {
      if (eat(SyntaxKind.StringLiteral)) {
        const attrName = getText(attrIdent);
        if (attrNames.includes(attrName)) {
          errorAt(Err.duplAttr(attrName), attrIdent.pos, attrIdent.end);
        } else if (attrName[0] >= "A" && attrName[0] <= "Z") {
          errorAt(Err.uppercaseAttr(attrName), attrIdent.pos, attrIdent.end);
        } else {
          attrNames.push(attrName);
        }
      } else {
        errRecover(Err.expAttrValue(), attrFollow);
      }
    } else {
      errRecover(Err.expEq(), attrFollow);
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
   * @param recoveryTokens the [FollowSet](https://www.geeksforgeeks.org/follow-set-in-syntax-analysis/) of the parsed InnerNode*/
  function errRecover(errCodeAndMsg: ErrResult, recoveryTokens: SyntaxKind[]) {
    if (atAnyOf(recoveryTokens) || at(SyntaxKind.EndOfFileToken)) {
      error(errCodeAndMsg);
      return;
    }

    startNode();
    error(errCodeAndMsg);
    bumpAny();
    completeNode(SyntaxKind.ErrorNode);
  }

  function error({ code, message }: ErrResult) {
    const { pos, end } = peek();
    errors.push({
      code,
      message,
      pos,
      end,
    });
  }

  function errorAt({ code, message }: ErrResult, pos: number, end: number) {
    errors.push({
      code,
      message,
      pos,
      end,
    });
  }

  function peek() {
    if (peekedToken !== undefined) {
      return peekedToken;
    }
    peekedToken = collectToken();
    return peekedToken;
  }

  function peekInContent(): Node {
    const token = peek();
    if (
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
      const nextToken = collectToken();
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
    const token = collectToken();
    node.children!.push(token);
    return token;
  }

  /** start an new node. Any new tokens or nodes will be put into it's children list from that point */
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

  function collectToken(): Node {
    let found: Node | null = null;
    let kind: SyntaxKind;
    const triviaCollected: Node[] = [];
    let start: number | null = null;
    while (true) {
      kind = scanner.scan();
      if (start === null) {
        start = scanner.getTokenStart();
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

        // todo: handle error
        // case SyntaxKind.Unknown:
        //   found = createError(start, scanner.getTokenStart(), scanner.getTokenEnd());
        //   break;

        default:
          found = {
            kind,
            start,
            pos: scanner.getTokenStart(),
            end: scanner.getTokenEnd(),
            triviaBefore: triviaCollected.length > 0 ? triviaCollected : undefined,
          };
          return found;
      }
    }
  }

  function errorAndBump(errCodeAndMsg: ErrResult) {
    errRecover(errCodeAndMsg, []);
  }

  function abandonNode() {
    const parentNode = parents[parents.length - 1];
    parentNode!.children!.push(...node.children!);
    node = parentNode;
    parents.pop();
  }

  parseSource();
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
