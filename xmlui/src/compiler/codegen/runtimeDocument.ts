import type {
  XmluiBindingIr,
  XmluiEventIr,
  XmluiExpressionIrRef,
  XmluiIrSourceRef,
  XmluiIrTextSegment,
  XmluiModuleIr,
  XmluiNodeIr,
} from "../ir/index";
import { rawJs, type EmitJsValue } from "./emitter";
import {
  generateEventHandlerFunction,
  generateExpressionFunction,
  handlerUsesSharedYield,
  type SharedYieldHelperOptions,
} from "./script";

const SHARED_YIELD_HELPER: SharedYieldHelperOptions = {
  createStateName: "__xmluiCreateYieldState",
  checkpointName: "__xmluiYieldIfNeeded",
};

export function emitRuntimeDocumentFromIr(module: XmluiModuleIr): EmitJsValue {
  const root = emitRuntimeNode(module.definition.root);
  return module.kind === "component"
    ? {
        kind: "component",
        name: module.definition.name,
        sourceId: module.sourceId,
        filename: module.filename,
        irId: module.id,
        root,
      }
    : {
        kind: "app",
        sourceId: module.sourceId,
        filename: module.filename,
        irId: module.id,
        root,
      };
}

function emitRuntimeNode(node: XmluiNodeIr): EmitJsValue {
  if (node.kind === "text") {
    return {
      kind: "text",
      value: node.text,
      range: rangeFromSource(node.source),
      source: node.source,
      irId: node.id,
      generatedName: generatedName("node", node.id),
      segments: node.segments.map(emitRuntimeTextSegment),
    };
  }

  return {
    kind: "element",
    type: node.kind === "component-reference" ? node.name : node.type,
    props: rawValues(node.bindings, "prop"),
    vars: rawValues(node.bindings, "local"),
    globals: rawValues(node.bindings, "global"),
    events: Object.fromEntries(node.events.map((event) => [event.name, event.rawSource])),
    methods: Object.fromEntries(node.methods.map((method) => [method.name, method.rawSource])),
    children: node.children.map(emitRuntimeNode),
    range: rangeFromSource(node.source),
    source: node.source,
    irId: node.id,
    scopeId: node.scopeId,
    generatedName: generatedName("node", node.id),
    parsed: emitParsedBindings(node.bindings, node.events, node.methods),
  };
}

function emitParsedBindings(
  bindings: readonly XmluiBindingIr[],
  events: readonly XmluiEventIr[],
  methods: readonly XmluiEventIr[],
): EmitJsValue | undefined {
  const props = bindingBucket(bindings, "prop");
  const vars = bindingBucket(bindings, "local");
  const globals = bindingBucket(bindings, "global");
  const eventBucket = events.length > 0
    ? Object.fromEntries(events.map((event) => [event.name, emitRuntimeEvent(event)]))
    : undefined;
  const methodBucket = methods.length > 0
    ? Object.fromEntries(methods.map((method) => [method.name, emitRuntimeEvent(method)]))
    : undefined;
  if (!props && !vars && !globals && !eventBucket && !methodBucket) {
    return undefined;
  }
  return {
    props,
    vars,
    globals,
    events: eventBucket,
    methods: methodBucket,
  };
}

function rawValues(
  bindings: readonly XmluiBindingIr[],
  kind: "prop" | "local" | "global",
): Record<string, string> {
  return Object.fromEntries(
    bindings.filter((binding) => binding.kind === kind).map((binding) => [binding.name, binding.rawValue]),
  );
}

function bindingBucket(
  bindings: readonly XmluiBindingIr[],
  kind: "prop" | "local" | "global",
): EmitJsValue | undefined {
  const entries = bindings
    .filter((binding) => binding.kind === kind)
    .map((binding) => [binding.name, emitRuntimeBinding(binding)] as const);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function emitRuntimeBinding(binding: XmluiBindingIr): EmitJsValue {
  if (binding.expression) {
    return emitRuntimeExpression(binding.expression, binding.id, binding.rawValue);
  }
  return (binding.textSegments ?? []).map(emitRuntimeTextSegment);
}

function emitRuntimeTextSegment(segment: XmluiIrTextSegment): EmitJsValue {
  if (segment.kind === "literal") {
    return {
      kind: "literal",
      value: segment.value,
      range: rangeFromSource(segment.source),
      source: segment.source,
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
    ...emitGeneratedExpressionFields(segment.expression, generatedName("expr", segment.expression.source)),
    dependencies: segment.expression.dependencies,
  };
}

function emitRuntimeExpression(
  expression: XmluiExpressionIrRef,
  irId: string,
  rawValue: string,
): EmitJsValue {
  return {
    source: expression.sourceText,
    ast: expression.ast,
    range: rangeFromSource(expression.source),
    ir: expression.ir,
    rawValue,
    irId,
    bindingMode: expression.bindingMode,
    ...emitGeneratedExpressionFields(expression, generatedName("expr", irId)),
    dependencies: expression.dependencies,
  };
}

function emitRuntimeEvent(event: XmluiEventIr): EmitJsValue {
  const generated = generateEventHandlerFunction(event.ir, event.writes, {
    yieldHelper: event.ir.options.executionMode === "sync"
      ? "none"
      : handlerUsesSharedYield(event.ir)
        ? SHARED_YIELD_HELPER
        : "inline",
  });
  return {
    source: event.rawSource,
    ast: event.ast,
    range: rangeFromSource(event.source),
    ir: event.ir,
    irId: event.id,
    generatedName: generatedName("event", event.id),
    compiledSource: generated.body,
    execute: rawJs(generated.functionSource),
    options: event.ir.options,
    dependencies: event.dependencies,
    writes: event.writes,
    invalidates: generated.invalidates,
  };
}

function emitGeneratedExpressionFields(
  expression: XmluiExpressionIrRef,
  name: string,
): { generatedName: string; compiledSource: string; evaluate: EmitJsValue } {
  const generated = generateExpressionFunction(expression.ir);
  return {
    generatedName: name,
    compiledSource: generated.body,
    evaluate: rawJs(generated.functionSource),
  };
}

function rangeFromSource(source: XmluiIrSourceRef) {
  return {
    start: source.span.start,
    end: source.span.end,
  };
}

function generatedName(prefix: string, value: string | XmluiIrSourceRef): string {
  const source = typeof value === "string"
    ? value
    : `${value.sourceId}:${value.span.start}:${value.span.end}`;
  return `${prefix}_${source.replace(/[^A-Za-z0-9_$]/g, "_")}`;
}
