import { describe, expect, it } from "vitest";
import { ErrCodesParser } from "../../../src/parsers/xmlui-parser/diagnostics";
import { findTokenAtOffset } from "../../../src/parsers/xmlui-parser/utils";
import { SyntaxKind } from "../../../src/parsers/xmlui-parser/syntax-kind";
import { parseSource } from "./xmlui";

describe("Xmlui parser", () => {
  it("Single node works #1", () => {
    const { node, getText } = parseSource("<Stack />");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");
  });

  it("Single node works #2", () => {
    const { node, getText } = parseSource(`
      <!-- Comment -->
      <Stack />
    `);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");
  });

  it("Single node works #3", () => {
    const { node, getText } = parseSource(`
      <!-- Comment -->
      <Stack />
      <!-- Other comment -->
    `);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");
  });

  it("Single node works #4", () => {
    const { node, getText } = parseSource(`
      <Stack></Stack>
    `);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];

    const nameNodeClosing = rootElem.children[4];
    const nameIdClosing = nameNodeClosing.children[0];
    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(nameNodeClosing.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameIdClosing.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameIdClosing)).equal("Stack");
  });

  it("Attribute works #1", () => {
    const { node, getText } = parseSource("<Stack attr='val' />");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const attrList = rootElem.children[2];
    const attr0 = attrList.children[0];
    const attr0Key = attr0.children[0];
    const attr0Name = attr0Key.children[0];
    const attr0Value = attr0.children[2];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(attr0.kind).toEqual(SyntaxKind.AttributeNode);
    expect(attr0Name.kind).toEqual(SyntaxKind.Identifier);
    expect(attr0Value.kind).toEqual(SyntaxKind.StringLiteral);
    expect(getText(attr0Name)).equal("attr");
    expect(getText(attr0Value)).equal("'val'");
  });

  it("Attribute works #2", () => {
    const { node, getText } = parseSource("<Stack attr=`val`/>");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const attrList = rootElem.children[2];
    const attr0 = attrList.children[0];
    const attr0Key = attr0.children[0];
    const attr0Name = attr0Key.children[0];
    const attr0Value = attr0.children[2];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(attr0.kind).toEqual(SyntaxKind.AttributeNode);
    expect(attr0Name.kind).toEqual(SyntaxKind.Identifier);
    expect(attr0Value.kind).toEqual(SyntaxKind.StringLiteral);
    expect(getText(attr0Name)).equal("attr");
    expect(getText(attr0Value)).equal("`val`");
  });

  it("Attribute works #4", () => {
    const { node, getText } = parseSource("<Stack attr=`val\\r\\n`/>");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const attrList = rootElem.children[2];
    const attr0 = attrList.children[0];
    const attr0Key = attr0.children[0];
    const attr0Name = attr0Key.children[0];
    const attr0Value = attr0.children[2];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(attr0.kind).toEqual(SyntaxKind.AttributeNode);
    expect(attr0Name.kind).toEqual(SyntaxKind.Identifier);
    expect(attr0Value.kind).toEqual(SyntaxKind.StringLiteral);
    expect(getText(attr0Name)).equal("attr");
    expect(getText(attr0Value)).equal("`val\\r\\n`");
  });

  it("Attribute key-only", () => {
    const { node, getText, errors } = parseSource("<Stack attr/>");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const attrList = rootElem.children[2];
    const attr0 = attrList.children[0];
    const attr0Key = attr0.children[0];
    const attr0Name = attr0Key.children[0];

    const close = rootElem.children[3];

    expect(errors.length).toEqual(0);

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(attr0.kind).toEqual(SyntaxKind.AttributeNode);
    expect(attr0Key.kind).toEqual(SyntaxKind.AttributeKeyNode);
    expect(attr0Name.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(attr0Name)).equal("attr");

    expect(close.kind).toEqual(SyntaxKind.NodeClose);
  });

  it("Attribute quoteless", () => {
    const { errors } = parseSource("<Stack attr=val/>");
    expect(errors[0].code).toEqual(ErrCodesParser.expAttrValue);
  });

  it("Attribute with dash works", () => {
    const { node, getText } = parseSource("<Stack my-style-attr='val' />");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const attrList = rootElem.children[2];
    const attr0 = attrList.children[0];
    const attr0Key = attr0.children[0];
    const attr0Name = attr0Key.children[0];
    const attr0Value = attr0.children[2];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(attr0.kind).toEqual(SyntaxKind.AttributeNode);
    expect(attr0Name.kind).toEqual(SyntaxKind.Identifier);
    expect(attr0Value.kind).toEqual(SyntaxKind.StringLiteral);
    expect(getText(attr0Name)).equal("my-style-attr");
    expect(getText(attr0Value)).equal("'val'");
  });

  it("Text works #1", () => {
    const { node, getText } = parseSource("<Stack>hello</Stack>");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(getText(child0)).equal("hello");
  });

  it("Text works #2", () => {
    const { node, getText } = parseSource("<Stack>    hello    </Stack>");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(getText(child0)).equal("    hello    ");
  });
  it("Text works #3", () => {
    const { node, getText } = parseSource("<Stack>  hello\r\n\rbello  </Stack>");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(getText(child0)).equal("  hello\r\n\rbello  ");
  });

  it("Only text as source", () => {
    const { node, errors, getText } = parseSource("ABC");
    expect(errors).toHaveLength(0);

    const textElement = node.children![0];

    expect(textElement.kind).toBe(SyntaxKind.TextNode);
    expect(getText(textElement)).toBe("ABC");
  });
});

