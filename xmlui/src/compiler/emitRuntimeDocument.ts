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

type JsValue = unknown | RawJs;

type RawJs = {
  __rawJs: string;
};

export function emitRuntimeDocument(document: XmluiDocument): string {
  return emitValue(emitDocument(document), 0);
}

function emitDocument(document: XmluiDocument): JsValue {
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

function emitNode(node: XmluiNode): JsValue {
  if (node.kind === "text") {
    return emitText(node);
  }
  return emitElement(node);
}

function emitElement(element: XmluiElement): JsValue {
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

function emitText(text: XmluiText): JsValue {
  return {
    kind: "text",
    value: text.value,
    range: text.range,
    ...(text.segments ? { segments: text.segments.map(emitMixedTextSegment) } : {}),
  };
}

function emitParsedBindings(parsed: XmluiParsedBindings): JsValue {
  return {
    ...(parsed.props ? { props: emitBindingBucket(parsed.props) } : {}),
    ...(parsed.vars ? { vars: emitBindingBucket(parsed.vars) } : {}),
    ...(parsed.globals ? { globals: emitBindingBucket(parsed.globals) } : {}),
    ...(parsed.events ? { events: emitEventBucket(parsed.events) } : {}),
  };
}

function emitBindingBucket(
  bucket: Record<string, ParsedExpression | MixedTextSegment[]>,
): JsValue {
  return Object.fromEntries(
    Object.entries(bucket).map(([name, value]) => [
      name,
      Array.isArray(value) ? value.map(emitMixedTextSegment) : emitExpression(value),
    ]),
  );
}

function emitEventBucket(bucket: Record<string, ParsedEvent>): JsValue {
  return Object.fromEntries(Object.entries(bucket).map(([name, event]) => [name, emitEvent(event)]));
}

function emitExpression(expression: ParsedExpression | Extract<MixedTextSegment, { kind: "expression" }>): JsValue {
  return {
    source: expression.source,
    ast: expression.ast,
    range: expression.range,
    ir: expression.ir,
    compiledSource: expression.compiledSource,
    ...(expression.compiledSource ? { evaluate: raw(functionLiteral(expression.compiledSource)) } : {}),
    dependencies: expression.dependencies,
    ...("expressionRange" in expression ? { expressionRange: expression.expressionRange } : {}),
  };
}

function emitEvent(event: ParsedEvent): JsValue {
  return {
    source: event.source,
    ast: event.ast,
    range: event.range,
    ir: event.ir,
    compiledSource: event.compiledSource,
    ...(event.compiledSource ? { execute: raw(functionLiteral(event.compiledSource)) } : {}),
    dependencies: event.dependencies,
    writes: event.writes,
    invalidates: event.invalidates,
  };
}

function emitMixedTextSegment(segment: MixedTextSegment): JsValue {
  if (segment.kind === "literal") {
    return segment;
  }
  return emitExpression(segment);
}

function functionLiteral(body: string): string {
  return `(ctx) => {\n${indent(body, 2)}\n}`;
}

function raw(code: string): RawJs {
  return { __rawJs: code };
}

function emitValue(value: JsValue, level: number): string {
  if (isRaw(value)) {
    return value.__rawJs;
  }
  if (value === undefined) {
    return "undefined";
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    return `[\n${value.map((item) => `${spaces(level + 1)}${emitValue(item, level + 1)}`).join(",\n")}\n${spaces(level)}]`;
  }

  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
  if (entries.length === 0) {
    return "{}";
  }
  return `{\n${entries
    .map(([key, entryValue]) => `${spaces(level + 1)}${JSON.stringify(key)}: ${emitValue(entryValue, level + 1)}`)
    .join(",\n")}\n${spaces(level)}}`;
}

function isRaw(value: JsValue): value is RawJs {
  return Boolean(value && typeof value === "object" && "__rawJs" in value);
}

function indent(text: string, level: number): string {
  return text
    .split("\n")
    .map((line) => `${spaces(level)}${line}`)
    .join("\n");
}

function spaces(level: number): string {
  return "  ".repeat(level);
}
