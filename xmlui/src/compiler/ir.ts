import type { ProgramNode, ScriptNode } from "../parser";
import type {
  BoundDependency,
  BoundWriteTarget,
  CompiledEventContext,
  CompiledExpressionContext,
  XmluiEventHandlerIr,
  XmluiScriptIr,
} from "./scriptSemantics";

export type SourceRange = {
  start: number;
  end: number;
};

export type ParsedExpression = {
  source: string;
  ast: ScriptNode;
  range: SourceRange;
  ir?: XmluiScriptIr;
  compiledSource?: string;
  evaluate?: (context: CompiledExpressionContext) => unknown;
  dependencies?: BoundDependency[];
};

export type ParsedEvent = {
  source: string;
  ast: ProgramNode;
  range: SourceRange;
  ir?: XmluiEventHandlerIr;
  compiledSource?: string;
  execute?: (context: CompiledEventContext) => void;
  dependencies?: BoundDependency[];
  writes?: BoundWriteTarget[];
  invalidates?: Array<{ kind: "local" | "global"; name: string }>;
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
      ir?: XmluiScriptIr;
      compiledSource?: string;
      evaluate?: (context: CompiledExpressionContext) => unknown;
      dependencies?: BoundDependency[];
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
