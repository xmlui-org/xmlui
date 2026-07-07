var SyntaxKind = /* @__PURE__ */ ((SyntaxKind2) => {
  SyntaxKind2[SyntaxKind2["Unknown"] = 0] = "Unknown";
  SyntaxKind2[SyntaxKind2["EndOfFileToken"] = 1] = "EndOfFileToken";
  SyntaxKind2[SyntaxKind2["CommentTrivia"] = 2] = "CommentTrivia";
  SyntaxKind2[SyntaxKind2["NewLineTrivia"] = 3] = "NewLineTrivia";
  SyntaxKind2[SyntaxKind2["WhitespaceTrivia"] = 4] = "WhitespaceTrivia";
  SyntaxKind2[SyntaxKind2["Identifier"] = 5] = "Identifier";
  SyntaxKind2[SyntaxKind2["OpenNodeStart"] = 6] = "OpenNodeStart";
  SyntaxKind2[SyntaxKind2["CloseNodeStart"] = 7] = "CloseNodeStart";
  SyntaxKind2[SyntaxKind2["NodeEnd"] = 8] = "NodeEnd";
  SyntaxKind2[SyntaxKind2["NodeClose"] = 9] = "NodeClose";
  SyntaxKind2[SyntaxKind2["Colon"] = 10] = "Colon";
  SyntaxKind2[SyntaxKind2["Equal"] = 11] = "Equal";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 12] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["CData"] = 13] = "CData";
  SyntaxKind2[SyntaxKind2["Script"] = 14] = "Script";
  SyntaxKind2[SyntaxKind2["TextNode"] = 15] = "TextNode";
  SyntaxKind2[SyntaxKind2["AmpersandEntity"] = 16] = "AmpersandEntity";
  SyntaxKind2[SyntaxKind2["LessThanEntity"] = 17] = "LessThanEntity";
  SyntaxKind2[SyntaxKind2["GreaterThanEntity"] = 18] = "GreaterThanEntity";
  SyntaxKind2[SyntaxKind2["SingleQuoteEntity"] = 19] = "SingleQuoteEntity";
  SyntaxKind2[SyntaxKind2["DoubleQuoteEntity"] = 20] = "DoubleQuoteEntity";
  SyntaxKind2[SyntaxKind2["ElementNode"] = 21] = "ElementNode";
  SyntaxKind2[SyntaxKind2["AttributeNode"] = 22] = "AttributeNode";
  SyntaxKind2[SyntaxKind2["AttributeKeyNode"] = 23] = "AttributeKeyNode";
  SyntaxKind2[SyntaxKind2["ContentListNode"] = 24] = "ContentListNode";
  SyntaxKind2[SyntaxKind2["AttributeListNode"] = 25] = "AttributeListNode";
  SyntaxKind2[SyntaxKind2["TagNameNode"] = 26] = "TagNameNode";
  SyntaxKind2[SyntaxKind2["ErrorNode"] = 27] = "ErrorNode";
  return SyntaxKind2;
})(SyntaxKind || {});
function isTrivia(token) {
  return token >= 2 && token <= 4;
}
function getSyntaxKindStrRepr(kind) {
  switch (kind) {
    case 0:
      return "Unknown";
    case 1:
      return "EndOfFileToken";
    case 2:
      return "CommentTrivia";
    case 3:
      return "NewLineTrivia";
    case 4:
      return "WhitespaceTrivia";
    case 5:
      return "Identifier";
    case 6:
      return "OpenNodeStart";
    case 7:
      return "CloseNodeStart";
    case 8:
      return "NodeEnd";
    case 9:
      return "NodeClose";
    case 10:
      return "Colon";
    case 11:
      return "Equal";
    case 12:
      return "StringLiteral";
    case 13:
      return "CData";
    case 14:
      return "Script";
    case 16:
      return "AmpersandEntity";
    case 17:
      return "LessThanEntity";
    case 18:
      return "GreaterThanEntity";
    case 19:
      return "SingleQuoteEntity";
    case 20:
      return "DoubleQuoteEntity";
    case 21:
      return "ElementNode";
    case 22:
      return "AttributeNode";
    case 15:
      return "TextNode";
    case 24:
      return "ContentListNode";
    case 25:
      return "AttributeListNode";
    case 26:
      return "TagNameNode";
    case 27:
      return "ErrorNode";
    case 23:
      return "AttributeKeyNode";
  }
  return assertUnreachable();
}
function assertUnreachable(x) {
  throw new Error("Didn't expect to get here");
}
function tagNameNodesWithoutErrorsMatch(name1, name2, getText) {
  const children1 = name1.children?.filter((c) => c.kind !== SyntaxKind.ErrorNode) ?? [];
  const children2 = name2.children?.filter((c) => c.kind !== SyntaxKind.ErrorNode) ?? [];
  if (children1.length !== children2.length) {
    return false;
  }
  for (let i = 0; i < children1.length; ++i) {
    if (getText(children1[i]) !== getText(children2[i])) {
      return false;
    }
  }
  return true;
}
function findTokenAtOffset(node, offset) {
  const chain = [node];
  let sharedParents;
  if (node.start > offset || offset > node.end) {
    return void 0;
  }
  const res = {
    chainAtPos: chain,
    chainBeforePos: void 0,
    sharedParents: void 0
  };
  while (node.children !== void 0 && node.children.length > 0) {
    const nodeAtPosIdx = node.children.findIndex(
      (n) => n.start <= offset && (offset < n.end || n.kind === SyntaxKind.EndOfFileToken && n.start <= n.end)
    );
    const nodeAtPos = node.children[nodeAtPosIdx];
    const nodeBeforePos = node.children[nodeAtPosIdx - 1];
    if (nodeBeforePos !== void 0 && offset <= nodeAtPos.pos) {
      sharedParents = chain.length;
      return {
        chainBeforePos: chain.concat(findLastToken(nodeBeforePos)),
        sharedParents,
        chainAtPos: chain.concat(findFirstToken(nodeAtPos))
      };
    }
    node = nodeAtPos;
    res.chainAtPos.push(node);
  }
  return res;
}
function findFirstToken(node) {
  const chain = [node];
  while (node.children !== void 0 && node.children.length > 0) {
    node = node.children[0];
    chain.push(node);
  }
  return chain;
}
function findLastToken(node) {
  const chain = [node];
  while (node.children !== void 0 && node.children.length > 0) {
    node = node.children[node.children.length - 1];
    chain.push(node);
  }
  return chain;
}
class Node {
  constructor(kind, pos, end, triviaBefore, children) {
    this.kind = kind;
    this.pos = pos;
    this.end = end;
    this.triviaBefore = triviaBefore;
    this.children = children;
    if (triviaBefore) {
      this.start = triviaBefore[0]?.start ?? pos;
    } else if (children) {
      this.start = children[0]?.start ?? pos;
    } else {
      this.start = pos;
    }
  }
  isElementNode() {
    return this.kind === SyntaxKind.ElementNode;
  }
  isAttributeNode() {
    return this.kind === SyntaxKind.AttributeNode;
  }
  isTagLike() {
    return this.kind === SyntaxKind.ElementNode || this.kind === SyntaxKind.CData || this.kind == SyntaxKind.Script;
  }
  isAttributeKeyNode() {
    return this.kind === SyntaxKind.AttributeKeyNode;
  }
  isContentListNode() {
    return this.kind === SyntaxKind.ContentListNode;
  }
  isAttributeListNode() {
    return this.kind === SyntaxKind.AttributeListNode;
  }
  isTagNameNode() {
    return this.kind === SyntaxKind.TagNameNode;
  }
  findTokenAtOffset(position) {
    return findTokenAtOffset(this, position);
  }
  getTriviaNodes() {
    if (this.pos === this.start) {
      return null;
    } else if (this.triviaBefore) {
      return this.triviaBefore;
    } else {
      return this.children[0].getTriviaNodes();
    }
  }
}
class ElementNode extends Node {
  getAttributeListNode() {
    return this.children.find((c) => c.isContentListNode());
  }
}
class AttributeNode extends Node {
}
class AttributeKeyNode extends Node {
}
class ContentListNode extends Node {
}
class AttributeListNode extends Node {
}
class TagNameNode extends Node {
}
var CharacterCodes = /* @__PURE__ */ ((CharacterCodes2) => {
  CharacterCodes2[CharacterCodes2["EOF"] = -1] = "EOF";
  CharacterCodes2[CharacterCodes2["nullCharacter"] = 0] = "nullCharacter";
  CharacterCodes2[CharacterCodes2["maxAsciiCharacter"] = 127] = "maxAsciiCharacter";
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["lineSeparator"] = 8232] = "lineSeparator";
  CharacterCodes2[CharacterCodes2["paragraphSeparator"] = 8233] = "paragraphSeparator";
  CharacterCodes2[CharacterCodes2["nextLine"] = 133] = "nextLine";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["nonBreakingSpace"] = 160] = "nonBreakingSpace";
  CharacterCodes2[CharacterCodes2["enQuad"] = 8192] = "enQuad";
  CharacterCodes2[CharacterCodes2["emQuad"] = 8193] = "emQuad";
  CharacterCodes2[CharacterCodes2["enSpace"] = 8194] = "enSpace";
  CharacterCodes2[CharacterCodes2["emSpace"] = 8195] = "emSpace";
  CharacterCodes2[CharacterCodes2["threePerEmSpace"] = 8196] = "threePerEmSpace";
  CharacterCodes2[CharacterCodes2["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
  CharacterCodes2[CharacterCodes2["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
  CharacterCodes2[CharacterCodes2["figureSpace"] = 8199] = "figureSpace";
  CharacterCodes2[CharacterCodes2["punctuationSpace"] = 8200] = "punctuationSpace";
  CharacterCodes2[CharacterCodes2["thinSpace"] = 8201] = "thinSpace";
  CharacterCodes2[CharacterCodes2["hairSpace"] = 8202] = "hairSpace";
  CharacterCodes2[CharacterCodes2["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
  CharacterCodes2[CharacterCodes2["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
  CharacterCodes2[CharacterCodes2["ideographicSpace"] = 12288] = "ideographicSpace";
  CharacterCodes2[CharacterCodes2["mathematicalSpace"] = 8287] = "mathematicalSpace";
  CharacterCodes2[CharacterCodes2["ogham"] = 5760] = "ogham";
  CharacterCodes2[CharacterCodes2["replacementCharacter"] = 65533] = "replacementCharacter";
  CharacterCodes2[CharacterCodes2["_"] = 95] = "_";
  CharacterCodes2[CharacterCodes2["$"] = 36] = "$";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["ampersand"] = 38] = "ampersand";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["at"] = 64] = "at";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["backtick"] = 96] = "backtick";
  CharacterCodes2[CharacterCodes2["bar"] = 124] = "bar";
  CharacterCodes2[CharacterCodes2["caret"] = 94] = "caret";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["closeParen"] = 41] = "closeParen";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["equals"] = 61] = "equals";
  CharacterCodes2[CharacterCodes2["exclamation"] = 33] = "exclamation";
  CharacterCodes2[CharacterCodes2["greaterThan"] = 62] = "greaterThan";
  CharacterCodes2[CharacterCodes2["hash"] = 35] = "hash";
  CharacterCodes2[CharacterCodes2["lessThan"] = 60] = "lessThan";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["openParen"] = 40] = "openParen";
  CharacterCodes2[CharacterCodes2["percent"] = 37] = "percent";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["question"] = 63] = "question";
  CharacterCodes2[CharacterCodes2["semicolon"] = 59] = "semicolon";
  CharacterCodes2[CharacterCodes2["singleQuote"] = 39] = "singleQuote";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["tilde"] = 126] = "tilde";
  CharacterCodes2[CharacterCodes2["backspace"] = 8] = "backspace";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["byteOrderMark"] = 65279] = "byteOrderMark";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
  CharacterCodes2[CharacterCodes2["verticalTab"] = 11] = "verticalTab";
  return CharacterCodes2;
})(CharacterCodes || {});
var ErrCodesParser = /* @__PURE__ */ ((ErrCodesParser2) => {
  ErrCodesParser2["onlyOneElem"] = "U002";
  ErrCodesParser2["expTagOpen"] = "U003";
  ErrCodesParser2["expTagName"] = "U004";
  ErrCodesParser2["expCloseStart"] = "U005";
  ErrCodesParser2["expEndOrClose"] = "U006";
  ErrCodesParser2["tagNameMismatch"] = "U007";
  ErrCodesParser2["expEnd"] = "U008";
  ErrCodesParser2["expAttrName"] = "U009";
  ErrCodesParser2["expEq"] = "U010";
  ErrCodesParser2["expAttrValue"] = "U011";
  ErrCodesParser2["duplAttr"] = "U012";
  ErrCodesParser2["uppercaseAttr"] = "U013";
  ErrCodesParser2["expTagNameAfterNamespace"] = "U014";
  ErrCodesParser2["expCloseStartWithName"] = "U015";
  ErrCodesParser2["expAttrNameAfterNamespace"] = "U016";
  ErrCodesParser2["unexpectedCloseTag"] = "U017";
  ErrCodesParser2["expTagNameAfterCloseStart"] = "U019";
  ErrCodesParser2["expAttrNameBeforeEq"] = "U020";
  ErrCodesParser2["invalidChar"] = "W001";
  ErrCodesParser2["untermStr"] = "W002";
  ErrCodesParser2["untermComment"] = "W007";
  ErrCodesParser2["untermCData"] = "W008";
  ErrCodesParser2["untermScript"] = "W009";
  return ErrCodesParser2;
})(ErrCodesParser || {});
const DIAGS_PARSER = {
  unexpectedCloseTag: {
    code: "U017",
    message: "Read '</', but there's no opening tag to close."
  },
  expCloseStartWithName: function(openTagName) {
    return {
      code: "U015",
      message: `Opened tag has no closing pair. Expected to see '</${openTagName}>'.`
    };
  },
  expCloseStart: {
    code: "U005",
    message: "A '</' token expected."
  },
  uppercaseAttr: function(attrName) {
    return {
      code: "U013",
      message: `Attribute name '${attrName}' cannot start with an uppercase letter.`
    };
  },
  duplAttr: function(attrName) {
    return {
      code: "U012",
      message: `Duplicated attribute: '${attrName}'.`
    };
  },
  tagNameMismatch: function(openTagName, closeTagName) {
    return {
      code: "U007",
      message: `Opening and closing tag names should match. Opening tag has a name '${openTagName}', but the closing tag name is '${closeTagName}'.`
    };
  },
  invalidChar: function(char) {
    return {
      code: "W001",
      message: `Invalid character '${char}'.`
    };
  },
  expEnd: {
    code: "U008",
    message: "A '>' token expected."
  },
  expTagName: {
    code: "U004",
    message: "A tag name expected."
  },
  expAttrStr: {
    code: "U011",
    message: `A string expected as an attribute value after '='.`
  },
  expEq: {
    code: "U010",
    message: "An '=' token expected."
  },
  expTagOpen: {
    code: "U003",
    message: "A '<' token expected."
  },
  expEndOrClose: {
    code: "U006",
    message: `A '>' or '/>' token expected.`
  },
  expAttrName: {
    code: "U009",
    message: `An attribute name expected.`
  },
  expAttrNameAfterNamespace: function(namespaceName) {
    return {
      code: "U016",
      message: `An attribute name expected after namespace '${namespaceName}'.`
    };
  },
  expTagNameAfterNamespace: function(namespaceName) {
    return {
      code: "U014",
      message: `A tag name expected after namespace '${namespaceName}'.`
    };
  },
  expTagNameAfterCloseStart: {
    code: "U019",
    message: "Expected tag name after '</'."
  },
  expAttrNameBeforeEq: {
    code: "U020",
    message: "Expected attribute name before '='."
  }
};
const Diag_Invalid_Character = {
  code: "W001",
  message: "Invalid character."
};
const Diag_Unterminated_String_Literal = {
  code: "W002",
  message: "Unterminated string literal."
};
const Diag_Unterminated_Comment = {
  code: "W007",
  message: "Unterminated comment"
};
const Diag_Unterminated_CData = {
  code: "W008",
  message: "Unterminated CDATA section"
};
const Diag_Unterminated_Script = {
  code: "W009",
  message: "Unterminated script section"
};
function createScanner(skipTrivia, textInitial, onError, start, length) {
  let text = textInitial ?? "";
  let pos;
  let end;
  let fullStartPos;
  let tokenStart;
  let token;
  let tokenValue;
  setText(text, start, length);
  return {
    getStartPos: () => fullStartPos,
    getTokenEnd: () => pos,
    getToken: () => token,
    getTokenStart: () => tokenStart,
    getTokenText: () => text.substring(tokenStart, pos),
    getTokenValue: () => tokenValue,
    isIdentifier: () => token === SyntaxKind.Identifier,
    peekChar,
    scanChar,
    scan,
    scanTrivia,
    scanText,
    getText,
    setText,
    setOnError,
    resetTokenState,
    back
  };
  function peekChar(ahead) {
    if (pos + (ahead ?? 0) >= end) {
      return null;
    }
    const ch = codePointUnchecked(pos + (ahead ?? 0));
    return isNaN(ch) ? null : ch;
  }
  function scanChar() {
    if (pos >= end) {
      return null;
    }
    const ch = codePointUnchecked(pos);
    pos += charSize(ch);
    return ch;
  }
  function scan() {
    fullStartPos = pos;
    while (true) {
      tokenStart = pos;
      if (pos >= end) {
        return token = SyntaxKind.EndOfFileToken;
      }
      const ch = codePointUnchecked(pos);
      switch (ch) {
        // --- Collect line break
        case CharacterCodes.lineFeed:
        case CharacterCodes.carriageReturn: {
          if (ch === CharacterCodes.carriageReturn && pos + 1 < end && charCodeUnchecked(pos + 1) === CharacterCodes.lineFeed) {
            pos += 2;
          } else {
            pos++;
          }
          return token = SyntaxKind.NewLineTrivia;
        }
        // --- Collect whitespace
        case CharacterCodes.tab:
        case CharacterCodes.verticalTab:
        case CharacterCodes.formFeed:
        case CharacterCodes.space:
        case CharacterCodes.nonBreakingSpace:
        case CharacterCodes.ogham:
        case CharacterCodes.enQuad:
        case CharacterCodes.emQuad:
        case CharacterCodes.enSpace:
        case CharacterCodes.emSpace:
        case CharacterCodes.threePerEmSpace:
        case CharacterCodes.fourPerEmSpace:
        case CharacterCodes.sixPerEmSpace:
        case CharacterCodes.figureSpace:
        case CharacterCodes.punctuationSpace:
        case CharacterCodes.thinSpace:
        case CharacterCodes.hairSpace:
        case CharacterCodes.zeroWidthSpace:
        case CharacterCodes.narrowNoBreakSpace:
        case CharacterCodes.mathematicalSpace:
        case CharacterCodes.ideographicSpace:
        case CharacterCodes.byteOrderMark: {
          while (pos < end && isWhiteSpaceSingleLine(charCodeUnchecked(pos))) {
            pos++;
          }
          return token = SyntaxKind.WhitespaceTrivia;
        }
        // --- Collect string literal
        case CharacterCodes.doubleQuote:
        case CharacterCodes.singleQuote:
        case CharacterCodes.backtick:
          tokenValue = scanString();
          return token = SyntaxKind.StringLiteral;
        // --- Collext XML entities
        case CharacterCodes.ampersand:
          if (charCodeUnchecked(pos + 1) === CharacterCodes.a && charCodeUnchecked(pos + 2) === CharacterCodes.m && charCodeUnchecked(pos + 3) === CharacterCodes.p && charCodeUnchecked(pos + 4) === CharacterCodes.semicolon) {
            pos += 5;
            return token = SyntaxKind.AmpersandEntity;
          } else if (charCodeUnchecked(pos + 1) === CharacterCodes.l && charCodeUnchecked(pos + 2) === CharacterCodes.t && charCodeUnchecked(pos + 3) === CharacterCodes.semicolon) {
            pos += 4;
            return token = SyntaxKind.LessThanEntity;
          } else if (charCodeUnchecked(pos + 1) === CharacterCodes.g && charCodeUnchecked(pos + 2) === CharacterCodes.t && charCodeUnchecked(pos + 3) === CharacterCodes.semicolon) {
            pos += 4;
            return token = SyntaxKind.GreaterThanEntity;
          } else if (charCodeUnchecked(pos + 1) === CharacterCodes.q && charCodeUnchecked(pos + 2) === CharacterCodes.u && charCodeUnchecked(pos + 3) === CharacterCodes.o && charCodeUnchecked(pos + 4) === CharacterCodes.t && charCodeUnchecked(pos + 5) === CharacterCodes.semicolon) {
            pos += 6;
            return token = SyntaxKind.DoubleQuoteEntity;
          } else if (charCodeUnchecked(pos + 1) === CharacterCodes.a && charCodeUnchecked(pos + 2) === CharacterCodes.p && charCodeUnchecked(pos + 3) === CharacterCodes.o && charCodeUnchecked(pos + 4) === CharacterCodes.s && charCodeUnchecked(pos + 5) === CharacterCodes.semicolon) {
            pos += 6;
            return token = SyntaxKind.SingleQuoteEntity;
          }
          pos++;
          error(Diag_Invalid_Character, 1);
          return token = SyntaxKind.Unknown;
        // --- Collect equal token
        case CharacterCodes.equals:
          pos++;
          return token = SyntaxKind.Equal;
        // --- Collect colon token
        case CharacterCodes.colon:
          pos++;
          return token = SyntaxKind.Colon;
        // --- Collect tokens starting with '<'
        case CharacterCodes.lessThan:
          if (charCodeUnchecked(pos + 1) === CharacterCodes.slash) {
            pos += 2;
            return token = SyntaxKind.CloseNodeStart;
          } else if (
            // --- "<!-- -->", XMLUI comment
            charCodeUnchecked(pos + 1) === CharacterCodes.exclamation && charCodeUnchecked(pos + 2) === CharacterCodes.minus && charCodeUnchecked(pos + 3) === CharacterCodes.minus
          ) {
            pos += 4;
            while (pos < end) {
              if (charCodeUnchecked(pos) === CharacterCodes.minus && charCodeUnchecked(pos + 1) === CharacterCodes.minus && charCodeUnchecked(pos + 2) === CharacterCodes.greaterThan) {
                pos += 3;
                return token = SyntaxKind.CommentTrivia;
              }
              pos += charSize(charCodeUnchecked(pos));
            }
            error(Diag_Unterminated_Comment, 4);
            return token = SyntaxKind.Unknown;
          } else if (
            // --- <![CDATA[ section
            charCodeUnchecked(pos + 1) === CharacterCodes.exclamation && charCodeUnchecked(pos + 2) === CharacterCodes.openBracket && charCodeUnchecked(pos + 3) === CharacterCodes.C && charCodeUnchecked(pos + 4) === CharacterCodes.D && charCodeUnchecked(pos + 5) === CharacterCodes.A && charCodeUnchecked(pos + 6) === CharacterCodes.T && charCodeUnchecked(pos + 7) === CharacterCodes.A && charCodeUnchecked(pos + 8) === CharacterCodes.openBracket
          ) {
            pos += 9;
            while (pos < end) {
              if (charCodeUnchecked(pos) === CharacterCodes.closeBracket && charCodeUnchecked(pos + 1) === CharacterCodes.closeBracket && charCodeUnchecked(pos + 2) === CharacterCodes.greaterThan) {
                pos += 3;
                return token = SyntaxKind.CData;
              }
              pos += charSize(charCodeUnchecked(pos));
            }
            error(Diag_Unterminated_CData, 9);
            return token = SyntaxKind.CData;
          } else if (
            // --- <script>
            charCodeUnchecked(pos + 1) === CharacterCodes.s && charCodeUnchecked(pos + 2) === CharacterCodes.c && charCodeUnchecked(pos + 3) === CharacterCodes.r && charCodeUnchecked(pos + 4) === CharacterCodes.i && charCodeUnchecked(pos + 5) === CharacterCodes.p && charCodeUnchecked(pos + 6) === CharacterCodes.t && charCodeUnchecked(pos + 7) === CharacterCodes.greaterThan
          ) {
            pos += 8;
            while (pos < end) {
              if (charCodeUnchecked(pos) === CharacterCodes.lessThan && charCodeUnchecked(pos + 1) === CharacterCodes.slash && charCodeUnchecked(pos + 2) === CharacterCodes.s && charCodeUnchecked(pos + 3) === CharacterCodes.c && charCodeUnchecked(pos + 4) === CharacterCodes.r && charCodeUnchecked(pos + 5) === CharacterCodes.i && charCodeUnchecked(pos + 6) === CharacterCodes.p && charCodeUnchecked(pos + 7) === CharacterCodes.t && charCodeUnchecked(pos + 8) === CharacterCodes.greaterThan) {
                pos += 9;
                return token = SyntaxKind.Script;
              }
              pos += charSize(charCodeUnchecked(pos));
            }
            error(Diag_Unterminated_Script, 9);
            return token = SyntaxKind.Script;
          }
          pos++;
          return token = SyntaxKind.OpenNodeStart;
        case CharacterCodes.slash:
          if (charCodeUnchecked(pos + 1) === CharacterCodes.greaterThan) {
            pos += 2;
            return token = SyntaxKind.NodeClose;
          }
          pos++;
          error(Diag_Invalid_Character, 1);
          return token = SyntaxKind.Unknown;
        // --- Collect node closing token
        case CharacterCodes.greaterThan:
          pos++;
          return token = SyntaxKind.NodeEnd;
        default:
          const identifierKind = scanIdentifier(ch);
          if (identifierKind) {
            return token = identifierKind;
          } else if (isWhiteSpaceSingleLine(ch)) {
            pos += charSize(ch);
            continue;
          } else if (isLineBreak(ch)) {
            pos += charSize(ch);
            continue;
          }
          const size = charSize(ch);
          pos += size;
          error(Diag_Invalid_Character, size);
          return token = SyntaxKind.Unknown;
      }
    }
  }
  function scanTrivia() {
    const currentPos = pos;
    const token2 = scan();
    if (isTrivia(token2)) {
      return token2;
    }
    resetTokenState(currentPos);
    return null;
  }
  function scanText() {
    return SyntaxKind.Unknown;
  }
  function getText() {
    return text;
  }
  function charCodeUnchecked(pos2) {
    return text.charCodeAt(pos2);
  }
  function codePointUnchecked(pos2) {
    return codePointAt(text, pos2);
  }
  function codePointAt(s, i) {
    return s.codePointAt(i) ?? 0;
  }
  function setText(newText, start2, length2) {
    text = newText || "";
    end = length2 === void 0 ? text.length : start2 + length2;
    resetTokenState(start2 || 0);
  }
  function setOnError(errorCallback) {
    onError = errorCallback;
  }
  function resetTokenState(position) {
    pos = position;
    fullStartPos = position;
    tokenStart = position;
    token = SyntaxKind.Unknown;
    tokenValue = void 0;
  }
  function back() {
    resetTokenState(fullStartPos);
  }
  function scanIdentifier(startCharacter) {
    let ch = startCharacter;
    if (isIdentifierStart(ch)) {
      pos += charSize(ch);
      while (pos < end && isIdentifierPart(ch = codePointUnchecked(pos))) {
        pos += charSize(ch);
      }
      tokenValue = text.substring(tokenStart, pos);
      return getIdentifierToken();
    }
  }
  function getIdentifierToken() {
    return token = SyntaxKind.Identifier;
  }
  function scanString() {
    const quote = charCodeUnchecked(pos);
    pos++;
    let result = "";
    let start2 = pos;
    while (true) {
      if (pos >= end) {
        result += text.substring(start2, pos);
        error(Diag_Unterminated_String_Literal, 1);
        break;
      }
      const ch = charCodeUnchecked(pos);
      if (ch === quote) {
        result += text.substring(start2, pos);
        pos++;
        break;
      }
      pos++;
    }
    return result;
  }
  function error(message, troublesomePrefixLength = 0) {
    if (onError) {
      onError(message, troublesomePrefixLength);
    }
  }
}
function charSize(ch) {
  if (ch >= 65536) {
    return 2;
  }
  if (ch === CharacterCodes.EOF) {
    return 0;
  }
  return 1;
}
function isASCIILetter(ch) {
  return ch >= CharacterCodes.A && ch <= CharacterCodes.Z || ch >= CharacterCodes.a && ch <= CharacterCodes.z;
}
function isWordCharacter(ch) {
  return isASCIILetter(ch) || isDigit(ch) || ch === CharacterCodes._;
}
function isDigit(ch) {
  return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}