describe("Xmlui parser - expected scanner errors", () => {
  it("unexpected char", () => {
    const src = "<A #/>";
    const { node, getText, errors } = parseSource(src);

    expect(errors.length).toEqual(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.invalidChar);
    expect(err.pos).toEqual(3);
    expect(err.end).toEqual(4);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<A #/>");
  });

  it("has invalid char after component name", () => {
    const src = `<Stack ;></Stack>`;
    const { node, getText, errors } = parseSource(src);

    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.invalidChar);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<Stack ;></Stack>");

    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");
  });

  it("unterminated comment", () => {
    const src = "<Stack><!--</Stack>";
    const { node, getText, errors } = parseSource(src);
    const rootElem = node.children![0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(errors.length).toEqual(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.untermComment);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<Stack><!--</Stack>");

    expect(childElements.children!.length).toEqual(1);
    expect(child0.kind).toEqual(SyntaxKind.ErrorNode);
  });

  it("unterminated string", () => {
    const src = "<Stack> ' </Stack>";
    const { node, getText, errors } = parseSource(src);
    const rootElem = node.children![0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(childElements.children!.length).toEqual(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.untermStr);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<Stack> ' </Stack>");
  });

  it("unterminated CData", () => {
    const src = "<Stack> <![CDATA[hi there </Stack>";
    const { node, getText, errors } = parseSource(src);
    const rootElem = node.children![0];
    const childElements = rootElem.children[3];

    expect(childElements.children!.length).toEqual(2);
    expect(childElements.children![0].kind).toEqual(SyntaxKind.ErrorNode);
    expect(childElements.children![1].kind).toEqual(SyntaxKind.TextNode);

    expect(errors.length).toEqual(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.untermCData);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual(
      "<Stack> <![CDATA[hi there </Stack>",
    );
  });

  it("bare unterminated CData", () => {
    const src = "<![CDATA[hi there";
    const { node, getText, errors } = parseSource(src);

    //The end of file token is the '+1'
    expect(node.children!.length).toEqual(2 + 1);
    expect(node.children![0].kind).toEqual(SyntaxKind.ErrorNode);
    expect(node.children![1].kind).toEqual(SyntaxKind.TextNode);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.untermCData);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<![CDATA[hi there");
  });

  it("unterminated script", () => {
    const src = "<Stack> <script>hi there </Stack>";
    const { node, getText, errors } = parseSource(src);
    const rootElem = node.children![0];
    const childElements = rootElem.children[3];

    expect(childElements.children!.length).toEqual(2);
    expect(childElements.children![0].kind).toEqual(SyntaxKind.ErrorNode);
    expect(childElements.children![1].kind).toEqual(SyntaxKind.TextNode);

    expect(errors.length).toEqual(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.untermScript);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual(
      "<Stack> <script>hi there </Stack>",
    );
  });

  it("multi-line scanner error - first line", () => {
    const src = `<Stack ;>
    <Button>Hello</Button>
</Stack>`;
    const { errors } = parseSource(src);
    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.invalidChar);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<Stack ;>");
  });

  it("multi-line scanner error - middle line", () => {
    const src = `<Stack>
    <Button ;>Hello</Button>
</Stack>`;
    const { errors } = parseSource(src);
    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.invalidChar);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("    <Button ;>Hello</Button>");
  });

  it("multi-line scanner error - CRLF line endings", () => {
    const src = "<Stack>\r\n<Button ;>Hello</Button>\r\n</Stack>";
    const { errors } = parseSource(src);
    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.invalidChar);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<Button ;>Hello</Button>");
  });
});

