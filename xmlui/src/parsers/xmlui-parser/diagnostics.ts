export interface TransformDiagPositionless {
  code: ErrCodesTransform;
  category: DiagnosticCategory;
  message: string;
}

export interface ParserDiagPositionless {
  code: ErrCodesParser;
  category: DiagnosticCategory;
  message: string;
}

export interface ParserDiag {
  readonly category: DiagnosticCategory;
  readonly code: ErrCodesParser;
  readonly message: string;
  readonly pos: number;
  readonly end: number;
  readonly contextPos: number;
  readonly contextEnd: number;
}

export enum DiagnosticCategory {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

export enum ErrCodesParser {
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
export const DIAGS_PARSER = {
  unexpectedCloseTag: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.unexpectedCloseTag,
    message: "Read '</', but there's no opening tag to close.",
  },
  expCloseStartWithName: function (openTagName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.expCloseStartWithName,
      message: `Opened tag has no closing pair. Expected to see '</${openTagName}>'.`,
    };
  },
  expCloseStart: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expCloseStart,
    message: "A '</' token expected.",
  },
  uppercaseAttr: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.uppercaseAttr,
      message: `Attribute name '${attrName}' cannot start with an uppercase letter.`,
    };
  },
  duplAttr: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.duplAttr,
      message: `Duplicated attribute: '${attrName}'.`,
    };
  },
  tagNameMismatch: function (openTagName: string, closeTagName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.tagNameMismatch,
      message: `Opening and closing tag names should match. Opening tag has a name '${openTagName}', but the closing tag name is '${closeTagName}'.`,
    };
  },
  invalidChar: function (char: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.invalidChar,
      message: `Invalid character '${char}'.`,
    };
  },
  expEnd: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expEnd,
    message: "A '>' token expected.",
  },
  expTagName: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expTagName,
    message: "A tag name expected.",
  },
  expAttrStr: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expAttrValue,
    message: `A string expected as an attribute value after '='.`,
  },
  expEq: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expEq,
    message: "An '=' token expected.",
  },
  expTagOpen: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expTagOpen,
    message: "A '<' token expected.",
  },
  expEndOrClose: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expEndOrClose,
    message: `A '>' or '/>' token expected.`,
  },
  expAttrName: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expAttrName,
    message: `An attribute name expected.`,
  },
  expAttrNameAfterNamespace: function (namespaceName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.expAttrNameAfterNamespace,
      message: `An attribute name expected after namespace '${namespaceName}'.`,
    };
  },
  expTagNameAfterNamespace: function (namespaceName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesParser.expTagNameAfterNamespace,
      message: `A tag name expected after namespace '${namespaceName}'.`,
    };
  },
  expTagNameAfterCloseStart: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expTagNameAfterCloseStart,
    message: "Expected tag name after '</'.",
  },
  expAttrNameBeforeEq: {
    category: DiagnosticCategory.Error,
    code: ErrCodesParser.expAttrNameBeforeEq,
    message: "Expected attribute name before '='.",
  },
} as const;

export enum ErrCodesTransform {
  singleRootElem = "T001",
  compDefNameUppercase = "T002",
  compDefNameExp = "T003",
  compDefNesedElem = "T005",
  nestedCompDefs = "T006",
  invalidAttrName = "T007",
  eventNoOnPrefix = "T008",
  invalidNodeName = "T009",
  noTextChild = "T010",
  onlyNameValueAttrs = "T011",
  nameAttrRequired = "T012",
  loaderIdRequired = "T013",
  loaderCantHave = "T014",
  usesValueOnly = "T015",
  onlyFieldOrItemChild = "T016",
  cannotMixFieldItem = "T017",
  cantHaveNameAttr = "T018",
  valueAttrRequired = "T019",
  cannotMixCompNonComp = "T020",
  invalidReusableCompAttr = "T021",
  scriptNoAttrs = "T022",
  cantPutReusableDefInSlot = "T024",
  duplXmlns = "T025",
  rootCompNoNamespace = "T026",
  nsNotFound = "T027",
  nsValueIncorrect = "T028",
  nsSchemeIncorrect = "T029",
  scriptParse = "T030",
}

