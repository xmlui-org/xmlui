import type { SourceSpan } from "./source";

export type TokenClassification =
  | "comment"
  | "identifier"
  | "keyword"
  | "operator"
  | "punctuation"
  | "string"
  | "text"
  | "trivia"
  | "unknown";

export type BaseToken<TKind extends string> = {
  kind: TKind;
  span: SourceSpan;
  text: string;
  value?: string;
  classification: TokenClassification;
};