describe("Xmlui parser - expected parser errors", () => {
  it("only close node start", () => {
    const src = "</";
    const { node, getText, errors } = parseSource(src);

    expect(errors.length).toEqual(1);
    const err = errors[0];
    expect(err.code).toEqual(ErrCodesParser.unexpectedCloseTag);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("</");
  });

  it("Uppercase attribute results in error", () => {
    const { errors } = parseSource("<Stack A='1' />");
    expect(errors[0].code).toBe(ErrCodesParser.uppercaseAttr);
  });

  it("Text after root element", () => {
    const { errors, node } = parseSource("<A></A>ABC");

    expect(node.children![0].kind).toEqual(SyntaxKind.ElementNode);
    expect(node.children![1].kind).toEqual(SyntaxKind.TextNode);
    expect(errors).toHaveLength(0);
  });

  it("no name for tag", () => {
    const src = "<>";
    const { errors } = parseSource(src);
    const err = errors[0];
    expect(err.code).toBe(ErrCodesParser.expTagName);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual("<>");
  });

  it("no closing with known name", () => {
    const { errors } = parseSource("<Text >");
    expect(errors[0].code).toBe(ErrCodesParser.expCloseStartWithName);
  });

  it("Unmatched tag names", () => {
    const { errors } = parseSource("<Stack></NotStack>");
    expect(errors[0].code).toBe(ErrCodesParser.tagNameMismatch);
  });

  it("namespace without name has dedicated error, name matching turned off", () => {
    const { errors } = parseSource("<name:></A>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.expTagNameAfterNamespace);
  });

  it("bad tokens in tag name and attrs result in only the 1st error", () => {
    const { errors } = parseSource("<: name= ></A>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.expTagName);
  });

  it("bad tokens in tag name and attrs result in only the 1st error", () => {
    const { errors } = parseSource("<: name= >");
    expect(errors).toHaveLength(2);
    expect(errors[0].code).toBe(ErrCodesParser.expTagName);
    expect(errors[1].code).toBe(ErrCodesParser.expCloseStart);
  });

  it("bad token in attrList result in 1 error", () => {
    const { errors } = parseSource("<A '' = ''  ></A>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.expAttrName);
  });

  it("missing /> before </ results in 1 error", () => {
    const { errors, node } = parseSource("<A> <B </A>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.expEndOrClose);
    const tagA = node.children[0];
    const tagAList = tagA.children[3];
    const tagB = tagAList.children[0];
    const tagACloseStart = tagA.children[4];

    expect(tagA.kind).toEqual(SyntaxKind.ElementNode);
    expect(tagAList.kind).toEqual(SyntaxKind.ContentListNode);
    expect(tagB.kind).toEqual(SyntaxKind.ElementNode);
    expect(tagB.children).toHaveLength(2);
    expect(tagACloseStart.kind).toEqual(SyntaxKind.CloseNodeStart);
  });

  it("missing /> before < results in 1 error", () => {
    const { errors } = parseSource(
      `<A>
  <B
  <C></C>
  <D />
</A>`,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.expEndOrClose);
  });

  it("duplicate attributes", () => {
    const { errors } = parseSource("<A enabled enabled/>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.duplAttr);
  });

  it("duplicate attributes with namespace", () => {
    const { errors } = parseSource("<A ns:enabled ns:enabled/>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.duplAttr);
  });

  it("namespace without attribute name", () => {
    const { errors } = parseSource("<A ns:='hi' enabled/>");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrCodesParser.expAttrNameAfterNamespace);
  });

  it("multi-line unexpected close tag", () => {
    const src = `<Stack>
    <Button>Hello</Button>
</Stack>
</UnexpectedTag>`;
    const { errors } = parseSource(src);
    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toBe(ErrCodesParser.unexpectedCloseTag);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual(`</Stack>
</UnexpectedTag>`);
  });

  it("multi-line tag name mismatch", () => {
    const src = `
<Stack>
    <Button>Hello</Button>
</NotStack>
`;
    const { errors } = parseSource(src);
    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toBe(ErrCodesParser.tagNameMismatch);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual(`    <Button>Hello</Button>
</NotStack>
`);
  });

  it("multi-line context CRLF", () => {
    const src = `\r\n<Stack>\r\n<Button>Hello</NOTBUTTON>\r\n</Stack>
  `;
    const { errors } = parseSource(src);
    expect(errors).toHaveLength(1);
    const err = errors[0];
    expect(err.code).toBe(ErrCodesParser.tagNameMismatch);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual(
      `<Stack>\r\n<Button>Hello</NOTBUTTON>\r\n</Stack>`,
    );
  });

  it("multi-line expected tag name", () => {
    const src = `<Stack>
<>
</Stack>`;
    const { errors } = parseSource(src);
    const err = errors[0];
    expect(err.code).toBe(ErrCodesParser.expTagName);
    expect(src.substring(err.contextPos, err.contextEnd)).toEqual(`<Stack>
<>
</Stack>`);
  });
});

describe("Xmlui parser - child nodes", () => {
  it("string child works #1", () => {
    const { node, getText } = parseSource(`<Stack>" hello "</Stack>`);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.StringLiteral);
    expect(getText(child0)).equal('" hello "');
  });

  it("string child works #1", () => {
    const { node, getText } = parseSource(`<Stack> bla " hello "</Stack>`);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(getText(child0)).equal(' bla " hello "');
  });

  it("comment separated text", () => {
    const { node, getText } = parseSource(`<Stack>hello<!-- comment -->bello</Stack>`);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];
    const child1 = childElements.children[1];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(child1.kind).toEqual(SyntaxKind.TextNode);
    expect(getText(child0)).equal("hello");
    expect(getText(child1)).equal("bello");
  });

  it("tag separated text", () => {
    const { node, getText } = parseSource(`<Stack>hello<Button/>bello</Stack>`);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];
    const child1 = childElements.children[1];
    const child2 = childElements.children[2];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(child1.kind).toEqual(SyntaxKind.ElementNode);
    expect(child2.kind).toEqual(SyntaxKind.TextNode);
    expect(getText(child0)).equal("hello");
    expect(getText(child2)).equal("bello");
  });

  it("text and cdata", () => {
    const { node, getText } = parseSource(`<Stack>abc<![CDATA[   ]]></Stack>`);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];
    const child1 = childElements.children[1];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");

    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
    expect(child0.kind).toEqual(SyntaxKind.TextNode);
    expect(child1.kind).toEqual(SyntaxKind.CData);
    expect(getText(child0)).equal("abc");
    expect(getText(child1)).equal("<![CDATA[   ]]>");
  });

  it("helper tags", () => {
    const { node, getText } = parseSource(
      "<Stack><property name='myProp'>hello</property></Stack>",
    );
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameId = nameNode.children[0];
    const childElements = rootElem.children[3];
    const child0 = childElements.children[0];

    const child0NameNode = child0.children[1];
    const child0NameId = child0NameNode.children[0];
    const child0childElements = child0.children[4];
    const helloText = child0childElements.children[0];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameId)).equal("Stack");
    expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);

    expect(child0.kind).toEqual(SyntaxKind.ElementNode);
    expect(child0NameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(child0NameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(child0NameId)).equal("property");
    expect(getText(helloText)).equal("hello");
  });

  const validContentChar = [
    ":",
    "/",
    "=",
    "$",
    "#",
    "@",
    "_",
    ".",
    ",",
    "%",
    "(",
    ")",
    "{",
    "}",
    "[",
    "]",
    "+",
    "*",
    "-",
  ];

  validContentChar.forEach((c) => {
    it(`Content text works with '${c}'`, () => {
      const { node, getText } = parseSource(`<Stack>${c}</Stack>`);
      const rootElem = node.children![0];
      const nameNode = rootElem.children[1];
      const nameId = nameNode.children[0];
      const childElements = rootElem.children[3];
      const child0 = childElements.children[0];

      expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
      expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
      expect(nameId.kind).toEqual(SyntaxKind.Identifier);
      expect(getText(nameId)).equal("Stack");

      expect(childElements.kind).toEqual(SyntaxKind.ContentListNode);
      expect(child0.kind).toEqual(SyntaxKind.TextNode);
      expect(getText(child0)).equal(c);
    });
  });
});

