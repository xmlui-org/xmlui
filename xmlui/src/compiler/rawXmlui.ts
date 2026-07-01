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

  return {
    kind: "app",
    sourceId,
    root: rawRoot,
  };
}

function transformRawElement(
  node: MarkupSyntaxNode,
  source: SourceText,
  inheritedNamespaces: Record<string, string> = {},
): RawXmluiElement {
  const elementAttributes = attributes(node, source);
  const namespaces = collectNamespaces(elementAttributes, inheritedNamespaces);
  return {
    kind: "element",
    type: resolveNamespacedName(tagName(node, source), namespaces),
    attributes: elementAttributes.filter((attribute) =>
      attribute.name !== "xmlns" && !attribute.name.startsWith("xmlns:")
    ),
    children: contentChildren(node, source, namespaces),
    range: rangeOf(node),
  };
}

function contentChildren(
  node: MarkupSyntaxNode,
  source: SourceText,
  namespaces: Record<string, string>,
): RawXmluiNode[] {
  const content = node.children?.find((child) => child.kind === MarkupSyntaxKind.ContentList);
  const children = content?.children ?? [];
  const result: RawXmluiNode[] = [];

  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (child.kind === MarkupSyntaxKind.Element) {
      result.push(transformRawElement(child, source, namespaces));
      continue;
    }
    if (child.kind === MarkupSyntaxKind.Text) {
      const rawText = getNodeText(child, source);
      const value = normalizeText(rawText);
      if (value) {
        const range = rangeOf(child);
        const previous = result.at(-1);
        const next = children[index + 1];
        const sourceGapBefore = previous ? source.text.slice(previous.range.end, range.start) : "";
        const sourceGapAfter = next
          ? source.text.slice(range.end, rangeOf(next).start)
          : source.text.slice(range.end, content?.end ?? range.end);
        const needsLeadingSpace =
          previous?.kind === "element" && (/^\s/.test(rawText) || /^\s+$/.test(sourceGapBefore));
        const needsTrailingSpace = /\s$/.test(rawText) || /^\s+$/.test(sourceGapAfter);
        const spacedValue = `${needsLeadingSpace ? " " : ""}${value}${needsTrailingSpace ? " " : ""}`;
        const spacedRange =
          spacedValue === value
            ? range
            : {
                ...range,
                start: needsLeadingSpace
                  ? Math.max(previous?.range.end ?? range.start, range.start - 1)
                  : range.start,
              };
        result.push({
          kind: "text",
          value: spacedValue,
          range: spacedRange,
        });
      }
    }
  }

  return result;
}

function collectNamespaces(
  attributes: RawXmluiAttribute[],
  inheritedNamespaces: Record<string, string>,
): Record<string, string> {
  const namespaces = { ...inheritedNamespaces };
  for (const attr of attributes) {
    if (attr.name === "xmlns") {
      namespaces[""] = attr.value;
    } else if (attr.name.startsWith("xmlns:")) {
      namespaces[attr.name.slice("xmlns:".length)] = attr.value;
    }
  }
  return namespaces;
}

function resolveNamespacedName(name: string, namespaces: Record<string, string>): string {
  const separator = name.indexOf(":");
  if (separator < 0) {
    return name;
  }
  const prefix = name.slice(0, separator);
  const localName = name.slice(separator + 1);
  const namespace = namespaces[prefix];
  return namespace ? `${namespace}.${localName}` : name;
}

function attributes(node: MarkupSyntaxNode, source: SourceText): RawXmluiAttribute[] {
  const list = node.children?.find((child) => child.kind === MarkupSyntaxKind.AttributeList);
  return (
    list?.children?.flatMap((attribute) => {
      const key = attribute.children?.find((child) => child.kind === MarkupSyntaxKind.AttributeKey);
      const value = attribute.children?.find((child) => child.kind === MarkupSyntaxKind.StringLiteral);
      if (!key) {
        return [];
      }
      const rawValue = value ? value.value ?? stripQuotes(getNodeText(value, source)) : "true";
      return [
        {
          name: key.children?.map((child) => getNodeText(child, source)).join("") ?? "",
          value: decodeEntities(rawValue),
          nameRange: rangeOf(key),
          valueRange: value
            ? {
                start: value.pos + 1,
                end: Math.max(value.pos + 1, value.end - 1),
              }
            : {
                start: key.end,
                end: key.end,
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
