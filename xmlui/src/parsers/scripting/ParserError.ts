// The common root class of all parser error objects
export class ParserError extends Error {
  constructor(message: string, public code?: string) {
    super(message);

    // --- Set the prototype explicitly.
    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

// Error message type description
type ErrorText = Record<string, string>;

// The error messages of error codes
export const errorMessages: ErrorText = {
  W001: "An expression expected",
  W002: "Unexpected token: {0}",
  W003: "An identifier expected",
  W004: "'}' expected",
  W005: "']' expected",
  W006: "')' expected",
  W007: "Invalid object property name type",
  W008: "':' expected",
  W009: "'=' expected",
  W010: "Invalid argument list",
  W011: "For loop variable must be initialized",
  W012: "'{' expected",
  W013: "'catch' or 'finally' expected",
  W014: "'(' or expected",
  W015: "'case' or 'default' expected",
  W016: "'default' case can be used only once within a switch statement",
  W017: "Invalid sequence expression",
  W018: "Invalid object literal",
  W019: "Identifier '{0}' is already imported",
  W020: "Function '{0}' is already defined in the module",
  W021: "'{0}' is already exported from the module",
  W022: "Cannot find module '{0}'",
  W023: "Module '{0}' does not export '{1}'",
  W024: "'function' or 'const' expected",
  W025: "'from' expected",
  W026: "A string literal expected",
  W027: "Variables can be declared only in the top level module",
  W028: "Invalid statement used in a module",
  W029: "An imported module can contain only exported functions",
  W030: "Nested declarations cannot be exported",
  W031: "An identifier in a declaration cannot start with '$'"
};
