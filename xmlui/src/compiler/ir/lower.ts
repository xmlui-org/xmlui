import type {
  MixedTextSegment,
  ParsedExpression,
  SourceRange,
  XmluiDocument,
  XmluiElement,
  XmluiNode,
  XmluiParsedBindings,
  XmluiText,
} from "../ir";
import type { BoundDependency, BoundWriteTarget } from "../scriptSemantics";
import {
  collectReferencedComponents,
  createIrId,
  emptyDependencySummary,
} from "./builders";
import { htmlTagComponentNames } from "../../component-core/htmlTags";
import { createXmluiIrSourceRef, sourceSpanFromOffsets } from "./ids";
import type {
  XmluiBindingIr,
  XmluiBuiltinNodeIr,
  XmluiComponentReferenceNodeIr,
  XmluiDeclarationIr,
  XmluiDependencySummary,
  XmluiDefinitionIr,
  XmluiExpressionIrRef,
  XmluiIrId,
  XmluiIrKind,
  XmluiIrSourceRef,
  XmluiIrTextSegment,
  XmluiModuleIr,
  XmluiNodeIr,
  XmluiScopeIr,
  XmluiIrValidationOptions,
  XmluiTextNodeIr,
} from "./types";
import { validateCompilerIr } from "./validation";

export type BuildCompilerIrOptions = {
  sourceId?: string;
  filename?: string;
  validation?: XmluiIrValidationOptions;
};

type LowerContext = {
  sourceId: string;
  scopes: XmluiScopeIr[];
};

export function buildCompilerIrFromDocument(
  document: XmluiDocument,
  options: BuildCompilerIrOptions = {},
): XmluiModuleIr {
  const sourceId = options.sourceId ?? "anonymous.xmlui";
  const kind = document.kind;
  const name = document.kind === "component" ? document.name : "App";
  const context: LowerContext = {
    sourceId,
    scopes: [],
  };
  const root = lowerElement(document.root, context, ["root"], undefined, isComponentRoot(document));
  const rootScope = requiredScope(root.scopeId, context);
  const dependencies = summarizeNode(root);
  const definition: XmluiDefinitionIr = {
    id: createIrId({ sourceId, kind: "definition", path: [kind], name }),
    kind,
    name,
    source: sourceRef(sourceId, document.root.range),
    rootNodeId: root.id,
    root,
    scope: rootScope,
    scopes: context.scopes,
    declarations: rootScope.declarations,
    dependencies,
  };

  const module: XmluiModuleIr = {
    version: 1,
    id: createIrId({ sourceId, kind: "module", path: [kind], name }),
    kind,
    sourceId,
    ...(options.filename ? { filename: options.filename } : {}),
    definition,
    referencedComponents: collectReferencedComponents(root),
    diagnostics: [],
    dependencies,
  };
  module.diagnostics = validateCompilerIr(module, options.validation);
  return module;
}

function lowerElement(
  element: XmluiElement,
  context: LowerContext,
  path: readonly (string | number)[],
  parentScopeId: XmluiIrId | undefined,
  isDefinitionRoot = false,
): XmluiBuiltinNodeIr | XmluiComponentReferenceNodeIr {
  const kind = isComponentReference(element.type, isDefinitionRoot)
    ? "component-reference"
    : "builtin";
  const nodeId = createIrId({
    sourceId: context.sourceId,
    kind: "node",
    path,
    name: element.type,
  });
  const scope = createScopeForElement(element, context, path, nodeId, parentScopeId, isDefinitionRoot);
  const bindings = lowerElementBindings(element, context, path);
  const events = Object.entries(element.parsed?.events ?? {}).map(([name, event]) => ({
    id: createIrId({ sourceId: context.sourceId, kind: "event", path, name }),
    name,
    rawSource: event.source,
    source: sourceRef(context.sourceId, event.range),
    ast: event.ast,
    ir: event.ir!,
    compiledSource: event.compiledSource,
    options: event.options,
    dependencies: event.dependencies ?? [],
    writes: event.writes ?? [],
    invalidates: event.invalidates ?? [],
  }));
  const methods = Object.entries(element.parsed?.methods ?? {}).map(([name, method]) => ({
    id: createIrId({ sourceId: context.sourceId, kind: "event", path: [...path, "methods"], name }),
    name,
    rawSource: method.source,
    source: sourceRef(context.sourceId, method.range),
    ast: method.ast,
    ir: method.ir!,
    compiledSource: method.compiledSource,
    options: method.options,
    dependencies: method.dependencies ?? [],
    writes: method.writes ?? [],
    invalidates: method.invalidates ?? [],
  }));
  const children = element.children.map((child, index) =>
    lowerNode(child, context, [...path, "children", index], scope.id),
  );
  const dependencies = summarizeDependencies([
    ...bindings.map((binding) => binding.dependencies),
    ...events.map((event) => dependencySummary(event.dependencies, event.writes, event.invalidates)),
    ...methods.map((method) => dependencySummary(method.dependencies, method.writes, method.invalidates)),
    ...children.map(summarizeNode),
  ]);

  const base = {
    id: nodeId,
    source: sourceRef(context.sourceId, element.range),
    scopeId: scope.id,
    bindings,
    events,
    methods,
    dependencies,
    children,
  };

  return kind === "component-reference"
    ? {
        ...base,
        kind,
        name: element.type,
      }
    : {
        ...base,
        kind,
        type: element.type,
      };
}

