// The common root class of all parser error objects
export class ParserError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(`${code ? `${code}: ` : ""}${message}`);

    // --- Set the prototype explicitly.
    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

// Describes the structure of error messages
export interface ParserErrorMessage {
  code: ErrorCodes;
  text: string;
  position: number;
  line: number;
  column: number;
}

export type ErrorCodes =
  | "U001"
  | "U002"
  | "U003"
  | "U004"
  | "U005"
  | "U006"
  | "U007"
  | "U008"
  | "U009"
  | "U010"
  | "U011"
  | "U012"
  | "U013"
  | "U014"
  | "U015"
  | "T001"
  | "T002"
  | "T003"
  | "T004"
  | "T005"
  | "T006"
  | "T007"
  | "T008"
  | "T009"
  | "T010"
  | "T011"
  | "T012"
  | "T013"
  | "T014"
  | "T015"
  | "T016"
  | "T017"
  | "T018"
  | "T019"
  | "T020"
  | "T021"
  | "T022"
  | "T023"
  | "T024"
  | "T025"
  | "T026"
  | "T027"
  | "T028"
  | "T029";

// Error message type description
type ErrorText = Record<ErrorCodes, string>;

// The error messages of error codes
export const errorMessages: ErrorText = {
  U001: "Unexpected token: {0}.",
  U002: "A component definition can have exactly one XMLUI element.",
  U003: "A '<' token expected.",
  U004: "A node identifier expected.",
  U005: "A '</' token expected.",
  U006: "A '>' or '/>' token expected.",
  U007: "An '{0}' ID expected in the closing tag but '{1}' received.",
  U008: "A '>' token expected.",
  U009: "An attribute identifier expected.",
  U010: "An '=' token expected.",
  U011: "An attribute value expected.",
  U012: "Duplicated attribute: '{0}'.",
  U013: "Attribute name cannot start with an uppercase letter.",
  U014: "An '{0}' ID expected in the closing tag's namespace but '{1}' received.",
  U015: "Unexpected token in text element: {0}.",

  T001: "A component definition must have exactly one XMLUI element.",
  T002: "A component definition's name must start with an uppercase letter.",
  T003: "A reusable component must have a non-empty name.",
  T004: "A reusable component's name must start with an uppercase letter.",
  T005: "A reusable component must have at least one nested component definition.",
  T006: "A reusable component definition cannot nest another one.",
  T007: `Invalid attribute name: '{0}'`,
  T008: `Event attribute names should not start with 'on' prefix: '{0}'`,
  T009: `Invalid node name '{0}' in a component definition`,
  T010: `The '{0}' element does not accept a text child`,
  T011: "Only 'name', 'value', and type hint attributes are accepted in '{0}'.",
  T012: "The 'name' attribute in '{0}' is required.",
  T013: "A loader element must have an id.",
  T014: "A loader element must not have '{0}'.",
  T015: "The uses element must define only a non-empty 'value' attribute.",
  T016: "Only 'field' or 'item' are accepted as a child element.",
  T017: "Cannot mix 'field' and 'item' nodes within an element.",
  T018: "The '{0}' node cannot have a 'name' attribute.",
  T019: "The 'value' attribute in '{0}' is required.",
  T020: "Cannot mix nested components and non-component children.",
  T021: "Invalid reusable component attribute '{0}'.",
  T022: "The 'script' tag must not have any attribute.",
  T023: "A 'script' tag cannot nest other child nodes, only text.",
  T024: "Cannot put a reusable component definitions into a slot.",
  T025: "Duplicate xmlns found: '{0}'.",
  T026: "The top level component's name cannot have a namespace.",
  T027: "Cannot resolve namespace '{0}'. It was not defined in any of the ancestor components.",
  T028: "Incorrect namespace value '{0}'. {1}",
  T029: "Incorrect scheme specified before ':' (colon) in namespace {0}. Delete it to get the default '{1}'.",
};
