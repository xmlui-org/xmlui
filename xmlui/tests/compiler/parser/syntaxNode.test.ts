import { describe, expect, it } from "vitest";

import {
  createSyntaxNode,
  createTokenNode,
  findTokenAtOffset,
  getNodeText,
  MarkupSyntaxKind,
  SourceText,
  toDebugString,
  tokenizeMarkup,
  type MarkupSyntaxNode,
  type MarkupToken,
} from "../../../src/parser";

describe("markup syntax nodes", () => {
  it("builds nodes with stable range invariants and source text lookup", () => {
    const { source, nodes } = buildButtonTree();

    expect(nodes.document).toMatchObject({
      kind: MarkupSyntaxKind.Document,
      sourceId: "Main.xmlui",
      start: 0,
      pos: 0,
      end: source.length,
    });
    expect(nodes.attribute).toMatchObject({
      kind: MarkupSyntaxKind.Attribute,
      start: 8,
      pos: 8,
      end: 17,
    });
    expect(getNodeText(nodes.attributeValue, source)).toBe('"1"');
    expect(getNodeText(nodes.text, source)).toBe("Hi");
  });

  it("renders a compact debug tree", () => {
    const { source, nodes } = buildButtonTree();

    expect(toDebugString(nodes.element, source)).toBe([
      "Element @0..29",
      '  OpenNodeStart @0..1 "<"',
      "  TagName @1..7",
      '    Identifier @1..7 "Button"',
      "  AttributeList @8..17",
      "    Attribute @8..17",
      "      AttributeKey @8..13",
      '        Identifier @8..13 "count"',
      '      Equal @13..14 "="',
      '      StringLiteral @14..17 ""1""',
      '  NodeEnd @17..18 ">"',
      "  ContentList @18..20",
      '    Text @18..20 "Hi"',
      '  CloseNodeStart @20..22 "</"',
      "  TagName @22..28",
      '    Identifier @22..28 "Button"',
      '  NodeEnd @28..29 ">"',
    ].join("\n"));
  });

  it("finds tokens inside and between syntax nodes", () => {
    const { nodes } = buildButtonTree();

    const insideTagName = findTokenAtOffset(nodes.document, 3);
    expect(insideTagName?.chainBeforePos).toBeUndefined();
    expect(insideTagName?.chainAtPos.map((node) => node.kind)).toEqual([
      MarkupSyntaxKind.Document,
      MarkupSyntaxKind.Element,
      MarkupSyntaxKind.TagName,
      MarkupSyntaxKind.Identifier,
    ]);
    expect(insideTagName?.chainAtPos.at(-1)?.text).toBe("Button");

    const insideAttributeValue = findTokenAtOffset(nodes.document, 15);
    expect(insideAttributeValue?.chainAtPos.map((node) => node.kind)).toEqual([
      MarkupSyntaxKind.Document,
      MarkupSyntaxKind.Element,
      MarkupSyntaxKind.AttributeList,
      MarkupSyntaxKind.Attribute,
      MarkupSyntaxKind.StringLiteral,
    ]);

    const betweenOpenAndTagName = findTokenAtOffset(nodes.document, 1);
    expect(betweenOpenAndTagName?.chainBeforePos?.at(-1)?.kind).toBe(
      MarkupSyntaxKind.OpenNodeStart,
    );
    expect(betweenOpenAndTagName?.chainAtPos.at(-1)?.text).toBe("Button");
    expect(betweenOpenAndTagName?.sharedParents).toBe(2);

    const insideText = findTokenAtOffset(nodes.document, 19);
    expect(insideText?.chainAtPos.at(-1)?.kind).toBe(MarkupSyntaxKind.Text);
  });

  it("returns undefined for offsets outside the tree", () => {
    const { nodes } = buildButtonTree();

    expect(findTokenAtOffset(nodes.document, -1)).toBeUndefined();
    expect(findTokenAtOffset(nodes.document, 40)).toBeUndefined();
  });
});

function buildButtonTree() {
  const source = new SourceText('<Button count="1">Hi</Button>', "Main.xmlui");
  const tokenList = tokenizeMarkup(source).tokens;
  const token = tokenLookup(tokenList);

  const open = createTokenNode(token("<", 0));
  const tagName = createSyntaxNode(MarkupSyntaxKind.TagName, [
    createTokenNode(token("Button", 0)),
  ]);
  const attributeKey = createSyntaxNode(MarkupSyntaxKind.AttributeKey, [
    createTokenNode(token("count")),
  ]);
  const equal = createTokenNode(token("="));
  const attributeValue = createTokenNode(token('"1"'));
  const attribute = createSyntaxNode(MarkupSyntaxKind.Attribute, [
    attributeKey,
    equal,
    attributeValue,
  ]);
  const attributeList = createSyntaxNode(MarkupSyntaxKind.AttributeList, [attribute]);
  const openEnd = createTokenNode(token(">", 0));
  const text = createTokenNode(token("Hi"));
  const content = createSyntaxNode(MarkupSyntaxKind.ContentList, [text]);
  const close = createTokenNode(token("</"));
  const closeTagName = createSyntaxNode(MarkupSyntaxKind.TagName, [
    createTokenNode(token("Button", 1)),
  ]);
  const closeEnd = createTokenNode(token(">", 1));
  const element = createSyntaxNode(MarkupSyntaxKind.Element, [
    open,
    tagName,
    attributeList,
    openEnd,
    content,
    close,
    closeTagName,
    closeEnd,
  ]);
  const eof = createTokenNode(token(""));
  const document = createSyntaxNode(MarkupSyntaxKind.Document, [element, eof], source.span(0, source.length));

  return {
    source,
    nodes: {
      attribute,
      attributeValue,
      document,
      element,
      text,
    },
  };
}

function tokenLookup(tokens: MarkupToken[]) {
  return (text: string, occurrence = 0) => {
    const matches = tokens.filter((token) => token.text === text);
    const found = matches[occurrence];
    if (!found) {
      throw new Error(`Expected token "${text}" occurrence ${occurrence}.`);
    }
    return found;
  };
}
