export interface GeneralDiagnosticMessage {
  code: ErrCodes;
  category: DiagnosticCategory;
  message: string;
}

export enum DiagnosticCategory {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

export enum ErrCodes {
  onlyOneElem = "U002",
  expTagOpen = "U003",
  expTagName = "U004",
  expCloseStart = "U005",
  expEndOrClose = "U006",
  tagNameMismatch = "U007",
  expEnd = "U008",
  expAttrName = "U009",
  expEq = "U010",
  expAttrValue = "U011",
  duplAttr = "U012",
  uppercaseAttr = "U013",
  expTagNameAfterNamespace = "U014",
  expCloseStartWithName = "U015",
  expAttrNameAfterNamespace = "U016",
  unexpectedCloseTag = "U017",
  expTagNameAfterCloseStart = "U019",
  expAttrNameBeforeEq = "U020",
  invalidChar = "W001",
  untermStr = "W002",
  untermComment = "W007",
  untermCData = "W008",
  untermScript = "W009",
}

export const DIAGS = {
  unexpectedCloseTag: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.unexpectedCloseTag,
    message: "Read '</', but there's no opening tag to close.",
  },
  expCloseStartWithName: function (openTagName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.expCloseStartWithName,
      message: `Opened tag has no closing pair. Expected to see '</${openTagName}>'.`,
    };
  },
  expCloseStart: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expCloseStart,
    message: "A '</' token expected.",
  },
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
  expEnd: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expEnd,
    message: "A '>' token expected.",
  },
  expTagName: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expTagName,
    message: "A tag name expected.",
  },
  expAttrStr: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expAttrValue,
    message: `A string expected as an attribute value after '='.`,
  },
  expEq: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expEq,
    message: "An '=' token expected.",
  },
  expTagOpen: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expTagOpen,
    message: "A '<' token expected.",
  },
  expEndOrClose: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expEndOrClose,
    message: `A '>' or '/>' token expected.`,
  },
  expAttrName: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expAttrName,
    message: `An attribute name expected.`,
  },
  expAttrNameAfterNamespace: function (namespaceName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.expAttrNameAfterNamespace,
      message: `An attribute name expected after namespace '${namespaceName}'.`,
    };
  },
  expTagNameAfterNamespace: function (namespaceName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodes.expTagNameAfterNamespace,
      message: `A tag name expected after namespace '${namespaceName}'.`,
    };
  },
  expTagNameAfterCloseStart: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expTagNameAfterCloseStart,
    message: "Expected tag name after '</'.",
  },
  expAttrNameBeforeEq: {
    category: DiagnosticCategory.Error,
    code: ErrCodes.expAttrNameBeforeEq,
    message: "Expected attribute name before '='.",
  },
} as const;

export function diagnosticCategoryName(
  d: { category: DiagnosticCategory },
  lowerCase = true,
): string {
  const name = DiagnosticCategory[d.category];
  return lowerCase ? name.toLowerCase() : name;
}

export const Diag_Invalid_Character = {
  code: ErrCodes.invalidChar,
  category: DiagnosticCategory.Error,
  message: "Invalid character.",
} as const;

export const Diag_Unterminated_String_Literal = {
  code: ErrCodes.untermStr,
  category: DiagnosticCategory.Error,
  message: "Unterminated string literal.",
} as const;

export const Diag_Unterminated_Comment = {
  code: ErrCodes.untermComment,
  category: DiagnosticCategory.Error,
  message: "Unterminated comment",
} as const;

export const Diag_Unterminated_CData = {
  code: ErrCodes.untermCData,
  category: DiagnosticCategory.Error,
  message: "Unterminated CDATA section",
} as const;

export const Diag_Unterminated_Script = {
  code: ErrCodes.untermScript,
  category: DiagnosticCategory.Error,
  message: "Unterminated script section",
} as const;

export type ScannerDiagnosticMessage =
  | typeof Diag_Invalid_Character
  | typeof Diag_Unterminated_String_Literal
  | typeof Diag_Unterminated_Comment
  | typeof Diag_Unterminated_CData
  | typeof Diag_Unterminated_Script;
