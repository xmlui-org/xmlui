import type { ProgramNode, ScriptNode } from "../parser";

export type SourceRange = {
  start: number;
  end: number;
};

export type ParsedExpression = {
  source: string;
  ast: ScriptNode;
  range: SourceRange;
};

export type ParsedEvent = {
  source: string;
  ast: ProgramNode;
  range: SourceRange;
};

export type MixedTextSegment =
  | {
      kind: "literal";
      value: string;
      range: SourceRange;
    }
  | {
      kind: "expression";
      source: string;
      range: SourceRange;
      expressionRange: SourceRange;
      ast: ScriptNode;
    };

export type XmluiParsedBindings = {
  props?: Record<string, ParsedExpression | MixedTextSegment[]>;
  vars?: Record<string, ParsedExpression | MixedTextSegment[]>;
  globals?: Record<string, ParsedExpression | MixedTextSegment[]>;
  events?: Record<string, ParsedEvent>;
};

export type XmluiDocument = XmluiAppDocument | XmluiComponentDocument;

export type XmluiAppDocument = {
  kind: "app";
  root: XmluiElement;
};

export type XmluiComponentDocument = {
  kind: "component";
  name: string;
  root: XmluiElement;
};

export type XmluiNode = XmluiElement | XmluiText;

export type XmluiElement = {
  kind: "element";
  type: string;
  props: Record<string, string>;
  vars: Record<string, string>;
  globals: Record<string, string>;
  events: Record<string, string>;
  children: XmluiNode[];
  range: SourceRange;
  parsed?: XmluiParsedBindings;
};

export type XmluiText = {
  kind: "text";
  value: string;
  range: SourceRange;
  segments?: MixedTextSegment[];
};
