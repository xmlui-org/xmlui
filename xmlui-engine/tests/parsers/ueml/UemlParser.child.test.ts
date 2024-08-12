import { describe, expect, it } from "vitest";
import { UemlElement, UemlNode } from "@parsers/ueml/source-tree";
import { UemlParser } from "@parsers/ueml/UemlParser";

describe("Ueml parser", () => {
  it("Text works #1", () => {
    const nodes = parseSource("<Stack>hello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #2", () => {
    const nodes = parseSource("<Stack>  hello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #3", () => {
    const nodes = parseSource("<Stack>  hello\rbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello bello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #4", () => {
    const nodes = parseSource("<Stack>  hello\nbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello bello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #5", () => {
    const nodes = parseSource("<Stack>  hello\n\r\rbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello bello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #6", () => {
    const nodes = parseSource("<Stack>  hello\r\n\rbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello bello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #7", () => {
    const nodes = parseSource('<Stack>" hello  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #8", () => {
    const nodes = parseSource('<Stack>"\n\r hello  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text works #9", () => {
    const nodes = parseSource('<Stack>"\n\r hello  \r\t"</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with quotes works #1", () => {
    const nodes = parseSource('<Stack>"\n\r hello  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with quotes works #2", () => {
    const nodes = parseSource(`<Stack>"\n\r 
        hello  "</Stack>`);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with quotes works #3", () => {
    const nodes = parseSource('<Stack>" hello    \n\r  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with quotes works #4", () => {
    const nodes = parseSource('<Stack>" hello    \n\r  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with nbsp works #1", () => {
    const nodes = parseSource('<Stack>" hello\\S    \n\r  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello\xa0 ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with nbsp works #2", () => {
    const nodes = parseSource('<Stack>" hello \\S  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello \xa0 ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with nbsp works #3", () => {
    const nodes = parseSource('<Stack>" hello  \\S     \\S  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" hello \xa0 \xa0 ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text and quotes works #1", () => {
    const nodes = parseSource('<Stack> bla  bla " hello    \\n\\r  "</Stack>');
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' bla bla " hello \\n\\r "');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with comment #1", () => {
    const nodes = parseSource("<Stack>hello<!-- comment --></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(2);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![1].type).equal("Comment");
  });

  it("Text with comment #2", () => {
    const nodes = parseSource("<Stack><!-- comment -->hello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(2);
    let textEl = node.childNodes![1] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![0].type).equal("Comment");
  });

  it("Text with comment #3", () => {
    const nodes = parseSource("<Stack>hello<!-- comment -->bello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(3);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![1].type).equal("Comment");
    textEl = node.childNodes![2] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("bello");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with comment #4", () => {
    const nodes = parseSource("<Stack>hello<!-- comment -->bello<!-- other --></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(4);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![1].type).equal("Comment");
    textEl = node.childNodes![2] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("bello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![3].type).equal("Comment");
  });

  it("Child element #4", () => {
    const nodes = parseSource("<Stack><Text />hello<!-- comment --><Button /></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(4);
    let child = node.childNodes![0] as UemlElement;
    expect(child.id).equal("Text");
    let textEl = node.childNodes![1] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![2].type).equal("Comment");
    child = node.childNodes![3] as UemlElement;
    expect(child.id).equal("Button");
  });

  it("Child element #5", () => {
    const nodes = parseSource("<Stack><Text />hello<!-- comment -->   bello <Button /></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(5);
    let child = node.childNodes![0] as UemlElement;
    expect(child.id).equal("Text");
    let textEl = node.childNodes![1] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    expect(node.childNodes![2].type).equal("Comment");
    textEl = node.childNodes![3] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" bello ");
    expect(textEl.childNodes).equal(undefined);
    child = node.childNodes![4] as UemlElement;
    expect(child.id).equal("Button");
  });

  it("Child element #6", () => {
    const nodes = parseSource("<Stack>hello<Button />bello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(3);
    let textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("hello");
    expect(textEl.childNodes).equal(undefined);
    const child = node.childNodes![1] as UemlElement;
    expect(child.id).equal("Button");
    textEl = node.childNodes![2] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("bello");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #1", () => {
    const nodes = parseSource(`
      <Stack><![CDATA[]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(0);
  });

  it("Hard literal works #2", () => {
    const nodes = parseSource(`
      <Stack><![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("   ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #3", () => {
    const nodes = parseSource(`
      <Stack><![CDATA[ Hello ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" Hello ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #4", () => {
    const nodes = parseSource(`
      <Stack><![CDATA[ Hel

lo ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" Hel\n\nlo ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #5", () => {
    const nodes = parseSource(`
      <Stack><![CDATA[ Hel"&'

lo &'"\`]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" Hel\"&'\n\nlo &'\"`");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #6", () => {
    const nodes = parseSource(`
      <Stack><!-- comment --><![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(2);
    const textEl = node.childNodes![1] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("   ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #7", () => {
    const nodes = parseSource(`
      <Stack>abc<![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("abc   ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #8", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc   ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #9", () => {
    const nodes = parseSource(`
      <Stack>  abc   <![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc    ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #10", () => {
    const nodes = parseSource(`
      <Stack>  a   bc   <![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" a bc    ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #11", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]>def</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc   def");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #12", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]> def</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc    def");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #13", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]>    def</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc    def");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #14", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]>def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc   def ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #15", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]>   def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc    def ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #17", () => {
    const nodes = parseSource(`
      <Stack>  abc<![CDATA[   ]]>   d   ef   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" abc    d ef ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #18", () => {
    const nodes = parseSource(`
      <Stack>" ,,."<![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" ,,.   ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #19", () => {
    const nodes = parseSource(`
      <Stack>" ,,.    "<![CDATA[   ]]></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" ,,.    ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #20", () => {
    const nodes = parseSource(`
      <Stack>" ,,.    "<![CDATA[   ]]>"   &&&"</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" ,,.     &&&");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #21", () => {
    const nodes = parseSource(`
      <Stack>" ,,.    "<![CDATA[   ]]>"   &&&   "</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" ,,.     &&& ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #22", () => {
    const nodes = parseSource(`
      <Stack>" ,,.    "<![CDATA[   ]]>"   &&   &   "</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" ,,.     && & ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Hard literal works #23", () => {
    const nodes = parseSource(`
      <Markdown>
        <![CDATA[
# Title]]>
      </Markdown>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNodeCData");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("\n# Title");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #1", () => {
    const nodes = parseSource(`
      <Stack>   "abc"</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("abc");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #2", () => {
    const nodes = parseSource(`
      <Stack>   "abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("abc");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #3", () => {
    const nodes = parseSource(`
      <Stack> 123"abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123"abc" ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #4", () => {
    const nodes = parseSource(`
      <Stack> 123 "abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123 "abc" ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #5", () => {
    const nodes = parseSource(`
      <Stack> 123    "abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123 "abc" ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #6", () => {
    const nodes = parseSource(`
      <Stack> 123    "abc"def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123 "abc"def ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #7", () => {
    const nodes = parseSource(`
      <Stack> 123    "abc" def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123 "abc" def ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #8", () => {
    const nodes = parseSource(`
      <Stack> 123    "abc "def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123 "abc "def ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #9", () => {
    const nodes = parseSource(`
      <Stack> 123   "abc "  def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' 123 "abc " def ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #10", () => {
    const nodes = parseSource(`
      <Stack>" 123""abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal('" 123""abc" ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #11", () => {
    const nodes = parseSource(`
      <Stack> "123 ""abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' "123 ""abc" ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #12", () => {
    const nodes = parseSource(`
      <Stack>" 123  "  "abc"   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal('" 123 " "abc" ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #13", () => {
    const nodes = parseSource(`
      <Stack> "123 "   "abc"def   </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' "123 " "abc"def ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #14", () => {
    const nodes = parseSource(`
      <Stack>" 123    ""abc" "def "  </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal('" 123 ""abc" "def " ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #15", () => {
    const nodes = parseSource(`
      <Stack>" 123"    "abc ""def   "</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal('" 123" "abc ""def "');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #16", () => {
    const nodes = parseSource(`
      <Stack>" 123    ""abc ""  def   "</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal('" 123 ""abc "" def "');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #17", () => {
    const nodes = parseSource(`
      <Stack>
      " 123    "
      "abc "
      "  def   "
      </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(' " 123 " "abc " " def " ');
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text combination works #18", () => {
    const nodes =
      parseSource(`
      <Stack>
      " 123\n\r    "
      "abc "
      "  def   "
      </Stack>
    `);
      expect(nodes.length).equal(1);
      const node = nodes[0] as UemlElement;
      expect(node.childNodes!.length).equal(1);
      const textEl = node.childNodes![0] as UemlElement;
      expect(textEl.id).equal("TextNode");
      expect(textEl.attributes!.length).equal(1);
      expect(textEl.attributes![0].name).equal("value");
      expect(textEl.attributes![0].value).equal(' " 123 " "abc " " def " ');
      expect(textEl.childNodes).equal(undefined);
  });

  it("NBSP works #1", () => {
    const nodes = parseSource(`
      <Stack>
      " 123\n\r\\S    "
      </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal(" 123 \xa0 ");
    expect(textEl.childNodes).equal(undefined);
  });

  const nestedStart = [":", "/", "=", "$", "#", "@", "_", ".", ",", "%", "(", ")", "{", "}", "[", "]", "+", "*", "-"];

  nestedStart.forEach((c) => {
    it(`Nested text works with '${c}'`, () => {
      const nodes = parseSource(`
      <Stack>${c}</Stack>
    `);
      expect(nodes.length).equal(1);
      const node = nodes[0] as UemlElement;
      expect(node.childNodes!.length).equal(1);
      const textEl = node.childNodes![0] as UemlElement;
      expect(textEl.id).equal("TextNode");
      expect(textEl.attributes!.length).equal(1);
      expect(textEl.attributes![0].name).equal("value");
      expect(textEl.attributes![0].value).equal(c);
      expect(textEl.childNodes).equal(undefined);
    });
  });

  it("Text regression #1", () => {
    const nodes = parseSource(`
      <Text>\\S{$item.date}
      </Text>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.childNodes!.length).equal(1);
    const textEl = node.childNodes![0] as UemlElement;
    expect(textEl.id).equal("TextNode");
    expect(textEl.attributes!.length).equal(1);
    expect(textEl.attributes![0].name).equal("value");
    expect(textEl.attributes![0].value).equal("\\S{$item.date} ");
    expect(textEl.childNodes).equal(undefined);
  });

  it("Text with helper tag works #1", () => {
    const nodes = parseSource("<Stack><prop name='myProp'>hello</prop></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let propEl = node.childNodes![0] as UemlElement;
    expect(propEl.id).equal("prop");
    expect(propEl.attributes!.length).equal(1);
    expect(propEl.attributes![0].name).equal("name");
    expect(propEl.attributes![0].value).equal("myProp");
    const nested = propEl.childNodes![0];
    expect(nested.type).equal("Element")
    //expect(textEl.childNodes).equal(undefined);
  });

});

function parseSource(source: string): UemlNode[] {
  const parser = new UemlParser(source);
  return parser.parseComponentElement() as any;
}
