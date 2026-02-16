import { ErrorCodes } from "../scripting/ParserError";

export interface GeneralDiag {
  readonly code: ErrCodesParser | ErrCodesTransform;
  readonly message: string;
  readonly pos: number;
  readonly end: number;
  readonly contextPos: number;
  readonly contextEnd: number;
}

export interface TransformDiagPositionless {
  code: ErrCodesTransform;
  message: string;
}

export interface ParserDiagPositionless {
  code: ErrCodesParser;
  message: string;
}

export class TransformDiag extends Error {
  public code: ErrCodesTransform;
  public message: string;
  public pos?: number;
  public end?: number;
  readonly contextPos?: number;
  readonly contextEnd?: number;

  constructor(
    diagPositionless: TransformDiagPositionless,
    pos?: number,
    end?: number,
    contextPos?: number,
    contextEnd?: number,
  ) {
    super(diagPositionless.message);
    this.code = diagPositionless.code;
    this.message = diagPositionless.message;
    this.pos = pos;
    this.end = end;
    this.contextPos = contextPos;
    this.contextEnd = contextEnd;
  }

  override toString(): string {
    return `${this.code}: ${this.message}`;
  }
}

export interface ParserDiag {
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
    code: ErrCodesParser.unexpectedCloseTag,
    message: "Read '</', but there's no opening tag to close.",
  },
  expCloseStartWithName: function (openTagName: string) {
    return {
      code: ErrCodesParser.expCloseStartWithName,
      message: `Opened tag has no closing pair. Expected to see '</${openTagName}>'.`,
    };
  },
  expCloseStart: {
    code: ErrCodesParser.expCloseStart,
    message: "A '</' token expected.",
  },
  uppercaseAttr: function (attrName: string) {
    return {
      code: ErrCodesParser.uppercaseAttr,
      message: `Attribute name '${attrName}' cannot start with an uppercase letter.`,
    };
  },
  duplAttr: function (attrName: string) {
    return {
      code: ErrCodesParser.duplAttr,
      message: `Duplicated attribute: '${attrName}'.`,
    };
  },
  tagNameMismatch: function (openTagName: string, closeTagName: string) {
    return {
      code: ErrCodesParser.tagNameMismatch,
      message: `Opening and closing tag names should match. Opening tag has a name '${openTagName}', but the closing tag name is '${closeTagName}'.`,
    };
  },
  invalidChar: function (char: string) {
    return {
      code: ErrCodesParser.invalidChar,
      message: `Invalid character '${char}'.`,
    };
  },
  expEnd: {
    code: ErrCodesParser.expEnd,
    message: "A '>' token expected.",
  },
  expTagName: {
    code: ErrCodesParser.expTagName,
    message: "A tag name expected.",
  },
  expAttrStr: {
    code: ErrCodesParser.expAttrValue,
    message: `A string expected as an attribute value after '='.`,
  },
  expEq: {
    code: ErrCodesParser.expEq,
    message: "An '=' token expected.",
  },
  expTagOpen: {
    code: ErrCodesParser.expTagOpen,
    message: "A '<' token expected.",
  },
  expEndOrClose: {
    code: ErrCodesParser.expEndOrClose,
    message: `A '>' or '/>' token expected.`,
  },
  expAttrName: {
    code: ErrCodesParser.expAttrName,
    message: `An attribute name expected.`,
  },
  expAttrNameAfterNamespace: function (namespaceName: string) {
    return {
      code: ErrCodesParser.expAttrNameAfterNamespace,
      message: `An attribute name expected after namespace '${namespaceName}'.`,
    };
  },
  expTagNameAfterNamespace: function (namespaceName: string) {
    return {
      code: ErrCodesParser.expTagNameAfterNamespace,
      message: `A tag name expected after namespace '${namespaceName}'.`,
    };
  },
  expTagNameAfterCloseStart: {
    code: ErrCodesParser.expTagNameAfterCloseStart,
    message: "Expected tag name after '</'.",
  },
  expAttrNameBeforeEq: {
    code: ErrCodesParser.expAttrNameBeforeEq,
    message: "Expected attribute name before '='.",
  },
} as const;

