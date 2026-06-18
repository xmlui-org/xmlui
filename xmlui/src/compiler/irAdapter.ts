import type {
  MixedTextSegment,
  ParsedEvent,
  ParsedExpression,
  SourceRange,
  XmluiDocument,
  XmluiElement,
  XmluiNode,
  XmluiParsedBindings,
  XmluiText,
} from "./ir";
import type {
  XmluiBindingIr,
  XmluiEventIr,
  XmluiExpressionIrRef,
  XmluiIrSourceRef,
  XmluiIrTextSegment,
  XmluiModuleIr,
  XmluiNodeIr,
} from "./ir/index";

export function compilerIrToRuntimeDocument(module: XmluiModuleIr): XmluiDocument {
  const root = runtimeNodeFromIr(module.definition.root);
  if (root.kind !== "element") {
    throw new Error("XMLUI compiler IR definition root must be an element.");
  }

  if (module.kind === "component") {
    return {
      kind: "component",
      name: module.definition.name,
      root,
    };
  }

  return {
    kind: "app",
    root,
  };
}

function runtimeNodeFromIr(node: XmluiNodeIr): XmluiNode {
  if (node.kind === "text") {
    return {
      kind: "text",
      value: node.text,
      range: rangeFromSource(node.source),
      segments: node.segments.map(runtimeTextSegmentFromIr),
    } satisfies XmluiText;
  }

  const props = bindingsForKind(node.bindings, "prop");
  const vars = bindingsForKind(node.bindings, "local");
  const globals = bindingsForKind(node.bindings, "global");
  const events = Object.fromEntries(node.events.map((event) => [event.name, event.rawSource]));
  const parsed = parsedBindingsFromIr(node.bindings, node.events);

  return {
    kind: "element",
    type: node.kind === "component-reference" ? node.name : node.type,
    props,
    vars,
    globals,
    events,
    children: node.children.map(runtimeNodeFromIr),
    range: rangeFromSource(node.source),
    ...(hasParsedBindings(parsed) ? { parsed } : {}),
  } satisfies XmluiElement;
}

function bindingsForKind(
  bindings: readonly XmluiBindingIr[],
  kind: "prop" | "local" | "global",
): Record<string, string> {
  return Object.fromEntries(
    bindings.filter((binding) => binding.kind === kind).map((binding) => [binding.name, binding.rawValue]),
  );
}

function parsedBindingsFromIr(
  bindings: readonly XmluiBindingIr[],
  events: readonly XmluiEventIr[],
): XmluiParsedBindings {
  const parsed: XmluiParsedBindings = {};

  addParsedBindingGroup(parsed, "props", bindings, "prop");
  addParsedBindingGroup(parsed, "vars", bindings, "local");
  addParsedBindingGroup(parsed, "globals", bindings, "global");

  if (events.length > 0) {
    parsed.events = Object.fromEntries(events.map((event) => [event.name, parsedEventFromIr(event)]));
  }

  return parsed;
}

function addParsedBindingGroup(
  parsed: XmluiParsedBindings,
  target: "props" | "vars" | "globals",
  bindings: readonly XmluiBindingIr[],
  kind: "prop" | "local" | "global",
): void {
  const entries = bindings
    .filter((binding) => binding.kind === kind)
    .map((binding) => [binding.name, parsedBindingValueFromIr(binding)] as const);
  if (entries.length > 0) {
    parsed[target] = Object.fromEntries(entries);
  }
}

function parsedBindingValueFromIr(binding: XmluiBindingIr): ParsedExpression | MixedTextSegment[] {
  if (binding.expression) {
    return parsedExpressionFromIr(binding.expression);
  }
  return (binding.textSegments ?? []).map(runtimeTextSegmentFromIr);
}

function parsedExpressionFromIr(expression: XmluiExpressionIrRef): ParsedExpression {
  return {
    source: expression.sourceText,
    ast: expression.ast,
    range: rangeFromSource(expression.source),
    ir: expression.ir,
    compiledSource: expression.compiledSource,
    dependencies: expression.dependencies,
  };
}

function parsedEventFromIr(event: XmluiEventIr): ParsedEvent {
  return {
    source: event.rawSource,
    ast: event.ast,
    range: rangeFromSource(event.source),
    ir: event.ir,
    compiledSource: event.compiledSource,
    dependencies: event.dependencies,
    writes: event.writes,
    invalidates: event.invalidates,
  };
}

function runtimeTextSegmentFromIr(segment: XmluiIrTextSegment): MixedTextSegment {
  if (segment.kind === "literal") {
    return {
      kind: "literal",
      value: segment.value,
      range: rangeFromSource(segment.source),
    };
  }

  return {
    kind: "expression",
    source: segment.sourceText,
    range: rangeFromSource(segment.source),
    expressionRange: rangeFromSource(segment.expression.source),
    ast: segment.expression.ast,
    ir: segment.expression.ir,
    compiledSource: segment.expression.compiledSource,
    dependencies: segment.expression.dependencies,
  };
}

function hasParsedBindings(parsed: XmluiParsedBindings): boolean {
  return Boolean(parsed.props || parsed.vars || parsed.globals || parsed.events);
}

function rangeFromSource(source: XmluiIrSourceRef): SourceRange {
  return {
    start: source.span.start,
    end: source.span.end,
  };
}
