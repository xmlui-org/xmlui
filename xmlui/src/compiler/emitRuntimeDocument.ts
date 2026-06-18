import type {
  MixedTextSegment,
  ParsedEvent,
  ParsedExpression,
  XmluiDocument,
  XmluiElement,
  XmluiNode,
  XmluiParsedBindings,
  XmluiText,
} from "./ir";
import {
  emitGeneratedEventHandler,
  emitGeneratedExpressionBinding,
  emitGeneratedMixedTextSegment,
  emitValue,
  type EmitJsValue,
} from "./codegen";

export function emitRuntimeDocument(document: XmluiDocument): string {
  return emitValue(emitDocument(document), 0);
}

function emitDocument(document: XmluiDocument): EmitJsValue {
  if (document.kind === "component") {
    return {
      kind: "component",
      name: document.name,
      root: emitNode(document.root),
    };
  }
  return {
    kind: "app",
    root: emitNode(document.root),
  };
}

function emitNode(node: XmluiNode): EmitJsValue {
  if (node.kind === "text") {
    return emitText(node);
  }
  return emitElement(node);
}

function emitElement(element: XmluiElement): EmitJsValue {
  return {
    kind: "element",
    type: element.type,
    props: element.props,
    vars: element.vars,
    globals: element.globals,
    events: element.events,
    children: element.children.map(emitNode),
    range: element.range,
    ...(element.parsed ? { parsed: emitParsedBindings(element.parsed) } : {}),
  };
}

function emitText(text: XmluiText): EmitJsValue {
  return {
    kind: "text",
    value: text.value,
    range: text.range,
    ...(text.segments ? { segments: text.segments.map(emitGeneratedMixedTextSegment) } : {}),
  };
}

function emitParsedBindings(parsed: XmluiParsedBindings): EmitJsValue {
  return {
    ...(parsed.props ? { props: emitBindingBucket(parsed.props) } : {}),
    ...(parsed.vars ? { vars: emitBindingBucket(parsed.vars) } : {}),
    ...(parsed.globals ? { globals: emitBindingBucket(parsed.globals) } : {}),
    ...(parsed.events ? { events: emitEventBucket(parsed.events) } : {}),
  };
}

function emitBindingBucket(bucket: Record<string, ParsedExpression | MixedTextSegment[]>): EmitJsValue {
  return Object.fromEntries(
    Object.entries(bucket).map(([name, value]) => [
      name,
      Array.isArray(value) ? value.map(emitGeneratedMixedTextSegment) : emitGeneratedExpressionBinding(value),
    ]),
  );
}

function emitEventBucket(bucket: Record<string, ParsedEvent>): EmitJsValue {
  return Object.fromEntries(
    Object.entries(bucket).map(([name, event]) => [name, emitGeneratedEventHandler(event)]),
  );
}