function lowerNode(
  node: XmluiNode,
  context: LowerContext,
  path: readonly (string | number)[],
  parentScopeId: XmluiIrId,
): XmluiNodeIr {
  if (node.kind === "element") {
    return lowerElement(node, context, path, parentScopeId);
  }
  return lowerText(node, context, path);
}

function lowerText(
  node: XmluiText,
  context: LowerContext,
  path: readonly (string | number)[],
): XmluiTextNodeIr {
  const segments = (node.segments ?? []).map((segment, index) =>
    lowerTextSegment(segment, context, [...path, "segments", index]),
  );
  const binding = createTextBinding(node, context, path, segments);
  return {
    id: createIrId({ sourceId: context.sourceId, kind: "node", path, name: "text" }),
    kind: "text",
    text: node.value,
    segments,
    source: sourceRef(context.sourceId, node.range),
    bindings: [binding],
    events: [],
    methods: [],
    dependencies: binding.dependencies,
  };
}

function createScopeForElement(
  element: XmluiElement,
  context: LowerContext,
  path: readonly (string | number)[],
  ownerNodeId: XmluiIrId,
  parentScopeId: XmluiIrId | undefined,
  isDefinitionRoot: boolean,
): XmluiScopeIr {
  const scope: XmluiScopeIr = {
    id: createIrId({ sourceId: context.sourceId, kind: "scope", path }),
    source: sourceRef(context.sourceId, element.range),
    ...(parentScopeId ? { parentScopeId } : {}),
    ownerNodeId,
    allowImplicitGlobals: isDefinitionRoot && element.type !== "App",
    declarations: [],
  };
  context.scopes.push(scope);

  scope.declarations.push(...declarationsForElement(element, context, path, scope.id));
  return scope;
}

function declarationsForElement(
  element: XmluiElement,
  context: LowerContext,
  path: readonly (string | number)[],
  ownerScopeId: XmluiIrId,
): XmluiDeclarationIr[] {
  const declarations: XmluiDeclarationIr[] = [];
  for (const name of Object.keys(element.vars)) {
    declarations.push(createDeclaration("local", name, context, path, ownerScopeId, element.parsed?.vars?.[name]));
  }
  for (const name of Object.keys(element.globals)) {
    declarations.push(createDeclaration("global", name, context, path, ownerScopeId, element.parsed?.globals?.[name]));
  }
  for (const name of Object.keys(element.props)) {
    declarations.push(createDeclaration("prop", name, context, path, ownerScopeId, element.parsed?.props?.[name], false));
  }
  return declarations;
}

function createDeclaration(
  kind: "local" | "global" | "prop",
  name: string,
  context: LowerContext,
  path: readonly (string | number)[],
  ownerScopeId: XmluiIrId,
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  mutable = true,
): XmluiDeclarationIr {
  return {
    id: createIrId({ sourceId: context.sourceId, kind: kind === "prop" ? "prop" : "slot", path, name }),
    kind,
    name,
    mutable,
    ownerScopeId,
    source: sourceRef(context.sourceId, bindingRange(parsed)),
    initializerBindingId: createIrId({ sourceId: context.sourceId, kind: "binding", path, name }),
  };
}

function lowerElementBindings(
  element: XmluiElement,
  context: LowerContext,
  path: readonly (string | number)[],
): XmluiBindingIr[] {
  return [
    ...Object.entries(element.parsed?.props ?? {}).map(([name, value]) =>
      createBinding("prop", name, element.props[name] ?? "", value, context, path),
    ),
    ...Object.entries(element.parsed?.vars ?? {}).map(([name, value]) =>
      createBinding("local", name, element.vars[name] ?? "", value, context, path),
    ),
    ...Object.entries(element.parsed?.globals ?? {}).map(([name, value]) =>
      createBinding("global", name, element.globals[name] ?? "", value, context, path),
    ),
  ];
}

function createBinding(
  kind: "prop" | "local" | "global",
  name: string,
  rawValue: string,
  value: ParsedExpression | MixedTextSegment[],
  context: LowerContext,
  path: readonly (string | number)[],
): XmluiBindingIr {
  const expression = !Array.isArray(value) ? expressionRef(value, context) : undefined;
  const textSegments = Array.isArray(value)
    ? value.map((segment, index) => lowerTextSegment(segment, context, [...path, "bindings", name, index]))
    : undefined;
  const dependencies = expression
    ? dependencySummary(expression.dependencies, [], [])
    : summarizeDependencies(
        textSegments?.map((segment) =>
          segment.kind === "expression"
            ? dependencySummary(segment.expression.dependencies, [], [])
            : emptyDependencySummary(),
        ) ?? [],
      );

  return {
    id: createIrId({ sourceId: context.sourceId, kind: "binding", path, name }),
    kind,
    name,
    rawValue,
    bindingMode: dependencies.reads.length > 0 ? "derived" : "source",
    source: sourceRef(context.sourceId, bindingRange(value)),
    ...(expression ? { expression } : {}),
    ...(textSegments ? { textSegments } : {}),
    dependencies,
  };
}

