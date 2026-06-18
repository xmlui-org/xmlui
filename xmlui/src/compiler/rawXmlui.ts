import {
  getNodeText,
  MarkupSyntaxKind,
  parseMarkup,
  type MarkupSyntaxNode,
  type ParserDiagnostic,
  type SourceText,
} from "../parser";
import type { SourceRange } from "./ir";
import { XmluiParseError } from "./parseXmlui";

export type RawXmluiDocument = {
  kind: "app" | "component";
  sourceId: string;
  name?: string;
  root: RawXmluiElement;
};

export type RawXmluiNode = RawXmluiElement | RawXmluiText;

export type RawXmluiElement = {
  kind: "element";
  type: string;
  attributes: RawXmluiAttribute[];
  children: RawXmluiNode[];
  range: SourceRange;
};

export type RawXmluiAttribute = {
  name: string;
  value: string;
  nameRange: SourceRange;
  valueRange: SourceRange;
};

export type RawXmluiText = {
  kind: "text";
  value: string;
  range: SourceRange;
};

export type ParseRawXmluiOptions = {
  sourceId?: string;
};

export function parseRawXmlui(
  source: string,
  options: ParseRawXmluiOptions = {},
): RawXmluiDocument {
  const sourceId = options.sourceId ?? "anonymous.xmlui";
  const parsed = parseMarkup(source, sourceId);
  if (parsed.diagnostics.length > 0) {
    throw diagnosticToError(parsed.diagnostics[0]);
  }

  const root = rootElement(parsed.node);
  if (!root) {
    throw new Error("XMLUI document is empty.");
  }

  const rawRoot = transformRawElement(root, parsed.source);
  if (rawRoot.type === "Component") {
    const name = rawRoot.attributes.find((attribute) => attribute.name === "name")?.value;
    if (!name) {
      throw new Error("<Component> requires a name attribute.");
    }
    return {
      kind: "component",
      sourceId,
      name,
      root: rawRoot,
    };
  }

  if (rawRoot.type !== "App") {
    throw new Error(`Expected <App> or <Component> as the document root, got <${rawRoot.type}>.`);
  }

  return {
    kind: "app",
    sourceId,
    root: rawRoot,
  };
}

function transformRawElement(node: MarkupSyntaxNode, source: SourceText): RawXmluiElement {
  return {
    kind: "element",
    type: tagName(node, source),
    attributes: attributes(node, source),
    children: contentChildren(node, source),
    range: rangeOf(node),
  };
}

function contentChildren(node: MarkupSyntaxNode, source: SourceText): RawXmluiNode[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  const result: RawXmluiNode[] = [];

  for (const child of children) {
    if (child.kind === MarkupSyntaxKind.Element) {
      result.push(transformRawElement(child, source));
      continue;
    }
    if (child.kind === MarkupSyntaxKind.Text) {
      const value = normalizeText(getNodeText(child, source));
      if (value) {
        result.push({
          kind: "text",
          value,
          range: rangeOf(child),
        });
      }
    }
  }

  return result;
}

function attributes(node: MarkupSyntaxNode, source: SourceText): RawXmluiAttribute[] {
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

function rootElement(node: MarkupSyntaxNode): MarkupSyntaxNode | undefined {
  return node.children
    ?.find((child) => child.kind === MarkupSyntaxKind.ContentList)
    ?.children?.find((child) => child.kind === MarkupSyntaxKind.Element);
}

function tagName(node: MarkupSyntaxNode, source: SourceText): string {
  const name = node.children?.find((child) => child.kind === MarkupSyntaxKind.TagName);
  return name?.children?.map((child) => getNodeText(child, source)).join("") ?? "";
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

function diagnosticToError(diagnostic: ParserDiagnostic): Error {
  return new XmluiParseError(diagnostic);
}