describe("namescpaces", () => {
  it("Single node with namespace works #1", () => {
    const { node, getText } = parseSource("<ns:Stack />");
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameNs = nameNode.children[0];
    const colon = nameNode.children[1];
    const nameId = nameNode.children[2];
    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameNs.kind).toEqual(SyntaxKind.Identifier);
    expect(colon.kind).toEqual(SyntaxKind.Colon);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameNs)).equal("ns");
    expect(getText(nameId)).equal("Stack");
  });

  it("Single node with namespace works #3", () => {
    const { node, getText } = parseSource(`
      <!-- Comment -->
      <ns:Stack />
      <!-- Other comment -->
    `);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameNs = nameNode.children[0];
    const colon = nameNode.children[1];
    const nameId = nameNode.children[2];
    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameNs.kind).toEqual(SyntaxKind.Identifier);
    expect(colon.kind).toEqual(SyntaxKind.Colon);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameNs)).equal("ns");
    expect(getText(nameId)).equal("Stack");
  });

  it("Single node with namespace works #4", () => {
    const { node, getText } = parseSource(`
      <ns:Stack></ns:Stack>
    `);
    const rootElem = node.children![0];
    const nameNode = rootElem.children[1];
    const nameNs = nameNode.children[0];
    const colon = nameNode.children[1];
    const nameId = nameNode.children[2];

    const nameNodeClosing = rootElem.children[4];
    const nameNsClosing = nameNodeClosing.children[0];
    const colonClosing = nameNodeClosing.children[1];
    const nameIdClosing = nameNodeClosing.children[2];

    expect(rootElem.kind).toEqual(SyntaxKind.ElementNode);
    expect(nameNode.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameNs.kind).toEqual(SyntaxKind.Identifier);
    expect(colon.kind).toEqual(SyntaxKind.Colon);
    expect(nameId.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameNs)).equal("ns");
    expect(getText(nameId)).equal("Stack");

    expect(nameNodeClosing.kind).toEqual(SyntaxKind.TagNameNode);
    expect(nameNsClosing.kind).toEqual(SyntaxKind.Identifier);
    expect(colonClosing.kind).toEqual(SyntaxKind.Colon);
    expect(nameIdClosing.kind).toEqual(SyntaxKind.Identifier);
    expect(getText(nameNsClosing)).equal("ns");
    expect(getText(nameIdClosing)).equal("Stack");
  });

  it("Single node with namespace fails #1", () => {
    const { errors } = parseSource("<ns:Stack></Stack>");
    expect(errors[0].code).toBe(ErrCodesParser.tagNameMismatch);
  });
  it("Single node with namespace fails #2", () => {
    const { errors } = parseSource("<Stack></ns:Stack>");
    expect(errors[0].code).toBe(ErrCodesParser.tagNameMismatch);
  });

  it("Single node with namespace fails #3", () => {
    const { errors } = parseSource("<other:Stack></ns:Stack>");
    expect(errors[0].code).toBe(ErrCodesParser.tagNameMismatch);
  });

  it("has namespace on attribute", () => {
    const { node, getText, errors } = parseSource(`
      <Stack ns1:item1="value1"/>
    `);
    const rootElem = node.children![0];
    const attrList = rootElem.children![2];
    const attr1 = attrList.children![0];
    const attr1Key = attr1.children![0];
    const attr1Ns = attr1Key.children![0];
    const attr1Colon = attr1Key.children![1];
    const attr1Name = attr1Key.children![2];
    const attrEq = attr1.children![1];
    const attrValue = attr1.children![2];

    expect(errors).toHaveLength(0);
    expect(attr1Key.kind).toEqual(SyntaxKind.AttributeKeyNode);
    expect(attr1Ns.kind).toEqual(SyntaxKind.Identifier);
    expect(attr1Colon.kind).toEqual(SyntaxKind.Colon);
    expect(attr1Name.kind).toEqual(SyntaxKind.Identifier);

    expect(attrEq.kind).toEqual(SyntaxKind.Equal);
    expect(attrValue.kind).toEqual(SyntaxKind.StringLiteral);

    expect(getText(attr1Ns)).toEqual("ns1");
    expect(getText(attr1Name)).toEqual("item1");
  });
});

