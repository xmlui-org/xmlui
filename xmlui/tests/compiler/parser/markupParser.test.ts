import { describe, expect, it } from "vitest";

import {
  findTokenAtOffset,
  getNodeText,
  MarkupSyntaxKind,
  parseMarkup,
  SourceText,
  toDebugString,
  type MarkupSyntaxNode,
  type MarkupSyntaxKind as MarkupSyntaxKindType,
} from "../../../src/parser";

describe("parseMarkup", () => {
  it("parses the local counter example into a concrete syntax tree", () => {
    const result = parseMarkup(
      `<App var.count="{0}">
        <H1>Counter example</H1>
        <Button onClick="count++">Click to increment: {count}</Button>
      </App>`,
      "Main.xmlui",
    );

    expect(result.diagnostics).toEqual([]);
    const content = child(result.node, MarkupSyntaxKind.ContentList);
    const app = child(content, MarkupSyntaxKind.Element);
    expect(tagName(app, result.source)).toBe("App");
    expect(attributeKeys(app, result.source)).toEqual(["var.count"]);
    expect(elementChildren(app).map((node) => tagName(node, result.source))).toEqual(["H1", "Button"]);

    const button = elementChildren(app)[1];
    expect(attributeKeys(button, result.source)).toEqual(["onClick"]);
    expect(textChildren(button, result.source)).toEqual(["Click to increment: {count}"]);
  });

  it("parses component and global-shadowing examples", () => {
    const component = parseMarkup(
      `<Component name="IncrementButton" var.count="{0}">
        <Button onClick="count++">
          {$props.label || 'Click to increment'}: {count}
        </Button>
      </Component>`,
      "IncrementButton.xmlui",
    );
    const globals = parseMarkup(
      `<App global.count="{0}">
        <IncrementButton />
        <Button var.count="{0}" onClick="count++">Local count: {count}</Button>
      </App>`,
      "Main.xmlui",
    );

    expect(component.diagnostics).toEqual([]);
    expect(globals.diagnostics).toEqual([]);
    expect(attributeKeys(rootElement(component.node), component.source)).toEqual([
      "name",
      "var.count",
    ]);
    expect(attributeKeys(rootElement(globals.node), globals.source)).toContain("global.count");
    expect(elementChildren(rootElement(globals.node)).map((node) => tagName(node, globals.source))).toEqual([
      "IncrementButton",
      "Button",
    ]);
  });

  it("parses self-closing elements and preserves trivia on following tokens", () => {
    const result = parseMarkup("<App>\n  <!-- note -->\n  <Button />\n</App>", "Main.xmlui");

    expect(result.diagnostics).toEqual([]);
    const button = elementChildren(rootElement(result.node))[0];
    expect(tagName(button, result.source)).toBe("Button");
    expect(button.children?.some((node) => node.kind === MarkupSyntaxKind.NodeClose)).toBe(true);

    const openButton = button.children?.[0];
    expect(openButton?.triviaBefore?.map((node) => node.kind)).toEqual([
      MarkupSyntaxKind.NewLineTrivia,
      MarkupSyntaxKind.WhitespaceTrivia,
      MarkupSyntaxKind.CommentTrivia,
      MarkupSyntaxKind.NewLineTrivia,
      MarkupSyntaxKind.WhitespaceTrivia,
    ]);
  });

  it("parses namespaced tag and attribute names", () => {
    const result = parseMarkup(
      '<App xmlns:ext="XMLUIExtensions"><ext:CounterBadge ext.value="{1}" /></App>',
      "Main.xmlui",
    );

    expect(result.diagnostics).toEqual([]);
    const app = rootElement(result.node);
    const badge = elementChildren(app)[0];
    expect(attributeKeys(app, result.source)).toEqual(["xmlns:ext"]);
    expect(tagName(badge, result.source)).toBe("ext:CounterBadge");
    expect(attributeKeys(badge, result.source)).toEqual(["ext.value"]);
  });

  it("supports cursor lookup on parsed trees", () => {
    const result = parseMarkup('<App><Button onClick="count++">Hi</Button></App>', "Main.xmlui");
    const lookup = findTokenAtOffset(result.node, 15);

    expect(lookup?.chainAtPos.map((node) => node.kind)).toEqual([
      MarkupSyntaxKind.Document,
      MarkupSyntaxKind.ContentList,
      MarkupSyntaxKind.Element,
      MarkupSyntaxKind.ContentList,
      MarkupSyntaxKind.Element,
      MarkupSyntaxKind.AttributeList,
      MarkupSyntaxKind.Attribute,
      MarkupSyntaxKind.AttributeKey,
      MarkupSyntaxKind.Identifier,
    ]);
    expect(lookup?.chainAtPos.at(-1)?.text).toBe("onClick");
  });

  it("emits a useful debug tree", () => {
    const result = parseMarkup("<App><Button /></App>", "Main.xmlui");

    expect(toDebugString(result.node, result.source)).toContain("Document @0..21");
    expect(toDebugString(result.node, result.source)).toContain('Identifier @6..12 "Button"');
  });

  it("recovers from missing closing tags", () => {
    const result = parseMarkup("<App><Button>Hi</App>", "Main.xmlui");

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XP005",
          message: "Opening and closing tag names should match. Expected '</Button>', got '</App>'.",
        }),
        expect.objectContaining({
          code: "XP004",
          message: "Expected closing tag '</App>'.",
        }),
      ]),
    );
    expect(rootElement(result.node).kind).toBe(MarkupSyntaxKind.Element);
  });

  it("recovers from missing attribute values", () => {
    const result = parseMarkup("<App><Button onClick= /></App>", "Main.xmlui");

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XP011",
          message: "A quoted attribute value expected.",
          span: { sourceId: "Main.xmlui", start: 22, end: 24 },
        }),
      ]),
    );
    expect(tagName(elementChildren(rootElement(result.node))[0], result.source)).toBe("Button");
  });

  it("recovers from missing attribute names and missing equals", () => {
    const missingName = parseMarkup('<App><Button ="x" /></App>', "Main.xmlui");
    const missingEquals = parseMarkup('<App><Button label /></App>', "Main.xmlui");

    expect(missingName.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XP008",
          message: "An attribute name expected.",
        }),
      ]),
    );
    expect(missingEquals.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XP010",
          message: "Expected '=' after attribute name.",
        }),
      ]),
    );
  });
});

