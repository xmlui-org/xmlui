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
import {
  generateEventHandlerFunction,
  generateExpressionFunction,
} from "./codegen";
import type {
  XmluiBindingIr,
  XmluiEventIr,
  XmluiExpressionIrRef,
  XmluiIrSourceRef,
  XmluiIrTextSegment,
  XmluiModuleIr,
  XmluiNodeIr,
} from "./ir/index";

export function materializeRuntimeDocumentFromIr(module: XmluiModuleIr): XmluiDocument {
  const root = materializeRuntimeNode(module.definition.root);
  if (root.kind !== "element") {
    throw new Error("XMLUI compiler IR definition root must be an element.");
  }

  return module.kind === "component"
    ? {
        kind: "component",
        name: module.definition.name,
        root,
      }
    : {
        kind: "app",
        root,
      };
}

function materializeRuntimeNode(node: XmluiNodeIr): XmluiNode {
  if (node.kind === "text") {
    return {
      kind: "text",
      value: node.text,
      range: rangeFromSource(node.source),
      segments: node.segments.map(materializeRuntimeTextSegment),
    } satisfies XmluiText;
  }

  const parsed = materializeParsedBindings(node.bindings, node.events, node.methods);
  return {
    kind: "element",
    type: node.kind === "component-reference" ? node.name : node.type,
    props: rawValues(node.bindings, "prop"),
    vars: rawValues(node.bindings, "local"),
    globals: rawValues(node.bindings, "global"),
    events: Object.fromEntries(node.events.map((event) => [event.name, event.rawSource])),
    methods: Object.fromEntries(node.methods.map((method) => [method.name, method.rawSource])),
    children: node.children.map(materializeRuntimeNode),
    range: rangeFromSource(node.source),
    ...(hasParsedBindings(parsed) ? { parsed } : {}),
  } satisfies XmluiElement;
}

function rawValues(
  bindings: readonly XmluiBindingIr[],
  kind: "prop" | "local" | "global",
): Record<string, string> {
  return Object.fromEntries(
    bindings.filter((binding) => binding.kind === kind).map((binding) => [binding.name, binding.rawValue]),
  );
}

function materializeParsedBindings(
  bindings: readonly XmluiBindingIr[],
  events: readonly XmluiEventIr[],
  methods: readonly XmluiEventIr[],
): XmluiParsedBindings {
  const parsed: XmluiParsedBindings = {};

  addBindingBucket(parsed, "props", bindings, "prop");
  addBindingBucket(parsed, "vars", bindings, "local");
  addBindingBucket(parsed, "globals", bindings, "global");

  if (events.length > 0) {
    parsed.events = Object.fromEntries(events.map((event) => [event.name, materializeRuntimeEvent(event)]));
  }
  if (methods.length > 0) {
    parsed.methods = Object.fromEntries(methods.map((method) => [method.name, materializeRuntimeEvent(method)]));
  }

  return parsed;
}

function addBindingBucket(
  parsed: XmluiParsedBindings,
  target: "props" | "vars" | "globals",
  bindings: readonly XmluiBindingIr[],
  kind: "prop" | "local" | "global",
): void {
  const entries = bindings
    .filter((binding) => binding.kind === kind)
    .map((binding) => [binding.name, materializeRuntimeBinding(binding)] as const);
  if (entries.length > 0) {
    parsed[target] = Object.fromEntries(entries);
  }
}

function materializeRuntimeBinding(binding: XmluiBindingIr): ParsedExpression | MixedTextSegment[] {
  if (binding.expression) {
    return materializeRuntimeExpression(binding.expression);
  }
  return (binding.textSegments ?? []).map(materializeRuntimeTextSegment);
}

function materializeRuntimeTextSegment(segment: XmluiIrTextSegment): MixedTextSegment {
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
    bindingMode: segment.expression.bindingMode,
    ...materializeExpressionFunction(segment.expression),
    dependencies: segment.expression.dependencies,
  };
}

function materializeRuntimeExpression(expression: XmluiExpressionIrRef): ParsedExpression {
  return {
    source: expression.sourceText,
    ast: expression.ast,
    range: rangeFromSource(expression.source),
    ir: expression.ir,
    bindingMode: expression.bindingMode,
    ...materializeExpressionFunction(expression),
    dependencies: expression.dependencies,
  };
}

function materializeRuntimeEvent(event: XmluiEventIr): ParsedEvent {
  const generated = generateEventHandlerFunction(event.ir, event.writes);
  return {
    source: event.rawSource,
    ast: event.ast,
    range: rangeFromSource(event.source),
    ir: event.ir,
    compiledSource: generated.body,
    execute: materializeFunction(generated.functionSource) as ParsedEvent["execute"],
    options: event.ir.options,
    dependencies: event.dependencies,
    writes: event.writes,
    invalidates: generated.invalidates,
  };
}

function materializeExpressionFunction(
  expression: XmluiExpressionIrRef,
): Pick<ParsedExpression, "compiledSource" | "evaluate"> {
  const generated = generateExpressionFunction(expression.ir);
  return {
    compiledSource: generated.body,
    evaluate: materializeFunction(generated.functionSource) as ParsedExpression["evaluate"],
  };
}

function materializeFunction<T extends Function>(functionSource: string): T {
  return new Function(`return (${functionSource});`)() as T;
}

function hasParsedBindings(parsed: XmluiParsedBindings): boolean {
  return Boolean(parsed.props || parsed.vars || parsed.globals || parsed.events || parsed.methods);
}

function rangeFromSource(source: XmluiIrSourceRef): SourceRange {
  return {
    start: source.span.start,
    end: source.span.end,
  };
}
