import type { ParserDiagnostic, ProgramNode, ScriptNode, SourceSpan } from "../../parser";
import type {
  BoundDependency,
  BoundWriteTarget,
  XmluiEventHandlerIr,
  XmluiHandlerOptions,
  XmluiScriptIr,
} from "../scriptSemantics";

export type XmluiIrId = string & { readonly __xmluiIrId: unique symbol };

export type XmluiIrKind = "app" | "component";

export type XmluiIrNodeKind = "builtin" | "component-reference" | "text";

export type XmluiIrBindingKind = "prop" | "local" | "global" | "text";

export type XmluiIrDeclarationKind = "local" | "global" | "prop";

export type XmluiIrSourceRef = {
  sourceId: string;
  span: SourceSpan;
};

export type XmluiDependencySummary = {
  reads: BoundDependency[];
  writes: BoundWriteTarget[];
  invalidates: Array<{ kind: "local" | "global"; name: string }>;
};

export type XmluiModuleIr = {
  version: 1;
  id: XmluiIrId;
  kind: XmluiIrKind;
  sourceId: string;
  filename?: string;
  definition: XmluiDefinitionIr;
  referencedComponents: string[];
  diagnostics: ParserDiagnostic[];
  dependencies: XmluiDependencySummary;
};

export type XmluiDefinitionIr = {
  id: XmluiIrId;
  kind: XmluiIrKind;
  name: string;
  source: XmluiIrSourceRef;
  rootNodeId: XmluiIrId;
  root: XmluiNodeIr;
  scope: XmluiScopeIr;
  scopes: XmluiScopeIr[];
  declarations: XmluiDeclarationIr[];
  dependencies: XmluiDependencySummary;
};

export type XmluiNodeIr = XmluiBuiltinNodeIr | XmluiComponentReferenceNodeIr | XmluiTextNodeIr;

export type XmluiNodeIrBase = {
  id: XmluiIrId;
  kind: XmluiIrNodeKind;
  source: XmluiIrSourceRef;
  scopeId?: XmluiIrId;
  bindings: XmluiBindingIr[];
  events: XmluiEventIr[];
  dependencies: XmluiDependencySummary;
};

export type XmluiBuiltinNodeIr = XmluiNodeIrBase & {
  kind: "builtin";
  type: "App" | "H1" | "Button" | string;
  children: XmluiNodeIr[];
};

export type XmluiComponentReferenceNodeIr = XmluiNodeIrBase & {
  kind: "component-reference";
  name: string;
  children: XmluiNodeIr[];
};

export type XmluiTextNodeIr = XmluiNodeIrBase & {
  kind: "text";
  text: string;
  segments: XmluiIrTextSegment[];
};

export type XmluiIrTextSegment =
  | {
      kind: "literal";
      value: string;
      source: XmluiIrSourceRef;
    }
  | {
      kind: "expression";
      sourceText: string;
      source: XmluiIrSourceRef;
      expression: XmluiExpressionIrRef;
    };

export type XmluiBindingIr = {
  id: XmluiIrId;
  kind: XmluiIrBindingKind;
  name: string;
  rawValue: string;
  bindingMode?: "source" | "derived";
  source: XmluiIrSourceRef;
  expression?: XmluiExpressionIrRef;
  textSegments?: XmluiIrTextSegment[];
  dependencies: XmluiDependencySummary;
};

export type XmluiExpressionIrRef = {
  sourceText: string;
  ast: ScriptNode;
  ir: XmluiScriptIr;
  compiledSource?: string;
  bindingMode?: "source" | "derived";
  dependencies: BoundDependency[];
  source: XmluiIrSourceRef;
};

export type XmluiEventIr = {
  id: XmluiIrId;
  name: string;
  rawSource: string;
  source: XmluiIrSourceRef;
  ast: ProgramNode;
  ir: XmluiEventHandlerIr;
  compiledSource?: string;
  options?: XmluiHandlerOptions;
  dependencies: BoundDependency[];
  writes: BoundWriteTarget[];
  invalidates: Array<{ kind: "local" | "global"; name: string }>;
};

export type XmluiDeclarationIr = {
  id: XmluiIrId;
  kind: XmluiIrDeclarationKind;
  name: string;
  mutable: boolean;
  ownerScopeId: XmluiIrId;
  source: XmluiIrSourceRef;
  initializerBindingId?: XmluiIrId;
};

export type XmluiScopeIr = {
  id: XmluiIrId;
  source: XmluiIrSourceRef;
  parentScopeId?: XmluiIrId;
  ownerNodeId?: XmluiIrId;
  allowImplicitGlobals: boolean;
  declarations: XmluiDeclarationIr[];
};

export type XmluiIrBuildOptions = {
  sourceId?: string;
};

export type XmluiIrValidationOptions = {
  knownComponents?: ReadonlySet<string>;
};