const selfCloseTag = '<A b="c"/> ';
describe("find token at pos", () => {
  it("before first token", () => {
    const { node } = parseSource(selfCloseTag);
    const { chainAtPos, chainBeforePos } = findTokenAtOffset(node, 0)!;
    expect(chainBeforePos).toBeUndefined();
    expect(chainAtPos?.[chainAtPos.length - 1].kind).toBe(SyntaxKind.OpenNodeStart);
  });

  it("after last token", () => {
    const { node } = parseSource(selfCloseTag);
    const { chainAtPos, chainBeforePos } = findTokenAtOffset(node, selfCloseTag.length)!;
    expect(chainBeforePos?.[chainBeforePos.length - 1].kind).toBe(SyntaxKind.NodeClose);
    expect(chainAtPos?.[chainAtPos.length - 1].kind).toBe(SyntaxKind.EndOfFileToken);
  });

  it("inside token", () => {
    const { node } = parseSource(selfCloseTag);
    const { chainAtPos, chainBeforePos } = findTokenAtOffset(node, 7)!;
    expect(chainBeforePos).toBeUndefined();
    expect(chainAtPos?.[chainAtPos.length - 1].kind).toBe(SyntaxKind.StringLiteral);
  });

  it("between 2 tokens", () => {
    const { node } = parseSource(selfCloseTag);
    const { chainAtPos, chainBeforePos } = findTokenAtOffset(node, 4)!;
    expect(chainBeforePos?.[chainBeforePos.length - 1].kind).toBe(SyntaxKind.Identifier);
    expect(chainAtPos?.[chainAtPos.length - 1].kind).toBe(SyntaxKind.Equal);
  });

  it("between 2 tokens, at trivia", () => {
    const { node } = parseSource(selfCloseTag);
    const { chainAtPos, chainBeforePos } = findTokenAtOffset(node, 3)!;
    expect(chainBeforePos?.[chainBeforePos.length - 1].kind).toBe(SyntaxKind.Identifier);
    expect(chainAtPos?.[chainAtPos.length - 1].kind).toBe(SyntaxKind.Identifier);
  });

  it("between token and Eof, at trivia", () => {
    const { node } = parseSource(selfCloseTag);
    const { chainAtPos, chainBeforePos } = findTokenAtOffset(node, 10)!;
    expect(chainBeforePos?.[chainBeforePos.length - 1].kind).toBe(SyntaxKind.NodeClose);
    expect(chainAtPos?.[chainAtPos.length - 1].kind).toBe(SyntaxKind.EndOfFileToken);
  });
});