export const DIAGS_TRANSFORM = {
  singleRootElem: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.singleRootElem,
    message: "A component definition must have exactly one XMLUI element.",
  },
  compDefNameUppercase: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.compDefNameUppercase,
    message: "A component definition's name must start with an uppercase letter.",
  },
  compDefNameExp: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.compDefNameExp,
    message: "A reusable component must have a non-empty name.",
  },
  compDefNesedElem: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.compDefNesedElem,
    message: "A reusable component must have at least one nested component definition.",
  },
  nestedCompDefs: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.nestedCompDefs,
    message: "A reusable component definition cannot nest another one.",
  },
  invalidAttrName: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.invalidAttrName,
      message: `Invalid attribute name: '${attrName}'.`,
    };
  },
  eventNoOnPrefix: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.eventNoOnPrefix,
      message: `Event attribute names should not start with 'on' prefix: '${attrName}'.`,
    };
  },
  invalidNodeName: function (nodeName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.invalidNodeName,
      message: `Invalid node name '${nodeName}' in a component definition.`,
    };
  },
  noTextChild: function (elementName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.noTextChild,
      message: `The '${elementName}' element does not accept a text child.`,
    };
  },
  onlyNameValueAttrs: function (elementName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.onlyNameValueAttrs,
      message: `Only 'name', 'value', and type hint attributes are accepted in '${elementName}'.`,
    };
  },
  nameAttrRequired: function (elementName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.nameAttrRequired,
      message: `The 'name' attribute in '${elementName}' is required.`,
    };
  },
  loaderIdRequired: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.loaderIdRequired,
    message: "A loader element must have an id.",
  },
  loaderCantHave: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.loaderCantHave,
      message: `A loader element must not have '${attrName}'.`,
    };
  },
  usesValueOnly: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.usesValueOnly,
    message: "The uses element must define only a non-empty 'value' attribute.",
  },
  onlyFieldOrItemChild: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.onlyFieldOrItemChild,
    message: "Only 'field' or 'item' are accepted as a child element.",
  },
  cannotMixFieldItem: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.cannotMixFieldItem,
    message: "Cannot mix 'field' and 'item' nodes within an element.",
  },
  cantHaveNameAttr: function (nodeName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.cantHaveNameAttr,
      message: `The '${nodeName}' node cannot have a 'name' attribute.`,
    };
  },
  valueAttrRequired: function (elementName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.valueAttrRequired,
      message: `The 'value' attribute in '${elementName}' is required.`,
    };
  },
  cannotMixCompNonComp: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.cannotMixCompNonComp,
    message: "Cannot mix nested components and non-component children.",
  },
  invalidReusableCompAttr: function (attrName: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.invalidReusableCompAttr,
      message: `Invalid reusable component attribute '${attrName}'.`,
    };
  },
  scriptNoAttrs: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.scriptNoAttrs,
    message: "The 'script' tag must not have any attribute.",
  },
  cantPutReusableDefInSlot: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.cantPutReusableDefInSlot,
    message: "Cannot put a reusable component definitions into a slot.",
  },
  duplXmlns: function (namespace: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.duplXmlns,
      message: `Duplicate xmlns found: '${namespace}'.`,
    };
  },
  rootCompNoNamespace: {
    category: DiagnosticCategory.Error,
    code: ErrCodesTransform.rootCompNoNamespace,
    message: "The top level component's name cannot have a namespace.",
  },
  nsNotFound: function (namespace: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.nsNotFound,
      message: `Cannot resolve namespace '${namespace}'. It was not defined in any of the ancestor components.`,
    };
  },
  nsValueIncorrect: function (namespace: string, details: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.nsValueIncorrect,
      message: `Incorrect namespace value '${namespace}'. ${details}`,
    };
  },
  nsSchemeIncorrect: function (namespace: string, defaultScheme: string) {
    return {
      category: DiagnosticCategory.Error,
      code: ErrCodesTransform.nsSchemeIncorrect,
      message: `Incorrect scheme specified before ':' (colon) in namespace ${namespace}. Delete it to get the default '${defaultScheme}'.`,
    };
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
  code: ErrCodesParser.invalidChar,
  category: DiagnosticCategory.Error,
  message: "Invalid character.",
} as const;

export const Diag_Unterminated_String_Literal = {
  code: ErrCodesParser.untermStr,
  category: DiagnosticCategory.Error,
  message: "Unterminated string literal.",
} as const;

export const Diag_Unterminated_Comment = {
  code: ErrCodesParser.untermComment,
  category: DiagnosticCategory.Error,
  message: "Unterminated comment",
} as const;

export const Diag_Unterminated_CData = {
  code: ErrCodesParser.untermCData,
  category: DiagnosticCategory.Error,
  message: "Unterminated CDATA section",
} as const;

export const Diag_Unterminated_Script = {
  code: ErrCodesParser.untermScript,
  category: DiagnosticCategory.Error,
  message: "Unterminated script section",
} as const;

export type ScannerDiagnosticMessage =
  | typeof Diag_Invalid_Character
  | typeof Diag_Unterminated_String_Literal
  | typeof Diag_Unterminated_Comment
  | typeof Diag_Unterminated_CData
  | typeof Diag_Unterminated_Script;
