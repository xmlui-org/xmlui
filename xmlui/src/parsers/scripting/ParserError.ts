// The common root class of all parser error objects
export class ParserError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);

    // --- Set the prototype explicitly.
    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

// Describes the structure of error messages
export interface ParserErrorMessage {
  code: ErrorCodes;
  text: string;
  position: number;
  end: number;
  line: number;
  column: number;
}

export const ErrorCodes = {
  expressionExpected: "W001",
  unexpectedToken: "W002",
  identifierExpected: "W003",
  closeBraceExpected: "W004",
  closeBracketExpected: "W005",
  closeParenExpected: "W006",
  invalidPropName: "W007",
  colonExpected: "W008",
  equalExpected: "W009",
  invalidArgList: "W010",
  forLoopVarRequired: "W011",
  openBraceExpected: "W012",
  catchOrFinallyExpected: "W013",
  openParenExpected: "W014",
  caseOrDefaultExpected: "W015",
  defaultCaseOnce: "W016",
  invalidSequence: "W017",
  invalidObjLiteral: "W018",
  alreadyImported: "W019",
  funcAlreadyDefined: "W020",
  alreadyExported: "W021",
  moduleNotFound: "W022",
  exportNotFound: "W023",
  functionExpected: "W024",
  fromExpected: "W025",
  stringLiteralExpected: "W026",
  varInImportedModule: "W027",
  invalidModuleStatement: "W028",
  moduleOnlyExports: "W029",
  nestedExport: "W030",
  dollarIdentifier: "W031",
  openBraceImportExpected: "W032",
  identifierInImportExpected: "W033",
  identifierAfterAsExpected: "W034",
  commaOrCloseBraceExpected: "W035",
  importFromExpected: "W036",
  importPathExpected: "W037",
  importNotAtTop: "W040",
  importedFunctionNotFound: "W039",
  circularImport: "W041",
  circularImportDetailed: "W042",
  reactiveVarInImportedModule: "W043",
  constLetInImportedModule: "W044",
  invalidStatementInImportedModule: "W045",
} as const;

export type ErrorCodes = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// Error message type description
type ErrorText = Record<string, string>;

// The error messages of error codes
export const errorMessages: ErrorText = {
  [ErrorCodes.expressionExpected]: "An expression expected",
  [ErrorCodes.unexpectedToken]: "Unexpected token: {0}",
  [ErrorCodes.identifierExpected]: "An identifier expected",
  [ErrorCodes.closeBraceExpected]: "'}' expected",
  [ErrorCodes.closeBracketExpected]: "']' expected",
  [ErrorCodes.closeParenExpected]: "')' expected",
  [ErrorCodes.invalidPropName]: "Invalid object property name type",
  [ErrorCodes.colonExpected]: "':' expected",
  [ErrorCodes.equalExpected]: "'=' expected",
  [ErrorCodes.invalidArgList]: "Invalid argument list",
  [ErrorCodes.forLoopVarRequired]: "For loop variable must be initialized",
  [ErrorCodes.openBraceExpected]: "'{' expected",
  [ErrorCodes.catchOrFinallyExpected]: "'catch' or 'finally' expected",
  [ErrorCodes.openParenExpected]: "'(' or expected",
  [ErrorCodes.caseOrDefaultExpected]: "'case' or 'default' expected",
  [ErrorCodes.defaultCaseOnce]: "'default' case can be used only once within a switch statement",
  [ErrorCodes.invalidSequence]: "Invalid sequence expression",
  [ErrorCodes.invalidObjLiteral]: "Invalid object literal",
  [ErrorCodes.alreadyImported]: "Identifier '{0}' is already imported",
  [ErrorCodes.funcAlreadyDefined]: "Function '{0}' is already defined in the module",
  [ErrorCodes.alreadyExported]: "'{0}' is already exported from the module",
  [ErrorCodes.moduleNotFound]: "Cannot find module '{0}'",
  [ErrorCodes.exportNotFound]: "Module '{0}' does not export '{1}'",
  [ErrorCodes.functionExpected]: "'function' expected",
  [ErrorCodes.fromExpected]: "'from' expected",
  [ErrorCodes.stringLiteralExpected]: "A string literal expected",
  [ErrorCodes.varInImportedModule]: "Cannot declare var ('{0}') in an imported module",
  [ErrorCodes.invalidModuleStatement]: "Invalid statement used in a module.",
  [ErrorCodes.moduleOnlyExports]: "An imported module can contain only exported functions",
  [ErrorCodes.nestedExport]: "Nested declarations cannot be exported",
  [ErrorCodes.dollarIdentifier]: "An identifier in a declaration cannot start with '$'",
  [ErrorCodes.openBraceImportExpected]: "'{' expected in import statement",
  [ErrorCodes.identifierInImportExpected]: "Identifier expected in import specifier",
  [ErrorCodes.identifierAfterAsExpected]: "Identifier expected after 'as'",
  [ErrorCodes.commaOrCloseBraceExpected]: "',' or '}' expected in import statement",
  [ErrorCodes.importFromExpected]: "'from' expected in import statement",
  [ErrorCodes.importPathExpected]: "String literal expected for import path",
  [ErrorCodes.importNotAtTop]:
    "Import statements must appear at the top of the file, before any other statements",
  [ErrorCodes.importedFunctionNotFound]: "Module '{0}' does not export '{1}'",
  [ErrorCodes.circularImport]: "Circular import detected: {0}",
  [ErrorCodes.circularImportDetailed]: "Circular import chain: {0}",
  [ErrorCodes.reactiveVarInImportedModule]:
    "Reactive variable declarations are not allowed in imported modules. Found: '{0}'",
  [ErrorCodes.constLetInImportedModule]:
    "const/let variable declarations are not allowed in imported modules. Found: '{0}'",
  [ErrorCodes.invalidStatementInImportedModule]:
    "Only function declarations are allowed in imported modules. Found: {0}",
};