function rootElement(node: MarkupSyntaxNode): MarkupSyntaxNode {
  return child(child(node, MarkupSyntaxKind.ContentList), MarkupSyntaxKind.Element);
}

function child(node: MarkupSyntaxNode, kind: MarkupSyntaxKindType): MarkupSyntaxNode {
  const found = node.children?.find((candidate) => candidate.kind === kind);
  if (!found) {
    throw new Error(`Expected ${node.kind} to contain ${kind}.`);
  }
  return found;
}

function tagName(node: MarkupSyntaxNode, source: SourceText) {
  const name = child(node, MarkupSyntaxKind.TagName);
  return name.children?.map((part) => getNodeText(part, source)).join("") ?? "";
}

function attributeKeys(node: MarkupSyntaxNode, source: SourceText) {
  const attributes = child(node, MarkupSyntaxKind.AttributeList).children ?? [];
  return attributes.map((attribute) => {
    const key = child(attribute, MarkupSyntaxKind.AttributeKey);
    return key.children?.map((part) => getNodeText(part, source)).join("") ?? "";
  });
}

function elementChildren(node: MarkupSyntaxNode): MarkupSyntaxNode[] {
  const content = child(node, MarkupSyntaxKind.ContentList);
  return content.children?.filter((candidate) => candidate.kind === MarkupSyntaxKind.Element) ?? [];
}

function textChildren(
  node: MarkupSyntaxNode,
  source: SourceText,
): string[] {
  const content = child(node, MarkupSyntaxKind.ContentList);
  return (
    content.children
      ?.filter((candidate) => candidate.kind === MarkupSyntaxKind.Text)
      .map((text) => getNodeText(text, source).trim()) ?? []
  );
}
