// The common root class of all parser error objects
export class StyleParserError extends Error {
  constructor (message: string, public code?: string) {
    super(message);

    // --- Set the prototype explicitly.
    Object.setPrototypeOf(this, StyleParserError.prototype);
  }
}

export type StyleErrorCodes =
  | "S001"
  | "S002"
  | "S003"
  | "S004"
  | "S005"
  | "S006"
  | "S007"
  | "S008"
  | "S009"
  | "S010"
  | "S011"
  | "S012"
  | "S013"
  | "S014"
  | "S015"
  | "S016"
  | "S017"
  | "S018"
  | "S019"
  | "S020"
  | "S021";

// Error message type description
type ErrorText = Record<string, string>;

// The error messages of error codes
export const styleErrorMessages: ErrorText = {
  S001: "A numeric value expected",
  S002: "A dimension unit expected",
  S003: "An alignment value expected",
  S004: "A border style value expected",
  S005: "A color value or expression expected",
  S006: "Unknown color function name '{0}'",
  S007: "'(' expected, but '{0}' received",
  S008: "A color channel percentage value expected between 0 and 100",
  S009: "A color channel value expected between 0 and 255",
  S010: "')' expected, but '{0}' received",
  S011: "An alpha channel value expected between 0.0 and 1.0",
  S012: "A scrolling value expected",
  S013: "A direction value expected",
  S014: "A fontFamily value expected",
  S015: "A fontWeight value expected",
  S016: "Unexpected token found",
  S017: "A Boolean value expected",
  S018: "An orientation value expected",
  S019: "']' expected",
  S020: "A user-select value expected",
  S021: "A text transform value expected",
};