export const ErrCodesTransform = {
  singleRootElem: "T001",
  compDefNameUppercase: "T002",
  compDefNameExp: "T003",
  multipleScriptTags: "T004",
  compDefNesedElem: "T005",
  nestedCompDefs: "T006",
  invalidAttrName: "T007",
  eventNoOnPrefix: "T008",
  invalidNodeName: "T009",
  noTextChild: "T010",
  onlyNameValueAttrs: "T011",
  nameAttrRequired: "T012",
  loaderIdRequired: "T013",
  loaderCantHave: "T014",
  usesValueOnly: "T015",
  onlyFieldOrItemChild: "T016",
  cannotMixFieldItem: "T017",
  cantHaveNameAttr: "T018",
  valueAttrRequired: "T019",
  cannotMixCompNonComp: "T020",
  invalidReusableCompAttr: "T021",
  scriptNoAttrs: "T022",
  cantPutReusableDefInSlot: "T024",
  duplXmlns: "T025",
  rootCompNoNamespace: "T026",
  nsNotFound: "T027",
  nsValueIncorrect: "T028",
  nsSchemeIncorrect: "T029",
  scriptParse: "T030",
  globalNotAllowedInNested: "T031",
  globalNotAllowedInComponent: "T032",
  ...ErrorCodes,
} as const;

export type ErrCodesTransform = (typeof ErrCodesTransform)[keyof typeof ErrCodesTransform];

