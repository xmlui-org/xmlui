import {
  getNodeText,
  MarkupSyntaxKind,
  parseMarkup,
  parseScriptEventHandler,
  parseScriptExpression,
  type MarkupSyntaxNode,
  type ParserDiagnostic,
  type SourceText,
} from "../parser";
import { parseExpressionOrMixedText, parseMixedTextSegments } from "./mixedText";
import type {
  ParsedEvent,
  ParsedExpression,
  SourceRange,
  XmluiDocument,
  XmluiElement,
  XmluiNode,
  XmluiParsedBindings,
} from "./ir";

type AttributeInfo = {
  name: string;
  value: string;
  nameRange: SourceRange;
  valueRange: SourceRange;
};

export type ParseXmluiOptions = {
  sourceId?: string;
};

export function parseXmlui(source: string, options: ParseXmluiOptions = {}): XmluiDocument {
  const sourceId = options.sourceId ?? "anonymous.xmlui";
  const parsed = parseMarkup(source, sourceId);
  if (parsed.diagnostics.length > 0) {
    throw diagnosticToError(parsed.diagnostics[0]);
  }

  const root = rootElement(parsed.node);
  if (!root) {
    throw new Error("XMLUI document is empty.");
  }

  const transformedRoot = transformElement(root, parsed.source, sourceId);

  if (transformedRoot.type === "Component") {
    const name = transformedRoot.props.name;
    if (!name) {
      throw new Error("<Component> requires a name attribute.");
    }
    return {
      kind: "component",
      name,
      root: stripInternalRoot(transformedRoot, name),
    };
  }

  if (transformedRoot.type !== "App") {
    throw new Error(
      `Expected <App> or <Component> as the document root, got <${transformedRoot.type}>.`,
    );
  }

  return {
    kind: "app",
    root: transformedRoot,
  };
}

function transformElement(node: MarkupSyntaxNode, source: SourceText, sourceId: string): XmluiElement {
  const type = tagName(node, source);
  const props: Record<string, string> = {};
  const vars: Record<string, string> = {};
  const globals: Record<string, string> = {};
  const events: Record<string, string> = {};
  const parsed: XmluiParsedBindings = {};

  for (const attr of attributes(node, source)) {
    if (attr.name.startsWith("var.")) {
      const name = attr.name.slice(4);
      vars[name] = attr.value;
      setParsedValue(parsed, "vars", name, attr, sourceId);
      continue;
    }
    if (attr.name.startsWith("global.")) {
      const name = attr.name.slice(7);
      globals[name] = attr.value;
      setParsedValue(parsed, "globals", name, attr, sourceId);
      continue;
    }
    if (/^on[A-Z]/.test(attr.name)) {
      const eventName = attr.name.slice(2, 3).toLowerCase() + attr.name.slice(3);
      events[eventName] = attr.value;
      setParsedEvent(parsed, eventName, attr, sourceId);
      continue;
    }
    props[attr.name] = attr.value;
    setParsedValue(parsed, "props", attr.name, attr, sourceId);
  }

  const children = contentChildren(node, source, sourceId);
  return {
    kind: "element",
    type,
    props,
    vars,
    globals,
    events,
    children,
    range: rangeOf(node),
    ...(hasParsedBindings(parsed) ? { parsed } : {}),
  };
}

function contentChildren(node: MarkupSyntaxNode, source: SourceText, sourceId: string): XmluiNode[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  const result: XmluiNode[] = [];

  for (const child of children) {
    if (child.kind === MarkupSyntaxKind.Element) {
      result.push(transformElement(child, source, sourceId));
      continue;
    }
    if (child.kind === MarkupSyntaxKind.Text) {
      const rawText = getNodeText(child, source);
      const value = normalizeText(rawText);
      if (!value) {
        continue;
      }
      const range = rangeOf(child);
      result.push({
        kind: "text",
        value,
        range,
        segments: parseMixedTextSegments(value, range, { sourceId }),
      });
    }
  }

  return result;
}