function createTextBinding(
  node: XmluiText,
  context: LowerContext,
  path: readonly (string | number)[],
  segments: XmluiIrTextSegment[],
): XmluiBindingIr {
  return {
    id: createIrId({ sourceId: context.sourceId, kind: "binding", path, name: "text" }),
    kind: "text",
    name: "text",
    rawValue: node.value,
    source: sourceRef(context.sourceId, node.range),
    textSegments: segments,
    dependencies: summarizeDependencies(
      segments.map((segment) =>
        segment.kind === "expression"
          ? dependencySummary(segment.expression.dependencies, [], [])
          : emptyDependencySummary(),
      ),
    ),
  };
}

function lowerTextSegment(
  segment: MixedTextSegment,
  context: LowerContext,
  path: readonly (string | number)[],
): XmluiIrTextSegment {
  if (segment.kind === "literal") {
    return {
      kind: "literal",
      value: segment.value,
      source: sourceRef(context.sourceId, segment.range),
    };
  }
  return {
    kind: "expression",
    sourceText: segment.source,
    source: sourceRef(context.sourceId, segment.range),
    expression: expressionRef(segment, context),
  };
}

function expressionRef(
  expression: ParsedExpression | Extract<MixedTextSegment, { kind: "expression" }>,
  context: LowerContext,
): XmluiExpressionIrRef {
  return {
    sourceText: expression.source,
    ast: expression.ast,
    ir: expression.ir!,
    compiledSource: expression.compiledSource,
    bindingMode: expression.bindingMode,
    dependencies: expression.dependencies ?? [],
    source: sourceRef(context.sourceId, "expressionRange" in expression ? expression.expressionRange : expression.range),
  };
}

function summarizeNode(node: XmluiNodeIr): XmluiDependencySummary {
  return summarizeDependencies([
    ...node.bindings.map((binding) => binding.dependencies),
    ...node.events.map((event) => dependencySummary(event.dependencies, event.writes, event.invalidates)),
    ...("children" in node ? node.children.map(summarizeNode) : []),
  ]);
}

function summarizeDependencies(summaries: XmluiDependencySummary[]): XmluiDependencySummary {
  return {
    reads: summaries.flatMap((summary) => summary.reads),
    writes: summaries.flatMap((summary) => summary.writes),
    invalidates: summaries.flatMap((summary) => summary.invalidates),
  };
}

function dependencySummary(
  reads: BoundDependency[],
  writes: BoundWriteTarget[],
  invalidates: Array<{ kind: "local" | "global"; name: string }>,
): XmluiDependencySummary {
  return {
    reads,
    writes,
    invalidates,
  };
}

function isComponentReference(type: string, isDefinitionRoot: boolean): boolean {
  return !isDefinitionRoot && /^[A-Z]/.test(type) && !builtInElementNames.has(type);
}

const builtInElementNames = new Set([
  ...htmlTagComponentNames,
  "App",
  "AppHeader",
  "APICall",
  "DataSource",
  "Heading",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "Icon",
  "Image",
  "IFrame",
  "Link",
  "Logo",
  "PageMetaTitle",
  "QRCode",
  "Button",
  "Br",
  "br",
  "Card",
  "CodeBlock",
  "ContentSeparator",
  "Checkbox",
  "Switch",
  "Fragment",
  "FlowLayout",
  "Fallback",
  "HStack",
  "Items",
  "Option",
  "Page",
  "Pages",
  "NavLink",
  "NavPanel",
  "NoResult",
  "Select",
  "Slot",
  "SpaceFiller",
  "Stack",
  "Text",
  "TextBox",
  "TextArea",
  "NumberBox",
  "RatingInput",
  "Slider",
  "ColorPicker",
  "DateInput",
  "DatePicker",
  "TimeInput",
  "PasswordInput",
  "Theme",
  "VStack",
]);

function isComponentRoot(document: XmluiDocument): boolean {
  return document.kind === "component";
}

function sourceRef(sourceId: string, range: SourceRange): XmluiIrSourceRef {
  return createXmluiIrSourceRef(sourceId, sourceSpanFromOffsets(sourceId, range.start, range.end));
}

function bindingRange(value: ParsedExpression | MixedTextSegment[] | undefined): SourceRange {
  if (!value) {
    return { start: 0, end: 0 };
  }
  if (Array.isArray(value)) {
    return {
      start: value[0]?.range.start ?? 0,
      end: value.at(-1)?.range.end ?? value[0]?.range.end ?? 0,
    };
  }
  return value.range;
}

function requiredScope(id: XmluiIrId | undefined, context: LowerContext): XmluiScopeIr {
  const scope = context.scopes.find((candidate) => candidate.id === id);
  if (!scope) {
    throw new Error(`Missing XMLUI IR scope '${id ?? ""}'.`);
  }
  return scope;
}