export const DIAGS_TRANSFORM = {
  singleRootElem: {
    code: ErrCodesTransform.singleRootElem,
    message: "A component definition must have exactly one XMLUI element.",
  },
  compDefNameUppercase: {
    code: ErrCodesTransform.compDefNameUppercase,
    message: "A component definition's name must start with an uppercase letter.",
  },
  compDefNameExp: {
    code: ErrCodesTransform.compDefNameExp,
    message: "A reusable component must have a non-empty name.",
  },
  multipleScriptTags: {
    code: ErrCodesTransform.multipleScriptTags,
    message: "Cannot have multiple <script> tags in the same tag.",
  },
  compDefNesedElem: {
    code: ErrCodesTransform.compDefNesedElem,
    message: "A reusable component must have at least one nested component definition.",
  },
  nestedCompDefs: {
    code: ErrCodesTransform.nestedCompDefs,
    message: "A reusable component definition cannot nest another one.",
  },
  invalidAttrName: function (attrName: string) {
    return {
      code: ErrCodesTransform.invalidAttrName,
      message: `Invalid attribute name: '${attrName}'.`,
    };
  },
  eventNoOnPrefix: function (attrName: string) {
    return {
      code: ErrCodesTransform.eventNoOnPrefix,
      message: `Event attribute names should not start with 'on' prefix: '${attrName}'.`,
    };
  },
  invalidNodeName: function (nodeName: string) {
    return {
      code: ErrCodesTransform.invalidNodeName,
      message: `Invalid node name '${nodeName}' in a component definition.`,
    };
  },
  noTextChild: function (elementName: string) {
    return {
      code: ErrCodesTransform.noTextChild,
      message: `The '${elementName}' element does not accept a text child.`,
    };
  },
  onlyNameValueAttrs: function (elementName: string) {
    return {
      code: ErrCodesTransform.onlyNameValueAttrs,
      message: `Only 'name', 'value', and type hint attributes are accepted in '${elementName}'.`,
    };
  },
  nameAttrRequired: function (elementName: string) {
    return {
      code: ErrCodesTransform.nameAttrRequired,
      message: `The 'name' attribute in '${elementName}' is required.`,
    };
  },
  loaderIdRequired: {
    code: ErrCodesTransform.loaderIdRequired,
    message: "A loader element must have an id.",
  },
  loaderCantHave: function (attrName: string) {
    return {
      code: ErrCodesTransform.loaderCantHave,
      message: `A loader element must not have '${attrName}'.`,
    };
  },
  usesValueOnly: {
    code: ErrCodesTransform.usesValueOnly,
    message: "The uses element must define only a non-empty 'value' attribute.",
  },
  onlyFieldOrItemChild: {
    code: ErrCodesTransform.onlyFieldOrItemChild,
    message: "Only 'field' or 'item' are accepted as a child element.",
  },
  cannotMixFieldItem: {
    code: ErrCodesTransform.cannotMixFieldItem,
    message: "Cannot mix 'field' and 'item' nodes within an element.",
  },
  globalNotAllowedInNested: {
    code: ErrCodesTransform.globalNotAllowedInNested,
    message: "Global variables can only be declared in the root element of Main.xmlui, not in nested components.",
  },
  globalNotAllowedInComponent: {
    code: ErrCodesTransform.globalNotAllowedInComponent,
    message: "Global variables cannot be declared in component definitions. Use Globals.xs or declare them in Main.xmlui instead.",
  },
  cantHaveNameAttr: function (nodeName: string) {
    return {
      code: ErrCodesTransform.cantHaveNameAttr,
      message: `The '${nodeName}' node cannot have a 'name' attribute.`,
    };
  },
  valueAttrRequired: function (elementName: string) {
    return {
      code: ErrCodesTransform.valueAttrRequired,
      message: `The 'value' attribute in '${elementName}' is required.`,
    };
  },
  cannotMixCompNonComp: {
    code: ErrCodesTransform.cannotMixCompNonComp,
    message: "Cannot mix nested components and non-component children.",
  },
  invalidReusableCompAttr: function (attrName: string) {
    return {
      code: ErrCodesTransform.invalidReusableCompAttr,
      message: `Invalid reusable component attribute '${attrName}'.`,
    };
  },
  scriptNoAttrs: {
    code: ErrCodesTransform.scriptNoAttrs,
    message: "The 'script' tag must not have any attribute.",
  },
  cantPutReusableDefInSlot: {
    code: ErrCodesTransform.cantPutReusableDefInSlot,
    message: "Cannot put a reusable component definitions into a slot.",
  },
  duplXmlns: function (namespace: string) {
    return {
      code: ErrCodesTransform.duplXmlns,
      message: `Duplicate xmlns found: '${namespace}'.`,
    };
  },
  rootCompNoNamespace: {
    code: ErrCodesTransform.rootCompNoNamespace,
    message: "The top level component's name cannot have a namespace.",
  },
  nsNotFound: function (namespace: string) {
    return {
      code: ErrCodesTransform.nsNotFound,
      message: `Cannot resolve namespace '${namespace}'. It was not defined in any of the ancestor components.`,
    };
  },
  nsValueIncorrect: function (namespace: string, details: string) {
    return {
      code: ErrCodesTransform.nsValueIncorrect,
      message: `Incorrect namespace value '${namespace}'. ${details}`,
    };
  },
  nsSchemeIncorrect: function (namespace: string, defaultScheme: string) {
    return {
      code: ErrCodesTransform.nsSchemeIncorrect,
      message: `Incorrect scheme specified before ':' (colon) in namespace ${namespace}. Delete it to get the default '${defaultScheme}'.`,
    };
  },
} as const;

export const Diag_Invalid_Character = {
  code: ErrCodesParser.invalidChar,
  message: "Invalid character.",
} as const;

export const Diag_Unterminated_String_Literal = {
  code: ErrCodesParser.untermStr,
  message: "Unterminated string literal.",
} as const;

export const Diag_Unterminated_Comment = {
  code: ErrCodesParser.untermComment,
  message: "Unterminated comment",
} as const;

export const Diag_Unterminated_CData = {
  code: ErrCodesParser.untermCData,
  message: "Unterminated CDATA section",
} as const;

export const Diag_Unterminated_Script = {
  code: ErrCodesParser.untermScript,
  message: "Unterminated script section",
} as const;

export type ScannerDiagnosticMessage =
  | typeof Diag_Invalid_Character
  | typeof Diag_Unterminated_String_Literal
  | typeof Diag_Unterminated_Comment
  | typeof Diag_Unterminated_CData
  | typeof Diag_Unterminated_Script;
