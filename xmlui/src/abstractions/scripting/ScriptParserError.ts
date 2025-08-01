export interface ScriptParserErrorMessage {
  code: ScriptParsingErrorCodes;
  text: string;
  position?: number;
  line?: number;
  column?: number;
}

export type ScriptParsingErrorCodes =
  | "W001"
  | "W002"
  | "W003"
  | "W004"
  | "W005"
  | "W006"
  | "W007"
  | "W008"
  | "W009"
  | "W010"
  | "W011"
  | "W012"
  | "W013"
  | "W014"
  | "W015"
  | "W016"
  | "W017"
  | "W018"
  | "W019"
  | "W020"
  | "W021"
  | "W022"
  | "W023"
  | "W024"
  | "W025"
  | "W026"
  | "W027"
  | "W028"
  | "W029"
  | "W030"
  | "W031";