function attributes(node: MarkupSyntaxNode, source: SourceText): AttributeInfo[] {
  const list = node.children?.find((child) => child.kind === MarkupSyntaxKind.AttributeList);
  return (
    list?.children?.flatMap((attribute) => {
      const key = attribute.children?.find((child) => child.kind === MarkupSyntaxKind.AttributeKey);
      const value = attribute.children?.find((child) => child.kind === MarkupSyntaxKind.StringLiteral);
      if (!key || !value) {
        return [];
      }
      const rawValue = value.value ?? stripQuotes(getNodeText(value, source));
      return [
        {
          name: key.children?.map((child) => getNodeText(child, source)).join("") ?? "",
          value: decodeEntities(rawValue),
          nameRange: rangeOf(key),
          valueRange: {
            start: value.pos + 1,
            end: Math.max(value.pos + 1, value.end - 1),
          },
        },
      ];
    }) ?? []
  );
}

function setParsedValue(
  parsed: XmluiParsedBindings,
  bucket: "props" | "vars" | "globals",
  name: string,
  attr: AttributeInfo,
  sourceId: string,
): void {
  const target = (parsed[bucket] ??= {});
  const expression = unwrapExpression(attr.value);
  if (expression !== undefined) {
    const expressionRange = expressionInnerRange(attr.value, attr.valueRange);
    const result = parseScriptExpression(expression, {
      originSpan: {
        sourceId,
        start: expressionRange.start,
        end: expressionRange.end,
      },
    });
    if (result.diagnostics.length > 0) {
      throw diagnosticToError(result.diagnostics[0]);
    }
    target[name] = {
      source: expression,
      ast: result.node,
      range: expressionRange,
    } satisfies ParsedExpression;
    return;
  }

  target[name] = parseExpressionOrMixedText(attr.value, attr.valueRange, { sourceId });
}

function setParsedEvent(
  parsed: XmluiParsedBindings,
  name: string,
  attr: AttributeInfo,
  sourceId: string,
): void {
  const events = (parsed.events ??= {});
  const result = parseScriptEventHandler(attr.value, {
    originSpan: {
      sourceId,
      start: attr.valueRange.start,
      end: attr.valueRange.end,
    },
  });
  if (result.diagnostics.length > 0) {
    throw diagnosticToError(result.diagnostics[0]);
  }
  events[name] = {
    source: attr.value,
    ast: result.node,
    range: attr.valueRange,
  } satisfies ParsedEvent;
}

function rootElement(node: MarkupSyntaxNode): MarkupSyntaxNode | undefined {
  return node.children
    ?.find((child) => child.kind === MarkupSyntaxKind.ContentList)
    ?.children?.find((child) => child.kind === MarkupSyntaxKind.Element);
}

function tagName(node: MarkupSyntaxNode, source: SourceText): string {
  const name = node.children?.find((child) => child.kind === MarkupSyntaxKind.TagName);
  return name?.children?.map((child) => getNodeText(child, source)).join("") ?? "";
}

function stripInternalRoot(component: XmluiElement, name: string): XmluiElement {
  const { props: _props, parsed: _parsed, ...rest } = component;
  return {
    ...rest,
    type: name,
    props: {},
  };
}

function hasParsedBindings(parsed: XmluiParsedBindings): boolean {
  return Boolean(parsed.props || parsed.vars || parsed.globals || parsed.events);
}

function rangeOf(node: MarkupSyntaxNode): SourceRange {
  return {
    start: node.pos,
    end: node.end,
  };
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, `"`)
    .replace(/&apos;/g, `'`)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith(`"`) && value.endsWith(`"`)) ||
    (value.startsWith(`'`) && value.endsWith(`'`))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function unwrapExpression(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed.slice(1, -1).trim();
  }
  return undefined;
}

function expressionInnerRange(value: string, range: SourceRange): SourceRange {
  const open = value.indexOf("{");
  const close = value.lastIndexOf("}");
  const inner = value.slice(open + 1, close);
  const leading = inner.length - inner.trimStart().length;
  const trimmed = inner.trim();
  return {
    start: range.start + open + 1 + leading,
    end: range.start + open + 1 + leading + trimmed.length,
  };
}

function diagnosticToError(diagnostic: ParserDiagnostic): Error {
  return new Error(diagnostic.message);
}
