import { describe, expect, it, assert } from "vitest";
import { UemlElement, UemlNode } from "@parsers/ueml/source-tree";
import { UemlParser } from "@parsers/ueml/UemlParser";

describe("Ueml parser", () => {
  it("Empty code results in error", () => {
    try {
      parseSource("");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Comment-only code results in error #1", () => {
    try {
      parseSource("<!-- Comment -->");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Comment-only code results in error #2", () => {
    try {
      parseSource(`
        <!-- Comment -->
        <!-- Other comment -->
      `);
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Single node works #1", () => {
    const nodes = parseSource("<Stack />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
  });

  it("Single node works #2", () => {
    const nodes = parseSource(`
      <!-- Comment -->
      <Stack />
    `);
    expect(nodes.length).equal(2);
    expect(nodes[0].type).equal("Comment");
    const node = nodes[1] as UemlElement;
    expect(node.id).equal("Stack");
  });

  it("Single node works #3", () => {
    const nodes = parseSource(`
      <!-- Comment -->
      <Stack />
      <!-- Other comment -->
    `);
    expect(nodes.length).equal(3);
    expect(nodes[0].type).equal("Comment");
    const node = nodes[1] as UemlElement;
    expect(node.id).equal("Stack");
    expect(nodes[2].type).equal("Comment");
  });

  it("Single node works #4", () => {
    const nodes = parseSource(`
      <Stack></Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
  });

  it("Single node with namespace works #1", () => {
    const nodes = parseSource("<ns:Stack />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.namespace).equal("ns");
    expect(node.id).equal("Stack");
  });

  it("Single node with namespace works #2", () => {
    const nodes = parseSource(`
      <!-- Comment -->
      <ns:Stack />
    `);
    expect(nodes.length).equal(2);
    expect(nodes[0].type).equal("Comment");
    const node = nodes[1] as UemlElement;
    expect(node.namespace).equal("ns");
    expect(node.id).equal("Stack");
  });

  it("Single node with namespace works #3", () => {
    const nodes = parseSource(`
      <!-- Comment -->
      <ns:Stack />
      <!-- Other comment -->
    `);
    expect(nodes.length).equal(3);
    expect(nodes[0].type).equal("Comment");
    const node = nodes[1] as UemlElement;
    expect(node.namespace).equal("ns");
    expect(node.id).equal("Stack");
    expect(nodes[2].type).equal("Comment");
  });

  it("Single node with namespace works #4", () => {
    const nodes = parseSource(`
      <ns:Stack></ns:Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.namespace).equal("ns");
    expect(node.id).equal("Stack");
  });

  it("Single node with namespace fails #1", () => {
    try {
      parseSource("<ns:Stack></Stack>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("namespace")).equal(true);
    }
  });

  it("Single node with namespace fails #2", () => {
    try {
      parseSource("<Stack></ns:Stack>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("namespace")).equal(true);
    }
  });

  it("Single node with namespace fails #2", () => {
    try {
      parseSource("<other:Stack></ns:Stack>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("namespace")).equal(true);
    }
  });

  it("Multiple node fails #1", () => {
    try {
      parseSource("<Stack /><Other />");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Multiple node fails #2", () => {
    try {
      parseSource(`
      <!-- Comment -->
      <Stack />
      <Other />
`);
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Multiple node fails #3", () => {
    try {
      parseSource(`
      <!-- Comment -->
      <Stack />
      <!-- Comment -->
      <Other />
`);
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Multiple node fails #4", () => {
    try {
      parseSource(`
      <!-- Comment -->
      <Stack />
      <!-- Comment -->
      <Other />
      <!-- Comment -->
`);
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("exactly one")).equal(true);
    }
  });

  it("Attribute works #1", () => {
    const nodes = parseSource("<Stack attr='val' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).equal(undefined);
    expect(node.attributes![0].name).equal("attr");
    expect(node.attributes![0].value).equal("val");
  });

  it("Attribute works #2", () => {
    const nodes = parseSource("<Stack attr='val'/>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).equal(undefined);
    expect(node.attributes![0].name).equal("attr");
    expect(node.attributes![0].value).equal("val");
  });

  it("Attribute works #3", () => {
    const nodes = parseSource(`<Stack attr="val"/>`);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).equal(undefined);
    expect(node.attributes![0].name).equal("attr");
    expect(node.attributes![0].value).equal("val");
  });

  it("Attribute works #4", () => {
    const nodes = parseSource("<Stack attr=`val\\r\\n`/>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).equal(undefined);
    expect(node.attributes![0].name).equal("attr");
    expect(node.attributes![0].value).equal("val\r\n");
  });

  it("Attribute with dash works", () => {
    const nodes = parseSource("<Stack my-style-attr='val' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("my-style-attr");
    expect(node.attributes![0].value).equal("val");
  });


  it("Attribute with &amp; works", () => {
    const nodes = parseSource("<Stack myAttr='abc&amp;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc&def");
  });

  it("Attribute with \\&amp; works", () => {
    const nodes = parseSource("<Stack myAttr='abc\\&amp;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc&amp;def");
  });

  it("Attribute with &gt; works", () => {
    const nodes = parseSource("<Stack myAttr='abc&gt;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc>def");
  });

  it("Attribute with \\&gt; works", () => {
    const nodes = parseSource("<Stack myAttr='abc\\&gt;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc&gt;def");
  });

  it("Attribute with &lt; works", () => {
    const nodes = parseSource("<Stack myAttr='abc&lt;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc<def");
  });

  it("Attribute with \\&lt; works", () => {
    const nodes = parseSource("<Stack myAttr='abc\\&lt;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc&lt;def");
  });

  it("Attribute with &apos; works", () => {
    const nodes = parseSource("<Stack myAttr='abc&apos;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc'def");
  });

  it("Attribute with \\&apos; works", () => {
    const nodes = parseSource("<Stack myAttr='abc\\&apos;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc&apos;def");
  });

  it("Attribute with &quot; works", () => {
    const nodes = parseSource("<Stack myAttr='abc&quot;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal('abc"def');
  });

  it("Attribute with \\&quot; works", () => {
    const nodes = parseSource("<Stack myAttr='abc\\&quot;def' />");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.attributes!.length).equal(1);
    expect(node.attributes![0].namespace).toBeUndefined();
    expect(node.attributes![0].name).equal("myAttr");
    expect(node.attributes![0].value).equal("abc&quot;def");
  });

  it("Empty attribute does not works", () => {
    try {
      parseSource("<Stack attr/>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U010")).equal(true);
    }
  });

  it("Text works #1", () => {
    const nodes = parseSource("<Stack>hello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
  });

  it("Text works #2", () => {
    const nodes = parseSource("<Stack>  hello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" hello ");
  });

  it("Text works #3", () => {
    const nodes = parseSource("<Stack>  hello\rbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" hello bello ");
  });

  it("Text works #4", () => {
    const nodes = parseSource("<Stack>  hello\nbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" hello bello ");
  });

  it("Text works #5", () => {
    const nodes = parseSource("<Stack>  hello\n\r\rbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" hello bello ");
  });

  it("Text works #6", () => {
    const nodes = parseSource("<Stack>  hello\r\n\rbello  </Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" hello bello ");
  });

  it("Text works #7", () => {
    const nodes = parseSource(`
    <Stack>
      This is a text segment before a Button component.
      <Button label="I'm a non-functional Button"/>
      This is a text segment after a Button and before an Icon 
      <Icon name='user' />
    </Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(4);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" This is a text segment before a Button component. ");
    const buttonNode = node.childNodes![1] as UemlElement;
    expect(buttonNode.id).equal("Button");
    textNode = node.childNodes![2] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" This is a text segment after a Button and before an Icon ");
    const iconNode = node.childNodes![3] as UemlElement;
    expect(iconNode.id).equal("Icon");
  });

  it("Text with backslash works #1", () => {
    const nodes = parseSource(`
    <Stack>\\hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("\\hello");
  });

  it("Text with backslash works #2", () => {
    const nodes = parseSource(`
    <Stack>\\&ops</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("&ops");
  });

  it("Text with backslash works #3", () => {
    const nodes = parseSource(`
    <Stack>hey\\hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hey\\hello");
  });

  it("Text with backslash works #4", () => {
    const nodes = parseSource(`
    <Stack>hey\\&ops</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hey&ops");
  });

  it("Text with ampersand works #1", () => {
    const nodes = parseSource(`
    <Stack>&amp;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("&hello");
  });

  it("Text with ampersand works #2", () => {
    const nodes = parseSource(`
    <Stack>&gt;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(">hello");
  });

  it("Text with ampersand works #3", () => {
    const nodes = parseSource(`
    <Stack>&lt;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("<hello");
  });

  it("Text with ampersand works #4", () => {
    const nodes = parseSource(`
    <Stack>&apos;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("'hello");
  });

  it("Text with ampersand works #5", () => {
    const nodes = parseSource(`
    <Stack>&quot;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal('"hello');
  });

  it("Text with ampersand works #6", () => {
    const nodes = parseSource(`
    <Stack>&hey-hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("&hey-hello");
  });

  it("Text with ampersand works #7", () => {
    const nodes = parseSource(`
    <Stack>ok&amp;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("ok&hello");
  });

  it("Text with ampersand works #8", () => {
    const nodes = parseSource(`
    <Stack>ok&gt;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("ok>hello");
  });

  it("Text with ampersand works #9", () => {
    const nodes = parseSource(`
    <Stack>ok&lt;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("ok<hello");
  });

  it("Text with ampersand works #10", () => {
    const nodes = parseSource(`
    <Stack>ok&apos;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("ok'hello");
  });

  it("Text with ampersand works #11", () => {
    const nodes = parseSource(`
    <Stack>ok&quot;hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal('ok"hello');
  });

  it("Text with ampersand works #12", () => {
    const nodes = parseSource(`
    <Stack>ok&hey-hello</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("ok&hey-hello");
  });

  it("String-like text works #1", () => {
    const nodes = parseSource(`
    <Stack>"Hello", she said</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal('"Hello", she said');
  });

  it("String-like text works #1", () => {
    const nodes = parseSource(`
    <Stack>"Hello", she said</Stack>
    `);
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal('"Hello", she said');
  });

  it("Text with comment #1", () => {
    const nodes = parseSource("<Stack>hello<!-- comment --></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(2);
    const textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
    expect(node.childNodes![1].type).equal("Comment");
  });

  it("Text with comment #2", () => {
    const nodes = parseSource("<Stack><!-- comment -->hello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(2);
    const textNode = node.childNodes![1] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
    expect(node.childNodes![0].type).equal("Comment");
  });

  it("Text with comment #3", () => {
    const nodes = parseSource("<Stack>hello<!-- comment -->bello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(3);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
    expect(node.childNodes![1].type).equal("Comment");
    textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
  });

  it("Text with comment #4", () => {
    const nodes = parseSource("<Stack>hello<!-- comment -->bello<!-- other --></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(4);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
    expect(node.childNodes![1].type).equal("Comment");
    textNode = node.childNodes![2] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("bello");
    expect(node.childNodes![3].type).equal("Comment");
  });

  it("Child element #1", () => {
    const nodes = parseSource("<Stack><Button /></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(1);
    let child = node.childNodes![0] as UemlElement;
    expect(child.id).equal("Button");
  });

  it("Child element #2", () => {
    const nodes = parseSource("<Stack><!-- comment --><Button /></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(2);
    expect(node.childNodes![0].type).equal("Comment");
    let child = node.childNodes![1] as UemlElement;
    expect(child.id).equal("Button");
  });

  it("Child element #3", () => {
    const nodes = parseSource("<Stack><Text /><!-- comment --><Button /></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(3);
    let child = node.childNodes![0] as UemlElement;
    expect(child.id).equal("Text");
    expect(node.childNodes![1].type).equal("Comment");
    child = node.childNodes![2] as UemlElement;
    expect(child.id).equal("Button");
  });

  it("Child element #4", () => {
    const nodes = parseSource("<Stack><Text />hello<!-- comment --><Button /></Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(4);
    let child = node.childNodes![0] as UemlElement;
    expect(child.id).equal("Text");
    let textNode = node.childNodes![1] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
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
    let textNode = node.childNodes![1] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
    expect(node.childNodes![2].type).equal("Comment");
    textNode = node.childNodes![3] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal(" bello ");
    child = node.childNodes![4] as UemlElement;
    expect(child.id).equal("Button");
  });

  it("Child element #6", () => {
    const nodes = parseSource("<Stack>hello<Button />bello</Stack>");
    expect(nodes.length).equal(1);
    const node = nodes[0] as UemlElement;
    expect(node.id).equal("Stack");
    expect(node.childNodes!.length).equal(3);
    let textNode = node.childNodes![0] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("hello");
    const child = node.childNodes![1] as UemlElement;
    expect(child.id).equal("Button");
    textNode = node.childNodes![2] as UemlElement;
    expect(textNode.id).equal("TextNode");
    expect(textNode.attributes![0].name).equal("value");
    expect(textNode.attributes![0].value).equal("bello");
  });

  it("Duplicated attribute results in error", () => {
    try {
      parseSource("<Stack a='1' a='2' />");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U012")).equal(true);
    }
  });

  it("Uppercase attribute results in error", () => {
    try {
      parseSource("<Stack A='1' />");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U013")).equal(true);
    }
  });

  it("<> regression #1", () => {
    try {
      parseSource("<>");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U004")).equal(true);
    }
  });

  it("<> regression #2", () => {
    try {
      parseSource("<Text >");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U005")).equal(true);
    }
  });

  it("<> regression #2", () => {
    try {
      parseSource("<Text >");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U005")).equal(true);
    }
  });

  it("ID without quotes regression #1", () => {
    try {
      parseSource("<Stack orientation=horizontal />");
      assert.fail("Exception expected");
    } catch (err: any) {
      expect(err.toString().includes("U011")).equal(true);
    }
  });
});

function parseSource(source: string): UemlNode[] {
  const parser = new UemlParser(source);
  return parser.parseComponentElement() as any;
}