function isIdentifierStart(ch) {
  return isASCIILetter(ch) || ch === CharacterCodes.$ || ch === CharacterCodes._;
}
function isIdentifierPart(ch) {
  return isWordCharacter(ch) || ch === CharacterCodes.$ || ch === CharacterCodes.minus || ch === CharacterCodes.dot;
}
function isWhiteSpaceSingleLine(ch) {
  return ch === CharacterCodes.space || ch === CharacterCodes.tab || ch === CharacterCodes.verticalTab || ch === CharacterCodes.formFeed || ch === CharacterCodes.nonBreakingSpace || ch === CharacterCodes.nextLine || ch === CharacterCodes.ogham || ch >= CharacterCodes.enQuad && ch <= CharacterCodes.zeroWidthSpace || ch === CharacterCodes.narrowNoBreakSpace || ch === CharacterCodes.mathematicalSpace || ch === CharacterCodes.ideographicSpace || ch === CharacterCodes.byteOrderMark;
}
function isLineBreak(ch) {
  return ch === CharacterCodes.lineFeed || ch === CharacterCodes.carriageReturn || ch === CharacterCodes.lineSeparator || ch === CharacterCodes.paragraphSeparator;
}
class DocumentCursor {
  constructor(text) {
    this.text = text;
    this.newlineOffsets = [0];
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (isEOL(ch)) {
        if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
          i++;
        }
        this.newlineOffsets.push(i + 1);
      }
    }
  }
  get textLength() {
    return this.text.length;
  }
  get lineCount() {
    return this.newlineOffsets.length;
  }
  /**
   * Converts a zero-based offset to a position.
   *
   * @param offset A zero-based offset.
   * @return A valid {@link Position position}.
   * @example The text document "ab\ncd" produces:
   * * position { line: 0, character: 0 } for `offset` 0.
   * * position { line: 0, character: 1 } for `offset` 1.
   * * position { line: 0, character: 2 } for `offset` 2.
   * * position { line: 1, character: 0 } for `offset` 3.
   * * position { line: 1, character: 1 } for `offset` 4.
   */
  positionAt(offset) {
    offset = Math.max(Math.min(offset, this.textLength), 0);
    const lineOffsets = this.newlineOffsets;
    let low = 0, high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    const line = low - 1;
    return { line, character: offset - lineOffsets[line] };
  }
  /**
   * Converts the position to a zero-based offset.
   * Invalid positions are adjusted as described in {@link Position.line}
   * and {@link Position.character}.
   *
   * @param position A position.
   * @return A valid zero-based offset.
   */
  offsetAt(position) {
    if (position.line >= this.newlineOffsets.length) {
      return this.textLength;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = this.newlineOffsets[position.line];
    if (position.character <= 0) {
      return lineOffset;
    }
    const nextLineOffset = position.line + 1 < this.newlineOffsets.length ? this.newlineOffsets[position.line + 1] : this.textLength;
    return Math.min(lineOffset + position.character, nextLineOffset);
  }
  offsetToDisplayPos(offset) {
    const pos = this.positionAt(offset);
    return { line: pos.line + 1, character: pos.character + 1 };
  }
  getSurroundingContext(pos, end, surroundingLines) {
    const startLine = this.positionAt(pos).line;
    const endLine = this.positionAt(end).line;
    const contextStartLine = Math.max(0, startLine - surroundingLines);
    const contextPos = this.newlineOffsets[contextStartLine];
    const contextEndLineWithContent = Math.min(this.lineCount - 1, endLine + surroundingLines);
    const nextLineAfterContext = contextEndLineWithContent + 1;
    let contextEnd;
    if (nextLineAfterContext < this.lineCount) {
      const nextLineStart = this.newlineOffsets[nextLineAfterContext];
      let eolLength = 1;
      if (nextLineStart > 0 && this.text.charCodeAt(nextLineStart - 1) === 10) {
        if (nextLineStart > 1 && this.text.charCodeAt(nextLineStart - 2) === 13) {
          eolLength = 2;
        }
      }
      contextEnd = nextLineStart - eolLength;
    } else {
      contextEnd = this.textLength;
    }
    return { contextPos, contextEnd };
  }
  rangeAt(range) {
    return {
      start: this.positionAt(range.pos),
      end: this.positionAt(range.end)
    };
  }
  offsetRangeAt(range) {
    return {
      pos: this.offsetAt(range.start),
      end: this.offsetAt(range.end)
    };
  }
}
function isEOL(char) {
  return char === 13 || char === 10;
}
const RECOVER_FILE = [SyntaxKind.CData, SyntaxKind.Script, SyntaxKind.OpenNodeStart];
const RECOVER_OPEN_TAG = [
  SyntaxKind.OpenNodeStart,
  SyntaxKind.NodeEnd,
  SyntaxKind.NodeClose,
  SyntaxKind.CloseNodeStart,
  SyntaxKind.CData,
  SyntaxKind.Script
];
const RECOVER_ATTR = [SyntaxKind.Identifier, ...RECOVER_OPEN_TAG];
const RECOVER_CONTENT_LIST = [
  SyntaxKind.TextNode,
  SyntaxKind.StringLiteral,
  SyntaxKind.CData,
  SyntaxKind.Script,
  SyntaxKind.OpenNodeStart,
  SyntaxKind.CloseNodeStart
];
const RECOVER_CLOSE_TAG = [
  SyntaxKind.NodeEnd,
  SyntaxKind.OpenNodeStart,
  SyntaxKind.CloseNodeStart,
  SyntaxKind.CData,
  SyntaxKind.Script
];
function createXmlUiParser(source) {
  return {
    parse: () => parseXmlUiMarkup(source),
    getText: (n, ignoreTrivia = true) => source.substring(ignoreTrivia ? n.pos ?? n.start ?? 0 : n.start ?? n.pos ?? 0, n.end)
  };
}
function parseXmlUiMarkup(text) {
  const cursor = new DocumentCursor(text);
  const errors = [];
  const parents = [];
  let peekedToken;
  let node = { children: [] };
  let errFromScanner = void 0;
  const onScannerErr = function(message, length) {
    errFromScanner = {
      message,
      prefixLength: length
    };
  };
  const scanner = createScanner(false, text, onScannerErr);
  const fileContentListNode = parseFile();
  return { node: fileContentListNode, errors };
  function getText(n, ignoreTrivia = true) {
    return text.substring(ignoreTrivia ? n.pos : n.start, n.end);
  }
  function parseFile() {
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
          const errNode2 = errNodeUntil(RECOVER_FILE);
          errorAt(DIAGS_PARSER.unexpectedCloseTag, errNode2.pos, errNode2.end);
          break;
        }
        default:
          const errNode = errNodeUntil(RECOVER_FILE);
          errorAt(DIAGS_PARSER.expTagOpen, errNode.pos, errNode.end);
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
          errorAt(DIAGS_PARSER.expTagOpen, errNode.pos, errNode.end);
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
    let openTagName = null;
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
  function parseOpeningTagName() {
    startNode();
    const identNode = bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = completeNode(SyntaxKind.TagNameNode);
      const namespaceName = getText(identNode);
      errorAt(
        DIAGS_PARSER.expTagNameAfterNamespace(namespaceName),
        nameNodeWithColon.pos,
        nameNodeWithColon.end
      );
      errNodeUntil([SyntaxKind.Identifier, ...RECOVER_OPEN_TAG]);
      return { node: nameNodeWithColon, errInName: true };
    } else {
      return { node: completeNode(SyntaxKind.TagNameNode), errInName: false };
    }
  }
  function parseAttrList() {
    startNode();
    const attrNames = [];
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
    if (node.children.length === 0) {
      abandonNode();
    } else {
      completeNode(SyntaxKind.AttributeListNode);
    }
  }
  function parseAttr(attrNames) {
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
  function parseAttrName(attrNames) {
    let nameIdent = peek();
    let nsIdent = void 0;
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
          ...RECOVER_OPEN_TAG
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
  function parseClosingTag(openTagName, skipNameMatching) {
    if (eat(SyntaxKind.CloseNodeStart)) {
      if (at(SyntaxKind.Identifier)) {
        const closeTagName = parseClosingTagName();
        if (!skipNameMatching) {
          const namesMismatch = openTagName !== null && !tagNameNodesWithoutErrorsMatch(openTagName, closeTagName, getText);
          if (namesMismatch) {
            const msg = DIAGS_PARSER.tagNameMismatch(getText(openTagName), getText(closeTagName));
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
          openTagName.end
        );
      } else {
        error(DIAGS_PARSER.expCloseStart);
      }
    }
  }
  function parseClosingTagName() {
    startNode();
    const identNode = bump(SyntaxKind.Identifier);
    if (eat(SyntaxKind.Colon) && !eat(SyntaxKind.Identifier)) {
      const nameNodeWithColon = completeNode(SyntaxKind.TagNameNode);
      errorAt(
        DIAGS_PARSER.expTagNameAfterNamespace(getText(identNode)),
        nameNodeWithColon.pos,
        nameNodeWithColon.end
      );
      errNodeUntil(RECOVER_OPEN_TAG);
      return nameNodeWithColon;
    } else {
      return completeNode(SyntaxKind.TagNameNode);
    }
  }
  function checkAttrName(attrNames, { nameIdent, nsIdent }) {
    const attrName = getText(nameIdent);
    const attrNs = nsIdent && getText(nsIdent);
    const attrKeyMatches = ({ ns, name }) => name === attrName && ns === attrNs;
    const isDuplicate = attrNames.findIndex(attrKeyMatches) !== -1;
    const nameStartsWithUppercase = "A" <= attrName[0] && attrName[0] <= "Z";
    const faultyName = isDuplicate || nameStartsWithUppercase;
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
  function error({ code, message }) {
    const { pos, end } = peek();
    const { contextPos, contextEnd } = cursor.getSurroundingContext(pos, end, 1);
    errors.push({
      code,
      message,
      pos,
      end,
      contextPos,
      contextEnd
    });
  }
  function errorAt({ code, message }, pos, end) {
    const { contextPos, contextEnd } = cursor.getSurroundingContext(pos, end, 1);
    errors.push({
      code,
      message,
      pos,
      end,
      contextPos,
      contextEnd
    });
  }
  function errNodeUntil(tokens) {
    startNode();
    advance(tokens);
    if (node.children.length === 0) {
      abandonNode();
      return null;
    } else {
      return completeNode(SyntaxKind.ErrorNode);
    }
  }
  function advance(to) {
    for (let token = peek(); token.kind !== SyntaxKind.EndOfFileToken && !to.includes(token.kind); bumpAny(), token = peek()) {
    }
  }
  function eat(kind) {
    const kindMatched = at(kind);
    if (kindMatched) {
      bumpAny();
    }
    return kindMatched;
  }
  function at(kindToCheck) {
    return peek().kind === kindToCheck;
  }
  function peek(inContent = false) {
    if (peekedToken !== void 0) {
      return peekedToken;
    }
    peekedToken = collectToken(inContent);
    return peekedToken;
  }
  function peekInContent() {
    const token = peek(true);
    if (token.kind === SyntaxKind.EndOfFileToken || token.kind === SyntaxKind.OpenNodeStart || token.kind === SyntaxKind.Script || token.kind === SyntaxKind.CData || token.kind === SyntaxKind.CloseNodeStart) {
      return token;
    }
    const trivia = token.triviaBefore;
    const triviaLength = trivia?.length ?? 0;
    let i = 0;
    let leadingComments = [];
    let firstNonCommentTriviaIdx = -1;
    for (; i < triviaLength; ++i) {
      if (trivia[i].kind === SyntaxKind.CommentTrivia) {
        leadingComments.push(trivia[i]);
      } else {
        firstNonCommentTriviaIdx = i;
        break;
      }
    }
    let secondCommentGroupStartIdx = -1;
    for (; i < triviaLength; ++i) {
      if (trivia[i].kind === SyntaxKind.CommentTrivia) {
        secondCommentGroupStartIdx = i;
        break;
      }
    }
    let parseAsStringLiteral = false;
    if (token.kind === SyntaxKind.StringLiteral) {
      const beforeLookahead = token.end;
      const nextToken = collectToken(true);
      parseAsStringLiteral = nextToken.kind === SyntaxKind.CData || nextToken.kind === SyntaxKind.CloseNodeStart || nextToken.kind === SyntaxKind.Script || nextToken.kind === SyntaxKind.OpenNodeStart;
      scanner.resetTokenState(beforeLookahead);
    }
    let pos;
    if (parseAsStringLiteral) {
      pos = token.pos;
    } else if (leadingComments.length > 0) {
      pos = leadingComments[leadingComments.length - 1].end;
    } else if (firstNonCommentTriviaIdx !== -1) {
      pos = trivia[firstNonCommentTriviaIdx].pos;
    } else {
      pos = token.start;
    }
    let triviaBefore = void 0;
    if (leadingComments.length > 0) {
      triviaBefore = leadingComments;
    }
    let kind = SyntaxKind.TextNode;
    let end = -1;
    if (secondCommentGroupStartIdx !== -1) {
      end = trivia[secondCommentGroupStartIdx].pos;
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
  function bump(kind) {
    const token = bumpAny();
    if (token.kind !== kind) {
      throw new Error(
        `expected ${getSyntaxKindStrRepr(kind)}, bumped a ${getSyntaxKindStrRepr(token.kind)}`
      );
    }
    return token;
  }
  function bumpAny() {
    if (peekedToken) {
      node.children.push(peekedToken);
      const bumpedToken = peekedToken;
      peekedToken = void 0;
      return bumpedToken;
    }
    const token = collectToken(false);
    node.children.push(token);
    return token;
  }
  function startNode() {
    parents.push(node);
    node = {
      children: []
    };
  }
  function completeNode(type) {
    const completedNode = createNode(type, node.children);
    const parentNode = parents[parents.length - 1];
    parentNode.children.push(completedNode);
    node = parentNode;
    parents.pop();
    return completedNode;
  }
  function collectToken(inContent) {
    let kind;
    let triviaCollected = [];
    let start = null;
    while (true) {
      kind = scanner.scan();
      if (start === null) {
        start = scanner.getTokenStart();
      }
      if (errFromScanner !== void 0) {
        let err;
        if (errFromScanner.message.code === ErrCodesParser.invalidChar) {
          err = DIAGS_PARSER.invalidChar(scanner.getTokenText());
        } else {
          err = errFromScanner.message;
        }
        const pos = scanner.getTokenStart();
        const triviaBefore = triviaCollected.length > 0 ? triviaCollected : void 0;
        triviaCollected = [];
        if (inContent && err.code === ErrCodesParser.invalidChar) {
          errFromScanner = void 0;
          return new Node(kind, pos, scanner.getTokenEnd(), triviaBefore);
        }
        const badPrefixEnd = pos + errFromScanner.prefixLength;
        const token = new Node(kind, pos, badPrefixEnd, triviaBefore);
        scanner.resetTokenState(badPrefixEnd);
        startNode();
        node.children.push(token);
        const { contextPos, contextEnd } = cursor.getSurroundingContext(pos, badPrefixEnd, 0);
        errors.push({
          code: err.code,
          message: err.message,
          pos,
          end: badPrefixEnd,
          contextPos,
          contextEnd
        });
        completeNode(SyntaxKind.ErrorNode);
        errFromScanner = void 0;
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
            triviaCollected.length > 0 ? triviaCollected : void 0
          );
      }
    }
  }
  function abandonNode() {
    const parentNode = parents[parents.length - 1];
    parentNode.children.push(...node.children);
    node = parentNode;
    parents.pop();
  }
}
function createNode(kind, children) {
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  return new Node(kind, firstChild.pos, lastChild.end, void 0, children);
}
class XmluiSource {
  constructor(source, fileName = "source.xmlui") {
    this.source = source;
    this.fileName = fileName;
    const result = parseXmlUiMarkup(source);
    this.ast = result.node;
    this.errors = result.errors;
    this.cursor = new DocumentCursor(source);
  }
  /**
   * Get the source text for a node.
   */
  getText(node) {
    return this.source.slice(node.pos, node.end);
  }
  /**
   * Get the line number (1-indexed) for a position.
   */
  getLine(position) {
    return this.cursor.positionAt(position).line + 1;
  }
  /**
   * Find an element by its id attribute.
   */
  findById(id) {
    return this.findByAttribute("id", id);
  }
  /**
   * Find an element by any attribute value.
   */
  findByAttribute(attrName, attrValue) {
    const walk = (node) => {
      if (node.kind === SyntaxKind.ElementNode) {
        const tagName = this.getNodeTagName(node);
        const attrList = node.children?.find((c) => c.kind === SyntaxKind.AttributeListNode);
        for (const attr of attrList?.children || []) {
          if (attr.kind === SyntaxKind.AttributeNode) {
            const { key, value } = this.extractKeyValue(attr);
            if (key === attrName && value === attrValue) {
              return {
                node,
                tagName,
                attributes: this.getNodeAttributes(node),
                start: node.start,
                end: node.end,
                startLine: this.getLine(node.start),
                endLine: this.getLine(node.end),
                source: this.getText(node)
              };
            }
          }
        }
      }
      for (const child of node.children || []) {
        const found = walk(child);
        if (found) return found;
      }
      return null;
    };
    return walk(this.ast);
  }
  /**
   * Find all elements with a specific tag name.
   */
  findByTagName(tagName) {
    const results = [];
    const walk = (node) => {
      if (node.kind === SyntaxKind.ElementNode) {
        const nodeTagName = this.getNodeTagName(node);
        if (nodeTagName === tagName) {
          results.push({
            node,
            tagName: nodeTagName,
            attributes: this.getNodeAttributes(node),
            start: node.start,
            end: node.end,
            startLine: this.getLine(node.start),
            endLine: this.getLine(node.end),
            source: this.getText(node)
          });
        }
      }
      for (const child of node.children || []) {
        walk(child);
      }
    };
    walk(this.ast);
    return results;
  }
  /**
   * Find all handler attributes (on* attributes) in the document.
   */
  findHandlers(eventName) {
    const results = [];
    const pattern = eventName ? new RegExp(`^on${eventName}$`, "i") : /^on[A-Z]/;
    const walk = (node) => {
      if (node.kind === SyntaxKind.ElementNode) {
        const attrList = node.children?.find((c) => c.kind === SyntaxKind.AttributeListNode);
        for (const attr of attrList?.children || []) {
          if (attr.kind === SyntaxKind.AttributeNode && attr.children) {
            const { key, value } = this.extractKeyValue(attr);
            if (key && pattern.test(key)) {
              results.push({
                node: attr,
                key,
                value: value || "",
                start: attr.start,
                end: attr.end,
                line: this.getLine(attr.start)
              });
            }
          }
        }
      }
      for (const child of node.children || []) {
        walk(child);
      }
    };
    walk(this.ast);
    return results;
  }
  /**
   * Find a specific handler on a specific element.
   */
  findHandler(elementId, eventName) {
    const element = this.findById(elementId);
    if (!element) return null;
    const attrList = element.node.children?.find((c) => c.kind === SyntaxKind.AttributeListNode);
    const targetKey = `on${eventName}`;
    for (const attr of attrList?.children || []) {
      if (attr.kind === SyntaxKind.AttributeNode) {
        const { key, value } = this.extractKeyValue(attr);
        if (key && key.toLowerCase() === targetKey.toLowerCase()) {
          return {
            node: attr,
            key,
            value: value || "",
            start: attr.start,
            end: attr.end,
            line: this.getLine(attr.start)
          };
        }
      }
    }
    return null;
  }
  /**
   * Get all attributes from an element node.
   */
  getNodeAttributes(elementNode) {
    const attrs = {};
    const attrList = elementNode.children?.find((c) => c.kind === SyntaxKind.AttributeListNode);
    for (const attr of attrList?.children || []) {
      if (attr.kind === SyntaxKind.AttributeNode) {
        const { key, value } = this.extractKeyValue(attr);
        if (key) {
          attrs[key] = value || "";
        }
      }
    }
    return attrs;
  }
  /**
   * Get the tag name from an element node.
   */
  getNodeTagName(elementNode) {
    const tagNameNode = elementNode.children?.find((c) => c.kind === SyntaxKind.TagNameNode);
    if (tagNameNode) {
      return this.source.slice(tagNameNode.pos, tagNameNode.end);
    }
    return "";
  }
  /**
   * Get source with line numbers, optionally highlighting a range.
   */
  getSourceWithLineNumbers(highlightStart, highlightEnd) {
    const lines = this.source.split("\n");
    const highlightStartLine = highlightStart !== void 0 ? this.getLine(highlightStart) : -1;
    const highlightEndLine = highlightEnd !== void 0 ? this.getLine(highlightEnd) : -1;
    return lines.map((line, i) => {
      const lineNum = i + 1;
      const prefix = lineNum >= highlightStartLine && lineNum <= highlightEndLine ? "→ " : "  ";
      return `${prefix}${String(lineNum).padStart(4)}: ${line}`;
    }).join("\n");
  }
  /**
   * Extract key and value from an AttributeNode.
   * AttributeNode children are: [AttributeKeyNode, Equal, StringLiteral]
   */
  extractKeyValue(attrNode) {
    if (!attrNode.children) return { key: null, value: null };
    let key = null;
    let value = null;
    for (const child of attrNode.children) {
      if (child.kind === SyntaxKind.AttributeKeyNode) {
        key = this.source.slice(child.pos, child.end);
      } else if (child.kind === SyntaxKind.StringLiteral) {
        const rawVal = this.source.slice(child.pos, child.end);
        value = this.stripQuotes(rawVal);
      }
    }
    return { key, value };
  }
  /**
   * Strip surrounding quotes from a string value.
   */
  stripQuotes(value) {
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    if (value.startsWith("{") && value.endsWith("}")) {
      return value;
    }
    return value;
  }
}
export {
  AttributeKeyNode,
  AttributeListNode,
  AttributeNode,
  CharacterCodes,
  ContentListNode,
  DocumentCursor,
  ElementNode,
  Node,
  SyntaxKind,
  TagNameNode,
  XmluiSource,
  createXmlUiParser,
  findTokenAtOffset,
  getSyntaxKindStrRepr,
  parseXmlUiMarkup,
  tagNameNodesWithoutErrorsMatch
};
